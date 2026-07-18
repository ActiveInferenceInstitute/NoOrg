import { createHttpServer } from './http/server';
import { loadConfig } from './config/config';
import { SystemClock } from './domain/clock';
import { Coordinator } from './coordination/coordinator';
import { EventBus } from './events/event-bus';
import { consoleLogger } from './logging/logger';
import { Metrics } from './metrics/metrics';
import { GovernedProvider } from './providers/governed-provider';
import { DeterministicProvider, OpenAIProvider, type LLMProvider } from './providers/provider';
import { AgentRegistry } from './agents/registry';
import { loadConfiguredAgents } from './agents/loader';
import { createBuiltInAgents } from './agents/builtins';
import { FileStateStore } from './state/state-store';

export async function createApplication() {
  const config = loadConfig();
  const clock = new SystemClock();
  const state = new FileStateStore(config.statePath);
  const baseProvider: LLMProvider =
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
  const provider: LLMProvider = new GovernedProvider(baseProvider, {
    ...config.providerGovernance,
    clock,
    estimateRequestCost: request => {
      const promptBytes = Buffer.byteLength(
        JSON.stringify({
          operation: request.operation,
          input: request.input,
          system: request.system,
        }),
        'utf8'
      );
      const promptTokens = Math.ceil(promptBytes / 4);
      const completionTokens = request.maxTokens ?? 0;
      return (
        (promptTokens / 1_000_000) * config.openai.promptCostPerMillionUsd +
        (completionTokens / 1_000_000) * config.openai.completionCostPerMillionUsd
      );
    },
  });
  const registry = new AgentRegistry();
  for (const agent of createBuiltInAgents()) registry.register(agent);
  for (const agent of await loadConfiguredAgents(config.agentModules, {
    trustedDigests: config.agentModuleDigests,
  }))
    registry.register(agent);
  const coordinator = new Coordinator({
    state,
    registry,
    provider,
    events: new EventBus(),
    metrics: new Metrics(),
    logger: consoleLogger,
    clock,
    pollIntervalMs: config.pollIntervalMs,
    maxConcurrentTasks: config.maxConcurrentTasks,
    defaultTaskTimeoutMs: config.defaultTaskTimeoutMs,
    shutdownTimeoutMs: config.shutdownTimeoutMs,
    maxTaskInputBytes: config.maxTaskInputBytes,
    maxResultBytes: config.maxResultBytes,
    maxWorkflowDepth: config.maxWorkflowDepth,
    maxWorkflowChildren: config.maxWorkflowChildren,
    agentConfiguration: {
      provider: config.provider,
      environment: config.environment,
    },
  });
  const server = createHttpServer({
    coordinator,
    metricsEnabled: config.metricsEnabled,
    ...(config.server.authToken === undefined ? {} : { authToken: config.server.authToken }),
    maxBodyBytes: config.server.maxBodyBytes,
  });
  return { config, coordinator, server };
}

async function main(): Promise<void> {
  const application = await createApplication();
  await application.coordinator.start();
  application.server.listen(application.config.server.port, application.config.server.host, () => {
    console.info(
      JSON.stringify({
        message: 'NoOrg listening',
        port: application.config.server.port,
        host: application.config.server.host,
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
export * from './content';
export * from './coordination';
export * from './domain';
export * from './events/event-bus';
export * from './http';
export * from './logging/logger';
export * from './metrics/metrics';
export * from './providers';
export * from './state/state-store';
export * from './tasks/task-repository';
