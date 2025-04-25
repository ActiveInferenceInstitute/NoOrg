"use strict";
/**
 * UnitStateManager module
 *
 * Provides a shared state management system for organizational units.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStateManager = void 0;
const events_1 = require("events");
/**
 * UnitStateManager class for shared state between units
 */
class UnitStateManager {
    /**
     * Create a new UnitStateManager
     * @param logger - Logger instance
     * @param persistenceEnabled - Whether to enable persistence
     * @param persistencePath - Path for persistence (if enabled)
     */
    constructor(logger = console, persistenceEnabled = false, persistencePath) {
        this.state = {};
        this.events = new events_1.EventEmitter();
        this.logger = logger;
        this.persistenceEnabled = persistenceEnabled;
        this.persistencePath = persistencePath;
        // Set high limit for event listeners (workflow can create many)
        this.events.setMaxListeners(100);
    }
    /**
     * Set a value in the state
     * @param path - Dot notation path in state
     * @param value - Value to set
     * @param options - Update options
     * @returns This manager instance for chaining
     */
    setState(path, value, options = {}) {
        const previousValue = this.getState(path);
        const pathParts = path.split('.');
        // Options with defaults
        const updateOptions = {
            merge: false,
            notify: true,
            ...options
        };
        // Navigate to the parent node
        let current = this.state;
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        // Set/merge the value
        const lastPart = pathParts[pathParts.length - 1];
        if (updateOptions.merge && current[lastPart] && typeof current[lastPart] === 'object' && typeof value === 'object') {
            current[lastPart] = {
                ...current[lastPart],
                ...value
            };
        }
        else {
            current[lastPart] = value;
        }
        // Notify subscribers
        if (updateOptions.notify) {
            const event = {
                path,
                value: current[lastPart],
                previousValue,
                options: updateOptions,
                timestamp: Date.now()
            };
            this.notifySubscribers(event);
        }
        // Log the update
        const valuePreview = typeof value === 'object' ? '[Object]' : value;
        this.logger.log(`State updated: ${path} = ${valuePreview}`);
        // Persist state if enabled
        if (this.persistenceEnabled) {
            this.persistState();
        }
        return this;
    }
    /**
     * Get a value from the state
     * @param path - Dot notation path in state
     * @param defaultValue - Default value if path doesn't exist
     * @returns The value at path or defaultValue
     */
    getState(path, defaultValue) {
        const pathParts = path.split('.');
        let current = this.state;
        for (const part of pathParts) {
            if (current === undefined || current === null || !current.hasOwnProperty(part)) {
                return defaultValue;
            }
            current = current[part];
        }
        return current;
    }
    /**
     * Check if a path exists in the state
     * @param path - Dot notation path in state
     * @returns True if path exists
     */
    hasState(path) {
        return this.getState(path, undefined) !== undefined;
    }
    /**
     * Delete a path from the state
     * @param path - Dot notation path in state
     * @param options - Update options
     * @returns True if path was deleted, false if it didn't exist
     */
    deleteState(path, options = {}) {
        const pathParts = path.split('.');
        const previousValue = this.getState(path);
        if (previousValue === undefined) {
            return false;
        }
        // Options with defaults
        const updateOptions = {
            notify: true,
            ...options
        };
        // Navigate to the parent node
        let current = this.state;
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                return false;
            }
            current = current[part];
        }
        // Delete the property
        const lastPart = pathParts[pathParts.length - 1];
        if (!current.hasOwnProperty(lastPart)) {
            return false;
        }
        delete current[lastPart];
        // Notify subscribers
        if (updateOptions.notify) {
            const event = {
                path,
                value: undefined,
                previousValue,
                options: updateOptions,
                timestamp: Date.now()
            };
            this.notifySubscribers(event);
        }
        this.logger.log(`State deleted: ${path}`);
        // Persist state if enabled
        if (this.persistenceEnabled) {
            this.persistState();
        }
        return true;
    }
    /**
     * Subscribe to state changes
     * @param path - Dot notation path in state, or '*' for all changes
     * @param callback - Function to call on change
     * @returns Unsubscribe function
     */
    subscribe(path, callback) {
        // Create event handler
        const handler = (event) => {
            if (path === '*' || event.path === path || event.path.startsWith(`${path}.`)) {
                callback(event);
            }
        };
        // Register event handler
        this.events.on('stateUpdate', handler);
        // Return unsubscribe function
        return () => {
            this.events.off('stateUpdate', handler);
        };
    }
    /**
     * Get full state
     * @returns Copy of the full state object
     */
    getFullState() {
        return { ...this.state };
    }
    /**
     * Replace the entire state
     * @param newState - New state to set
     * @param options - Update options
     */
    setFullState(newState, options = {}) {
        const previousState = this.state;
        this.state = { ...newState };
        // Options with defaults
        const updateOptions = {
            notify: true,
            ...options
        };
        // Notify subscribers
        if (updateOptions.notify) {
            const event = {
                path: '*',
                value: this.state,
                previousValue: previousState,
                options: updateOptions,
                timestamp: Date.now()
            };
            this.notifySubscribers(event);
        }
        this.logger.log(`Full state replaced`);
        // Persist state if enabled
        if (this.persistenceEnabled) {
            this.persistState();
        }
    }
    /**
     * Clear the entire state
     * @param options - Update options
     */
    clearState(options = {}) {
        const previousState = this.state;
        this.state = {};
        // Options with defaults
        const updateOptions = {
            notify: true,
            ...options
        };
        // Notify subscribers
        if (updateOptions.notify) {
            const event = {
                path: '*',
                value: {},
                previousValue: previousState,
                options: updateOptions,
                timestamp: Date.now()
            };
            this.notifySubscribers(event);
        }
        this.logger.log(`State cleared`);
        // Persist state if enabled
        if (this.persistenceEnabled) {
            this.persistState();
        }
    }
    /**
     * Notify subscribers of state changes
     * @param event - State update event
     */
    notifySubscribers(event) {
        this.events.emit('stateUpdate', event);
    }
    /**
     * Persist state to storage (if enabled)
     */
    persistState() {
        if (!this.persistenceEnabled || !this.persistencePath) {
            return;
        }
        // Implement actual persistence logic here
        // This is just a placeholder; actual implementation would depend on the storage mechanism
        this.logger.log(`State persistence not implemented`);
    }
}
exports.UnitStateManager = UnitStateManager;
//# sourceMappingURL=UnitStateManager.js.map