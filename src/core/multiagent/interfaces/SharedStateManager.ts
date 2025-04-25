import { StateUpdateOptions } from '../types';

/**
 * Interface for the SharedStateManager
 * Defines methods for managing shared state between agents
 */
export interface SharedStateManager {
  /**
   * Set a value at a specific path in the state
   * @param path Dot notation path to set the value at
   * @param value The value to set
   * @param options Optional update options
   */
  setState(path: string, value: unknown, options?: StateUpdateOptions): Promise<void>;
  
  /**
   * Get a value from a specific path in the state
   * @param path Dot notation path to get the value from
   * @returns The value at the specified path
   */
  getState(path: string): Promise<unknown>;
  
  /**
   * Clear the entire state
   */
  clearState(): Promise<void>;
  
  /**
   * Load state from storage
   */
  loadState(): Promise<void>;
  
  /**
   * Save state to storage
   */
  saveState(): Promise<void>;
  
  /**
   * Subscribe to state changes at a specific path
   * @param path Dot notation path to subscribe to
   * @param callback Function to call when the state changes
   * @returns Subscription ID
   */
  subscribe(path: string, callback: (path: string, value: unknown) => void): string;
  
  /**
   * Unsubscribe from state changes
   * @param subscriptionId The ID of the subscription to remove
   */
  unsubscribe(subscriptionId: string): void;
  
  /**
   * Get the entire state object
   * @returns The current state
   */
  getFullState(): Record<string, unknown>;
  
  /**
   * Register a new agent in shared state
   */
  registerAgent(name: string, agentInfo: Record<string, unknown>): Promise<boolean>;
  
  /**
   * Update the status of an agent in shared state
   */
  updateAgentStatus(name: string, status: string): Promise<void>;
} 