import { EventSystem } from '../../events/EventSystem';

export interface TimeoutConfig {
  timeout: number;
  retries?: number;
  backoff?: {
    initial: number;
    multiplier: number;
    maxDelay: number;
  };
}

export interface TimeoutMetrics {
  name: string;
  totalAttempts: number;
  successCount: number;
  timeoutCount: number;
  failureCount: number;
  averageExecutionTime: number;
}

class TimeoutError extends Error {
  constructor(message: string, public readonly metrics: TimeoutMetrics) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class Timeout {
  private static timeouts = new Map<string, Timeout>();
  private eventSystem: EventSystem;
  private metrics: TimeoutMetrics;
  private executionTimes: number[];

  constructor(
    private name: string,
    private config: TimeoutConfig
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.executionTimes = [];
    this.metrics = {
      name,
      totalAttempts: 0,
      successCount: 0,
      timeoutCount: 0,
      failureCount: 0,
      averageExecutionTime: 0
    };

    // Emit metrics periodically
    setInterval(() => this.emitMetrics(), 5000);
  }

  public static getTimeout(name: string, config: TimeoutConfig): Timeout {
    if (!Timeout.timeouts.has(name)) {
      Timeout.timeouts.set(name, new Timeout(name, config));
    }
    return Timeout.timeouts.get(name)!;
  }

  public async execute<T>(task: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    const maxRetries = this.config.retries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      this.metrics.totalAttempts++;

      try {
        const startTime = Date.now();
        const result = await this.executeWithTimeout(task);
        const executionTime = Date.now() - startTime;

        this.updateExecutionTime(executionTime);
        this.metrics.successCount++;
        this.emitMetrics();

        return result;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof TimeoutError) {
          this.metrics.timeoutCount++;
        } else {
          this.metrics.failureCount++;
        }

        if (attempt < maxRetries) {
          await this.delay(attempt);
        }
      }
    }

    throw lastError || new Error('Task failed after retries');
  }

  private async executeWithTimeout<T>(task: () => Promise<T>): Promise<T> {
    return Promise.race([
      task(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError(
            `Task timed out after ${this.config.timeout}ms`,
            this.getMetrics()
          ));
        }, this.config.timeout);
      })
    ]);
  }

  private async delay(attempt: number): Promise<void> {
    if (!this.config.backoff) return;

    const delay = Math.min(
      this.config.backoff.initial * Math.pow(this.config.backoff.multiplier, attempt),
      this.config.backoff.maxDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private updateExecutionTime(time: number): void {
    this.executionTimes.push(time);
    if (this.executionTimes.length > 100) {
      this.executionTimes.shift();
    }

    this.metrics.averageExecutionTime = this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
  }

  public getMetrics(): TimeoutMetrics {
    return { ...this.metrics };
  }

  private emitMetrics(): void {
    this.eventSystem.emit('timeout:metrics', {
      name: this.name,
      metrics: this.getMetrics()
    });
  }

  public dispose(): void {
    Timeout.timeouts.delete(this.name);
  }
} 