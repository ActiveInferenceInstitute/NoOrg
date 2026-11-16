import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { AbstractAgent } from '../../src/agents/abstract-agent';
import { AgentRegistry } from '../../src/agents/registry';
import { Coordinator } from '../../src/coordination/coordinator';
import { delay, SystemClock } from '../../src/domain/clock';
import { NoOrgError } from '../../src/domain/errors';
import {
  runtimeStateSchema,
  type AgentResult,
  type AgentTask,
  type TaskRecord,
} from '../../src/domain/types';
import { EventBus } from '../../src/events/event-bus';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { GovernedProvider } from '../../src/providers/governed-provider';
import {
  DeterministicProvider,
  OpenAIProvider,
  type LLMProvider,
} from '../../src/providers/provider';
import { FileStateStore } from '../../src/state/state-store';
import { TaskRepository } from '../../src/tasks/task-repository';
import { StateBoundary } from '../fixtures/state-boundary';

class EffectAgent extends AbstractAgent {
  public effects = 0;
  public constructor() {
    super({ id: 'effect', name: 'Effect', capabilities: ['effect'], maxConcurrentTasks: 1 });
  }
  protected override async run(_task: AgentTask): Promise<AgentResult> {
    this.effects += 1;
    return { data: { executed: true }, summary: 'Executed' };
  }
}

class CommitAgent extends AbstractAgent {
  public effects = 0;
  public signal: AbortSignal | undefined;

  public constructor(
    private readonly outcome: 'resolve' | 'reject',
    private readonly beforeSettlement: () => void
  ) {
    super({ id: 'effect', name: 'Effect', capabilities: ['effect'], maxConcurrentTasks: 1 });
  }

  protected override async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    this.effects += 1;
    this.signal = signal;
    const data = await this.ask(
      { operation: 'effect', input: null },
      z.object({ executed: z.boolean() }),
      signal,
      task.id
    );
    this.beforeSettlement();
    if (this.outcome === 'reject')
      throw new NoOrgError(
        'EXECUTION_REJECTED',
        'Agent execution rejected before its deadline',
        false
      );
    return { data, summary: 'Executed' };
  }
}

/** A real durable cancellation at the public repository boundary before start returns to its consumer. */
class CancelAtStartRepository extends TaskRepository {
  public override async start(...args: Parameters<TaskRepository['start']>): Promise<TaskRecord> {
    const started = await super.start(...args);
    await super.cancel(started.id);
    return started;
  }
}

function commitRuntime(
  state: FileStateStore,
  repository: TaskRepository,
  agent: AbstractAgent,
  provider: LLMProvider = new DeterministicProvider(),
  events = new EventBus()
): { coordinator: Coordinator; registry: AgentRegistry } {
  const registry = new AgentRegistry();
  registry.register(agent);
  return {
    registry,
    coordinator: new Coordinator({
      state,
      repository,
      registry,
      provider,
      events,
      metrics: new Metrics(),
      logger: new MemoryLogger(),
      clock: new SystemClock(),
      pollIntervalMs: 5,
      maxConcurrentTasks: 1,
      defaultTaskTimeoutMs: 1000,
    }),
  };
}

async function waitFor(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 3000;
  while (!condition()) {
    if (Date.now() >= deadline)
      throw new Error('Durable task execution did not reach the expected boundary');
    await delay(5);
  }
}

const request = {
  agentId: 'effect',
  name: 'Durable effect',
  description: 'Do not execute an uncommitted start',
  input: null,
};

describe('Coordinator durable task/lease admission', () => {
  it('keeps a pending start invisible and releases the real reservation when it fails before a queued cancellation/shutdown', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-dispatch-commit-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    const repository = new TaskRepository(state, new SystemClock());
    const agent = new EffectAgent();
    const { coordinator, registry } = commitRuntime(state, repository, agent);
    let release: (() => void) | undefined;
    try {
      await state.load();
      await repository.load();
      const task = await repository.create(request);
      const barrier = boundary.pauseNextWrite();
      release = barrier.release;
      await coordinator.start();
      await barrier.entered;
      expect(coordinator.getTask(task.id)?.status).toBe('queued');
      expect(registry.activeCount()).toBe(1);
      expect(agent.effects).toBe(0);
      const cancellation = coordinator.cancelTask(task.id);
      const shutdown = coordinator.shutdown();
      boundary.failNext('write');
      barrier.release();
      expect(await cancellation).toEqual(
        expect.objectContaining({ status: 'cancelled', attempt: 0 })
      );
      await shutdown;
      expect(registry.activeCount()).toBe(0);
      expect(agent.effects).toBe(0);
      expect(
        runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state.tasks
      ).toEqual([expect.objectContaining({ id: task.id, status: 'cancelled', attempt: 0 })]);
    } finally {
      release?.();
      await coordinator.shutdown();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('does not execute a task already durably cancelled before the start promise returns', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-cancel-before-effect-'));
    const state = new FileStateStore(join(directory, 'state.json'));
    const repository = new CancelAtStartRepository(state, new SystemClock());
    const agent = new EffectAgent();
    const { coordinator, registry } = commitRuntime(state, repository, agent);
    try {
      await state.load();
      await repository.load();
      const task = await repository.create(request);
      await coordinator.start();
      const deadline = Date.now() + 3000;
      while (coordinator.getTask(task.id)?.status !== 'cancelled' || registry.activeCount() !== 0) {
        if (Date.now() >= deadline) throw new Error('Cancellation did not settle');
        await delay(5);
      }
      expect(coordinator.getTask(task.id)?.attempt).toBe(1);
      expect(agent.effects).toBe(0);
    } finally {
      await coordinator.shutdown();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('cancels an accepted pending start when shutdown begins before execution admission', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-shutdown-before-effect-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    const repository = new TaskRepository(state, new SystemClock());
    const agent = new EffectAgent();
    const { coordinator, registry } = commitRuntime(state, repository, agent);
    let release: (() => void) | undefined;
    try {
      await state.load();
      await repository.load();
      const task = await repository.create(request);
      const queued = await repository.create({ ...request, name: 'Retained queued work' });
      const barrier = boundary.pauseNextWrite();
      release = barrier.release;
      await coordinator.start();
      await barrier.entered;
      const shutdown = coordinator.shutdown();
      expect(coordinator.getStatus()).toBe('stopping');
      barrier.release();
      await shutdown;
      expect(coordinator.getTask(task.id)).toEqual(
        expect.objectContaining({ status: 'cancelled', attempt: 1 })
      );
      expect(coordinator.getTask(queued.id)).toEqual(
        expect.objectContaining({ status: 'queued', attempt: 0 })
      );
      expect(
        runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state.tasks
      ).toEqual([
        expect.objectContaining({ id: task.id, status: 'cancelled', attempt: 1 }),
        expect.objectContaining({ id: queued.id, status: 'queued', attempt: 0 }),
      ]);
      expect(registry.activeCount()).toBe(0);
      expect(agent.effects).toBe(0);
    } finally {
      release?.();
      await coordinator.shutdown();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it.each(['resolve', 'reject'] as const)(
    'clears the execution timer before a %s outcome waits for a durable commit',
    async outcome => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-execution-deadline-'));
      const file = join(directory, 'state.json');
      const boundary = new StateBoundary(file);
      const state = new FileStateStore(file, boundary.io);
      const repository = new TaskRepository(state, new SystemClock());
      const usage = { promptTokens: 3, completionTokens: 2, totalTokens: 5, costUsd: 5 };
      let transportCalls = 0;
      const provider = new GovernedProvider(
        new OpenAIProvider({
          apiKey: 'unused-offline-test-key',
          model: 'offline-test',
          timeoutMs: 1000,
          maxRetries: 0,
          retryBaseMs: 1,
          promptCostPerMillionUsd: 1_000_000,
          completionCostPerMillionUsd: 1_000_000,
          transport: {
            complete: async () => {
              transportCalls += 1;
              return {
                id: `offline-${transportCalls}`,
                model: 'offline-test',
                parsed: { executed: true },
                usage: {
                  prompt_tokens: usage.promptTokens,
                  completion_tokens: usage.completionTokens,
                  total_tokens: usage.totalTokens,
                },
              };
            },
          },
        })
      );
      const events = new EventBus();
      let commitEntered = false;
      let release: (() => void) | undefined;
      const agent = new CommitAgent(outcome, () => {
        const barrier = boundary.pauseNextWrite();
        release = barrier.release;
        void barrier.entered.then(() => {
          commitEntered = true;
        });
      });
      const { coordinator, registry } = commitRuntime(state, repository, agent, provider, events);
      try {
        await state.load();
        await repository.load();
        const task = await repository.create({
          ...request,
          timeoutMs: 100,
          maxAttempts: 2,
          retryBackoffMs: 0,
        });
        await coordinator.start();
        await waitFor(() => commitEntered);
        expect(agent.effects).toBe(1);
        expect(registry.activeCount()).toBe(1);
        expect(provider.getTaskUsage(task.id)).toEqual(usage);

        // The real next write is completion on resolve, or usage accounting on rejection.
        // Keep it blocked past the execution deadline without faking either the clock or commit.
        await delay(task.timeoutMs + 25);
        expect(agent.signal?.aborted).toBe(false);
        expect(registry.activeCount()).toBe(1);
        expect(coordinator.getTask(task.id)).toEqual(
          expect.objectContaining({ status: 'running', attempt: 1 })
        );
        expect(coordinator.getTask(task.id)?.usage).toBeUndefined();
        expect(coordinator.getHealth().lastFailure).toBeUndefined();
        expect(events.getHistory()).toEqual([]);
        expect(
          runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state.tasks
        ).toEqual([expect.objectContaining({ id: task.id, status: 'running', attempt: 1 })]);

        release?.();
        await waitFor(() => registry.activeCount() === 0);
        const settled = coordinator.getTask(task.id);
        expect(settled).toEqual(
          expect.objectContaining({
            status: outcome === 'resolve' ? 'completed' : 'failed',
            attempt: 1,
            usage,
          })
        );
        expect(agent.effects).toBe(1);
        expect(transportCalls).toBe(1);
        expect(provider.getTaskUsage(task.id)).toEqual(usage);
        expect(agent.signal?.aborted).toBe(false);
        expect(events.getHistory().map(event => event.type)).toEqual([
          outcome === 'resolve' ? 'task.completed' : 'task.failed',
        ]);
        const metrics = coordinator.getMetrics().renderPrometheus();
        expect(metrics).not.toContain('noorg_tasks_retried ');
        expect(metrics).not.toContain('noorg_tasks_cancelled ');
        if (outcome === 'resolve') {
          expect(settled?.result?.data).toEqual({ executed: true });
          expect(settled?.error).toBeUndefined();
          expect(coordinator.getHealth().lastFailure).toBeUndefined();
          expect(metrics).toContain('noorg_tasks_completed 1\n');
          expect(metrics).not.toContain('noorg_tasks_failed ');
        } else {
          expect(settled?.result).toBeUndefined();
          expect(settled?.error?.code).toBe('EXECUTION_REJECTED');
          expect(coordinator.getHealth().lastFailure?.code).toBe('EXECUTION_REJECTED');
          expect(metrics).toContain('noorg_tasks_failed 1\n');
          expect(metrics).not.toContain('noorg_tasks_completed ');
        }
        await coordinator.shutdown();
        expect(registry.activeCount()).toBe(0);
        const reopened = new FileStateStore(file);
        try {
          await reopened.load();
          const persisted = new TaskRepository(reopened, new SystemClock());
          await persisted.load();
          expect(persisted.internalSnapshot().tasks).toEqual([settled]);
        } finally {
          await reopened.close();
        }
      } finally {
        release?.();
        await coordinator.shutdown();
        await rm(directory, { recursive: true, force: true });
      }
    }
  );
});
