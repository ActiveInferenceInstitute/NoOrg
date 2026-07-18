import { delay, SystemClock } from '../../src/domain/clock';
import { Coordinator } from '../../src/coordination/coordinator';
import { NoOrgError } from '../../src/domain/errors';
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

class FlakyAgent extends AbstractAgent {
  public attempts = 0;

  public constructor() {
    super({ id: 'flaky', name: 'Flaky Agent', capabilities: ['flaky'], maxConcurrentTasks: 1 });
  }

  protected async run(_task: AgentTask): Promise<AgentResult> {
    this.attempts += 1;
    if (this.attempts === 1) throw new NoOrgError('TRANSIENT', 'try again', true);
    return { data: { completed: true }, summary: 'Recovered' };
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
    await coordinator.shutdown();
    await expect(
      coordinator.submitTask({ name: 'closed', description: 'closed', input: null })
    ).rejects.toThrow('must be running');
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

  it('records timeout at the deadline but keeps the reservation until settlement', async () => {
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
    expect(coordinator.getTask(task.id)?.status).toBe('failed');
    expect(coordinator.getTask(task.id)?.error?.code).toBe('TASK_TIMEOUT');
    expect(registry.activeCount()).toBe(1);
    expect(agent.started).toBe(1);
    agent.release();
    await waitFor(() => coordinator.getTask(task.id)?.status === 'failed');
    await coordinator.shutdown();
  });

  it('deduplicates concurrent cancellation requests', async () => {
    const agent = new SettlingAgent();
    const registry = new AgentRegistry();
    registry.register(agent);
    const events = new EventBus();
    let cancellations = 0;
    events.subscribe('task.cancelled', () => {
      cancellations += 1;
    });
    const coordinator = new Coordinator({
      state: new MemoryStateStore(),
      registry,
      provider: new DeterministicProvider(),
      events,
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    });
    await coordinator.start();
    const task = await coordinator.submitTask({
      agentId: 'settling',
      name: 'Cancel twice',
      description: 'Exercise cancellation races',
      input: 'x',
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'running');
    await Promise.all([coordinator.cancelTask(task.id), coordinator.cancelTask(task.id)]);
    expect(coordinator.getTask(task.id)?.status).toBe('cancelled');
    expect(cancellations).toBe(1);
    agent.release();
    await coordinator.shutdown();
  });

  it('retries retryable failures and reports blocked queued tasks', async () => {
    const flaky = new FlakyAgent();
    const registry = new AgentRegistry();
    registry.register(flaky);
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
    const retry = await coordinator.submitTask({
      agentId: 'flaky',
      name: 'Retry',
      description: 'Retry transient error',
      input: 'x',
      maxAttempts: 2,
      retryBackoffMs: 60,
    });
    const blocked = await coordinator.submitTask({
      requiredCapabilities: ['missing'],
      name: 'Blocked',
      description: 'No matching agent',
      input: 'x',
    });
    await waitFor(() => coordinator.getTask(retry.id)?.status === 'completed');
    expect(flaky.attempts).toBe(2);
    expect(coordinator.getHealth()).toEqual(
      expect.objectContaining({ queueDepth: 1, blockedTasks: 1 })
    );
    await coordinator.cancelTask(blocked.id);
    await coordinator.shutdown();
  });

  it('waits for dependencies and fails descendants when a dependency is cancelled', async () => {
    const slow = new SlowAgent();
    const registry = new AgentRegistry();
    registry.register(slow);
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
      maxConcurrentTasks: 2,
      defaultTaskTimeoutMs: 2000,
    });
    await coordinator.start();
    const parent = await coordinator.submitTask({
      agentId: 'slow',
      name: 'Parent',
      description: 'Parent dependency',
      input: 'x',
    });
    const child = await coordinator.submitTask({
      agentId: 'analysis',
      name: 'Child',
      description: 'Wait for parent',
      input: 'x',
      dependencyIds: [parent.id],
    });
    await waitFor(() => coordinator.getTask(parent.id)?.status === 'running');
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(coordinator.getTask(child.id)?.status).toBe('queued');
    await coordinator.cancelTask(parent.id);
    await waitFor(() => coordinator.getTask(child.id)?.status === 'failed');
    expect(coordinator.getTask(child.id)?.error?.code).toBe('TASK_DEPENDENCY_FAILED');
    await coordinator.shutdown();
  });

  it('enforces a parent completion policy before launching a child', async () => {
    const slow = new SlowAgent();
    const registry = new AgentRegistry();
    registry.register(slow);
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
      maxConcurrentTasks: 2,
      defaultTaskTimeoutMs: 2000,
    });
    await coordinator.start();
    const parent = await coordinator.submitTask({
      agentId: 'slow',
      name: 'Policy parent',
      description: 'Parent policy task',
      input: 'x',
    });
    const child = await coordinator.submitTask({
      agentId: 'analysis',
      name: 'Policy child',
      description: 'Wait for parent success',
      input: 'x',
      parentTaskId: parent.id,
      parentCompletionPolicy: 'wait_for_success',
    });
    await waitFor(() => coordinator.getTask(parent.id)?.status === 'running');
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(coordinator.getTask(child.id)?.status).toBe('queued');
    await coordinator.cancelTask(parent.id);
    await waitFor(() => coordinator.getTask(child.id)?.status === 'failed');
    expect(coordinator.getTask(child.id)?.error?.code).toBe('TASK_PARENT_FAILED');
    await coordinator.shutdown();
  });

  it('expires queued work at its deadline before claiming an agent lease', async () => {
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
    const task = await coordinator.submitTask({
      name: 'Deadline',
      description: 'Expire before matching work',
      input: 'x',
      requiredCapabilities: ['missing'],
      deadlineAt: new Date(Date.now() + 40).toISOString(),
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'failed');
    expect(coordinator.getTask(task.id)?.error?.code).toBe('TASK_DEADLINE_EXCEEDED');
    await coordinator.shutdown();
  });

  it('reports a bounded shutdown when an agent ignores cancellation', async () => {
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
      defaultTaskTimeoutMs: 1000,
      shutdownTimeoutMs: 25,
    });
    await coordinator.start();
    const task = await coordinator.submitTask({
      agentId: 'settling',
      name: 'Shutdown deadline',
      description: 'Ignore cancellation temporarily',
      input: 'x',
    });
    await waitFor(() => coordinator.getTask(task.id)?.status === 'running');
    await expect(coordinator.shutdown()).rejects.toThrow('deadline');
    expect(coordinator.getStatus()).toBe('stopped');
    agent.release();
  });
});
