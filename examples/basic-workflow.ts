import { Coordinator } from '../src/coordination/coordinator';
import { EventBus } from '../src/events/event-bus';
import { SystemClock } from '../src/domain/clock';
import { MemoryLogger } from '../src/logging/logger';
import { Metrics } from '../src/metrics/metrics';
import { DeterministicProvider } from '../src/providers/provider';
import { AgentRegistry } from '../src/agents/registry';
import { AnalysisAgent } from '../src/agents/builtins';
import { MemoryStateStore } from '../src/state/state-store';

async function main(): Promise<void> {
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
    defaultTaskTimeoutMs: 5000,
  });
  await coordinator.start();
  const task = await coordinator.submitTask({ agentId: 'analysis', name: 'Repository example', description: 'Analyse a short message', input: 'NoOrg executes typed agents.' });
  while (coordinator.getTask(task.id)?.status === 'queued' || coordinator.getTask(task.id)?.status === 'running') {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  console.info(JSON.stringify(coordinator.getTask(task.id), null, 2));
  await coordinator.shutdown();
}

void main().catch((error: unknown) => {
  console.error(String(error));
  process.exitCode = 1;
});
