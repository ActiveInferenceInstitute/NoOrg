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
export declare class Bulkhead {
    private name;
    private config;
    private static bulkheads;
    private eventSystem;
    private active;
    private queue;
    private metrics;
    constructor(name: string, config: BulkheadConfig);
    static getBulkhead(name: string, config: BulkheadConfig): Bulkhead;
    execute<T>(task: () => Promise<T>): Promise<T>;
    private executeTask;
    private runTask;
    private processQueue;
    getMetrics(): BulkheadMetrics;
    private emitMetrics;
    dispose(): void;
}
