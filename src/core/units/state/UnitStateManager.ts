/**
 * UnitStateManager module
 * 
 * Provides a shared state management system for organizational units.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { EventSystem } from '../../events/EventSystem';
import { StorageSystem } from '../../storage/StorageSystem';

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
export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  HIGHEST_VERSION_WINS = 'highest_version_wins',
  MERGE = 'merge',
  CUSTOM = 'custom'
}

/**
 * State operation type
 */
export enum StateOperationType {
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear'
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

// Add type definitions for custom events
interface StateChangeEvent {
  operation: StateOperation;
  sourceId: string;
  timestamp: number;
}

interface StateSyncRequestEvent {
  sourceId: string;
  timestamp: number;
}

interface StateSyncResponseEvent {
  operations: StateOperation[];
  sourceId: string;
  targetId: string;
  timestamp: number;
}

/**
 * UnitStateManager class for shared state between units
 */
export class UnitStateManager {
  private state: Record<string, any>;
  private events: EventEmitter;
  private logger: Console;
  private persistenceEnabled: boolean;
  private persistencePath?: string;
  private eventSystem: EventSystem;
  private storageSystem: StorageSystem;
  private stateVersion: number;
  private operationLog: StateOperation[];
  private sourceId: string;
  private subscriptionCallbacks: Map<string, {
    callback: (event: StateUpdateEvent) => void;
    options: StateSubscriptionOptions;
    lastCallTime?: number;
    timeoutId?: NodeJS.Timeout;
  }>;
  private static instance: UnitStateManager;

  /**
   * Get singleton instance
   * @param options - Configuration options
   * @returns UnitStateManager instance
   */
  public static getInstance(options: {
    logger?: Console;
    persistenceEnabled?: boolean;
    persistencePath?: string;
    sourceId?: string;
  } = {}): UnitStateManager {
    if (!UnitStateManager.instance) {
      UnitStateManager.instance = new UnitStateManager(
        options.logger,
        options.persistenceEnabled,
        options.persistencePath,
        options.sourceId
      );
    }
    return UnitStateManager.instance;
  }

  /**
   * Create a new UnitStateManager
   * @param logger - Logger instance
   * @param persistenceEnabled - Whether to enable persistence
   * @param persistencePath - Path for persistence (if enabled)
   * @param sourceId - Unique identifier for this state manager instance
   */
  private constructor(
    logger: Console = console,
    persistenceEnabled: boolean = false,
    persistencePath?: string,
    sourceId?: string
  ) {
    this.state = {};
    this.events = new EventEmitter();
    this.logger = logger;
    this.persistenceEnabled = persistenceEnabled;
    this.persistencePath = persistencePath;
    this.eventSystem = EventSystem.getInstance();
    this.storageSystem = StorageSystem.getInstance();
    this.stateVersion = 0;
    this.operationLog = [];
    this.sourceId = sourceId || uuidv4();
    this.subscriptionCallbacks = new Map();
    
    // Set high limit for event listeners (workflow can create many)
    this.events.setMaxListeners(100);
    
    // Listen for distributed state updates
    this.setupDistributedSync();
    
    // Load state from storage if persistence is enabled
    if (this.persistenceEnabled) {
      this.loadStateFromStorage();
    }
  }

  /**
   * Set a value in the state
   * @param path - Dot notation path in state
   * @param value - Value to set
   * @param options - Update options
   * @returns This manager instance for chaining
   */
  public setState(
    path: string,
    value: any,
    options: StateUpdateOptions = {}
  ): UnitStateManager {
    const previousValue = this.getState(path);
    
    // Check for conflicts if not a local-only update
    if (options.broadcastUpdate !== false) {
      const conflictFound = this.checkForConflicts(path, value, options);
      if (conflictFound) {
        // Conflict has been handled, potentially with a different value than provided
        return this;
      }
    }
    
    const pathParts = path.split('.');
    
    // Options with defaults
    const updateOptions: StateUpdateOptions = {
      merge: false,
      notify: true,
      broadcastUpdate: true,
      conflictResolutionStrategy: ConflictResolutionStrategy.LAST_WRITE_WINS,
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
      current[lastPart] = this.mergeObjects(current[lastPart], value);
    } else {
      current[lastPart] = this.cloneValue(value);
    }
    
    // Increment version
    this.stateVersion++;
    
    // Create operation record
    const operation: StateOperation = {
      id: uuidv4(),
      type: StateOperationType.SET,
      path,
      value: current[lastPart],
      timestamp: Date.now(),
      version: this.stateVersion,
      sourceId: this.sourceId,
      metadata: updateOptions.metadata
    };
    
    // Add to operation log
    this.operationLog.push(operation);
    this.trimOperationLog();
    
    // Create event 
      const event: StateUpdateEvent = {
      id: operation.id,
        path,
        value: current[lastPart],
        previousValue,
        options: updateOptions,
      timestamp: operation.timestamp,
      version: operation.version,
      sourceId: operation.sourceId
      };
      
    // Notify subscribers
    if (updateOptions.notify) {
      this.notifySubscribers(event);
    }
    
    // Broadcast update to other instances if needed
    if (updateOptions.broadcastUpdate) {
      this.broadcastStateChange(operation);
    }
    
    // Log the update
    const valuePreview = typeof value === 'object' ? '[Object]' : value;
    this.logger.log(`State updated: ${path} = ${valuePreview} (v${this.stateVersion})`);
    
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
  public getState<T = any>(path: string, defaultValue?: T): T {
    const pathParts = path.split('.');
    let current: any = this.state;
    
    for (const part of pathParts) {
      if (current === undefined || current === null || !Object.prototype.hasOwnProperty.call(current, part)) {
        return defaultValue as T;
      }
      current = current[part];
    }
    
    return this.cloneValue(current) as T;
  }

  /**
   * Check if a path exists in the state
   * @param path - Dot notation path in state
   * @returns True if path exists
   */
  public hasState(path: string): boolean {
    return this.getState(path, undefined) !== undefined;
  }

  /**
   * Delete a path from the state
   * @param path - Dot notation path in state
   * @param options - Update options
   * @returns True if path was deleted, false if it didn't exist
   */
  public deleteState(path: string, options: StateUpdateOptions = {}): boolean {
    const pathParts = path.split('.');
    const previousValue = this.getState(path);
    
    if (previousValue === undefined) {
      return false;
    }
    
    // Options with defaults
    const updateOptions: StateUpdateOptions = {
      notify: true,
      broadcastUpdate: true,
      conflictResolutionStrategy: ConflictResolutionStrategy.LAST_WRITE_WINS,
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
    if (!Object.prototype.hasOwnProperty.call(current, lastPart)) {
      return false;
    }
    
    delete current[lastPart];
    
    // Increment version
    this.stateVersion++;
    
    // Create operation record
    const operation: StateOperation = {
      id: uuidv4(),
      type: StateOperationType.DELETE,
      path,
      timestamp: Date.now(),
      version: this.stateVersion,
      sourceId: this.sourceId,
      metadata: updateOptions.metadata
    };
    
    // Add to operation log
    this.operationLog.push(operation);
    this.trimOperationLog();
    
    // Create event
      const event: StateUpdateEvent = {
      id: operation.id,
        path,
        value: undefined,
        previousValue,
        options: updateOptions,
      timestamp: operation.timestamp,
      version: operation.version,
      sourceId: operation.sourceId
      };
      
    // Notify subscribers
    if (updateOptions.notify) {
      this.notifySubscribers(event);
    }
    
    // Broadcast update to other instances if needed
    if (updateOptions.broadcastUpdate) {
      this.broadcastStateChange(operation);
    }
    
    this.logger.log(`State deleted: ${path} (v${this.stateVersion})`);
    
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
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  public subscribe(
    path: string,
    callback: (event: StateUpdateEvent) => void,
    options: StateSubscriptionOptions = {}
  ): () => void {
    const subscriptionId = uuidv4();
    
    // Store the subscription
    this.subscriptionCallbacks.set(subscriptionId, {
      callback,
      options
    });
    
    // Send immediate update if requested
    if (options.immediate) {
      const currentValue = this.getState(path);
      if (currentValue !== undefined) {
        const event: StateUpdateEvent = {
          id: uuidv4(),
          path,
          value: currentValue,
          options: { notify: true },
          timestamp: Date.now(),
          version: this.stateVersion,
          sourceId: this.sourceId
        };
        
        callback(event);
      }
    }
    
    // Create event handler
    const handler = (event: StateUpdateEvent) => {
      if (
        path === '*' || 
        event.path === path || 
        (options.pathPrefix && event.path.startsWith(`${path}.`))
      ) {
        this.handleSubscriptionCallback(subscriptionId, event);
      }
    };
    
    // Register event handler
    this.events.on('stateUpdate', handler);
    
    // Return unsubscribe function
    return () => {
      this.events.off('stateUpdate', handler);
      this.subscriptionCallbacks.delete(subscriptionId);
    };
  }

  /**
   * Get full state
   * @returns Copy of the full state object
   */
  public getFullState(): Record<string, any> {
    return this.cloneValue(this.state);
  }

  /**
   * Set full state
   * @param newState - New state to set
   * @param options - Update options
   */
  public setFullState(newState: Record<string, any>, options: StateUpdateOptions = {}): void {
    // Options with defaults
    const updateOptions: StateUpdateOptions = {
      notify: true,
      broadcastUpdate: true,
      conflictResolutionStrategy: ConflictResolutionStrategy.LAST_WRITE_WINS,
      ...options
    };
    
    const previousState = this.cloneValue(this.state);
    
    // Replace the state
    this.state = this.cloneValue(newState);
    
    // Increment version
    this.stateVersion++;
    
    // Create operation record
    const operation: StateOperation = {
      id: uuidv4(),
      type: StateOperationType.CLEAR,
      path: '*',
      value: newState,
      timestamp: Date.now(),
      version: this.stateVersion,
      sourceId: this.sourceId,
      metadata: updateOptions.metadata
    };
    
    // Add to operation log
    this.operationLog.push(operation);
    this.trimOperationLog();
    
    // Create event
    const event: StateUpdateEvent = {
      id: operation.id,
      path: '*',
      value: newState,
      previousValue: previousState,
      options: updateOptions,
      timestamp: operation.timestamp,
      version: operation.version,
      sourceId: operation.sourceId
    };
    
    // Notify subscribers
    if (updateOptions.notify) {
      this.notifySubscribers(event);
    }
    
    // Broadcast update to other instances if needed
    if (updateOptions.broadcastUpdate) {
      this.broadcastStateChange(operation);
    }
    
    this.logger.log(`Full state replaced (v${this.stateVersion})`);
    
    // Persist state if enabled
    if (this.persistenceEnabled) {
      this.persistState();
    }
  }

  /**
   * Clear state
   * @param options - Update options
   */
  public clearState(options: StateUpdateOptions = {}): void {
    // Options with defaults
    const updateOptions: StateUpdateOptions = {
      notify: true,
      broadcastUpdate: true,
      ...options
    };
    
    const previousState = this.cloneValue(this.state);
    
    // Clear the state
    this.state = {};
    
    // Increment version
    this.stateVersion++;
    
    // Create operation record
    const operation: StateOperation = {
      id: uuidv4(),
      type: StateOperationType.CLEAR,
      path: '*',
      value: {},
      timestamp: Date.now(),
      version: this.stateVersion,
      sourceId: this.sourceId,
      metadata: updateOptions.metadata
    };
    
    // Add to operation log
    this.operationLog.push(operation);
    this.trimOperationLog();
    
    // Create event
      const event: StateUpdateEvent = {
      id: operation.id,
        path: '*',
        value: {},
        previousValue: previousState,
        options: updateOptions,
      timestamp: operation.timestamp,
      version: operation.version,
      sourceId: operation.sourceId
      };
      
    // Notify subscribers
    if (updateOptions.notify) {
      this.notifySubscribers(event);
    }
    
    // Broadcast update to other instances if needed
    if (updateOptions.broadcastUpdate) {
      this.broadcastStateChange(operation);
    }
    
    this.logger.log(`State cleared (v${this.stateVersion})`);
    
    // Persist state if enabled
    if (this.persistenceEnabled) {
      this.persistState();
    }
  }

  /**
   * Get state version
   * @returns Current state version
   */
  public getStateVersion(): number {
    return this.stateVersion;
  }

  /**
   * Get operation log
   * @returns Copy of the operation log
   */
  public getOperationLog(): StateOperation[] {
    return [...this.operationLog];
  }

  /**
   * Sync state with another instance
   * @param operations - Operations to sync
   */
  public syncState(operations: StateOperation[]): void {
    if (operations.length === 0) return;
    
    this.logger.log(`Syncing state with ${operations.length} operations`);
    
    // Filter out operations from this instance or operations we already have
    const newOperations = operations.filter(op => {
      const isLocal = op.sourceId === this.sourceId;
      const isDuplicate = this.operationLog.some(existing => existing.id === op.id);
      return !isLocal && !isDuplicate;
    });
    
    if (newOperations.length === 0) {
      this.logger.log('No new operations to sync');
      return;
    }
    
    // Sort by timestamp and version
    newOperations.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.version - b.version;
    });
    
    // Apply each operation
    for (const operation of newOperations) {
      this.applyRemoteOperation(operation);
    }
    
    // Persist the updated state
    if (this.persistenceEnabled) {
      this.persistState();
    }
  }

  /**
   * Request state sync from other instances
   */
  public requestStateSync(): void {
    this.eventSystem.emit('state:sync:request', {
      sourceId: this.sourceId,
      timestamp: Date.now()
    });
  }

  /**
   * Notify subscribers of state update
   * @param event - State update event
   */
  private notifySubscribers(event: StateUpdateEvent): void {
    this.events.emit('stateUpdate', event);
  }

  /**
   * Handle subscription callback with debounce support
   * @param subscriptionId - ID of the subscription
   * @param event - State update event
   */
  private handleSubscriptionCallback(subscriptionId: string, event: StateUpdateEvent): void {
    const subscription = this.subscriptionCallbacks.get(subscriptionId);
    if (!subscription) return;
    
    // Check if we should filter based on metadata
    if (subscription.options.metadata) {
      const metadataMatch = Object.entries(subscription.options.metadata).every(
        ([key, value]) => event.options.metadata?.[key] === value
      );
      
      if (!metadataMatch) return;
    }
    
    // If no debounce, call immediately
    if (!subscription.options.debounceMs) {
      subscription.callback(event);
      return;
    }
    
    // Clear existing timeout if any
    if (subscription.timeoutId) {
      clearTimeout(subscription.timeoutId);
    }
    
    // Set new timeout
    subscription.timeoutId = setTimeout(() => {
      subscription.callback(event);
      subscription.lastCallTime = Date.now();
      subscription.timeoutId = undefined;
    }, subscription.options.debounceMs);
  }

  /**
   * Persist state to storage
   */
  private persistState(): void {
    if (!this.persistenceEnabled) return;
    
    const stateData = {
      state: this.state,
      version: this.stateVersion,
      operationLog: this.operationLog,
      timestamp: Date.now()
    };
    
    this.storageSystem.set('unitState', stateData);
  }

  /**
   * Load state from storage
   */
  private async loadStateFromStorage(): Promise<void> {
    try {
      const stateData = await this.storageSystem.get<{
        state: Record<string, any>;
        version: number;
        operationLog: StateOperation[];
        timestamp: number;
      }>('unitState');
      
      if (stateData) {
        this.state = stateData.state;
        this.stateVersion = stateData.version;
        this.operationLog = stateData.operationLog;
        this.logger.log(`Loaded state from storage (v${this.stateVersion})`);
      }
    } catch (error) {
      this.logger.error('Error loading state from storage:', error);
    }
  }

  /**
   * Broadcast state change to other instances
   * @param operation - State operation to broadcast
   */
  private broadcastStateChange(operation: StateOperation): void {
    this.eventSystem.emit('state:change', {
      operation,
      sourceId: this.sourceId,
      timestamp: Date.now()
    });
  }

  /**
   * Setup listeners for distributed sync
   */
  private setupDistributedSync(): void {
    // Listen for state change events from other instances
    this.eventSystem.on('state:change', (event: StateChangeEvent) => {
      if (event.sourceId !== this.sourceId) {
        this.applyRemoteOperation(event.operation);
      }
    });
    
    // Listen for state sync requests
    this.eventSystem.on('state:sync:request', (event: StateSyncRequestEvent) => {
      if (event.sourceId !== this.sourceId) {
        // Respond with our operations
        this.eventSystem.emit('state:sync:response', {
          operations: this.operationLog,
          sourceId: this.sourceId,
          targetId: event.sourceId,
          timestamp: Date.now()
        });
      }
    });
    
    // Listen for state sync responses
    this.eventSystem.on('state:sync:response', (event: StateSyncResponseEvent) => {
      if (event.targetId === this.sourceId) {
        this.syncState(event.operations);
      }
    });
    
    // Request initial sync
    setTimeout(() => {
      this.requestStateSync();
    }, 1000);
  }

  /**
   * Apply a remote operation
   * @param operation - Operation to apply
   */
  private applyRemoteOperation(operation: StateOperation): void {
    // Add to operation log
    this.operationLog.push(operation);
    this.trimOperationLog();
    
    // Update local version if needed
    if (operation.version > this.stateVersion) {
      this.stateVersion = operation.version;
    }
    
    // Apply the operation
    switch (operation.type) {
      case StateOperationType.SET:
        this.setState(operation.path, operation.value, {
          notify: true,
          broadcastUpdate: false,
          metadata: operation.metadata,
          updatedBy: operation.sourceId
        });
        break;
        
      case StateOperationType.DELETE:
        this.deleteState(operation.path, {
          notify: true,
          broadcastUpdate: false,
          metadata: operation.metadata,
          updatedBy: operation.sourceId
        });
        break;
        
      case StateOperationType.CLEAR:
        if (operation.value) {
          this.setFullState(operation.value, {
            notify: true,
            broadcastUpdate: false,
            metadata: operation.metadata,
            updatedBy: operation.sourceId
          });
        } else {
          this.clearState({
            notify: true,
            broadcastUpdate: false,
            metadata: operation.metadata,
            updatedBy: operation.sourceId
          });
        }
        break;
    }
  }

  /**
   * Check for conflicts when updating state
   * @param path - Path being updated
   * @param value - New value
   * @param options - Update options
   * @returns Whether a conflict was found and handled
   */
  private checkForConflicts(path: string, value: any, options: StateUpdateOptions): boolean {
    // Get recent operations for this path
    const recentOps = this.operationLog
      .filter(op => op.path === path && op.sourceId !== this.sourceId)
      .sort((a, b) => b.timestamp - a.timestamp);
      
    if (recentOps.length === 0) {
      return false; // No conflicts
    }
    
    const mostRecent = recentOps[0];
    const timeDiff = Date.now() - mostRecent.timestamp;
    
    // Only consider recent operations (within last 5 seconds)
    if (timeDiff > 5000) {
      return false;
    }
    
    // Handle conflict based on strategy
    const strategy = options.conflictResolutionStrategy || ConflictResolutionStrategy.LAST_WRITE_WINS;
    
    switch (strategy) {
      case ConflictResolutionStrategy.LAST_WRITE_WINS:
        // Local update will win, no action needed
        this.logger.log(`Conflict resolved (LAST_WRITE_WINS): ${path}`);
        return false;
        
      case ConflictResolutionStrategy.HIGHEST_VERSION_WINS:
        if (mostRecent.version > this.stateVersion) {
          // Remote update wins, we don't make our change
          this.logger.log(`Conflict resolved (HIGHEST_VERSION_WINS): ${path} - remote wins`);
          return true;
        }
        this.logger.log(`Conflict resolved (HIGHEST_VERSION_WINS): ${path} - local wins`);
        return false;
        
      case ConflictResolutionStrategy.MERGE:
        if (typeof value === 'object' && typeof mostRecent.value === 'object') {
          // Merge the values
          const mergedValue = this.mergeObjects(mostRecent.value, value);
          // Apply the merged value
          this.setState(path, mergedValue, {
            ...options,
            broadcastUpdate: true,
            metadata: {
              ...(options.metadata || {}),
              merged: true
            }
          });
          this.logger.log(`Conflict resolved (MERGE): ${path}`);
          return true;
        }
        // Can't merge non-objects, fall back to last_write_wins
        this.logger.log(`Conflict resolution (MERGE) not possible for non-objects: ${path}`);
        return false;
        
      case ConflictResolutionStrategy.CUSTOM:
        // Custom strategy must be handled by the caller
        this.logger.log(`Custom conflict resolution strategy not implemented: ${path}`);
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Merge two objects recursively
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  private mergeObjects(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          // Recursively merge nested objects
          result[key] = this.mergeObjects(result[key], value);
        } else {
          // Target property isn't an object, override it
          result[key] = this.cloneValue(value);
        }
      } else {
        // For arrays and primitive values, just override
        result[key] = this.cloneValue(value);
      }
    }
    
    return result;
  }

  /**
   * Create a deep clone of a value
   * @param value - Value to clone
   * @returns Cloned value
   */
  private cloneValue<T>(value: T): T {
    if (value === null || value === undefined) {
      return value;
    }
    
    if (typeof value !== 'object') {
      return value;
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.cloneValue(item)) as unknown as T;
    }
    
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      result[key] = this.cloneValue(val);
    }
    
    return result as T;
  }

  /**
   * Trim operation log to prevent unbounded growth
   * @param maxEntries - Maximum number of entries to keep (default: 1000)
   */
  private trimOperationLog(maxEntries: number = 1000): void {
    if (this.operationLog.length > maxEntries) {
      // Sort by timestamp, newest first
      this.operationLog.sort((a, b) => b.timestamp - a.timestamp);
      // Keep only the newest entries
      this.operationLog = this.operationLog.slice(0, maxEntries);
    }
  }
} 