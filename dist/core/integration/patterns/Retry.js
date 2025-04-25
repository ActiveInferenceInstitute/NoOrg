"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Retry = void 0;
const EventSystem_1 = require("../../events/EventSystem");
class Retry {
    constructor(name, config = {}) {
        this.name = name;
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.config = {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
            retryableErrors: [],
            ...config
        };
        this.metrics = {
            attempts: 0,
            successes: 0,
            failures: 0,
            lastAttemptTime: 0,
            lastError: null
        };
    }
    static getRetrier(name, config) {
        if (!Retry.retriers.has(name)) {
            Retry.retriers.set(name, new Retry(name, config));
        }
        return Retry.retriers.get(name);
    }
    wrap(fn) {
        return async (...args) => {
            let attempt = 0;
            let delay = this.config.initialDelay;
            let lastError;
            while (attempt < this.config.maxAttempts) {
                attempt++;
                this.metrics.attempts++;
                this.metrics.lastAttemptTime = Date.now();
                try {
                    const result = await fn(...args);
                    this.onSuccess();
                    return result;
                }
                catch (error) {
                    lastError = error;
                    this.metrics.lastError = lastError;
                    if (!this.isRetryable(lastError) || attempt >= this.config.maxAttempts) {
                        this.onFailure(lastError);
                        throw lastError;
                    }
                    this.emitRetryEvent(lastError, attempt, delay);
                    await this.sleep(delay);
                    // Calculate next delay with exponential backoff
                    delay = Math.min(delay * (this.config.backoffFactor || 1), this.config.maxDelay || Number.MAX_SAFE_INTEGER);
                }
            }
            // This should never be reached due to the throw in the catch block,
            // but TypeScript requires a return statement
            throw new Error('Maximum retry attempts reached');
        };
    }
    async execute(fn, ...args) {
        return this.wrap(fn)(...args);
    }
    getMetrics() {
        return { ...this.metrics };
    }
    reset() {
        this.metrics = {
            attempts: 0,
            successes: 0,
            failures: 0,
            lastAttemptTime: 0,
            lastError: null
        };
        this.emitMetricsEvent();
    }
    isRetryable(error) {
        // If no specific errors are defined, all errors are retryable
        if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
            return true;
        }
        const errorString = error.toString();
        return this.config.retryableErrors.some(pattern => {
            if (typeof pattern === 'string') {
                return errorString.includes(pattern);
            }
            else {
                return pattern.test(errorString);
            }
        });
    }
    onSuccess() {
        this.metrics.successes++;
        this.emitMetricsEvent();
    }
    onFailure(error) {
        this.metrics.failures++;
        this.emitMetricsEvent();
        this.eventSystem.emit('retry:failure', {
            name: this.name,
            error,
            metrics: this.getMetrics()
        });
    }
    emitRetryEvent(error, attempt, nextDelay) {
        this.eventSystem.emit('retry:attempt', {
            name: this.name,
            error,
            attempt,
            nextDelay,
            metrics: this.getMetrics()
        });
    }
    emitMetricsEvent() {
        this.eventSystem.emit('retry:metrics', {
            name: this.name,
            metrics: this.getMetrics()
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    dispose() {
        Retry.retriers.delete(this.name);
    }
}
exports.Retry = Retry;
Retry.retriers = new Map();
//# sourceMappingURL=Retry.js.map