import { createHttpServer } from './http/server';
import { loadConfig } from './config/config';
import { SystemClock } from './domain/clock';
import { Coordinator } from './coordination/coordinator';
import { EventBus } from './events/event-bus';
import { consoleLogger } from './logging/logger';
import { Metrics } from './metrics/metrics';
import { DeterministicProvider, OpenAIProvider, type LLMProvider } from './providers/provider';
import { AgentRegistry } from './agents/registry';
import { createBuiltInAgents } from './agents/builtins';
import { FileStateStore } from './state/state-store';

export async function createApplication() {
  const config = loadConfig();
  const state = new FileStateStore(config.statePath);
  const provider: LLMProvider =
    config.provider === 'openai'
      ? new OpenAIProvider({
          apiKey: config.openai.apiKey as string,
          model: config.openai.model,
          timeoutMs: config.openai.timeoutMs,
          maxRetries: config.openai.maxRetries,
          retryBaseMs: config.openai.retryBaseMs,
          promptCostPerMillionUsd: config.openai.promptCostPerMillionUsd,
          completionCostPerMillionUsd: config.openai.completionCostPerMillionUsd,
          ...(config.openai.baseUrl === undefined ? {} : { baseUrl: config.openai.baseUrl }),
          logger: consoleLogger,
        })
      : new DeterministicProvider();
  const registry = new AgentRegistry();
  for (const agent of createBuiltInAgents()) registry.register(agent);
  const coordinator = new Coordinator({
    state,
    registry,
    provider,
    events: new EventBus(),
    metrics: new Metrics(),
    logger: consoleLogger,
    clock: new SystemClock(),
    pollIntervalMs: config.pollIntervalMs,
    maxConcurrentTasks: config.maxConcurrentTasks,
    defaultTaskTimeoutMs: config.defaultTaskTimeoutMs,
    agentConfiguration: {
      provider: config.provider,
      environment: config.environment,
    },
  });
  const server = createHttpServer({ coordinator, metricsEnabled: config.metricsEnabled });
  return { config, coordinator, server };
}

async function main(): Promise<void> {
  const application = await createApplication();
  await application.coordinator.start();
  application.server.listen(application.config.server.port, () => {
    console.info(
      JSON.stringify({
        message: 'NoOrg listening',
        port: application.config.server.port,
        provider: application.config.provider,
      })
    );
  });
  let stopping: Promise<void> | undefined;
  const shutdown = (): void => {
    if (stopping) return;
    stopping = (async () => {
      try {
        await new Promise<void>((resolve, reject) =>
          application.server.close(error => (error ? reject(error) : resolve()))
        );
      } finally {
        await application.coordinator.shutdown();
      }
    })().catch((error: unknown) => {
      console.error(JSON.stringify({ message: 'NoOrg shutdown failed', error: String(error) }));
      process.exitCode = 1;
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(JSON.stringify({ message: 'NoOrg startup failed', error: String(error) }));
    process.exitCode = 1;
  });
}

export * from './agents';
export * from './config/config';
export * from './coordination';
export * from './domain';
export * from './events/event-bus';
export * from './http';
export * from './logging/logger';
export * from './metrics/metrics';
export * from './providers';
export * from './state/state-store';
export * from './tasks/task-repository';
