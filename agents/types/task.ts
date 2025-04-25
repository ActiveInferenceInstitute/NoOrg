/**
 * Task management system configuration
 */
export interface TaskConfig {
  logLevel: string;
  storageConfig: {
    type: string;
    path: string;
  };
  metricsConfig: {
    enabled: boolean;
    interval: number;
  };
  notificationConfig: {
    enabled: boolean;
    channels: string[];
  };
  indexConfig: {
    enabled: boolean;
    path: string;
  };
}

/**
 * Task definition interface
 */
export interface TaskDefinition {
  id: string;
  type: string;
  name: string;
  description?: string;
  version: string;
  config?: any;
  schema?: {
    input?: any;
    output?: any;
  };
  timeout?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffFactor: number;
  };
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  definitionId: string;
  type: string;
  status: TaskStatus;
  priority: TaskPriority;
  created: string;
  lastUpdated: string;
  startTime?: string;
  endTime?: string;
  context: any;
  config?: any;
  dependencies?: TaskDependency[];
  workflowId?: string;
  error?: Error;
  metrics?: {
    duration?: number;
    retryCount?: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

/**
 * Task assignment interface
 */
export interface TaskAssignment {
  id: string;
  taskId: string;
  assignee: string;
  status: TaskStatus;
  created: string;
  lastUpdated: string;
  startTime?: string;
  endTime?: string;
  options?: any;
  metrics?: {
    duration?: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

/**
 * Task dependency interface
 */
export interface TaskDependency {
  taskId: string;
  type: 'hard' | 'soft';
  condition?: {
    status?: TaskStatus[];
    outputs?: any;
  };
}

/**
 * Task status enum
 */
export enum TaskStatus {
  Created = 'created',
  Ready = 'ready',
  Assigned = 'assigned',
  InProgress = 'inProgress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Blocked = 'blocked'
}

/**
 * Task priority enum
 */
export enum TaskPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low'
}

/**
 * Task result interface
 */
export interface TaskResult {
  success: boolean;
  taskId: string;
  startTime: string;
  endTime: string;
  outputs?: any;
  error?: Error;
  metrics?: {
    duration: number;
    retryCount: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

/**
 * Assignment result interface
 */
export interface AssignmentResult {
  success: boolean;
  taskId: string;
  assignmentId: string;
  error?: Error;
} 