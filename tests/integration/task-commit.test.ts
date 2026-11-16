import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SystemClock } from '../../src/domain/clock';
import { NoOrgError } from '../../src/domain/errors';
import { jsonValueSchema, runtimeStateSchema } from '../../src/domain/types';
import { FileStateStore, MemoryStateStore } from '../../src/state/state-store';
import { TaskRepository } from '../../src/tasks/task-repository';
import { StateBoundary } from '../fixtures/state-boundary';

const request = { name: 'Durable task', description: 'Publish only committed work', input: 'x', agentId: 'analysis', maxAttempts: 2 };
const two = { promptTokens: 1, completionTokens: 1, totalTokens: 2, costUsd: 0.02 };
const five = { promptTokens: 3, completionTokens: 2, totalTokens: 5, costUsd: 0.05 };

describe('TaskRepository durable publication', () => {
  it('does not publish a rejected create or reserve its idempotency key for a concurrent caller', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-create-commit-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    const repository = new TaskRepository(state, new SystemClock());
    const barrier = boundary.pauseNextWrite();
    try {
      await state.load();
      await repository.load();
      const first = repository.create({ ...request, idempotencyKey: 'same-key' });
      const rejection = expect(first).rejects.toBe(boundary.error);
      await barrier.entered;
      expect(repository.list()).toEqual([]);
      expect(state.get('tasks')).toBeUndefined();
      expect(state.revision()).toBe(0);
      let duplicateSettled = false;
      const duplicate = repository.create({ ...request, idempotencyKey: 'same-key' }).then(task => {
        duplicateSettled = true;
        return task;
      });
      await Promise.resolve();
      expect(duplicateSettled).toBe(false);
      boundary.failNext('write');
      barrier.release();
      await rejection;
      const accepted = await duplicate;
      expect(repository.list().map(task => task.id)).toEqual([accepted.id]);
      expect((await repository.create({ ...request, idempotencyKey: 'same-key' })).id).toBe(accepted.id);
      await repository.persist();
      await state.close();
      const reopened = new FileStateStore(file);
      try {
        await reopened.load();
        const recovered = new TaskRepository(reopened, new SystemClock());
        await recovered.load();
        expect(recovered.list().map(task => task.id)).toEqual([accepted.id]);
        expect(recovered.get(accepted.id)?.attempt).toBe(0);
      } finally { await reopened.close(); }
    } finally {
      barrier.release();
      await state.close();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('keeps an unresolved/rejected start invisible and serializes cancellation after it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-start-commit-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    let release: (() => void) | undefined;
    try {
      await state.load();
      const repository = new TaskRepository(state, new SystemClock());
      await repository.load();
      const task = await repository.create(request);
      const barrier = boundary.pauseNextWrite();
      release = barrier.release;
      const start = repository.start(task.id, 'analysis');
      const rejection = expect(start).rejects.toBe(boundary.error);
      await barrier.entered;
      expect(repository.get(task.id)).toEqual(task);
      expect(repository.list('queued').map(item => item.id)).toEqual([task.id]);
      const cancellation = repository.cancel(task.id);
      boundary.failNext('sync');
      barrier.release();
      await rejection;
      expect(await cancellation).toEqual(expect.objectContaining({ status: 'cancelled', attempt: 0 }));
      await repository.persist();
      await state.close();
      const envelope = runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8')));
      expect(envelope.state.tasks).toEqual([expect.objectContaining({ status: 'cancelled', attempt: 0 })]);
    } finally {
      release?.();
      await state.close();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('does not leak rejected cancellation, result or usage into a later accepted commit', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-transition-commit-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    try {
      await state.load();
      const repository = new TaskRepository(state, new SystemClock());
      await repository.load();
      const task = await repository.create(request);
      await repository.start(task.id, 'analysis');
      const running = repository.get(task.id);
      boundary.failNext('write');
      await expect(repository.cancel(task.id)).rejects.toBe(boundary.error);
      expect(repository.get(task.id)).toEqual(running);
      boundary.failNext('sync');
      await expect(repository.completeWithUsage(task.id, { data: { rejected: true }, summary: 'Not committed' }, five)).rejects.toBe(boundary.error);
      expect(repository.get(task.id)).toEqual(running);
      boundary.failNext('write');
      await expect(repository.recordUsage(task.id, five)).rejects.toBe(boundary.error);
      expect(repository.get(task.id)?.usage).toBeUndefined();
      const completed = await repository.completeWithUsage(task.id, { data: { accepted: true }, summary: 'Committed' }, two);
      expect(completed.usage).toEqual(two);
      expect(completed.result?.data).toEqual({ accepted: true });
      await repository.persist();
      await state.close();
      const reopened = new FileStateStore(file);
      try {
        await reopened.load();
        const recovered = new TaskRepository(reopened, new SystemClock());
        await recovered.load();
        expect(recovered.get(task.id)).toEqual(completed);
      } finally { await reopened.close(); }
    } finally {
      await state.close();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('does not publish rejected interrupted-task recovery and can recover the original durable task later', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-recovery-commit-'));
    const file = join(directory, 'state.json');
    const first = new FileStateStore(file);
    let second: FileStateStore | undefined;
    let third: FileStateStore | undefined;
    try {
      await first.load();
      const original = new TaskRepository(first, new SystemClock());
      await original.load();
      const task = await original.create(request);
      await original.start(task.id, 'analysis');
      const running = original.get(task.id);
      await first.close();
      const boundary = new StateBoundary(file);
      second = new FileStateStore(file, boundary.io);
      await second.load();
      const recovering = new TaskRepository(second, new SystemClock());
      await recovering.load();
      boundary.failNext('write');
      await expect(recovering.recoverInterruptedTasks()).rejects.toBe(boundary.error);
      expect(recovering.get(task.id)).toEqual(running);
      await recovering.persist();
      await second.close();
      third = new FileStateStore(file);
      await third.load();
      const reloaded = new TaskRepository(third, new SystemClock());
      await reloaded.load();
      expect(reloaded.get(task.id)).toEqual(running);
      expect(await reloaded.recoverInterruptedTasks()).toEqual([
        expect.objectContaining({ id: task.id, status: 'queued', attempt: 1 }),
      ]);
      expect(reloaded.get(task.id)).toEqual(expect.objectContaining({ status: 'queued', attempt: 1 }));
    } finally {
      await third?.close();
      await second?.close();
      await first.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
  it('does not publish a partially admitted persisted collection when relationship validation fails', async () => {
    const state = new MemoryStateStore();
    try {
      const original = new TaskRepository(state, new SystemClock());
      await original.load();
      const accepted = await original.create(request);
      await state.set('tasks', jsonValueSchema.parse([
        accepted,
        { ...accepted, id: randomUUID(), dependencyIds: [randomUUID()] },
      ]));
      const loading = new TaskRepository(state, new SystemClock());
      await expect(loading.load()).rejects.toBeInstanceOf(NoOrgError);
      expect(loading.list()).toEqual([]);
      expect(loading.get(accepted.id)).toBeUndefined();
    } finally { await state.close(); }
  });
});

describe('MemoryStateStore admission and close', () => {
  it('captures caller-owned values before queueing and drains only pre-close admissions', async () => {
    const state = new MemoryStateStore();
    const input = { value: 1 };
    const accepted = state.set('input', input);
    input.value = 99;
    const close = state.close();
    expect(state.isOpen()).toBe(false);
    await expect(state.set('late', true)).rejects.toMatchObject({ code: 'STATE_STORE_CLOSED' });
    await accepted;
    await close;
    expect(state.snapshot()).toEqual({ input: { value: 1 } });
    expect(state.revision()).toBe(1);
  });
});
