import type { AgentDescriptor, AgentResult, AgentTask } from '../domain/types';
import {
  AbstractAgent,
  inputText,
  result,
  resultSchema,
  textTaskInputSchema,
} from './abstract-agent';
import { narrative, descriptor } from './builtin-helpers';
import { narrativeSchema } from './builtin-schemas';

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
      signal,
      task.id
    );
    return result(data, `${this.descriptor.name} completed ${operation}.`);
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
