import { EventSystem } from '../../events/EventSystem';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp>;
}

export interface RetryMetrics {
  attempts: number;
  successes: number;
  failures: number;
  lastAttemptTime: number;
  lastError: Error | null;
}

type WrappedFunction<T> = (...args: any[]) => Promise<T>;

export class Retry {
  private static retriers = new Map<string, Retry>();
  private eventSystem: EventSystem;
  private config: RetryConfig;
  private metrics: RetryMetrics;

  constructor(
    private name: string,
    config: Partial<RetryConfig> = {}
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.config = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryableErrors: [],
      ...config
    };

    this.metrics = {
      attempts: 0,
      successes: 0,
      failures: 0,
      lastAttemptTime: 0,
      lastError: null
    };
  }

  public static getRetrier(name: string, config?: Partial<RetryConfig>): Retry {
    if (!Retry.retriers.has(name)) {
      Retry.retriers.set(name, new Retry(name, config));
    }
    return Retry.retriers.get(name)!;
  }

  public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T> {
    return async (...args: any[]): Promise<T> => {
      let attempt = 0;
      let delay = this.config.initialDelay;
      let lastError: Error;

      while (attempt < this.config.maxAttempts) {
        attempt++;
        this.metrics.attempts++;
        this.metrics.lastAttemptTime = Date.now();

        try {
          const result = await fn(...args);
          this.onSuccess();
          return result;
        } catch (error) {
          lastError = error as Error;
          this.metrics.lastError = lastError;

          if (!this.isRetryable(lastError) || attempt >= this.config.maxAttempts) {
            this.onFailure(lastError);
            throw lastError;
          }

          this.emitRetryEvent(lastError, attempt, delay);
          
          await this.sleep(delay);
          
          // Calculate next delay with exponential backoff
          delay = Math.min(
            delay * (this.config.backoffFactor || 1),
            this.config.maxDelay || Number.MAX_SAFE_INTEGER
          );
        }
      }

      // This should never be reached due to the throw in the catch block,
      // but TypeScript requires a return statement
      throw new Error('Maximum retry attempts reached');
    };
  }

  public async execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T> {
    return this.wrap(fn)(...args);
  }

  public getMetrics(): RetryMetrics {
    return { ...this.metrics };
  }

  public reset(): void {
    this.metrics = {
      attempts: 0,
      successes: 0,
      failures: 0,
      lastAttemptTime: 0,
      lastError: null
    };
    this.emitMetricsEvent();
  }

  private isRetryable(error: Error): boolean {
    // If no specific errors are defined, all errors are retryable
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true;
    }

    const errorString = error.toString();
    
    return this.config.retryableErrors.some(pattern => {
      if (typeof pattern === 'string') {
        return errorString.includes(pattern);
      } else {
        return pattern.test(errorString);
      }
    });
  }

  private onSuccess(): void {
    this.metrics.successes++;
    this.emitMetricsEvent();
  }

  private onFailure(error: Error): void {
    this.metrics.failures++;
    this.emitMetricsEvent();
    
    this.eventSystem.emit('retry:failure', {
      name: this.name,
      error,
      metrics: this.getMetrics()
    });
  }

  private emitRetryEvent(error: Error, attempt: number, nextDelay: number): void {
    this.eventSystem.emit('retry:attempt', {
      name: this.name,
      error,
      attempt,
      nextDelay,
      metrics: this.getMetrics()
    });
  }

  private emitMetricsEvent(): void {
    this.eventSystem.emit('retry:metrics', {
      name: this.name,
      metrics: this.getMetrics()
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public dispose(): void {
    Retry.retriers.delete(this.name);
  }
} 