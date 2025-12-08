"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const EventSystem_1 = require("../../events/EventSystem");
class RateLimiter {
    constructor(name, config = {}) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "eventSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "processing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "tokenBucket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastRefillTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.config = {
            requestsPerPeriod: 10,
            periodInMs: 1000, // 1 second
            maxQueueSize: 100,
            queueTimeout: 30000, // 30 seconds
            ...config
        };
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            rejectedRequests: 0,
            queuedRequests: 0,
            currentQueueSize: 0,
            lastRequestTime: 0,
            periodStart: Date.now(),
            requestsInCurrentPeriod: 0
        };
        this.tokenBucket = this.config.requestsPerPeriod;
        this.lastRefillTime = Date.now();
    }
    static getLimiter(name, config) {
        if (!RateLimiter.limiters.has(name)) {
            RateLimiter.limiters.set(name, new RateLimiter(name, config));
        }
        return RateLimiter.limiters.get(name);
    }
    wrap(fn) {
        return async (...args) => {
            this.metrics.totalRequests++;
            this.metrics.lastRequestTime = Date.now();
            this.refillTokens();
            // If we have tokens available, process immediately
            if (this.tokenBucket > 0) {
                this.tokenBucket--;
                this.metrics.requestsInCurrentPeriod++;
                this.metrics.successfulRequests++;
                this.emitMetricsEvent();
                return await fn(...args);
            }
            // Otherwise, check if we can queue
            if (this.queue.length >= (this.config.maxQueueSize || 0)) {
                this.metrics.rejectedRequests++;
                this.emitMetricsEvent();
                throw new Error(`Rate limit exceeded for ${this.name} and queue is full`);
            }
            // Add to queue
            return new Promise((resolve, reject) => {
                const queuedRequest = {
                    resolve,
                    reject,
                    fn,
                    args,
                    queueTime: Date.now()
                };
                this.queue.push(queuedRequest);
                this.metrics.queuedRequests++;
                this.metrics.currentQueueSize = this.queue.length;
                this.emitMetricsEvent();
                this.emitQueueEvent(queuedRequest);
                this.processQueue();
            });
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
            totalRequests: 0,
            successfulRequests: 0,
            rejectedRequests: 0,
            queuedRequests: 0,
            currentQueueSize: 0,
            lastRequestTime: 0,
            periodStart: Date.now(),
            requestsInCurrentPeriod: 0
        };
        this.tokenBucket = this.config.requestsPerPeriod;
        this.lastRefillTime = Date.now();
        this.emitMetricsEvent();
    }
    refillTokens() {
        const now = Date.now();
        const elapsedTime = now - this.lastRefillTime;
        if (elapsedTime >= this.config.periodInMs) {
            // Reset for a new period
            this.tokenBucket = this.config.requestsPerPeriod;
            this.lastRefillTime = now;
            this.metrics.periodStart = now;
            this.metrics.requestsInCurrentPeriod = 0;
        }
        else {
            // Partial refill based on elapsed time proportion
            const tokensToAdd = Math.floor((elapsedTime / this.config.periodInMs) * this.config.requestsPerPeriod);
            if (tokensToAdd > 0) {
                this.tokenBucket = Math.min(this.tokenBucket + tokensToAdd, this.config.requestsPerPeriod);
                this.lastRefillTime = now;
            }
        }
    }
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        try {
            while (this.queue.length > 0) {
                this.refillTokens();
                if (this.tokenBucket <= 0) {
                    // Wait for next token refill
                    const waitTime = this.calculateWaitTime();
                    await this.sleep(waitTime);
                    continue;
                }
                const request = this.queue[0];
                const now = Date.now();
                // Check for request timeout
                if (now - request.queueTime > (this.config.queueTimeout || 0)) {
                    this.queue.shift();
                    this.metrics.currentQueueSize = this.queue.length;
                    request.reject(new Error(`Request timed out after ${this.config.queueTimeout}ms in queue`));
                    continue;
                }
                // Process the request
                this.tokenBucket--;
                this.metrics.requestsInCurrentPeriod++;
                try {
                    const result = await request.fn(...request.args);
                    request.resolve(result);
                    this.metrics.successfulRequests++;
                }
                catch (error) {
                    request.reject(error);
                }
                this.queue.shift();
                this.metrics.currentQueueSize = this.queue.length;
                this.emitMetricsEvent();
            }
        }
        finally {
            this.processing = false;
        }
    }
    calculateWaitTime() {
        const tokensNeeded = 1;
        const now = Date.now();
        const elapsedTime = now - this.lastRefillTime;
        const timePerToken = this.config.periodInMs / this.config.requestsPerPeriod;
        return Math.max(0, timePerToken - elapsedTime);
    }
    emitQueueEvent(request) {
        this.eventSystem.emit('rate_limiter:queued', {
            name: this.name,
            queueLength: this.queue.length,
            queueTime: request.queueTime,
            metrics: this.getMetrics()
        });
    }
    emitMetricsEvent() {
        this.eventSystem.emit('rate_limiter:metrics', {
            name: this.name,
            metrics: this.getMetrics()
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    dispose() {
        // Clear any queued requests
        while (this.queue.length > 0) {
            const request = this.queue.shift();
            request.reject(new Error(`Rate limiter ${this.name} disposed`));
        }
        RateLimiter.limiters.delete(this.name);
    }
}
exports.RateLimiter = RateLimiter;
Object.defineProperty(RateLimiter, "limiters", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
//# sourceMappingURL=RateLimiter.js.map