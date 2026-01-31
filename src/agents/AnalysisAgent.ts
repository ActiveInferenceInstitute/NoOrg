import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { AnalysisAgentInterface } from '../core/multiagent/workflow_types';
import { Logger } from '../core/multiagent/Logger';

/**
 * AnalysisAgent specializes in analyzing datasets, extracting insights,
 * creating visualizations, and generating statistical reports.
 */
export class AnalysisAgent extends BaseAgent implements AnalysisAgentInterface {
  private analysisCache: Map<string, any> = new Map();
  private logger: Logger;

  constructor(name: string, config: AgentConfig) {
    super({ ...config, name });
    this.logger = new Logger(`AnalysisAgent-${name}`, 'info');
  }

  async analyzeData(
    data: any,
    options?: {
      analysisType?: 'exploratory' | 'descriptive' | 'inferential' | 'diagnostic' | 'predictive';
      focusAreas?: string[];
      includeVisualizationSuggestions?: boolean;
      includeStatisticalTests?: boolean;
      includeTrends?: boolean;
      includeCorrelations?: boolean;
      includeOutliers?: boolean;
      includeRecommendations?: boolean;
      checkCache?: boolean;
    }
  ): Promise<{
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
  }> {
    if (data === null || data === undefined) {
      throw new Error('Data parameter is required for analysis');
    }

    this.updateStatus('busy');
    const startTime = Date.now();

    this.logger.info('Starting data analysis', {
      analysisType: options?.analysisType || 'comprehensive',
      focusAreas: options?.focusAreas,
      includeRecommendations: options?.includeRecommendations,
      dataSize: JSON.stringify(data).length
    });

    try {
      // Check cache if requested
      if (options?.checkCache) {
        const cacheKey = this.generateCacheKey(data, options);
        const cached = this.analysisCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
          this.logger.info('Returning cached analysis result', { cacheKey });
          return cached.result;
        }
      }

      const analysisType = options?.analysisType || 'comprehensive';
      const focusAreas = options?.focusAreas || [];

      const prompt = this.buildAnalysisPrompt(data, options);

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.3, // Lower temperature for analysis
        maxTokens: 3000
      });

      const result = this.parseAnalysisResponse(response, data, options, startTime);

      // Cache result if requested
      if (options?.checkCache) {
        const cacheKey = this.generateCacheKey(data, options);
        this.analysisCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }

      this.updateStatus('idle');

      this.logger.info('Data analysis completed successfully', {
        processingTime: Date.now() - startTime,
        confidence: result.confidence,
        insightsCount: result.keyInsights.length
      });

      return result;
    } catch (error: any) {
      this.logger.error('Data analysis failed', {
        error: error.message,
        processingTime: Date.now() - startTime,
        analysisType: options?.analysisType
      });
      this.handleError(error);
      throw error;
    }
  }

  async generateReport(
    data: any,
    options?: {
      reportType?: 'executive' | 'technical' | 'comprehensive';
      sections?: string[];
      audience?: 'executives' | 'analysts' | 'stakeholders' | 'technical';
      includeExecutiveSummary?: boolean;
      includeMethodology?: boolean;
      includeVisualizations?: boolean;
      includeRecommendations?: boolean;
      checkCache?: boolean;
    }
  ): Promise<{
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
  }> {
    this.updateStatus('busy');
    const startTime = Date.now();

    try {
      const reportType = options?.reportType || 'comprehensive';
      const audience = options?.audience || 'analysts';

      const prompt = this.buildReportPrompt(data, options);

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.2, // Very low temperature for reports
        maxTokens: 4000
      });

      const result = this.parseReportResponse(response, options, startTime);

      this.updateStatus('idle');
      return result;
    } catch (error: any) {
      this.logger.error('Report generation failed', {
        error: error.message,
        processingTime: Date.now() - startTime,
        reportType: options?.reportType
      });
      this.handleError(error);
      throw error;
    }
  }

  private buildAnalysisPrompt(data: any, options?: any): string {
    const analysisType = options?.analysisType || 'comprehensive';
    const focusAreas = options?.focusAreas || [];

    let prompt = `Perform a ${analysisType} analysis of the following data:\n\n`;
    prompt += `Data:\n${JSON.stringify(data, null, 2)}\n\n`;

    if (focusAreas.length > 0) {
      prompt += `Focus Areas: ${focusAreas.join(', ')}\n\n`;
    }

    prompt += `Please provide:\n`;
    prompt += `1. Summary of findings\n`;
    prompt += `2. Key insights\n`;
    prompt += `3. Statistical analysis\n`;

    if (options?.includeTrends) prompt += `4. Trend analysis\n`;
    if (options?.includeCorrelations) prompt += `5. Correlation analysis\n`;
    if (options?.includeOutliers) prompt += `6. Outlier detection\n`;
    if (options?.includeVisualizationSuggestions) prompt += `7. Visualization recommendations\n`;
    if (options?.includeStatisticalTests) prompt += `8. Statistical test results\n`;
    if (options?.includeRecommendations) prompt += `9. Recommendations\n`;

    prompt += `\nFormat the response as a structured JSON object.`;

    return prompt;
  }

  private buildReportPrompt(data: any, options?: any): string {
    const reportType = options?.reportType || 'comprehensive';
    const audience = options?.audience || 'analysts';

    let prompt = `Generate a ${reportType} report for ${audience} based on the following data:\n\n`;
    prompt += `Data:\n${JSON.stringify(data, null, 2)}\n\n`;

    prompt += `Report Requirements:\n`;
    if (options?.includeExecutiveSummary) prompt += `- Include executive summary\n`;
    if (options?.includeMethodology) prompt += `- Include methodology section\n`;
    if (options?.includeVisualizations) prompt += `- Include visualization recommendations\n`;
    if (options?.includeRecommendations) prompt += `- Include detailed recommendations\n`;

    prompt += `\nFormat as a structured report with clear sections and subsections.`;

    return prompt;
  }

  private parseAnalysisResponse(response: string, data: any, options?: any, startTime?: number): any {
    const elapsed = startTime ? Date.now() - startTime : 0;
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        ...parsed,
        confidence: parsed.confidence || 0.85,
        processingTime: elapsed
      };
    } catch {
      // Fallback to text parsing
      return {
        summary: response.split('\n\n')[0] || 'Analysis completed',
        keyInsights: response.split('\n').filter(line => line.startsWith('-')).slice(0, 5),
        statistics: {},
        recommendations: response.split('\n').filter(line => line.includes('recommend')).slice(0, 3),
        confidence: 0.8,
        processingTime: elapsed
      };
    }
  }

  private parseReportResponse(response: string, options?: any, startTime?: number): any {
    const elapsed = startTime ? Date.now() - startTime : 0;
    // Parse the report response into structured format
    const sections = response.split('\n## ').map(section => {
      const lines = section.split('\n');
      const title = lines[0].replace(/^#+\s*/, '');
      const content = lines.slice(1).join('\n');
      return { title, content };
    });

    return {
      title: sections[0]?.title || 'Analysis Report',
      summary: sections.find(s => s.title.toLowerCase().includes('summary'))?.content || '',
      sections: sections.slice(1),
      keyFindings: sections.find(s => s.title.toLowerCase().includes('finding'))?.content?.split('\n- ') || [],
      recommendations: sections.find(s => s.title.toLowerCase().includes('recommend'))?.content?.split('\n- ') || [],
      metadata: {
        reportType: options?.reportType || 'comprehensive',
        audience: options?.audience || 'analysts',
        generatedAt: new Date().toISOString(),
        dataSource: 'analysis'
      },
      processingTime: elapsed
    };
  }

  private generateCacheKey(data: any, options?: any): string {
    return `${JSON.stringify(data).slice(0, 100)}-${JSON.stringify(options || {})}`;
  }
}