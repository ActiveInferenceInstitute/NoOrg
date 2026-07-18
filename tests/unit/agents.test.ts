import { SystemClock } from '../../src/domain/clock';
import { createHash } from 'node:crypto';
import {
  AbstractAgent,
  AnalysisAgent,
  DataAnalysisAgent,
  createBuiltInAgents,
  type AgentContext,
} from '../../src/agents';
import { AgentRegistry } from '../../src/agents/registry';
import { loadConfiguredAgents } from '../../src/agents/loader';
import type { AgentResult, AgentTask } from '../../src/domain/types';
import { MemoryLogger } from '../../src/logging/logger';
import { DeterministicProvider } from '../../src/providers/provider';
import { MemoryStateStore } from '../../src/state/state-store';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const context = (): AgentContext => ({
  provider: new DeterministicProvider(),
  state: new MemoryStateStore(),
  logger: new MemoryLogger(),
  clock: new SystemClock(),
  configuration: { provider: 'local', environment: 'test' },
});

function task(input: unknown): AgentTask {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Agent test',
    description: 'Exercise a registered agent',
    input: input as AgentTask['input'],
    requiredCapabilities: [],
    timeoutMs: 1000,
    attempt: 1,
  };
}

describe('built-in agents', () => {
  it('executes every built-in agent through its typed contract', async () => {
    for (const agent of createBuiltInAgents()) {
      await agent.initialize(context());
      const input =
        agent.descriptor.id === 'data-analysis'
          ? [
              { amount: 1, count: 2 },
              { amount: 3, count: 4 },
            ]
          : { text: 'A complete test input for the registered agent.' };
      const result = await agent.execute(task(input), new AbortController().signal);
      expect(result.summary).toEqual(expect.any(String));
      expect(agent.validateResult(result)).toEqual(result);
      await agent.shutdown();
    }
  });

  it('rejects execution before initialization, aborted execution, and invalid input', async () => {
    const agent = new AnalysisAgent();
    await expect(agent.execute(task('text'), new AbortController().signal)).rejects.toThrow(
      'not initialized'
    );
    await agent.initialize(context());
    await expect(agent.initialize(context())).rejects.toThrow('already initialized');
    const controller = new AbortController();
    controller.abort();
    await expect(agent.execute(task('text'), controller.signal)).rejects.toThrow('cancelled');
    await expect(agent.execute(task(null), new AbortController().signal)).rejects.toThrow(
      'Invalid input'
    );
    await agent.shutdown();

    const dataAgent = new DataAnalysisAgent();
    await dataAgent.initialize(context());
    await expect(dataAgent.execute(task(null), new AbortController().signal)).rejects.toThrow(
      'Expected an array of record objects'
    );
    await dataAgent.shutdown();
  });
});

describe('AgentRegistry', () => {
  it('reports availability and rejects duplicate registrations', async () => {
    const registry = new AgentRegistry();
    const agent = new AnalysisAgent();
    registry.register(agent);
    expect(() => registry.register(new AnalysisAgent())).toThrow('already registered');
    const candidate = task('text');
    expect(registry.availability({ ...candidate, requiredCapabilities: ['missing'] })).toBe(
      'no_match'
    );
    expect(registry.acquire({ ...candidate, requiredCapabilities: ['missing'] })).toBeUndefined();
    const first = registry.acquire(candidate);
    const second = registry.acquire(candidate);
    expect(registry.availability(candidate)).toBe('at_capacity');
    first?.release();
    second?.release();
    await registry.initialize(context());
    await expect(registry.initialize(context())).rejects.toThrow('already initialized');
    const lease = registry.acquire(candidate);
    expect(lease).toBeDefined();
    expect(registry.availability(candidate)).toBe('available');
    lease?.release();
    await registry.shutdown();
    expect(registry.isReady()).toBe(false);
  });

  it('rejects invalid descriptors at registration', () => {
    class InvalidAgent extends AbstractAgent {
      public constructor() {
        super({ id: 'invalid', name: 'Invalid', capabilities: ['invalid'], maxConcurrentTasks: 0 });
      }

      protected async run(_task: AgentTask): Promise<AgentResult> {
        return { data: null, summary: 'unused' };
      }
    }
    expect(() => new AgentRegistry().register(new InvalidAgent())).toThrow();
  });

  it('cleans up initialized agents when a later agent fails initialization', async () => {
    class FailingAgent extends AbstractAgent {
      public constructor() {
        super({ id: 'failing', name: 'Failing', capabilities: ['failing'], maxConcurrentTasks: 1 });
        this.onInitialize = async () => {
          throw new Error('init failed');
        };
      }

      protected async run(_task: AgentTask): Promise<AgentResult> {
        return { data: null, summary: 'unused' };
      }
    }
    const registry = new AgentRegistry();
    registry.register(new AnalysisAgent());
    registry.register(new FailingAgent());
    await expect(registry.initialize(context())).rejects.toThrow('init failed');
    expect(registry.isReady()).toBe(false);
    await registry.shutdown();
  });

  it('rejects unavailable configured modules without silent fallback', async () => {
    await expect(loadConfiguredAgents(['does-not-exist.mjs'])).rejects.toMatchObject({
      code: 'AGENT_MODULE_LOAD_FAILED',
    });
  });

  it('loads versioned modules and rejects incompatible module shapes', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-agents-'));
    try {
      await writeFile(
        join(directory, 'valid.cjs'),
        `exports.contractVersion = 1; exports.createAgents = () => [{ descriptor: { id: 'external', name: 'External', capabilities: ['external'], maxConcurrentTasks: 1 }, inputSchema: { parse: value => value }, resultSchema: { parse: value => value }, initialize: async () => {}, execute: async () => ({ data: null, summary: 'external' }), validateResult: value => value, shutdown: async () => {} }];`
      );
      await writeFile(
        join(directory, 'wrong-version.cjs'),
        'exports.contractVersion = 2; exports.agents = [];'
      );
      await writeFile(join(directory, 'wrong-shape.cjs'), 'exports.agents = [];');
      await writeFile(
        join(directory, 'incomplete-agent.cjs'),
        `exports.agents = [{ descriptor: { id: 'incomplete', name: 'Incomplete', capabilities: ['incomplete'], maxConcurrentTasks: 1 } }];`
      );
      const loaderOptions = { deploymentRoot: directory };
      await expect(
        loadConfiguredAgents([join(directory, 'valid.cjs')], loaderOptions)
      ).resolves.toHaveLength(1);
      const validPath = join(directory, 'valid.cjs');
      const validDigest = createHash('sha256')
        .update(await readFile(validPath))
        .digest('hex');
      await expect(loadConfiguredAgents([validPath])).rejects.toMatchObject({
        code: 'AGENT_MODULE_UNTRUSTED',
      });
      await expect(
        loadConfiguredAgents([validPath], { trustedDigests: { [validPath]: validDigest } })
      ).resolves.toHaveLength(1);
      await expect(
        loadConfiguredAgents([join(directory, 'wrong-version.cjs')], loaderOptions)
      ).rejects.toMatchObject({
        code: 'AGENT_CONTRACT_UNSUPPORTED',
      });
      await expect(
        loadConfiguredAgents([join(directory, 'wrong-shape.cjs')], loaderOptions)
      ).rejects.toMatchObject({
        code: 'AGENT_MODULE_INVALID',
      });
      await expect(
        loadConfiguredAgents([join(directory, 'incomplete-agent.cjs')], loaderOptions)
      ).rejects.toMatchObject({
        code: 'AGENT_MODULE_INVALID',
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
