"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageSystem = exports.FileStorageBackend = exports.MemoryStorageBackend = void 0;
const EventSystem_1 = require("../events/EventSystem");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
// Memory Storage Backend
class MemoryStorageBackend {
    constructor() {
        this.transactionStore = null;
        this.deletedInTransaction = new Set();
        this.store = new Map();
    }
    async set(key, item) {
        if (this.transactionStore !== null) {
            this.transactionStore.set(key, item);
        }
        else {
            this.store.set(key, item);
        }
    }
    async get(key) {
        // Check transaction store first if in transaction
        if (this.transactionStore !== null && this.transactionStore.has(key)) {
            return this.transactionStore.get(key);
        }
        // Check if key was deleted in transaction
        if (this.transactionStore !== null && this.deletedInTransaction.has(key)) {
            return null;
        }
        // Fall back to main store
        return this.store.get(key) || null;
    }
    async delete(key) {
        if (this.transactionStore !== null) {
            this.deletedInTransaction.add(key);
            this.transactionStore.delete(key);
            return true;
        }
        return this.store.delete(key);
    }
    async clear() {
        if (this.transactionStore !== null) {
            this.transactionStore.clear();
            // Mark all keys as deleted
            for (const key of this.store.keys()) {
                this.deletedInTransaction.add(key);
            }
        }
        else {
            this.store.clear();
        }
    }
    async keys(options) {
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
    async query(options) {
        const keys = await this.keys(options);
        const items = [];
        for (const key of keys) {
            const item = await this.get(key);
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
                }
                else {
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
    async beginTransaction() {
        if (this.transactionStore !== null) {
            throw new Error('Transaction already in progress');
        }
        this.transactionStore = new Map();
        this.deletedInTransaction = new Set();
    }
    async commitTransaction() {
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
    async rollbackTransaction() {
        if (this.transactionStore === null) {
            throw new Error('No transaction in progress');
        }
        // Discard transaction
        this.transactionStore = null;
        this.deletedInTransaction.clear();
    }
    filterKeys(keys, options) {
        if (!options)
            return keys;
        let filteredKeys = keys;
        // Filter by prefix
        if (options.prefix) {
            filteredKeys = filteredKeys.filter(key => key.startsWith(options.prefix));
        }
        return filteredKeys;
    }
    filterItems(items, options) {
        let filtered = items;
        // Filter by timestamp range
        if (options.fromTimestamp !== undefined) {
            filtered = filtered.filter(item => item.timestamp >= options.fromTimestamp);
        }
        if (options.toTimestamp !== undefined) {
            filtered = filtered.filter(item => item.timestamp <= options.toTimestamp);
        }
        // Filter by metadata
        if (options.metadata) {
            filtered = filtered.filter(item => {
                if (!item.metadata)
                    return false;
                for (const [key, value] of Object.entries(options.metadata)) {
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
exports.MemoryStorageBackend = MemoryStorageBackend;
// File Storage Backend
class FileStorageBackend {
    constructor(storageDir) {
        this.inTransaction = false;
        this.storageDir = storageDir;
        this.memoryBackend = new MemoryStorageBackend();
        // Ensure directory exists
        fs.ensureDirSync(this.storageDir);
    }
    async set(key, item) {
        await this.memoryBackend.set(key, item);
        if (!this.inTransaction) {
            await this.persistToDisk(key, item);
        }
    }
    async get(key) {
        // Try memory first
        const memItem = await this.memoryBackend.get(key);
        if (memItem) {
            return memItem;
        }
        // Try loading from disk
        try {
            const item = await this.loadFromDisk(key);
            if (item) {
                // Cache in memory
                await this.memoryBackend.set(key, item);
                return item;
            }
        }
        catch (error) {
            // Ignore file not found errors
        }
        return null;
    }
    async delete(key) {
        const result = await this.memoryBackend.delete(key);
        if (!this.inTransaction) {
            const filePath = this.getStorageFilePath(key);
            try {
                await fs.remove(filePath);
            }
            catch (error) {
                // Ignore file not found errors
            }
        }
        return result;
    }
    async clear() {
        await this.memoryBackend.clear();
        if (!this.inTransaction) {
            await fs.emptyDir(this.storageDir);
        }
    }
    async keys(options) {
        // Make sure all files are loaded into memory
        await this.loadAllFromDisk();
        // Delegate to memory backend
        return this.memoryBackend.keys(options);
    }
    async query(options) {
        // Make sure all files are loaded into memory
        await this.loadAllFromDisk();
        // Delegate to memory backend
        return this.memoryBackend.query(options);
    }
    async beginTransaction() {
        this.inTransaction = true;
        await this.memoryBackend.beginTransaction();
    }
    async commitTransaction() {
        await this.memoryBackend.commitTransaction();
        this.inTransaction = false;
        // Persist all changes to disk
        await this.persistAllToDisk();
    }
    async rollbackTransaction() {
        await this.memoryBackend.rollbackTransaction();
        this.inTransaction = false;
    }
    async persistToDisk(key, item) {
        const filePath = this.getStorageFilePath(key);
        await fs.writeJson(filePath, item, { spaces: 2 });
    }
    async loadFromDisk(key) {
        const filePath = this.getStorageFilePath(key);
        try {
            return await fs.readJson(filePath);
        }
        catch (error) {
            return null;
        }
    }
    getStorageFilePath(key) {
        // Ensure key is valid as a filename by encoding it
        const encodedKey = Buffer.from(key).toString('base64');
        return path.join(this.storageDir, `${encodedKey}.json`);
    }
    async loadAllFromDisk() {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.storageDir, file);
                    try {
                        const item = await fs.readJson(filePath);
                        await this.memoryBackend.set(item.key, item);
                    }
                    catch (error) {
                        // Ignore corrupted files
                    }
                }
            }
        }
        catch (error) {
            console.error('Error loading files from disk:', error);
        }
    }
    async persistAllToDisk() {
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
exports.FileStorageBackend = FileStorageBackend;
// Main Storage System
class StorageSystem {
    constructor(options = {}) {
        this.transactionInProgress = false;
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
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
    createBackend() {
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
    static getInstance(options) {
        if (!StorageSystem.instance) {
            StorageSystem.instance = new StorageSystem(options);
        }
        return StorageSystem.instance;
    }
    async set(key, value, metadata) {
        const item = {
            key,
            value,
            timestamp: Date.now(),
            metadata
        };
        await this.backend.set(key, item);
        this.eventSystem.emit('storage:set', { key, metadata });
    }
    async get(key) {
        const item = await this.backend.get(key);
        if (item) {
            if (this.isItemExpired(item)) {
                await this.backend.delete(key);
                return null;
            }
            return item.value;
        }
        return null;
    }
    async delete(key) {
        await this.backend.delete(key);
        this.eventSystem.emit('storage:delete', { key });
    }
    async clear() {
        await this.backend.clear();
        this.eventSystem.emit('storage:clear', {});
    }
    async keys(options) {
        return this.backend.keys(options);
    }
    async query(options) {
        const items = await this.backend.query(options);
        // Filter expired items and extract just the values
        return items
            .filter(item => !this.isItemExpired(item))
            .map(item => item.value);
    }
    async beginTransaction() {
        if (this.transactionInProgress) {
            throw new Error('Transaction already in progress');
        }
        await this.backend.beginTransaction();
        this.transactionInProgress = true;
        this.eventSystem.emit('storage:transaction:begin', {});
    }
    async commitTransaction() {
        if (!this.transactionInProgress) {
            throw new Error('No transaction in progress');
        }
        await this.backend.commitTransaction();
        this.transactionInProgress = false;
        this.eventSystem.emit('storage:transaction:commit', {});
    }
    async rollbackTransaction() {
        if (!this.transactionInProgress) {
            throw new Error('No transaction in progress');
        }
        await this.backend.rollbackTransaction();
        this.transactionInProgress = false;
        this.eventSystem.emit('storage:transaction:rollback', {});
    }
    isItemExpired(item) {
        if (!this.options.cacheTTL)
            return false;
        const age = Date.now() - item.timestamp;
        return age > this.options.cacheTTL;
    }
    async cleanupCache() {
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
exports.StorageSystem = StorageSystem;
//# sourceMappingURL=StorageSystem.js.map