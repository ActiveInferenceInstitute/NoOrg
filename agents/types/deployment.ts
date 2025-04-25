/**
 * Deployment configuration interface
 */
export interface DeploymentConfig {
  environment: string;
  version: string;
  target: 'development' | 'staging' | 'production';
  options?: {
    parallel?: boolean;
    timeout?: number;
    retries?: number;
  };
}

/**
 * Build configuration interface
 */
export interface BuildConfig {
  version: string;
  target: 'development' | 'staging' | 'production';
  dependencies?: string[];
  options?: {
    optimize?: boolean;
    minify?: boolean;
    sourceMaps?: boolean;
  };
}

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  name: string;
  type: 'development' | 'staging' | 'production';
  resources: {
    compute?: {
      cpu: string;
      memory: string;
      instances: number;
    };
    storage?: {
      type: string;
      size: string;
    };
    network?: {
      type: string;
      bandwidth: string;
    };
  };
  security?: {
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
  };
}

/**
 * Release configuration interface
 */
export interface ReleaseConfig {
  version: string;
  target: 'development' | 'staging' | 'production';
  changes: {
    type: 'feature' | 'bugfix' | 'hotfix';
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  rollback?: {
    enabled: boolean;
    version: string;
  };
}

/**
 * Rollback configuration interface
 */
export interface RollbackConfig {
  deploymentId: string;
  version: string;
  target: 'development' | 'staging' | 'production';
  reason: string;
  options?: {
    force?: boolean;
    cleanup?: boolean;
  };
}

/**
 * Deployment stage interface
 */
export interface DeploymentStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'deploy' | 'validate';
  execute: (context: any) => Promise<DeploymentStageResult>;
  validate?: (context: any) => Promise<boolean>;
  rollback?: (context: any) => Promise<boolean>;
}

/**
 * Deployment stage result interface
 */
export interface DeploymentStageResult {
  stageId: string;
  success: boolean;
  startTime: string;
  endTime: string;
  artifacts?: any[];
  error?: Error;
  metrics?: {
    duration: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
}

/**
 * Deployment status type
 */
export type DeploymentStatus = {
  id: string;
  version: string;
  target: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startTime: string;
  endTime?: string;
  stages: DeploymentStageResult[];
  error?: Error;
};

/**
 * Deployment result interface
 */
export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  startTime: string;
  endTime: string;
  stages: DeploymentStageResult[];
  artifacts: any[];
  error?: Error;
  metrics?: {
    duration: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
} 