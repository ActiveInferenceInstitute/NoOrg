import { randomUUID } from 'node:crypto';
import { NoOrgError, toTaskError } from '../domain/errors';
import { redactJsonValue } from '../domain/redaction';
import { delay, NoOrgTimeoutError, type Clock } from '../domain/clock';
import type {
  AgentResult,
  AgentTask,
  JsonValue,
  TaskError,
  TaskQuery,
  TaskRecord,
  TaskRequest,
  TaskStatus,
} from '../domain/types';
import type { Agent } from '../agents/abstract-agent';
import type { AgentAvailability, AgentRegistry } from '../agents/registry';
import type { Logger } from '../logging/logger';
import type { Metrics } from '../metrics/metrics';
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
  readonly shutdownTimeoutMs?: number;
  readonly maxTaskInputBytes?: number;
  readonly maxResultBytes?: number;
  readonly maxWorkflowDepth?: number;
  readonly maxWorkflowChildren?: number;
  readonly agentConfiguration?: Readonly<Record<string, JsonValue>>;
}

export type CoordinatorStatus = 'created' | 'running' | 'stopping' | 'stopped';

export interface TaskScheduler {
  start(): Promise<void>;
  submitTask(request: TaskRequest): Promise<TaskRecord>;
  cancelTask(id: string): Promise<TaskRecord>;
  getTask(id: string): TaskRecord | undefined;
  listTasks(status?: TaskStatus, query?: TaskQuery): TaskRecord[];
  shutdown(): Promise<void>;
}

interface FailureObservation {
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
}

export class Coordinator implements TaskScheduler {
  private readonly repository: TaskRepository;
  private status: CoordinatorStatus = 'created';
  private controller?: AbortController;
  private loopPromise?: Promise<void>;
  private readonly runningTasks = new Set<Promise<void>>();
  private readonly taskControllers = new Map<string, AbortController>();
  private readonly cancellationEvents = new Set<string>();
  private lastFailure?: FailureObservation;
  private shutdownTimedOut = false;

  public constructor(private readonly dependencies: CoordinatorDependencies) {
    this.repository =
      dependencies.repository ??
      new TaskRepository(dependencies.state, dependencies.clock, {
        ...(dependencies.maxTaskInputBytes === undefined
          ? {}
          : { maxInputBytes: dependencies.maxTaskInputBytes }),
        ...(dependencies.maxResultBytes === undefined
          ? {}
          : { maxResultBytes: dependencies.maxResultBytes }),
        ...(dependencies.maxWorkflowDepth === undefined
          ? {}
          : { maxWorkflowDepth: dependencies.maxWorkflowDepth }),
        ...(dependencies.maxWorkflowChildren === undefined
          ? {}
          : { maxWorkflowChildren: dependencies.maxWorkflowChildren }),
      });
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

  public listTasks(status?: TaskStatus, query?: TaskQuery): TaskRecord[] {
    return this.repository.list(status, query);
  }

  public async cancelTask(id: string): Promise<TaskRecord> {
    const current = this.repository.get(id);
    if (!current) throw new NoOrgError('TASK_NOT_FOUND', `Task ${id} was not found`);
    const cancelled = await this.repository.cancel(id);
    if (current.status === 'cancelled') return cancelled;
    this.taskControllers.get(id)?.abort();
    if (this.cancellationEvents.has(id)) return cancelled;
    this.cancellationEvents.add(id);
    this.dependencies.metrics.increment('tasks_cancelled');
    await this.publishSafely('task.cancelled', cancelled);
    this.refreshMetrics(this.dependencies.provider.getUsage());
    return cancelled;
  }

  public getStatus(): CoordinatorStatus {
    return this.status;
  }

  public getHealth(): {
    readonly status: CoordinatorStatus;
    readonly provider: string;
    readonly agents: number;
    readonly activeTasks: number;
    readonly queueDepth: number;
    readonly blockedTasks: number;
    readonly blockedCapabilityTasks: number;
    readonly blockedCapacityTasks: number;
    readonly stateRevision: number;
    readonly providerReady: boolean;
    readonly stateReady: boolean;
    readonly registryReady: boolean;
    readonly shutdownTimedOut: boolean;
    readonly lastFailure?: FailureObservation;
    readonly usage: ReturnType<LLMProvider['getUsage']>;
  } {
    const queued = this.repository.list('queued');
    const blocked = this.blockedTaskCounts(queued);
    const health = {
      status: this.status,
      provider: this.dependencies.provider.kind,
      agents: this.dependencies.registry.descriptors().length,
      activeTasks: this.dependencies.registry.activeCount(),
      queueDepth: queued.length,
      blockedTasks: blocked.total,
      blockedCapabilityTasks: blocked.capability,
      blockedCapacityTasks: blocked.capacity,
      stateRevision: this.dependencies.state.revision(),
      providerReady: this.dependencies.provider.isOpen(),
      stateReady: this.dependencies.state.isOpen(),
      registryReady: this.dependencies.registry.isReady(),
      shutdownTimedOut: this.shutdownTimedOut,
      ...(this.lastFailure === undefined ? {} : { lastFailure: this.lastFailure }),
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
    await this.cancelRunningTasksForShutdown();
    if (this.loopPromise) await this.loopPromise.catch(error => this.recordFailure(error));

    let failure: unknown;
    try {
      const running = Promise.all([...this.runningTasks]);
      const drained = await Promise.race([
        running.then(() => true),
        delay(this.dependencies.shutdownTimeoutMs ?? 10000).then(() => false),
      ]);
      if (!drained) {
        this.shutdownTimedOut = true;
        failure = new NoOrgError(
          'SHUTDOWN_TIMEOUT',
          'Coordinator shutdown exceeded its configured deadline',
          true
        );
        this.dependencies.logger.error('Coordinator shutdown exceeded its deadline', {
          activeTasks: this.runningTasks.size,
        });
      }
      await this.repository.persist();
    } catch (error) {
      failure = error;
    } finally {
      const closures = [
        this.dependencies.events.close(),
        this.dependencies.registry.shutdown(),
        this.dependencies.provider.close(),
        this.dependencies.state.close(),
      ];
      const results = await Promise.allSettled(closures);
      const closureFailure = results.find(result => result.status === 'rejected');
      if (failure === undefined && closureFailure?.status === 'rejected')
        failure = closureFailure.reason;
      this.status = 'stopped';
    }
    this.dependencies.logger.info('Coordinator stopped', {
      shutdownTimedOut: this.shutdownTimedOut,
    });
    if (failure !== undefined) throw failure;
  }

  private async runLoop(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      try {
        const launched = await this.launchQueued();
        if (launched > 0) continue;
        await delay(this.dependencies.pollIntervalMs, signal);
      } catch (error) {
        if (signal.aborted) break;
        this.recordFailure(error);
        this.dependencies.logger.error('Coordinator loop failed', {
          code: error instanceof NoOrgError ? error.code : 'COORDINATOR_LOOP_FAILED',
        });
        await delay(this.dependencies.pollIntervalMs, signal).catch(() => undefined);
      }
    }
  }

  private async launchQueued(): Promise<number> {
    let launched = 0;
    const available = Math.max(
      0,
      this.dependencies.maxConcurrentTasks - this.dependencies.registry.activeCount()
    );
    if (available === 0) return 0;
    for (const task of this.repository.list('queued')) {
      if (launched >= available) break;
      const now = this.dependencies.clock.now().getTime();
      if (task.deadlineAt !== undefined && Date.parse(task.deadlineAt) <= now) {
        const expired = await this.repository.failQueued(task.id, {
          code: 'TASK_DEADLINE_EXCEEDED',
          message: 'Task deadline elapsed before execution started',
          retryable: false,
        });
        this.dependencies.metrics.increment('tasks_failed');
        await this.publishSafely('task.failed', expired);
        continue;
      }
      if (task.nextAttemptAt !== undefined && Date.parse(task.nextAttemptAt) > now) continue;
      const dependencyState = this.dependencyState(task);
      if (dependencyState === 'failed') {
        const failed = await this.repository.failQueued(task.id, {
          code: 'TASK_DEPENDENCY_FAILED',
          message: 'A required task failed or was cancelled',
          retryable: false,
        });
        this.dependencies.metrics.increment('tasks_failed');
        await this.publishSafely('task.failed', failed);
        continue;
      }
      if (dependencyState === 'blocked') continue;
      const parentState = this.parentState(task);
      if (parentState === 'failed') {
        const failed = await this.repository.failQueued(task.id, {
          code: 'TASK_PARENT_FAILED',
          message: 'The required parent task failed or was cancelled',
          retryable: false,
        });
        this.dependencies.metrics.increment('tasks_failed');
        await this.publishSafely('task.failed', failed);
        continue;
      }
      if (parentState === 'blocked') continue;
      const candidate = this.toAgentTask(task);
      const lease = this.dependencies.registry.acquire(candidate);
      if (!lease) continue;
      let started: TaskRecord;
      try {
        started = await this.repository.start(task.id, lease.agent.descriptor.id);
      } catch (error) {
        lease.release();
        this.recordFailure(error);
        this.dependencies.logger.error('Unable to claim task', {
          taskId: task.id,
          error,
        });
        continue;
      }
      const controller = new AbortController();
      this.taskControllers.set(started.id, controller);
      const execution = this.execute(started, lease.agent, controller, lease.release);
      this.runningTasks.add(execution);
      void execution.then(
        () => this.runningTasks.delete(execution),
        error => {
          this.runningTasks.delete(execution);
          this.recordFailure(error);
        }
      );
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
    const operation = Promise.resolve().then(() =>
      agent.execute(this.toAgentTask(task), controller.signal)
    );
    let timer: NodeJS.Timeout | undefined;
    let timedOut = false;
    let timeoutTransition: Promise<void> | undefined;
    const timeoutMs = this.effectiveTimeoutMs(task);
    const timeout = new Promise<AgentResult>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
        timeoutTransition = this.recordFailureTransition(task.id, {
          code: 'TASK_TIMEOUT',
          message: `Operation exceeded ${timeoutMs}ms`,
          retryable: true,
        });
        reject(new NoOrgTimeoutError(timeoutMs));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([operation, timeout]);
      const current = this.repository.get(task.id);
      if (this.status === 'running' && current?.status === 'running') {
        const taskUsage = this.dependencies.provider.getTaskUsage?.(task.id);
        const completed = await this.repository.completeWithUsage(
          task.id,
          agent.validateResult(result),
          taskUsage
        );
        this.dependencies.metrics.increment('tasks_completed');
        this.dependencies.metrics.observe(
          'task_duration_ms',
          this.dependencies.clock.now().getTime() - startedAt
        );
        await this.publishSafely('task.completed', completed);
      }
    } catch (error) {
      if (timedOut) {
        await timeoutTransition?.catch(timeoutError => this.recordFailure(timeoutError));
        await operation.catch(() => undefined);
        await this.recordProviderUsage(task.id);
      } else {
        await this.recordProviderUsage(task.id);
        const current = this.repository.get(task.id);
        if (current?.status === 'running') {
          if (controller.signal.aborted) {
            const cancelled = await this.repository.cancel(task.id);
            this.dependencies.metrics.increment('tasks_cancelled');
            await this.publishSafely('task.cancelled', cancelled);
          } else {
            await this.recordFailureTransition(task.id, toTaskError(error));
          }
        } else if (!controller.signal.aborted) {
          this.recordFailure(error);
        }
      }
    } finally {
      if (timer) clearTimeout(timer);
      release();
      this.taskControllers.delete(task.id);
    }
  }

  private async recordFailureTransition(id: string, error: TaskError): Promise<void> {
    const current = this.repository.get(id);
    if (current?.status !== 'running') return;
    const failed = await this.repository.fail(id, error);
    this.dependencies.metrics.increment(
      failed.status === 'queued' ? 'tasks_retried' : 'tasks_failed'
    );
    this.recordFailure(error);
    await this.publishSafely(failed.status === 'queued' ? 'task.requeued' : 'task.failed', failed);
  }

  private async cancelRunningTasksForShutdown(): Promise<void> {
    for (const [id, controller] of this.taskControllers) {
      const current = this.repository.get(id);
      if (current?.status === 'running') {
        const cancelled = await this.repository.cancel(id).catch(error => {
          this.recordFailure(error);
          return undefined;
        });
        if (cancelled) {
          if (this.cancellationEvents.has(id)) {
            controller.abort();
            continue;
          }
          this.cancellationEvents.add(id);
          this.dependencies.metrics.increment('tasks_cancelled');
          await this.publishSafely('task.cancelled', cancelled);
        }
      }
      controller.abort();
    }
  }

  private toAgentTask(task: TaskRecord): AgentTask {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      input: task.input,
      requiredCapabilities: task.requiredCapabilities,
      priority: task.priority,
      priorityPolicy: task.priorityPolicy,
      timeoutMs: this.effectiveTimeoutMs(task),
      attempt: task.attempt,
      ...(task.deadlineAt === undefined ? {} : { deadlineAt: task.deadlineAt }),
      ...(task.parentTaskId === undefined ? {} : { parentTaskId: task.parentTaskId }),
      parentCompletionPolicy: task.parentCompletionPolicy,
      dependencyIds: task.dependencyIds,
      workflowDepth: task.workflowDepth,
      ...(task.agentId === undefined ? {} : { agentId: task.agentId }),
    };
  }

  private agentAvailability(task: TaskRecord): AgentAvailability {
    return this.dependencies.registry.availability(this.toAgentTask(task));
  }

  private effectiveTimeoutMs(task: TaskRecord): number {
    if (task.deadlineAt === undefined) return task.timeoutMs;
    return Math.max(
      1,
      Math.min(
        task.timeoutMs,
        Date.parse(task.deadlineAt) - this.dependencies.clock.now().getTime()
      )
    );
  }

  private dependencyState(task: TaskRecord): 'ready' | 'blocked' | 'failed' {
    if (task.dependencyIds.length === 0) return 'ready';
    const dependencies = task.dependencyIds.map(id => this.repository.get(id));
    if (dependencies.some(dependency => dependency === undefined)) return 'failed';
    if (
      dependencies.some(
        dependency => dependency?.status === 'failed' || dependency?.status === 'cancelled'
      )
    )
      return 'failed';
    return dependencies.every(dependency => dependency?.status === 'completed')
      ? 'ready'
      : 'blocked';
  }

  private parentState(task: TaskRecord): 'ready' | 'blocked' | 'failed' {
    if (task.parentTaskId === undefined || task.parentCompletionPolicy === 'independent')
      return 'ready';
    const parent = this.repository.get(task.parentTaskId);
    if (parent === undefined || parent.status === 'failed' || parent.status === 'cancelled')
      return 'failed';
    return parent.status === 'completed' ? 'ready' : 'blocked';
  }

  private async recordProviderUsage(taskId: string): Promise<void> {
    const usage = this.dependencies.provider.getTaskUsage?.(taskId);
    if (usage === undefined || (usage.totalTokens === 0 && usage.costUsd === 0)) return;
    await this.repository.recordUsage(taskId, usage).catch(error => {
      if (!(error instanceof NoOrgError && error.code === 'INVALID_TASK_TRANSITION'))
        this.recordFailure(error);
    });
  }

  private async publishSafely(type: string, task: TaskRecord): Promise<void> {
    const event: RuntimeEvent = {
      type,
      id: randomUUID(),
      timestamp: this.dependencies.clock.now().toISOString(),
      payload: { task: redactJsonValue(task as unknown as JsonValue) as JsonValue },
    };
    try {
      await this.dependencies.events.publish(event);
    } catch (error) {
      this.recordFailure(error);
      this.dependencies.logger.error('Runtime event delivery failed', { type, error });
      this.dependencies.metrics.increment('event_delivery_failures');
    }
  }

  private recordFailure(error: unknown): void {
    const taskError = toTaskError(error);
    this.lastFailure = {
      code: taskError.code,
      message: taskError.message,
      timestamp: this.dependencies.clock.now().toISOString(),
    };
  }

  private refreshMetrics(usage: ReturnType<LLMProvider['getUsage']>): void {
    const queued = this.repository.list('queued');
    const blocked = this.blockedTaskCounts(queued);
    this.dependencies.metrics.setGauge('active_tasks', this.dependencies.registry.activeCount());
    this.dependencies.metrics.setGauge('queue_depth', queued.length);
    this.dependencies.metrics.setGauge('blocked_tasks', blocked.total);
    this.dependencies.metrics.setGauge('blocked_capability_tasks', blocked.capability);
    this.dependencies.metrics.setGauge('blocked_capacity_tasks', blocked.capacity);
    this.dependencies.metrics.setGauge('state_revision', this.dependencies.state.revision());
    this.dependencies.metrics.setGauge('provider_prompt_tokens', usage.promptTokens);
    this.dependencies.metrics.setGauge('provider_completion_tokens', usage.completionTokens);
    this.dependencies.metrics.setGauge('provider_cost_usd', usage.costUsd);
  }

  private blockedTaskCounts(tasks: readonly TaskRecord[]): {
    readonly total: number;
    readonly capability: number;
    readonly capacity: number;
  } {
    let capability = 0;
    let capacity = 0;
    for (const task of tasks) {
      const availability = this.agentAvailability(task);
      if (availability === 'no_match') capability += 1;
      if (availability === 'at_capacity') capacity += 1;
    }
    return { total: capability + capacity, capability, capacity };
  }
}
