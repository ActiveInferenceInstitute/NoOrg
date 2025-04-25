/**
 * Workflow configuration interface
 */
export interface WorkflowConfig {
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
  retryConfig: {
    maxAttempts: number;
    backoffFactor: number;
  };
}

/**
 * Workflow interface
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  config?: any;
  triggers?: string[];
  steps: WorkflowStep[];
  errorHandler?: WorkflowStep;
  timeout?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffFactor: number;
  };
}

/**
 * Workflow step interface
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: string;
  config?: any;
  dependencies?: string[];
  timeout?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffFactor: number;
  };
  execute: (context: WorkflowContext) => Promise<StepResult>;
  rollback?: (context: WorkflowContext) => Promise<void>;
}

/**
 * Workflow trigger interface
 */
export interface WorkflowTrigger {
  id: string;
  type: string;
  config?: any;
  workflows: string[];
  process: (event: any) => Promise<TriggerResult>;
}

/**
 * Workflow context interface
 */
export interface WorkflowContext {
  id: string;
  workflowId: string;
  state: 'running' | 'paused' | 'completed' | 'failed';
  startTime: string;
  context: any;
  stepResults: Map<number, StepResult>;
  currentStep: number;
  error?: Error;
}

/**
 * Workflow result interface
 */
export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  contextId: string;
  startTime: string;
  endTime: string;
  stepResults: StepResult[];
  error?: Error;
  metrics?: {
    duration: number;
    stepCount: number;
    successfulSteps: number;
    failedSteps: number;
  };
}

/**
 * Step result interface
 */
export interface StepResult {
  success: boolean;
  stepId: string;
  startTime?: string;
  endTime?: string;
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
 * Trigger result interface
 */
export interface TriggerResult {
  success: boolean;
  triggerId: string;
  shouldExecute: boolean;
  context: any;
  error?: Error;
  metadata?: {
    source: string;
    timestamp: string;
    priority: number;
  };
} 