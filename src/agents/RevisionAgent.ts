import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';

export class RevisionAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async reviseContent(reviewData: any) {
    const prompt = `Revise the content based on the following review feedback:

    REVIEW FEEDBACK:
    ${JSON.stringify(reviewData, null, 2)}

    Please:
    1. Address all feedback points
    2. Maintain content quality and coherence
    3. Ensure smooth transitions
    4. Preserve key information
    5. Enhance clarity and readability`;

    const response = await this.openAIClient.generateResponse(prompt, {
      model: this.config.preferredModel || 'o3-mini',
      temperature: 0.7,
      maxTokens: 4000
    });

    return {
      revisedContent: response,
      timestamp: new Date().toISOString(),
      processingTime: Date.now()
    };
  }
} 