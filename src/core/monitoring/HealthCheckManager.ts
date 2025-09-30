/**
 * Health Check Manager
 *
 * Comprehensive health monitoring system for the NoOrg multi-agent framework.
 * Provides automated health checks, alerting, and system status monitoring.
 */

import { MonitoringSystem } from './MonitoringSystem';
import { EventSystem } from '../events/EventSystem';

export interface HealthCheck {
  id: string;
  name: string;
  description?: string;
  check: () => Promise<HealthStatus>;
  interval?: number; // Check interval in milliseconds
  timeout?: number; // Timeout in milliseconds
  enabled?: boolean;
  tags?: string[];
  dependencies?: string[]; // IDs of health checks this depends on
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
  duration?: number; // Time taken for the check
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

export class HealthCheckManager {
  private static instance: HealthCheckManager;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private checkResults: Map<string, HealthCheckResult[]> = new Map();
  private checkTimers: Map<string, NodeJS.Timeout> = new Map();
  private monitoring: MonitoringSystem;
  private events: EventSystem;
  private isRunning: boolean = false;
  private startTime: number = Date.now();

  private constructor() {
    this.monitoring = MonitoringSystem.getInstance();
    this.events = EventSystem.getInstance();
  }

  static getInstance(): HealthCheckManager {
    if (!HealthCheckManager.instance) {
      HealthCheckManager.instance = new HealthCheckManager();
    }
    return HealthCheckManager.instance;
  }

  /**
   * Register a health check
   */
  registerHealthCheck(check: HealthCheck): void {
    if (this.healthChecks.has(check.id)) {
      throw new Error(`Health check with ID '${check.id}' already exists`);
    }

    this.healthChecks.set(check.id, {
      interval: 30000, // Default 30 seconds
      timeout: 5000,  // Default 5 seconds
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
  unregisterHealthCheck(checkId: string): void {
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
  async executeHealthCheck(checkId: string): Promise<HealthStatus> {
    const check = this.healthChecks.get(checkId);
    if (!check || !check.enabled) {
      throw new Error(`Health check '${checkId}' not found or disabled`);
    }

    const startTime = Date.now();

    try {
      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), check.timeout || 5000);
      });

      const checkPromise = check.check();

      const result = await Promise.race([checkPromise, timeoutPromise]);

      const duration = Date.now() - startTime;
      const status: HealthStatus = {
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

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorStatus: HealthStatus = {
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
  async getSystemHealth(): Promise<SystemHealth> {
    const components: Record<string, HealthStatus> = {};
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

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
          } else if (status.status === 'degraded' && overall === 'healthy') {
            overall = 'degraded';
          }
        } catch (error) {
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

    const systemHealth: SystemHealth = {
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
  start(): void {
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
  stop(): void {
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
  getCheckResults(checkId: string, limit: number = 100): HealthCheckResult[] {
    return this.checkResults.get(checkId)?.slice(-limit) || [];
  }

  /**
   * Get all registered health checks
   */
  getRegisteredChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Enable/disable a health check
   */
  setCheckEnabled(checkId: string, enabled: boolean): void {
    const check = this.healthChecks.get(checkId);
    if (!check) {
      throw new Error(`Health check '${checkId}' not found`);
    }

    check.enabled = enabled;
    this.healthChecks.set(checkId, check);

    if (enabled) {
      this.startHealthCheck(checkId);
    } else {
      this.stopHealthCheck(checkId);
    }
  }

  /**
   * Update health check configuration
   */
  updateHealthCheck(checkId: string, updates: Partial<HealthCheck>): void {
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

  private startHealthCheck(checkId: string): void {
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
      } catch (error) {
        console.error(`Health check '${checkId}' failed:`, error);
      }
    }, check.interval || 30000);

    this.checkTimers.set(checkId, timer);
  }

  private stopHealthCheck(checkId: string): void {
    const timer = this.checkTimers.get(checkId);
    if (timer) {
      clearInterval(timer);
      this.checkTimers.delete(checkId);
    }
  }

  private storeCheckResult(checkId: string, result: HealthCheckResult): void {
    if (!this.checkResults.has(checkId)) {
      this.checkResults.set(checkId, []);
    }

    const results = this.checkResults.get(checkId)!;
    results.push(result);

    // Keep only last 1000 results per check
    if (results.length > 1000) {
      results.splice(0, results.length - 1000);
    }
  }
}

// Export singleton instance
export const healthCheckManager = HealthCheckManager.getInstance();
