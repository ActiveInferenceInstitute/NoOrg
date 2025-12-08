import { v4 as uuidv4 } from 'uuid';
import {
  StateMetadata,
  StateChangeCallback,
  ConflictResolutionStrategy,
  StateUpdateOptions
} from './types';
import { BaseAgentInterface } from './workflow_types';
import * as winston from 'winston';
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';
import { SharedStateManager as ISharedStateManager } from './interfaces/SharedStateManager';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
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
export class SharedStateManager implements ISharedStateManager {
  private static instance: SharedStateManager;
  private state: Record<string, any> = {};
  // Track internal metadata like version separately if needed, not part of StateMetadata interface
  private internalMetadata: Map<string, { version: number; lastModified: Date }> = new Map(); 
  private subscriptionCallbacks: Map<string, { path: string; callback: StateChangeCallback }> = new Map();
  private logger: Logger;
  private persistencePath: string | null = null;
  private autoSaveEnabled: boolean = false;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  // Make constructor private for Singleton pattern
  private constructor(
    persistencePath?: string,
    autoSave: boolean = false,
    saveInterval: number = 60000
  ) {
    this.logger = new Logger('SharedStateManager');
    this.configurePersistence(persistencePath, autoSave, saveInterval);
    logger.info('SharedStateManager initialized');
    // Consider loading state here if persistencePath is provided
    // this.loadState().catch(err => logger.error('Initial state load failed', err));
  }

  /**
   * Get the singleton instance
   * Optionally configure persistence on first call
   */
  public static getInstance(
    persistencePath?: string,
    autoSave?: boolean,
    saveInterval?: number
  ): SharedStateManager {
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
  public configurePersistence(path?: string, autoSave: boolean = false, saveInterval: number = 60000): void {
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
    } else {
       this.logger.info(`Persistence ${this.persistencePath ? 'path set but auto-save disabled' : 'not configured'}.`);
    }
  }

  /**
   * Get state value at a specific path
   * @param path Path to retrieve state from
   * @returns Promise resolving to the value or undefined
   */
  public async getState(path: string): Promise<unknown> {
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
    } catch (error) {
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
  public async setState(path: string, value: any, options?: StateUpdateOptions): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to update state', { path, error });
      throw error;
    }
  }

  /**
   * Get the entire state object
   * @returns Promise resolving to a copy of the state
   */
  public getFullState(): Record<string, unknown> {
    // Return a deep copy to prevent direct modification
    try {
      return JSON.parse(JSON.stringify(this.state));
    } catch (e) {
      this.logger.error('Failed to serialize state for getFullState', { error: e });
      return {}; // Return empty object on serialization error
    }
  }

  /**
   * Clear the entire state
   */
  public async clearState(): Promise<void> {
    const previousState = this.state;
    this.state = {};
    this.internalMetadata.clear();

    this.logger.info('State cleared');

    // Notify subscribers about the clear event
    // Create a generic metadata object for the clear event
    const clearMetadata: StateMetadata = {
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
  public subscribe(path: string, callback: StateChangeCallback): string {
    const subscriptionId = uuidv4();
    this.subscriptionCallbacks.set(subscriptionId, { path, callback });
    this.logger.info('Subscription created', { path, subscriptionId });
    return subscriptionId;
  }

  /**
   * Register a new agent in shared state
   * @param name Agent name or ID
   * @param agentInfo Metadata to store
   */
  public async registerAgent(name: string, agentInfo: Record<string, unknown>): Promise<boolean> {
    try {
      await this.setState(`agents.${name}`, {
        ...agentInfo,
        registeredAt: Date.now(),
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to register agent in shared state', { name, error });
      return false;
    }
  }

  /**
   * Update agent status in shared state
   * @param name Agent name or ID
   * @param status New status
   */
  public async updateAgentStatus(name: string, status: string): Promise<void> {
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
  public unsubscribe(subscriptionId: string): void {
    if (this.subscriptionCallbacks.has(subscriptionId)) {
      this.subscriptionCallbacks.delete(subscriptionId);
      this.logger.info('Subscription removed', { subscriptionId });
    } else {
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
  private notifySubscribers(changedPath: string, newValue: any, oldValue: any, metadata?: StateMetadata): void {
    this.logger.debug('Notifying subscribers', { changedPath, metadata });
    for (const [id, sub] of this.subscriptionCallbacks.entries()) {
      // Check if the subscription path matches the changed path
      // Matches include: exact match, wildcard '*', or parent path match
      if (sub.path === '*' || sub.path === changedPath || changedPath.startsWith(`${sub.path}.`)) {
        try {
          sub.callback(changedPath, newValue, metadata);
        } catch (error) {
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
  public async loadState(): Promise<void> {
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
        } else {
           this.logger.error(`Failed to load state: Invalid data format in ${this.persistencePath}`);
           this.state = {}; // Reset to empty state
        }
      } else {
         this.logger.warn(`Persistence file not found: ${this.persistencePath}. Initializing with empty state.`);
         this.state = {};
      }
    } catch (error) {
      this.logger.error('Error loading state:', { error });
      // Decide how to handle load error: throw, or start with empty state?
      this.state = {}; // Reset to empty state on error
      throw error; // Re-throw for higher level handling if needed
    }
  }

  /**
   * Save state to storage
   */
  public async saveState(): Promise<void> {
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
      const tempPath = `${this.persistencePath}.tmp-${uuidv4()}`;
      await fs.promises.writeFile(tempPath, stateJson, 'utf8');
      await fs.promises.rename(tempPath, this.persistencePath);

      this.logger.info(`State saved successfully to ${this.persistencePath}`);
    } catch (error) {
      this.logger.error('Error saving state:', { error });
      throw error; // Re-throw error
    }
  }

  // --- Helper Methods ---

  /**
   * Get a nested value from an object using a dot-notation path
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    if (!path) return undefined; // Path is required
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
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    if (!path) return; // Path is required
    const parts = path.split('.');
    const lastPart = parts.pop();
    if (!lastPart) return; // Path must have at least one part

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

  // --- Optional Methods (Example Implementations - Review if needed) ---
  
  // These were present in some earlier versions, kept here commented out for reference
  // If they are truly needed, they should be added to the interface as well.

  /*
  public async deleteState(path: string): Promise<void> {
    this.logger.info('Deleting state', { path });
    const pathParts = path.split('.');
    const lastPart = pathParts.pop();
    if (!lastPart) return;

    const parentPath = pathParts.join('.');
    const parent = this.getNestedValue(this.state, parentPath);

    if (typeof parent === 'object' && parent !== null && lastPart in parent) {
      const oldValue = parent[lastPart];
      delete parent[lastPart];
      this.internalMetadata.delete(path); // Remove internal meta if needed
      this.logger.info('State deleted successfully', { path });

      // Notify subscribers
      this.notifySubscribers(path, undefined, oldValue, { // Pass appropriate metadata });

      if (this.autoSaveEnabled) {
        await this.saveState();
      }
    } else {
      this.logger.warn('Attempted to delete non-existent state', { path });
    }
  }
  */

  /*
  public async initialize(): Promise<void> {
    this.logger.info('Initializing SharedStateManager');
    await this.loadState(); // Attempt to load persisted state on init
    this.logger.info('SharedStateManager initialized successfully');
  }
  */

  /*
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down SharedStateManager');
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    // Optionally save state one last time?
    // if (this.persistencePath) {
    //   await this.saveState();
    // }
    this.state = {};
    this.subscriptionCallbacks.clear();
    this.internalMetadata.clear();
    this.logger.info('SharedStateManager shut down successfully');
  }
  */

} 