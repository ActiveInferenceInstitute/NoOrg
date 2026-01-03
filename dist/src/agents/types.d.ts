/**
 * Agent type definition for multiagent coordination system
 */
export interface Agent {
    id: string;
    name: string;
    type: string;
    description?: string;
    capabilities: string[];
    status: string;
    metadata?: Record<string, any>;
    preferredModel?: string;
    lastActive: number;
    createdAt: number;
}
/**
 * Agent capability types
 */
export type Capability = 'text-generation' | 'code-generation' | 'reasoning' | 'planning' | 'research' | 'data-analysis' | 'math' | 'web-search' | 'creativity' | 'problem-solving' | 'summarization' | 'extraction' | 'classification' | 'translation' | 'storytelling' | 'content-refinement' | 'style-adaptation' | 'information-extraction' | 'fact-checking' | 'market-analysis' | 'campaign-planning' | 'brand-messaging' | 'audience-targeting' | 'content-strategy' | 'trend-analysis' | 'code-review' | 'architecture-design' | 'debugging' | 'testing' | 'technical-documentation' | 'job-description-creation' | 'interview-question-generation' | 'employee-onboarding' | 'policy-development' | 'performance-evaluation' | 'compensation-analysis' | 'professional-communication' | 'financial-analysis' | 'reporting' | 'budgeting' | 'forecasting' | 'investment-analysis' | 'risk-assessment' | 'document-generation' | 'contract-review' | 'legal-research' | 'compliance-analysis' | 'legal-writing' | 'term-extraction' | 'issue-resolution' | 'product-information' | 'troubleshooting' | 'customer-service' | 'email-response' | 'query-classification' | 'sentiment-analysis' | string;
/**
 * Agent types
 */
export type AgentType = 'creative-writer' | 'research' | 'marketing' | 'development' | 'hr' | 'finance' | 'legal' | 'customer-support' | 'data-analysis' | 'project-management' | 'strategic-planning' | 'operations' | 'sales' | 'quality-assurance' | 'education' | 'security' | 'compliance' | 'risk-management' | 'innovation' | string;
//# sourceMappingURL=types.d.ts.map