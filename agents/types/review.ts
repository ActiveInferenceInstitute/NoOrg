/**
 * Review system configuration
 */
export interface ReviewConfig {
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
  automationConfig: {
    enabled: boolean;
    rules: {
      [key: string]: ReviewRule;
    };
  };
}

/**
 * Review rule interface
 */
export interface ReviewRule {
  id: string;
  type: string;
  condition: {
    criteria: any;
    threshold?: number;
  };
  action: {
    type: string;
    params?: any;
  };
}

/**
 * Review interface
 */
export interface Review {
  id: string;
  type: ReviewType;
  status: ReviewStatus;
  priority: ReviewPriority;
  title: string;
  description?: string;
  created: string;
  lastUpdated: string;
  author: string;
  reviewers: string[];
  context: {
    repository?: string;
    branch?: string;
    commit?: string;
    files?: string[];
    metadata?: any;
  };
  timeline: ReviewEvent[];
  comments: ReviewComment[];
  checks: ReviewCheck[];
  metrics?: ReviewMetrics;
}

/**
 * Review type enum
 */
export enum ReviewType {
  CodeReview = 'codeReview',
  DesignReview = 'designReview',
  SecurityReview = 'securityReview',
  PerformanceReview = 'performanceReview',
  DocumentationReview = 'documentationReview'
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  Draft = 'draft',
  Open = 'open',
  InReview = 'inReview',
  NeedsRevision = 'needsRevision',
  Approved = 'approved',
  Rejected = 'rejected',
  Closed = 'closed'
}

/**
 * Review priority enum
 */
export enum ReviewPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low'
}

/**
 * Review event interface
 */
export interface ReviewEvent {
  id: string;
  type: string;
  timestamp: string;
  actor: string;
  details: {
    action: string;
    oldValue?: any;
    newValue?: any;
    comment?: string;
  };
  metadata?: any;
}

/**
 * Review comment interface
 */
export interface ReviewComment {
  id: string;
  author: string;
  content: string;
  created: string;
  lastUpdated: string;
  location?: {
    file?: string;
    line?: number;
    column?: number;
  };
  type: 'general' | 'suggestion' | 'issue' | 'praise';
  status: 'open' | 'resolved' | 'wontFix';
  replies?: ReviewComment[];
  reactions?: {
    [key: string]: string[];
  };
}

/**
 * Review check interface
 */
export interface ReviewCheck {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  results?: {
    success: boolean;
    summary: string;
    details?: any;
    metrics?: any;
  };
  error?: Error;
}

/**
 * Review metrics interface
 */
export interface ReviewMetrics {
  duration: number;
  commentCount: number;
  iterationCount: number;
  checksPassed: number;
  checksFailed: number;
  responseTime: number;
  complexity: {
    codeChanges: number;
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
}

/**
 * Review result interface
 */
export interface ReviewResult {
  success: boolean;
  reviewId: string;
  status: ReviewStatus;
  metrics: ReviewMetrics;
  approvals: Array<{
    reviewer: string;
    timestamp: string;
    comment?: string;
  }>;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    location?: {
      file?: string;
      line?: number;
      column?: number;
    };
    suggestions?: Array<{
      description: string;
      fix?: string;
    }>;
  }>;
  error?: Error;
} 