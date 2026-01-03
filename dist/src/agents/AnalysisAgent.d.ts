import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { AnalysisAgentInterface } from '../core/multiagent/workflow_types';
/**
 * AnalysisAgent specializes in analyzing datasets, extracting insights,
 * creating visualizations, and generating statistical reports.
 */
export declare class AnalysisAgent extends BaseAgent implements AnalysisAgentInterface {
    private analysisCache;
    private logger;
    constructor(name: string, config: AgentConfig);
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
        confidence: number;
        processingTime: number;
    }>;
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
        summary: string;
        sections: Array<{
            title: string;
            content: string;
            subsections?: Array<{
                title: string;
                content: string;
            }>;
        }>;
        keyFindings: string[];
        recommendations: string[];
        metadata: {
            reportType: string;
            audience: string;
            generatedAt: string;
            dataSource: string;
        };
        processingTime: number;
    }>;
    private buildAnalysisPrompt;
    private buildReportPrompt;
    private parseAnalysisResponse;
    private parseReportResponse;
    private generateCacheKey;
}
//# sourceMappingURL=AnalysisAgent.d.ts.map