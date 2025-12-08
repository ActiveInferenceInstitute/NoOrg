"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedStateManager = void 0;
const uuid_1 = require("uuid");
const winston = __importStar(require("winston"));
const Logger_1 = require("./Logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        // Ensure logs directory exists or handle error
        // new winston.transports.File({ filename: 'logs/shared_state.log' }),
        new winston.transports.Console()
    ]
});
/**
 * SharedStateManager
 * Manages shared state between agents with synchronization capabilities
 */
class SharedStateManager {
    // Make constructor private for Singleton pattern
    constructor(persistencePath, autoSave = false, saveInterval = 60000) {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        // Track internal metadata like version separately if needed, not part of StateMetadata interface
        Object.defineProperty(this, "internalMetadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "subscriptionCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "persistencePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "autoSaveEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "autoSaveInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.logger = new Logger_1.Logger('SharedStateManager');
        this.configurePersistence(persistencePath, autoSave, saveInterval);
        logger.info('SharedStateManager initialized');
        // Consider loading state here if persistencePath is provided
        // this.loadState().catch(err => logger.error('Initial state load failed', err));
    }
    /**
     * Get the singleton instance
     * Optionally configure persistence on first call
     */
    static getInstance(persistencePath, autoSave, saveInterval) {
        if (!SharedStateManager.instance) {
            SharedStateManager.instance = new SharedStateManager(persistencePath, autoSave, saveInterval);
        }
        return SharedStateManager.instance;
    }
    /**
     * Configure persistence settings after initialization
     * @param path File path for persistence
     * @param autoSave Whether to auto-save
     * @param saveInterval Auto-save interval in ms
     */
    configurePersistence(path, autoSave = false, saveInterval = 60000) {
        this.persistencePath = path || null;
        this.autoSaveEnabled = autoSave && !!this.persistencePath;
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        if (this.autoSaveEnabled && this.persistencePath) {
            this.logger.info(`Configuring auto-save to ${this.persistencePath} every ${saveInterval}ms`);
            this.autoSaveInterval = setInterval(() => {
                this.saveState().catch(err => {
                    this.logger.error('Error auto-saving state:', { error: err });
                });
            }, saveInterval);
        }
        else {
            this.logger.info(`Persistence ${this.persistencePath ? 'path set but auto-save disabled' : 'not configured'}.`);
        }
    }
    /**
     * Get state value at a specific path
     * @param path Path to retrieve state from
     * @returns Promise resolving to the value or undefined
     */
    async getState(path) {
        try {
            const pathParts = path.split('.');
            let current = this.state;
            for (const part of pathParts) {
                if (current === undefined || current === null || typeof current !== 'object') {
                    return undefined;
                }
                current = current[part];
            }
            // Return a deep copy? For now, return as is.
            return current;
        }
        catch (error) {
            this.logger.error('Failed to get state', { path, error });
            throw error; // Re-throw error
        }
    }
    /**
     * Set state value at a specific path
     * @param path Path to set state at
     * @param value Value to set
     * @param options StateUpdateOptions including modifier and metadata
     */
    async setState(path, value, options) {
        try {
            const oldValue = this.getNestedValue(this.state, path); // Use helper for deep get
            this.setNestedValue(this.state, path, value); // Use helper for deep set
            // Update internal metadata (version, lastModified)
            const currentInternalMeta = this.internalMetadata.get(path) || { version: 0 };
            this.internalMetadata.set(path, {
                version: currentInternalMeta.version + 1,
                lastModified: new Date(),
            });
            // Notify subscribers, passing the metadata from options
            this.notifySubscribers(path, value, oldValue, options?.metadata);
            this.logger.info('State updated successfully', {
                path,
                modifiedBy: options?.modifiedBy,
                action: options?.metadata?.action
            });
            // Auto-save if enabled
            if (this.autoSaveEnabled) {
                await this.saveState();
            }
        }
        catch (error) {
            this.logger.error('Failed to update state', { path, error });
            throw error;
        }
    }
    /**
     * Get the entire state object
     * @returns Promise resolving to a copy of the state
     */
    getFullState() {
        // Return a deep copy to prevent direct modification
        try {
            return JSON.parse(JSON.stringify(this.state));
        }
        catch (e) {
            this.logger.error('Failed to serialize state for getFullState', { error: e });
            return {}; // Return empty object on serialization error
        }
    }
    /**
     * Clear the entire state
     */
    async clearState() {
        const previousState = this.state;
        this.state = {};
        this.internalMetadata.clear();
        this.logger.info('State cleared');
        // Notify subscribers about the clear event
        // Create a generic metadata object for the clear event
        const clearMetadata = {
            action: 'clearState',
            agentId: 'system',
            agentName: 'SharedStateManager',
            agentType: 'System',
            timestamp: new Date().toISOString()
        };
        this.notifySubscribers('*', this.state, previousState, clearMetadata);
        // Save the cleared state if persistence is enabled
        if (this.persistencePath) {
            await this.saveState();
        }
    }
    /**
     * Subscribe to state changes
     * @param path Dot notation path to watch ('*' for all)
     * @param callback Function to call on change
     * @returns Subscription ID (string)
     */
    subscribe(path, callback) {
        const subscriptionId = (0, uuid_1.v4)();
        this.subscriptionCallbacks.set(subscriptionId, { path, callback });
        this.logger.info('Subscription created', { path, subscriptionId });
        return subscriptionId;
    }
    /**
     * Register a new agent in shared state
     * @param name Agent name or ID
     * @param agentInfo Metadata to store
     */
    async registerAgent(name, agentInfo) {
        try {
            await this.setState(`agents.${name}`, {
                ...agentInfo,
                registeredAt: Date.now(),
            });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to register agent in shared state', { name, error });
            return false;
        }
    }
    /**
     * Update agent status in shared state
     * @param name Agent name or ID
     * @param status New status
     */
    async updateAgentStatus(name, status) {
        await this.setState(`agents.${name}.status`, status, {
            metadata: {
                action: 'updateAgentStatus',
                timestamp: new Date().toISOString(),
            },
        });
    }
    /**
     * Unsubscribe from state changes
     * @param subscriptionId The ID of the subscription to remove
     */
    unsubscribe(subscriptionId) {
        if (this.subscriptionCallbacks.has(subscriptionId)) {
            this.subscriptionCallbacks.delete(subscriptionId);
            this.logger.info('Subscription removed', { subscriptionId });
        }
        else {
            this.logger.warn('Attempted to unsubscribe with invalid ID', { subscriptionId });
        }
    }
    /**
     * Notify subscribers of a state change.
     * @param changedPath The specific path that changed.
     * @param newValue The new value at the path.
     * @param oldValue The old value at the path.
     * @param metadata Optional metadata about the change.
     */
    notifySubscribers(changedPath, newValue, oldValue, metadata) {
        this.logger.debug('Notifying subscribers', { changedPath, metadata });
        for (const [id, sub] of this.subscriptionCallbacks.entries()) {
            // Check if the subscription path matches the changed path
            // Matches include: exact match, wildcard '*', or parent path match
            if (sub.path === '*' || sub.path === changedPath || changedPath.startsWith(`${sub.path}.`)) {
                try {
                    sub.callback(changedPath, newValue, metadata);
                }
                catch (error) {
                    this.logger.error('Error in subscriber callback', {
                        subscriptionId: id,
                        path: sub.path,
                        error
                    });
                }
            }
        }
    }
    // --- Persistence Methods ---
    /**
     * Load state from storage
     */
    async loadState() {
        if (!this.persistencePath) {
            this.logger.warn('Load state called but no persistence path specified.');
            return; // Or throw new Error? Decided to just warn.
        }
        this.logger.info(`Attempting to load state from ${this.persistencePath}`);
        try {
            if (fs.existsSync(this.persistencePath)) {
                const stateJson = await fs.promises.readFile(this.persistencePath, 'utf8');
                const loadedData = JSON.parse(stateJson);
                // Basic validation: ensure it's an object
                if (typeof loadedData === 'object' && loadedData !== null) {
                    this.state = loadedData;
                    // TODO: Consider loading/reconstructing internalMetadata if needed
                    this.logger.info(`State loaded successfully from ${this.persistencePath}`);
                    // Notify subscribers that state has been loaded (optional)
                    // this.notifySubscribers('*_load', this.state, undefined, { /* system metadata */ });
                }
                else {
                    this.logger.error(`Failed to load state: Invalid data format in ${this.persistencePath}`);
                    this.state = {}; // Reset to empty state
                }
            }
            else {
                this.logger.warn(`Persistence file not found: ${this.persistencePath}. Initializing with empty state.`);
                this.state = {};
            }
        }
        catch (error) {
            this.logger.error('Error loading state:', { error });
            // Decide how to handle load error: throw, or start with empty state?
            this.state = {}; // Reset to empty state on error
            throw error; // Re-throw for higher level handling if needed
        }
    }
    /**
     * Save state to storage
     */
    async saveState() {
        if (!this.persistencePath) {
            this.logger.warn('Save state called but no persistence path specified.');
            return; // Cannot save without a path
        }
        this.logger.debug(`Attempting to save state to ${this.persistencePath}`);
        try {
            const stateJson = JSON.stringify(this.state, null, 2); // Pretty print JSON
            const dir = path.dirname(this.persistencePath);
            // Ensure directory exists
            await fs.promises.mkdir(dir, { recursive: true });
            // Write file atomically (write to temp then rename) to prevent corruption
            const tempPath = `${this.persistencePath}.tmp-${(0, uuid_1.v4)()}`;
            await fs.promises.writeFile(tempPath, stateJson, 'utf8');
            await fs.promises.rename(tempPath, this.persistencePath);
            this.logger.info(`State saved successfully to ${this.persistencePath}`);
        }
        catch (error) {
            this.logger.error('Error saving state:', { error });
            throw error; // Re-throw error
        }
    }
    // --- Helper Methods ---
    /**
     * Get a nested value from an object using a dot-notation path
     */
    getNestedValue(obj, path) {
        if (!path)
            return undefined; // Path is required
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    /**
     * Set a nested value in an object using a dot-notation path
     */
    setNestedValue(obj, path, value) {
        if (!path)
            return; // Path is required
        const parts = path.split('.');
        const lastPart = parts.pop();
        if (!lastPart)
            return; // Path must have at least one part
        let current = obj;
        for (const part of parts) {
            // Ensure parent is an object. Create if it doesn't exist or is not an object.
            if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        current[lastPart] = value;
    }
}
exports.SharedStateManager = SharedStateManager;
//# sourceMappingURL=SharedStateManager.js.map