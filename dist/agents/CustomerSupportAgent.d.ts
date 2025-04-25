import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * CustomerSupportAgent specializes in handling customer inquiries,
 * troubleshooting issues, and providing support responses.
 */
export declare class CustomerSupportAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private responseCache;
    /**
     * Create a new CustomerSupportAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
        productKnowledge?: Record<string, any>;
        supportLevel?: 'tier1' | 'tier2' | 'tier3';
        tone?: 'formal' | 'casual' | 'friendly' | 'professional';
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
     * Respond to a customer inquiry
     * @param inquiry Customer inquiry/question
     * @param options Response options
     */
    respondToInquiry(inquiry: string, options?: {
        customerContext?: {
            name?: string;
            accountAge?: string;
            previousInteractions?: Array<{
                issue: string;
                resolution: string;
                date: string;
            }>;
            accountStatus?: string;
            subscription?: string;
        };
        productContext?: Record<string, any>;
        priorityLevel?: 'low' | 'medium' | 'high' | 'urgent';
        includeNextSteps?: boolean;
        includeRelatedResources?: boolean;
        responseFormat?: 'email' | 'chat' | 'ticket' | 'social';
        checkCache?: boolean;
    }): Promise<{
        response: string;
        classification: {
            category: string;
            subCategory?: string;
            sentiment: 'positive' | 'neutral' | 'negative';
            complexity: 'simple' | 'moderate' | 'complex';
            urgency: 'low' | 'medium' | 'high' | 'urgent';
        };
        suggestedActions?: string[];
        relatedResources?: string[];
        internalNotes?: string;
        escalationNeeded?: boolean;
        escalationReason?: string;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Generate a troubleshooting guide for a specific issue
     * @param issue The issue to troubleshoot
     * @param options Troubleshooting options
     */
    createTroubleshootingGuide(issue: string, options?: {
        productContext?: Record<string, any>;
        userLevel?: 'beginner' | 'intermediate' | 'advanced';
        platform?: string;
        version?: string;
        includeImages?: boolean;
        includeVideos?: boolean;
        format?: 'step-by-step' | 'decision-tree' | 'faq';
        checkCache?: boolean;
    }): Promise<{
        title: string;
        overview: string;
        prerequisites?: string[];
        steps: Array<{
            step: number;
            title: string;
            description: string;
            expectedOutcome?: string;
            troubleshooting?: string[];
        }>;
        alternativeSolutions?: string[];
        preventionTips?: string[];
        relatedIssues?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Analyze customer sentiment from feedback
     * @param feedback Customer feedback text
     * @param options Analysis options
     */
    analyzeSentiment(feedback: string, options?: {
        includeTopics?: boolean;
        includeActionableInsights?: boolean;
        includeSuggestions?: boolean;
        checkCache?: boolean;
    }): Promise<{
        overallSentiment: 'very negative' | 'negative' | 'neutral' | 'positive' | 'very positive';
        sentimentScore: number;
        keyPhrases: string[];
        topics?: Array<{
            name: string;
            sentiment: 'negative' | 'neutral' | 'positive';
            mentions: number;
        }>;
        actionableInsights?: string[];
        suggestions?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Clean up expired cache entries
     */
    private cleanCache;
    /**
     * Update product knowledge
     * @param knowledge Product knowledge to update
     */
    updateProductKnowledge(knowledge: Record<string, any>): boolean;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
