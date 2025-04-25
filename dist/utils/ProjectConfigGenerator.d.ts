/**
 * Project Configuration Generator
 *
 * Generates contextually appropriate project configuration using LLM
 * instead of hardcoded values. This makes the workflow examples more
 * flexible and domain-agnostic.
 */
/**
 * Generates project configuration for any domain using LLM
 */
export declare class ProjectConfigGenerator {
    private static instance;
    private openaiClient;
    private cacheDir;
    private cacheEnabled;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Get or create the singleton instance
     */
    static getInstance(apiKey: string): ProjectConfigGenerator;
    /**
     * Generate a project configuration based on domain and objective
     *
     * @param domain Project domain (e.g., "Environmental monitoring")
     * @param objective Project objective (or null to generate one)
     * @param options Additional options
     * @returns Complete project configuration
     */
    generateConfig(domain: string, objective?: string, options?: {
        useCache?: boolean;
        constraints?: string;
        targetUsers?: string;
        llmConfig?: {
            defaultModel?: string;
            fallbackModel?: string;
            tokenLimitThreshold?: number;
            defaultMaxTokens?: number;
        };
    }): Promise<Record<string, any>>;
    /**
     * Generate a realistic project objective for a given domain
     */
    private generateObjective;
    /**
     * Generate complementary configuration elements (constraints, target users)
     */
    private generateConfigElements;
    /**
     * For testing: add an example usage method
     */
    static example(): Promise<void>;
}
