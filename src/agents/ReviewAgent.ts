import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { ReviewAgentInterface } from '../core/multiagent/workflow_types';

/**
 * ReviewAgent specializes in content review and feedback
 */
export class ReviewAgent extends BaseAgent implements ReviewAgentInterface {
  constructor(name: string, config: AgentConfig) {
    super({ ...config, name });
  }

  async reviewContent(content: string, criteria: string[]): Promise<{
    score: number;
    feedback: string[];
    improvements: string[];
    processingTime: number;
  }> {
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
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async validateContent(content: string, rules: string[]): Promise<{
    isValid: boolean;
    violations: string[];
    suggestions: string[];
  }> {
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
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
} 