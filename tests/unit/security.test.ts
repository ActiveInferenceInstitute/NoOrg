import { redactJsonValue, redactText } from '../../src/domain/redaction';
import { delay } from '../../src/domain/clock';
import { NoOrgError, toTaskError } from '../../src/domain/errors';
import { consoleLogger, MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { isBearerAuthorized, AuthThrottle } from '../../src/http/server';

describe('runtime safety helpers', () => {
  it('redacts sensitive keys and credential-like text', () => {
    expect(redactJsonValue({ apiKey: 'secret', nested: 'token=hidden', safe: 'visible' })).toEqual({
      apiKey: '[REDACTED]',
      nested: 'token=[REDACTED]',
      safe: 'visible',
    });
    expect(redactText('Authorization: Bearer top-secret')).toBe('Authorization: Bearer [REDACTED]');
    const logger = new MemoryLogger();
    logger.error('provider failed', { authorization: 'Bearer secret', safe: 'visible' });
    expect(logger.entries[0]).toEqual(
      expect.objectContaining({ fields: { authorization: '[REDACTED]', safe: 'visible' } })
    );
  });

  it('renders typed Prometheus metrics', () => {
    const metrics = new Metrics();
    metrics.observe('ignored_nan', Number.NaN);
    metrics.observe('ignored_negative', -1);
    for (let index = 0; index <= 1000; index += 1) metrics.observe('bounded_duration', index);
    metrics.increment('tasks_completed');
    metrics.setGauge('queue_depth', 2);
    metrics.observe('task_duration_ms', 12);
    const output = metrics.renderPrometheus();
    expect(output).toContain('# TYPE noorg_tasks_completed counter');
    expect(output).toContain('# TYPE noorg_queue_depth gauge');
    expect(output).toContain('# TYPE noorg_task_duration_ms summary');
    expect(output).toContain('noorg_task_duration_ms_count 1');
  });

  it('covers structured error normalization and abortable delays', async () => {
    expect(toTaskError(new NoOrgError('KNOWN', 'token=secret', true))).toEqual(
      expect.objectContaining({ code: 'KNOWN', message: 'token=[REDACTED]', retryable: true })
    );
    expect(toTaskError(new NoOrgError('DETAILS', 'failed', false, { token: 'secret' }))).toEqual(
      expect.objectContaining({ details: { token: '[REDACTED]' } })
    );
    expect(toTaskError(new Error('plain failure'))).toEqual(
      expect.objectContaining({ code: 'TASK_EXECUTION_FAILED', message: 'plain failure' })
    );
    expect(toTaskError('unknown')).toEqual(
      expect.objectContaining({ code: 'TASK_EXECUTION_FAILED', message: 'unknown' })
    );
    const controller = new AbortController();
    controller.abort();
    await expect(delay(20, controller.signal)).rejects.toThrow('aborted');
    await delay(0);
    await delay(1, new AbortController().signal);
  });

  it('authorizes bearer tokens with constant-time comparison', () => {
    expect(isBearerAuthorized('Bearer secret', 'secret')).toBe(true);
    expect(isBearerAuthorized(undefined, 'secret')).toBe(false);
    expect(isBearerAuthorized('Bearer wrong', 'secret')).toBe(false);
    expect(isBearerAuthorized('Bearer secret', 'different')).toBe(false);
    expect(isBearerAuthorized('Bearer secret extra', 'secret')).toBe(false);
    expect(isBearerAuthorized('bearer secret', 'secret')).toBe(false);
  });

  it('limits repeated authentication failures and resets after the window', () => {
    let now = 0;
    const throttle = new AuthThrottle(2, 1000, () => now);
    expect(throttle.record('1.2.3.4')).toBe(false);
    expect(throttle.record('1.2.3.4')).toBe(true);
    expect(throttle.isLimited('1.2.3.4')).toBe(true);
    expect(throttle.record('5.6.7.8')).toBe(false);
    expect(throttle.isLimited('5.6.7.8')).toBe(false);
    now = 1500;
    expect(throttle.isLimited('1.2.3.4')).toBe(false);
    expect(throttle.record('1.2.3.4')).toBe(false);
    expect(throttle.record('5.6.7.8')).toBe(false);
    expect(throttle.record('5.6.7.8')).toBe(true);
    throttle.reset('5.6.7.8');
    expect(throttle.isLimited('5.6.7.8')).toBe(false);
    expect(throttle.record('5.6.7.8')).toBe(false);
  });

  it('rejects invalid auth throttle limits', () => {
    expect(() => new AuthThrottle(0, 1000)).toThrow('auth limits');
    expect(() => new AuthThrottle(2, 0)).toThrow('auth limits');
  });

  it('routes console logger levels through redaction', () => {
    const original = {
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
    const calls = { info: [] as unknown[][], warn: [] as unknown[][], error: [] as unknown[][] };
    Object.defineProperties(console, {
      info: { configurable: true, value: (...args: unknown[]) => calls.info.push(args) },
      warn: { configurable: true, value: (...args: unknown[]) => calls.warn.push(args) },
      error: { configurable: true, value: (...args: unknown[]) => calls.error.push(args) },
    });
    try {
      consoleLogger.info('info', { token: 'secret' });
      consoleLogger.warn('warn');
      consoleLogger.error('error');
      expect(calls.info[0]?.[0]).toEqual(expect.stringContaining('[REDACTED]'));
      expect(calls.warn).toHaveLength(1);
      expect(calls.error).toHaveLength(1);
    } finally {
      Object.defineProperties(console, {
        info: { configurable: true, value: original.info },
        warn: { configurable: true, value: original.warn },
        error: { configurable: true, value: original.error },
      });
    }
  });
});
