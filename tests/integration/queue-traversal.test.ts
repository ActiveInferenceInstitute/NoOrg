/// <reference lib="es2024.promise" />
import { AbstractAgent } from '../../src/agents/abstract-agent';
import { AnalysisAgent } from '../../src/agents/builtins';
import { AgentRegistry } from '../../src/agents/registry';
import { Coordinator } from '../../src/coordination/coordinator';
import { delay } from '../../src/domain/clock';
import type { AgentResult, AgentTask } from '../../src/domain/types';
import { EventBus } from '../../src/events/event-bus';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { DeterministicProvider } from '../../src/providers/provider';
import { MemoryStateStore } from '../../src/state/state-store';
import { TaskRepository } from '../../src/tasks/task-repository';

class HoldingAgent extends AbstractAgent {
  public started = 0;
  private readonly settlement = Promise.withResolvers<AgentResult>();
  public constructor() {
    super({ id: 'holding', name: 'Holding', capabilities: ['holding'], maxConcurrentTasks: 1 });
  }
  public release(): void {
    this.settlement.resolve({ data: { done: true }, summary: 'Released' });
  }
  protected override async run(_task: AgentTask): Promise<AgentResult> {
    this.started += 1;
    return this.settlement.promise;
  }
}

async function waitFor(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 3000;
  while (!condition()) {
    if (Date.now() >= deadline) throw new Error('Queue condition did not become true');
    await delay(5);
  }
}

const base = {
  name: 'Queue fixture',
  description: 'Exercise complete internal traversal',
  input: 'A complete paragraph for local analysis.',
};

describe('Complete internal queue traversal', () => {
  it.each(['capability', 'capacity', 'backoff', 'workflow'] as const)(
    'dispatches runnable work beyond 101 higher-priority %s blockers and reports full counts',
    async kind => {
      const now = Date.now();
      const clock = { now: () => new Date(now) };
      const state = new MemoryStateStore();
      const repository = new TaskRepository(state, clock);
      const registry = new AgentRegistry();
      const holding = new HoldingAgent();
      registry.register(holding);
      registry.register(new AnalysisAgent());
      await repository.load();
      const parent =
        kind === 'workflow'
          ? await repository.create({ ...base, priority: 100, requiredCapabilities: ['missing'] })
          : undefined;
      for (let index = 0; index < 101; index += 1) {
        if (kind === 'backoff') {
          const task = await repository.create({
            ...base,
            agentId: 'analysis',
            priority: 100,
            maxAttempts: 2,
            retryBackoffMs: 60_000,
          });
          await repository.start(task.id, 'analysis');
          await repository.fail(task.id, {
            code: 'TRANSIENT',
            message: 'Wait for retry',
            retryable: true,
          });
        } else {
          await repository.create({
            ...base,
            priority: 100,
            ...(kind === 'capability'
              ? { requiredCapabilities: ['missing'] }
              : { agentId: kind === 'capacity' ? 'holding' : 'analysis' }),
            ...(parent === undefined ? {} : { dependencyIds: [parent.id] }),
          });
        }
      }
      const runnable = await repository.create({ ...base, priority: 1, agentId: 'analysis' });
      const coordinator = new Coordinator({
        state,
        repository,
        registry,
        clock,
        provider: new DeterministicProvider(),
        events: new EventBus(),
        metrics: new Metrics(),
        logger: new MemoryLogger(),
        pollIntervalMs: 5,
        maxConcurrentTasks: 2,
        defaultTaskTimeoutMs: 10_000,
      });
      try {
        await coordinator.start();
        await waitFor(() => coordinator.getTask(runnable.id)?.status === 'completed');
        const expected = kind === 'workflow' ? 102 : kind === 'capacity' ? 100 : 101;
        expect(coordinator.getHealth()).toEqual(
          expect.objectContaining({ queueDepth: expected, blockedTasks: expected })
        );
        expect(coordinator.listTasks('queued')).toHaveLength(100);
        expect(coordinator.getMetrics().renderPrometheus().split('\n')).toContain(
          `noorg_queue_depth ${expected}`
        );
        if (kind === 'capacity') {
          expect(holding.started).toBe(1);
          expect(coordinator.getHealth().blockedCapacityTasks).toBe(100);
        }
        if (kind === 'capability') expect(coordinator.getHealth().blockedCapabilityTasks).toBe(101);
      } finally {
        holding.release();
        await coordinator.shutdown();
      }
    }
  );

  it('processes beyond-page deadlines and failed relationships even while global execution capacity is occupied', async () => {
    let now = Date.now();
    const clock = { now: () => new Date(now) };
    const state = new MemoryStateStore();
    const repository = new TaskRepository(state, clock);
    const registry = new AgentRegistry();
    const holding = new HoldingAgent();
    registry.register(holding);
    registry.register(new AnalysisAgent());
    await repository.load();
    const occupied = await repository.create({ ...base, priority: 100, agentId: 'holding' });
    for (let index = 0; index < 101; index += 1)
      await repository.create({ ...base, priority: 99, requiredCapabilities: ['missing'] });
    const parent = await repository.create({ ...base, requiredCapabilities: ['missing'] });
    await repository.cancel(parent.id);
    const expired = await repository.create({
      ...base,
      priority: 1,
      deadlineAt: new Date(now + 1000).toISOString(),
      requiredCapabilities: ['missing'],
    });
    const dependency = await repository.create({
      ...base,
      priority: 1,
      agentId: 'analysis',
      dependencyIds: [parent.id],
    });
    const child = await repository.create({
      ...base,
      priority: 1,
      agentId: 'analysis',
      parentTaskId: parent.id,
      parentCompletionPolicy: 'wait_for_success',
    });
    const runnable = await repository.create({ ...base, priority: 0, agentId: 'analysis' });
    now += 2000;
    const coordinator = new Coordinator({
      state,
      repository,
      registry,
      clock,
      provider: new DeterministicProvider(),
      events: new EventBus(),
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 10_000,
    });
    try {
      await coordinator.start();
      await waitFor(() => coordinator.getTask(occupied.id)?.status === 'running');
      await waitFor(() =>
        [expired.id, dependency.id, child.id].every(
          id => coordinator.getTask(id)?.status === 'failed'
        )
      );
      expect(registry.activeCount()).toBe(1);
      expect(holding.started).toBe(1);
      expect(coordinator.getTask(expired.id)?.error?.code).toBe('TASK_DEADLINE_EXCEEDED');
      expect(coordinator.getTask(dependency.id)?.error?.code).toBe('TASK_DEPENDENCY_FAILED');
      expect(coordinator.getTask(child.id)?.error?.code).toBe('TASK_PARENT_FAILED');
      expect(coordinator.getTask(runnable.id)?.status).toBe('queued');
      holding.release();
      await waitFor(() => coordinator.getTask(runnable.id)?.status === 'completed');
      expect(coordinator.getHealth().queueDepth).toBe(101);
    } finally {
      holding.release();
      await coordinator.shutdown();
    }
  });
});
