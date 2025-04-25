"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeout = void 0;
const EventSystem_1 = require("../../events/EventSystem");
class TimeoutError extends Error {
    constructor(message, metrics) {
        super(message);
        this.metrics = metrics;
        this.name = 'TimeoutError';
    }
}
class Timeout {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.executionTimes = [];
        this.metrics = {
            name,
            totalAttempts: 0,
            successCount: 0,
            timeoutCount: 0,
            failureCount: 0,
            averageExecutionTime: 0
        };
        // Emit metrics periodically
        setInterval(() => this.emitMetrics(), 5000);
    }
    static getTimeout(name, config) {
        if (!Timeout.timeouts.has(name)) {
            Timeout.timeouts.set(name, new Timeout(name, config));
        }
        return Timeout.timeouts.get(name);
    }
    async execute(task) {
        let lastError;
        const maxRetries = this.config.retries || 0;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            this.metrics.totalAttempts++;
            try {
                const startTime = Date.now();
                const result = await this.executeWithTimeout(task);
                const executionTime = Date.now() - startTime;
                this.updateExecutionTime(executionTime);
                this.metrics.successCount++;
                this.emitMetrics();
                return result;
            }
            catch (error) {
                lastError = error;
                if (error instanceof TimeoutError) {
                    this.metrics.timeoutCount++;
                }
                else {
                    this.metrics.failureCount++;
                }
                if (attempt < maxRetries) {
                    await this.delay(attempt);
                }
            }
        }
        throw lastError || new Error('Task failed after retries');
    }
    async executeWithTimeout(task) {
        return Promise.race([
            task(),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new TimeoutError(`Task timed out after ${this.config.timeout}ms`, this.getMetrics()));
                }, this.config.timeout);
            })
        ]);
    }
    async delay(attempt) {
        if (!this.config.backoff)
            return;
        const delay = Math.min(this.config.backoff.initial * Math.pow(this.config.backoff.multiplier, attempt), this.config.backoff.maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    updateExecutionTime(time) {
        this.executionTimes.push(time);
        if (this.executionTimes.length > 100) {
            this.executionTimes.shift();
        }
        this.metrics.averageExecutionTime = this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    emitMetrics() {
        this.eventSystem.emit('timeout:metrics', {
            name: this.name,
            metrics: this.getMetrics()
        });
    }
    dispose() {
        Timeout.timeouts.delete(this.name);
    }
}
exports.Timeout = Timeout;
Timeout.timeouts = new Map();
//# sourceMappingURL=Timeout.js.map