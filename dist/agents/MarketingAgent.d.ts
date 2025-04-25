import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * MarketingAgent specializes in creating marketing strategies, campaign planning,
 * brand messaging, and audience targeting.
 */
export declare class MarketingAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private campaignCache;
    /**
     * Create a new MarketingAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
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
     * Create a marketing campaign strategy
     * @param campaignBrief Brief for the marketing campaign
     * @param options Campaign strategy options
     */
    createCampaignStrategy(campaignBrief: string, options?: {
        audience?: string;
        budget?: string;
        timeline?: string;
        channels?: string[];
        goals?: string[];
        industry?: string;
        competitorAnalysis?: boolean;
        checkCache?: boolean;
    }): Promise<{
        strategy: string;
        targetAudience: string;
        channels: string[];
        timeline: string;
        budgetAllocation?: Record<string, string>;
        kpis: string[];
        recommendations: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Analyze audience demographics and preferences
     * @param audienceDescription Description of the target audience
     * @param options Analysis options
     */
    analyzeAudience(audienceDescription: string, options?: {
        industry?: string;
        depth?: 'basic' | 'detailed' | 'comprehensive';
        includePersonas?: boolean;
        region?: string;
    }): Promise<{
        segments: {
            name: string;
            description: string;
            preferences: string[];
            channels: string[];
        }[];
        personas?: {
            name: string;
            age: number;
            occupation: string;
            interests: string[];
            pain_points: string[];
            goals: string[];
        }[];
        recommendations: string[];
        insights: string[];
        processingTime: number;
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
