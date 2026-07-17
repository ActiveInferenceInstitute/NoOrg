import { z } from 'zod';
import {
  jsonValueSchema,
  type AgentDescriptor,
  type AgentResult,
  type AgentTask,
} from '../domain/types';
import { NoOrgError } from '../domain/errors';
import {
  AbstractAgent,
  inputText,
  result,
  resultSchema,
  textTaskInputSchema,
} from './abstract-agent';

const narrativeSchema = z.object({
  text: z.string().trim().min(1),
  keyPoints: z.array(z.string()),
});

const reviewSchema = z.object({
  score: z.number().min(0).max(10),
  findings: z.array(z.string()),
  recommendation: z.string().min(1),
});

const planSchema = z.object({
  objective: z.string().min(1),
  steps: z.array(z.string()).min(1),
  risks: z.array(z.string()),
});

const analysisSchema = z.object({
  wordCount: z.number().int().nonnegative(),
  sentenceCount: z.number().int().nonnegative(),
  keyTerms: z.array(z.string()),
  findings: z.array(z.string()),
});

const dataAnalysisSchema = z.object({
  rows: z.number().int().nonnegative(),
  numericColumns: z.record(
    z.object({
      count: z.number().int().nonnegative(),
      minimum: z.number(),
      maximum: z.number(),
      mean: z.number(),
    })
  ),
  findings: z.array(z.string()),
  visualizationSuggestions: z.array(z.string()),
});

const decisionSchema = z.object({
  selectedAction: z.string().min(1),
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

function descriptor(id: string, name: string, capabilities: string[]): AgentDescriptor {
  return { id, name, capabilities, maxConcurrentTasks: 2 };
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) ?? [];
}

function keyTerms(text: string): string[] {
  const counts = new Map<string, number>();
  for (const word of words(text)) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([word]) => word);
}

function textAnalysis(text: string) {
  return {
    wordCount: words(text).length,
    sentenceCount: text
      .split(/[.!?]+/)
      .map(part => part.trim())
      .filter(Boolean).length,
    keyTerms: keyTerms(text),
    findings: [
      `Input contains ${words(text).length} words across ${
        text
          .split(/[.!?]+/)
          .map(part => part.trim())
          .filter(Boolean).length
      } sentences.`,
    ],
  };
}

function narrative(text: string, operation: string) {
  const normalized = text.trim();
  return { text: `${operation}: ${normalized}`, keyPoints: keyTerms(normalized) };
}

function recordsFromInput(input: unknown): Array<Record<string, unknown>> {
  if (
    Array.isArray(input) &&
    input.every(row => typeof row === 'object' && row !== null && !Array.isArray(row))
  )
    return input as Array<Record<string, unknown>>;
  if (typeof input === 'object' && input !== null && 'records' in input) {
    const records = (input as { records?: unknown }).records;
    if (
      Array.isArray(records) &&
      records.every(row => typeof row === 'object' && row !== null && !Array.isArray(row))
    )
      return records as Array<Record<string, unknown>>;
  }
  throw new NoOrgError(
    'INVALID_DATA_INPUT',
    'Expected an array of record objects or an object with records'
  );
}

function dataAnalysis(input: unknown) {
  const records = recordsFromInput(input);
  const numeric = new Map<string, number[]>();
  for (const row of records) {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      const values = numeric.get(key) ?? [];
      values.push(value);
      numeric.set(key, values);
    }
  }
  const numericColumns: Record<
    string,
    { count: number; minimum: number; maximum: number; mean: number }
  > = {};
  for (const [key, values] of numeric) {
    numericColumns[key] = {
      count: values.length,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    };
  }
  const findings = [`Analysed ${records.length} records and ${numeric.size} numeric columns.`];
  return {
    rows: records.length,
    numericColumns,
    findings,
    visualizationSuggestions:
      [...numeric.keys()].length > 0
        ? [
            'Use a distribution plot for numeric columns.',
            'Use a comparison plot for related numeric columns.',
          ]
        : ['Use a categorical frequency table for non-numeric fields.'],
  };
}

abstract class NarrativeAgent extends AbstractAgent {
  protected constructor(agentDescriptor: AgentDescriptor) {
    super(agentDescriptor, textTaskInputSchema, resultSchema(narrativeSchema));
  }

  protected async narrativeTask(
    task: AgentTask,
    operation: string,
    signal: AbortSignal,
    transformation: (text: string) => { text: string; keyPoints: string[] }
  ): Promise<AgentResult> {
    const text = inputText(task.input);
    const data = await this.ask(
      { operation, input: { text }, localDerivation: () => transformation(text) },
      narrativeSchema,
      signal
    );
    return result(data, `${this.descriptor.name} completed ${operation}.`);
  }
}

export class AnalysisAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('analysis', 'Analysis Agent', ['analysis', 'text-analysis']),
      textTaskInputSchema,
      resultSchema(analysisSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const text = inputText(task.input);
    const data = await this.ask(
      { operation: 'analysis', input: { text }, localDerivation: () => textAnalysis(text) },
      analysisSchema,
      signal
    );
    return result(data, 'Text analysis completed from the complete input.');
  }
}

export class DataAnalysisAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('data-analysis', 'Data Analysis Agent', ['data-analysis', 'statistics']),
      jsonValueSchema,
      resultSchema(dataAnalysisSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const data = await this.ask(
      {
        operation: 'data-analysis',
        input: task.input,
        localDerivation: () => dataAnalysis(task.input),
      },
      dataAnalysisSchema,
      signal
    );
    return result(data, 'Record analysis completed across the full supplied dataset.');
  }
}

export class WritingAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('writing', 'Writing Agent', ['writing', 'content']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'writing', signal, text => narrative(text, 'Draft'));
  }
}

export class CreativeWritingAgent extends NarrativeAgent {
  public constructor() {
    super(
      descriptor('creative-writing', 'Creative Writing Agent', ['creative-writing', 'content'])
    );
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'creative-writing', signal, text =>
      narrative(text, 'Creative draft')
    );
  }
}

export class RevisionAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('revision', 'Revision Agent', ['revision', 'editing']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'revision', signal, text =>
      narrative(text.replace(/\s+/g, ' '), 'Revised text')
    );
  }
}

export class ResearchAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('research', 'Research Agent', ['research', 'synthesis']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'research', signal, text =>
      narrative(text, 'Research synthesis')
    );
  }
}

export class DevelopmentAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('development', 'Development Agent', ['development', 'engineering']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'development', signal, text =>
      narrative(text, 'Engineering plan')
    );
  }
}

export class FinanceAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('finance', 'Finance Agent', ['finance', 'forecasting']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'finance', signal, text =>
      narrative(text, 'Financial analysis')
    );
  }
}

export class HRAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('hr', 'HR Agent', ['human-resources', 'policy']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'hr', signal, text =>
      narrative(text, 'People operations guidance')
    );
  }
}

export class LegalAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('legal', 'Legal Agent', ['legal', 'compliance']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'legal', signal, text =>
      narrative(text, 'Legal issue summary')
    );
  }
}

export class MarketingAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('marketing', 'Marketing Agent', ['marketing', 'strategy']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'marketing', signal, text =>
      narrative(text, 'Marketing strategy')
    );
  }
}

export class CustomerSupportAgent extends NarrativeAgent {
  public constructor() {
    super(
      descriptor('customer-support', 'Customer Support Agent', ['customer-support', 'service'])
    );
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'customer-support', signal, text =>
      narrative(text, 'Support response')
    );
  }
}

export class CalmTechnologyAgent extends NarrativeAgent {
  public constructor() {
    super(descriptor('calm-technology', 'Calm Technology Agent', ['calm-technology', 'ux']));
  }
  protected run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    return this.narrativeTask(task, 'calm-technology', signal, text =>
      narrative(text, 'Ambient interaction guidance')
    );
  }
}

export class PlanningAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('planning', 'Planning Agent', ['planning', 'coordination']),
      textTaskInputSchema,
      resultSchema(planSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const objective = inputText(task.input);
    const data = await this.ask(
      {
        operation: 'planning',
        input: { objective },
        localDerivation: () => ({
          objective,
          steps: ['Clarify the objective.', 'Sequence the work.', 'Review measurable outcomes.'],
          risks: ['Requirements may change before execution.'],
        }),
      },
      planSchema,
      signal
    );
    return result(data, 'Plan generated from the supplied objective.');
  }
}

export class ReviewAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('review', 'Review Agent', ['review', 'quality']),
      textTaskInputSchema,
      resultSchema(reviewSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const text = inputText(task.input);
    const data = await this.ask(
      {
        operation: 'review',
        input: { text },
        localDerivation: () => ({
          score: Math.min(10, Math.max(0, 5 + (text.length > 100 ? 2 : 0))),
          findings:
            text.length > 20
              ? ['The supplied content is substantial enough for review.']
              : ['The supplied content is concise and may need more context.'],
          recommendation: 'Use the findings to guide the next revision.',
        }),
      },
      reviewSchema,
      signal
    );
    return result(data, 'Review completed with a bounded score and actionable findings.');
  }
}

export class FinalReviewAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('final-review', 'Final Review Agent', ['final-review', 'quality']),
      textTaskInputSchema,
      resultSchema(reviewSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const text = inputText(task.input);
    const data = await this.ask(
      {
        operation: 'final-review',
        input: { text },
        localDerivation: () => ({
          score: Math.min(10, Math.max(0, 6 + (text.length > 100 ? 2 : 0))),
          findings: ['Final review completed against the supplied content.'],
          recommendation: 'Approve when the findings are addressed.',
        }),
      },
      reviewSchema,
      signal
    );
    return result(data, 'Final review completed with a bounded score and recommendation.');
  }
}

export class ActiveInferencePOMDPAgent extends AbstractAgent {
  public constructor() {
    super(
      descriptor('active-inference', 'Active Inference Agent', ['decision-making', 'planning']),
      textTaskInputSchema,
      resultSchema(decisionSchema)
    );
  }
  protected async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    const context = inputText(task.input);
    const data = await this.ask(
      {
        operation: 'decision-making',
        input: { context },
        localDerivation: () => ({
          selectedAction: 'Gather the highest-value missing information.',
          rationale: `The decision context is: ${context}`,
          confidence: 0.6,
        }),
      },
      decisionSchema,
      signal
    );
    return result(data, 'Decision recommendation generated from the supplied context.');
  }
}

export function createBuiltInAgents(): AbstractAgent[] {
  return [
    new AnalysisAgent(),
    new DataAnalysisAgent(),
    new WritingAgent(),
    new CreativeWritingAgent(),
    new RevisionAgent(),
    new ResearchAgent(),
    new DevelopmentAgent(),
    new FinanceAgent(),
    new HRAgent(),
    new LegalAgent(),
    new MarketingAgent(),
    new CustomerSupportAgent(),
    new CalmTechnologyAgent(),
    new PlanningAgent(),
    new ReviewAgent(),
    new FinalReviewAgent(),
    new ActiveInferencePOMDPAgent(),
  ];
}
