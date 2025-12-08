/**
 * Saga Pattern for Distributed Transactions
 * Coordinates a sequence of transactions with compensating actions
 */
export type SagaStepFunction<T = any, R = any> = (context: T) => Promise<R>;
export type CompensationFunction<T = any> = (context: T, result?: any) => Promise<void>;
export interface SagaStep<T = any> {
    name: string;
    action: SagaStepFunction<T>;
    compensation: CompensationFunction<T>;
    timeout?: number;
    retryable?: boolean;
    maxRetries?: number;
}
export interface SagaConfig {
    timeout?: number;
    onStepComplete?: (step: SagaStep, result: any) => void;
    onStepFailed?: (step: SagaStep, error: Error) => void;
    onCompensationComplete?: (step: SagaStep) => void;
    onCompensationFailed?: (step: SagaStep, error: Error) => void;
}
export interface SagaResult<T = any> {
    success: boolean;
    context: T;
    results: any[];
    error?: Error;
    compensated: boolean;
    failedStep?: string;
}
export interface SagaExecutionContext<T = any> {
    data: T;
    metadata: Record<string, any>;
    stepResults: Map<string, any>;
}
/**
 * Saga Pattern Implementation
 */
export declare class SagaPattern<T = any> {
    private config;
    private steps;
    constructor(config?: SagaConfig);
    /**
     * Add a step to the saga
     */
    addStep(step: SagaStep<T>): this;
    /**
     * Execute the saga
     */
    execute(initialContext: T): Promise<SagaResult<T>>;
    /**
     * Execute a single step with retry logic
     */
    private executeStep;
    /**
     * Compensate completed steps in reverse order
     */
    private compensate;
    /**
     * Create a saga builder
     */
    static builder<T>(): SagaBuilder<T>;
}
/**
 * Saga Builder for fluent API
 */
export declare class SagaBuilder<T> {
    private steps;
    private config;
    /**
     * Add a step
     */
    step(name: string, action: SagaStepFunction<T>, compensation: CompensationFunction<T>): this;
    /**
     * Add a step with options
     */
    stepWithOptions(step: SagaStep<T>): this;
    /**
     * Set timeout
     */
    timeout(ms: number): this;
    /**
     * Set step complete callback
     */
    onStepComplete(callback: (step: SagaStep, result: any) => void): this;
    /**
     * Set step failed callback
     */
    onStepFailed(callback: (step: SagaStep, error: Error) => void): this;
    /**
     * Build the saga
     */
    build(): SagaPattern<T>;
}
//# sourceMappingURL=Saga.d.ts.map