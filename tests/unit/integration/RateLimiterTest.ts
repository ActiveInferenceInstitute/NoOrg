import { RateLimiter } from '../../../src/core/integration/patterns/RateLimiter';
import { EventSystem } from '../../../src/core/events/EventSystem';

describe('RateLimiter Pattern', () => {
  let rateLimiter: RateLimiter;
  let eventSystem: EventSystem;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    eventSystem = EventSystem.getInstance();
    eventSpy = jest.spyOn(eventSystem, 'emit');
    rateLimiter = new RateLimiter('test-limiter', {
      requestsPerPeriod: 2,
      periodInMs: 100,
      maxQueueSize: 5,
      queueTimeout: 500
    });
  });

  afterEach(() => {
    eventSpy.mockRestore();
    rateLimiter.dispose();
    jest.useRealTimers();
  });

  test('should allow execution within rate limit', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    
    const result1 = await rateLimiter.execute(fn, 'arg1');
    const result2 = await rateLimiter.execute(fn, 'arg2');
    
    expect(result1).toBe('success');
    expect(result2).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'arg1');
    expect(fn).toHaveBeenNthCalledWith(2, 'arg2');
    
    const metrics = rateLimiter.getMetrics();
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.successfulRequests).toBe(2);
    expect(metrics.rejectedRequests).toBe(0);
    expect(metrics.queuedRequests).toBe(0);
  });

  test('should queue requests that exceed the rate limit', async () => {
    jest.useFakeTimers();
    
    const fn = jest.fn().mockImplementation(async (arg) => {
      return `success-${arg}`;
    });
    
    // First two should execute immediately
    const promise1 = rateLimiter.execute(fn, 1);
    const promise2 = rateLimiter.execute(fn, 2);
    
    // Third should be queued
    const promise3 = rateLimiter.execute(fn, 3);
    
    // First two should resolve immediately
    await promise1;
    await promise2;
    
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Advance time to allow token refill
    jest.advanceTimersByTime(100);
    
    // Process promise queue (which is waiting on setTimeout)
    await jest.runAllTimersAsync();
    
    // Third should complete after time advance
    const result3 = await promise3;
    
    expect(result3).toBe('success-3');
    expect(fn).toHaveBeenCalledTimes(3);
    
    const metrics = rateLimiter.getMetrics();
    expect(metrics.totalRequests).toBe(3);
    expect(metrics.successfulRequests).toBe(3);
    expect(metrics.queuedRequests).toBe(1);
  });

  test('should reject requests when queue is full', async () => {
    jest.useFakeTimers();
    
    const fn = jest.fn().mockImplementation(async (): Promise<string> => {
      return 'success';
    });
    
    // Fill up the rate limit
    const promise1 = rateLimiter.execute(fn);
    const promise2 = rateLimiter.execute(fn);
    
    // These should queue up to the max queue size of 5
    const queuedPromises: Promise<string>[] = [];
    for (let i = 0; i < 5; i++) {
      queuedPromises.push(rateLimiter.execute(fn));
    }
    
    // This should be rejected as queue is full
    await expect(rateLimiter.execute(fn)).rejects.toThrow('Rate limit exceeded for test-limiter and queue is full');
    
    // Advance time to allow token refill and process queue
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync();
    
    // All queued requests should complete
    await Promise.all([...queuedPromises, promise1, promise2]);
    
    const metrics = rateLimiter.getMetrics();
    expect(metrics.totalRequests).toBe(8); // 2 immediate + 5 queued + 1 rejected
    expect(metrics.successfulRequests).toBe(7);
    expect(metrics.rejectedRequests).toBe(1);
    expect(metrics.queuedRequests).toBe(5);
  });

  test('should timeout requests that stay in queue too long', async () => {
    jest.useFakeTimers();
    
    const slowFn = jest.fn().mockImplementation(async (): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'success';
    });
    
    // Fill up the rate limit with slow functions
    const promise1 = rateLimiter.execute(slowFn);
    const promise2 = rateLimiter.execute(slowFn);
    
    // This should queue
    const queuedPromise = rateLimiter.execute(slowFn);
    
    // Advance time to reach queue timeout but not enough for token refill
    jest.advanceTimersByTime(600);
    await jest.runAllTimersAsync();
    
    // Queued request should timeout
    await expect(queuedPromise).rejects.toThrow('Request timed out after 500ms in queue');
    
    const metrics = rateLimiter.getMetrics();
    expect(metrics.queuedRequests).toBe(1);
  });

  test('reset should clear metrics and refill tokens', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    
    // Use up tokens
    await rateLimiter.execute(fn);
    await rateLimiter.execute(fn);
    
    // Try a third request which should queue
    const queuedPromise = rateLimiter.execute(fn);
    
    // Reset the limiter
    rateLimiter.reset();
    
    // Now we should be able to execute immediately again
    await rateLimiter.execute(fn);
    
    // Cancel the queued promise by disposing
    rateLimiter.dispose();
    
    // Check if metrics were reset
    const metrics = rateLimiter.getMetrics();
    expect(metrics.totalRequests).toBe(1); // Only the one after reset
    expect(metrics.successfulRequests).toBe(1);
    expect(metrics.rejectedRequests).toBe(0);
    expect(metrics.queuedRequests).toBe(0);
  });

  test('should use static getInstance method correctly', async () => {
    const instance1 = RateLimiter.getLimiter('shared-limiter', {
      requestsPerPeriod: 3,
      periodInMs: 100
    });
    
    const instance2 = RateLimiter.getLimiter('shared-limiter');
    
    expect(instance1).toBe(instance2);
    
    const fn = jest.fn().mockResolvedValue('success');
    await instance1.execute(fn);
    
    const metrics = instance2.getMetrics();
    expect(metrics.totalRequests).toBe(1);
    
    instance1.dispose();
  });
}); 