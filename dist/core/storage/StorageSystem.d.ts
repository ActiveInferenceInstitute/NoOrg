interface StorageOptions {
    persistToDisk?: boolean;
    cacheTTL?: number;
}
export declare class StorageSystem {
    private static instance;
    private eventSystem;
    private memoryStore;
    private storageDir;
    private options;
    private constructor();
    static getInstance(options?: StorageOptions): StorageSystem;
    set<T>(key: string, value: T, metadata?: Record<string, any>): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    private persistToDisk;
    private loadFromDisk;
    private getStorageFilePath;
    private isItemExpired;
    private cleanupCache;
}
export {};
