import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentStatus } from './types';
import { AgentRegistry } from './interfaces/AgentRegistry';
import { Logger } from './Logger';

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
  interval: number; // ms
  timeout: number; // ms
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
export class AgentHealthMonitor {
  private static instance: AgentHealthMonitor;
  private healthChecks: Map<string, Map<string, HealthCheck>> = new Map(); // agentId -> checkId -> HealthCheck
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private healthThresholds: HealthThresholds;
  private logger: Logger;
  private agentRegistry: AgentRegistry;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(agentRegistry?: AgentRegistry): AgentHealthMonitor {
    if (!AgentHealthMonitor.instance) {
      if (!agentRegistry) {
        throw new Error('AgentRegistry required for first initialization');
      }
      AgentHealthMonitor.instance = new AgentHealthMonitor(agentRegistry);
    }
    return AgentHealthMonitor.instance;
  }

  private constructor(agentRegistry: AgentRegistry) {
    this.agentRegistry = agentRegistry;
    this.logger = new Logger('AgentHealthMonitor');
    
    // Default thresholds
    this.healthThresholds = {
      minSuccessRate: 90, // 90%
      maxErrorRate: 10, // 10%
      maxResponseTime: 5000, // 5 seconds
      minUptime: 0.99 // 99% uptime
    };

    this.logger.info('AgentHealthMonitor initialized');
  }

  /**
   * Set health thresholds
   */
  setThresholds(thresholds: Partial<HealthThresholds>): void {
    this.healthThresholds = {
      ...this.healthThresholds,
      ...thresholds
    };
    this.logger.info('Health thresholds updated', thresholds);
  }

  /**
   * Register a health check for an agent
   */
  async registerHealthCheck(
    agentId: string,
    check: Omit<HealthCheck, 'id'>
  ): Promise<string> {
    const checkId = uuidv4();
    const healthCheck: HealthCheck = {
      id: checkId,
      ...check
    };

    if (!this.healthChecks.has(agentId)) {
      this.healthChecks.set(agentId, new Map());
    }

    this.healthChecks.get(agentId)!.set(checkId, healthCheck);

    this.logger.info(`Health check registered for agent ${agentId}`, {
      checkId,
      name: healthCheck.name
    });

    // Start monitoring if enabled
    if (healthCheck.enabled) {
      await this.startHealthCheck(agentId, checkId);
    }

    return checkId;
  }

  /**
   * Unregister a health check
   */
  async unregisterHealthCheck(agentId: string, checkId: string): Promise<void> {
    const checks = this.healthChecks.get(agentId);
    if (checks) {
      checks.delete(checkId);
      await this.stopHealthCheck(agentId, checkId);
      this.logger.info(`Health check unregistered for agent ${agentId}`, { checkId });
    }
  }

  /**
   * Start health check monitoring for an agent
   */
  private async startHealthCheck(agentId: string, checkId: string): Promise<void> {
    const checks = this.healthChecks.get(agentId);
    if (!checks) return;

    const check = checks.get(checkId);
    if (!check || !check.enabled) return;

    const intervalKey = `${agentId}:${checkId}`;
    
    // Clear existing interval if any
    if (this.monitoringIntervals.has(intervalKey)) {
      clearInterval(this.monitoringIntervals.get(intervalKey)!);
    }

    // Set up periodic health check
    const interval = setInterval(async () => {
      await this.performHealthCheck(agentId, checkId);
    }, check.interval);

    this.monitoringIntervals.set(intervalKey, interval);

    // Perform initial check
    await this.performHealthCheck(agentId, checkId);
  }

  /**
   * Stop health check monitoring
   */
  private async stopHealthCheck(agentId: string, checkId: string): Promise<void> {
    const intervalKey = `${agentId}:${checkId}`;
    const interval = this.monitoringIntervals.get(intervalKey);
    
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(intervalKey);
    }
  }

  /**
   * Perform a health check
   */
  async performHealthCheck(agentId: string, checkId: string): Promise<HealthCheckResult> {
    const checks = this.healthChecks.get(agentId);
    if (!checks) {
      throw new Error(`No health checks registered for agent ${agentId}`);
    }

    const check = checks.get(checkId);
    if (!check) {
      throw new Error(`Health check ${checkId} not found for agent ${agentId}`);
    }

    try {
      const agent = await this.agentRegistry.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Execute health check with timeout
      const result = await Promise.race([
        check.checkFunction(agent),
        new Promise<HealthCheckResult>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
        )
      ]);

      // Update health status
      await this.updateHealthStatus(agentId, checkId, result);

      return result;
    } catch (error: any) {
      const result: HealthCheckResult = {
        healthy: false,
        message: `Health check failed: ${error.message}`
      };

      await this.updateHealthStatus(agentId, checkId, result);
      return result;
    }
  }

  /**
   * Update health status after a check
   */
  private async updateHealthStatus(
    agentId: string,
    checkId: string,
    result: HealthCheckResult
  ): Promise<void> {
    let status = this.healthStatuses.get(agentId);
    
    if (!status) {
      status = {
        agentId,
        healthy: true,
        lastCheck: Date.now(),
        checks: {},
        metrics: {
          uptime: 100,
          responseTime: 0,
          successRate: 100,
          errorRate: 0,
          taskCompletionRate: 100,
          averageTaskDuration: 0
        },
        issues: []
      };
    }

    // Update check result
    status.checks[checkId] = result;
    status.lastCheck = Date.now();

    // Update overall health
    status.healthy = Object.values(status.checks).every(check => check.healthy);

    // Add issue if unhealthy
    if (!result.healthy) {
      const issue: HealthIssue = {
        id: uuidv4(),
        severity: 'warning',
        message: result.message || 'Health check failed',
        timestamp: Date.now(),
        resolved: false
      };
      status.issues.push(issue);
    }

    this.healthStatuses.set(agentId, status);
  }

  /**
   * Get health status for an agent
   */
  async getHealthStatus(agentId: string): Promise<HealthStatus | null> {
    return this.healthStatuses.get(agentId) || null;
  }

  /**
   * Monitor agent and return current status
   */
  async monitorAgent(agentId: string): Promise<HealthStatus> {
    const agent = await this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Perform all registered health checks
    const checks = this.healthChecks.get(agentId);
    if (checks) {
      for (const [checkId, check] of checks.entries()) {
        if (check.enabled) {
          await this.performHealthCheck(agentId, checkId);
        }
      }
    }

    // Calculate metrics
    const metrics = await this.calculateMetrics(agentId);
    
    const status = this.healthStatuses.get(agentId);
    if (status) {
      status.metrics = metrics;
      this.healthStatuses.set(agentId, status);
      return status;
    }

    // Create default status if none exists
    const newStatus: HealthStatus = {
      agentId,
      healthy: true,
      lastCheck: Date.now(),
      checks: {},
      metrics,
      issues: []
    };

    this.healthStatuses.set(agentId, newStatus);
    return newStatus;
  }

  /**
   * Calculate health metrics for an agent
   */
  private async calculateMetrics(agentId: string): Promise<HealthMetrics> {
    const startTime = this.startTimes.get(agentId) || Date.now();
    const uptime = ((Date.now() - startTime) / (Date.now() - startTime + 1000)) * 100;

    // These would be calculated from actual task history in a real implementation
    return {
      uptime: uptime,
      responseTime: 0, // Would track actual response times
      successRate: 100, // Would track from task completions
      errorRate: 0, // Would track from task failures
      taskCompletionRate: 100, // Would track actual completion rate
      averageTaskDuration: 0 // Would track from task processing times
    };
  }

  /**
   * Generate a comprehensive health report
   */
  async generateHealthReport(agentId: string): Promise<HealthReport> {
    const status = await this.monitorAgent(agentId);
    
    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!status.healthy) {
      overall = 'unhealthy';
    } else if (
      status.metrics.successRate < this.healthThresholds.minSuccessRate ||
      status.metrics.errorRate > this.healthThresholds.maxErrorRate ||
      status.metrics.responseTime > this.healthThresholds.maxResponseTime
    ) {
      overall = 'degraded';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (status.metrics.successRate < this.healthThresholds.minSuccessRate) {
      recommendations.push(`Success rate (${status.metrics.successRate}%) is below threshold (${this.healthThresholds.minSuccessRate}%)`);
    }
    
    if (status.metrics.errorRate > this.healthThresholds.maxErrorRate) {
      recommendations.push(`Error rate (${status.metrics.errorRate}%) exceeds threshold (${this.healthThresholds.maxErrorRate}%)`);
    }
    
    if (status.metrics.responseTime > this.healthThresholds.maxResponseTime) {
      recommendations.push(`Response time (${status.metrics.responseTime}ms) exceeds threshold (${this.healthThresholds.maxResponseTime}ms)`);
    }

    if (status.issues.filter(i => !i.resolved).length > 0) {
      recommendations.push(`${status.issues.filter(i => !i.resolved).length} unresolved health issues`);
    }

    return {
      agentId,
      timestamp: Date.now(),
      overall,
      status,
      recommendations
    };
  }

  /**
   * Start monitoring an agent
   */
  async startMonitoring(agentId: string): Promise<void> {
    this.startTimes.set(agentId, Date.now());
    
    // Register default health checks
    await this.registerDefaultHealthChecks(agentId);
    
    this.logger.info(`Started monitoring agent ${agentId}`);
  }

  /**
   * Stop monitoring an agent
   */
  async stopMonitoring(agentId: string): Promise<void> {
    // Stop all health checks for this agent
    const checks = this.healthChecks.get(agentId);
    if (checks) {
      for (const checkId of checks.keys()) {
        await this.stopHealthCheck(agentId, checkId);
      }
      this.healthChecks.delete(agentId);
    }

    this.healthStatuses.delete(agentId);
    this.startTimes.delete(agentId);
    
    this.logger.info(`Stopped monitoring agent ${agentId}`);
  }

  /**
   * Register default health checks
   */
  private async registerDefaultHealthChecks(agentId: string): Promise<void> {
    // Basic connectivity check
    await this.registerHealthCheck(agentId, {
      name: 'Connectivity',
      description: 'Check if agent is reachable',
      checkFunction: async (agent: Agent) => {
        return {
          healthy: agent.status.state === 'available' || agent.status.state === 'busy',
          message: `Agent status: ${agent.status.state}`
        };
      },
      interval: 30000, // 30 seconds
      timeout: 5000,
      enabled: true
    });

    // Heartbeat check
    await this.registerHealthCheck(agentId, {
      name: 'Heartbeat',
      description: 'Check last heartbeat time',
      checkFunction: async (agent: Agent) => {
        const lastHeartbeat = agent.status.healthStatus?.lastHeartbeat || 0;
        const timeSinceHeartbeat = Date.now() - lastHeartbeat;
        const healthy = timeSinceHeartbeat < 60000; // 1 minute

        return {
          healthy,
          message: `Last heartbeat: ${timeSinceHeartbeat}ms ago`,
          metrics: { timeSinceHeartbeat }
        };
      },
      interval: 15000, // 15 seconds
      timeout: 5000,
      enabled: true
    });
  }

  /**
   * Get all monitored agents
   */
  getMonitoredAgents(): string[] {
    return Array.from(this.healthStatuses.keys());
  }

  /**
   * Get unhealthy agents
   */
  getUnhealthyAgents(): string[] {
    return Array.from(this.healthStatuses.entries())
      .filter(([_, status]) => !status.healthy)
      .map(([agentId]) => agentId);
  }

  /**
   * Resolve a health issue
   */
  async resolveIssue(agentId: string, issueId: string): Promise<void> {
    const status = this.healthStatuses.get(agentId);
    if (!status) return;

    const issue = status.issues.find(i => i.id === issueId);
    if (issue) {
      issue.resolved = true;
      this.healthStatuses.set(agentId, status);
      this.logger.info(`Resolved health issue for agent ${agentId}`, { issueId });
    }
  }
}
