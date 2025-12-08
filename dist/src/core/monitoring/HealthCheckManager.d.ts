/**
 * Health Check Manager
 *
 * Comprehensive health monitoring system for the NoOrg multi-agent framework.
 * Provides automated health checks, alerting, and system status monitoring.
 */
export interface HealthCheck {
    id: string;
    name: string;
    description?: string;
    check: () => Promise<HealthStatus>;
    interval?: number;
    timeout?: number;
    enabled?: boolean;
    tags?: string[];
    dependencies?: string[];
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    message?: string;
    details?: Record<string, any>;
    timestamp: number;
    duration?: number;
}
export interface HealthCheckResult {
    checkId: string;
    status: HealthStatus;
    error?: Error;
    timestamp: number;
}
export interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, HealthStatus>;
    lastUpdated: number;
    uptime: number;
}
export declare class HealthCheckManager {
    private static instance;
    private healthChecks;
    private checkResults;
    private checkTimers;
    private monitoring;
    private events;
    private isRunning;
    private startTime;
    private constructor();
    static getInstance(): HealthCheckManager;
    /**
     * Register a health check
     */
    registerHealthCheck(check: HealthCheck): void;
    /**
     * Unregister a health check
     */
    unregisterHealthCheck(checkId: string): void;
    /**
     * Execute a specific health check
     */
    executeHealthCheck(checkId: string): Promise<HealthStatus>;
    /**
     * Get overall system health
     */
    getSystemHealth(): Promise<SystemHealth>;
    /**
     * Start the health check manager
     */
    start(): void;
    /**
     * Stop the health check manager
     */
    stop(): void;
    /**
     * Get health check results history
     */
    getCheckResults(checkId: string, limit?: number): HealthCheckResult[];
    /**
     * Get all registered health checks
     */
    getRegisteredChecks(): HealthCheck[];
    /**
     * Enable/disable a health check
     */
    setCheckEnabled(checkId: string, enabled: boolean): void;
    /**
     * Update health check configuration
     */
    updateHealthCheck(checkId: string, updates: Partial<HealthCheck>): void;
    private startHealthCheck;
    private stopHealthCheck;
    private storeCheckResult;
}
export declare const healthCheckManager: HealthCheckManager;
//# sourceMappingURL=HealthCheckManager.d.ts.map