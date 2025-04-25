import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { ResearchAgentInterface } from '../core/multiagent/workflow_types';
/**
 * ResearchAgent specializes in gathering and analyzing information
 * from various sources including search results and provided context
 */
export declare class ResearchAgent extends BaseAgent implements ResearchAgentInterface {
    private researchCache;
    /**
     * Create a new ResearchAgent
     * @param name Agent name
     * @param config Agent configuration
     */
    constructor(name: string, config: AgentConfig);
    /**
     * Conduct research on a topic
     * @param topic Research topic
     * @param scope Research scope
     * @returns Research results
     */
    researchTopic(topic: string, scope: {
        aspects: string[];
        depth: string;
    }): Promise<any>;
    /**
     * Extract key information from a document
     * @param document Document text
     * @param extractionQuery What to extract
     * @returns Extracted information
     */
    extractInformation(document: string, extractionQuery: string): Promise<{
        query: string;
        extraction: string;
        confidence: number;
        processingTime: number;
    }>;
    /**
     * Summarize a document
     * @param document Document to summarize
     * @param options Summarization options
     * @returns Summary
     */
    summarizeDocument(document: string, options?: {
        length?: 'short' | 'medium' | 'long';
        focus?: string;
        bulletPoints?: boolean;
    }): Promise<{
        summary: string;
        keyPoints?: string[];
        wordCount: number;
        processingTime: number;
    }>;
    /**
     * Fact check a statement
     * @param statement Statement to fact check
     * @param context Optional context for fact checking
     * @returns Fact check results
     */
    factCheck(statement: string, context?: string): Promise<{
        statement: string;
        isFactual: boolean;
        confidence: number;
        explanation: string;
        corrections?: string;
        processingTime: number;
    }>;
    /**
     * Clean up old entries from the cache
     */
    private cleanCache;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
