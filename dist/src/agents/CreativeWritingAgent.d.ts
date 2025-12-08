import { AbstractAgent, AbstractAgentOptions } from './AbstractAgent';
interface CreativeWritingAgentOptions extends Omit<AbstractAgentOptions, 'type'> {
    cacheTTL?: number;
}
/**
 * CreativeWritingAgent specializes in generating creative content
 * like stories, blog posts, marketing copy, etc.
 * Extends the AbstractAgent base class.
 */
export declare class CreativeWritingAgent extends AbstractAgent {
    private contentCache;
    private cacheTTL;
    /**
     * Create a new CreativeWritingAgent
     * @param name Agent name
     * @param options Optional configuration including required services
     */
    constructor(name: string, options: CreativeWritingAgentOptions);
    /**
     * Hook called during agent initialization.
     * Clears the content cache.
     */
    protected onInitialize(): Promise<void>;
    /**
     * Hook called during agent shutdown.
     * Cleans the cache.
     */
    protected onShutdown(): Promise<void>;
    /**
     * Executes a task based on provided details.
     * This agent currently interprets tasks as requests to generate or refine content.
     * @param taskDetails - Object containing task details (e.g., { type: 'generate', prompt: '...' } or { type: 'refine', content: '...', feedback: '...' })
     * @param context - Optional context (not currently used by this agent).
     * @returns A promise resolving with the result (generated content, refinement details, etc.) or null on failure.
     */
    executeTask(taskDetails: any, context?: any): Promise<any>;
    /**
     * Generate creative content
     * @param contentPrompt Prompt for content generation
     * @param options Content generation options
     */
    generateContent(contentPrompt: string, options?: {
        format?: 'story' | 'blog-post' | 'marketing-copy' | 'poem' | 'dialogue' | 'free-form';
        tone?: 'professional' | 'casual' | 'humorous' | 'serious' | 'inspirational';
        length?: 'short' | 'medium' | 'long';
        style?: string;
        keywords?: string[];
        checkCache?: boolean;
        temperature?: number;
    }): Promise<{
        content: string;
        title?: string;
        sections?: {
            title: string;
            content: string;
        }[];
        wordCount: number;
        characterCount: number;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Refine existing content based on feedback.
     * @param originalContent The content to refine.
     * @param feedback Instructions for refinement.
     */
    refineContent(originalContent: string, feedback: string): Promise<{
        refinedContent: string;
        changes: string;
        processingTime: number;
    }>;
    /**
     * Generate content in a specific style (e.g., famous author, specific tone).
     * @param contentPrompt The core idea or topic.
     * @param style The target style description.
     * @param options Generation options.
     */
    generateStylizedContent(contentPrompt: string, style: string, options?: {
        format?: 'story' | 'blog-post' | 'marketing-copy' | 'poem' | 'dialogue' | 'free-form';
        length?: 'short' | 'medium' | 'long';
        examples?: string[];
        temperature?: number;
    }): Promise<{
        content: string;
        styleConfidence: number;
        processingTime: number;
    }>;
    /**
     * Cleans expired items from the content cache.
     */
    private cleanCache;
}
export {};
//# sourceMappingURL=CreativeWritingAgent.d.ts.map