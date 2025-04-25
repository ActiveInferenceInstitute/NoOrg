import { EventSystem } from '../../events/EventSystem';

export interface RateLimiterConfig {
  requestsPerPeriod: number;
  periodInMs: number;
  maxQueueSize?: number;
  queueTimeout?: number;
}

export interface RateLimiterMetrics {
  totalRequests: number;
  successfulRequests: number;
  rejectedRequests: number;
  queuedRequests: number;
  currentQueueSize: number;
  lastRequestTime: number;
  periodStart: number;
  requestsInCurrentPeriod: number;
}

interface QueuedRequest<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  fn: (...args: any[]) => Promise<T>;
  args: any[];
  queueTime: number;
}

type WrappedFunction<T> = (...args: any[]) => Promise<T>;

export class RateLimiter {
  private static limiters = new Map<string, RateLimiter>();
  private eventSystem: EventSystem;
  private config: RateLimiterConfig;
  private metrics: RateLimiterMetrics;
  private queue: Array<QueuedRequest<any>> = [];
  private processing = false;
  private tokenBucket: number;
  private lastRefillTime: number;
  
  constructor(
    private name: string,
    config: Partial<RateLimiterConfig> = {}
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.config = {
      requestsPerPeriod: 10,
      periodInMs: 1000, // 1 second
      maxQueueSize: 100,
      queueTimeout: 30000, // 30 seconds
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      currentQueueSize: 0,
      lastRequestTime: 0,
      periodStart: Date.now(),
      requestsInCurrentPeriod: 0
    };

    this.tokenBucket = this.config.requestsPerPeriod;
    this.lastRefillTime = Date.now();
  }

  public static getLimiter(name: string, config?: Partial<RateLimiterConfig>): RateLimiter {
    if (!RateLimiter.limiters.has(name)) {
      RateLimiter.limiters.set(name, new RateLimiter(name, config));
    }
    return RateLimiter.limiters.get(name)!;
  }

  public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T> {
    return async (...args: any[]): Promise<T> => {
      this.metrics.totalRequests++;
      this.metrics.lastRequestTime = Date.now();

      this.refillTokens();

      // If we have tokens available, process immediately
      if (this.tokenBucket > 0) {
        this.tokenBucket--;
        this.metrics.requestsInCurrentPeriod++;
        this.metrics.successfulRequests++;
        this.emitMetricsEvent();
        return await fn(...args);
      }

      // Otherwise, check if we can queue
      if (this.queue.length >= (this.config.maxQueueSize || 0)) {
        this.metrics.rejectedRequests++;
        this.emitMetricsEvent();
        throw new Error(`Rate limit exceeded for ${this.name} and queue is full`);
      }

      // Add to queue
      return new Promise<T>((resolve, reject) => {
        const queuedRequest: QueuedRequest<T> = {
          resolve,
          reject,
          fn,
          args,
          queueTime: Date.now()
        };

        this.queue.push(queuedRequest);
        this.metrics.queuedRequests++;
        this.metrics.currentQueueSize = this.queue.length;
        
        this.emitMetricsEvent();
        this.emitQueueEvent(queuedRequest);
        
        this.processQueue();
      });
    };
  }

  public async execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T> {
    return this.wrap(fn)(...args);
  }

  public getMetrics(): RateLimiterMetrics {
    return { ...this.metrics };
  }

  public reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      currentQueueSize: 0,
      lastRequestTime: 0,
      periodStart: Date.now(),
      requestsInCurrentPeriod: 0
    };
    this.tokenBucket = this.config.requestsPerPeriod;
    this.lastRefillTime = Date.now();
    this.emitMetricsEvent();
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTime;
    
    if (elapsedTime >= this.config.periodInMs) {
      // Reset for a new period
      this.tokenBucket = this.config.requestsPerPeriod;
      this.lastRefillTime = now;
      this.metrics.periodStart = now;
      this.metrics.requestsInCurrentPeriod = 0;
    } else {
      // Partial refill based on elapsed time proportion
      const tokensToAdd = Math.floor(
        (elapsedTime / this.config.periodInMs) * this.config.requestsPerPeriod
      );
      
      if (tokensToAdd > 0) {
        this.tokenBucket = Math.min(
          this.tokenBucket + tokensToAdd,
          this.config.requestsPerPeriod
        );
        this.lastRefillTime = now;
      }
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        this.refillTokens();

        if (this.tokenBucket <= 0) {
          // Wait for next token refill
          const waitTime = this.calculateWaitTime();
          await this.sleep(waitTime);
          continue;
        }

        const request = this.queue[0];
        const now = Date.now();
        
        // Check for request timeout
        if (now - request.queueTime > (this.config.queueTimeout || 0)) {
          this.queue.shift();
          this.metrics.currentQueueSize = this.queue.length;
          request.reject(new Error(`Request timed out after ${this.config.queueTimeout}ms in queue`));
          continue;
        }

        // Process the request
        this.tokenBucket--;
        this.metrics.requestsInCurrentPeriod++;
        
        try {
          const result = await request.fn(...request.args);
          request.resolve(result);
          this.metrics.successfulRequests++;
        } catch (error) {
          request.reject(error);
        }

        this.queue.shift();
        this.metrics.currentQueueSize = this.queue.length;
        this.emitMetricsEvent();
      }
    } finally {
      this.processing = false;
    }
  }

  private calculateWaitTime(): number {
    const tokensNeeded = 1;
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTime;
    const timePerToken = this.config.periodInMs / this.config.requestsPerPeriod;
    
    return Math.max(0, timePerToken - elapsedTime);
  }

  private emitQueueEvent(request: QueuedRequest<any>): void {
    this.eventSystem.emit('rate_limiter:queued', {
      name: this.name,
      queueLength: this.queue.length,
      queueTime: request.queueTime,
      metrics: this.getMetrics()
    });
  }

  private emitMetricsEvent(): void {
    this.eventSystem.emit('rate_limiter:metrics', {
      name: this.name,
      metrics: this.getMetrics()
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public dispose(): void {
    // Clear any queued requests
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      request.reject(new Error(`Rate limiter ${this.name} disposed`));
    }
    
    RateLimiter.limiters.delete(this.name);
  }
} 