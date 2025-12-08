"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
const EventSystem_1 = require("../../events/EventSystem");
class CircuitBreaker {
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
        Object.defineProperty(this, "state", {
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
        Object.defineProperty(this, "monitorInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.config = {
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            halfOpenTimeout: 30000, // 30 seconds
            monitorInterval: 5000, // 5 seconds
            ...config
        };
        this.state = {
            failures: 0,
            lastFailure: 0,
            status: 'CLOSED',
            lastStatusChange: Date.now()
        };
        this.startMonitoring();
    }
    static getBreaker(name, config) {
        if (!CircuitBreaker.breakers.has(name)) {
            CircuitBreaker.breakers.set(name, new CircuitBreaker(name, config));
        }
        return CircuitBreaker.breakers.get(name);
    }
    wrap(fn) {
        return async (...args) => {
            await this.checkState();
            try {
                const result = await fn(...args);
                this.onSuccess();
                return result;
            }
            catch (error) {
                this.onFailure(error);
                throw error;
            }
        };
    }
    async execute(fn, ...args) {
        return this.wrap(fn)(...args);
    }
    getState() {
        return { ...this.state };
    }
    reset() {
        this.state = {
            failures: 0,
            lastFailure: 0,
            status: 'CLOSED',
            lastStatusChange: Date.now()
        };
        this.emitStateChange();
    }
    async checkState() {
        const now = Date.now();
        switch (this.state.status) {
            case 'OPEN':
                if (now - this.state.lastStatusChange >= this.config.resetTimeout) {
                    this.transitionTo('HALF_OPEN');
                }
                else {
                    throw new Error(`Circuit breaker ${this.name} is OPEN`);
                }
                break;
            case 'HALF_OPEN':
                if (now - this.state.lastStatusChange >= this.config.halfOpenTimeout) {
                    this.transitionTo('CLOSED');
                }
                break;
        }
    }
    onSuccess() {
        if (this.state.status === 'HALF_OPEN') {
            this.transitionTo('CLOSED');
        }
        this.state.failures = 0;
    }
    onFailure(error) {
        this.state.failures++;
        this.state.lastFailure = Date.now();
        if (this.state.failures >= this.config.failureThreshold) {
            this.transitionTo('OPEN');
        }
        this.eventSystem.emit('circuit:failure', {
            name: this.name,
            error,
            state: this.getState()
        });
    }
    transitionTo(status) {
        this.state.status = status;
        this.state.lastStatusChange = Date.now();
        this.emitStateChange();
    }
    emitStateChange() {
        this.eventSystem.emit('circuit:state_change', {
            name: this.name,
            state: this.getState()
        });
    }
    startMonitoring() {
        if (this.config.monitorInterval) {
            this.monitorInterval = setInterval(() => {
                this.eventSystem.emit('circuit:monitor', {
                    name: this.name,
                    state: this.getState()
                });
            }, this.config.monitorInterval);
        }
    }
    dispose() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        CircuitBreaker.breakers.delete(this.name);
    }
}
exports.CircuitBreaker = CircuitBreaker;
Object.defineProperty(CircuitBreaker, "breakers", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
//# sourceMappingURL=CircuitBreaker.js.map