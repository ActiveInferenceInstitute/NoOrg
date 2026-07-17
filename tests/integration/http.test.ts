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
});
