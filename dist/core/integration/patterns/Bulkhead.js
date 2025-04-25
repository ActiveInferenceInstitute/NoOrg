"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bulkhead = void 0;
const EventSystem_1 = require("../../events/EventSystem");
class BulkheadError extends Error {
    constructor(message, metrics) {
        super(message);
        this.metrics = metrics;
        this.name = 'BulkheadError';
    }
}
class Bulkhead {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.active = new Set();
        this.queue = [];
        this.metrics = {
            name,
            active: 0,
            queued: 0,
            successCount: 0,
            failureCount: 0,
            timeoutCount: 0,
            rejectedCount: 0
        };
        // Start queue processing
        setInterval(() => this.processQueue(), 100);
        // Emit metrics periodically
        setInterval(() => this.emitMetrics(), 5000);
    }
    static getBulkhead(name, config) {
        if (!Bulkhead.bulkheads.has(name)) {
            Bulkhead.bulkheads.set(name, new Bulkhead(name, config));
        }
        return Bulkhead.bulkheads.get(name);
    }
    async execute(task) {
        if (this.active.size >= this.config.maxConcurrent) {
            if (this.queue.length >= this.config.maxQueue) {
                this.metrics.rejectedCount++;
                this.emitMetrics();
                throw new BulkheadError('Bulkhead queue full', this.getMetrics());
            }
            return new Promise((resolve, reject) => {
                const queueItem = {
                    resolve,
                    reject,
                    task,
                    timestamp: Date.now()
                };
                this.queue.push(queueItem);
                this.metrics.queued = this.queue.length;
                this.emitMetrics();
            });
        }
        return this.executeTask(task);
    }
    async executeTask(task) {
        const taskPromise = this.runTask(task);
        this.active.add(taskPromise);
        this.metrics.active = this.active.size;
        this.emitMetrics();
        try {
            const result = await taskPromise;
            this.metrics.successCount++;
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                this.metrics.timeoutCount++;
            }
            else {
                this.metrics.failureCount++;
            }
            throw error;
        }
        finally {
            this.active.delete(taskPromise);
            this.metrics.active = this.active.size;
            this.emitMetrics();
        }
    }
    async runTask(task) {
        if (this.config.timeout) {
            return Promise.race([
                task(),
                new Promise((_, reject) => {
                    setTimeout(() => {
                        const error = new Error(`Task timeout after ${this.config.timeout}ms`);
                        error.name = 'TimeoutError';
                        reject(error);
                    }, this.config.timeout);
                })
            ]);
        }
        return task();
    }
    async processQueue() {
        if (this.queue.length === 0 || this.active.size >= this.config.maxConcurrent) {
            return;
        }
        const item = this.queue.shift();
        this.metrics.queued = this.queue.length;
        try {
            const result = await this.executeTask(item.task);
            item.resolve(result);
        }
        catch (error) {
            item.reject(error);
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    emitMetrics() {
        this.eventSystem.emit('bulkhead:metrics', {
            name: this.name,
            metrics: this.getMetrics()
        });
    }
    dispose() {
        Bulkhead.bulkheads.delete(this.name);
    }
}
exports.Bulkhead = Bulkhead;
Bulkhead.bulkheads = new Map();
//# sourceMappingURL=Bulkhead.js.map