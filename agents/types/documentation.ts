/**
 * Documentation system configuration
 */
export interface DocumentationConfig {
  outputPath: string;
  templatePath: string;
  indexPath: string;
  logLevel: string;
  generators: {
    [key: string]: {
      type: string;
      options?: any;
    };
  };
  templates: {
    [key: string]: {
      type: string;
      options?: any;
    };
  };
}

/**
 * Document generator interface
 */
export interface DocumentGenerator {
  id: string;
  config?: any;
  generate: (template: DocumentTemplate, context: any) => Promise<GenerationResult>;
}

/**
 * Document template interface
 */
export interface DocumentTemplate {
  id: string;
  content: string;
  config?: any;
  variables?: {
    [key: string]: any;
  };
  partials?: {
    [key: string]: string;
  };
}

/**
 * Generation result interface
 */
export interface GenerationResult {
  success: boolean;
  documentId: string;
  content: string;
  metadata: {
    generator: string;
    template: string;
    timestamp: string;
    version: string;
  };
  error?: Error;
  warnings?: string[];
} 