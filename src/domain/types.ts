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
export type PriorityPolicy = 'fixed' | 'inherit_max';
export type ParentCompletionPolicy = 'independent' | 'wait_for_success';

export interface AgentDescriptor {
  readonly id: string;
  readonly name: string;
  readonly capabilities: readonly string[];
  readonly maxConcurrentTasks: number;
  readonly contractVersion?: 1;
}

export const agentDescriptorSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    capabilities: z.array(z.string().trim().min(1)).min(1),
    maxConcurrentTasks: z.number().int().min(1),
    contractVersion: z.literal(1).default(1),
  })
  .strict();

export interface AgentTask<TInput = JsonValue> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly input: TInput;
  readonly requiredCapabilities: readonly string[];
  readonly agentId?: string;
  readonly priority?: number;
  readonly priorityPolicy?: PriorityPolicy;
  readonly timeoutMs: number;
  readonly attempt: number;
  readonly deadlineAt?: string;
  readonly parentTaskId?: string;
  readonly parentCompletionPolicy?: ParentCompletionPolicy;
  readonly dependencyIds?: readonly string[];
  readonly workflowDepth?: number;
}

export interface AgentResult<T = JsonValue> {
  readonly data: T;
  readonly summary: string;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export const agentResultSchema = z
  .object({
    data: jsonValueSchema,
    summary: z.string().trim().min(1),
    metadata: z.record(jsonValueSchema).optional(),
  })
  .strict();

export interface TaskRequest {
  readonly name: string;
  readonly description: string;
  readonly input: JsonValue;
  readonly agentId?: string;
  readonly requiredCapabilities?: readonly string[];
  readonly priority?: number;
  readonly priorityPolicy?: PriorityPolicy;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
  readonly retryBackoffMs?: number;
  readonly deadlineAt?: string;
  readonly idempotencyKey?: string;
  readonly parentTaskId?: string;
  readonly parentCompletionPolicy?: ParentCompletionPolicy;
  readonly dependencyIds?: readonly string[];
}

export const taskRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    input: jsonValueSchema,
    agentId: z.string().trim().min(1).optional(),
    requiredCapabilities: z.array(z.string().trim().min(1)).default([]),
    priority: z.number().finite().default(0),
    priorityPolicy: z.enum(['fixed', 'inherit_max']).default('fixed'),
    timeoutMs: z.number().int().min(100).default(60000),
    maxAttempts: z.number().int().min(1).default(1),
    retryBackoffMs: z.number().int().min(0).max(3_600_000).default(250),
    deadlineAt: z.string().datetime().optional(),
    idempotencyKey: z.string().trim().min(1).max(255).optional(),
    parentTaskId: z.string().uuid().optional(),
    parentCompletionPolicy: z.enum(['independent', 'wait_for_success']).default('independent'),
    dependencyIds: z.array(z.string().uuid()).max(32).default([]),
  })
  .strict()
  .superRefine((request, context) => {
    if (new Set(request.dependencyIds).size !== request.dependencyIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dependencyIds'],
        message: 'Dependency IDs must be unique',
      });
    }
    if (
      request.parentTaskId !== undefined &&
      request.dependencyIds.includes(request.parentTaskId)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentTaskId'],
        message: 'Parent task cannot also be a dependency',
      });
    }
    if (
      request.parentCompletionPolicy === 'wait_for_success' &&
      request.parentTaskId === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentCompletionPolicy'],
        message: 'A parent completion policy requires a parent task',
      });
    }
  });

export interface TaskQuery {
  readonly status?: TaskStatus;
  readonly agentId?: string;
  readonly capability?: string;
  readonly idempotencyKey?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export const taskQuerySchema = z
  .object({
    status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']).optional(),
    agentId: z.string().trim().min(1).optional(),
    capability: z.string().trim().min(1).optional(),
    idempotencyKey: z.string().trim().min(1).max(255).optional(),
    limit: z.number().int().min(1).max(100).default(100),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export interface TaskRecord {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly input: JsonValue;
  readonly agentId?: string;
  readonly requestedAgentId?: string;
  readonly requiredCapabilities: readonly string[];
  readonly priority: number;
  readonly priorityPolicy: PriorityPolicy;
  readonly timeoutMs: number;
  readonly maxAttempts: number;
  readonly attempt: number;
  readonly retryBackoffMs: number;
  readonly nextAttemptAt?: string;
  readonly deadlineAt?: string;
  readonly idempotencyKey?: string;
  readonly parentTaskId?: string;
  readonly parentCompletionPolicy: ParentCompletionPolicy;
  readonly dependencyIds: readonly string[];
  readonly workflowDepth: number;
  readonly status: TaskStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly result?: AgentResult<JsonValue>;
  readonly error?: TaskError;
  readonly usage?: UsageMetadata;
}

export const usageMetadataSchema = z
  .object({
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    costUsd: z.number().finite().nonnegative(),
  })
  .strict();

export interface TaskError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly details?: JsonValue;
}

export const taskErrorSchema = z
  .object({
    code: z.string().trim().min(1),
    message: z.string().trim().min(1),
    retryable: z.boolean(),
    details: jsonValueSchema.optional(),
  })
  .strict();

export const taskRecordSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    input: jsonValueSchema,
    agentId: z.string().trim().min(1).optional(),
    requestedAgentId: z.string().trim().min(1).optional(),
    requiredCapabilities: z.array(z.string().trim().min(1)),
    priority: z.number().finite(),
    priorityPolicy: z.enum(['fixed', 'inherit_max']).default('fixed'),
    timeoutMs: z.number().int().min(100),
    maxAttempts: z.number().int().min(1),
    attempt: z.number().int().min(0),
    retryBackoffMs: z.number().int().min(0).max(3_600_000).default(250),
    nextAttemptAt: z.string().datetime().optional(),
    deadlineAt: z.string().datetime().optional(),
    idempotencyKey: z.string().trim().min(1).max(255).optional(),
    parentTaskId: z.string().uuid().optional(),
    parentCompletionPolicy: z.enum(['independent', 'wait_for_success']).default('independent'),
    dependencyIds: z.array(z.string().uuid()).default([]),
    workflowDepth: z.number().int().min(0).max(64).default(0),
    status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    result: agentResultSchema.optional(),
    error: taskErrorSchema.optional(),
    usage: usageMetadataSchema.optional(),
  })
  .strict()
  .superRefine((task, context) => {
    if (new Set(task.dependencyIds).size !== task.dependencyIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dependencyIds'],
        message: 'Dependency IDs must be unique',
      });
    }
    if (task.parentTaskId !== undefined && task.dependencyIds.includes(task.parentTaskId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentTaskId'],
        message: 'Parent task cannot also be a dependency',
      });
    }
    if (task.status === 'completed' && (!task.result || !task.completedAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Completed tasks require a result and completedAt',
      });
    }
    if ((task.status === 'running' || task.status === 'completed') && task.attempt < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['attempt'],
        message: 'Started or completed tasks require at least one attempt',
      });
    }
    if (task.status === 'completed' && task.error) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Completed tasks cannot contain an error',
      });
    }
    if (task.status === 'running' && !task.startedAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Running tasks require startedAt' });
    }
    if (task.status === 'running' && (task.completedAt || task.result)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Running tasks cannot contain terminal completion data',
      });
    }
    if ((task.status === 'queued' || task.status === 'running') && task.completedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Non-terminal tasks cannot contain completedAt',
      });
    }
    if ((task.status === 'queued' || task.status === 'running') && task.result) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Non-terminal tasks cannot contain a result',
      });
    }
    if ((task.status === 'failed' || task.status === 'cancelled') && task.result) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cancelled or failed tasks cannot contain a result',
      });
    }
    if (task.status !== 'queued' && task.nextAttemptAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only queued tasks can have a next attempt time',
      });
    }
    if ((task.status === 'failed' || task.status === 'cancelled') && !task.completedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Terminal tasks require completedAt',
      });
    }
    if (task.status === 'failed' && !task.error) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['error'],
        message: 'Failed tasks require an error',
      });
    }
    if (task.parentTaskId === task.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentTaskId'],
        message: 'A task cannot be its own parent',
      });
    }
    if (task.attempt > task.maxAttempts) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Task attempt cannot exceed maxAttempts',
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
  readonly taskId?: string;
  readonly localDerivation?: () => T;
}

export const completionRequestSchema = z
  .object({
    operation: z.string().trim().min(1),
    input: jsonValueSchema,
    system: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    maxTokens: z.number().int().min(1).optional(),
    temperature: z.number().finite().min(0).max(2).optional(),
    taskId: z.string().uuid().optional(),
  })
  .strict();

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
  readonly schemaVersion: 2;
  readonly revision: number;
  readonly state: Readonly<Record<string, JsonValue>>;
}

export const runtimeStateSchema = z
  .object({
    schemaVersion: z.literal(2),
    revision: z.number().int().nonnegative(),
    state: z.record(jsonValueSchema),
  })
  .strict();
