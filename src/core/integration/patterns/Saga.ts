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
export class SagaPattern<T = any> {
  private config: SagaConfig;
  private steps: SagaStep<T>[] = [];

  constructor(config: SagaConfig = {}) {
    this.config = config;
  }

  /**
   * Add a step to the saga
   */
  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Execute the saga
   */
  async execute(initialContext: T): Promise<SagaResult<T>> {
    const context: SagaExecutionContext<T> = {
      data: initialContext,
      metadata: {},
      stepResults: new Map()
    };

    const completedSteps: Array<{ step: SagaStep<T>; result: any }> = [];
    let failedStep: SagaStep<T> | undefined;
    let error: Error | undefined;

    try {
      // Execute each step in sequence
      for (const step of this.steps) {
        try {
          const result = await this.executeStep(step, context);
          context.stepResults.set(step.name, result);
          completedSteps.push({ step, result });

          if (this.config.onStepComplete) {
            this.config.onStepComplete(step, result);
          }
        } catch (err) {
          error = err as Error;
          failedStep = step;

          if (this.config.onStepFailed) {
            this.config.onStepFailed(step, error);
          }

          throw error; // Break out of loop to start compensation
        }
      }

      // All steps succeeded
      return {
        success: true,
        context: context.data,
        results: Array.from(context.stepResults.values()),
        compensated: false
      };

    } catch (err) {
      // A step failed - compensate completed steps in reverse order
      error = err as Error;
      await this.compensate(completedSteps.reverse(), context);

      return {
        success: false,
        context: context.data,
        results: Array.from(context.stepResults.values()),
        error,
        compensated: true,
        failedStep: failedStep?.name
      };
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStep(
    step: SagaStep<T>,
    context: SagaExecutionContext<T>
  ): Promise<any> {
    const timeout = step.timeout || this.config.timeout || 30000;
    const maxRetries = step.retryable !== false ? (step.maxRetries || 3) : 0;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await Promise.race([
          step.action(context.data),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Step ${step.name} timeout`)), timeout)
          )
        ]);

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve =>
            setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
          );
        }
      }
    }

    throw lastError || new Error(`Step ${step.name} failed after ${maxRetries} retries`);
  }

  /**
   * Compensate completed steps in reverse order
   */
  private async compensate(
    completedSteps: Array<{ step: SagaStep<T>; result: any }>,
    context: SagaExecutionContext<T>
  ): Promise<void> {
    for (const { step, result } of completedSteps) {
      try {
        await step.compensation(context.data, result);

        if (this.config.onCompensationComplete) {
          this.config.onCompensationComplete(step);
        }
      } catch (error) {
        // Log compensation failure but continue
        if (this.config.onCompensationFailed) {
          this.config.onCompensationFailed(step, error as Error);
        }
      }
    }
  }

  /**
   * Create a saga builder
   */
  static builder<T>(): SagaBuilder<T> {
    return new SagaBuilder<T>();
  }
}

/**
 * Saga Builder for fluent API
 */
export class SagaBuilder<T> {
  private steps: SagaStep<T>[] = [];
  private config: SagaConfig = {};

  /**
   * Add a step
   */
  step(
    name: string,
    action: SagaStepFunction<T>,
    compensation: CompensationFunction<T>
  ): this {
    this.steps.push({ name, action, compensation });
    return this;
  }

  /**
   * Add a step with options
   */
  stepWithOptions(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Set timeout
   */
  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  /**
   * Set step complete callback
   */
  onStepComplete(callback: (step: SagaStep, result: any) => void): this {
    this.config.onStepComplete = callback;
    return this;
  }

  /**
   * Set step failed callback
   */
  onStepFailed(callback: (step: SagaStep, error: Error) => void): this {
    this.config.onStepFailed = callback;
    return this;
  }

  /**
   * Build the saga
   */
  build(): SagaPattern<T> {
    const saga = new SagaPattern<T>(this.config);
    this.steps.forEach(step => saga.addStep(step));
    return saga;
  }
}
