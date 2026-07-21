import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Clock } from '../domain/clock';
import { assertCondition, NoOrgError } from '../domain/errors';
import type {
  AgentResult,
  JsonValue,
  TaskError,
  TaskQuery,
  TaskRecord,
  TaskRequest,
  TaskStatus,
  UsageMetadata,
} from '../domain/types';
import {
  agentResultSchema,
  jsonValueSchema,
  taskErrorSchema,
  taskRecordSchema,
  taskQuerySchema,
  taskRequestSchema,
  usageMetadataSchema,
} from '../domain/types';
import type { StateStore } from '../state/state-store';

const taskListSchema = z.array(taskRecordSchema).superRefine((tasks, context) => {
  const ids = new Set<string>();
  const idempotencyKeys = new Set<string>();
  tasks.forEach((task, index) => {
    if (ids.has(task.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'id'],
        message: 'Task IDs must be unique',
      });
    }
    ids.add(task.id);
    if (task.idempotencyKey !== undefined && idempotencyKeys.has(task.idempotencyKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'idempotencyKey'],
        message: 'Idempotency keys must be unique',
      });
    }
    if (task.idempotencyKey !== undefined) idempotencyKeys.add(task.idempotencyKey);
  });
});

function copy<T>(value: T): T {
  return structuredClone(value);
}

export class TaskRepository {
  private tasks = new Map<string, TaskRecord>();
  private mutation = Promise.resolve();
  private persistence = Promise.resolve();

  public constructor(
    private readonly state: StateStore,
    private readonly clock: Clock,
    private readonly limits: {
      readonly maxInputBytes?: number;
      readonly maxResultBytes?: number;
      readonly maxWorkflowDepth?: number;
      readonly maxWorkflowChildren?: number;
    } = {}
  ) {}

  public async load(): Promise<void> {
    const persisted = this.state.get<JsonValue>('tasks');
    if (persisted === undefined) return;
    const parsed = taskListSchema.safeParse(persisted);
    if (!parsed.success)
      throw new NoOrgError(
        'TASK_STATE_INVALID',
        'Persisted task records do not match the task schema'
      );
    this.tasks = new Map(parsed.data.map(task => [task.id, copy(task) as TaskRecord]));
    for (const task of this.tasks.values()) {
      if (task.parentTaskId !== undefined && !this.tasks.has(task.parentTaskId))
        throw new NoOrgError('TASK_PARENT_NOT_FOUND', 'Persisted task parent was not found');
      if (task.dependencyIds.some(dependencyId => !this.tasks.has(dependencyId)))
        throw new NoOrgError(
          'TASK_DEPENDENCY_NOT_FOUND',
          'Persisted task dependency was not found'
        );
    }
    if (this.hasDependencyCycle() || this.hasParentCycle())
      throw new NoOrgError('TASK_DEPENDENCY_CYCLE', 'Persisted tasks contain a dependency cycle');
  }

  public async recoverInterruptedTasks(): Promise<TaskRecord[]> {
    const recovered: TaskRecord[] = [];
    await this.enqueue(() => {
      for (const task of this.tasks.values()) {
        if (task.status !== 'running') continue;
        const now = this.clock.now().toISOString();
        const retryable = task.attempt < task.maxAttempts;
        const error: TaskError = {
          code: 'TASK_INTERRUPTED',
          message: 'Task was running when the coordinator last stopped',
          retryable,
        };
        const { startedAt: _startedAt, ...restartable } = task;
        const next: TaskRecord = retryable
          ? { ...restartable, status: 'queued', error, updatedAt: now }
          : { ...task, status: 'failed', error, completedAt: now, updatedAt: now };
        this.tasks.set(task.id, next);
        recovered.push(copy(next));
      }
    });
    if (recovered.length > 0) await this.persist();
    return recovered;
  }

  public async create(request: TaskRequest): Promise<TaskRecord> {
    const parsedRequest = taskRequestSchema.parse(request);
    const input = jsonValueSchema.parse(structuredClone(parsedRequest.input));
    const inputBytes = Buffer.byteLength(JSON.stringify(input), 'utf8');
    assertCondition(
      inputBytes <= (this.limits.maxInputBytes ?? 1_048_576),
      'TASK_INPUT_TOO_LARGE',
      `Task input exceeds the configured ${this.limits.maxInputBytes ?? 1_048_576} byte limit`
    );
    const nowDate = this.clock.now();
    if (
      parsedRequest.deadlineAt !== undefined &&
      Date.parse(parsedRequest.deadlineAt) <= nowDate.getTime()
    )
      throw new NoOrgError('TASK_DEADLINE_INVALID', 'Task deadline must be in the future');
    const now = nowDate.toISOString();
    const id = randomUUID();
    const task: TaskRecord = {
      id,
      name: parsedRequest.name,
      description: parsedRequest.description,
      input,
      ...(parsedRequest.agentId === undefined ? {} : { agentId: parsedRequest.agentId }),
      ...(parsedRequest.agentId === undefined ? {} : { requestedAgentId: parsedRequest.agentId }),
      requiredCapabilities: [...parsedRequest.requiredCapabilities],
      priority: parsedRequest.priority,
      priorityPolicy: parsedRequest.priorityPolicy,
      timeoutMs: parsedRequest.timeoutMs,
      maxAttempts: parsedRequest.maxAttempts,
      attempt: 0,
      status: 'queued',
      retryBackoffMs: parsedRequest.retryBackoffMs,
      ...(parsedRequest.deadlineAt === undefined ? {} : { deadlineAt: parsedRequest.deadlineAt }),
      ...(parsedRequest.idempotencyKey === undefined
        ? {}
        : { idempotencyKey: parsedRequest.idempotencyKey }),
      ...(parsedRequest.parentTaskId === undefined
        ? {}
        : { parentTaskId: parsedRequest.parentTaskId }),
      parentCompletionPolicy: parsedRequest.parentCompletionPolicy,
      dependencyIds: [...parsedRequest.dependencyIds],
      workflowDepth: 0,
      createdAt: now,
      updatedAt: now,
    };
    let created = true;
    let result!: TaskRecord;
    await this.enqueue(() => {
      if (task.idempotencyKey !== undefined) {
        const existing = [...this.tasks.values()].find(
          candidate => candidate.idempotencyKey === task.idempotencyKey
        );
        if (existing !== undefined) {
          if (taskFingerprint(existing) !== taskFingerprint(task))
            throw new NoOrgError(
              'IDEMPOTENCY_CONFLICT',
              'Idempotency key was already used for a different task'
            );
          created = false;
          result = copy(existing);
          return;
        }
      }
      if (task.parentTaskId !== undefined && !this.tasks.has(task.parentTaskId))
        throw new NoOrgError('TASK_PARENT_NOT_FOUND', 'Parent task was not found');
      for (const dependencyId of task.dependencyIds) {
        if (!this.tasks.has(dependencyId))
          throw new NoOrgError(
            'TASK_DEPENDENCY_NOT_FOUND',
            `Dependency task ${dependencyId} was not found`
          );
      }
      const parentChildren =
        task.parentTaskId === undefined
          ? 0
          : [...this.tasks.values()].filter(
              candidate => candidate.parentTaskId === task.parentTaskId
            ).length;
      if (parentChildren >= (this.limits.maxWorkflowChildren ?? 100)) {
        throw new NoOrgError(
          'TASK_WORKFLOW_BREADTH_EXCEEDED',
          'Task parent has reached the configured child limit'
        );
      }
      const normalizedTask = {
        ...task,
        workflowDepth: this.workflowDepth(task),
      };
      if (normalizedTask.workflowDepth > (this.limits.maxWorkflowDepth ?? 32)) {
        throw new NoOrgError(
          'TASK_WORKFLOW_DEPTH_EXCEEDED',
          'Task relationships exceed the configured workflow depth'
        );
      }
      this.tasks.set(task.id, normalizedTask);
      if (this.hasDependencyCycle() || this.hasParentCycle()) {
        this.tasks.delete(task.id);
        throw new NoOrgError('TASK_DEPENDENCY_CYCLE', 'Task relationships would create a cycle');
      }
      result = copy(normalizedTask);
    });
    if (created) await this.persist();
    return result;
  }

  public get(id: string): TaskRecord | undefined {
    const task = this.tasks.get(id);
    return task === undefined ? undefined : copy(task);
  }

  public list(status?: TaskStatus, query: TaskQuery = {}): TaskRecord[] {
    const parsedQuery = taskQuerySchema.parse({
      ...query,
      ...(status === undefined ? {} : { status }),
    });
    const sorted = [...this.tasks.values()]
      .filter(task => parsedQuery.status === undefined || task.status === parsedQuery.status)
      .filter(task => parsedQuery.agentId === undefined || task.agentId === parsedQuery.agentId)
      .filter(
        task =>
          parsedQuery.capability === undefined ||
          task.requiredCapabilities.includes(parsedQuery.capability)
      )
      .filter(
        task =>
          parsedQuery.idempotencyKey === undefined ||
          task.idempotencyKey === parsedQuery.idempotencyKey
      )
      .sort((left, right) => {
        const priorityDifference = this.effectivePriority(right) - this.effectivePriority(left);
        return priorityDifference || left.createdAt.localeCompare(right.createdAt);
      });
    const end = parsedQuery.offset + parsedQuery.limit;
    return sorted.slice(parsedQuery.offset, end).map(copy);
  }

  public async start(id: string, agentId: string): Promise<TaskRecord> {
    return this.transition(id, task => {
      assertCondition(
        task.status === 'queued',
        'INVALID_TASK_TRANSITION',
        'Only queued tasks can start'
      );
      const now = this.clock.now().toISOString();
      const {
        completedAt: _completedAt,
        result: _result,
        nextAttemptAt: _nextAttemptAt,
        ...restartable
      } = task;
      return {
        ...restartable,
        agentId,
        attempt: task.attempt + 1,
        status: 'running',
        startedAt: now,
        updatedAt: now,
      };
    });
  }

  public async complete(id: string, result: AgentResult): Promise<TaskRecord> {
    return this.completeWithUsage(id, result);
  }

  public async completeWithUsage(
    id: string,
    result: AgentResult,
    usage?: UsageMetadata
  ): Promise<TaskRecord> {
    const validatedResult = agentResultSchema.parse(result) as AgentResult;
    const validatedUsage = usage === undefined ? undefined : usageMetadataSchema.parse(usage);
    const resultBytes = Buffer.byteLength(JSON.stringify(validatedResult), 'utf8');
    assertCondition(
      resultBytes <= (this.limits.maxResultBytes ?? 1_048_576),
      'TASK_RESULT_TOO_LARGE',
      `Task result exceeds the configured ${this.limits.maxResultBytes ?? 1_048_576} byte limit`
    );
    return this.transition(id, task => {
      assertCondition(
        task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only running tasks can complete'
      );
      const now = this.clock.now().toISOString();
      const { error: _error, nextAttemptAt: _nextAttemptAt, ...successful } = task;
      const accumulatedUsage = mergeUsage(task.usage, validatedUsage);
      return {
        ...successful,
        status: 'completed',
        result: copy(validatedResult),
        ...(accumulatedUsage === undefined ? {} : { usage: copy(accumulatedUsage) }),
        completedAt: now,
        updatedAt: now,
      };
    });
  }

  public async recordUsage(id: string, usage: UsageMetadata): Promise<TaskRecord> {
    const validatedUsage = usageMetadataSchema.parse(usage) as UsageMetadata;
    return this.transition(id, task => {
      const accumulatedUsage = mergeUsage(task.usage, validatedUsage);
      return {
        ...task,
        ...(accumulatedUsage === undefined ? {} : { usage: accumulatedUsage }),
        updatedAt: this.clock.now().toISOString(),
      };
    });
  }

  public async fail(id: string, error: TaskError): Promise<TaskRecord> {
    const validatedError = taskErrorSchema.parse(error) as TaskError;
    return this.transition(id, task => {
      assertCondition(
        task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only running tasks can fail'
      );
      const now = this.clock.now().toISOString();
      if (validatedError.retryable && task.attempt < task.maxAttempts) {
        const {
          startedAt: _startedAt,
          completedAt: _completedAt,
          result: _result,
          ...retryable
        } = task;
        const delayMs = Math.min(
          3_600_000,
          task.retryBackoffMs * 2 ** Math.max(0, task.attempt - 1)
        );
        return {
          ...retryable,
          status: 'queued',
          error: copy(validatedError),
          nextAttemptAt: new Date(this.clock.now().getTime() + delayMs).toISOString(),
          updatedAt: now,
        };
      }
      const { nextAttemptAt: _nextAttemptAt, ...terminal } = task;
      return {
        ...terminal,
        status: 'failed',
        error: copy(validatedError),
        completedAt: now,
        updatedAt: now,
      };
    });
  }

  public async cancel(id: string): Promise<TaskRecord> {
    return this.transition(id, task => {
      if (task.status === 'cancelled') return task;
      assertCondition(
        task.status === 'queued' || task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only queued or running tasks can be cancelled'
      );
      const now = this.clock.now().toISOString();
      const { nextAttemptAt: _nextAttemptAt, ...cancelled } = task;
      return { ...cancelled, status: 'cancelled', completedAt: now, updatedAt: now };
    });
  }

  public async failQueued(id: string, error: TaskError): Promise<TaskRecord> {
    const validatedError = taskErrorSchema.parse(error) as TaskError;
    return this.transition(id, task => {
      assertCondition(
        task.status === 'queued',
        'INVALID_TASK_TRANSITION',
        'Only queued tasks can fail'
      );
      const now = this.clock.now().toISOString();
      const { nextAttemptAt: _nextAttemptAt, ...terminal } = task;
      return {
        ...terminal,
        status: 'failed',
        error: copy(validatedError),
        completedAt: now,
        updatedAt: now,
      };
    });
  }

  public async persist(): Promise<void> {
    const next = this.persistence.then(async () => {
      await this.state.set('tasks', [...this.tasks.values()] as unknown as JsonValue);
      await this.state.flush();
    });
    this.persistence = next.catch(() => undefined);
    await next;
  }

  private async transition(
    id: string,
    update: (task: TaskRecord) => TaskRecord
  ): Promise<TaskRecord> {
    let changed!: TaskRecord;
    await this.enqueue(() => {
      const current = this.tasks.get(id);
      if (!current) throw new NoOrgError('TASK_NOT_FOUND', `Task ${id} was not found`);
      changed = update(copy(current));
      this.tasks.set(id, copy(changed));
    });
    await this.persist();
    return copy(changed);
  }

  private async enqueue(operation: () => void): Promise<void> {
    const next = this.mutation.then(operation);
    this.mutation = next.catch(() => undefined);
    await next;
  }

  private hasDependencyCycle(): boolean {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      const task = this.tasks.get(id);
      if (task?.dependencyIds.some(visit)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    return [...this.tasks.keys()].some(visit);
  }

  private hasParentCycle(): boolean {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      const parentId = this.tasks.get(id)?.parentTaskId;
      if (parentId !== undefined && visit(parentId)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    return [...this.tasks.keys()].some(visit);
  }

  private workflowDepth(task: Pick<TaskRecord, 'parentTaskId' | 'dependencyIds'>): number {
    const related = [
      ...(task.parentTaskId === undefined ? [] : [task.parentTaskId]),
      ...task.dependencyIds,
    ];
    if (related.length === 0) return 0;
    return 1 + Math.max(...related.map(id => this.tasks.get(id)?.workflowDepth ?? 0));
  }

  private effectivePriority(task: TaskRecord): number {
    if (task.priorityPolicy === 'fixed') return task.priority;
    const related = task.dependencyIds
      .map(id => this.tasks.get(id))
      .filter((candidate): candidate is TaskRecord => candidate !== undefined);
    if (task.parentCompletionPolicy === 'wait_for_success' && task.parentTaskId !== undefined) {
      const parent = this.tasks.get(task.parentTaskId);
      if (parent !== undefined) related.push(parent);
    }
    return Math.max(task.priority, ...related.map(candidate => this.effectivePriority(candidate)));
  }
}

function taskFingerprint(
  task: Pick<
    TaskRecord,
    | 'name'
    | 'description'
    | 'input'
    | 'requestedAgentId'
    | 'requiredCapabilities'
    | 'priority'
    | 'priorityPolicy'
    | 'timeoutMs'
    | 'maxAttempts'
    | 'retryBackoffMs'
    | 'deadlineAt'
    | 'parentTaskId'
    | 'parentCompletionPolicy'
    | 'dependencyIds'
  >
): string {
  return JSON.stringify({
    name: task.name,
    description: task.description,
    input: stableValue(task.input),
    requestedAgentId: task.requestedAgentId,
    requiredCapabilities: [...task.requiredCapabilities].sort(),
    priority: task.priority,
    priorityPolicy: task.priorityPolicy,
    timeoutMs: task.timeoutMs,
    maxAttempts: task.maxAttempts,
    retryBackoffMs: task.retryBackoffMs,
    deadlineAt: task.deadlineAt,
    parentTaskId: task.parentTaskId,
    parentCompletionPolicy: task.parentCompletionPolicy,
    dependencyIds: [...task.dependencyIds].sort(),
  });
}

function stableValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableValue(nested)])
    );
  }
  return value;
}

function mergeUsage(
  current: UsageMetadata | undefined,
  next: UsageMetadata | undefined
): UsageMetadata | undefined {
  if (current === undefined) return next === undefined ? undefined : { ...next };
  if (next === undefined) return { ...current };
  return {
    promptTokens: current.promptTokens + next.promptTokens,
    completionTokens: current.completionTokens + next.completionTokens,
    totalTokens: current.totalTokens + next.totalTokens,
    costUsd: current.costUsd + next.costUsd,
  };
}
