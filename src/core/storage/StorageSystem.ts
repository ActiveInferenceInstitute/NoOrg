import { EventSystem } from '../events/EventSystem';
import * as fs from 'fs-extra';
import * as path from 'path';

// StorageBackend Interfaces
export interface StorageItem<T> {
  key: string;
  value: T;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface QueryOptions {
  prefix?: string;
  metadata?: Record<string, any>;
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'key' | 'timestamp';
  sortDirection?: 'asc' | 'desc';
}

export interface StorageBackend {
  set<T>(key: string, item: StorageItem<T>): Promise<void>;
  get<T>(key: string): Promise<StorageItem<T> | null>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(options?: QueryOptions): Promise<string[]>;
  query<T>(options: QueryOptions): Promise<StorageItem<T>[]>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

// Memory Storage Backend
export class MemoryStorageBackend implements StorageBackend {
  private store: Map<string, StorageItem<any>>;
  private transactionStore: Map<string, StorageItem<any>> | null = null;
  private deletedInTransaction: Set<string> = new Set();

  constructor() {
    this.store = new Map();
  }

  async set<T>(key: string, item: StorageItem<T>): Promise<void> {
    if (this.transactionStore !== null) {
      this.transactionStore.set(key, item);
    } else {
      this.store.set(key, item);
    }
  }

  async get<T>(key: string): Promise<StorageItem<T> | null> {
    // Check transaction store first if in transaction
    if (this.transactionStore !== null && this.transactionStore.has(key)) {
      return this.transactionStore.get(key) as StorageItem<T>;
    }
    
    // Check if key was deleted in transaction
    if (this.transactionStore !== null && this.deletedInTransaction.has(key)) {
      return null;
    }
    
    // Fall back to main store
    return (this.store.get(key) as StorageItem<T>) || null;
  }

  async delete(key: string): Promise<boolean> {
    if (this.transactionStore !== null) {
      this.deletedInTransaction.add(key);
      this.transactionStore.delete(key);
      return true;
    }
    return this.store.delete(key);
  }

  async clear(): Promise<void> {
    if (this.transactionStore !== null) {
      this.transactionStore.clear();
      // Mark all keys as deleted
      for (const key of this.store.keys()) {
        this.deletedInTransaction.add(key);
      }
    } else {
      this.store.clear();
    }
  }

  async keys(options?: QueryOptions): Promise<string[]> {
    let keysArray = Array.from(this.store.keys());
    
    // Apply transaction changes
    if (this.transactionStore !== null) {
      // Remove deleted keys
      keysArray = keysArray.filter(key => !this.deletedInTransaction.has(key));
      // Add keys from transaction
      keysArray = [...new Set([...keysArray, ...Array.from(this.transactionStore.keys())])];
    }
    
    return this.filterKeys(keysArray, options);
  }

  async query<T>(options: QueryOptions): Promise<StorageItem<T>[]> {
    const keys = await this.keys(options);
    const items: StorageItem<T>[] = [];
    
    for (const key of keys) {
      const item = await this.get<T>(key);
      if (item) {
        items.push(item);
      }
    }
    
    // Apply filtering based on options
    let results = this.filterItems(items, options);
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDirection === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        if (options.sortBy === 'timestamp') {
          return direction * (a.timestamp - b.timestamp);
        } else {
          return direction * a.key.localeCompare(b.key);
        }
      });
    }
    
    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit !== undefined ? options.limit : results.length;
      results = results.slice(offset, offset + limit);
    }
    
    return results;
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionStore !== null) {
      throw new Error('Transaction already in progress');
    }
    this.transactionStore = new Map();
    this.deletedInTransaction = new Set();
  }

  async commitTransaction(): Promise<void> {
    if (this.transactionStore === null) {
      throw new Error('No transaction in progress');
    }
    
    // Apply deletions
    for (const key of this.deletedInTransaction) {
      this.store.delete(key);
    }
    
    // Apply updates
    for (const [key, value] of this.transactionStore.entries()) {
      this.store.set(key, value);
    }
    
    // Reset transaction state
    this.transactionStore = null;
    this.deletedInTransaction.clear();
  }

  async rollbackTransaction(): Promise<void> {
    if (this.transactionStore === null) {
      throw new Error('No transaction in progress');
    }
    
    // Discard transaction
    this.transactionStore = null;
    this.deletedInTransaction.clear();
  }

  private filterKeys(keys: string[], options?: QueryOptions): string[] {
    if (!options) return keys;
    
    let filteredKeys = keys;
    
    // Filter by prefix
    if (options.prefix) {
      filteredKeys = filteredKeys.filter(key => key.startsWith(options.prefix!));
    }
    
    return filteredKeys;
  }

  private filterItems<T>(items: StorageItem<T>[], options: QueryOptions): StorageItem<T>[] {
    let filtered = items;
    
    // Filter by timestamp range
    if (options.fromTimestamp !== undefined) {
      filtered = filtered.filter(item => item.timestamp >= options.fromTimestamp!);
    }
    
    if (options.toTimestamp !== undefined) {
      filtered = filtered.filter(item => item.timestamp <= options.toTimestamp!);
    }
    
    // Filter by metadata
    if (options.metadata) {
      filtered = filtered.filter(item => {
        if (!item.metadata) return false;
        
        for (const [key, value] of Object.entries(options.metadata!)) {
          if (item.metadata[key] !== value) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return filtered;
  }
}

// File Storage Backend
export class FileStorageBackend implements StorageBackend {
  private storageDir: string;
  private memoryBackend: MemoryStorageBackend;
  private inTransaction: boolean = false;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.memoryBackend = new MemoryStorageBackend();
    
    // Ensure directory exists
    fs.ensureDirSync(this.storageDir);
  }

  async set<T>(key: string, item: StorageItem<T>): Promise<void> {
    await this.memoryBackend.set(key, item);
    
    if (!this.inTransaction) {
      await this.persistToDisk(key, item);
    }
  }

  async get<T>(key: string): Promise<StorageItem<T> | null> {
    // Try memory first
    const memItem = await this.memoryBackend.get<T>(key);
    if (memItem) {
      return memItem;
    }
    
    // Try loading from disk
    try {
      const item = await this.loadFromDisk<T>(key);
      if (item) {
        // Cache in memory
        await this.memoryBackend.set(key, item);
        return item;
      }
    } catch (error) {
      // Ignore file not found errors
    }
    
    return null;
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.memoryBackend.delete(key);
    
    if (!this.inTransaction) {
      const filePath = this.getStorageFilePath(key);
      try {
        await fs.remove(filePath);
      } catch (error) {
        // Ignore file not found errors
      }
    }
    
    return result;
  }

  async clear(): Promise<void> {
    await this.memoryBackend.clear();
    
    if (!this.inTransaction) {
      await fs.emptyDir(this.storageDir);
    }
  }

  async keys(options?: QueryOptions): Promise<string[]> {
    // Make sure all files are loaded into memory
    await this.loadAllFromDisk();
    
    // Delegate to memory backend
    return this.memoryBackend.keys(options);
  }

  async query<T>(options: QueryOptions): Promise<StorageItem<T>[]> {
    // Make sure all files are loaded into memory
    await this.loadAllFromDisk();
    
    // Delegate to memory backend
    return this.memoryBackend.query<T>(options);
  }

  async beginTransaction(): Promise<void> {
    this.inTransaction = true;
    await this.memoryBackend.beginTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.memoryBackend.commitTransaction();
    this.inTransaction = false;
    
    // Persist all changes to disk
    await this.persistAllToDisk();
  }

  async rollbackTransaction(): Promise<void> {
    await this.memoryBackend.rollbackTransaction();
    this.inTransaction = false;
  }

  private async persistToDisk<T>(key: string, item: StorageItem<T>): Promise<void> {
    const filePath = this.getStorageFilePath(key);
    await fs.writeJson(filePath, item, { spaces: 2 });
  }

  private async loadFromDisk<T>(key: string): Promise<StorageItem<T> | null> {
    const filePath = this.getStorageFilePath(key);
    try {
      return await fs.readJson(filePath) as StorageItem<T>;
    } catch (error) {
      return null;
    }
  }

  private getStorageFilePath(key: string): string {
    // Ensure key is valid as a filename by encoding it
    const encodedKey = Buffer.from(key).toString('base64');
    return path.join(this.storageDir, `${encodedKey}.json`);
  }

  private async loadAllFromDisk(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storageDir, file);
          try {
            const item = await fs.readJson(filePath);
            await this.memoryBackend.set(item.key, item);
          } catch (error) {
            // Ignore corrupted files
          }
        }
      }
    } catch (error) {
      console.error('Error loading files from disk:', error);
    }
  }

  private async persistAllToDisk(): Promise<void> {
    // Get all keys
    const keys = await this.memoryBackend.keys();
    
    // Clean the directory
    await fs.emptyDir(this.storageDir);
    
    // Persist each item
    for (const key of keys) {
      const item = await this.memoryBackend.get(key);
      if (item) {
        await this.persistToDisk(key, item);
      }
    }
  }
}

// Storage System Options
export interface StorageOptions {
  backend?: 'memory' | 'file' | 'custom';
  persistToDisk?: boolean;
  storageDir?: string;
  cacheTTL?: number;
  customBackend?: StorageBackend;
}

// Main Storage System
export class StorageSystem {
  private static instance: StorageSystem;
  private eventSystem: EventSystem;
  private backend: StorageBackend;
  private options: StorageOptions;
  private transactionInProgress: boolean = false;

  private constructor(options: StorageOptions = {}) {
    this.eventSystem = EventSystem.getInstance();
    this.options = {
      backend: 'memory',
      persistToDisk: true,
      cacheTTL: 3600000, // 1 hour
      ...options
    };

    // Initialize the appropriate backend
    this.backend = this.createBackend();

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), this.options.cacheTTL || 3600000);
  }

  private createBackend(): StorageBackend {
    switch (this.options.backend) {
      case 'file':
        const storageDir = this.options.storageDir || path.join(process.cwd(), '.storage');
        return new FileStorageBackend(storageDir);
      case 'custom':
        if (!this.options.customBackend) {
          throw new Error('Custom backend specified but no implementation provided');
        }
        return this.options.customBackend;
      case 'memory':
      default:
        return new MemoryStorageBackend();
    }
  }

  public static getInstance(options?: StorageOptions): StorageSystem {
    if (!StorageSystem.instance) {
      StorageSystem.instance = new StorageSystem(options);
    }
    return StorageSystem.instance;
  }

  public async set<T>(key: string, value: T, metadata?: Record<string, any>): Promise<void> {
    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      metadata
    };

    await this.backend.set(key, item);
    this.eventSystem.emit('storage:set', { key, metadata });
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = await this.backend.get<T>(key);
    
    if (item) {
      if (this.isItemExpired(item)) {
        await this.backend.delete(key);
        return null;
      }
      return item.value;
    }
    
    return null;
  }

  public async delete(key: string): Promise<void> {
    await this.backend.delete(key);
    this.eventSystem.emit('storage:delete', { key });
  }

  public async clear(): Promise<void> {
    await this.backend.clear();
    this.eventSystem.emit('storage:clear', {});
  }

  public async keys(options?: QueryOptions): Promise<string[]> {
    return this.backend.keys(options);
  }

  public async query<T>(options: QueryOptions): Promise<T[]> {
    const items = await this.backend.query<T>(options);
    
    // Filter expired items and extract just the values
    return items
      .filter(item => !this.isItemExpired(item))
      .map(item => item.value);
  }

  public async beginTransaction(): Promise<void> {
    if (this.transactionInProgress) {
      throw new Error('Transaction already in progress');
    }
    
    await this.backend.beginTransaction();
    this.transactionInProgress = true;
    this.eventSystem.emit('storage:transaction:begin', {});
  }

  public async commitTransaction(): Promise<void> {
    if (!this.transactionInProgress) {
      throw new Error('No transaction in progress');
    }
    
    await this.backend.commitTransaction();
    this.transactionInProgress = false;
    this.eventSystem.emit('storage:transaction:commit', {});
  }

  public async rollbackTransaction(): Promise<void> {
    if (!this.transactionInProgress) {
      throw new Error('No transaction in progress');
    }
    
    await this.backend.rollbackTransaction();
    this.transactionInProgress = false;
    this.eventSystem.emit('storage:transaction:rollback', {});
  }

  private isItemExpired(item: StorageItem<any>): boolean {
    if (!this.options.cacheTTL) return false;
    const age = Date.now() - item.timestamp;
    return age > this.options.cacheTTL;
  }

  private async cleanupCache(): Promise<void> {
    // Don't clean during transaction
    if (this.transactionInProgress) {
      return;
    }
    
    const now = Date.now();
    const allKeys = await this.backend.keys();
    
    for (const key of allKeys) {
      const item = await this.backend.get(key);
      if (item && this.isItemExpired(item)) {
        await this.backend.delete(key);
      }
    }
  }
} 