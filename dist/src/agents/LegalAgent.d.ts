import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * LegalAgent specializes in legal document generation, contract review,
 * legal research, and compliance analysis.
 */
export declare class LegalAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private legalCache;
    /**
     * Create a new LegalAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
        specialty?: 'contracts' | 'compliance' | 'ip' | 'corporate' | 'litigation';
        jurisdiction?: string;
    });
    /**
     * Initialize the agent
     */
    initialize(): Promise<boolean>;
    /**
     * Get the agent's information
     */
    getAgentInfo(): Agent;
    /**
     * Update the agent's status
     * @param status New status
     */
    updateStatus(status: Agent['status']): boolean;
    /**
     * Generate a legal document
     * @param documentType Type of legal document
     * @param documentParameters Document parameters
     * @param options Document generation options
     */
    generateLegalDocument(documentType: 'contract' | 'agreement' | 'policy' | 'terms' | 'letter' | 'memo' | 'waiver', documentParameters: {
        parties?: {
            name: string;
            type: string;
            address?: string;
        }[];
        purpose?: string;
        jurisdiction?: string;
        effectiveDate?: string;
        termLength?: string;
        specialTerms?: string[];
        keyProvisions?: string[];
    }, options?: {
        complexity?: 'simple' | 'standard' | 'comprehensive';
        format?: 'plain' | 'markdown' | 'html';
        includeDefinitions?: boolean;
        includeSectionHeadings?: boolean;
        checkCache?: boolean;
    }): Promise<{
        title: string;
        content: string;
        sections: Array<{
            heading: string;
            content: string;
        }>;
        definitions?: Record<string, string>;
        plainLanguageSummary?: string;
        recommendations?: string[];
        warnings?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Review a contract or legal document
     * @param document Document to review
     * @param options Review options
     */
    reviewLegalDocument(document: string, options?: {
        focusAreas?: ('risks' | 'obligations' | 'rights' | 'termination' | 'indemnification' | 'confidentiality' | 'ip')[];
        perspective?: 'neutral' | 'party1' | 'party2';
        thoroughness?: 'basic' | 'detailed' | 'comprehensive';
        documentType?: string;
        jurisdiction?: string;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        parties: string[];
        keyTerms: Array<{
            term: string;
            category: string;
            summary: string;
            implications: string;
            risk?: 'low' | 'medium' | 'high';
        }>;
        issues: Array<{
            description: string;
            severity: 'minor' | 'moderate' | 'major';
            recommendation: string;
        }>;
        missingElements?: string[];
        recommendations: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Conduct legal research on a topic
     * @param researchQuery Legal research query
     * @param options Research options
     */
    conductLegalResearch(researchQuery: string, options?: {
        jurisdiction?: string;
        depth?: 'basic' | 'detailed' | 'comprehensive';
        includeCaseReferences?: boolean;
        includeStatutes?: boolean;
        includeRegulations?: boolean;
        specificArea?: string;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        keyFindings: string[];
        relevantLaw: Array<{
            type: 'statute' | 'regulation' | 'case' | 'legal principle';
            reference: string;
            summary: string;
            relevance: string;
        }>;
        analysis: string;
        recommendations?: string[];
        limitations: string[];
        furtherResearchSuggestions?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Clean up expired cache entries
     */
    private cleanCache;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
//# sourceMappingURL=LegalAgent.d.ts.map