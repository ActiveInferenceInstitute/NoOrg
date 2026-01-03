"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
const Logger_1 = require("../core/multiagent/Logger");
/**
 * AnalysisAgent specializes in analyzing datasets, extracting insights,
 * creating visualizations, and generating statistical reports.
 */
class AnalysisAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
        Object.defineProperty(this, "analysisCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = new Logger_1.Logger(`AnalysisAgent-${name}`, 'info');
    }
    async analyzeData(data, options) {
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
            const result = this.parseAnalysisResponse(response, data, options);
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
        }
        catch (error) {
            this.logger.error('Data analysis failed', {
                error: error.message,
                processingTime: Date.now() - startTime,
                analysisType: options?.analysisType
            });
            this.handleError(error);
            throw error;
        }
    }
    async generateReport(data, options) {
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
            const result = this.parseReportResponse(response, options);
            this.updateStatus('idle');
            return result;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    buildAnalysisPrompt(data, options) {
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
        if (options?.includeTrends)
            prompt += `4. Trend analysis\n`;
        if (options?.includeCorrelations)
            prompt += `5. Correlation analysis\n`;
        if (options?.includeOutliers)
            prompt += `6. Outlier detection\n`;
        if (options?.includeVisualizationSuggestions)
            prompt += `7. Visualization recommendations\n`;
        if (options?.includeStatisticalTests)
            prompt += `8. Statistical test results\n`;
        if (options?.includeRecommendations)
            prompt += `9. Recommendations\n`;
        prompt += `\nFormat the response as a structured JSON object.`;
        return prompt;
    }
    buildReportPrompt(data, options) {
        const reportType = options?.reportType || 'comprehensive';
        const audience = options?.audience || 'analysts';
        let prompt = `Generate a ${reportType} report for ${audience} based on the following data:\n\n`;
        prompt += `Data:\n${JSON.stringify(data, null, 2)}\n\n`;
        prompt += `Report Requirements:\n`;
        if (options?.includeExecutiveSummary)
            prompt += `- Include executive summary\n`;
        if (options?.includeMethodology)
            prompt += `- Include methodology section\n`;
        if (options?.includeVisualizations)
            prompt += `- Include visualization recommendations\n`;
        if (options?.includeRecommendations)
            prompt += `- Include detailed recommendations\n`;
        prompt += `\nFormat as a structured report with clear sections and subsections.`;
        return prompt;
    }
    parseAnalysisResponse(response, data, options) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(response);
            return {
                ...parsed,
                confidence: parsed.confidence || 0.85,
                processingTime: Date.now() - Date.now() // This will be overridden
            };
        }
        catch {
            // Fallback to text parsing
            return {
                summary: response.split('\n\n')[0] || 'Analysis completed',
                keyInsights: response.split('\n').filter(line => line.startsWith('-')).slice(0, 5),
                statistics: {},
                recommendations: response.split('\n').filter(line => line.includes('recommend')).slice(0, 3),
                confidence: 0.8,
                processingTime: Date.now() - Date.now()
            };
        }
    }
    parseReportResponse(response, options) {
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
            keyFindings: sections.find(s => s.title.toLowerCase().includes('finding'))?.content.split('\n- ') || [],
            recommendations: sections.find(s => s.title.toLowerCase().includes('recommend'))?.content.split('\n- ') || [],
            metadata: {
                reportType: options?.reportType || 'comprehensive',
                audience: options?.audience || 'analysts',
                generatedAt: new Date().toISOString(),
                dataSource: 'analysis'
            },
            processingTime: Date.now() - Date.now()
        };
    }
    generateCacheKey(data, options) {
        return `${JSON.stringify(data).slice(0, 100)}-${JSON.stringify(options || {})}`;
    }
}
exports.AnalysisAgent = AnalysisAgent;
//# sourceMappingURL=AnalysisAgent.js.map