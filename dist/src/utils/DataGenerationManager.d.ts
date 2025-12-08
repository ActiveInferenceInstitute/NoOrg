/**
 * DataGenerationManager provides dynamic, context-aware data generation
 * capabilities for workflows, replacing hardcoded content with LLM-generated
 * data appropriate for the current project context.
 */
export declare class DataGenerationManager {
    private llm;
    private context;
    private outputDir;
    private cacheEnabled;
    private cacheDir;
    /**
     * Create a new DataGenerationManager
     *
     * @param apiKey OpenAI API key for LLM-based generation
     * @param context Application context (domain, objective, etc.)
     * @param outputDir Directory to store outputs and cache
     */
    constructor(apiKey: string, context: Record<string, any>, outputDir: string);
    /**
     * Generate locations data appropriate for the current project context
     *
     * @param count Number of locations to generate
     * @param options Optional configuration for generation
     * @returns Array of location objects
     */
    generateLocations(count: number, options?: {
        coverage?: 'high' | 'medium' | 'low';
        useCache?: boolean;
        centerPoint?: {
            lat: number;
            lng: number;
        };
        radius?: number;
    }): Promise<Array<{
        id: string;
        name: string;
        lat: number;
        lng: number;
        type: string;
        priority: number;
        recommended_sensor?: string;
    }>>;
    /**
     * Generate sensor readings data based on the project domain
     *
     * @param locationName Location name to generate readings for
     * @param timestamp Timestamp for the readings
     * @returns Object with appropriate readings for the domain
     */
    generateDomainSpecificReadings(locationName: string, timestamp: string): Promise<Record<string, any>>;
    /**
     * Generate neural data specifically for the project domain
     * This replaces the hardcoded ant brain/neural data generator
     *
     * @param locations Array of locations to generate data for
     * @returns Complete API response object with neural data
     */
    generateNeuralData(locations: Array<{
        name: string;
        lat: number;
        lng: number;
    }>): Promise<any>;
    /**
     * Create a complete visualization config based on the project domain
     *
     * @param data The data to visualize
     * @param visType Type of visualization to generate
     * @returns Visualization configuration
     */
    generateVisualizationConfig(data: any, visType: 'chart' | 'diagram' | 'table' | 'map'): Promise<any>;
    /**
     * Helper method to determine if the domain is non-geographic
     */
    private isNonGeographicDomain;
    /**
     * Generate synthetic location data when LLM generation fails or isn't appropriate
     */
    private generateSyntheticLocations;
    /**
     * Generate synthetic readings for when LLM generation fails
     */
    private generateSyntheticReadings;
    /**
     * Create a simplified version of data for visualization
     */
    private summarizeData;
}
//# sourceMappingURL=DataGenerationManager.d.ts.map