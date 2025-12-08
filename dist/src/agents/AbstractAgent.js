"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractAgent = void 0;
const uuid_1 = require("uuid");
/**
 * Abstract base class for all agents in the multiagent system.
 * Handles common properties, initialization, status updates, and service access.
 */
class AbstractAgent {
    /**
     * Constructs a new AbstractAgent.
     * @param options - Configuration options for the agent.
     */
    constructor(options) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "capabilities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "preferredModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "createdAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        const timestamp = Date.now();
        this.id = options.id || (0, uuid_1.v4)();
        this.name = options.name;
        this.type = options.type;
        this.description = options.description;
        this.capabilities = options.capabilities;
        this.status = options.status || 'offline';
        this.metadata = options.metadata || {};
        this.preferredModel = options.preferredModel;
        this.lastActive = timestamp;
        this.createdAt = timestamp;
        // Store required services
        this.openAIClient = options.openAIClient;
        this.sharedState = options.sharedState;
    }
    /**
     * Initializes the agent, setting its status to 'available' and registering in shared state.
     * @returns True if initialization was successful, false otherwise.
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn(`Agent ${this.name} (${this.id}) already initialized.`);
            return true;
        }
        console.info(`Initializing agent ${this.name} (${this.id})...`);
        try {
            // Register initial agent state in shared state
            this.updateSharedState({ status: 'initializing', lastActive: Date.now() });
            // Perform any subclass-specific initialization (optional override)
            await this.onInitialize();
            // Mark agent as available
            this.isInitialized = true;
            this.updateStatus('available'); // This also updates shared state
            console.info(`Agent ${this.name} (${this.id}) initialized successfully.`);
            return true;
        }
        catch (error) {
            console.error(`Failed to initialize agent ${this.name} (${this.id}): ${error.message}`, error.stack);
            this.updateStatus('error'); // This also updates shared state
            this.isInitialized = false; // Ensure it's marked as not initialized on failure
            return false;
        }
    }
    /**
     * Optional hook for subclasses to perform specific initialization logic.
     */
    async onInitialize() {
        // Default implementation does nothing. Subclasses can override.
    }
    /**
     * Updates the agent's status and last active time, both locally and in shared state.
     * @param newStatus - The new status for the agent.
     */
    updateStatus(newStatus) {
        if (this.status === newStatus) {
            return; // No change needed
        }
        console.debug(`Agent ${this.name} (${this.id}) status changing from ${this.status} to ${newStatus}.`);
        this.status = newStatus;
        this.lastActive = Date.now();
        this.updateSharedState({ status: this.status, lastActive: this.lastActive });
    }
    /**
     * Provides the agent's core information.
     * @returns An object containing the agent's properties.
     */
    getAgentInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            capabilities: this.capabilities,
            status: this.status,
            metadata: this.metadata,
            preferredModel: this.preferredModel,
            lastActive: this.lastActive,
            createdAt: this.createdAt,
        };
    }
    /**
     * Updates the agent's representation in the SharedStateManager.
     * @param updates - An object containing the fields to update.
     */
    updateSharedState(updates) {
        try {
            // Get the current state or an empty object if it doesn't exist
            const currentState = this.sharedState.getState(`agents.${this.id}`) || {};
            // Merge updates with current state
            const newState = { ...currentState, ...updates };
            // Set the updated state
            this.sharedState.setState(`agents.${this.id}`, newState);
        }
        catch (error) {
            console.error(`Failed to update shared state for agent ${this.name} (${this.id}): ${error.message}`);
        }
    }
    /**
     * Shuts down the agent, setting its status to 'offline'.
     * Subclasses can override `onShutdown` for custom cleanup.
     * @returns True if shutdown was successful, false otherwise.
     */
    async shutdown() {
        if (this.status === 'offline') {
            console.warn(`Agent ${this.name} (${this.id}) already offline.`);
            return true;
        }
        console.info(`Shutting down agent ${this.name} (${this.id})...`);
        try {
            // Perform any subclass-specific shutdown logic
            await this.onShutdown();
            this.updateStatus('offline');
            this.isInitialized = false; // Mark as not initialized
            console.info(`Agent ${this.name} (${this.id}) shut down successfully.`);
            return true;
        }
        catch (error) {
            console.error(`Error during shutdown for agent ${this.name} (${this.id}): ${error.message}`, error.stack);
            // Still attempt to mark as offline, even if onShutdown fails
            this.updateStatus('offline');
            this.isInitialized = false;
            return false; // Indicate that shutdown had issues
        }
    }
    /**
     * Optional hook for subclasses to perform specific cleanup logic during shutdown.
     */
    async onShutdown() {
        // Default implementation does nothing. Subclasses can override.
    }
}
exports.AbstractAgent = AbstractAgent;
//# sourceMappingURL=AbstractAgent.js.map