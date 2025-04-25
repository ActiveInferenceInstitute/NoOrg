import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * DevelopmentAgent specializes in software development tasks such as
 * code generation, code review, architecture design, and debugging.
 */
export declare class DevelopmentAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private codeCache;
    /**
     * Create a new DevelopmentAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
        specialty?: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile' | 'data-engineering';
    });
    /**
     * Get programming languages by specialty
     */
    private getLanguagesBySpecialty;
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
     * Generate code based on requirements
     * @param requirements Code requirements specification
     * @param options Code generation options
     */
    generateCode(requirements: string, options?: {
        language?: string;
        framework?: string;
        codeStyle?: 'functional' | 'object-oriented' | 'procedural';
        includeComments?: boolean;
        includeTests?: boolean;
        checkCache?: boolean;
    }): Promise<{
        code: string;
        language: string;
        documentation?: string;
        testCode?: string;
        explanation?: string;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Extract code blocks from a response string
     */
    private extractCodeBlocks;
    /**
     * Review code and provide feedback
     * @param code Code to review
     * @param options Review options
     */
    reviewCode(code: string, options?: {
        language?: string;
        focusAreas?: ('security' | 'performance' | 'style' | 'maintainability' | 'testing')[];
        severity?: 'strict' | 'balanced' | 'lenient';
    }): Promise<{
        issues: Array<{
            type: string;
            severity: 'critical' | 'major' | 'minor' | 'suggestion';
            description: string;
            line?: number;
            recommendation: string;
        }>;
        summary: string;
        score: number;
        strengths: string[];
        recommendations: string[];
        processingTime: number;
    }>;
    /**
     * Design software architecture based on requirements
     * @param requirements System requirements
     * @param options Architecture design options
     */
    designArchitecture(requirements: string, options?: {
        type?: 'monolith' | 'microservices' | 'serverless' | 'hybrid';
        technologiesPreference?: string[];
        includeDataModel?: boolean;
        includeDeployment?: boolean;
        complexity?: 'simple' | 'moderate' | 'complex';
    }): Promise<{
        architecture: {
            overview: string;
            components: Array<{
                name: string;
                description: string;
                responsibilities: string[];
                technologies: string[];
                interfaces?: string[];
            }>;
            interactions: Array<{
                source: string;
                target: string;
                description: string;
                protocol?: string;
            }>;
        };
        dataModel?: {
            entities: Array<{
                name: string;
                properties: Array<{
                    name: string;
                    type: string;
                    description: string;
                }>;
                relationships: Array<{
                    entity: string;
                    type: string;
                    description: string;
                }>;
            }>;
        };
        deploymentModel?: {
            environments: string[];
            components: Array<{
                name: string;
                environment: string;
                resources: {
                    cpu: string;
                    memory: string;
                    storage: string;
                };
                scaling?: {
                    min: number;
                    max: number;
                    metrics: string;
                };
            }>;
        };
        diagrams?: {
            componentDiagram: string;
            dataDiagram?: string;
            deploymentDiagram?: string;
        };
        technologies: string[];
        processingTime: number;
    }>;
    /**
     * Detect programming language from code snippet
     */
    private detectLanguage;
    /**
     * Clean up expired cache entries
     */
    private cleanCache;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
