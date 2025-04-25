/**
 * Base interface for message types used in LLM interactions
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
}

/**
 * Options for sending prompts to LLM services
 */
export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  seed?: number;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | any;
  response_format?: { type: 'text' | 'json_object' };
  user?: string;
  [key: string]: any;
}

/**
 * Response type from LLM service calls
 */
export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: any[];
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Usage statistics from LLM service calls
 */
export interface LLMUsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
  model: string;
  timestamp: number;
}

/**
 * Interface for LLM client implementations
 * This allows for different LLM providers to be used interchangeably
 */
export interface LLMClientInterface {
  /**
   * Send a prompt to the LLM service
   * @param prompt The prompt text or messages array
   * @param options Request options
   * @returns LLM response
   */
  sendPrompt(
    prompt: string | LLMMessage[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse>;
  
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
   * Calculate the cost of tokens for a specific model
   * @param model Model name
   * @param promptTokens Number of prompt tokens
   * @param completionTokens Number of completion tokens
   * @returns Cost in USD
   */
  calculateCost(model: string, promptTokens: number, completionTokens: number): number;
  
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
} 