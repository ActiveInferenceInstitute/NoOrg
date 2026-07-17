import { z } from 'zod';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

export type ProviderKind = 'local' | 'openai';
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentDescriptor {
  readonly id: string;
  readonly name: string;
  readonly capabilities: readonly string[];
  readonly maxConcurrentTasks: number;
}

export const agentDescriptorSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  capabilities: z.array(z.string().trim().min(1)).min(1),
  maxConcurrentTasks: z.number().int().min(1),
});

export interface AgentTask<TInput = JsonValue> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly input: TInput;
  readonly requiredCapabilities: readonly string[];
  readonly agentId?: string;
  readonly timeoutMs: number;
  readonly attempt: number;
}

export interface AgentResult<T = JsonValue> {
  readonly data: T;
  readonly summary: string;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export const agentResultSchema = z.object({
  data: jsonValueSchema,
  summary: z.string().trim().min(1),
  metadata: z.record(jsonValueSchema).optional(),
});

export interface TaskRequest {
  readonly name: string;
  readonly description: string;
  readonly input: JsonValue;
  readonly agentId?: string;
  readonly requiredCapabilities?: readonly string[];
  readonly priority?: number;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
}

export interface TaskRecord {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly input: JsonValue;
  readonly agentId?: string;
  readonly requiredCapabilities: readonly string[];
  readonly priority: number;
  readonly timeoutMs: number;
  readonly maxAttempts: number;
  readonly attempt: number;
  readonly status: TaskStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly result?: AgentResult<JsonValue>;
  readonly error?: TaskError;
}

export interface TaskError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly details?: JsonValue;
}

export const taskErrorSchema = z.object({
  code: z.string().trim().min(1),
  message: z.string().trim().min(1),
  retryable: z.boolean(),
  details: jsonValueSchema.optional(),
});

export const taskRecordSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    input: jsonValueSchema,
    agentId: z.string().trim().min(1).optional(),
    requiredCapabilities: z.array(z.string().trim().min(1)),
    priority: z.number().finite(),
    timeoutMs: z.number().int().min(100),
    maxAttempts: z.number().int().min(1),
    attempt: z.number().int().min(0),
    status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    result: agentResultSchema.optional(),
    error: taskErrorSchema.optional(),
  })
  .superRefine((task, context) => {
    if (task.status === 'completed' && (!task.result || !task.completedAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Completed tasks require a result and completedAt',
      });
    }
    if (task.status === 'running' && !task.startedAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Running tasks require startedAt' });
    }
    if ((task.status === 'failed' || task.status === 'cancelled') && !task.completedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Terminal tasks require completedAt',
      });
    }
  });

export interface CompletionRequest<T> {
  readonly operation: string;
  readonly input: JsonValue;
  readonly system?: string;
  readonly model?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly localDerivation: () => T;
}

export interface UsageMetadata {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly costUsd: number;
}

export interface CompletionResponse<T> {
  readonly data: T;
  readonly provider: ProviderKind;
  readonly model: string;
  readonly usage: UsageMetadata;
  readonly requestId?: string;
}

export interface RuntimeState {
  readonly schemaVersion: 1;
  readonly tasks: readonly TaskRecord[];
}

export const runtimeStateSchema = z.object({
  schemaVersion: z.literal(1),
  tasks: z.array(taskRecordSchema),
});
