import { SwarmAgent, SwarmTask, SwarmResult } from '../types/swarm';

interface MetricValue {
  taskId?: string;
  duration?: number;
  value?: number;
  metrics?: {
    duration: number;
    resourceUsage?: {
      cpu: number;
      memory: number;
    };
  };
  success?: boolean;
  agentId?: string;
  tasks?: number;
  total?: number;
  cpu?: number;
  memory?: number;
  storage?: number;
  errors?: string[];
}

/**
 * Validation utilities for test metrics and data
 */
export class ValidationUtils {
  /**
   * Validate metric value
   */
  static validateMetricValue(metricType: string, value: MetricValue): boolean {
    if (!value) return false;

    switch (metricType) {
      case 'taskDuration':
        return this.validateTaskDurationMetric(value);
      
      case 'taskSuccess':
        return this.validateTaskSuccessMetric(value);
      
      case 'taskDistribution':
        return this.validateTaskDistributionMetric(value);
      
      case 'resourceUtilization':
        return this.validateResourceUtilizationMetric(value);
      
      default:
        return true;
    }
  }

  /**
   * Validate task duration metric
   */
  private static validateTaskDurationMetric(value: MetricValue): boolean {
    // Check required fields
    if (!value.taskId || value.duration === undefined) {
      return false;
    }

    // Validate duration
    if (typeof value.duration !== 'number' || value.duration < 0) {
      return false;
    }

    // Validate resource usage if present
    if (value.metrics?.resourceUsage) {
      const { cpu, memory } = value.metrics.resourceUsage;
      if ((cpu !== undefined && (typeof cpu !== 'number' || cpu < 0 || cpu > 100)) ||
          (memory !== undefined && (typeof memory !== 'number' || memory < 0))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate task success metric
   */
  private static validateTaskSuccessMetric(value: MetricValue): boolean {
    // Check required fields
    if (!value.taskId || value.success === undefined) {
      return false;
    }

    // Validate success value
    if (typeof value.success !== 'boolean') {
      return false;
    }

    // Validate numeric value
    if (value.value !== 0 && value.value !== 1) {
      return false;
    }

    return true;
  }

  /**
   * Validate task distribution metric
   */
  private static validateTaskDistributionMetric(value: MetricValue): boolean {
    // Check required fields
    if (!value.agentId || value.tasks === undefined) {
      return false;
    }

    // Validate task count
    if (typeof value.tasks !== 'number' || value.tasks < 0) {
      return false;
    }

    // Validate value field
    if (value.value === undefined || value.value !== value.tasks) {
      return false;
    }

    return true;
  }

  /**
   * Validate resource utilization metric
   */
  private static validateResourceUtilizationMetric(value: MetricValue): boolean {
    // Check required fields
    if (!value.agentId) {
      return false;
    }

    // Validate resource values
    const resources = [value.cpu, value.memory, value.storage];
    if (!resources.every(r => 
      typeof r === 'number' && r >= 0 && r <= 100
    )) {
      return false;
    }

    // Validate primary value (CPU)
    if (value.value === undefined || value.value !== value.cpu) {
      return false;
    }

    return true;
  }

  /**
   * Validate and sanitize task
   */
  static validateTask(task: Partial<SwarmTask>): SwarmTask {
    if (!task) {
      throw new Error('Task object is required');
    }

    return {
      id: task.id || `task-${Date.now()}`,
      type: task.type || 'unknown',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      requiredCapabilities: task.requiredCapabilities || [],
      resourceRequirements: task.resourceRequirements || {
        cpu: 1,
        memory: 512,
        storage: 64
      },
      divisible: task.divisible ?? false,
      size: task.size || 1,
      context: task.context || {}
    };
  }

  /**
   * Validate and sanitize agent
   */
  static validateAgent(agent: Partial<SwarmAgent>): SwarmAgent {
    if (!agent) {
      throw new Error('Agent object is required');
    }

    return {
      id: agent.id || `agent-${Date.now()}`,
      type: agent.type || 'unknown',
      status: agent.status || 'idle',
      capabilities: agent.capabilities || [],
      resources: agent.resources || {
        total: {
          cpu: 4,
          memory: 8192,
          storage: 512
        },
        available: {
          cpu: 4,
          memory: 8192,
          storage: 512
        },
        reserved: {
          cpu: 0,
          memory: 0,
          storage: 0
        }
      },
      executeTask: agent.executeTask || (async (task: SwarmTask) => ({
        success: false,
        error: 'No task execution implementation',
        results: []
      }))
    };
  }

  /**
   * Validate task result
   */
  static validateTaskResult(result: Partial<SwarmResult>): SwarmResult {
    if (!result) {
      return {
        success: false,
        results: [],
        errors: [{
          agentId: 'system',
          error: new Error('No result provided')
        }]
      };
    }

    return {
      success: result.success || false,
      results: result.results || [],
      errors: result.errors || []
    };
  }

  /**
   * Validate chart data
   */
  static validateChartData(data: any, chartType: string): boolean {
    if (!data) return false;

    switch (chartType) {
      case 'scatter':
      case 'line':
        return Array.isArray(data.x) && 
               Array.isArray(data.y) && 
               data.x.length === data.y.length &&
               data.x.every((x: any) => x !== undefined) &&
               data.y.every((y: any) => typeof y === 'number');
      
      case 'bar':
        return Array.isArray(data.x) && 
               Array.isArray(data.y) && 
               data.x.length === data.y.length &&
               data.x.every((x: any) => x !== undefined) &&
               data.y.every((y: any) => typeof y === 'number' && y >= 0);
      
      case 'pie':
        return Array.isArray(data.values) && 
               Array.isArray(data.labels) &&
               data.values.length === data.labels.length &&
               data.values.every((v: any) => typeof v === 'number' && v >= 0) &&
               data.labels.every((l: any) => l !== undefined);
      
      case 'heatmap':
        return Array.isArray(data.z) && 
               Array.isArray(data.x) && 
               Array.isArray(data.y) &&
               data.z.every((row: any[]) => 
                 Array.isArray(row) && 
                 row.every(v => typeof v === 'number')
               );
      
      default:
        return false;
    }
  }

  /**
   * Get default chart data
   */
  static getDefaultChartData(chartType: string): any {
    switch (chartType) {
      case 'scatter':
      case 'line':
        return {
          x: [0],
          y: [0],
          text: ['No Data Available']
        };
      
      case 'bar':
        return {
          x: ['No Data'],
          y: [0],
          text: ['No Data Available']
        };
      
      case 'pie':
        return {
          values: [1],
          labels: ['No Data']
        };
      
      case 'heatmap':
        return {
          z: [[0]],
          x: ['No Data'],
          y: ['No Data'],
          colorscale: 'Viridis'
        };
      
      default:
        return null;
    }
  }

  /**
   * Validate test configuration
   */
  static validateTestConfig(config: any): boolean {
    // Check required sections
    const requiredSections = ['basic', 'scalability', 'faultTolerance', 'performance'];
    if (!requiredSections.every(section => config[section])) {
      return false;
    }

    // Validate basic configuration
    const basic = config.basic;
    if (!basic.agentCount || !basic.taskCount || basic.agentCount < 1 || basic.taskCount < 1) {
      return false;
    }

    // Validate scalability configuration
    const scalability = config.scalability;
    if (!scalability.agentCount || !scalability.taskCount || !scalability.swarmCount || 
        !Array.isArray(scalability.batchSizes) || scalability.batchSizes.length === 0) {
      return false;
    }

    // Validate fault tolerance configuration
    const faultTolerance = config.faultTolerance;
    if (!faultTolerance.agentCount || !faultTolerance.taskCount || 
        faultTolerance.failureRate === undefined || 
        faultTolerance.failureRate < 0 || faultTolerance.failureRate > 1) {
      return false;
    }

    // Validate performance configuration
    const performance = config.performance;
    if (!performance.agentCount || !performance.taskCount || !performance.concurrency || 
        performance.concurrency < 1) {
      return false;
    }

    return true;
  }

  /**
   * Validate test paths
   */
  static validateTestPaths(paths: any): boolean {
    const requiredPaths = ['logs', 'results', 'visualizations'];
    return requiredPaths.every(path => 
      typeof paths[path] === 'string' && paths[path].length > 0
    );
  }
} 