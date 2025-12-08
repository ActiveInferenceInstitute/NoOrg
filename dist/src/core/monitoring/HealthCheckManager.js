"use strict";
/**
 * Health Check Manager
 *
 * Comprehensive health monitoring system for the NoOrg multi-agent framework.
 * Provides automated health checks, alerting, and system status monitoring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckManager = exports.HealthCheckManager = void 0;
const MonitoringSystem_1 = require("./MonitoringSystem");
const EventSystem_1 = require("../events/EventSystem");
class HealthCheckManager {
    constructor() {
        Object.defineProperty(this, "healthChecks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "checkResults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "checkTimers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "monitoring", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isRunning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Date.now()
        });
        this.monitoring = MonitoringSystem_1.MonitoringSystem.getInstance();
        this.events = EventSystem_1.EventSystem.getInstance();
    }
    static getInstance() {
        if (!HealthCheckManager.instance) {
            HealthCheckManager.instance = new HealthCheckManager();
        }
        return HealthCheckManager.instance;
    }
    /**
     * Register a health check
     */
    registerHealthCheck(check) {
        if (this.healthChecks.has(check.id)) {
            throw new Error(`Health check with ID '${check.id}' already exists`);
        }
        this.healthChecks.set(check.id, {
            interval: 30000, // Default 30 seconds
            timeout: 5000, // Default 5 seconds
            enabled: true,
            ...check
        });
        // Start the health check if manager is running
        if (this.isRunning) {
            this.startHealthCheck(check.id);
        }
        this.events.publish('health-check.registered', {
            checkId: check.id,
            name: check.name
        });
    }
    /**
     * Unregister a health check
     */
    unregisterHealthCheck(checkId) {
        const check = this.healthChecks.get(checkId);
        if (!check) {
            return;
        }
        // Stop the timer
        const timer = this.checkTimers.get(checkId);
        if (timer) {
            clearInterval(timer);
            this.checkTimers.delete(checkId);
        }
        // Remove from registry
        this.healthChecks.delete(checkId);
        this.checkResults.delete(checkId);
        this.events.publish('health-check.unregistered', {
            checkId
        });
    }
    /**
     * Execute a specific health check
     */
    async executeHealthCheck(checkId) {
        const check = this.healthChecks.get(checkId);
        if (!check || !check.enabled) {
            throw new Error(`Health check '${checkId}' not found or disabled`);
        }
        const startTime = Date.now();
        try {
            // Execute with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Health check timeout')), check.timeout || 5000);
            });
            const checkPromise = check.check();
            const result = await Promise.race([checkPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            const status = {
                ...result,
                duration,
                timestamp: Date.now()
            };
            // Store result
            this.storeCheckResult(checkId, { checkId, status, timestamp: Date.now() });
            // Record metrics
            this.monitoring.recordMetric('health.check.duration', duration, { checkId });
            this.monitoring.recordMetric(`health.check.status.${status.status}`, 1, { checkId });
            return status;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorStatus = {
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: { error: error instanceof Error ? error.stack : String(error) },
                duration,
                timestamp: Date.now()
            };
            // Store error result
            this.storeCheckResult(checkId, {
                checkId,
                status: errorStatus,
                error: error instanceof Error ? error : new Error(String(error)),
                timestamp: Date.now()
            });
            // Record error metrics
            this.monitoring.recordMetric('health.check.errors', 1, { checkId });
            return errorStatus;
        }
    }
    /**
     * Get overall system health
     */
    async getSystemHealth() {
        const components = {};
        let overall = 'healthy';
        // Execute all health checks
        const checkPromises = Array.from(this.healthChecks.values())
            .filter(check => check.enabled)
            .map(async (check) => {
            try {
                const status = await this.executeHealthCheck(check.id);
                components[check.id] = status;
                // Determine overall status
                if (status.status === 'unhealthy') {
                    overall = 'unhealthy';
                }
                else if (status.status === 'degraded' && overall === 'healthy') {
                    overall = 'degraded';
                }
            }
            catch (error) {
                components[check.id] = {
                    status: 'unknown',
                    message: 'Failed to execute health check',
                    details: { error: String(error) },
                    timestamp: Date.now()
                };
                overall = 'unhealthy';
            }
        });
        await Promise.all(checkPromises);
        const systemHealth = {
            overall,
            components,
            lastUpdated: Date.now(),
            uptime: Date.now() - this.startTime
        };
        // Record overall health metrics
        this.monitoring.recordMetric('system.health.status', overall === 'healthy' ? 1 : overall === 'degraded' ? 0.5 : 0);
        return systemHealth;
    }
    /**
     * Start the health check manager
     */
    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.startTime = Date.now();
        // Start all registered health checks
        for (const checkId of this.healthChecks.keys()) {
            this.startHealthCheck(checkId);
        }
        this.events.publish('health-check-manager.started', {
            checkCount: this.healthChecks.size
        });
    }
    /**
     * Stop the health check manager
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        // Stop all timers
        for (const timer of this.checkTimers.values()) {
            clearInterval(timer);
        }
        this.checkTimers.clear();
        this.events.publish('health-check-manager.stopped', {
            checkCount: this.healthChecks.size
        });
    }
    /**
     * Get health check results history
     */
    getCheckResults(checkId, limit = 100) {
        return this.checkResults.get(checkId)?.slice(-limit) || [];
    }
    /**
     * Get all registered health checks
     */
    getRegisteredChecks() {
        return Array.from(this.healthChecks.values());
    }
    /**
     * Enable/disable a health check
     */
    setCheckEnabled(checkId, enabled) {
        const check = this.healthChecks.get(checkId);
        if (!check) {
            throw new Error(`Health check '${checkId}' not found`);
        }
        check.enabled = enabled;
        this.healthChecks.set(checkId, check);
        if (enabled) {
            this.startHealthCheck(checkId);
        }
        else {
            this.stopHealthCheck(checkId);
        }
    }
    /**
     * Update health check configuration
     */
    updateHealthCheck(checkId, updates) {
        const check = this.healthChecks.get(checkId);
        if (!check) {
            throw new Error(`Health check '${checkId}' not found`);
        }
        const updatedCheck = { ...check, ...updates };
        this.healthChecks.set(checkId, updatedCheck);
        // Restart the check with new configuration
        this.stopHealthCheck(checkId);
        if (this.isRunning && updatedCheck.enabled) {
            this.startHealthCheck(checkId);
        }
    }
    startHealthCheck(checkId) {
        const check = this.healthChecks.get(checkId);
        if (!check || !check.enabled) {
            return;
        }
        // Stop existing timer
        this.stopHealthCheck(checkId);
        // Start new timer
        const timer = setInterval(async () => {
            try {
                await this.executeHealthCheck(checkId);
            }
            catch (error) {
                console.error(`Health check '${checkId}' failed:`, error);
            }
        }, check.interval || 30000);
        this.checkTimers.set(checkId, timer);
    }
    stopHealthCheck(checkId) {
        const timer = this.checkTimers.get(checkId);
        if (timer) {
            clearInterval(timer);
            this.checkTimers.delete(checkId);
        }
    }
    storeCheckResult(checkId, result) {
        if (!this.checkResults.has(checkId)) {
            this.checkResults.set(checkId, []);
        }
        const results = this.checkResults.get(checkId);
        results.push(result);
        // Keep only last 1000 results per check
        if (results.length > 1000) {
            results.splice(0, results.length - 1000);
        }
    }
}
exports.HealthCheckManager = HealthCheckManager;
// Export singleton instance
exports.healthCheckManager = HealthCheckManager.getInstance();
//# sourceMappingURL=HealthCheckManager.js.map