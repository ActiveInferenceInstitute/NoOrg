import { StateMetadata, StateChangeCallback, StateUpdateOptions } from './types';
import { Logger } from './Logger';

export class SharedStateManager {
  private static instance: SharedStateManager;
  private state: Map<string, unknown>;
  private metadata: Map<string, StateMetadata>;
  private subscribers: Map<string, Set<StateChangeCallback>>;
  private logger: Logger;
  private callbacks: Map<string, Array<(path: string, value: unknown, metadata?: StateMetadata) => void>>;

  private constructor() {
    this.state = new Map();
    this.metadata = new Map();
    this.subscribers = new Map();
    this.callbacks = new Map();
    this.logger = new Logger('SharedStateManager');
  }

  public static getInstance(): SharedStateManager {
    if (!SharedStateManager.instance) {
      SharedStateManager.instance = new SharedStateManager();
    }
    return SharedStateManager.instance;
  }

  public async getState(path: string): Promise<unknown> {
    return this.state.get(path);
  }

  public async setState(path: string, value: unknown, options: StateUpdateOptions): Promise<void> {
    this.state.set(path, value);
    const callbacks = this.callbacks.get(path) || [];
    for (const callback of callbacks) {
      callback(path, value, options.metadata);
    }
  }

  public subscribe(path: string, callback: StateChangeCallback): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }

    this.subscribers.get(path)!.add(callback);

    return () => {
      this.subscribers.get(path)?.delete(callback);
      if (this.subscribers.get(path)?.size === 0) {
        this.subscribers.delete(path);
      }
    };
  }

  private notifySubscribers(path: string, newValue: any, oldValue: any): void {
    const subscribers = this.subscribers.get(path);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          this.logger.error('Error in subscriber callback', {
            path,
            error
          });
        }
      });
    }
  }

  public getMetadata(path: string): StateMetadata | undefined {
    return this.metadata.get(path);
  }

  public async clearState(): Promise<void> {
    this.state.clear();
    this.metadata.clear();
    this.subscribers.clear();
    this.callbacks.clear();
    this.logger.info('State cleared');
  }

  public async loadState(): Promise<void> {
    // Implementation for loading state from persistent storage
  }

  public addCallback(path: string, callback: (path: string, value: unknown, metadata?: StateMetadata) => void): void {
    const callbacks = this.callbacks.get(path) || [];
    callbacks.push(callback);
    this.callbacks.set(path, callbacks);
  }

  public removeCallback(path: string, callback: (path: string, value: unknown, metadata?: StateMetadata) => void): void {
    const callbacks = this.callbacks.get(path) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
} 