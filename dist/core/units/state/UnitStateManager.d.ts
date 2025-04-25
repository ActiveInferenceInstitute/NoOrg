/**
 * UnitStateManager module
 *
 * Provides a shared state management system for organizational units.
 */
/**
 * State update options
 */
export interface StateUpdateOptions {
    merge?: boolean;
    notify?: boolean;
    updatedBy?: string;
    metadata?: Record<string, any>;
}
/**
 * State update event
 */
export interface StateUpdateEvent {
    path: string;
    value: any;
    previousValue?: any;
    options: StateUpdateOptions;
    timestamp: number;
}
/**
 * UnitStateManager class for shared state between units
 */
export declare class UnitStateManager {
    private state;
    private events;
    private logger;
    private persistenceEnabled;
    private persistencePath?;
    /**
     * Create a new UnitStateManager
     * @param logger - Logger instance
     * @param persistenceEnabled - Whether to enable persistence
     * @param persistencePath - Path for persistence (if enabled)
     */
    constructor(logger?: Console, persistenceEnabled?: boolean, persistencePath?: string);
    /**
     * Set a value in the state
     * @param path - Dot notation path in state
     * @param value - Value to set
     * @param options - Update options
     * @returns This manager instance for chaining
     */
    setState(path: string, value: any, options?: StateUpdateOptions): UnitStateManager;
    /**
     * Get a value from the state
     * @param path - Dot notation path in state
     * @param defaultValue - Default value if path doesn't exist
     * @returns The value at path or defaultValue
     */
    getState<T = any>(path: string, defaultValue?: T): T;
    /**
     * Check if a path exists in the state
     * @param path - Dot notation path in state
     * @returns True if path exists
     */
    hasState(path: string): boolean;
    /**
     * Delete a path from the state
     * @param path - Dot notation path in state
     * @param options - Update options
     * @returns True if path was deleted, false if it didn't exist
     */
    deleteState(path: string, options?: StateUpdateOptions): boolean;
    /**
     * Subscribe to state changes
     * @param path - Dot notation path in state, or '*' for all changes
     * @param callback - Function to call on change
     * @returns Unsubscribe function
     */
    subscribe(path: string, callback: (event: StateUpdateEvent) => void): () => void;
    /**
     * Get full state
     * @returns Copy of the full state object
     */
    getFullState(): Record<string, any>;
    /**
     * Replace the entire state
     * @param newState - New state to set
     * @param options - Update options
     */
    setFullState(newState: Record<string, any>, options?: StateUpdateOptions): void;
    /**
     * Clear the entire state
     * @param options - Update options
     */
    clearState(options?: StateUpdateOptions): void;
    /**
     * Notify subscribers of state changes
     * @param event - State update event
     */
    private notifySubscribers;
    /**
     * Persist state to storage (if enabled)
     */
    private persistState;
}
