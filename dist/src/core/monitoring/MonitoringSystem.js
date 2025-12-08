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
exports.MonitoringSystem = void 0;
const EventSystem_1 = require("../events/EventSystem");
const StorageSystem_1 = require("../storage/StorageSystem");
const crypto = __importStar(require("crypto"));
class MonitoringSystem {
    constructor() {
        Object.defineProperty(this, "eventSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "alerts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "alertHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.storageSystem = StorageSystem_1.StorageSystem.getInstance();
        this.metrics = new Map();
        this.alerts = new Map();
        this.alertHandlers = new Set();
        // Persist metrics periodically
        setInterval(() => this.persistMetrics(), 300000); // Every 5 minutes
    }
    static getInstance() {
        if (!MonitoringSystem.instance) {
            MonitoringSystem.instance = new MonitoringSystem();
        }
        return MonitoringSystem.instance;
    }
    recordMetric(name, value, labels) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            labels
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)?.push(metric);
        // Check alerts
        this.checkAlerts(metric);
        // Emit metric event
        this.eventSystem.emit('monitoring:metric', metric);
    }
    getMetrics(name, timeRange) {
        const metrics = this.metrics.get(name) || [];
        if (!timeRange)
            return metrics;
        return metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }
    createAlert(name, condition, message, severity = 'warning') {
        const id = crypto.randomUUID();
        const alert = {
            id,
            name,
            condition,
            message,
            severity,
            status: 'resolved',
            timestamp: Date.now()
        };
        this.alerts.set(id, alert);
        return id;
    }
    onAlert(handler) {
        this.alertHandlers.add(handler);
        return () => {
            this.alertHandlers.delete(handler);
        };
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter(a => a.status === 'active');
    }
    checkAlerts(metric) {
        for (const alert of this.alerts.values()) {
            if (alert.condition(metric)) {
                if (alert.status !== 'active') {
                    alert.status = 'active';
                    alert.timestamp = Date.now();
                    this.notifyAlert(alert);
                }
            }
            else if (alert.status === 'active') {
                alert.status = 'resolved';
                alert.timestamp = Date.now();
                this.notifyAlert(alert);
            }
        }
    }
    notifyAlert(alert) {
        this.alertHandlers.forEach(handler => handler(alert));
        this.eventSystem.emit('monitoring:alert', alert);
    }
    async persistMetrics() {
        const metricNames = [];
        for (const [name, metrics] of this.metrics.entries()) {
            metricNames.push(name);
            await this.storageSystem.set(`metrics:${name}`, metrics);
        }
        // Persist key list for reload
        await this.storageSystem.set('metrics:keys', metricNames);
    }
    async loadPersistedMetrics() {
        const keys = (await this.storageSystem.get('metrics:keys')) || [];
        for (const key of keys) {
            const metrics = await this.storageSystem.get(`metrics:${key}`);
            if (metrics) {
                this.metrics.set(key, metrics);
            }
        }
    }
}
exports.MonitoringSystem = MonitoringSystem;
//# sourceMappingURL=MonitoringSystem.js.map