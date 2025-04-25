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
type WrappedFunction<T> = (...args: any[]) => Promise<T>;
export declare class RateLimiter {
    private name;
    private static limiters;
    private eventSystem;
    private config;
    private metrics;
    private queue;
    private processing;
    private tokenBucket;
    private lastRefillTime;
    constructor(name: string, config?: Partial<RateLimiterConfig>);
    static getLimiter(name: string, config?: Partial<RateLimiterConfig>): RateLimiter;
    wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>;
    execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T>;
    getMetrics(): RateLimiterMetrics;
    reset(): void;
    private refillTokens;
    private processQueue;
    private calculateWaitTime;
    private emitQueueEvent;
    private emitMetricsEvent;
    private sleep;
    dispose(): void;
}
export {};
