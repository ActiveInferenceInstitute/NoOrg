import { AbstractAgent, AbstractAgentOptions } from './AbstractAgent';
interface DataAnalysisAgentOptions extends Omit<AbstractAgentOptions, 'type'> {
    cacheTTL?: number;
    specialty?: 'statistical' | 'business' | 'scientific' | 'financial' | 'predictive';
}
/**
 * DataAnalysisAgent specializes in analyzing datasets, extracting insights,
 * creating visualizations, and generating statistical reports.
 * Extends the AbstractAgent base class.
 */
export declare class DataAnalysisAgent extends AbstractAgent {
    private analysisCache;
    private cacheTTL;
    private specialty;
    /**
     * Create a new DataAnalysisAgent
     * @param name Agent name
     * @param options Optional configuration including required services
     */
    constructor(name: string, options: DataAnalysisAgentOptions);
    /**
     * Hook called during agent initialization.
     * Clears the analysis cache.
     */
    protected onInitialize(): Promise<void>;
    /**
     * Hook called during agent shutdown.
     * Cleans the cache.
     */
    protected onShutdown(): Promise<void>;
    /**
     * Executes a task based on provided details.
     * Routes tasks to specific methods like analyzeData, createVisualization, etc.
     * @param taskDetails - Object containing task details (e.g., { type: 'analyze', data: {...}, options: {...} })
     * @param context - Optional context (not currently used).
     * @returns A promise resolving with the task result or an error object.
     */
    executeTask(taskDetails: any, context?: any): Promise<any>;
    /**
     * Analyze dataset and extract insights.
     * @param data Dataset to analyze (expected format: array of objects or similar structure).
     * @param options Analysis options.
     * @returns A promise resolving with the analysis results.
     */
    analyzeData(data: any, options?: {
        analysisType?: 'exploratory' | 'descriptive' | 'inferential' | 'diagnostic' | 'predictive';
        focusAreas?: string[];
        includeVisualizationSuggestions?: boolean;
        includeStatisticalTests?: boolean;
        includeTrends?: boolean;
        includeCorrelations?: boolean;
        includeOutliers?: boolean;
        includeRecommendations?: boolean;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        keyInsights: string[];
        statistics: Record<string, any>;
        visualizationSuggestions?: Array<{
            type: string;
            description: string;
            variables: string[];
            purpose: string;
        }>;
        statisticalTests?: Array<{
            name: string;
            variables: string[];
            result: any;
            interpretation: string;
            significance?: number;
        }>;
        trends?: Array<{
            variable: string;
            trend: string;
            magnitude: number;
            interpretation: string;
        }>;
        correlations?: Array<{
            variables: string[];
            coefficient: number;
            strength: 'weak' | 'moderate' | 'strong';
            direction: 'positive' | 'negative' | 'none';
            interpretation: string;
        }>;
        outliers?: Array<{
            variable: string;
            values: any[];
            impact: string;
        }>;
        recommendations?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Suggests and optionally generates configuration/code for data visualizations.
     * @param data Dataset (can be the raw data or analysis results).
     * @param options Visualization options.
     * @returns A promise resolving with visualization details.
     */
    createVisualization(data: any, options?: {
        visualizationType?: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'heatmap' | 'box' | 'radar' | 'auto';
        variables?: string[];
        title?: string;
        purpose?: string;
        palette?: string[];
        includeCode?: boolean;
        framework?: 'matplotlib' | 'plotly' | 'seaborn' | 'ggplot' | 'chart.js' | 'd3' | 'echarts';
        checkCache?: boolean;
    }): Promise<{
        visualizationType: string;
        title: string;
        variables: string[];
        config: Record<string, any>;
        description: string;
        insights: string[];
        code?: string;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Generates a formatted report based on data analysis.
     * @param data Raw data or prior analysis results.
     * @param options Report generation options.
     * @returns A promise resolving with the report structure.
     */
    generateReport(data: any, options?: {
        reportType?: 'executive' | 'technical' | 'comprehensive';
        sections?: string[];
        audience?: 'executives' | 'analysts' | 'stakeholders' | 'technical';
        includeExecutiveSummary?: boolean;
        includeMethodology?: boolean;
        includeVisualizations?: boolean;
        includeRecommendations?: boolean;
        checkCache?: boolean;
    }): Promise<{
        title: string;
        executiveSummary?: string;
        sections: Array<{
            title: string;
            content: string;
            visualizations?: Array<{
                type: string;
                title: string;
                description: string;
                config?: Record<string, any>;
            }>;
        }>;
        methodology?: string;
        keyFindings: string[];
        recommendations?: string[];
        nextSteps?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Cleans expired items from the analysis cache.
     */
    private cleanCache;
}
export {};
