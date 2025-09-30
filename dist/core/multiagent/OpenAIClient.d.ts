import { LLMMessage, LLMUsageStats } from './LLMClientInterface';
import { OpenAIOptions, BillingLimits, TokenEstimate } from './types';
import OpenAI from 'openai';
import { OpenAIClient as IOpenAIClient } from './interfaces/OpenAIClient';
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
export interface OpenAIClientConfig {
    apiKey?: string;
    apiBaseUrl?: string;
    defaultModel?: string;
    maxTokens?: number;
    temperature?: number;
    billingLimits?: BillingLimits;
}
/**
 * Options for generating responses
 */
export interface GenerateResponseOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
}
/**
 * Options for sending a prompt to OpenAI
 */
export interface SendPromptOptions {
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}
/**
 * Response from the OpenAI API
 */
export interface PromptResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string | null;
        };
        finish_reason: string | null;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
/**
 * OpenAIClient for interacting with the OpenAI API
 */
export declare class OpenAIClient implements IOpenAIClient {
    private apiKey;
    private baseUrl;
    private defaultModel;
    private maxTokens;
    private defaultTemperature;
    private billingLimits;
    private usageTracking;
    private usageHistory;
    private client;
    /**
     * Constructor initializes with API key
     * @param apiKey OpenAI API key
     */
    constructor(apiKey?: string);
    /**
     * New method to create chat completion using the internal OpenAI client instance
     * @param messages Array of LLMMessage objects
     * @param options Optional configuration matching OpenAI's API
     * @returns OpenAI ChatCompletion object
     */
    createChatCompletion(messages: LLMMessage[], options?: Partial<Omit<ChatCompletionCreateParamsNonStreaming, 'messages' | 'model'>> & {
        model?: string;
    }): Promise<ChatCompletion>;
    /**
     * Create a text completion
     * @param prompt Prompt text
     * @param options Optional configuration
     * @returns Completion text
     */
    createCompletion(prompt: string, options?: Record<string, unknown>): Promise<string>;
    /**
     * Track usage statistics for billing and monitoring
     * @param usage Usage statistics to track
     */
    private trackUsage;
    /**
     * Calculate the cost of tokens for a specific model
     * @param model Model name
     * @param promptTokens Number of prompt tokens
     * @param completionTokens Number of completion tokens
     * @returns Cost in USD
     */
    calculateCost(model: string, promptTokens: number, completionTokens: number): number;
    /**
     * Get usage statistics for a billing period
     * @param startDate Start date for usage statistics
     * @param endDate End date for usage statistics (defaults to current time)
     * @returns Usage statistics
     */
    getUsageStats(startDate: Date, endDate?: Date): Promise<{
        totalTokens: number;
        totalCost: number;
        requests: number;
        usageByModel: Record<string, {
            tokens: number;
            cost: number;
            requests: number;
        }>;
        usageHistory: LLMUsageStats[];
    }>;
    /**
     * Get the list of available models
     * @returns Array of available model names
     */
    getAvailableModels(): Promise<string[]>;
    /**
     * Get information about a specific model
     * @param model Model name
     * @returns Model information
     */
    getModelInfo(model: string): Promise<{
        id: string;
        name: string;
        maxTokens: number;
        contextWindow: number;
        promptCostPer1kTokens: number;
        completionCostPer1kTokens: number;
        capabilities: string[];
    } | null>;
    /**
     * Get the default model to use
     * @returns Default model name
     */
    getDefaultModel(): string;
    /**
     * Set the default model to use
     * @param model New default model name
     */
    setDefaultModel(model: string): void;
    /**
     * Stream responses from the OpenAI API
     * @param prompt The prompt to send
     * @param options Optional API request options
     * @returns An async iterator of response chunks
     */
    streamResponse(prompt: string, options?: Partial<OpenAIOptions>): AsyncIterator<string>;
    /**
     * Generate embeddings for a text
     * @param text The text to embed
     * @returns An array of embedding values
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * Estimate token usage for a prompt
     * @param prompt The prompt to estimate
     * @param model The model to estimate for
     * @returns Token usage estimate
     */
    estimateTokenUsage(prompt: string, model: string): Promise<TokenEstimate>;
    /**
     * Get the model's completion ratio (avg completion tokens / prompt tokens)
     * @param model The model ID
     * @returns Estimated completion ratio
     */
    private getCompletionRatio;
    /**
     * Estimate token count based on text content
     * @param text The text to estimate
     * @returns Estimated token count
     */
    private estimateTokenCount;
    /**
     * Check if we're approaching billing limits
     * @param estimatedCost The estimated cost of a request
     * @throws Error if billing limits would be exceeded
     */
    private checkBillingLimits;
    /**
     * Generate a response using the OpenAI API
     * @param prompt The prompt to send
     * @param options Generation options
     * @returns The generated response
     */
    generateResponse(prompt: string, options?: GenerateResponseOptions): Promise<string>;
    /**
     * Send a prompt to the OpenAI API
     * @param userPrompt User prompt text
     * @param options Options for the request
     * @returns The AI response
     */
    sendPrompt(userPrompt: string, options?: SendPromptOptions): Promise<PromptResponse>;
    /**
     * Send a chat completion with multiple messages
     * @param messages Array of chat messages
     * @param options Options for the request
     * @returns The AI response
     */
    sendChatCompletion(messages: OpenAI.ChatCompletionMessageParam[], options?: Omit<SendPromptOptions, 'systemPrompt'>): Promise<PromptResponse>;
}
