import { Agent } from './types';
import { AgentRegistry } from './interfaces/AgentRegistry';
/**
 * Health check function type
 */
export type HealthCheckFunction = (agent: Agent) => Promise<HealthCheckResult>;
/**
 * Health check result
 */
export interface HealthCheckResult {
    healthy: boolean;
    message?: string;
    metrics?: Record<string, any>;
}
/**
 * Health status for an agent
 */
export interface HealthStatus {
    agentId: string;
    healthy: boolean;
    lastCheck: number;
    checks: Record<string, HealthCheckResult>;
    metrics: HealthMetrics;
    issues: HealthIssue[];
}
/**
 * Health metrics
 */
export interface HealthMetrics {
    uptime: number;
    responseTime: number;
    successRate: number;
    errorRate: number;
    taskCompletionRate: number;
    averageTaskDuration: number;
}
/**
 * Health issue
 */
export interface HealthIssue {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: number;
    resolved: boolean;
}
/**
 * Health check configuration
 */
export interface HealthCheck {
    id: string;
    name: string;
    description: string;
    checkFunction: HealthCheckFunction;
    interval: number;
    timeout: number;
    enabled: boolean;
}
/**
 * Health thresholds
 */
export interface HealthThresholds {
    minSuccessRate: number;
    maxErrorRate: number;
    maxResponseTime: number;
    minUptime: number;
}
/**
 * Health report
 */
export interface HealthReport {
    agentId: string;
    timestamp: number;
    overall: 'healthy' | 'degraded' | 'unhealthy';
    status: HealthStatus;
    recommendations: string[];
}
/**
 * Agent Health Monitor
 * Monitors agent health and performance metrics
 */
export declare class AgentHealthMonitor {
    private static instance;
    private healthChecks;
    private healthStatuses;
    private healthThresholds;
    private logger;
    private agentRegistry;
    private monitoringIntervals;
    private startTimes;
    /**
     * Get singleton instance
     */
    static getInstance(agentRegistry?: AgentRegistry): AgentHealthMonitor;
    private constructor();
    /**
     * Set health thresholds
     */
    setThresholds(thresholds: Partial<HealthThresholds>): void;
    /**
     * Register a health check for an agent
     */
    registerHealthCheck(agentId: string, check: Omit<HealthCheck, 'id'>): Promise<string>;
    /**
     * Unregister a health check
     */
    unregisterHealthCheck(agentId: string, checkId: string): Promise<void>;
    /**
     * Start health check monitoring for an agent
     */
    private startHealthCheck;
    /**
     * Stop health check monitoring
     */
    private stopHealthCheck;
    /**
     * Perform a health check
     */
    performHealthCheck(agentId: string, checkId: string): Promise<HealthCheckResult>;
    /**
     * Update health status after a check
     */
    private updateHealthStatus;
    /**
     * Get health status for an agent
     */
    getHealthStatus(agentId: string): Promise<HealthStatus | null>;
    /**
     * Monitor agent and return current status
     */
    monitorAgent(agentId: string): Promise<HealthStatus>;
    /**
     * Calculate health metrics for an agent
     */
    private calculateMetrics;
    /**
     * Generate a comprehensive health report
     */
    generateHealthReport(agentId: string): Promise<HealthReport>;
    /**
     * Start monitoring an agent
     */
    startMonitoring(agentId: string): Promise<void>;
    /**
     * Stop monitoring an agent
     */
    stopMonitoring(agentId: string): Promise<void>;
    /**
     * Register default health checks
     */
    private registerDefaultHealthChecks;
    /**
     * Get all monitored agents
     */
    getMonitoredAgents(): string[];
    /**
     * Get unhealthy agents
     */
    getUnhealthyAgents(): string[];
    /**
     * Resolve a health issue
     */
    resolveIssue(agentId: string, issueId: string): Promise<void>;
}
//# sourceMappingURL=AgentHealthMonitor.d.ts.map