import { Timeout } from '../../../src/core/integration/patterns/Timeout';
import { EventSystem } from '../../../src/core/events/EventSystem';

describe('Timeout Pattern', () => {
  let timeout: Timeout;
  let eventSystem: EventSystem;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    eventSystem = EventSystem.getInstance();
    eventSpy = jest.spyOn(eventSystem, 'emit');
    timeout = new Timeout('test-timeout', {
      timeout: 200
    });
  });

  afterEach(() => {
    eventSpy.mockRestore();
    timeout.dispose();
  });

  test('should execute task that completes within timeout', async () => {
    const task = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'fast-result';
    });

    const result = await timeout.execute(task);

    expect(result).toBe('fast-result');
    expect(task).toHaveBeenCalledTimes(1);

    const metrics = timeout.getMetrics();
    expect(metrics.successCount).toBe(1);
    expect(metrics.timeoutCount).toBe(0);
    expect(metrics.totalAttempts).toBe(1);
  });

  test('should throw TimeoutError when execution exceeds timeout', async () => {
    const slowTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return 'slow-result';
    });

    await expect(timeout.execute(slowTask)).rejects.toThrow(
      'Task timed out after 200ms'
    );

    const metrics = timeout.getMetrics();
    expect(metrics.timeoutCount).toBe(1);
    expect(metrics.successCount).toBe(0);
  });

  test('should throw TimeoutError with metrics attached', async () => {
    const slowTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return 'slow-result';
    });

    try {
      await timeout.execute(slowTask);
      fail('Should have thrown');
    } catch (error: any) {
      expect(error.name).toBe('TimeoutError');
      expect(error.metrics).toBeDefined();
      expect(error.metrics.name).toBe('test-timeout');
      expect(error.metrics.timeoutCount).toBe(1);
    }
  });

  test('should track average execution time for successful tasks', async () => {
    const fastTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    });

    await timeout.execute(fastTask);
    await timeout.execute(fastTask);
    await timeout.execute(fastTask);

    const metrics = timeout.getMetrics();
    expect(metrics.successCount).toBe(3);
    expect(metrics.averageExecutionTime).toBeGreaterThan(0);
    expect(metrics.averageExecutionTime).toBeLessThan(200); // well under timeout
  });

  test('should emit metrics events', async () => {
    const task = jest.fn().mockResolvedValue('result');

    await timeout.execute(task);

    expect(eventSpy).toHaveBeenCalledWith('timeout:metrics', expect.objectContaining({
      name: 'test-timeout',
      metrics: expect.objectContaining({
        successCount: 1
      })
    }));
  });

  test('should handle concurrent timeout operations independently', async () => {
    const fastTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'fast';
    });

    const slowTask = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return 'slow';
    });

    const results = await Promise.allSettled([
      timeout.execute(fastTask),
      timeout.execute(slowTask)
    ]);

    expect(results[0].status).toBe('fulfilled');
    expect((results[0] as PromiseFulfilledResult<string>).value).toBe('fast');

    expect(results[1].status).toBe('rejected');
    expect((results[1] as PromiseRejectedResult).reason.name).toBe('TimeoutError');

    const metrics = timeout.getMetrics();
    expect(metrics.successCount).toBe(1);
    expect(metrics.timeoutCount).toBe(1);
    expect(metrics.totalAttempts).toBe(2);
  });

  test('should retry with backoff when retries are configured', async () => {
    const timeoutWithRetries = new Timeout('test-timeout-retries', {
      timeout: 100,
      retries: 2,
      backoff: {
        initial: 10,
        multiplier: 2,
        maxDelay: 100
      }
    });

    const error = new Error('transient failure');
    const task = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('recovered');

    const result = await timeoutWithRetries.execute(task);

    expect(result).toBe('recovered');
    expect(task).toHaveBeenCalledTimes(3);

    const metrics = timeoutWithRetries.getMetrics();
    expect(metrics.totalAttempts).toBe(3);
    expect(metrics.successCount).toBe(1);

    timeoutWithRetries.dispose();
  });

  test('should fail after exhausting all retries', async () => {
    const timeoutWithRetries = new Timeout('test-timeout-exhaust', {
      timeout: 100,
      retries: 1
    });

    const error = new Error('persistent failure');
    const task = jest.fn().mockRejectedValue(error);

    await expect(timeoutWithRetries.execute(task)).rejects.toThrow('persistent failure');

    expect(task).toHaveBeenCalledTimes(2); // initial + 1 retry

    const metrics = timeoutWithRetries.getMetrics();
    expect(metrics.totalAttempts).toBe(2);
    expect(metrics.failureCount).toBe(2);
    expect(metrics.successCount).toBe(0);

    timeoutWithRetries.dispose();
  });

  test('should use static getTimeout for singleton management', () => {
    const instance1 = Timeout.getTimeout('shared-timeout', { timeout: 500 });
    const instance2 = Timeout.getTimeout('shared-timeout', { timeout: 500 });

    expect(instance1).toBe(instance2);

    instance1.dispose();
  });

  test('should track failure count separately from timeout count', async () => {
    const task = jest.fn().mockRejectedValue(new Error('not a timeout'));

    await expect(timeout.execute(task)).rejects.toThrow('not a timeout');

    const metrics = timeout.getMetrics();
    expect(metrics.failureCount).toBe(1);
    expect(metrics.timeoutCount).toBe(0);
  });
});
