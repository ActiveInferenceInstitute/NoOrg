import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { PlanningAgentInterface } from '../core/multiagent/workflow_types';

/**
 * PlanningAgent specializes in creating and validating plans
 */
export class PlanningAgent extends BaseAgent implements PlanningAgentInterface {
  constructor(name: string, config: AgentConfig) {
    super({ ...config, name });
  }

  async createPlan(topic: string, requirements: string[]): Promise<{
    outline: string[];
    milestones: string[];
    dependencies: string[];
    timeline: string;
  }> {
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
        maxTokens: 2000
      });

      this.updateStatus('idle');

      return {
        outline: response.split('\n').filter(line => line.startsWith('1.')),
        milestones: response.split('\n').filter(line => line.startsWith('2.')),
        dependencies: response.split('\n').filter(line => line.startsWith('3.')),
        timeline: response.split('\n').filter(line => line.startsWith('4.'))[0] || ''
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async validatePlan(plan: any): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
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
        maxTokens: 2000
      });

      this.updateStatus('idle');

      return {
        isValid: response.toLowerCase().includes('yes'),
        issues: response.split('\n').filter(line => line.startsWith('2.')),
        suggestions: response.split('\n').filter(line => line.startsWith('3.'))
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
} 