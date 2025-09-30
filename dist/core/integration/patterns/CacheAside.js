"use strict";
/**
 * Cache-Aside Pattern (Lazy Loading)
 * Data is loaded into the cache only when needed
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheAsidePattern = void 0;
class CacheAsidePattern {
    constructor(config) {
        this.cache = new Map();
        this.config = {
            ttl: config.ttl,
            maxSize: config.maxSize || 1000,
            onEvict: config.onEvict
        };
    }
    /**
     * Get value from cache or fetch from source
     * @param key Cache key
     * @param fetchFn Function to fetch data if not in cache
     * @returns Cached or fetched value
     */
    async get(key, fetchFn) {
        // Check cache first
        const cached = this.cache.get(key);
        if (cached && !this.isExpired(cached)) {
            // Cache hit
            cached.hits++;
            return cached.value;
        }
        // Cache miss - fetch from source
        const value = await fetchFn();
        // Store in cache
        await this.set(key, value);
        return value;
    }
    /**
     * Set value in cache
     */
    async set(key, value) {
        // Check if cache is full
        if (this.cache.size >= (this.config.maxSize || 1000)) {
            await this.evictLRU();
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            hits: 0
        });
    }
    /**
     * Invalidate cache entry
     */
    async invalidate(key) {
        const entry = this.cache.get(key);
        if (entry && this.config.onEvict) {
            this.config.onEvict(key, entry.value);
        }
        this.cache.delete(key);
    }
    /**
     * Invalidate all cache entries matching a pattern
     */
    async invalidatePattern(pattern) {
        const keysToInvalidate = [];
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                keysToInvalidate.push(key);
            }
        }
        for (const key of keysToInvalidate) {
            await this.invalidate(key);
        }
    }
    /**
     * Clear entire cache
     */
    async clear() {
        if (this.config.onEvict) {
            for (const [key, entry] of this.cache.entries()) {
                this.config.onEvict(key, entry.value);
            }
        }
        this.cache.clear();
    }
    /**
     * Check if cache entry is expired
     */
    isExpired(entry) {
        return Date.now() - entry.timestamp > this.config.ttl;
    }
    /**
     * Evict least recently used entry
     */
    async evictLRU() {
        let lruKey = null;
        let lruTimestamp = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < lruTimestamp) {
                lruTimestamp = entry.timestamp;
                lruKey = key;
            }
        }
        if (lruKey) {
            await this.invalidate(lruKey);
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        let totalHits = 0;
        let totalAccesses = 0;
        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
            totalAccesses += entry.hits + 1; // +1 for initial miss
        }
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize || 1000,
            hitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0
        };
    }
    /**
     * Warm up cache with initial data
     */
    async warmUp(entries) {
        for (const [key, value] of entries.entries()) {
            await this.set(key, value);
        }
    }
}
exports.CacheAsidePattern = CacheAsidePattern;
//# sourceMappingURL=CacheAside.js.map