/**
 * Cache-Aside Pattern (Lazy Loading)
 * Data is loaded into the cache only when needed
 */
export interface CacheConfig {
    ttl: number;
    maxSize?: number;
    onEvict?: (key: string, value: any) => void;
}
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    hits: number;
}
export declare class CacheAsidePattern {
    private cache;
    private config;
    constructor(config: CacheConfig);
    /**
     * Get value from cache or fetch from source
     * @param key Cache key
     * @param fetchFn Function to fetch data if not in cache
     * @returns Cached or fetched value
     */
    get<T>(key: string, fetchFn: () => Promise<T>): Promise<T>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T): Promise<void>;
    /**
     * Invalidate cache entry
     */
    invalidate(key: string): Promise<void>;
    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern: RegExp): Promise<void>;
    /**
     * Clear entire cache
     */
    clear(): Promise<void>;
    /**
     * Check if cache entry is expired
     */
    private isExpired;
    /**
     * Evict least recently used entry
     */
    private evictLRU;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    };
    /**
     * Warm up cache with initial data
     */
    warmUp<T>(entries: Map<string, T>): Promise<void>;
}
