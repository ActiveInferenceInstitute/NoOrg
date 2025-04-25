import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * FinanceAgent specializes in financial analysis, reporting, budgeting,
 * forecasting, and other finance-related tasks.
 */
export declare class FinanceAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private financeCache;
    /**
     * Create a new FinanceAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
        specialty?: 'financial-analysis' | 'budgeting' | 'forecasting' | 'investment' | 'accounting';
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
     * Analyze financial data
     * @param financialData Financial data to analyze
     * @param options Analysis options
     */
    analyzeFinancialData(financialData: any, options?: {
        analysisType?: 'basic' | 'detailed' | 'comprehensive';
        focusAreas?: ('profitability' | 'liquidity' | 'solvency' | 'efficiency' | 'growth')[];
        timeframe?: 'quarter' | 'year' | 'multi-year';
        includeBenchmarks?: boolean;
        includeRecommendations?: boolean;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        keyMetrics: Record<string, number | string>;
        analysis: Record<string, string>;
        trends?: Array<{
            metric: string;
            trend: 'increasing' | 'decreasing' | 'stable';
            significance: string;
        }>;
        ratios?: Record<string, number>;
        recommendations?: string[];
        benchmarks?: Record<string, any>;
        visualizationSuggestions?: string[];
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Create a budget plan
     * @param budgetParameters Budget parameters
     * @param options Budget creation options
     */
    createBudget(budgetParameters: {
        totalAmount: number;
        currency?: string;
        period: 'monthly' | 'quarterly' | 'annual';
        categories?: {
            name: string;
            allocation?: number;
        }[];
        historicalData?: any;
    }, options?: {
        level?: 'simple' | 'detailed' | 'comprehensive';
        includeContingency?: boolean;
        includeVisualizations?: boolean;
        includeForecast?: boolean;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        totalBudget: number;
        currency: string;
        period: string;
        categories: Array<{
            name: string;
            allocation: number;
            percentage: number;
            subcategories?: Array<{
                name: string;
                allocation: number;
                percentage: number;
            }>;
        }>;
        contingency?: number;
        notes?: string[];
        visualizations?: Array<{
            type: string;
            description: string;
            data: any;
        }>;
        forecast?: Array<{
            period: string;
            projectedAmount: number;
            notes?: string;
        }>;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Create a financial forecast
     * @param historicalData Historical financial data
     * @param options Forecast options
     */
    createForecast(historicalData: any, options?: {
        forecastPeriod?: number;
        periodType?: 'months' | 'quarters' | 'years';
        includeScenarios?: boolean;
        scenarioTypes?: ('optimistic' | 'pessimistic' | 'most-likely')[];
        includeTrendAnalysis?: boolean;
        includeAssumptions?: boolean;
        checkCache?: boolean;
    }): Promise<{
        summary: string;
        baselineForecast: Array<{
            period: string;
            metrics: Record<string, number>;
        }>;
        scenarios?: Record<string, Array<{
            period: string;
            metrics: Record<string, number>;
            assumptions?: string[];
        }>>;
        trends?: Array<{
            metric: string;
            description: string;
            impact: string;
        }>;
        assumptions?: string[];
        risks?: Array<{
            description: string;
            impact: 'low' | 'medium' | 'high';
            mitigationStrategy?: string;
        }>;
        forecastMethodology?: string;
        visualizationSuggestions?: string[];
        processingTime: number;
        cached?: boolean;
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
