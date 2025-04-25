/**
 * Shared types for the Agent Coordination Toolkit
 */

export interface TimeRange {
  start: number;
  end: number;
  duration: number;
}

export enum TrendDirection {
  Increasing = 'increasing',
  Decreasing = 'decreasing',
  Stable = 'stable',
  Fluctuating = 'fluctuating'
}

export enum ImpactScope {
  Local = 'local',
  Component = 'component',
  System = 'system',
  Global = 'global'
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  metadata?: ValidationMetadata;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: number;
  context: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  context: any;
}

export interface ValidationMetadata {
  timestamp: number;
  validator: string;
  version: string;
  context: any;
}

/**
 * Repository event types
 */
export enum RepositoryEvent {
  COMMIT = 'commit',
  PUSH = 'push',
  MERGE = 'merge',
  BRANCH = 'branch',
  TAG = 'tag',
  CHECKOUT = 'checkout'
}

/**
 * Hook configuration interface
 */
export interface HookConfig {
  enabled: boolean;
  logLevel: string;
  hooks: {
    [key: string]: {
      type: string;
      events: RepositoryEvent[];
      options?: any;
    };
  };
}

/**
 * Hook execution context
 */
export interface HookContext {
  event: RepositoryEvent;
  payload: any;
  config: HookConfig;
  hook?: {
    id: string;
    config?: any;
  };
}

/**
 * Hook execution result
 */
export interface HookResult {
  success: boolean;
  error?: Error;
  data?: any;
  actions?: any[];
}

/**
 * Repository hook interface
 */
export interface Hook {
  id: string;
  config?: any;
  execute: (context: HookContext) => Promise<HookResult>;
  cleanup?: () => Promise<void>;
} 