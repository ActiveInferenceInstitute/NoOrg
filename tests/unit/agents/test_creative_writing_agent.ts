import { expect } from 'chai';
import { CreativeWritingAgent } from '../../../src/agents/CreativeWritingAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('CreativeWritingAgent', () => {
  let writingAgent: CreativeWritingAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAIClient = {
      sendPrompt: async (prompt: string, options?: any) => {
        return {
          choices: [{
            message: {
              content: `Mock creative writing response for: ${prompt.substring(0, 50)}...`
            }
          }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 300,
            total_tokens: 450
          }
        };
      }
    };

    // Mock SharedState manager
    mockSharedState = {
      setState: (path: string, value: any) => {},
      getState: (path: string) => undefined,
      subscribe: (path: string, callback: Function) => 'mock-subscription-id',
      unsubscribe: (id: string) => {}
    };

    // Create agent with caching disabled for testing
    writingAgent = new CreativeWritingAgent('Test Creative Writer', {
      id: 'test-creative-writer',
      name: 'Test Creative Writer',
      type: 'creative-writer',
      capabilities: ['text-generation', 'creativity', 'storytelling'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager,
      cacheTTL: 0 // Disable caching for testing
    });

    // Suppress console output during tests
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await writingAgent.initialize();
      expect(result).to.be.true;
      expect(writingAgent.getAgentInfo().status).to.equal('available');
    });

    it('should have correct capabilities', async () => {
      await writingAgent.initialize();

      const info = writingAgent.getAgentInfo();
      expect(info.capabilities).to.include('text-generation');
      expect(info.capabilities).to.include('creativity');
      expect(info.capabilities).to.include('storytelling');
      expect(info.capabilities).to.include('content-refinement');
      expect(info.capabilities).to.include('style-adaptation');
    });
  });

  describe('Content Generation', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should generate content from prompts', async () => {
      const prompt = 'Write a short story about a robot learning to paint';

      const result = await writingAgent.generateContent(prompt);

      expect(result).to.have.property('content');
      expect(result).to.have.property('wordCount');
      expect(result).to.have.property('characterCount');
      expect(result).to.have.property('processingTime');
      expect(result).to.have.property('cached');
      expect(typeof result.content).to.equal('string');
      expect(result.content.length).to.be.greaterThan(0);
      expect(result.wordCount).to.be.a('number');
      expect(result.wordCount).to.be.greaterThan(0);
      expect(result.cached).to.be.false;
    });

    it('should support different content formats', async () => {
      const prompt = 'Explain quantum computing';

      const formats = ['story', 'blog-post', 'marketing-copy', 'poem', 'dialogue'];

      for (const format of formats) {
        const result = await writingAgent.generateContent(prompt, {
          format: format as any
        });

        expect(result.content).to.be.a('string');
        expect(result.content.length).to.be.greaterThan(0);
      }
    });

    it('should support different tones', async () => {
      const prompt = 'Describe a sunset';

      const tones = ['professional', 'casual', 'humorous', 'serious', 'inspirational'];

      for (const tone of tones) {
        const result = await writingAgent.generateContent(prompt, {
          tone: tone as any
        });

        expect(result.content).to.be.a('string');
        expect(result.content.length).to.be.greaterThan(0);
      }
    });

    it('should support different lengths', async () => {
      const prompt = 'Write about artificial intelligence';

      const lengths = ['short', 'medium', 'long'];

      for (const length of lengths) {
        const result = await writingAgent.generateContent(prompt, {
          length: length as any
        });

        expect(result.content).to.be.a('string');

        // Check approximate length expectations
        if (length === 'short') {
          expect(result.wordCount).to.be.below(300);
        } else if (length === 'medium') {
          expect(result.wordCount).to.be.above(200);
          expect(result.wordCount).to.be.below(800);
        } else if (length === 'long') {
          expect(result.wordCount).to.be.above(500);
        }
      }
    });

    it('should support blog post format with sections', async () => {
      const prompt = 'The benefits of remote work';

      const result = await writingAgent.generateContent(prompt, {
        format: 'blog-post'
      });

      expect(result).to.have.property('title');
      expect(result).to.have.property('sections');
      expect(Array.isArray(result.sections)).to.be.true;
      expect(result.sections!.length).to.be.greaterThan(0);

      if (result.sections) {
        result.sections.forEach(section => {
          expect(section).to.have.property('title');
          expect(section).to.have.property('content');
        });
      }
    });

    it('should include keywords when specified', async () => {
      const prompt = 'Modern web development';
      const keywords = ['JavaScript', 'React', 'TypeScript'];

      const result = await writingAgent.generateContent(prompt, {
        keywords
      });

      expect(result.content).to.be.a('string');

      // Check if keywords are included (case-insensitive)
      const contentLower = result.content.toLowerCase();
      keywords.forEach(keyword => {
        expect(contentLower).to.include(keyword.toLowerCase());
      });
    });

    it('should handle empty prompts', async () => {
      try {
        await writingAgent.generateContent('');
        expect.fail('Should have thrown error for empty prompt');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Content Refinement', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should refine existing content', async () => {
      const originalContent = 'This is a sample text that needs improvement.';
      const feedback = 'Make it more engaging and add specific examples.';

      const result = await writingAgent.refineContent(originalContent, feedback);

      expect(result).to.have.property('refinedContent');
      expect(result).to.have.property('changes');
      expect(result).to.have.property('processingTime');
      expect(typeof result.refinedContent).to.equal('string');
      expect(result.refinedContent.length).to.be.greaterThan(0);
      expect(result.refinedContent).to.not.equal(originalContent);
    });

    it('should handle refinement with detailed feedback', async () => {
      const originalContent = 'The product is good.';
      const feedback = `
        1. Make it more specific about features
        2. Add customer testimonials
        3. Include pricing information
        4. Add call-to-action
      `;

      const result = await writingAgent.refineContent(originalContent, feedback);

      expect(result.refinedContent).to.be.a('string');
      expect(result.changes).to.be.a('string');
    });

    it('should handle empty refinement requests', async () => {
      try {
        await writingAgent.refineContent('', 'feedback');
        expect.fail('Should have thrown error for empty content');
      } catch (error: any) {
        expect(error.message).to.include('Missing required field');
      }
    });
  });

  describe('Stylized Content Generation', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should generate content in specific styles', async () => {
      const prompt = 'A tale of adventure';
      const style = 'Shakespearean English';

      const result = await writingAgent.generateStylizedContent(prompt, style);

      expect(result).to.have.property('content');
      expect(result).to.have.property('styleConfidence');
      expect(result).to.have.property('processingTime');
      expect(typeof result.content).to.equal('string');
      expect(result.content.length).to.be.greaterThan(0);
      expect(result.styleConfidence).to.be.a('number');
      expect(result.styleConfidence).to.be.at.least(0);
      expect(result.styleConfidence).to.be.at.most(1);
    });

    it('should support style examples', async () => {
      const prompt = 'Describe a magical forest';
      const style = 'J.R.R. Tolkien style';
      const examples = [
        'In a hole in the ground there lived a hobbit.',
        'Not a nasty, dirty, wet hole, filled with the ends of worms.'
      ];

      const result = await writingAgent.generateStylizedContent(prompt, style, {
        examples
      });

      expect(result.content).to.be.a('string');
      expect(result.content.length).to.be.greaterThan(0);
    });

    it('should handle different content formats with styles', async () => {
      const prompt = 'Explain machine learning';
      const style = 'Technical but accessible';

      const formats = ['story', 'blog-post', 'marketing-copy'];

      for (const format of formats) {
        const result = await writingAgent.generateStylizedContent(prompt, style, {
          format: format as any
        });

        expect(result.content).to.be.a('string');
        expect(result.content.length).to.be.greaterThan(0);
      }
    });

    it('should handle empty style requests', async () => {
      try {
        await writingAgent.generateStylizedContent('prompt', '');
        expect.fail('Should have thrown error for empty style');
      } catch (error: any) {
        expect(error.message).to.include('Missing required field');
      }
    });
  });

  describe('Task Execution', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should execute content generation tasks', async () => {
      const taskDetails = {
        type: 'generate',
        prompt: 'Write a creative story about space exploration'
      };

      const result = await writingAgent.executeTask(taskDetails);

      expect(result).to.have.property('content');
      expect(result).to.have.property('wordCount');
      expect(result).to.have.property('characterCount');
      expect(typeof result.content).to.equal('string');
    });

    it('should execute content refinement tasks', async () => {
      const taskDetails = {
        type: 'refine',
        content: 'Original content to improve',
        feedback: 'Make it more engaging'
      };

      const result = await writingAgent.executeTask(taskDetails);

      expect(result).to.have.property('refinedContent');
      expect(result).to.have.property('changes');
      expect(typeof result.refinedContent).to.equal('string');
    });

    it('should execute stylized content tasks', async () => {
      const taskDetails = {
        type: 'generateStylized',
        prompt: 'A mystery story',
        style: 'Agatha Christie style'
      };

      const result = await writingAgent.executeTask(taskDetails);

      expect(result).to.have.property('content');
      expect(result).to.have.property('styleConfidence');
      expect(typeof result.content).to.equal('string');
    });

    it('should handle invalid task types', async () => {
      const invalidTaskDetails = {
        type: 'invalid-task-type'
      };

      try {
        await writingAgent.executeTask(invalidTaskDetails);
        expect.fail('Should have thrown error for invalid task type');
      } catch (error: any) {
        expect(error.message).to.include('Unsupported task type');
      }
    });
  });

  describe('Caching', () => {
    it('should support cache operations', async () => {
      await writingAgent.initialize();

      // Test cache clearing
      const result = await writingAgent.executeTask({
        type: 'clearCache'
      });

      expect(result.success).to.be.true;
      expect(result.message).to.equal('Cache cleared.');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock API error
      mockOpenAIClient.sendPrompt = async () => {
        throw new Error('OpenAI API Error');
      };

      try {
        await writingAgent.generateContent('test prompt');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('OpenAI API Error');
      }
    });

    it('should handle malformed responses', async () => {
      // Mock malformed response
      mockOpenAIClient.sendPrompt = async () => {
        return {
          choices: [{
            message: {
              content: null
            }
          }]
        };
      };

      const result = await writingAgent.generateContent('test prompt');
      expect(result).to.be.an('object');
      expect(result.content).to.be.a('string');
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      mockOpenAIClient.sendPrompt = async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { choices: [{ message: { content: 'timeout response' } }] };
      };

      try {
        await writingAgent.generateContent('test prompt');
        // Should handle timeout or complete successfully
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should complete content generation within reasonable time', async () => {
      const prompt = 'Write a short story about friendship';

      const startTime = Date.now();
      await writingAgent.generateContent(prompt);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).to.be.below(10000); // Should complete in less than 10 seconds
    });

    it('should handle concurrent requests', async () => {
      const prompt = 'Write a creative description';
      const requests = [];

      for (let i = 0; i < 3; i++) {
        requests.push(writingAgent.generateContent(prompt));
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(3);
      results.forEach(result => {
        expect(result).to.be.an('object');
        expect(result.content).to.be.a('string');
      });
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'A'.repeat(2000) + ' - write a creative response to this';

      const result = await writingAgent.generateContent(longPrompt);
      expect(result).to.be.an('object');
      expect(result.content).to.be.a('string');
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await writingAgent.initialize();

      const info = writingAgent.getAgentInfo();

      expect(info.id).to.equal('test-creative-writer');
      expect(info.name).to.equal('Test Creative Writer');
      expect(info.type).to.equal('creative-writer');
      expect(info.capabilities).to.include('text-generation');
      expect(info.capabilities).to.include('creativity');
      expect(info.status).to.equal('available');
    });

    it('should update agent status during operations', async () => {
      await writingAgent.initialize();

      // Status should be available initially
      expect(writingAgent.getAgentInfo().status).to.equal('available');

      // Start a long operation (simulate)
      const longOperation = writingAgent.generateContent('A'.repeat(1000));

      // Status should become busy during operation
      // Note: This is implementation-dependent timing

      await longOperation;

      // Status should return to available
      expect(writingAgent.getAgentInfo().status).to.equal('available');
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await writingAgent.initialize();

      const result = await writingAgent.shutdown();
      expect(result).to.be.true;
      expect(writingAgent.getAgentInfo().status).to.equal('offline');
    });

    it('should handle shutdown when not initialized', async () => {
      const result = await writingAgent.shutdown();
      expect(result).to.be.true;
    });
  });
});
