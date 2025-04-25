"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
/**
 * AnalysisAgent specializes in analyzing data and generating reports
 */
class AnalysisAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
    }
    async analyzeData(data) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Analyze the following data and provide:
      1. Key insights
      2. Emerging trends
      3. Recommendations
      
      Data:
      ${JSON.stringify(data, null, 2)}`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            return {
                insights: response.split('\n').filter(line => line.startsWith('-')),
                trends: response.split('\n').filter(line => line.startsWith('*')),
                recommendations: response.split('\n').filter(line => line.startsWith('>')),
                confidence: 0.9,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async generateReport(data, format) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Generate a ${format} report from the following data:
      
      ${JSON.stringify(data, null, 2)}`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            return response;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
}
exports.AnalysisAgent = AnalysisAgent;
//# sourceMappingURL=AnalysisAgent.js.map