import { NoOrgError } from '../domain/errors';
import type { Clock } from '../domain/clock';
import type { CompletionRequest, CompletionResponse, UsageMetadata } from '../domain/types';
import type { ZodType } from 'zod';
import type { LLMProvider } from './provider';

export interface ProviderGovernanceOptions {
  readonly budgetUsd?: number;
  readonly maxRequestsPerMinute?: number;
  readonly circuitFailureThreshold?: number;
  readonly circuitCooldownMs?: number;
  readonly clock?: Clock;
  readonly estimateRequestCost?: (request: CompletionRequest<unknown>) => number;
}

const zeroUsage: UsageMetadata = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  costUsd: 0,
};

export class GovernedProvider implements LLMProvider {
  public readonly kind;
  private readonly clock: Clock;
  private readonly budgetUsd: number | undefined;
  private readonly maxRequestsPerMinute: number;
  private readonly circuitFailureThreshold: number;
  private readonly circuitCooldownMs: number;
  private readonly estimateRequestCost: (request: CompletionRequest<unknown>) => number;
  private readonly requestTimes: number[] = [];
  private readonly taskUsage = new Map<string, UsageMetadata>();
  private consecutiveFailures = 0;
  private circuitOpenedAt: number | undefined;
  private halfOpen = false;
  private reservedBudgetUsd = 0;

  public constructor(
    private readonly inner: LLMProvider,
    options: ProviderGovernanceOptions = {}
  ) {
    this.kind = inner.kind;
    this.clock = options.clock ?? { now: () => new Date() };
    this.budgetUsd = options.budgetUsd;
    this.maxRequestsPerMinute = options.maxRequestsPerMinute ?? 0;
    this.circuitFailureThreshold = options.circuitFailureThreshold ?? 5;
    this.circuitCooldownMs = options.circuitCooldownMs ?? 30_000;
    this.estimateRequestCost = options.estimateRequestCost ?? (() => 0);
    if (
      (this.budgetUsd !== undefined && this.budgetUsd < 0) ||
      this.maxRequestsPerMinute < 0 ||
      this.circuitFailureThreshold < 1 ||
      this.circuitCooldownMs < 1
    ) {
      throw new NoOrgError('INVALID_PROVIDER_GOVERNANCE', 'Provider governance limits are invalid');
    }
  }

  public isOpen(): boolean {
    return this.inner.isOpen() && this.circuitOpenedAt === undefined;
  }

  public getUsage(): UsageMetadata {
    return this.inner.getUsage();
  }

  public getTaskUsage(taskId: string): UsageMetadata {
    return { ...(this.taskUsage.get(taskId) ?? zeroUsage) };
  }

  public async complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>> {
    this.assertCircuit();
    this.assertRateLimit();
    const reservation = this.reserveBudget(request);
    this.requestTimes.push(this.clock.now().getTime());
    try {
      const response = await this.inner.complete(request, schema, signal);
      if (request.taskId !== undefined) this.addTaskUsage(request.taskId, response.usage);
      if (this.budgetUsd !== undefined && this.inner.getUsage().costUsd > this.budgetUsd)
        throw new NoOrgError('PROVIDER_BUDGET_EXCEEDED', 'Provider budget was exceeded', false);
      this.consecutiveFailures = 0;
      this.circuitOpenedAt = undefined;
      this.halfOpen = false;
      return response;
    } catch (error) {
      if (this.countsAsProviderFailure(error)) {
        this.consecutiveFailures += 1;
        if (this.halfOpen || this.consecutiveFailures >= this.circuitFailureThreshold) {
          this.circuitOpenedAt = this.clock.now().getTime();
          this.halfOpen = false;
        }
      }
      throw error;
    } finally {
      this.reservedBudgetUsd = Math.max(0, this.reservedBudgetUsd - reservation);
    }
  }

  public async close(): Promise<void> {
    await this.inner.close();
  }

  private assertCircuit(): void {
    if (this.circuitOpenedAt === undefined) return;
    const elapsed = this.clock.now().getTime() - this.circuitOpenedAt;
    if (elapsed < this.circuitCooldownMs)
      throw new NoOrgError('PROVIDER_CIRCUIT_OPEN', 'Provider circuit is open', true);
    if (this.halfOpen)
      throw new NoOrgError('PROVIDER_CIRCUIT_OPEN', 'Provider circuit is probing', true);
    this.halfOpen = true;
  }

  private assertRateLimit(): void {
    if (this.maxRequestsPerMinute === 0) return;
    const cutoff = this.clock.now().getTime() - 60_000;
    while (this.requestTimes[0] !== undefined && this.requestTimes[0] <= cutoff)
      this.requestTimes.shift();
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      this.halfOpen = false;
      throw new NoOrgError('PROVIDER_RATE_LIMITED', 'Provider request rate limit exceeded', true);
    }
  }

  private reserveBudget<T>(request: CompletionRequest<T>): number {
    if (this.budgetUsd === undefined) return 0;
    const estimate = this.estimateRequestCost(request as CompletionRequest<unknown>);
    if (!Number.isFinite(estimate) || estimate < 0)
      throw new NoOrgError('INVALID_PROVIDER_GOVERNANCE', 'Provider cost estimate is invalid');
    const spent = this.inner.getUsage().costUsd;
    if (spent >= this.budgetUsd || spent + this.reservedBudgetUsd + estimate > this.budgetUsd) {
      this.halfOpen = false;
      throw new NoOrgError('PROVIDER_BUDGET_EXCEEDED', 'Provider budget was exceeded', false);
    }
    this.reservedBudgetUsd += estimate;
    return estimate;
  }

  private addTaskUsage(taskId: string, usage: UsageMetadata): void {
    const previous = this.taskUsage.get(taskId) ?? zeroUsage;
    this.taskUsage.set(taskId, {
      promptTokens: previous.promptTokens + usage.promptTokens,
      completionTokens: previous.completionTokens + usage.completionTokens,
      totalTokens: previous.totalTokens + usage.totalTokens,
      costUsd: previous.costUsd + usage.costUsd,
    });
  }

  private countsAsProviderFailure(error: unknown): boolean {
    return error instanceof NoOrgError
      ? error.code === 'PROVIDER_REQUEST_FAILED'
      : !(error instanceof DOMException && error.name === 'AbortError');
  }
}
