import { delay, SystemClock } from '../../src/domain/clock';
import { Coordinator } from '../../src/coordination/coordinator';
import { EventBus } from '../../src/events/event-bus';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { DeterministicProvider } from '../../src/providers/provider';
import { AgentRegistry } from '../../src/agents/registry';
import { AnalysisAgent, DataAnalysisAgent } from '../../src/agents/builtins';
import { AbstractAgent } from '../../src/agents/abstract-agent';
import type { AgentResult, AgentTask } from '../../src/domain/types';
import { MemoryStateStore } from '../../src/state/state-store';

async function waitFor(condition: () => boolean, timeoutMs = 2000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Condition did not become true');
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

class SlowAgent extends AbstractAgent {
  public constructor() {
    super({ id: 'slow', name: 'Slow Agent', capabilities: ['slow'], maxConcurrentTasks: 1 });
  }

  protected async run(_task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    await delay(1000, signal);
    return { data: { completed: true }, summary: 'Completed' };
  }
}

class SettlingAgent extends AbstractAgent {
  public release!: () => void;
  public started = 0;

  public constructor() {
    super({
      id: 'settling',
      name: 'Settling Agent',
      capabilities: ['settling'],
      maxConcurrentTasks: 1,
    });
  }

  protected run(_task: AgentTask, _signal: AbortSignal): Promise<AgentResult> {
    this.started += 1;
    return new Promise(resolve => {
      this.release = () => resolve({ data: { completed: true }, summary: 'Settled' });
    });
  }
}

describe('Coordinator', () => {
  it('executes a real registered agent and persists the result', async () => {
    const state = new MemoryStateStore();
    const registry = new AgentRegistry();
    registry.register(new AnalysisAgent());
    registry.register(new DataAnalysisAgent());
    const coordinator = new Coordinator({
      state,
      registry,
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 2,
      defaultTaskTimeoutMs: 1000,
    });
    await coordinator.start();
    const task = await coordinator.submitTask({
      name: 'Analyze text',
      description: 'Count words',
      agentId: 'analysis',
      input: 'A short sentence.',
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'completed');
    const completed = coordinator.getTask(task.id);
    expect(completed?.result?.data).toEqual(expect.objectContaining({ wordCount: 2 }));
    expect(coordinator.getMetrics().renderPrometheus()).toContain('noorg_tasks_completed 1');
    await coordinator.shutdown();
    expect(coordinator.getStatus()).toBe('stopped');
  });

  it('rejects submission before startup', async () => {
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
    await expect(
      coordinator.submitTask({ name: 'Not ready', description: 'Should fail', input: 'x' })
    ).rejects.toThrow('must be running');
  });

  it('cancels running work and releases the agent lease', async () => {
    const registry = new AgentRegistry();
    registry.register(new SlowAgent());
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
      defaultTaskTimeoutMs: 2000,
    });
    await coordinator.start();
    const task = await coordinator.submitTask({
      agentId: 'slow',
      name: 'Cancel me',
      description: 'Cancel running work',
      input: 'x',
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'running');
    await coordinator.cancelTask(task.id);
    await waitFor(() => coordinator.getTask(task.id)?.status === 'cancelled');
    await coordinator.shutdown();
    expect(coordinator.getMetrics().renderPrometheus()).toContain('noorg_tasks_cancelled 1');
  });

  it('keeps a timed-out reservation until the agent promise settles', async () => {
    const agent = new SettlingAgent();
    const registry = new AgentRegistry();
    registry.register(agent);
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
      defaultTaskTimeoutMs: 100,
    });
    await coordinator.start();
    const task = await coordinator.submitTask({
      agentId: 'settling',
      name: 'Timeout me',
      description: 'Wait for promise settlement',
      input: 'x',
      timeoutMs: 100,
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'running');
    await new Promise(resolve => setTimeout(resolve, 140));
    expect(coordinator.getTask(task.id)?.status).toBe('running');
    expect(registry.activeCount()).toBe(1);
    expect(agent.started).toBe(1);
    agent.release();
    await waitFor(() => coordinator.getTask(task.id)?.status === 'failed');
    await coordinator.shutdown();
  });
});
