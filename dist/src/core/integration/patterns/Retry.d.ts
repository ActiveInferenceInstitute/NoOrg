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
export declare class Retry {
    private name;
    private static retriers;
    private eventSystem;
    private config;
    private metrics;
    constructor(name: string, config?: Partial<RetryConfig>);
    static getRetrier(name: string, config?: Partial<RetryConfig>): Retry;
    wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>;
    execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T>;
    getMetrics(): RetryMetrics;
    reset(): void;
    private isRetryable;
    private onSuccess;
    private onFailure;
    private emitRetryEvent;
    private emitMetricsEvent;
    private sleep;
    dispose(): void;
}
export {};
//# sourceMappingURL=Retry.d.ts.map