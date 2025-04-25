import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { WritingAgentInterface } from '../core/multiagent/workflow_types';

/**
 * WritingAgent specializes in content creation and editing
 */
export class WritingAgent extends BaseAgent implements WritingAgentInterface {
  constructor(name: string, config: AgentConfig) {
    super({ ...config, name });
  }

  async writeContent(topic: string, outline: string[], style: string = 'professional'): Promise<{
    content: string;
    sections: string[];
    metadata: {
      wordCount: number;
      readingTime: number;
      keywords: string[];
    };
  }> {
    this.updateStatus('busy');
    const startTime = Date.now();

    try {
      const prompt = `Write content for: ${topic}
      
      Outline:
      ${outline.map(item => `- ${item}`).join('\n')}
      
      Style: ${style}
      
      Please provide:
      1. Main content
      2. Section breakdown
      3. Metadata (word count, reading time, keywords)`;

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.7,
        max_tokens: 2000
      });

      this.updateStatus('idle');

      const sections = response.split('\n\n').filter(section => section.trim());
      const wordCount = sections.join(' ').split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

      return {
        content: sections.join('\n\n'),
        sections,
        metadata: {
          wordCount,
          readingTime,
          keywords: this.extractKeywords(sections.join(' '))
        }
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async editContent(content: string, changes: string[]): Promise<string> {
    this.updateStatus('busy');
    const startTime = Date.now();

    try {
      const prompt = `Edit the following content based on changes:
      
      Content:
      ${content}
      
      Changes:
      ${changes.map(item => `- ${item}`).join('\n')}
      
      Please provide the edited content.`;

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.7,
        max_tokens: 2000
      });

      this.updateStatus('idle');
      return response.trim();
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async generateContent(topic: string, requirements: string[]): Promise<{
    content: string;
    metadata: {
      wordCount: number;
      sections: string[];
      keywords: string[];
    };
  }> {
    this.updateStatus('busy');
    const startTime = Date.now();

    try {
      const prompt = `Generate content for: ${topic}
      
      Requirements:
      ${requirements.map(item => `- ${item}`).join('\n')}
      
      Please provide comprehensive content that meets the requirements.`;

      const response = await this.openAIClient.generateResponse(prompt, {
        model: this.config.preferredModel || 'o3-mini',
        temperature: 0.7,
        max_tokens: 2000
      });

      this.updateStatus('idle');

      const sections = response.split('\n\n').filter(section => section.trim());
      const wordCount = sections.join(' ').split(/\s+/).length;

      return {
        content: response.trim(),
        metadata: {
          wordCount,
          sections,
          keywords: this.extractKeywords(sections.join(' '))
        }
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP libraries
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
    const wordFreq = new Map<string, number>();

    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
} 