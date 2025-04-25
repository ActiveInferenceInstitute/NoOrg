"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedStateManager = void 0;
const Logger_1 = require("./Logger");
class SharedStateManager {
    constructor() {
        this.state = new Map();
        this.metadata = new Map();
        this.subscribers = new Map();
        this.callbacks = new Map();
        this.logger = new Logger_1.Logger('SharedStateManager');
    }
    static getInstance() {
        if (!SharedStateManager.instance) {
            SharedStateManager.instance = new SharedStateManager();
        }
        return SharedStateManager.instance;
    }
    async getState(path) {
        return this.state.get(path);
    }
    async setState(path, value, options) {
        this.state.set(path, value);
        const callbacks = this.callbacks.get(path) || [];
        for (const callback of callbacks) {
            callback(path, value, options.metadata);
        }
    }
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        return () => {
            this.subscribers.get(path)?.delete(callback);
            if (this.subscribers.get(path)?.size === 0) {
                this.subscribers.delete(path);
            }
        };
    }
    notifySubscribers(path, newValue, oldValue) {
        const subscribers = this.subscribers.get(path);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                }
                catch (error) {
                    this.logger.error('Error in subscriber callback', {
                        path,
                        error
                    });
                }
            });
        }
    }
    getMetadata(path) {
        return this.metadata.get(path);
    }
    async clearState() {
        this.state.clear();
        this.metadata.clear();
        this.subscribers.clear();
        this.callbacks.clear();
        this.logger.info('State cleared');
    }
    async loadState() {
        // Implementation for loading state from persistent storage
    }
    addCallback(path, callback) {
        const callbacks = this.callbacks.get(path) || [];
        callbacks.push(callback);
        this.callbacks.set(path, callbacks);
    }
    removeCallback(path, callback) {
        const callbacks = this.callbacks.get(path) || [];
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
}
exports.SharedStateManager = SharedStateManager;
//# sourceMappingURL=SharedStateManager.new.js.map