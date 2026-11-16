import { once } from 'node:events';
import { z } from 'zod';
import { AgentRegistry } from '../../src/agents/registry';
import { Coordinator } from '../../src/coordination/coordinator';
import { SystemClock } from '../../src/domain/clock';
import { taskRecordSchema } from '../../src/domain/types';
import { EventBus } from '../../src/events/event-bus';
import { createHttpServer } from '../../src/http/server';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { DeterministicProvider } from '../../src/providers/provider';
import { MemoryStateStore } from '../../src/state/state-store';

const errorSchema = z.object({
  error: z.object({ code: z.string(), requestId: z.string().min(1) }),
});

describe('HTTP authentication and workflow boundaries', () => {
  it('returns structured 401/429 rather than 500 for equal-character unequal-byte bearer tokens', async () => {
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry: new AgentRegistry(),
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    });
    const server = createHttpServer({
      coordinator,
      metricsEnabled: false,
      authToken: 'x',
      authFailureThreshold: 2,
    });
    const listening = once(server, 'listening');
    server.listen(0, '127.0.0.1');
    try {
      await listening;
      const address = server.address();
      if (address === null || typeof address === 'string')
        throw new Error('HTTP fixture did not bind');
      const url = `http://127.0.0.1:${address.port}/v1/tasks`;
      const first = await fetch(url, { headers: { authorization: 'Bearer é' } });
      expect(first.status).toBe(401);
      expect(errorSchema.parse(await first.json()).error.code).toBe('UNAUTHORIZED');
      const second = await fetch(url, { headers: { authorization: 'Bearer é' } });
      expect(second.status).toBe(429);
      expect(errorSchema.parse(await second.json()).error.code).toBe('AUTH_RATE_LIMITED');
      const authorized = await fetch(url, { headers: { authorization: 'Bearer x' } });
      expect(authorized.status).toBe(200);
      expect(z.array(taskRecordSchema).parse(await authorized.json())).toEqual([]);
    } finally {
      if (server.listening) {
        const closed = once(server, 'close');
        server.close();
        await closed;
      }
      await coordinator.shutdown();
    }
  });

  it('accepts at-limit workflows, rejects breadth/depth as 400, and preserves 409 and the public page cap', async () => {
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry: new AgentRegistry(),
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
      maxWorkflowDepth: 2,
      maxWorkflowChildren: 1,
    });
    const server = createHttpServer({ coordinator, metricsEnabled: false });
    await coordinator.start();
    const listening = once(server, 'listening');
    server.listen(0, '127.0.0.1');
    try {
      await listening;
      const address = server.address();
      if (address === null || typeof address === 'string')
        throw new Error('HTTP fixture did not bind');
      const base = `http://127.0.0.1:${address.port}/v1/tasks`;
      const rootRequest = {
        name: 'Root',
        description: 'Blocked workflow root',
        input: 'x',
        idempotencyKey: 'http-root',
        requiredCapabilities: ['unavailable'],
      };
      const headers = { 'content-type': 'application/json' };
      const rootResponse = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify(rootRequest),
      });
      expect(rootResponse.status).toBe(202);
      const root = taskRecordSchema.parse(await rootResponse.json());
      const childResponse = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...rootRequest,
          idempotencyKey: 'http-child',
          parentTaskId: root.id,
        }),
      });
      expect(childResponse.status).toBe(202);
      let leaf = taskRecordSchema.parse(await childResponse.json());
      const broad = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...rootRequest,
          idempotencyKey: 'http-sibling',
          parentTaskId: root.id,
        }),
      });
      expect(broad.status).toBe(400);
      expect(errorSchema.parse(await broad.json()).error.code).toBe(
        'TASK_WORKFLOW_BREADTH_EXCEEDED'
      );
      while (leaf.workflowDepth < 2) {
        const next = await fetch(base, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...rootRequest,
            idempotencyKey: `depth-${leaf.id}`,
            parentTaskId: leaf.id,
          }),
        });
        expect(next.status).toBe(202);
        leaf = taskRecordSchema.parse(await next.json());
      }
      expect(leaf.workflowDepth).toBe(2);
      const before = coordinator.listTasks().map(task => task.id);
      const deep = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...rootRequest, idempotencyKey: 'too-deep', parentTaskId: leaf.id }),
      });
      expect(deep.status).toBe(400);
      expect(errorSchema.parse(await deep.json()).error.code).toBe('TASK_WORKFLOW_DEPTH_EXCEEDED');
      expect(coordinator.listTasks().map(task => task.id)).toEqual(before);
      const conflict = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...rootRequest, input: 'changed' }),
      });
      expect(conflict.status).toBe(409);
      expect(errorSchema.parse(await conflict.json()).error.code).toBe('IDEMPOTENCY_CONFLICT');
      const tooLarge = await fetch(`${base}?limit=101`);
      expect(tooLarge.status).toBe(400);
      for (let index = 0; index < 105; index += 1) {
        await coordinator.submitTask({
          name: `Public page ${index}`,
          description: 'Keep public bounds',
          input: 'x',
          requiredCapabilities: ['unavailable'],
        });
      }
      const publicPage = await fetch(base);
      expect(z.array(taskRecordSchema).parse(await publicPage.json())).toHaveLength(100);
      const tail = await fetch(`${base}?offset=100&limit=100`);
      expect(
        z
          .array(taskRecordSchema)
          .parse(await tail.json())
          .map(task => task.id)
      ).toEqual(coordinator.listTasks(undefined, { offset: 100, limit: 100 }).map(task => task.id));
      expect(coordinator.getHealth().queueDepth).toBe(before.length + 105);
    } finally {
      if (server.listening) {
        const closed = once(server, 'close');
        server.close();
        await closed;
      }
      await coordinator.shutdown();
    }
  });
});
