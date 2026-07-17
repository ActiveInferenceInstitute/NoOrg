import { SystemClock } from '../../src/domain/clock';
import { TaskRepository } from '../../src/tasks/task-repository';
import { MemoryStateStore } from '../../src/state/state-store';

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
});
