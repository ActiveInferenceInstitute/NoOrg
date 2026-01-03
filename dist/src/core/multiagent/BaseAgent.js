"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const OpenAIClient_1 = require("./OpenAIClient");
const SharedStateManager_1 = require("./SharedStateManager");
/**
 * BaseAgent provides core functionality for all agents
 */
class BaseAgent {
    constructor(config) {
        Object.defineProperty(this, "openAIClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sharedState", {
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
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'idle'
        });
        Object.defineProperty(this, "lastError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.config = config;
        this.openAIClient = config.openAIClient || new OpenAIClient_1.OpenAIClient();
        this.sharedState = config.sharedState || SharedStateManager_1.SharedStateManager.getInstance();
    }
    /**
     * Initialize the agent
     */
    async initialize() {
        try {
            this.status = 'idle';
            this.lastError = null;
            await this.sharedState.registerAgent(this.config.name, {
                id: this.config.id,
                name: this.config.name,
                type: this.constructor.name,
                status: this.status,
                lastActive: Date.now()
            });
        }
        catch (error) {
            this.status = 'error';
            this.lastError = error;
            throw error;
        }
    }
    /**
     * Get agent information
     */
    getAgentInfo() {
        return {
            name: this.config.name,
            type: this.constructor.name,
            status: this.status,
            lastError: this.lastError
        };
    }
    /**
     * Update agent status
     */
    updateStatus(newStatus) {
        this.status = newStatus;
        this.sharedState.updateAgentStatus(this.config.name, newStatus);
    }
    /**
     * Handle errors
     */
    handleError(error) {
        this.status = 'error';
        this.lastError = error;
        this.sharedState.updateAgentStatus(this.config.name, 'error');
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        try {
            this.updateStatus('offline');
            return true;
        }
        catch (error) {
            this.handleError(error);
            return false;
        }
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map