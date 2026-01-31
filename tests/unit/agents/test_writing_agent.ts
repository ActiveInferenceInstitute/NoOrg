import { expect } from 'chai';
import { WritingAgent } from '../../../src/agents/WritingAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('WritingAgent', () => {
  let writingAgent: WritingAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAIClient = {
      generateResponse: async (prompt: string, options?: any) => {
        return `Mock writing response for: ${prompt.substring(0, 50)}...\n\nSection one content about the topic.\n\nSection two with more details and analysis.\n\nSection three wrapping up the content with conclusions.`;
      }
    };

    // Mock SharedState manager
    mockSharedState = {
      setState: (path: string, value: any) => {},
      getState: (path: string) => undefined,
      subscribe: (path: string, callback: Function) => 'mock-subscription-id',
      unsubscribe: (id: string) => {},
      registerAgent: async (name: string, agentInfo: any) => true,
      updateAgentStatus: async (name: string, status: string) => {}
    };

    // Create agent
    writingAgent = new WritingAgent('Test Writing Agent', {
      id: 'test-writing-agent',
      name: 'Test Writing Agent',
      type: 'writing',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager
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
      await writingAgent.initialize();
      const info = writingAgent.getAgentInfo();
      expect(info.status).to.equal('idle');
      expect(info.name).to.equal('Test Writing Agent');
    });

    it('should set status to idle after initialization', async () => {
      await writingAgent.initialize();
      expect(writingAgent.getAgentInfo().status).to.equal('idle');
    });

    it('should register with shared state on initialization', async () => {
      let registeredName: string | null = null;
      mockSharedState.registerAgent = async (name: string, agentInfo: any) => {
        registeredName = name;
        return true;
      };

      await writingAgent.initialize();
      expect(registeredName).to.equal('Test Writing Agent');
    });
  });

  describe('writeContent', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should write content for a given topic and outline', async () => {
      const topic = 'Artificial Intelligence in Healthcare';
      const outline = ['Introduction', 'Current Applications', 'Future Trends', 'Conclusion'];
      const style = 'professional';

      const result = await writingAgent.writeContent(topic, outline, style);

      expect(result).to.have.property('content');
      expect(result).to.have.property('sections');
      expect(result).to.have.property('metadata');
      expect(typeof result.content).to.equal('string');
      expect(result.content.length).to.be.greaterThan(0);
      expect(Array.isArray(result.sections)).to.be.true;
      expect(result.sections.length).to.be.greaterThan(0);
    });

    it('should include metadata with word count, reading time, and keywords', async () => {
      const result = await writingAgent.writeContent(
        'Cloud Computing',
        ['Overview', 'Benefits'],
        'technical'
      );

      expect(result.metadata).to.have.property('wordCount');
      expect(result.metadata).to.have.property('readingTime');
      expect(result.metadata).to.have.property('keywords');
      expect(result.metadata.wordCount).to.be.a('number');
      expect(result.metadata.wordCount).to.be.greaterThan(0);
      expect(result.metadata.readingTime).to.be.a('number');
      expect(result.metadata.readingTime).to.be.greaterThan(0);
      expect(Array.isArray(result.metadata.keywords)).to.be.true;
    });

    it('should calculate reading time based on 200 words per minute', async () => {
      // Mock a response with a known word count
      mockOpenAIClient.generateResponse = async () => {
        // Generate roughly 400 words (should be 2 minutes reading time)
        return Array(400).fill('word').join(' ');
      };

      const result = await writingAgent.writeContent(
        'Test Topic',
        ['Section 1'],
        'casual'
      );

      expect(result.metadata.readingTime).to.equal(Math.ceil(result.metadata.wordCount / 200));
    });

    it('should use default professional style when none specified', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Mock response content.\n\nSecond paragraph.';
      };

      await writingAgent.writeContent('Test Topic', ['Intro']);
      expect(capturedPrompt).to.include('Style: professional');
    });

    it('should pass custom style to the prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Mock response content.\n\nSecond paragraph.';
      };

      await writingAgent.writeContent('Test Topic', ['Intro'], 'casual');
      expect(capturedPrompt).to.include('Style: casual');
    });

    it('should include all outline items in the prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Mock response.\n\nContent here.';
      };

      const outline = ['Introduction', 'Main Body', 'Conclusion'];
      await writingAgent.writeContent('Test', outline);

      outline.forEach(item => {
        expect(capturedPrompt).to.include(item);
      });
    });

    it('should throw error for empty topic', async () => {
      try {
        await writingAgent.writeContent('', ['Intro'], 'professional');
        expect.fail('Should have thrown error for empty topic');
      } catch (error: any) {
        expect(error.message).to.include('topic must not be empty');
      }
    });

    it('should throw error for whitespace-only topic', async () => {
      try {
        await writingAgent.writeContent('   ', ['Intro'], 'professional');
        expect.fail('Should have thrown error for whitespace topic');
      } catch (error: any) {
        expect(error.message).to.include('topic must not be empty');
      }
    });

    it('should throw error for empty outline', async () => {
      try {
        await writingAgent.writeContent('Valid Topic', [], 'professional');
        expect.fail('Should have thrown error for empty outline');
      } catch (error: any) {
        expect(error.message).to.include('outline must have at least one item');
      }
    });

    it('should throw error for null outline', async () => {
      try {
        await writingAgent.writeContent('Valid Topic', null as any, 'professional');
        expect.fail('Should have thrown error for null outline');
      } catch (error: any) {
        expect(error.message).to.include('outline must have at least one item');
      }
    });

    it('should set status to busy during processing and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await writingAgent.writeContent('Topic', ['Outline'], 'professional');

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      // The last status should be idle
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should handle different writing styles', async () => {
      const styles = ['professional', 'casual', 'academic', 'creative', 'technical'];

      for (const style of styles) {
        const result = await writingAgent.writeContent('Test Topic', ['Intro'], style);
        expect(result.content).to.be.a('string');
        expect(result.content.length).to.be.greaterThan(0);
      }
    });

    it('should split response into sections by double newline', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'First section content.\n\nSecond section content.\n\nThird section content.';
      };

      const result = await writingAgent.writeContent('Topic', ['S1', 'S2', 'S3']);
      expect(result.sections).to.have.length(3);
      expect(result.sections[0]).to.equal('First section content.');
      expect(result.sections[1]).to.equal('Second section content.');
      expect(result.sections[2]).to.equal('Third section content.');
    });

    it('should filter out empty sections from response', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Content.\n\n\n\nMore content.';
      };

      const result = await writingAgent.writeContent('Topic', ['S1']);
      result.sections.forEach(section => {
        expect(section.trim().length).to.be.greaterThan(0);
      });
    });
  });

  describe('writeContent - keyword extraction', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should extract keywords from content', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Machine learning algorithms provide powerful tools for data analysis.\n\nDeep learning networks excel at pattern recognition tasks.\n\nNeural networks transform modern computing approaches.';
      };

      const result = await writingAgent.writeContent('ML', ['Intro']);
      expect(result.metadata.keywords).to.be.an('array');
      expect(result.metadata.keywords.length).to.be.greaterThan(0);
    });

    it('should exclude stop words from keywords', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'The technology is advancing rapidly.\n\nThis development has significant impact.';
      };

      const result = await writingAgent.writeContent('Tech', ['Intro']);
      const stopWords = ['the', 'is', 'and', 'of', 'to', 'in', 'that', 'have', 'for', 'not', 'on', 'with', 'as', 'you', 'do', 'at'];
      result.metadata.keywords.forEach(keyword => {
        expect(stopWords).to.not.include(keyword);
      });
    });

    it('should exclude short words (3 characters or less) from keywords', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Big data sets are key for new artificial intelligence systems.\n\nMore content here today.';
      };

      const result = await writingAgent.writeContent('Data', ['Intro']);
      result.metadata.keywords.forEach(keyword => {
        expect(keyword.length).to.be.greaterThan(3);
      });
    });

    it('should return at most 10 keywords', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Quantum computing revolutionizes cryptographic algorithms through mathematical transformations involving computational complexity theoretical foundations distributed networking protocols infrastructure architecture optimization performance benchmarking evaluation methodologies.\n\nAdditional paragraph content.';
      };

      const result = await writingAgent.writeContent('Quantum', ['Intro']);
      expect(result.metadata.keywords.length).to.be.at.most(10);
    });

    it('should sort keywords by frequency (most frequent first)', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Machine learning uses machine algorithms. Machine processing enables machine intelligence.\n\nAlgorithms power modern systems.';
      };

      const result = await writingAgent.writeContent('ML', ['Intro']);
      // 'machine' should appear first since it occurs most frequently
      if (result.metadata.keywords.length > 0) {
        expect(result.metadata.keywords[0]).to.equal('machine');
      }
    });
  });

  describe('editContent', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should edit content with specified changes', async () => {
      const content = 'Original article about technology and innovation.';
      const changes = ['Make the tone more formal', 'Add statistics'];

      const result = await writingAgent.editContent(content, changes);

      expect(typeof result).to.equal('string');
      expect(result.length).to.be.greaterThan(0);
    });

    it('should pass content and changes to the prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Edited content.';
      };

      const content = 'Sample content to edit.';
      const changes = ['Fix grammar', 'Improve flow'];

      await writingAgent.editContent(content, changes);

      expect(capturedPrompt).to.include('Sample content to edit.');
      expect(capturedPrompt).to.include('Fix grammar');
      expect(capturedPrompt).to.include('Improve flow');
    });

    it('should return trimmed response', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return '  Edited content with whitespace.  ';
      };

      const result = await writingAgent.editContent('Content', ['Change']);
      expect(result).to.equal('Edited content with whitespace.');
    });

    it('should throw error for empty content', async () => {
      try {
        await writingAgent.editContent('', ['Fix grammar']);
        expect.fail('Should have thrown error for empty content');
      } catch (error: any) {
        expect(error.message).to.include('content must not be empty');
      }
    });

    it('should throw error for whitespace-only content', async () => {
      try {
        await writingAgent.editContent('   ', ['Fix grammar']);
        expect.fail('Should have thrown error for whitespace content');
      } catch (error: any) {
        expect(error.message).to.include('content must not be empty');
      }
    });

    it('should throw error for empty changes array', async () => {
      try {
        await writingAgent.editContent('Valid content', []);
        expect.fail('Should have thrown error for empty changes');
      } catch (error: any) {
        expect(error.message).to.include('changes must have at least one item');
      }
    });

    it('should throw error for null changes', async () => {
      try {
        await writingAgent.editContent('Valid content', null as any);
        expect.fail('Should have thrown error for null changes');
      } catch (error: any) {
        expect(error.message).to.include('changes must have at least one item');
      }
    });

    it('should set status to busy during editing and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await writingAgent.editContent('Content to edit', ['Make changes']);

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should handle multiple changes', async () => {
      const changes = [
        'Fix spelling errors',
        'Improve sentence structure',
        'Add transition words',
        'Enhance vocabulary',
        'Adjust paragraph breaks'
      ];

      const result = await writingAgent.editContent('Content to improve.', changes);
      expect(typeof result).to.equal('string');
      expect(result.length).to.be.greaterThan(0);
    });
  });

  describe('generateContent', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should generate content for a topic with requirements', async () => {
      const topic = 'Sustainable Energy';
      const requirements = ['Include solar and wind power', 'Discuss cost effectiveness'];

      const result = await writingAgent.generateContent(topic, requirements);

      expect(result).to.have.property('content');
      expect(result).to.have.property('metadata');
      expect(typeof result.content).to.equal('string');
      expect(result.content.length).to.be.greaterThan(0);
    });

    it('should include metadata with wordCount, sections, and keywords', async () => {
      const result = await writingAgent.generateContent(
        'Blockchain Technology',
        ['Explain consensus mechanisms']
      );

      expect(result.metadata).to.have.property('wordCount');
      expect(result.metadata).to.have.property('sections');
      expect(result.metadata).to.have.property('keywords');
      expect(result.metadata.wordCount).to.be.a('number');
      expect(result.metadata.wordCount).to.be.greaterThan(0);
      expect(Array.isArray(result.metadata.sections)).to.be.true;
      expect(Array.isArray(result.metadata.keywords)).to.be.true;
    });

    it('should pass requirements to the prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Generated content.\n\nMore content.';
      };

      const requirements = ['Must include examples', 'Target audience: beginners'];
      await writingAgent.generateContent('Topic', requirements);

      requirements.forEach(req => {
        expect(capturedPrompt).to.include(req);
      });
    });

    it('should return trimmed content', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return '  Generated content with padding.  \n\n  Second section.  ';
      };

      const result = await writingAgent.generateContent('Topic', ['Req']);
      expect(result.content).to.not.match(/^\s/);
      expect(result.content).to.not.match(/\s$/);
    });

    it('should set status to busy during generation and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await writingAgent.generateContent('Topic', ['Requirements']);

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should handle complex requirements', async () => {
      const requirements = [
        'Include real-world case studies',
        'Discuss pros and cons',
        'Provide actionable recommendations',
        'Use data-driven arguments',
        'Include an executive summary'
      ];

      const result = await writingAgent.generateContent('Digital Transformation', requirements);
      expect(result.content).to.be.a('string');
      expect(result.content.length).to.be.greaterThan(0);
    });

    it('should split sections by double newline', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Part one.\n\nPart two.\n\nPart three.';
      };

      const result = await writingAgent.generateContent('Topic', ['Req']);
      expect(result.metadata.sections).to.have.length(3);
    });

    it('should extract keywords from generated content', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Artificial intelligence transforms healthcare delivery through advanced diagnostics.\n\nHealthcare providers leverage technology for patient outcomes.';
      };

      const result = await writingAgent.generateContent('AI Healthcare', ['Intro']);
      expect(result.metadata.keywords).to.be.an('array');
      expect(result.metadata.keywords.length).to.be.greaterThan(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should handle OpenAI API errors in writeContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('OpenAI API Error');
      };

      try {
        await writingAgent.writeContent('Topic', ['Outline']);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('OpenAI API Error');
      }
    });

    it('should handle OpenAI API errors in editContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API rate limit exceeded');
      };

      try {
        await writingAgent.editContent('Content', ['Changes']);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('API rate limit exceeded');
      }
    });

    it('should handle OpenAI API errors in generateContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('Network timeout');
      };

      try {
        await writingAgent.generateContent('Topic', ['Req']);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Network timeout');
      }
    });

    it('should set status to error when API call fails in writeContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await writingAgent.writeContent('Topic', ['Outline']);
      } catch (error: any) {
        // Expected
      }

      expect(writingAgent.getAgentInfo().status).to.equal('error');
    });

    it('should set status to error when API call fails in editContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await writingAgent.editContent('Content', ['Changes']);
      } catch (error: any) {
        // Expected
      }

      expect(writingAgent.getAgentInfo().status).to.equal('error');
    });

    it('should set status to error when API call fails in generateContent', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await writingAgent.generateContent('Topic', ['Req']);
      } catch (error: any) {
        // Expected
      }

      expect(writingAgent.getAgentInfo().status).to.equal('error');
    });

    it('should store last error in agent info after failure', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('Specific error message');
      };

      try {
        await writingAgent.writeContent('Topic', ['Outline']);
      } catch (error: any) {
        // Expected
      }

      const info = writingAgent.getAgentInfo();
      expect(info.lastError).to.not.be.null;
      expect(info.lastError!.message).to.equal('Specific error message');
    });

    it('should handle network timeouts gracefully', async () => {
      mockOpenAIClient.generateResponse = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Request timed out');
      };

      try {
        await writingAgent.writeContent('Topic', ['Outline']);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Request timed out');
      }
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await writingAgent.initialize();

      const info = writingAgent.getAgentInfo();

      expect(info.name).to.equal('Test Writing Agent');
      expect(info.type).to.equal('WritingAgent');
      expect(info.status).to.equal('idle');
    });

    it('should track status transitions during operations', async () => {
      await writingAgent.initialize();

      // Status should be idle initially
      expect(writingAgent.getAgentInfo().status).to.equal('idle');

      // Perform an operation
      await writingAgent.writeContent('Topic', ['Outline']);

      // Status should return to idle after operation
      expect(writingAgent.getAgentInfo().status).to.equal('idle');
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await writingAgent.initialize();
    });

    it('should complete writeContent within reasonable time', async () => {
      const startTime = Date.now();
      await writingAgent.writeContent('Test Topic', ['Intro', 'Body', 'Conclusion']);
      const duration = Date.now() - startTime;

      expect(duration).to.be.below(10000);
    });

    it('should handle concurrent writeContent requests', async () => {
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(writingAgent.writeContent(`Topic ${i}`, [`Section ${i}`]));
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.have.property('content');
        expect(result).to.have.property('sections');
        expect(result).to.have.property('metadata');
      });
    });

    it('should handle large outlines', async () => {
      const outline = Array.from({ length: 20 }, (_, i) => `Section ${i + 1}`);

      const result = await writingAgent.writeContent('Comprehensive Guide', outline);
      expect(result).to.be.an('object');
      expect(result.content).to.be.a('string');
    });

    it('should handle concurrent editContent requests', async () => {
      const requests = [];

      for (let i = 0; i < 3; i++) {
        requests.push(writingAgent.editContent(`Content ${i}`, [`Change ${i}`]));
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(3);
      results.forEach(result => {
        expect(result).to.be.a('string');
      });
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

    it('should set status to offline on shutdown', async () => {
      await writingAgent.initialize();
      await writingAgent.shutdown();
      expect(writingAgent.getAgentInfo().status).to.equal('offline');
    });
  });
});
