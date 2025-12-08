import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { AnalysisAgentInterface } from '../core/multiagent/workflow_types';

/**
 * AnalysisAgent specializes in analyzing data and generating reports
 */
export class AnalysisAgent extends BaseAgent implements AnalysisAgentInterface {
  constructor(name: string, config: AgentConfig) {
    super({ ...config, name });
  }

  async analyzeData(data: any): Promise<{
    insights: string[];
    trends: string[];
    recommendations: string[];
    confidence: number;
    processingTime: number;
  }> {
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
        maxTokens: 2000
      });

      this.updateStatus('idle');

      return {
        insights: response.split('\n').filter(line => line.startsWith('-')),
        trends: response.split('\n').filter(line => line.startsWith('*')),
        recommendations: response.split('\n').filter(line => line.startsWith('>')),
        confidence: 0.9,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async generateReport(data: any, format: 'text' | 'json' | 'markdown'): Promise<string> {
    this.updateStatus('busy');
    const startTime = Date.now();

    try {
      const prompt = `Generate a ${format} report from the following data:
      
      ${JSON.stringify(data, null, 2)}`;

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.7,
        maxTokens: 2000
      });

      this.updateStatus('idle');

      return response;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
} 