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
export declare class MemoryStorageBackend implements StorageBackend {
    private store;
    private transactionStore;
    private deletedInTransaction;
    constructor();
    set<T>(key: string, item: StorageItem<T>): Promise<void>;
    get<T>(key: string): Promise<StorageItem<T> | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(options?: QueryOptions): Promise<string[]>;
    query<T>(options: QueryOptions): Promise<StorageItem<T>[]>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    private filterKeys;
    private filterItems;
}
export declare class FileStorageBackend implements StorageBackend {
    private storageDir;
    private memoryBackend;
    private inTransaction;
    constructor(storageDir: string);
    set<T>(key: string, item: StorageItem<T>): Promise<void>;
    get<T>(key: string): Promise<StorageItem<T> | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(options?: QueryOptions): Promise<string[]>;
    query<T>(options: QueryOptions): Promise<StorageItem<T>[]>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    private persistToDisk;
    private loadFromDisk;
    private getStorageFilePath;
    private loadAllFromDisk;
    private persistAllToDisk;
}
export interface StorageOptions {
    backend?: 'memory' | 'file' | 'custom';
    persistToDisk?: boolean;
    storageDir?: string;
    cacheTTL?: number;
    customBackend?: StorageBackend;
}
export declare class StorageSystem {
    private static instance;
    private eventSystem;
    private backend;
    private options;
    private transactionInProgress;
    private constructor();
    private createBackend;
    static getInstance(options?: StorageOptions): StorageSystem;
    set<T>(key: string, value: T, metadata?: Record<string, any>): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(options?: QueryOptions): Promise<string[]>;
    query<T>(options: QueryOptions): Promise<T[]>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    private isItemExpired;
    private cleanupCache;
}
//# sourceMappingURL=StorageSystem.d.ts.map