import { createHttpServer } from '../../src/http/server';
import { Coordinator } from '../../src/coordination/coordinator';
import { EventBus } from '../../src/events/event-bus';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { DeterministicProvider } from '../../src/providers/provider';
import { AgentRegistry } from '../../src/agents/registry';
import { MemoryStateStore } from '../../src/state/state-store';
import { SystemClock } from '../../src/domain/clock';
import { AnalysisAgent } from '../../src/agents/builtins';

describe('HTTP health surface', () => {
  it('reports health, readiness, and metrics from live runtime state', async () => {
    const registry = new AgentRegistry();
    registry.register(new AnalysisAgent());
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry,
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 10,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    });
    await coordinator.start();
    const server = createHttpServer({ coordinator, metricsEnabled: true });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Test server did not bind to a port');
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(`${base}/health`);
    const ready = await fetch(`${base}/ready`);
    const metrics = await fetch(`${base}/metrics`);
    expect(health.status).toBe(200);
    expect(((await ready.json()) as { ready: boolean }).ready).toBe(true);
    expect(metrics.status).toBe(200);
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
    await coordinator.shutdown();
  });

  it('exposes authenticated task lifecycle endpoints with structured errors', async () => {
    const registry = new AgentRegistry();
    registry.register(new AnalysisAgent());
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry,
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    });
    await coordinator.start();
    const server = createHttpServer({ coordinator, metricsEnabled: true, authToken: 'secret' });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind');
    const base = `http://127.0.0.1:${address.port}`;
    const unauthorized = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Denied', description: 'Denied', input: 'x' }),
    });
    expect(unauthorized.status).toBe(401);

    const createdResponse = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret',
        'content-type': 'application/json',
        'x-request-id': 'http-test',
      },
      body: JSON.stringify({
        name: 'API task',
        description: 'Exercise the task API',
        agentId: 'analysis',
        requiredCapabilities: ['unavailable-for-test'],
        input: 'A short sentence.',
        idempotencyKey: 'api-task-1',
      }),
    });
    expect(createdResponse.status).toBe(202);
    expect(createdResponse.headers.get('x-request-id')).toBe('http-test');
    const created = (await createdResponse.json()) as { id: string };

    const detailResponse = await fetch(`${base}/v1/tasks/${created.id}`, {
      headers: { authorization: 'Bearer secret', 'x-request-id': 'invalid id' },
    });
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    const cancelledResponse = await fetch(`${base}/v1/tasks/${created.id}/cancel`, {
      method: 'POST',
      headers: { authorization: 'Bearer secret' },
    });
    expect(cancelledResponse.status).toBe(200);
    const conflictResponse = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'API task changed',
        description: 'Conflicting reuse',
        input: 'different',
        idempotencyKey: 'api-task-1',
      }),
    });
    expect(conflictResponse.status).toBe(409);
    const missingParentResponse = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Missing parent',
        description: 'Parent lookup',
        input: null,
        parentTaskId: '00000000-0000-4000-8000-000000000099',
      }),
    });
    expect(missingParentResponse.status).toBe(404);

    const listResponse = await fetch(`${base}/v1/tasks`, {
      headers: { authorization: 'Bearer secret' },
    });
    expect(listResponse.status).toBe(200);
    expect((await listResponse.json()) as unknown[]).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id })])
    );
    const filtered = await fetch(
      `${base}/v1/tasks?agentId=analysis&idempotencyKey=api-task-1&limit=1`,
      { headers: { authorization: 'Bearer secret' } }
    );
    expect(filtered.status).toBe(200);
    expect((await filtered.json()) as unknown[]).toEqual([
      expect.objectContaining({ id: created.id }),
    ]);

    const invalidResponse = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
      body: '{bad-json',
    });
    expect(invalidResponse.status).toBe(400);
    expect(((await invalidResponse.json()) as { error: { code: string } }).error.code).toBe(
      'INVALID_JSON'
    );
    const invalidSchemaResponse = await fetch(`${base}/v1/tasks`, {
      method: 'POST',
      headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
      body: JSON.stringify({ name: '', description: 'invalid', input: null }),
    });
    expect(invalidSchemaResponse.status).toBe(400);
    expect(((await invalidSchemaResponse.json()) as { error: { code: string } }).error.code).toBe(
      'INVALID_REQUEST'
    );

    const metricsUnauthorized = await fetch(`${base}/metrics`);
    expect(metricsUnauthorized.status).toBe(401);
    const metrics = await fetch(`${base}/metrics`, {
      headers: { authorization: 'Bearer secret' },
    });
    expect(metrics.status).toBe(200);
    expect(await metrics.text()).toContain('# TYPE noorg_tasks_submitted counter');

    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
    await coordinator.shutdown();
  });

  it('maps readiness, routing, media, and body-limit failures', async () => {
    const registry = new AgentRegistry();
    registry.register(new AnalysisAgent());
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry,
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    });
    const server = createHttpServer({ coordinator, metricsEnabled: false, maxBodyBytes: 128 });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind');
    const base = `http://127.0.0.1:${address.port}`;
    expect((await fetch(`${base}/health`)).status).toBe(200);
    expect(((await (await fetch(`${base}/ready`)).json()) as { ready: boolean }).ready).toBe(false);
    expect((await fetch(`${base}/metrics`)).status).toBe(404);
    expect((await fetch(`${base}/v1/tasks/00000000-0000-4000-8000-000000000001`)).status).toBe(404);
    expect(
      (
        await fetch(`${base}/v1/tasks/00000000-0000-4000-8000-000000000001/cancel`, {
          method: 'POST',
        })
      ).status
    ).toBe(404);
    expect((await fetch(`${base}/v1/tasks?status=unknown`)).status).toBe(400);
    expect(
      (
        await fetch(`${base}/v1/tasks`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'Not started', description: 'Unavailable', input: null }),
        })
      ).status
    ).toBe(503);
    expect(
      (
        await fetch(`${base}/v1/tasks`, {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          body: 'not-json',
        })
      ).status
    ).toBe(415);
    expect(
      (
        await fetch(`${base}/v1/tasks`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: 'too large body',
            description: 'x'.repeat(256),
            input: 'x',
          }),
        })
      ).status
    ).toBe(413);
    expect((await fetch(`${base}/unknown`)).status).toBe(404);
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
    await coordinator.shutdown();
  });
});
