/// <reference lib="es2024.promise" />
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { AbstractAgent } from '../../src/agents/abstract-agent';
import { AgentRegistry } from '../../src/agents/registry';
import { Coordinator } from '../../src/coordination/coordinator';
import { delay, SystemClock } from '../../src/domain/clock';
import { NoOrgError } from '../../src/domain/errors';
import type { AgentResult, AgentTask, UsageMetadata } from '../../src/domain/types';
import { EventBus } from '../../src/events/event-bus';
import { MemoryLogger } from '../../src/logging/logger';
import { Metrics } from '../../src/metrics/metrics';
import { GovernedProvider } from '../../src/providers/governed-provider';
import { OpenAIProvider } from '../../src/providers/provider';
import { FileStateStore, MemoryStateStore, type StateStore } from '../../src/state/state-store';
import { TaskRepository } from '../../src/tasks/task-repository';
import { StateBoundary } from '../fixtures/state-boundary';

const output = z.object({ ok: z.boolean() });
const five: UsageMetadata = { promptTokens: 3, completionTokens: 2, totalTokens: 5, costUsd: 5 };
const two: UsageMetadata = { promptTokens: 1, completionTokens: 1, totalTokens: 2, costUsd: 2 };
const seven: UsageMetadata = { promptTokens: 4, completionTokens: 3, totalTokens: 7, costUsd: 7 };

function offlineMeter(receipts: readonly UsageMetadata[]) {
  const effects = { calls: 0 };
  const provider = new GovernedProvider(new OpenAIProvider({
    apiKey: 'unused-offline-test-key', model: 'offline-test', timeoutMs: 1000, maxRetries: 0, retryBaseMs: 1,
    promptCostPerMillionUsd: 1_000_000, completionCostPerMillionUsd: 1_000_000,
    transport: { complete: async () => {
      const receipt = receipts[effects.calls];
      effects.calls += 1;
      if (receipt === undefined) throw new Error('Unexpected offline transport invocation');
      return { id: `offline-${effects.calls}`, model: 'offline-test', parsed: { ok: true }, usage: {
        prompt_tokens: receipt.promptTokens, completion_tokens: receipt.completionTokens, total_tokens: receipt.totalTokens,
      } };
    } },
  }));
  return { provider, effects };
}

class ChargedAgent extends AbstractAgent {
  public attempts = 0;
  public readonly ready = Promise.withResolvers<void>();
  private readonly settlement = Promise.withResolvers<void>();
  public constructor(private readonly mode: 'retry' | 'late' | 'complete', private readonly beforeComplete?: () => void) {
    super({ id: 'charged', name: 'Charged', capabilities: ['charged'], maxConcurrentTasks: 1 });
  }
  public release(): void { this.settlement.resolve(); }
  protected override async run(task: AgentTask, signal: AbortSignal): Promise<AgentResult> {
    this.attempts += 1;
    await this.ask({ operation: 'charge', input: null }, output, signal, task.id);
    if (this.mode === 'retry' && this.attempts === 1) throw new NoOrgError('TRANSIENT', 'Retry after a charged attempt', true);
    if (this.mode === 'late') {
      this.ready.resolve();
      await this.settlement.promise;
      // Deliberately uncooperative work: real offline receipt after cancellation/timeout.
      await this.context.provider.complete({ operation: 'late-charge', input: null, taskId: task.id }, output);
    }
    this.beforeComplete?.();
    return { data: { ok: true, attempt: this.attempts }, summary: 'Charged work settled' };
  }
}

function usageRuntime(state: StateStore, provider: GovernedProvider, agent: ChargedAgent): { coordinator: Coordinator; registry: AgentRegistry } {
  const registry = new AgentRegistry();
  registry.register(agent);
  const coordinator = new Coordinator({ state, registry, provider, events: new EventBus(), metrics: new Metrics(),
    logger: new MemoryLogger(), clock: new SystemClock(), pollIntervalMs: 5, maxConcurrentTasks: 1,
    defaultTaskTimeoutMs: 2000 });
  return { coordinator, registry };
}

async function waitFor(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 3000;
  while (!condition()) {
    if (Date.now() >= deadline) throw new Error('Usage condition did not become true');
    await delay(5);
  }
}

const request = { agentId: 'charged', name: 'Account usage', description: 'Charge each provider receipt once', input: null, maxAttempts: 2, retryBackoffMs: 0 };

describe('Provider-instance usage deltas', () => {
  it('adds 5 then 2 as 7, not cumulative 5 plus cumulative 7, across retries', async () => {
    const meter = offlineMeter([five, two]);
    const agent = new ChargedAgent('retry');
    const { coordinator } = usageRuntime(new MemoryStateStore(), meter.provider, agent);
    try {
      await coordinator.start();
      const task = await coordinator.submitTask(request);
      await waitFor(() => coordinator.getTask(task.id)?.status === 'completed');
      expect(coordinator.getTask(task.id)?.usage).toEqual(seven);
      expect(meter.provider.getTaskUsage(task.id)).toEqual(seven);
      expect(meter.effects.calls).toBe(2);
      expect(agent.attempts).toBe(2);
    } finally { agent.release(); await coordinator.shutdown(); }
  });

  it('advances the checkpoint only after a successful durable commit, including completion-failure re-entry', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-usage-commit-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file, new NoOrgError('TRANSIENT_STATE', 'Controlled pre-commit failure', true));
    const state = new FileStateStore(file, boundary.io);
    const meter = offlineMeter([five, two]);
    let completions = 0;
    const agent = new ChargedAgent('complete', () => { completions += 1; if (completions === 1) boundary.failNext('write'); });
    const { coordinator } = usageRuntime(state, meter.provider, agent);
    try {
      await coordinator.start();
      const task = await coordinator.submitTask(request);
      await waitFor(() => coordinator.getTask(task.id)?.status === 'completed');
      expect(coordinator.getTask(task.id)?.usage).toEqual(seven);
      expect(coordinator.getTask(task.id)?.result?.data).toEqual({ ok: true, attempt: 2 });
      expect(meter.effects.calls).toBe(2);
      await coordinator.shutdown();
      const reopened = new FileStateStore(file);
      try {
        await reopened.load();
        const repository = new TaskRepository(reopened, new SystemClock());
        await repository.load();
        expect(repository.get(task.id)?.usage).toEqual(seven);
      } finally { await reopened.close(); }
    } finally {
      agent.release();
      await coordinator.shutdown();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('preserves historical usage across a file-backed restart with a fresh provider counter', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-usage-restart-'));
    const file = join(directory, 'state.json');
    const previous = new FileStateStore(file);
    const meter = offlineMeter([two]);
    const agent = new ChargedAgent('complete');
    const { coordinator } = usageRuntime(new FileStateStore(file), meter.provider, agent);
    try {
      await previous.load();
      const repository = new TaskRepository(previous, new SystemClock());
      await repository.load();
      const task = await repository.create(request);
      await repository.recordUsage(task.id, five);
      await previous.close();
      await coordinator.start();
      await waitFor(() => coordinator.getTask(task.id)?.status === 'completed');
      expect(coordinator.getTask(task.id)?.usage).toEqual(seven);
      expect(meter.provider.getTaskUsage(task.id)).toEqual(two);
      expect(meter.effects.calls).toBe(1);
    } finally {
      agent.release();
      await coordinator.shutdown();
      await previous.close();
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('does not replay already-accounted counters when the same provider instance is handed to a new coordinator', async () => {
    const state = new MemoryStateStore();
    const repository = new TaskRepository(state, new SystemClock());
    await repository.load();
    const task = await repository.create(request);
    const meter = offlineMeter([five, two]);
    await meter.provider.complete({ operation: 'prior-session', input: null, taskId: task.id }, output);
    await repository.recordUsage(task.id, five);
    const agent = new ChargedAgent('complete');
    const { coordinator } = usageRuntime(state, meter.provider, agent);
    try {
      await coordinator.start();
      await waitFor(() => coordinator.getTask(task.id)?.status === 'completed');
      expect(coordinator.getTask(task.id)?.usage).toEqual(seven);
      expect(meter.effects.calls).toBe(2);
    } finally { agent.release(); await coordinator.shutdown(); }
  });

  it.each(['cancel', 'timeout'] as const)('records late settled usage once after %s without publishing a result or releasing the agent early', async kind => {
    const meter = offlineMeter([five, two]);
    const agent = new ChargedAgent('late');
    const { coordinator, registry } = usageRuntime(new MemoryStateStore(), meter.provider, agent);
    try {
      await coordinator.start();
      const task = await coordinator.submitTask({ ...request, maxAttempts: 1, timeoutMs: kind === 'timeout' ? 100 : 2000 });
      await agent.ready.promise;
      if (kind === 'cancel') await coordinator.cancelTask(task.id);
      else await waitFor(() => coordinator.getTask(task.id)?.status === 'failed');
      if (kind === 'timeout') expect(coordinator.getTask(task.id)?.error?.code).toBe('TASK_TIMEOUT');
      expect(registry.activeCount()).toBe(1);
      agent.release();
      await waitFor(() => coordinator.getTask(task.id)?.usage?.totalTokens === 7 && registry.activeCount() === 0);
      expect(coordinator.getTask(task.id)?.usage).toEqual(seven);
      expect(coordinator.getTask(task.id)?.status).toBe(kind === 'cancel' ? 'cancelled' : 'failed');
      expect(coordinator.getTask(task.id)?.result).toBeUndefined();
      expect(meter.effects.calls).toBe(2);
    } finally { agent.release(); await coordinator.shutdown(); }
  });
});
