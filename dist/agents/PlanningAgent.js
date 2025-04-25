"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
/**
 * PlanningAgent specializes in creating and validating plans
 */
class PlanningAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
    }
    async createPlan(topic, requirements) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Create a detailed plan for: ${topic}
      
      Requirements:
      ${requirements.map(req => `- ${req}`).join('\n')}
      
      Please provide:
      1. Detailed outline
      2. Key milestones
      3. Dependencies
      4. Timeline`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            return {
                outline: response.split('\n').filter(line => line.startsWith('1.')),
                milestones: response.split('\n').filter(line => line.startsWith('2.')),
                dependencies: response.split('\n').filter(line => line.startsWith('3.')),
                timeline: response.split('\n').filter(line => line.startsWith('4.'))[0] || ''
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async validatePlan(plan) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Validate the following plan:
      
      ${JSON.stringify(plan, null, 2)}
      
      Please provide:
      1. Is the plan valid? (Yes/No)
      2. Any issues found
      3. Suggestions for improvement`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            return {
                isValid: response.toLowerCase().includes('yes'),
                issues: response.split('\n').filter(line => line.startsWith('2.')),
                suggestions: response.split('\n').filter(line => line.startsWith('3.'))
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
}
exports.PlanningAgent = PlanningAgent;
//# sourceMappingURL=PlanningAgent.js.map