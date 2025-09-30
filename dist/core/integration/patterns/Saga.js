"use strict";
/**
 * Saga Pattern for Distributed Transactions
 * Coordinates a sequence of transactions with compensating actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaBuilder = exports.SagaPattern = void 0;
/**
 * Saga Pattern Implementation
 */
class SagaPattern {
    constructor(config = {}) {
        this.steps = [];
        this.config = config;
    }
    /**
     * Add a step to the saga
     */
    addStep(step) {
        this.steps.push(step);
        return this;
    }
    /**
     * Execute the saga
     */
    async execute(initialContext) {
        const context = {
            data: initialContext,
            metadata: {},
            stepResults: new Map()
        };
        const completedSteps = [];
        let failedStep;
        let error;
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
                }
                catch (err) {
                    error = err;
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
        }
        catch (err) {
            // A step failed - compensate completed steps in reverse order
            error = err;
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
    async executeStep(step, context) {
        const timeout = step.timeout || this.config.timeout || 30000;
        const maxRetries = step.retryable !== false ? (step.maxRetries || 3) : 0;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Execute with timeout
                const result = await Promise.race([
                    step.action(context.data),
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`Step ${step.name} timeout`)), timeout))
                ]);
                return result;
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000)));
                }
            }
        }
        throw lastError || new Error(`Step ${step.name} failed after ${maxRetries} retries`);
    }
    /**
     * Compensate completed steps in reverse order
     */
    async compensate(completedSteps, context) {
        for (const { step, result } of completedSteps) {
            try {
                await step.compensation(context.data, result);
                if (this.config.onCompensationComplete) {
                    this.config.onCompensationComplete(step);
                }
            }
            catch (error) {
                // Log compensation failure but continue
                if (this.config.onCompensationFailed) {
                    this.config.onCompensationFailed(step, error);
                }
            }
        }
    }
    /**
     * Create a saga builder
     */
    static builder() {
        return new SagaBuilder();
    }
}
exports.SagaPattern = SagaPattern;
/**
 * Saga Builder for fluent API
 */
class SagaBuilder {
    constructor() {
        this.steps = [];
        this.config = {};
    }
    /**
     * Add a step
     */
    step(name, action, compensation) {
        this.steps.push({ name, action, compensation });
        return this;
    }
    /**
     * Add a step with options
     */
    stepWithOptions(step) {
        this.steps.push(step);
        return this;
    }
    /**
     * Set timeout
     */
    timeout(ms) {
        this.config.timeout = ms;
        return this;
    }
    /**
     * Set step complete callback
     */
    onStepComplete(callback) {
        this.config.onStepComplete = callback;
        return this;
    }
    /**
     * Set step failed callback
     */
    onStepFailed(callback) {
        this.config.onStepFailed = callback;
        return this;
    }
    /**
     * Build the saga
     */
    build() {
        const saga = new SagaPattern(this.config);
        this.steps.forEach(step => saga.addStep(step));
        return saga;
    }
}
exports.SagaBuilder = SagaBuilder;
//# sourceMappingURL=Saga.js.map