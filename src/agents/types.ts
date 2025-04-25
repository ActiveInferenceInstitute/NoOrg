/**
 * Agent type definition for multiagent coordination system
 */
export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  capabilities: string[];
  status: 'initializing' | 'available' | 'busy' | 'offline' | 'error';
  metadata?: Record<string, any>;
  preferredModel?: string;
  lastActive: number;
  createdAt: number;
}

/**
 * Agent capability types
 */
export type Capability = 
  // General capabilities
  | 'text-generation'
  | 'code-generation'
  | 'reasoning'
  | 'planning'
  | 'research'
  | 'data-analysis'
  | 'math'
  | 'web-search'
  | 'creativity'
  | 'problem-solving'
  | 'summarization'
  | 'extraction'
  | 'classification'
  | 'translation'
  
  // Creative writing capabilities
  | 'storytelling'
  | 'content-refinement'
  | 'style-adaptation'
  
  // Research capabilities
  | 'information-extraction'
  | 'fact-checking'
  
  // Marketing capabilities
  | 'market-analysis'
  | 'campaign-planning'
  | 'brand-messaging'
  | 'audience-targeting'
  | 'content-strategy'
  | 'trend-analysis'
  
  // Development capabilities
  | 'code-review'
  | 'architecture-design'
  | 'debugging'
  | 'testing'
  | 'technical-documentation'
  
  // HR capabilities
  | 'job-description-creation'
  | 'interview-question-generation'
  | 'employee-onboarding'
  | 'policy-development'
  | 'performance-evaluation'
  | 'compensation-analysis'
  | 'professional-communication'
  
  // Finance capabilities
  | 'financial-analysis'
  | 'reporting'
  | 'budgeting'
  | 'forecasting'
  | 'investment-analysis'
  | 'risk-assessment'
  
  // Legal capabilities
  | 'document-generation'
  | 'contract-review'
  | 'legal-research'
  | 'compliance-analysis'
  | 'legal-writing'
  | 'term-extraction'
  
  // Customer support capabilities
  | 'issue-resolution'
  | 'product-information'
  | 'troubleshooting'
  | 'customer-service'
  | 'email-response'
  | 'query-classification'
  | 'sentiment-analysis'
  
  // General purpose extension
  | string; // Allow custom capabilities 

/**
 * Agent types
 */
export type AgentType =
  | 'creative-writer'
  | 'research'
  | 'marketing'
  | 'development'
  | 'hr'
  | 'finance'
  | 'legal'
  | 'customer-support'
  | 'data-analysis'
  | 'project-management'
  | 'strategic-planning'
  | 'operations'
  | 'sales'
  | 'quality-assurance'
  | 'education'
  | 'security'
  | 'compliance'
  | 'risk-management'
  | 'innovation'
  | string; // Allow custom agent types 