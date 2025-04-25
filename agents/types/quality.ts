/**
 * Quality system configuration
 */
export interface QualityConfig {
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
  thresholds: {
    [key: string]: number;
  };
}

/**
 * Quality checker interface
 */
export interface QualityChecker {
  id: string;
  name: string;
  description?: string;
  type: string;
  config?: any;
  check(context: any, config?: any): Promise<CheckResult>;
}

/**
 * Quality metric interface
 */
export interface QualityMetric {
  id: string;
  name: string;
  description?: string;
  type: string;
  config?: any;
  collect(context: any, config?: any): Promise<MetricResult>;
}

/**
 * Check result interface
 */
export interface CheckResult {
  checkerId: string;
  success: boolean;
  timestamp: string;
  duration: number;
  summary: string;
  issues?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    location?: {
      file?: string;
      line?: number;
      column?: number;
    };
    rule?: string;
    fix?: {
      description: string;
      solution: string;
    };
  }>;
  metrics?: {
    [key: string]: number;
  };
  recommendations?: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    effort: string;
  }>;
  error?: Error;
}

/**
 * Metric result interface
 */
export interface MetricResult {
  metricId: string;
  timestamp: string;
  duration: number;
  summary: string;
  values: {
    [key: string]: number;
  };
  trends?: {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
    };
  };
  thresholds?: {
    [key: string]: {
      value: number;
      status: 'ok' | 'warning' | 'critical';
    };
  };
  recommendations?: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    effort: string;
  }>;
  error?: Error;
}

/**
 * Quality report interface
 */
export interface QualityReport {
  success: boolean;
  startTime: string;
  endTime: string;
  summary: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  checkResults: CheckResult[];
  metricResults: MetricResult[];
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    checker: string;
    location?: {
      file?: string;
      line?: number;
      column?: number;
    };
  }>;
  recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    effort: string;
  }>;
  metrics?: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    totalIssues: number;
    issuesBySeverity: {
      info: number;
      warning: number;
      error: number;
    };
  };
  error?: Error;
} 