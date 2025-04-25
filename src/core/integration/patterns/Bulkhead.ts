import { EventSystem } from '../../events/EventSystem';

export interface BulkheadConfig {
  maxConcurrent: number;
  maxQueue: number;
  timeout?: number;
}

export interface BulkheadMetrics {
  name: string;
  active: number;
  queued: number;
  successCount: number;
  failureCount: number;
  timeoutCount: number;
  rejectedCount: number;
}

class BulkheadError extends Error {
  constructor(message: string, public readonly metrics: BulkheadMetrics) {
    super(message);
    this.name = 'BulkheadError';
  }
}

export class Bulkhead {
  private static bulkheads = new Map<string, Bulkhead>();
  private eventSystem: EventSystem;
  private active: Set<Promise<any>>;
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    task: () => Promise<any>;
    timestamp: number;
  }>;
  private metrics: BulkheadMetrics;

  constructor(
    private name: string,
    private config: BulkheadConfig
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.active = new Set();
    this.queue = [];
    this.metrics = {
      name,
      active: 0,
      queued: 0,
      successCount: 0,
      failureCount: 0,
      timeoutCount: 0,
      rejectedCount: 0
    };

    // Start queue processing
    setInterval(() => this.processQueue(), 100);

    // Emit metrics periodically
    setInterval(() => this.emitMetrics(), 5000);
  }

  public static getBulkhead(name: string, config: BulkheadConfig): Bulkhead {
    if (!Bulkhead.bulkheads.has(name)) {
      Bulkhead.bulkheads.set(name, new Bulkhead(name, config));
    }
    return Bulkhead.bulkheads.get(name)!;
  }

  public async execute<T>(task: () => Promise<T>): Promise<T> {
    if (this.active.size >= this.config.maxConcurrent) {
      if (this.queue.length >= this.config.maxQueue) {
        this.metrics.rejectedCount++;
        this.emitMetrics();
        throw new BulkheadError('Bulkhead queue full', this.getMetrics());
      }

      return new Promise((resolve, reject) => {
        const queueItem = {
          resolve,
          reject,
          task,
          timestamp: Date.now()
        };

        this.queue.push(queueItem);
        this.metrics.queued = this.queue.length;
        this.emitMetrics();
      });
    }

    return this.executeTask(task);
  }

  private async executeTask<T>(task: () => Promise<T>): Promise<T> {
    const taskPromise = this.runTask(task);
    this.active.add(taskPromise);
    this.metrics.active = this.active.size;
    this.emitMetrics();

    try {
      const result = await taskPromise;
      this.metrics.successCount++;
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.metrics.timeoutCount++;
      } else {
        this.metrics.failureCount++;
      }
      throw error;
    } finally {
      this.active.delete(taskPromise);
      this.metrics.active = this.active.size;
      this.emitMetrics();
    }
  }

  private async runTask<T>(task: () => Promise<T>): Promise<T> {
    if (this.config.timeout) {
      return Promise.race([
        task(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            const error = new Error(`Task timeout after ${this.config.timeout}ms`);
            error.name = 'TimeoutError';
            reject(error);
          }, this.config.timeout);
        })
      ]);
    }
    return task();
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.active.size >= this.config.maxConcurrent) {
      return;
    }

    const item = this.queue.shift()!;
    this.metrics.queued = this.queue.length;

    try {
      const result = await this.executeTask(item.task);
      item.resolve(result);
    } catch (error) {
      item.reject(error as Error);
    }
  }

  public getMetrics(): BulkheadMetrics {
    return { ...this.metrics };
  }

  private emitMetrics(): void {
    this.eventSystem.emit('bulkhead:metrics', {
      name: this.name,
      metrics: this.getMetrics()
    });
  }

  public dispose(): void {
    Bulkhead.bulkheads.delete(this.name);
  }
} 