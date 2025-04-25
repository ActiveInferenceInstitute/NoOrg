"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
/**
 * ReviewAgent specializes in content review and feedback
 */
class ReviewAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
    }
    async reviewContent(content, criteria) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Review the following content based on criteria:
      
      Content:
      ${content}
      
      Criteria:
      ${criteria.map(item => `- ${item}`).join('\n')}
      
      Please provide:
      1. Quality score (1-10)
      2. Specific feedback points
      3. Improvement suggestions`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n');
            const scoreMatch = sections[0]?.match(/\d+/);
            const score = scoreMatch ? parseInt(scoreMatch[0]) : 5;
            const feedback = sections[1]?.split('\n').filter(line => line.trim()) || [];
            const improvements = sections[2]?.split('\n').filter(line => line.trim()) || [];
            return {
                score,
                feedback,
                improvements,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async validateContent(content, rules) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Validate the following content against rules:
      
      Content:
      ${content}
      
      Rules:
      ${rules.map(item => `- ${item}`).join('\n')}
      
      Please provide:
      1. Is the content valid? (Yes/No)
      2. Any rule violations
      3. Suggestions for improvement`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n');
            const isValid = sections[0]?.toLowerCase().includes('yes') || false;
            const violations = sections[1]?.split('\n').filter(line => line.trim()) || [];
            const suggestions = sections[2]?.split('\n').filter(line => line.trim()) || [];
            return {
                isValid,
                violations,
                suggestions
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
}
exports.ReviewAgent = ReviewAgent;
//# sourceMappingURL=ReviewAgent.js.map