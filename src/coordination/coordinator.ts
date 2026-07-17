import { randomUUID } from 'node:crypto';
import { NoOrgError, toTaskError } from '../domain/errors';
import { delay, NoOrgTimeoutError, type Clock } from '../domain/clock';
import type { AgentResult, AgentTask, JsonValue, TaskRecord, TaskRequest } from '../domain/types';
import type { Agent } from '../agents/abstract-agent';
import type { Logger } from '../logging/logger';
import type { Metrics } from '../metrics/metrics';
import type { AgentRegistry } from '../agents/registry';
import type { EventBus, RuntimeEvent } from '../events/event-bus';
import type { LLMProvider } from '../providers/provider';
import type { StateStore } from '../state/state-store';
import { TaskRepository } from '../tasks/task-repository';

export interface CoordinatorDependencies {
  readonly state: StateStore;
  readonly repository?: TaskRepository;
  readonly registry: AgentRegistry;
  readonly provider: LLMProvider;
  readonly events: EventBus;
  readonly metrics: Metrics;
  readonly logger: Logger;
  readonly clock: Clock;
  readonly pollIntervalMs: number;
  readonly maxConcurrentTasks: number;
  readonly defaultTaskTimeoutMs: number;
  readonly agentConfiguration?: Readonly<Record<string, JsonValue>>;
}

export type CoordinatorStatus = 'created' | 'running' | 'stopping' | 'stopped';

export interface TaskScheduler {
  start(): Promise<void>;
  submitTask(request: TaskRequest): Promise<TaskRecord>;
  cancelTask(id: string): Promise<TaskRecord>;
  getTask(id: string): TaskRecord | undefined;
  shutdown(): Promise<void>;
}

export class Coordinator implements TaskScheduler {
  private readonly repository: TaskRepository;
  private status: CoordinatorStatus = 'created';
  private controller?: AbortController;
  private loopPromise?: Promise<void>;
  private readonly runningTasks = new Set<Promise<void>>();
  private readonly taskControllers = new Map<string, AbortController>();

  public constructor(private readonly dependencies: CoordinatorDependencies) {
    this.repository =
      dependencies.repository ?? new TaskRepository(dependencies.state, dependencies.clock);
  }

  public async start(): Promise<void> {
    if (this.status === 'running') return;
    if (this.status === 'stopping' || this.status === 'stopped')
      throw new NoOrgError('COORDINATOR_CLOSED', 'Coordinator cannot be restarted after shutdown');
    await this.dependencies.state.load();
    await this.repository.load();
    const recovered = await this.repository.recoverInterruptedTasks();
    await this.dependencies.registry.initialize({
      provider: this.dependencies.provider,
      state: this.dependencies.state,
      logger: this.dependencies.logger,
      clock: this.dependencies.clock,
      configuration: this.dependencies.agentConfiguration ?? {},
    });
    this.controller = new AbortController();
    this.status = 'running';
    this.loopPromise = this.runLoop(this.controller.signal);
    this.dependencies.logger.info('Coordinator started', {
      agents: this.dependencies.registry.descriptors().length,
      recoveredTasks: recovered.length,
    });
  }

  public async submitTask(request: TaskRequest): Promise<TaskRecord> {
    if (this.status !== 'running')
      throw new NoOrgError(
        'COORDINATOR_NOT_RUNNING',
        'Coordinator must be running before submitting tasks'
      );
    const task = await this.repository.create({
      ...request,
      timeoutMs: request.timeoutMs ?? this.dependencies.defaultTaskTimeoutMs,
    });
    this.dependencies.metrics.increment('tasks_submitted');
    this.refreshMetrics(this.dependencies.provider.getUsage());
    return task;
  }

  public getTask(id: string): TaskRecord | undefined {
    return this.repository.get(id);
  }

  public listTasks(): TaskRecord[] {
    return this.repository.list();
  }

  public async cancelTask(id: string): Promise<TaskRecord> {
    const controller = this.taskControllers.get(id);
    controller?.abort();
    const task = await this.repository.cancel(id);
    this.dependencies.metrics.increment('tasks_cancelled');
    await this.publish('task.cancelled', task);
    return task;
  }

  public getStatus(): CoordinatorStatus {
    return this.status;
  }

  public getHealth(): {
    readonly status: CoordinatorStatus;
    readonly provider: string;
    readonly agents: number;
    readonly activeTasks: number;
    readonly stateRevision: number;
    readonly providerReady: boolean;
    readonly stateReady: boolean;
    readonly registryReady: boolean;
    readonly usage: ReturnType<LLMProvider['getUsage']>;
  } {
    const health = {
      status: this.status,
      provider: this.dependencies.provider.kind,
      agents: this.dependencies.registry.descriptors().length,
      activeTasks: this.dependencies.registry.activeCount(),
      stateRevision: this.dependencies.state.revision(),
      providerReady: this.dependencies.provider.isOpen(),
      stateReady: this.dependencies.state.isOpen(),
      registryReady: this.dependencies.registry.isReady(),
      usage: this.dependencies.provider.getUsage(),
    };
    this.refreshMetrics(health.usage);
    return health;
  }

  public getMetrics(): Metrics {
    return this.dependencies.metrics;
  }

  public async shutdown(): Promise<void> {
    if (this.status === 'stopped') return;
    this.status = 'stopping';
    this.controller?.abort();
    for (const controller of this.taskControllers.values()) controller.abort();
    if (this.loopPromise) await this.loopPromise;
    let failure: unknown;
    try {
      await Promise.all([...this.runningTasks]);
      await this.repository.persist();
    } catch (error) {
      failure = error;
    } finally {
      const closures = [
        this.dependencies.registry.shutdown(),
        this.dependencies.events.close(),
        this.dependencies.provider.close(),
        this.dependencies.state.close(),
      ];
      const results = await Promise.allSettled(closures);
      const closureFailure = results.find(result => result.status === 'rejected');
      if (failure === undefined && closureFailure?.status === 'rejected')
        failure = closureFailure.reason;
      this.status = 'stopped';
    }
    this.dependencies.logger.info('Coordinator stopped');
    if (failure !== undefined) throw failure;
  }

  private async runLoop(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      const launched = await this.launchQueued();
      if (launched === 0) {
        try {
          await delay(this.dependencies.pollIntervalMs, signal);
        } catch (error) {
          if (!signal.aborted)
            this.dependencies.logger.error('Coordinator loop failed', {
              code: error instanceof NoOrgError ? error.code : 'COORDINATOR_LOOP_FAILED',
            });
        }
      }
    }
  }

  private async launchQueued(): Promise<number> {
    let launched = 0;
    const available = Math.max(
      0,
      this.dependencies.maxConcurrentTasks - this.dependencies.registry.activeCount()
    );
    for (const task of this.repository.list('queued').slice(0, available)) {
      const candidate: AgentTask = {
        id: task.id,
        name: task.name,
        description: task.description,
        input: task.input,
        requiredCapabilities: task.requiredCapabilities,
        timeoutMs: task.timeoutMs,
        attempt: task.attempt + 1,
        ...(task.agentId === undefined ? {} : { agentId: task.agentId }),
      };
      const lease = this.dependencies.registry.acquire(candidate);
      if (!lease) continue;
      let started: TaskRecord;
      try {
        started = await this.repository.start(task.id, lease.agent.descriptor.id);
      } catch (error) {
        lease.release();
        this.dependencies.logger.error('Unable to claim task', {
          taskId: task.id,
          error: String(error),
        });
        continue;
      }
      const controller = new AbortController();
      this.taskControllers.set(started.id, controller);
      const execution = this.execute(started, lease.agent, controller, lease.release);
      this.runningTasks.add(execution);
      void execution.finally(() => this.runningTasks.delete(execution));
      launched += 1;
    }
    return launched;
  }

  private async execute(
    task: TaskRecord,
    agent: Agent,
    controller: AbortController,
    release: () => void
  ): Promise<void> {
    const startedAt = this.dependencies.clock.now().getTime();
    try {
      const agentTask: AgentTask = {
        id: task.id,
        name: task.name,
        description: task.description,
        input: task.input,
        requiredCapabilities: task.requiredCapabilities,
        timeoutMs: task.timeoutMs,
        attempt: task.attempt,
        ...(task.agentId === undefined ? {} : { agentId: task.agentId }),
      };
      const result = await this.withTimeout(
        agent.execute(agentTask, controller.signal),
        task.timeoutMs,
        controller
      );
      const completed = await this.repository.complete(task.id, agent.validateResult(result));
      this.dependencies.metrics.increment('tasks_completed');
      this.dependencies.metrics.observe(
        'task_duration_ms',
        this.dependencies.clock.now().getTime() - startedAt
      );
      this.refreshMetrics(this.dependencies.provider.getUsage());
      await this.publish('task.completed', completed);
    } catch (error) {
      const current = this.repository.get(task.id);
      if (current?.status === 'running') {
        if (controller.signal.aborted && !(error instanceof NoOrgTimeoutError)) {
          const cancelled = await this.repository.cancel(task.id);
          this.dependencies.metrics.increment('tasks_cancelled');
          await this.publish('task.cancelled', cancelled);
        } else {
          const taskError =
            error instanceof NoOrgTimeoutError
              ? {
                  code: 'TASK_TIMEOUT',
                  message: error.message,
                  retryable: true,
                }
              : toTaskError(error);
          const failed = await this.repository.fail(task.id, {
            ...taskError,
            retryable: taskError.retryable && !controller.signal.aborted,
          });
          this.dependencies.metrics.increment(
            failed.status === 'queued' ? 'tasks_retried' : 'tasks_failed'
          );
          await this.publish(failed.status === 'queued' ? 'task.requeued' : 'task.failed', failed);
        }
      }
      if (!(error instanceof NoOrgTimeoutError) && !controller.signal.aborted) {
        const taskError = toTaskError(error);
        this.dependencies.logger.error('Task execution failed', {
          taskId: task.id,
          code: taskError.code,
        });
      }
    } finally {
      release();
      this.taskControllers.delete(task.id);
    }
  }

  private async withTimeout(
    operation: Promise<AgentResult>,
    milliseconds: number,
    controller: AbortController
  ): Promise<AgentResult> {
    let timer: NodeJS.Timeout | undefined;
    let timedOut = false;
    const timeout = new Promise<AgentResult>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(new NoOrgTimeoutError(milliseconds));
      }, milliseconds);
    });
    try {
      return await Promise.race([operation, timeout]);
    } catch (error) {
      // Keep the reservation until the agent promise actually settles. This prevents
      // timed-out work from continuing outside the scheduler's concurrency budget.
      await operation.catch(() => undefined);
      if (timedOut && error instanceof NoOrgTimeoutError) throw error;
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private async publish(type: string, task: TaskRecord): Promise<void> {
    const event: RuntimeEvent = {
      type,
      id: randomUUID(),
      timestamp: this.dependencies.clock.now().toISOString(),
      payload: { task: task as unknown as JsonValue },
    };
    await this.dependencies.events.publish(event);
  }

  private refreshMetrics(usage: ReturnType<LLMProvider['getUsage']>): void {
    this.dependencies.metrics.setGauge('active_tasks', this.dependencies.registry.activeCount());
    this.dependencies.metrics.setGauge('state_revision', this.dependencies.state.revision());
    this.dependencies.metrics.setGauge('provider_prompt_tokens', usage.promptTokens);
    this.dependencies.metrics.setGauge('provider_completion_tokens', usage.completionTokens);
    this.dependencies.metrics.setGauge('provider_cost_usd', usage.costUsd);
  }
}
