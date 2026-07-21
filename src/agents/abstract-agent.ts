import { z, type ZodType } from 'zod';
import type { Clock } from '../domain/clock';
import { NoOrgError } from '../domain/errors';
import type {
  AgentDescriptor,
  AgentResult,
  AgentTask,
  CompletionRequest,
  JsonValue,
} from '../domain/types';
import { agentResultSchema, jsonValueSchema } from '../domain/types';
import type { LLMProvider } from '../providers/provider';
import type { Logger } from '../logging/logger';
import type { StateStore } from '../state/state-store';

export interface AgentContext {
  readonly provider: LLMProvider;
  readonly state: StateStore;
  readonly logger: Logger;
  readonly clock: Clock;
  readonly configuration: Readonly<Record<string, JsonValue>>;
}

export interface Agent<TInput = JsonValue, TOutput = JsonValue> {
  readonly descriptor: AgentDescriptor;
  readonly inputSchema: ZodType<TInput>;
  readonly resultSchema: ZodType<AgentResult<TOutput>>;
  initialize(context: AgentContext): Promise<void>;
  execute(task: AgentTask<TInput>, signal: AbortSignal): Promise<AgentResult<TOutput>>;
  validateResult(result: AgentResult<TOutput>): AgentResult<TOutput>;
  shutdown(): Promise<void>;
}

export abstract class AbstractAgent<TInput = JsonValue, TOutput = JsonValue> implements Agent<
  TInput,
  TOutput
> {
  protected context!: AgentContext;
  private initialized = false;

  public constructor(
    public readonly descriptor: AgentDescriptor,
    public readonly inputSchema: ZodType<TInput> = z.unknown() as ZodType<TInput>,
    public readonly resultSchema: ZodType<
      AgentResult<TOutput>
    > = agentResultSchema as unknown as ZodType<AgentResult<TOutput>>
  ) {}

  public async initialize(context: AgentContext): Promise<void> {
    if (this.initialized)
      throw new NoOrgError(
        'AGENT_ALREADY_INITIALIZED',
        `${this.descriptor.id} is already initialized`
      );
    this.context = context;
    this.initialized = true;
    try {
      if (this.onInitialize) await this.onInitialize();
    } catch (error) {
      try {
        if (this.onShutdown) await this.onShutdown();
      } catch {
        // Preserve the initialization failure while still resetting the lifecycle state.
      } finally {
        this.initialized = false;
      }
      throw error;
    }
  }

  public async execute(
    task: AgentTask<TInput>,
    signal: AbortSignal
  ): Promise<AgentResult<TOutput>> {
    if (!this.initialized)
      throw new NoOrgError('AGENT_NOT_INITIALIZED', `${this.descriptor.id} is not initialized`);
    if (signal.aborted)
      throw new NoOrgError('AGENT_ABORTED', 'Agent execution was cancelled', true);
    const validatedTask = { ...task, input: this.inputSchema.parse(task.input) };
    return this.validateResult(await this.run(validatedTask, signal));
  }

  public validateResult(result: AgentResult<TOutput>): AgentResult<TOutput> {
    return this.resultSchema.parse(result) as AgentResult<TOutput>;
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    try {
      if (this.onShutdown) await this.onShutdown();
    } finally {
      this.initialized = false;
    }
  }

  protected async ask<T extends JsonValue>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal: AbortSignal,
    taskId?: string
  ): Promise<T> {
    const response = await this.context.provider.complete(
      taskId === undefined ? request : { ...request, taskId },
      schema,
      signal
    );
    return response.data;
  }

  protected onInitialize?: () => Promise<void>;
  protected onShutdown?: () => Promise<void>;
  protected abstract run(
    task: AgentTask<TInput>,
    signal: AbortSignal
  ): Promise<AgentResult<TOutput>>;
}

export const textInputSchema = z.object({ text: z.string().trim().min(1) });
export const textTaskInputSchema = z.union([z.string().trim().min(1), textInputSchema]);

export function resultSchema<T>(dataSchema: ZodType<T>): ZodType<AgentResult<T>> {
  return z.object({
    data: dataSchema,
    summary: z.string().trim().min(1),
    metadata: z.record(jsonValueSchema).optional(),
  }) as ZodType<AgentResult<T>>;
}

export function inputText(input: unknown): string {
  if (typeof input === 'string' && input.trim()) return input.trim();
  const parsed = textInputSchema.safeParse(input);
  if (parsed.success) return parsed.data.text;
  throw new NoOrgError('INVALID_AGENT_INPUT', 'Expected a non-empty text input');
}

export function result<T extends JsonValue>(data: T, summary: string): AgentResult<T> {
  return { data, summary };
}
