import {
  AbstractAgent,
  inputText,
  result,
  resultSchema,
  textTaskInputSchema,
} from './abstract-agent';
import { dataAnalysis, descriptor, textAnalysis } from './builtin-helpers';
import { analysisSchema, dataAnalysisSchema } from './builtin-schemas';
import { jsonValueSchema, type AgentResult, type AgentTask } from '../domain/types';

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
      signal,
      task.id
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
      signal,
      task.id
    );
    return result(data, 'Record analysis completed across the full supplied dataset.');
  }
}
