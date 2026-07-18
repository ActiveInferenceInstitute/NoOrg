import {
  AbstractAgent,
  inputText,
  result,
  resultSchema,
  textTaskInputSchema,
} from './abstract-agent';
import { descriptor } from './builtin-helpers';
import { decisionSchema, planSchema, reviewSchema } from './builtin-schemas';
import type { AgentResult, AgentTask } from '../domain/types';

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
      signal,
      task.id
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
      signal,
      task.id
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
      signal,
      task.id
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
      signal,
      task.id
    );
    return result(data, 'Decision recommendation generated from the supplied context.');
  }
}
