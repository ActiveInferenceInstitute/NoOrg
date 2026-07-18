import { SystemClock } from '../../src/domain/clock';
import { TaskRepository } from '../../src/tasks/task-repository';
import { MemoryStateStore } from '../../src/state/state-store';
import { taskRecordSchema, taskRequestSchema } from '../../src/domain/types';

describe('TaskRepository', () => {
  it('recovers a persisted running task as queued work within its attempt budget', async () => {
    const state = new MemoryStateStore();
    const first = new TaskRepository(state, new SystemClock());
    const created = await first.create({
      name: 'Recover me',
      description: 'Exercise restart recovery',
      input: 'restart',
      maxAttempts: 2,
    });
    await first.start(created.id, 'analysis');

    const recoveredRepository = new TaskRepository(state, new SystemClock());
    await recoveredRepository.load();
    const recovered = await recoveredRepository.recoverInterruptedTasks();
    expect(recovered[0]).toEqual(
      expect.objectContaining({
        status: 'queued',
        error: expect.objectContaining({ code: 'TASK_INTERRUPTED' }),
      })
    );
    expect(recoveredRepository.get(created.id)?.status).toBe('queued');
  });

  it('rejects a result that is not a JSON task result', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const task = await repository.create({
      name: 'Validate',
      description: 'Validate result',
      input: 'x',
    });
    await repository.start(task.id, 'analysis');
    await expect(
      repository.complete(task.id, { data: undefined as never, summary: 'bad' })
    ).rejects.toThrow();
  });

  it('normalizes requests and rejects invalid or oversized input before mutation', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock(), {
      maxInputBytes: 4,
    });
    await expect(
      repository.create({ name: '  ', description: 'bad', input: 'x' })
    ).rejects.toThrow();
    await expect(
      repository.create({ name: 'Valid', description: 'bad', input: 'too large' })
    ).rejects.toMatchObject({ code: 'TASK_INPUT_TOO_LARGE' });
    await expect(
      repository.create({
        name: 'Invalid attempts',
        description: 'bad',
        input: null,
        maxAttempts: 1.5,
      })
    ).rejects.toThrow();
    expect(repository.list()).toHaveLength(0);
  });

  it('makes repeated cancellation idempotent', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const task = await repository.create({ name: 'Cancel', description: 'Cancel me', input: null });
    const first = await repository.cancel(task.id);
    const second = await repository.cancel(task.id);
    expect(first.status).toBe('cancelled');
    expect(second).toEqual(first);
  });

  it('deduplicates idempotent requests and rejects conflicting reuse', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const request = {
      name: 'Idempotent',
      description: 'Only create once',
      input: { value: 1 },
      idempotencyKey: 'request-1',
    };
    const first = await repository.create(request);
    const second = await repository.create({ ...request, input: { value: 1 } });
    expect(second.id).toBe(first.id);
    await repository.start(first.id, 'analysis');
    const replayAfterAssignment = await repository.create(request);
    expect(replayAfterAssignment.id).toBe(first.id);
    await expect(repository.create({ ...request, input: { value: 2 } })).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT',
    });
    await expect(repository.create({ ...request, agentId: 'analysis' })).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT',
    });
    expect(repository.list(undefined, { idempotencyKey: 'request-1' })).toHaveLength(1);
  });

  it('treats workflow policies as part of an idempotent task contract', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const request = {
      name: 'Policy task',
      description: 'Policy fingerprint',
      input: null,
      idempotencyKey: 'policy-fingerprint',
      priorityPolicy: 'fixed' as const,
    };
    await repository.create(request);
    await expect(
      repository.create({ ...request, priorityPolicy: 'inherit_max' })
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });

  it('records dependency metadata, retry backoff, deadlines, and query filters', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const parent = await repository.create({
      name: 'Parent',
      description: 'Parent task',
      input: null,
      agentId: 'analysis',
    });
    const child = await repository.create({
      name: 'Child',
      description: 'Dependent task',
      input: null,
      dependencyIds: [parent.id],
      maxAttempts: 2,
      retryBackoffMs: 20,
      deadlineAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(repository.list(undefined, { agentId: 'analysis' })).toEqual([
      expect.objectContaining({ id: parent.id }),
    ]);
    await repository.start(child.id, 'analysis');
    const retried = await repository.fail(child.id, {
      code: 'TRANSIENT',
      message: 'Retry this task',
      retryable: true,
    });
    expect(retried.status).toBe('queued');
    expect(retried.nextAttemptAt).toBeDefined();
    await expect(
      repository.create({
        name: 'Missing dependency',
        description: 'Reject missing dependency',
        input: null,
        dependencyIds: ['00000000-0000-4000-8000-000000000099'],
      })
    ).rejects.toMatchObject({ code: 'TASK_DEPENDENCY_NOT_FOUND' });
  });

  it('bounds workflow depth and breadth and preserves usage across retries', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock(), {
      maxWorkflowDepth: 1,
      maxWorkflowChildren: 1,
    });
    const parent = await repository.create({
      name: 'Workflow root',
      description: 'Root task',
      input: null,
      maxAttempts: 2,
    });
    const child = await repository.create({
      name: 'Workflow child',
      description: 'Bounded child',
      input: null,
      parentTaskId: parent.id,
      parentCompletionPolicy: 'wait_for_success',
      priorityPolicy: 'inherit_max',
    });
    await expect(
      repository.create({
        name: 'Too broad',
        description: 'Second child',
        input: null,
        parentTaskId: parent.id,
      })
    ).rejects.toMatchObject({ code: 'TASK_WORKFLOW_BREADTH_EXCEEDED' });
    await expect(
      repository.create({
        name: 'Too deep',
        description: 'Grandchild',
        input: null,
        parentTaskId: child.id,
      })
    ).rejects.toMatchObject({ code: 'TASK_WORKFLOW_DEPTH_EXCEEDED' });

    await repository.start(parent.id, 'analysis');
    await repository.recordUsage(parent.id, {
      promptTokens: 2,
      completionTokens: 3,
      totalTokens: 5,
      costUsd: 0.01,
    });
    const retried = await repository.fail(parent.id, {
      code: 'TRANSIENT',
      message: 'Retry with usage',
      retryable: true,
    });
    expect(retried.usage?.totalTokens).toBe(5);
    await repository.start(parent.id, 'analysis');
    const completed = await repository.completeWithUsage(
      parent.id,
      {
        data: null,
        summary: 'done',
      },
      {
        promptTokens: 1,
        completionTokens: 1,
        totalTokens: 2,
        costUsd: 0.02,
      }
    );
    expect(completed.usage).toEqual({
      promptTokens: 3,
      completionTokens: 4,
      totalTokens: 7,
      costUsd: 0.03,
    });
  });

  it('supports queued terminal transitions and records late terminal usage', async () => {
    const repository = new TaskRepository(new MemoryStateStore(), new SystemClock());
    const task = await repository.create({
      name: 'Terminal usage',
      description: 'Record usage after a terminal transition',
      input: null,
    });
    const failed = await repository.failQueued(task.id, {
      code: 'QUEUE_FAILURE',
      message: 'Failed before execution',
      retryable: false,
    });
    const withUsage = await repository.recordUsage(task.id, {
      promptTokens: 1,
      completionTokens: 2,
      totalTokens: 3,
      costUsd: 0.01,
    });
    expect(failed.status).toBe('failed');
    expect(withUsage.usage?.costUsd).toBe(0.01);
    await expect(repository.cancel(task.id)).rejects.toMatchObject({
      code: 'INVALID_TASK_TRANSITION',
    });
  });

  it('enforces terminal and attempt invariants at the schema boundary', () => {
    const base = {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Schema task',
      description: 'Schema invariants',
      input: null,
      requiredCapabilities: [],
      priority: 0,
      timeoutMs: 100,
      maxAttempts: 1,
      attempt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(taskRecordSchema.safeParse({ ...base, status: 'completed' }).success).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        status: 'running',
        startedAt: base.createdAt,
        result: { data: null, summary: 'late' },
      }).success
    ).toBe(false);
    expect(taskRecordSchema.safeParse({ ...base, status: 'failed' }).success).toBe(false);
    expect(taskRecordSchema.safeParse({ ...base, status: 'queued', attempt: 2 }).success).toBe(
      false
    );
    expect(
      taskRequestSchema.safeParse({
        name: 'Duplicate dependencies',
        description: 'Reject duplicate dependencies',
        input: null,
        dependencyIds: [base.id, base.id],
      }).success
    ).toBe(false);
    expect(
      taskRequestSchema.safeParse({
        name: 'Missing parent',
        description: 'Reject missing parent policy target',
        input: null,
        parentCompletionPolicy: 'wait_for_success',
      }).success
    ).toBe(false);
    expect(
      taskRequestSchema.safeParse({
        name: 'Parent dependency',
        description: 'Reject parent dependency overlap',
        input: null,
        parentTaskId: base.id,
        dependencyIds: [base.id],
      }).success
    ).toBe(false);

    const completed = {
      ...base,
      attempt: 1,
      retryBackoffMs: 0,
      dependencyIds: [],
      status: 'completed' as const,
      completedAt: base.updatedAt,
      result: { data: null, summary: 'done' },
    };
    expect(taskRecordSchema.safeParse(completed).success).toBe(true);
    expect(
      taskRecordSchema.safeParse({
        ...completed,
        error: { code: 'E', message: 'bad', retryable: false },
      }).success
    ).toBe(false);
    expect(taskRecordSchema.safeParse({ ...base, status: 'running' }).success).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        attempt: 1,
        status: 'running',
        startedAt: base.createdAt,
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2, costUsd: 0 },
      }).success
    ).toBe(true);
    expect(
      taskRecordSchema.safeParse({ ...base, status: 'queued', completedAt: base.updatedAt }).success
    ).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        status: 'queued',
        result: { data: null, summary: 'late' },
      }).success
    ).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        status: 'failed',
        completedAt: base.updatedAt,
        result: { data: null, summary: 'late' },
      }).success
    ).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        attempt: 1,
        status: 'failed',
        completedAt: base.updatedAt,
        error: { code: 'E', message: 'failed', retryable: false },
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2, costUsd: 0 },
      }).success
    ).toBe(true);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        status: 'failed',
        completedAt: base.updatedAt,
        nextAttemptAt: base.updatedAt,
      }).success
    ).toBe(false);
    expect(
      taskRecordSchema.safeParse({
        ...base,
        status: 'failed',
        error: { code: 'E', message: 'bad', retryable: false },
      }).success
    ).toBe(false);
    expect(
      taskRecordSchema.safeParse({ ...base, status: 'queued', attempt: 2, maxAttempts: 1 }).success
    ).toBe(false);
  });
});
