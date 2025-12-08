"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Retry_1 = require("../../../src/core/integration/patterns/Retry");
const EventSystem_1 = require("../../../src/core/events/EventSystem");
describe('Retry Pattern', () => {
    let retry;
    let eventSystem;
    let eventSpy;
    beforeEach(() => {
        eventSystem = EventSystem_1.EventSystem.getInstance();
        eventSpy = jest.spyOn(eventSystem, 'emit');
        retry = new Retry_1.Retry('test-retry', {
            maxAttempts: 3,
            initialDelay: 10,
            backoffFactor: 2
        });
    });
    afterEach(() => {
        eventSpy.mockRestore();
        retry.dispose();
    });
    test('should successfully execute function on first attempt', async () => {
        const fn = jest.fn().mockResolvedValue('success');
        const result = await retry.execute(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
        const metrics = retry.getMetrics();
        expect(metrics.attempts).toBe(1);
        expect(metrics.successes).toBe(1);
        expect(metrics.failures).toBe(0);
    });
    test('should retry failed functions up to max attempts', async () => {
        const error = new Error('test error');
        const fn = jest.fn()
            .mockRejectedValueOnce(error)
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce('success');
        const result = await retry.execute(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
        const metrics = retry.getMetrics();
        expect(metrics.attempts).toBe(3);
        expect(metrics.successes).toBe(1);
        expect(metrics.failures).toBe(0);
        // Check events
        expect(eventSpy).toHaveBeenCalledWith('retry:attempt', expect.objectContaining({
            name: 'test-retry',
            error,
            attempt: 1
        }));
    });
    test('should throw error after max attempts', async () => {
        const error = new Error('persistent error');
        const fn = jest.fn().mockRejectedValue(error);
        await expect(retry.execute(fn)).rejects.toThrow('persistent error');
        expect(fn).toHaveBeenCalledTimes(3);
        const metrics = retry.getMetrics();
        expect(metrics.attempts).toBe(3);
        expect(metrics.successes).toBe(0);
        expect(metrics.failures).toBe(1);
        // Check failure event
        expect(eventSpy).toHaveBeenCalledWith('retry:failure', expect.objectContaining({
            name: 'test-retry',
            error
        }));
    });
    test('should respect retryable errors list', async () => {
        const retryableError = new Error('network error');
        const nonRetryableError = new Error('validation error');
        const retryWithFilters = new Retry_1.Retry('test-retry-filters', {
            maxAttempts: 3,
            initialDelay: 10,
            retryableErrors: ['network error']
        });
        const fnWithRetryable = jest.fn()
            .mockRejectedValueOnce(retryableError)
            .mockResolvedValueOnce('success');
        const fnWithNonRetryable = jest.fn()
            .mockRejectedValueOnce(nonRetryableError);
        // Should retry and succeed
        const result = await retryWithFilters.execute(fnWithRetryable);
        expect(result).toBe('success');
        expect(fnWithRetryable).toHaveBeenCalledTimes(2);
        // Should not retry and fail immediately
        await expect(retryWithFilters.execute(fnWithNonRetryable)).rejects.toThrow('validation error');
        expect(fnWithNonRetryable).toHaveBeenCalledTimes(1);
        retryWithFilters.dispose();
    });
    test('reset should clear metrics', async () => {
        const fn = jest.fn().mockResolvedValue('success');
        await retry.execute(fn);
        let metrics = retry.getMetrics();
        expect(metrics.attempts).toBe(1);
        retry.reset();
        metrics = retry.getMetrics();
        expect(metrics.attempts).toBe(0);
        expect(metrics.successes).toBe(0);
        expect(metrics.failures).toBe(0);
    });
    test('should use static getInstance method correctly', async () => {
        const instance1 = Retry_1.Retry.getRetrier('shared-retry');
        const instance2 = Retry_1.Retry.getRetrier('shared-retry');
        expect(instance1).toBe(instance2);
        const fn = jest.fn().mockResolvedValue('success');
        await instance1.execute(fn);
        const metrics = instance2.getMetrics();
        expect(metrics.attempts).toBe(1);
        instance1.dispose();
    });
});
//# sourceMappingURL=RetryTest.js.map