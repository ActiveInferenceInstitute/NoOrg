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
export declare class Timeout {
    private name;
    private config;
    private static timeouts;
    private eventSystem;
    private metrics;
    private executionTimes;
    constructor(name: string, config: TimeoutConfig);
    static getTimeout(name: string, config: TimeoutConfig): Timeout;
    execute<T>(task: () => Promise<T>): Promise<T>;
    private executeWithTimeout;
    private delay;
    private updateExecutionTime;
    getMetrics(): TimeoutMetrics;
    private emitMetrics;
    dispose(): void;
}
