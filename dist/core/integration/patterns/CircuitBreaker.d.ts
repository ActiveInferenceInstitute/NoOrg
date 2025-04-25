export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    halfOpenTimeout?: number;
    monitorInterval?: number;
}
export interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    lastStatusChange: number;
}
type WrappedFunction<T> = (...args: any[]) => Promise<T>;
export declare class CircuitBreaker {
    private name;
    private static breakers;
    private eventSystem;
    private state;
    private config;
    private monitorInterval?;
    constructor(name: string, config?: Partial<CircuitBreakerConfig>);
    static getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>;
    execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T>;
    getState(): CircuitBreakerState;
    reset(): void;
    private checkState;
    private onSuccess;
    private onFailure;
    private transitionTo;
    private emitStateChange;
    private startMonitoring;
    dispose(): void;
}
export {};
