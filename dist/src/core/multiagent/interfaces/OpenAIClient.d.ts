/**
 * Interface for the OpenAIClient
 * Defines methods for interacting with OpenAI API
 */
export interface OpenAIClient {
    /**
     * Create a text completion
     * @param prompt Prompt text
     * @param options Optional configuration
     * @returns Completion text
     */
    createCompletion(prompt: string, options?: Record<string, unknown>): Promise<string>;
}
//# sourceMappingURL=OpenAIClient.d.ts.map