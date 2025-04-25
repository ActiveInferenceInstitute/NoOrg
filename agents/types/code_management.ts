/**
 * Code management system configuration
 */
export interface ManagementConfig {
  logLevel: string;
  analyzers: {
    [key: string]: {
      type: string;
      options?: any;
    };
  };
  formatters: {
    [key: string]: {
      type: string;
      options?: any;
    };
  };
  validators: {
    [key: string]: {
      type: string;
      options?: any;
    };
  };
}

/**
 * Code analyzer interface
 */
export interface CodeAnalyzer {
  id: string;
  type: string;
  config?: any;
  analyze(files: string[], context: any): Promise<AnalysisResult>;
}

/**
 * Code formatter interface
 */
export interface CodeFormatter {
  id: string;
  type: string;
  config?: any;
  format(code: string, context: any): Promise<FormatResult>;
}

/**
 * Code validator interface
 */
export interface CodeValidator {
  id: string;
  type: string;
  config?: any;
  validate(code: string, context: any): Promise<ValidationResult>;
}

/**
 * Analysis result interface
 */
export interface AnalysisResult {
  success: boolean;
  issues?: Array<{
    type: string;
    severity: 'info' | 'warning' | 'error';
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
  suggestions?: Array<{
    type: string;
    description: string;
    impact: string;
    effort: string;
    fix?: string;
  }>;
  error?: Error;
}

/**
 * Format result interface
 */
export interface FormatResult {
  success: boolean;
  formatted?: string;
  changes?: Array<{
    type: string;
    location: {
      start: {
        line: number;
        column: number;
      };
      end: {
        line: number;
        column: number;
      };
    };
    original: string;
    replacement: string;
  }>;
  error?: Error;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  success: boolean;
  issues?: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    location?: {
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
  error?: Error;
} 