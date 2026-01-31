import { Bulkhead } from '../../../src/core/integration/patterns/Bulkhead';
import { EventSystem } from '../../../src/core/events/EventSystem';

describe('Bulkhead Pattern', () => {
  let bulkhead: Bulkhead;
  let eventSystem: EventSystem;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    eventSystem = EventSystem.getInstance();
    eventSpy = jest.spyOn(eventSystem, 'emit');
    bulkhead = new Bulkhead('test-bulkhead', {
      maxConcurrent: 2,
      maxQueue: 3
    });
  });

  afterEach(() => {
    eventSpy.mockRestore();
    bulkhead.dispose();
  });

  test('should execute tasks within concurrency capacity', async () => {
    const task = jest.fn().mockResolvedValue('result');

    const result = await bulkhead.execute(task);

    expect(result).toBe('result');
    expect(task).toHaveBeenCalledTimes(1);

    const metrics = bulkhead.getMetrics();
    expect(metrics.successCount).toBe(1);
    expect(metrics.rejectedCount).toBe(0);
  });

  test('should allow concurrent execution up to maxConcurrent limit', async () => {
    let resolveTask1: (value: string) => void;
    let resolveTask2: (value: string) => void;

    const task1 = jest.fn().mockImplementation(() => new Promise<string>(resolve => {
      resolveTask1 = resolve;
    }));
    const task2 = jest.fn().mockImplementation(() => new Promise<string>(resolve => {
      resolveTask2 = resolve;
    }));

    const promise1 = bulkhead.execute(task1);
    const promise2 = bulkhead.execute(task2);

    // Both tasks should be running
    expect(task1).toHaveBeenCalledTimes(1);
    expect(task2).toHaveBeenCalledTimes(1);

    const metrics = bulkhead.getMetrics();
    expect(metrics.active).toBe(2);

    // Resolve both
    resolveTask1!('result1');
    resolveTask2!('result2');

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
  });

  test('should reject tasks when capacity and queue are both full', async () => {
    const blockingTasks: Array<{ resolve: (v: string) => void }> = [];

    const createBlockingTask = () => jest.fn().mockImplementation(
      () => new Promise<string>(resolve => {
        blockingTasks.push({ resolve });
      })
    );

    // Fill up concurrent capacity (2 slots)
    const task1 = createBlockingTask();
    const task2 = createBlockingTask();
    const promise1 = bulkhead.execute(task1);
    const promise2 = bulkhead.execute(task2);

    // Fill up the queue (3 slots)
    const queuedPromises: Promise<string>[] = [];
    for (let i = 0; i < 3; i++) {
      queuedPromises.push(bulkhead.execute(createBlockingTask()));
    }

    // Next task should be rejected - both capacity and queue are full
    await expect(bulkhead.execute(createBlockingTask())).rejects.toThrow('Bulkhead queue full');

    const metrics = bulkhead.getMetrics();
    expect(metrics.rejectedCount).toBe(1);

    // Cleanup: resolve all blocking tasks
    blockingTasks.forEach(t => t.resolve('done'));
    await Promise.allSettled([promise1, promise2, ...queuedPromises]);
  });

  test('should queue tasks when concurrency limit is reached', async () => {
    let resolveTask1: (value: string) => void;
    let resolveTask2: (value: string) => void;

    const task1 = jest.fn().mockImplementation(
      () => new Promise<string>(resolve => { resolveTask1 = resolve; })
    );
    const task2 = jest.fn().mockImplementation(
      () => new Promise<string>(resolve => { resolveTask2 = resolve; })
    );
    const task3 = jest.fn().mockResolvedValue('queued-result');

    // Fill concurrent capacity
    const promise1 = bulkhead.execute(task1);
    const promise2 = bulkhead.execute(task2);

    // This should be queued
    const promise3 = bulkhead.execute(task3);

    let metricsBeforeResolve = bulkhead.getMetrics();
    expect(metricsBeforeResolve.active).toBe(2);
    expect(metricsBeforeResolve.queued).toBe(1);

    // Resolve one active task to make room for queued task
    resolveTask1!('result1');
    await promise1;

    // Wait for queue processing interval (100ms in source)
    await new Promise(resolve => setTimeout(resolve, 150));

    resolveTask2!('result2');
    await promise2;

    const result3 = await promise3;
    expect(result3).toBe('queued-result');
  });

  test('should clean up active count after task completion', async () => {
    const task = jest.fn().mockResolvedValue('result');

    await bulkhead.execute(task);

    const metrics = bulkhead.getMetrics();
    expect(metrics.active).toBe(0);
    expect(metrics.successCount).toBe(1);
  });

  test('should clean up active count after task failure', async () => {
    const task = jest.fn().mockRejectedValue(new Error('task failed'));

    await expect(bulkhead.execute(task)).rejects.toThrow('task failed');

    const metrics = bulkhead.getMetrics();
    expect(metrics.active).toBe(0);
    expect(metrics.failureCount).toBe(1);
  });

  test('should track timeout errors separately from failures', async () => {
    const bulkheadWithTimeout = new Bulkhead('test-bulkhead-timeout', {
      maxConcurrent: 2,
      maxQueue: 3,
      timeout: 50
    });

    const slowTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return 'slow';
    });

    await expect(bulkheadWithTimeout.execute(slowTask)).rejects.toThrow();

    const metrics = bulkheadWithTimeout.getMetrics();
    expect(metrics.timeoutCount).toBe(1);
    expect(metrics.failureCount).toBe(0);

    bulkheadWithTimeout.dispose();
  });

  test('should emit metrics events on state changes', async () => {
    const task = jest.fn().mockResolvedValue('result');

    await bulkhead.execute(task);

    expect(eventSpy).toHaveBeenCalledWith('bulkhead:metrics', expect.objectContaining({
      name: 'test-bulkhead',
      metrics: expect.objectContaining({
        successCount: 1
      })
    }));
  });

  test('should use static getBulkhead for singleton management', () => {
    const instance1 = Bulkhead.getBulkhead('shared-bulkhead', {
      maxConcurrent: 5,
      maxQueue: 10
    });

    const instance2 = Bulkhead.getBulkhead('shared-bulkhead', {
      maxConcurrent: 5,
      maxQueue: 10
    });

    expect(instance1).toBe(instance2);

    instance1.dispose();
  });

  test('should handle multiple sequential executions correctly', async () => {
    const task = jest.fn().mockResolvedValue('result');

    for (let i = 0; i < 5; i++) {
      await bulkhead.execute(task);
    }

    const metrics = bulkhead.getMetrics();
    expect(metrics.successCount).toBe(5);
    expect(metrics.active).toBe(0);
    expect(metrics.rejectedCount).toBe(0);
  });
});
