import { StateChangeCallback, StateUpdateOptions } from './types';
import { SharedStateManager as ISharedStateManager } from './interfaces/SharedStateManager';
/**
 * SharedStateManager
 * Manages shared state between agents with synchronization capabilities
 */
export declare class SharedStateManager implements ISharedStateManager {
    private static instance;
    private state;
    private internalMetadata;
    private subscriptionCallbacks;
    private logger;
    private persistencePath;
    private autoSaveEnabled;
    private autoSaveInterval;
    private constructor();
    /**
     * Get the singleton instance
     * Optionally configure persistence on first call
     */
    static getInstance(persistencePath?: string, autoSave?: boolean, saveInterval?: number): SharedStateManager;
    /**
     * Configure persistence settings after initialization
     * @param path File path for persistence
     * @param autoSave Whether to auto-save
     * @param saveInterval Auto-save interval in ms
     */
    configurePersistence(path?: string, autoSave?: boolean, saveInterval?: number): void;
    /**
     * Get state value at a specific path
     * @param path Path to retrieve state from
     * @returns Promise resolving to the value or undefined
     */
    getState(path: string): Promise<unknown>;
    /**
     * Set state value at a specific path
     * @param path Path to set state at
     * @param value Value to set
     * @param options StateUpdateOptions including modifier and metadata
     */
    setState(path: string, value: any, options?: StateUpdateOptions): Promise<void>;
    /**
     * Get the entire state object
     * @returns Promise resolving to a copy of the state
     */
    getFullState(): Record<string, unknown>;
    /**
     * Clear the entire state
     */
    clearState(): Promise<void>;
    /**
     * Subscribe to state changes
     * @param path Dot notation path to watch ('*' for all)
     * @param callback Function to call on change
     * @returns Subscription ID (string)
     */
    subscribe(path: string, callback: StateChangeCallback): string;
    /**
     * Register a new agent in shared state
     * @param name Agent name or ID
     * @param agentInfo Metadata to store
     */
    registerAgent(name: string, agentInfo: Record<string, unknown>): Promise<boolean>;
    /**
     * Update agent status in shared state
     * @param name Agent name or ID
     * @param status New status
     */
    updateAgentStatus(name: string, status: string): Promise<void>;
    /**
     * Unsubscribe from state changes
     * @param subscriptionId The ID of the subscription to remove
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Notify subscribers of a state change.
     * @param changedPath The specific path that changed.
     * @param newValue The new value at the path.
     * @param oldValue The old value at the path.
     * @param metadata Optional metadata about the change.
     */
    private notifySubscribers;
    /**
     * Load state from storage
     */
    loadState(): Promise<void>;
    /**
     * Save state to storage
     */
    saveState(): Promise<void>;
    /**
     * Get a nested value from an object using a dot-notation path
     */
    private getNestedValue;
    /**
     * Set a nested value in an object using a dot-notation path
     */
    private setNestedValue;
}
//# sourceMappingURL=SharedStateManager.d.ts.map