"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClient = void 0;
const dotenv = __importStar(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
// Load environment variables
dotenv.config();
// OpenAI API configuration
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'o3-mini';
const API_KEY = process.env.OPENAI_API_KEY;
const API_BASE_URL = 'https://api.openai.com/v1';
/**
 * Pricing structure for OpenAI models (per 1000 tokens)
 */
const MODEL_PRICING = {
    'o3-mini': { prompt: 0.0015, completion: 0.0020 },
    'o3-8k': { prompt: 0.003, completion: 0.015 },
    'o3-32k': { prompt: 0.006, completion: 0.03 },
    'o3-sonnet': { prompt: 0.01, completion: 0.03 },
    'o3-opus': { prompt: 0.015, completion: 0.075 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    'gpt-3.5-turbo-16k': { prompt: 0.001, completion: 0.002 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-32k': { prompt: 0.06, completion: 0.12 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
};
/**
 * Model information including token limits and capabilities
 */
const MODEL_INFO = {
    'o3-mini': {
        maxTokens: 4096,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'basic-reasoning']
    },
    'o3-8k': {
        maxTokens: 8192,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning']
    },
    'o3-32k': {
        maxTokens: 32768,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning']
    },
    'o3-sonnet': {
        maxTokens: 32768,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'complex-reasoning', 'advanced-coding', 'sophisticated-planning']
    },
    'o3-opus': {
        maxTokens: 32768,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'expert-reasoning', 'expert-coding', 'expert-planning']
    },
    'gpt-3.5-turbo': {
        maxTokens: 4096,
        contextWindow: 16384,
        capabilities: ['text-generation', 'function-calling', 'basic-reasoning']
    },
    'gpt-3.5-turbo-16k': {
        maxTokens: 4096,
        contextWindow: 16384,
        capabilities: ['text-generation', 'function-calling', 'basic-reasoning']
    },
    'gpt-4': {
        maxTokens: 8192,
        contextWindow: 8192,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning']
    },
    'gpt-4-32k': {
        maxTokens: 8192,
        contextWindow: 32768,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning']
    },
    'gpt-4-turbo': {
        maxTokens: 4096,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning', 'vision']
    },
    'gpt-4o': {
        maxTokens: 4096,
        contextWindow: 128000,
        capabilities: ['text-generation', 'function-calling', 'reasoning', 'coding', 'planning', 'vision']
    }
};
/**
 * OpenAIClient for interacting with the OpenAI API
 */
class OpenAIClient {
    /**
     * Constructor initializes with API key
     * @param apiKey OpenAI API key
     */
    constructor(apiKey) {
        this.baseUrl = 'https://api.openai.com/v1';
        this.defaultModel = 'gpt-3.5-turbo';
        this.billingLimits = {
            maxMonthlySpend: 100,
            alertThreshold: 0.8
        };
        this.usageHistory = [];
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        if (!this.apiKey) {
            console.warn('OpenAI API key not provided. API calls will fail.');
        }
        this.maxTokens = MODEL_INFO[this.defaultModel]?.maxTokens || 4096;
        this.defaultTemperature = 0.7;
        this.usageTracking = {
            totalTokens: 0,
            totalCost: 0,
            requestCount: 0,
            lastReset: Date.now(),
            modelUsage: {}
        };
        this.client = new openai_1.default({
            apiKey: this.apiKey
        });
    }
    /**
     * New method to create chat completion using the internal OpenAI client instance
     * @param messages Array of LLMMessage objects
     * @param options Optional configuration matching OpenAI's API
     * @returns OpenAI ChatCompletion object
     */
    async createChatCompletion(messages, options) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not provided');
        }
        // Map LLMMessage to ChatCompletionMessageParam
        const mappedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            // Add other potential fields if needed, ensure compatibility
        }));
        const model = options?.model || this.defaultModel;
        const requestBody = {
            model: model,
            messages: mappedMessages,
            // Merge other options intelligently
            temperature: options?.temperature ?? this.defaultTemperature,
            max_tokens: options?.max_tokens ?? this.maxTokens,
            top_p: options?.top_p,
            frequency_penalty: options?.frequency_penalty,
            presence_penalty: options?.presence_penalty,
            stop: options?.stop,
            // Add other relevant options from ChatCompletionCreateParamsNonStreaming if needed
        };
        // Record usage before making the call? Or rely on response usage? Rely on response for now.
        const response = await this.client.chat.completions.create(requestBody);
        // Optional: Track usage based on the response
        if (response.usage) {
            const cost = this.calculateCost(model, response.usage.prompt_tokens, response.usage.completion_tokens);
            this.trackUsage({
                model: model,
                prompt_tokens: response.usage.prompt_tokens,
                completion_tokens: response.usage.completion_tokens,
                total_tokens: response.usage.total_tokens,
                cost: cost,
                timestamp: Date.now(),
            });
        }
        return response;
    }
    /**
     * Create a text completion
     * @param prompt Prompt text
     * @param options Optional configuration
     * @returns Completion text
     */
    async createCompletion(prompt, options) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not provided');
        }
        const model = options?.model || this.defaultModel;
        const temperature = options?.temperature || this.defaultTemperature;
        const maxTokens = options?.max_tokens || this.maxTokens;
        try {
            const response = await this.client.completions.create({
                model: model,
                prompt: prompt,
                temperature: temperature,
                max_tokens: maxTokens,
                top_p: options?.top_p || undefined,
                frequency_penalty: options?.frequency_penalty || undefined,
                presence_penalty: options?.presence_penalty || undefined,
                stop: options?.stop || undefined,
            });
            // Optional: Track usage if needed, similar to createChatCompletion
            // Note: Completions API usage structure might differ slightly.
            // Assuming usage tracking is desired, need to adapt trackUsage call.
            return response.choices[0].text.trim();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error creating completion:', errorMessage);
            throw new Error(`OpenAI API Error: ${errorMessage}`);
        }
    }
    /**
     * Track usage statistics for billing and monitoring
     * @param usage Usage statistics to track
     */
    trackUsage(usage) {
        this.usageHistory.push(usage);
        // Update aggregate tracking
        this.usageTracking.totalTokens += usage.total_tokens;
        this.usageTracking.totalCost += usage.cost || 0;
        this.usageTracking.requestCount++;
        // Update model-specific tracking
        if (!this.usageTracking.modelUsage[usage.model]) {
            this.usageTracking.modelUsage[usage.model] = {
                tokens: 0,
                cost: 0,
                requests: 0
            };
        }
        this.usageTracking.modelUsage[usage.model].tokens += usage.total_tokens;
        this.usageTracking.modelUsage[usage.model].cost += usage.cost || 0;
        this.usageTracking.modelUsage[usage.model].requests++;
        // Limit history size to prevent memory issues
        if (this.usageHistory.length > 1000) {
            this.usageHistory = this.usageHistory.slice(-1000);
        }
    }
    /**
     * Calculate the cost of tokens for a specific model
     * @param model Model name
     * @param promptTokens Number of prompt tokens
     * @param completionTokens Number of completion tokens
     * @returns Cost in USD
     */
    calculateCost(model, promptTokens, completionTokens) {
        const modelPricing = MODEL_PRICING[model] || MODEL_PRICING[this.defaultModel];
        if (!modelPricing) {
            return 0;
        }
        const promptCost = (promptTokens / 1000) * modelPricing.prompt;
        const completionCost = (completionTokens / 1000) * modelPricing.completion;
        return promptCost + completionCost;
    }
    /**
     * Get usage statistics for a billing period
     * @param startDate Start date for usage statistics
     * @param endDate End date for usage statistics (defaults to current time)
     * @returns Usage statistics
     */
    async getUsageStats(startDate, endDate = new Date()) {
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        // Filter usage history by date range
        const filteredHistory = this.usageHistory.filter(usage => usage.timestamp >= startTime && usage.timestamp <= endTime);
        // Initialize statistics
        let totalTokens = 0;
        let totalCost = 0;
        const usageByModel = {};
        // Calculate statistics
        filteredHistory.forEach(usage => {
            totalTokens += usage.total_tokens;
            totalCost += usage.cost || 0;
            if (!usageByModel[usage.model]) {
                usageByModel[usage.model] = {
                    tokens: 0,
                    cost: 0,
                    requests: 0
                };
            }
            usageByModel[usage.model].tokens += usage.total_tokens;
            usageByModel[usage.model].cost += usage.cost || 0;
            usageByModel[usage.model].requests += 1;
        });
        return {
            totalTokens,
            totalCost,
            requests: filteredHistory.length,
            usageByModel,
            usageHistory: filteredHistory
        };
    }
    /**
     * Get the list of available models
     * @returns Array of available model names
     */
    async getAvailableModels() {
        if (!this.apiKey) {
            console.warn('Cannot fetch models without API key. Returning predefined models.');
            return Object.keys(MODEL_INFO);
        }
        try {
            const response = await this.client.models.list();
            const models = response.data || [];
            return models.map((model) => model.id);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to fetch available models via API:', errorMessage);
            // Return predefined models if API request fails
            return Object.keys(MODEL_INFO);
        }
    }
    /**
     * Get information about a specific model
     * @param model Model name
     * @returns Model information
     */
    async getModelInfo(model) {
        const modelInfo = MODEL_INFO[model];
        const pricing = MODEL_PRICING[model];
        if (!modelInfo || !pricing) {
            return null;
        }
        return {
            id: model,
            name: model,
            maxTokens: modelInfo.maxTokens,
            contextWindow: modelInfo.contextWindow,
            promptCostPer1kTokens: pricing.prompt,
            completionCostPer1kTokens: pricing.completion,
            capabilities: modelInfo.capabilities
        };
    }
    /**
     * Get the default model to use
     * @returns Default model name
     */
    getDefaultModel() {
        return this.defaultModel;
    }
    /**
     * Set the default model to use
     * @param model New default model name
     */
    setDefaultModel(model) {
        if (MODEL_INFO[model]) {
            this.defaultModel = model;
        }
        else {
            console.warn(`Model ${model} not recognized. Default model not changed.`);
        }
    }
    /**
     * Stream responses from the OpenAI API
     * @param prompt The prompt to send
     * @param options Optional API request options
     * @returns An async iterator of response chunks
     */
    async *streamResponse(prompt, options) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not provided for streaming');
        }
        const model = options?.model || this.defaultModel;
        const requestBody = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options?.temperature ?? this.defaultTemperature,
            max_tokens: options?.max_tokens ?? this.maxTokens, // Be mindful of maxTokens for streaming
            top_p: options?.top_p ?? 1,
            frequency_penalty: options?.frequency_penalty ?? 0,
            presence_penalty: options?.presence_penalty ?? 0,
            stop: options?.stop,
            user: options?.user,
            stream: true, // Explicitly set stream to true
        };
        // Calculate token estimate for monitoring
        // Note: Estimating prompt tokens before the stream starts is useful.
        // Completion tokens are harder to estimate accurately beforehand for streams.
        const promptTokens = this.estimateTokenCount(prompt);
        // We might skip full cost estimation check here, or use a basic prompt cost check.
        // this.checkBillingLimits(this.calculateCost(model, promptTokens, 0)); // Example check based on prompt only
        try {
            const stream = await this.client.chat.completions.create(requestBody);
            let completionTokens = 0;
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    completionTokens += this.estimateTokenCount(content);
                    yield content;
                }
            }
            // Track usage after streaming is complete
            this.trackUsage({
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_tokens: promptTokens + completionTokens,
                cost: this.calculateCost(model, promptTokens, completionTokens),
                model,
                timestamp: Date.now()
            });
        }
        catch (error) {
            // Handle API or network errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error streaming from OpenAI API:', errorMessage);
            // Handle network or other errors
            throw new Error(`Error streaming from OpenAI API: ${errorMessage}`);
        }
    }
    /**
     * Generate embeddings for a text
     * @param text The text to embed
     * @returns An array of embedding values
     */
    async generateEmbedding(text) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not provided for embeddings');
        }
        const embeddingModel = 'text-embedding-ada-002'; // Common choice
        try {
            const response = await this.client.embeddings.create({
                input: text,
                model: embeddingModel,
            });
            // Track usage based on embedding model pricing
            // Use usage info from response if available, otherwise estimate
            const usage = response.usage;
            const promptTokens = usage?.prompt_tokens ?? this.estimateTokenCount(text);
            const totalTokens = usage?.total_tokens ?? promptTokens;
            this.trackUsage({
                prompt_tokens: promptTokens,
                completion_tokens: 0, // Embeddings don't have completion tokens
                total_tokens: totalTokens,
                cost: this.calculateCost(embeddingModel, promptTokens, 0),
                model: embeddingModel,
                timestamp: Date.now()
            });
            return response.data[0].embedding;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error generating embedding:', errorMessage);
            throw new Error(`Error generating embedding: ${errorMessage}`);
        }
    }
    /**
     * Estimate token usage for a prompt
     * @param prompt The prompt to estimate
     * @param model The model to estimate for
     * @returns Token usage estimate
     */
    async estimateTokenUsage(prompt, model) {
        // Simple estimation based on token counting
        const promptTokens = this.estimateTokenCount(prompt);
        // Estimate completion tokens based on model and prompt
        // This is a very rough estimate - in reality, completion length varies widely
        const avgCompletionRatio = this.getCompletionRatio(model);
        const expectedCompletionTokens = Math.min(Math.round(promptTokens * avgCompletionRatio), this.maxTokens);
        // Calculate min/max ranges
        const minCompletionTokens = Math.round(expectedCompletionTokens * 0.5);
        const maxCompletionTokens = Math.min(Math.round(expectedCompletionTokens * 2), this.maxTokens);
        // Calculate costs
        const expectedCost = this.calculateCost(model, promptTokens, expectedCompletionTokens);
        const minCost = this.calculateCost(model, promptTokens, minCompletionTokens);
        const maxCost = this.calculateCost(model, promptTokens, maxCompletionTokens);
        return {
            promptTokens,
            completionTokens: {
                min: minCompletionTokens,
                max: maxCompletionTokens,
                expected: expectedCompletionTokens
            },
            totalTokens: {
                min: promptTokens + minCompletionTokens,
                max: promptTokens + maxCompletionTokens,
                expected: promptTokens + expectedCompletionTokens
            },
            estimatedCost: {
                min: minCost,
                max: maxCost,
                expected: expectedCost
            }
        };
    }
    /**
     * Get the model's completion ratio (avg completion tokens / prompt tokens)
     * @param model The model ID
     * @returns Estimated completion ratio
     */
    getCompletionRatio(model) {
        // Ratios are approximate and will vary by use case
        if (model.includes('o3-mini'))
            return 1.2; // Smaller model, shorter completions
        if (model.includes('gpt-4'))
            return 2.0; // Very thorough completions
        if (model.includes('gpt-3.5-turbo'))
            return 1.5; // Medium completions
        // Default ratio for unknown models
        return 1.0;
    }
    /**
     * Estimate token count based on text content
     * @param text The text to estimate
     * @returns Estimated token count
     */
    estimateTokenCount(text) {
        // Simple estimation: ~4 characters per token for English text
        // This is a rough approximation - for production use, consider using a proper tokenizer
        return Math.ceil(text.length / 4);
    }
    /**
     * Check if we're approaching billing limits
     * @param estimatedCost The estimated cost of a request
     * @throws Error if billing limits would be exceeded
     */
    checkBillingLimits(estimatedCost) {
        const currentTotal = this.usageTracking.totalCost;
        const projectedTotal = currentTotal + estimatedCost;
        const maxSpend = this.billingLimits.maxMonthlySpend;
        const alertThreshold = this.billingLimits.alertThreshold;
        // Throw error if we would exceed max spend
        if (projectedTotal > maxSpend) {
            throw new Error(`Request would exceed monthly spending limit of $${maxSpend.toFixed(2)}. Current usage: $${currentTotal.toFixed(2)}, request cost: $${estimatedCost.toFixed(2)}.`);
        }
        // Log warning if we're approaching max spend
        if (projectedTotal > maxSpend * alertThreshold) {
            console.warn(`Warning: Approaching monthly spending limit. Current usage: $${currentTotal.toFixed(2)} of $${maxSpend.toFixed(2)} (${((currentTotal / maxSpend) * 100).toFixed(1)}%).`);
        }
    }
    /**
     * Generate a response using the OpenAI API
     * @param prompt The prompt to send
     * @param options Generation options
     * @returns The generated response
     */
    async generateResponse(prompt, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || 'o3-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000,
                top_p: options.top_p || 1,
                frequency_penalty: options.frequency_penalty || 0,
                presence_penalty: options.presence_penalty || 0,
                stop: options.stop
            });
            return response.choices[0].message.content || '';
        }
        catch (error) {
            console.error('Error generating response:', error.message);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }
    /**
     * Send a prompt to the OpenAI API
     * @param userPrompt User prompt text
     * @param options Options for the request
     * @returns The AI response
     */
    async sendPrompt(userPrompt, options = {}) {
        try {
            const { systemPrompt, model = this.defaultModel, temperature = 0.7, maxTokens = 4000, topP = 1, frequencyPenalty = 0, presencePenalty = 0 } = options;
            const messages = [];
            // Add system message if provided
            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }
            // Add user message
            messages.push({
                role: 'user',
                content: userPrompt
            });
            // Make request to OpenAI
            const response = await this.client.chat.completions.create({
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty
            });
            return {
                id: response.id,
                object: response.object,
                created: response.created,
                model: response.model,
                choices: response.choices,
                usage: response.usage && {
                    prompt_tokens: response.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens
                }
            };
        }
        catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
    /**
     * Send a chat completion with multiple messages
     * @param messages Array of chat messages
     * @param options Options for the request
     * @returns The AI response
     */
    async sendChatCompletion(messages, options = {}) {
        try {
            const { model = this.defaultModel, temperature = 0.7, maxTokens = 4000, topP = 1, frequencyPenalty = 0, presencePenalty = 0 } = options;
            // Make request to OpenAI
            const response = await this.client.chat.completions.create({
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty
            });
            return {
                id: response.id,
                object: response.object,
                created: response.created,
                model: response.model,
                choices: response.choices,
                usage: response.usage && {
                    prompt_tokens: response.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens
                }
            };
        }
        catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
}
exports.OpenAIClient = OpenAIClient;
//# sourceMappingURL=OpenAIClient.js.map