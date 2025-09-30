"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalReviewAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
/**
 * FinalReviewAgent specializes in final content review and approval
 */
class FinalReviewAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
    }
    async performFinalReview(content, previousReviews) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Perform final review of the following content, considering previous reviews:
      
      Content:
      ${content}
      
      Previous Reviews:
      ${previousReviews.map(review => JSON.stringify(review, null, 2)).join('\n\n')}
      
      Please provide:
      1. Final approval status (Approved/Not Approved)
      2. Final comments
      3. Final quality score (1-10)`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                maxTokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n');
            const approved = sections[0]?.toLowerCase().includes('approved') || false;
            const comments = sections[1]?.split('\n').filter(line => line.trim()) || [];
            const scoreMatch = sections[2]?.match(/\d+/);
            const finalScore = scoreMatch ? parseInt(scoreMatch[0]) : 5;
            return {
                approved,
                comments,
                finalScore,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async generateFinalReport(content) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Generate a final report for the following content:
      
      Content:
      ${content}
      
      Please provide a comprehensive final report that includes:
      1. Overall assessment
      2. Key findings
      3. Recommendations
      4. Final verdict`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                maxTokens: 2000
            });
            this.updateStatus('idle');
            return response.trim();
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async performFinalCheck(content) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Perform final check of the following content:
      
      Content:
      ${content}
      
      Please provide:
      1. Pass/Fail status
      2. Any issues found
      3. Final recommendations`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                maxTokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n');
            const passed = sections[0]?.toLowerCase().includes('pass') || false;
            const issues = sections[1]?.split('\n').filter(line => line.trim()) || [];
            const recommendations = sections[2]?.split('\n').filter(line => line.trim()) || [];
            return {
                passed,
                issues,
                recommendations,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
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
                maxTokens: 2000
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
                maxTokens: 2000
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
exports.FinalReviewAgent = FinalReviewAgent;
//# sourceMappingURL=FinalReviewAgent.js.map