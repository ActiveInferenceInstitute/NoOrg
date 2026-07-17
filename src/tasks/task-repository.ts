import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Clock } from '../domain/clock';
import { assertCondition, NoOrgError } from '../domain/errors';
import type {
  AgentResult,
  JsonValue,
  TaskError,
  TaskRecord,
  TaskRequest,
  TaskStatus,
} from '../domain/types';
import { agentResultSchema, jsonValueSchema, taskRecordSchema } from '../domain/types';
import type { StateStore } from '../state/state-store';

const taskListSchema = z.array(taskRecordSchema);

function copy<T>(value: T): T {
  return structuredClone(value);
}

export class TaskRepository {
  private tasks = new Map<string, TaskRecord>();
  private mutation = Promise.resolve();
  private persistence = Promise.resolve();

  public constructor(
    private readonly state: StateStore,
    private readonly clock: Clock
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
        const next: TaskRecord = retryable
          ? { ...task, status: 'queued', error, updatedAt: now }
          : { ...task, status: 'failed', error, completedAt: now, updatedAt: now };
        this.tasks.set(task.id, next);
        recovered.push(copy(next));
      }
    });
    if (recovered.length > 0) await this.persist();
    return recovered;
  }

  public async create(request: TaskRequest): Promise<TaskRecord> {
    const name = request.name.trim();
    const description = request.description.trim();
    assertCondition(name.length > 0, 'INVALID_TASK_NAME', 'Task name is required');
    assertCondition(
      description.length > 0,
      'INVALID_TASK_DESCRIPTION',
      'Task description is required'
    );
    const now = this.clock.now().toISOString();
    const task: TaskRecord = {
      id: randomUUID(),
      name,
      description,
      input: jsonValueSchema.parse(copy(request.input)),
      ...(request.agentId === undefined ? {} : { agentId: request.agentId }),
      requiredCapabilities: [...(request.requiredCapabilities ?? [])],
      priority: request.priority ?? 0,
      timeoutMs: request.timeoutMs ?? 60000,
      maxAttempts: request.maxAttempts ?? 1,
      attempt: 0,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    };
    assertCondition(
      task.timeoutMs >= 100,
      'INVALID_TASK_TIMEOUT',
      'Task timeout must be at least 100ms'
    );
    assertCondition(
      task.maxAttempts >= 1,
      'INVALID_TASK_ATTEMPTS',
      'Task maxAttempts must be at least 1'
    );
    assertCondition(
      Number.isFinite(task.priority),
      'INVALID_TASK_PRIORITY',
      'Task priority must be finite'
    );
    await this.enqueue(() => {
      this.tasks.set(task.id, task);
    });
    await this.persist();
    return copy(task);
  }

  public get(id: string): TaskRecord | undefined {
    const task = this.tasks.get(id);
    return task === undefined ? undefined : copy(task);
  }

  public list(status?: TaskStatus): TaskRecord[] {
    return [...this.tasks.values()]
      .filter(task => status === undefined || task.status === status)
      .sort(
        (left, right) =>
          right.priority - left.priority || left.createdAt.localeCompare(right.createdAt)
      )
      .map(copy);
  }

  public async start(id: string, agentId: string): Promise<TaskRecord> {
    return this.transition(id, task => {
      assertCondition(
        task.status === 'queued',
        'INVALID_TASK_TRANSITION',
        'Only queued tasks can start'
      );
      const now = this.clock.now().toISOString();
      const { completedAt: _completedAt, result: _result, ...restartable } = task;
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
    const validatedResult = agentResultSchema.parse(result) as AgentResult;
    return this.transition(id, task => {
      assertCondition(
        task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only running tasks can complete'
      );
      const now = this.clock.now().toISOString();
      const { error: _error, ...successful } = task;
      return {
        ...successful,
        status: 'completed',
        result: copy(validatedResult),
        completedAt: now,
        updatedAt: now,
      };
    });
  }

  public async fail(id: string, error: TaskError): Promise<TaskRecord> {
    return this.transition(id, task => {
      assertCondition(
        task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only running tasks can fail'
      );
      const now = this.clock.now().toISOString();
      if (error.retryable && task.attempt < task.maxAttempts) {
        return { ...task, status: 'queued', error: copy(error), updatedAt: now };
      }
      return { ...task, status: 'failed', error: copy(error), completedAt: now, updatedAt: now };
    });
  }

  public async cancel(id: string): Promise<TaskRecord> {
    return this.transition(id, task => {
      assertCondition(
        task.status === 'queued' || task.status === 'running',
        'INVALID_TASK_TRANSITION',
        'Only queued or running tasks can be cancelled'
      );
      const now = this.clock.now().toISOString();
      return { ...task, status: 'cancelled', completedAt: now, updatedAt: now };
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
}
