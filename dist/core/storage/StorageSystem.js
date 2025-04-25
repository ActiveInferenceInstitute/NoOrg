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
exports.StorageSystem = void 0;
const EventSystem_1 = require("../events/EventSystem");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class StorageSystem {
    constructor(options = {}) {
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.memoryStore = new Map();
        this.storageDir = path.join(process.cwd(), '.storage');
        this.options = {
            persistToDisk: true,
            cacheTTL: 3600000, // 1 hour
            ...options
        };
        // Ensure storage directory exists
        if (this.options.persistToDisk) {
            fs.ensureDirSync(this.storageDir);
        }
        // Start cache cleanup interval
        setInterval(() => this.cleanupCache(), this.options.cacheTTL || 3600000);
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
        this.memoryStore.set(key, item);
        if (this.options.persistToDisk) {
            await this.persistToDisk(key, item);
        }
        this.eventSystem.emit('storage:set', { key, metadata });
    }
    async get(key) {
        // Check memory store first
        const item = this.memoryStore.get(key);
        if (item) {
            if (this.isItemExpired(item)) {
                this.memoryStore.delete(key);
                return null;
            }
            return item.value;
        }
        // Check disk if enabled
        if (this.options.persistToDisk) {
            try {
                const item = await this.loadFromDisk(key);
                if (item && !this.isItemExpired(item)) {
                    this.memoryStore.set(key, item);
                    return item.value;
                }
            }
            catch (error) {
                console.error(`Error loading key ${key} from disk:`, error);
            }
        }
        return null;
    }
    async delete(key) {
        this.memoryStore.delete(key);
        if (this.options.persistToDisk) {
            const filePath = this.getStorageFilePath(key);
            await fs.remove(filePath);
        }
        this.eventSystem.emit('storage:delete', { key });
    }
    async clear() {
        this.memoryStore.clear();
        if (this.options.persistToDisk) {
            await fs.emptyDir(this.storageDir);
        }
        this.eventSystem.emit('storage:clear', {});
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
        return path.join(this.storageDir, `${key}.json`);
    }
    isItemExpired(item) {
        if (!this.options.cacheTTL)
            return false;
        const age = Date.now() - item.timestamp;
        return age > this.options.cacheTTL;
    }
    async cleanupCache() {
        const now = Date.now();
        for (const [key, item] of this.memoryStore.entries()) {
            if (this.isItemExpired(item)) {
                this.memoryStore.delete(key);
            }
        }
    }
}
exports.StorageSystem = StorageSystem;
//# sourceMappingURL=StorageSystem.js.map