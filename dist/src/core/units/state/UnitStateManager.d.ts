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
    broadcastUpdate?: boolean;
    conflictResolutionStrategy?: ConflictResolutionStrategy;
}
/**
 * State update event
 */
export interface StateUpdateEvent {
    id: string;
    path: string;
    value: any;
    previousValue?: any;
    options: StateUpdateOptions;
    timestamp: number;
    version: number;
    sourceId: string;
}
/**
 * State subscription options
 */
export interface StateSubscriptionOptions {
    immediate?: boolean;
    pathPrefix?: boolean;
    metadata?: Record<string, any>;
    debounceMs?: number;
}
/**
 * Conflict resolution strategy
 */
export declare enum ConflictResolutionStrategy {
    LAST_WRITE_WINS = "last_write_wins",
    HIGHEST_VERSION_WINS = "highest_version_wins",
    MERGE = "merge",
    CUSTOM = "custom"
}
/**
 * State operation type
 */
export declare enum StateOperationType {
    SET = "set",
    DELETE = "delete",
    CLEAR = "clear"
}
/**
 * State operation record
 */
export interface StateOperation {
    id: string;
    type: StateOperationType;
    path: string;
    value?: any;
    timestamp: number;
    version: number;
    sourceId: string;
    metadata?: Record<string, any>;
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
    private eventSystem;
    private storageSystem;
    private stateVersion;
    private operationLog;
    private sourceId;
    private subscriptionCallbacks;
    private static instance;
    /**
     * Get singleton instance
     * @param options - Configuration options
     * @returns UnitStateManager instance
     */
    static getInstance(options?: {
        logger?: Console;
        persistenceEnabled?: boolean;
        persistencePath?: string;
        sourceId?: string;
    }): UnitStateManager;
    /**
     * Create a new UnitStateManager
     * @param logger - Logger instance
     * @param persistenceEnabled - Whether to enable persistence
     * @param persistencePath - Path for persistence (if enabled)
     * @param sourceId - Unique identifier for this state manager instance
     */
    private constructor();
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
     * @param options - Subscription options
     * @returns Unsubscribe function
     */
    subscribe(path: string, callback: (event: StateUpdateEvent) => void, options?: StateSubscriptionOptions): () => void;
    /**
     * Get full state
     * @returns Copy of the full state object
     */
    getFullState(): Record<string, any>;
    /**
     * Set full state
     * @param newState - New state to set
     * @param options - Update options
     */
    setFullState(newState: Record<string, any>, options?: StateUpdateOptions): void;
    /**
     * Clear state
     * @param options - Update options
     */
    clearState(options?: StateUpdateOptions): void;
    /**
     * Get state version
     * @returns Current state version
     */
    getStateVersion(): number;
    /**
     * Get operation log
     * @returns Copy of the operation log
     */
    getOperationLog(): StateOperation[];
    /**
     * Sync state with another instance
     * @param operations - Operations to sync
     */
    syncState(operations: StateOperation[]): void;
    /**
     * Request state sync from other instances
     */
    requestStateSync(): void;
    /**
     * Notify subscribers of state update
     * @param event - State update event
     */
    private notifySubscribers;
    /**
     * Handle subscription callback with debounce support
     * @param subscriptionId - ID of the subscription
     * @param event - State update event
     */
    private handleSubscriptionCallback;
    /**
     * Persist state to storage
     */
    private persistState;
    /**
     * Load state from storage
     */
    private loadStateFromStorage;
    /**
     * Broadcast state change to other instances
     * @param operation - State operation to broadcast
     */
    private broadcastStateChange;
    /**
     * Setup listeners for distributed sync
     */
    private setupDistributedSync;
    /**
     * Apply a remote operation
     * @param operation - Operation to apply
     */
    private applyRemoteOperation;
    /**
     * Check for conflicts when updating state
     * @param path - Path being updated
     * @param value - New value
     * @param options - Update options
     * @returns Whether a conflict was found and handled
     */
    private checkForConflicts;
    /**
     * Merge two objects recursively
     * @param target - Target object
     * @param source - Source object
     * @returns Merged object
     */
    private mergeObjects;
    /**
     * Create a deep clone of a value
     * @param value - Value to clone
     * @returns Cloned value
     */
    private cloneValue;
    /**
     * Trim operation log to prevent unbounded growth
     * @param maxEntries - Maximum number of entries to keep (default: 1000)
     */
    private trimOperationLog;
}
//# sourceMappingURL=UnitStateManager.d.ts.map