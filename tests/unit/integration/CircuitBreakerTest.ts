import { CircuitBreaker } from '../../../src/core/integration/patterns/CircuitBreaker';
import { EventSystem } from '../../../src/core/events/EventSystem';

describe('CircuitBreaker Pattern', () => {
  let breaker: CircuitBreaker;
  let eventSystem: EventSystem;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    eventSystem = EventSystem.getInstance();
    eventSpy = jest.spyOn(eventSystem, 'emit');
    breaker = new CircuitBreaker('test-breaker', {
      failureThreshold: 3,
      resetTimeout: 200,
      halfOpenTimeout: 100,
      monitorInterval: 0 // disable monitoring interval in tests
    });
  });

  afterEach(() => {
    eventSpy.mockRestore();
    breaker.dispose();
    jest.useRealTimers();
  });

  test('should start in CLOSED state', () => {
    const state = breaker.getState();

    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(0);
    expect(state.lastFailure).toBe(0);
  });

  test('should pass through successful executions in CLOSED state', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await breaker.execute(fn, 'arg1', 'arg2');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');

    const state = breaker.getState();
    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(0);
  });

  test('should count failures without opening when under threshold', async () => {
    const error = new Error('service unavailable');
    const fn = jest.fn().mockRejectedValue(error);

    // Fail twice (threshold is 3)
    await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');
    await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');

    const state = breaker.getState();
    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(2);
  });

  test('should transition to OPEN after reaching failure threshold', async () => {
    const error = new Error('service unavailable');
    const fn = jest.fn().mockRejectedValue(error);

    // Fail three times to reach threshold
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');
    }

    const state = breaker.getState();
    expect(state.status).toBe('OPEN');
    expect(state.failures).toBe(3);

    // Verify state change event was emitted
    expect(eventSpy).toHaveBeenCalledWith('circuit:state_change', expect.objectContaining({
      name: 'test-breaker',
      state: expect.objectContaining({ status: 'OPEN' })
    }));
  });

  test('should emit failure events on each failure', async () => {
    const error = new Error('service unavailable');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');

    expect(eventSpy).toHaveBeenCalledWith('circuit:failure', expect.objectContaining({
      name: 'test-breaker',
      error,
      state: expect.objectContaining({ failures: 1 })
    }));
  });

  test('should reject calls immediately when OPEN', async () => {
    const error = new Error('service unavailable');
    const failFn = jest.fn().mockRejectedValue(error);

    // Trip the breaker
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow('service unavailable');
    }

    expect(breaker.getState().status).toBe('OPEN');

    // New call should be rejected immediately without calling the function
    const successFn = jest.fn().mockResolvedValue('success');
    await expect(breaker.execute(successFn)).rejects.toThrow('Circuit breaker test-breaker is OPEN');

    // The success function should never have been called
    expect(successFn).not.toHaveBeenCalled();
  });

  test('should transition to HALF_OPEN after reset timeout expires', async () => {
    const error = new Error('service unavailable');
    const failFn = jest.fn().mockRejectedValue(error);

    // Trip the breaker
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow('service unavailable');
    }

    expect(breaker.getState().status).toBe('OPEN');

    // Wait for the reset timeout to elapse
    await new Promise(resolve => setTimeout(resolve, 250));

    // Next call should transition to HALF_OPEN and allow through
    const successFn = jest.fn().mockResolvedValue('recovered');
    const result = await breaker.execute(successFn);

    expect(result).toBe('recovered');
    expect(successFn).toHaveBeenCalled();
  });

  test('should recover to CLOSED after successful execution in HALF_OPEN', async () => {
    const error = new Error('service unavailable');
    const failFn = jest.fn().mockRejectedValue(error);

    // Trip the breaker
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow('service unavailable');
    }

    expect(breaker.getState().status).toBe('OPEN');

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 250));

    // Successful call in HALF_OPEN should close the circuit
    const successFn = jest.fn().mockResolvedValue('recovered');
    await breaker.execute(successFn);

    const state = breaker.getState();
    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(0);

    // Verify CLOSED state change event was emitted
    expect(eventSpy).toHaveBeenCalledWith('circuit:state_change', expect.objectContaining({
      name: 'test-breaker',
      state: expect.objectContaining({ status: 'CLOSED' })
    }));
  });

  test('should reset state to initial values', async () => {
    const error = new Error('service unavailable');
    const fn = jest.fn().mockRejectedValue(error);

    // Accumulate some failures
    await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');
    await expect(breaker.execute(fn)).rejects.toThrow('service unavailable');

    expect(breaker.getState().failures).toBe(2);

    // Reset the breaker
    breaker.reset();

    const state = breaker.getState();
    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(0);
    expect(state.lastFailure).toBe(0);

    // Verify state change event was emitted on reset
    expect(eventSpy).toHaveBeenCalledWith('circuit:state_change', expect.objectContaining({
      name: 'test-breaker',
      state: expect.objectContaining({ status: 'CLOSED', failures: 0 })
    }));
  });

  test('should reset failures on successful execution after partial failures', async () => {
    const error = new Error('transient error');
    const failFn = jest.fn().mockRejectedValue(error);
    const successFn = jest.fn().mockResolvedValue('ok');

    // Two failures (under threshold of 3)
    await expect(breaker.execute(failFn)).rejects.toThrow('transient error');
    await expect(breaker.execute(failFn)).rejects.toThrow('transient error');

    expect(breaker.getState().failures).toBe(2);

    // Successful call should reset failure count
    await breaker.execute(successFn);

    const state = breaker.getState();
    expect(state.status).toBe('CLOSED');
    expect(state.failures).toBe(0);
  });

  test('should use static getBreaker for singleton management', () => {
    const instance1 = CircuitBreaker.getBreaker('shared-breaker', {
      failureThreshold: 5,
      resetTimeout: 1000
    });

    const instance2 = CircuitBreaker.getBreaker('shared-breaker');

    expect(instance1).toBe(instance2);

    instance1.dispose();
  });

  test('wrap should return a reusable wrapped function', async () => {
    const fn = jest.fn().mockResolvedValue('wrapped-result');
    const wrappedFn = breaker.wrap(fn);

    const result1 = await wrappedFn('a');
    const result2 = await wrappedFn('b');

    expect(result1).toBe('wrapped-result');
    expect(result2).toBe('wrapped-result');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'a');
    expect(fn).toHaveBeenNthCalledWith(2, 'b');
  });

  test('should track metrics through state transitions', async () => {
    const error = new Error('fail');
    const failFn = jest.fn().mockRejectedValue(error);
    const successFn = jest.fn().mockResolvedValue('ok');

    // Successful call
    await breaker.execute(successFn);
    expect(breaker.getState().failures).toBe(0);

    // Trip the breaker
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow('fail');
    }

    expect(breaker.getState().status).toBe('OPEN');
    expect(breaker.getState().failures).toBe(3);

    // Verify multiple failure events were emitted
    const failureCalls = eventSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'circuit:failure'
    );
    expect(failureCalls.length).toBe(3);
  });
});
