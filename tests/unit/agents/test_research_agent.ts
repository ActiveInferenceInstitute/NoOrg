import { expect } from 'chai';
import { ResearchAgent } from '../../../src/agents/ResearchAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('ResearchAgent', () => {
  let researchAgent: ResearchAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAIClient = {
      generateResponse: async (prompt: string, options?: any) => {
        return `Mock research response for: ${prompt.substring(0, 50)}...\n\nDetailed findings about the topic.\n\nKey Takeaways:\n- First insight\n- Second insight\n- Third insight`;
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
    researchAgent = new ResearchAgent('Test Research Agent', {
      id: 'test-research-agent',
      name: 'Test Research Agent',
      type: 'research',
      capabilities: ['research', 'information-extraction', 'fact-checking', 'summarization'],
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
      await researchAgent.initialize();
      const info = researchAgent.getAgentInfo();
      expect(info.status).to.equal('idle');
      expect(info.name).to.equal('Test Research Agent');
    });

    it('should set status to idle after initialization', async () => {
      await researchAgent.initialize();
      expect(researchAgent.getAgentInfo().status).to.equal('idle');
    });

    it('should register with shared state on initialization', async () => {
      let registeredName: string | null = null;
      mockSharedState.registerAgent = async (name: string, agentInfo: any) => {
        registeredName = name;
        return true;
      };

      await researchAgent.initialize();
      expect(registeredName).to.equal('Test Research Agent');
    });
  });

  describe('researchTopic', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should research a topic with given scope', async () => {
      const topic = 'Quantum Computing';
      const scope = { aspects: ['hardware', 'algorithms', 'applications'], depth: 'comprehensive' };

      const result = await researchAgent.researchTopic(topic, scope);

      expect(result).to.have.property('topic');
      expect(result).to.have.property('scope');
      expect(result).to.have.property('findings');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('processingTime');
      expect(result.topic).to.equal('Quantum Computing');
      expect(result.scope).to.deep.equal(scope);
    });

    it('should include aspects in the research prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Research findings.';
      };

      const aspects = ['market trends', 'competition', 'technology'];
      await researchAgent.researchTopic('Industry Analysis', { aspects, depth: 'deep' });

      aspects.forEach(aspect => {
        expect(capturedPrompt).to.include(aspect);
      });
    });

    it('should return findings as a string from the LLM response', async () => {
      const expectedResponse = 'Detailed research findings about renewable energy.';
      mockOpenAIClient.generateResponse = async () => expectedResponse;

      const result = await researchAgent.researchTopic('Renewable Energy', {
        aspects: ['solar'],
        depth: 'medium'
      });

      expect(result.findings).to.equal(expectedResponse);
    });

    it('should include ISO timestamp in results', async () => {
      const result = await researchAgent.researchTopic('AI Ethics', {
        aspects: ['bias', 'fairness'],
        depth: 'thorough'
      });

      expect(result.timestamp).to.be.a('string');
      // ISO timestamp pattern
      expect(result.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include processing time in results', async () => {
      const result = await researchAgent.researchTopic('Data Science', {
        aspects: ['tools'],
        depth: 'basic'
      });

      expect(result.processingTime).to.be.a('number');
      expect(result.processingTime).to.be.greaterThan(0);
    });

    it('should set status to busy during research and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await researchAgent.researchTopic('Topic', {
        aspects: ['aspect1'],
        depth: 'basic'
      });

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should handle multiple aspects', async () => {
      const manyAspects = ['technology', 'business', 'social', 'environmental', 'economic', 'legal', 'ethical'];
      const result = await researchAgent.researchTopic('Comprehensive Analysis', {
        aspects: manyAspects,
        depth: 'comprehensive'
      });

      expect(result).to.be.an('object');
      expect(result.findings).to.be.a('string');
    });

    it('should handle different depth levels', async () => {
      const depths = ['basic', 'medium', 'deep', 'comprehensive'];

      for (const depth of depths) {
        const result = await researchAgent.researchTopic('Test', {
          aspects: ['aspect'],
          depth
        });

        expect(result).to.have.property('findings');
        expect(result.findings).to.be.a('string');
      }
    });
  });

  describe('extractInformation', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should extract information from a document', async () => {
      const document = 'The annual revenue for FY2024 was $5.2 billion, up 15% from the previous year. Operating margins improved to 22%.';
      const query = 'What was the annual revenue?';

      const result = await researchAgent.extractInformation(document, query);

      expect(result).to.have.property('query');
      expect(result).to.have.property('extraction');
      expect(result).to.have.property('confidence');
      expect(result).to.have.property('processingTime');
      expect(result.query).to.equal(query);
      expect(typeof result.extraction).to.equal('string');
      expect(result.confidence).to.be.a('number');
      expect(result.confidence).to.be.at.least(0);
      expect(result.confidence).to.be.at.most(1);
    });

    it('should pass both document and query to the prompt', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Extracted information.';
      };

      const document = 'Sample document content for extraction.';
      const query = 'Extract key dates';

      await researchAgent.extractInformation(document, query);

      expect(capturedPrompt).to.include(document);
      expect(capturedPrompt).to.include(query);
    });

    it('should truncate documents longer than 3000 characters', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Extracted information.';
      };

      const longDocument = 'A'.repeat(5000);
      await researchAgent.extractInformation(longDocument, 'Extract data');

      // Should truncate and add ellipsis
      expect(capturedPrompt).to.include('...');
      // Should not contain the full 5000 characters of 'A'
      expect(capturedPrompt.indexOf('A'.repeat(3001))).to.equal(-1);
    });

    it('should not truncate documents shorter than 3000 characters', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Extracted information.';
      };

      const shortDocument = 'A'.repeat(2000);
      await researchAgent.extractInformation(shortDocument, 'Extract data');

      expect(capturedPrompt).to.include(shortDocument);
    });

    it('should use low temperature for extraction accuracy', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Extracted data.';
      };

      await researchAgent.extractInformation('Document text', 'Query');

      expect(capturedOptions).to.not.be.null;
      expect(capturedOptions.temperature).to.equal(0.2);
    });

    it('should include processing time in milliseconds', async () => {
      const result = await researchAgent.extractInformation('Document', 'Query');

      expect(result.processingTime).to.be.a('number');
      expect(result.processingTime).to.be.at.least(0);
    });

    it('should set status to busy during extraction and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await researchAgent.extractInformation('Document text', 'Extract entities');

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should return default confidence of 0.9', async () => {
      const result = await researchAgent.extractInformation('Document', 'Query');
      expect(result.confidence).to.equal(0.9);
    });
  });

  describe('summarizeDocument', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should summarize a document with default options', async () => {
      const document = 'This is a comprehensive document about machine learning. It covers supervised and unsupervised learning techniques, deep learning architectures, and practical applications in industry.';

      const result = await researchAgent.summarizeDocument(document);

      expect(result).to.have.property('summary');
      expect(result).to.have.property('wordCount');
      expect(result).to.have.property('processingTime');
      expect(typeof result.summary).to.equal('string');
      expect(result.summary.length).to.be.greaterThan(0);
      expect(result.wordCount).to.be.a('number');
      expect(result.wordCount).to.be.greaterThan(0);
    });

    it('should support short length option', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Short summary.';
      };

      await researchAgent.summarizeDocument('Document text', { length: 'short' });

      expect(capturedOptions.maxTokens).to.equal(150);
    });

    it('should support medium length option', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Medium length summary with more detail.';
      };

      await researchAgent.summarizeDocument('Document text', { length: 'medium' });

      expect(capturedOptions.maxTokens).to.equal(300);
    });

    it('should support long length option', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Long comprehensive summary with extensive detail.';
      };

      await researchAgent.summarizeDocument('Document text', { length: 'long' });

      expect(capturedOptions.maxTokens).to.equal(500);
    });

    it('should default to medium length when not specified', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Default summary.';
      };

      await researchAgent.summarizeDocument('Document text');

      expect(capturedOptions.maxTokens).to.equal(300);
    });

    it('should include focus area in prompt when specified', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Focused summary.';
      };

      await researchAgent.summarizeDocument('Document text', { focus: 'financial metrics' });

      expect(capturedPrompt).to.include('financial metrics');
    });

    it('should request bullet points format when specified', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Summary in bullet points.\n\nKey Takeaways:\n- Point one\n- Point two\n- Point three';
      };

      await researchAgent.summarizeDocument('Document text', { bulletPoints: true });

      expect(capturedPrompt).to.include('bullet points');
    });

    it('should extract key points when bullet points are requested', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'This is a summary of the document.\n\nKey Takeaways:\n- First important point\n- Second important point\n- Third important point';
      };

      const result = await researchAgent.summarizeDocument('Document', { bulletPoints: true });

      expect(result.keyPoints).to.be.an('array');
      if (result.keyPoints) {
        expect(result.keyPoints.length).to.be.greaterThan(0);
      }
    });

    it('should not include key points when bullet points not requested', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'This is a paragraph summary without bullet points.';
      };

      const result = await researchAgent.summarizeDocument('Document');

      expect(result.keyPoints).to.be.undefined;
    });

    it('should request paragraph format by default', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Paragraph summary.';
      };

      await researchAgent.summarizeDocument('Document text');

      expect(capturedPrompt).to.include('paragraph form');
    });

    it('should truncate documents longer than 4000 characters', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Summary.';
      };

      const longDocument = 'B'.repeat(6000);
      await researchAgent.summarizeDocument(longDocument);

      expect(capturedPrompt).to.include('...');
    });

    it('should count words in the summary', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'This summary contains exactly seven words here.';
      };

      const result = await researchAgent.summarizeDocument('Document');
      // 'This summary contains exactly seven words here.' = 7 words
      expect(result.wordCount).to.equal(7);
    });

    it('should set status to busy during summarization and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      await researchAgent.summarizeDocument('Document text to summarize');

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should include processing time in results', async () => {
      const result = await researchAgent.summarizeDocument('Document');

      expect(result.processingTime).to.be.a('number');
      expect(result.processingTime).to.be.at.least(0);
    });

    it('should use low temperature for summarization', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Summary.';
      };

      await researchAgent.summarizeDocument('Document');

      expect(capturedOptions.temperature).to.equal(0.3);
    });
  });

  describe('factCheck', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should fact check a statement and return structured results', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Yes\nConfidence: 95%\nExplanation: The statement is accurate based on available data.\nCorrections: None needed.';
      };

      const result = await researchAgent.factCheck('The Earth orbits the Sun.');

      expect(result).to.have.property('statement');
      expect(result).to.have.property('isFactual');
      expect(result).to.have.property('confidence');
      expect(result).to.have.property('explanation');
      expect(result).to.have.property('processingTime');
      expect(result.statement).to.equal('The Earth orbits the Sun.');
    });

    it('should identify factual statements', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Yes\nConfidence: 98%\nExplanation: This is a well-established scientific fact.';
      };

      const result = await researchAgent.factCheck('Water boils at 100 degrees Celsius at sea level.');

      expect(result.isFactual).to.be.true;
      expect(result.confidence).to.be.greaterThan(0.9);
    });

    it('should identify false statements', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: No\nConfidence: 99%\nExplanation: This statement is incorrect.\nCorrections: The Sun does not orbit the Earth; the Earth orbits the Sun.';
      };

      const result = await researchAgent.factCheck('The Sun orbits the Earth.');

      expect(result.isFactual).to.be.false;
      expect(result.corrections).to.be.a('string');
    });

    it('should identify partially factual statements', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Partially\nConfidence: 60%\nExplanation: The statement contains some accurate elements but also inaccuracies.\nCorrections: Some details need updating.';
      };

      const result = await researchAgent.factCheck('AI can solve all problems perfectly.');

      // 'Partially' is not 'Yes', so isFactual should be false
      expect(result.isFactual).to.be.false;
      expect(result.confidence).to.be.a('number');
    });

    it('should include context in the fact checking prompt when provided', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Factual: Yes\nConfidence: 90%\nExplanation: Accurate within context.';
      };

      const context = 'Based on the 2024 WHO report on global health.';
      await researchAgent.factCheck('Global life expectancy increased.', context);

      expect(capturedPrompt).to.include(context);
    });

    it('should handle fact checking without context', async () => {
      let capturedPrompt = '';
      mockOpenAIClient.generateResponse = async (prompt: string) => {
        capturedPrompt = prompt;
        return 'Factual: Yes\nConfidence: 85%\nExplanation: Generally accurate.';
      };

      await researchAgent.factCheck('Paris is the capital of France.');

      // Should not include CONTEXT section when no context provided
      expect(capturedPrompt).to.not.include('CONTEXT:');
    });

    it('should parse confidence percentage correctly', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Yes\nConfidence: 75%\nExplanation: Moderately confident.';
      };

      const result = await researchAgent.factCheck('Statement');

      expect(result.confidence).to.equal(0.75);
    });

    it('should default confidence to 0.5 when not parseable', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'The statement appears to be accurate based on available evidence.';
      };

      const result = await researchAgent.factCheck('Statement');

      expect(result.confidence).to.equal(0.5);
    });

    it('should default isFactual to false when not parseable', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Unable to determine the factual accuracy of this statement.';
      };

      const result = await researchAgent.factCheck('Ambiguous statement');

      expect(result.isFactual).to.be.false;
    });

    it('should provide default explanation when not parseable', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Some unstructured response without proper formatting.';
      };

      const result = await researchAgent.factCheck('Statement');

      expect(result.explanation).to.equal('No explanation provided');
    });

    it('should parse corrections from structured response', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: No\nConfidence: 95%\nExplanation: The statement contains an error.\nCorrections: The correct value is 42, not 43.';
      };

      const result = await researchAgent.factCheck('The answer is 43.');

      expect(result.corrections).to.be.a('string');
      expect(result.corrections).to.include('42');
    });

    it('should use low temperature for fact checking accuracy', async () => {
      let capturedOptions: any = null;
      mockOpenAIClient.generateResponse = async (prompt: string, options: any) => {
        capturedOptions = options;
        return 'Factual: Yes\nConfidence: 90%\nExplanation: Accurate.';
      };

      await researchAgent.factCheck('Statement');

      expect(capturedOptions.temperature).to.equal(0.2);
    });

    it('should set status to busy during fact checking and idle after', async () => {
      const statusChanges: string[] = [];
      mockSharedState.updateAgentStatus = async (name: string, status: string) => {
        statusChanges.push(status);
      };

      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Yes\nConfidence: 90%\nExplanation: Accurate.';
      };

      await researchAgent.factCheck('Test statement');

      expect(statusChanges).to.include('busy');
      expect(statusChanges).to.include('idle');
      expect(statusChanges[statusChanges.length - 1]).to.equal('idle');
    });

    it('should include processing time in results', async () => {
      mockOpenAIClient.generateResponse = async () => {
        return 'Factual: Yes\nConfidence: 90%\nExplanation: Accurate.';
      };

      const result = await researchAgent.factCheck('Statement');

      expect(result.processingTime).to.be.a('number');
      expect(result.processingTime).to.be.at.least(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should handle OpenAI API errors in researchTopic', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('OpenAI API Error');
      };

      try {
        await researchAgent.researchTopic('Topic', { aspects: ['a'], depth: 'basic' });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('OpenAI API Error');
      }
    });

    it('should handle OpenAI API errors in extractInformation', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API rate limit exceeded');
      };

      try {
        await researchAgent.extractInformation('Document', 'Query');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('API rate limit exceeded');
      }
    });

    it('should handle OpenAI API errors in summarizeDocument', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('Network timeout');
      };

      try {
        await researchAgent.summarizeDocument('Document');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Network timeout');
      }
    });

    it('should handle OpenAI API errors in factCheck', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('Service unavailable');
      };

      try {
        await researchAgent.factCheck('Statement');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Service unavailable');
      }
    });

    it('should set status to error when researchTopic fails', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await researchAgent.researchTopic('Topic', { aspects: ['a'], depth: 'basic' });
      } catch (error: any) {
        // Expected
      }

      expect(researchAgent.getAgentInfo().status).to.equal('error');
    });

    it('should set status to error when extractInformation fails', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await researchAgent.extractInformation('Doc', 'Query');
      } catch (error: any) {
        // Expected
      }

      expect(researchAgent.getAgentInfo().status).to.equal('error');
    });

    it('should set status to error when summarizeDocument fails', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await researchAgent.summarizeDocument('Document');
      } catch (error: any) {
        // Expected
      }

      expect(researchAgent.getAgentInfo().status).to.equal('error');
    });

    it('should set status to error when factCheck fails', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('API Error');
      };

      try {
        await researchAgent.factCheck('Statement');
      } catch (error: any) {
        // Expected
      }

      expect(researchAgent.getAgentInfo().status).to.equal('error');
    });

    it('should store last error in agent info after failure', async () => {
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('Specific error message');
      };

      try {
        await researchAgent.researchTopic('Topic', { aspects: ['a'], depth: 'basic' });
      } catch (error: any) {
        // Expected
      }

      const info = researchAgent.getAgentInfo();
      expect(info.lastError).to.not.be.null;
      expect(info.lastError!.message).to.equal('Specific error message');
    });

    it('should handle network timeouts gracefully', async () => {
      mockOpenAIClient.generateResponse = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Request timed out');
      };

      try {
        await researchAgent.extractInformation('Doc', 'Query');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Request timed out');
      }
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should clear cache on shutdown', async () => {
      // The ResearchAgent overrides shutdown to clear cache
      // Access the private researchCache via any cast for testing
      const agentAny = researchAgent as any;

      // Manually add items to the cache
      agentAny.researchCache.set('test-key', {
        query: 'test query',
        results: { data: 'test' },
        timestamp: Date.now(),
        expiry: 60000
      });

      expect(agentAny.researchCache.size).to.equal(1);

      await researchAgent.shutdown();

      expect(agentAny.researchCache.size).to.equal(0);
    });

    it('should have empty cache on initialization', async () => {
      const agentAny = researchAgent as any;
      expect(agentAny.researchCache.size).to.equal(0);
    });

    it('should clean expired cache entries', async () => {
      const agentAny = researchAgent as any;

      // Add an expired entry
      agentAny.researchCache.set('expired-key', {
        query: 'old query',
        results: { data: 'old' },
        timestamp: Date.now() - 120000, // 2 minutes ago
        expiry: 60000 // 1 minute expiry
      });

      // Add a valid entry
      agentAny.researchCache.set('valid-key', {
        query: 'new query',
        results: { data: 'new' },
        timestamp: Date.now(),
        expiry: 60000
      });

      expect(agentAny.researchCache.size).to.equal(2);

      // Call cleanCache (private method accessed via any)
      agentAny.cleanCache();

      expect(agentAny.researchCache.size).to.equal(1);
      expect(agentAny.researchCache.has('expired-key')).to.be.false;
      expect(agentAny.researchCache.has('valid-key')).to.be.true;
    });

    it('should not remove entries that have not expired', async () => {
      const agentAny = researchAgent as any;

      agentAny.researchCache.set('fresh-key', {
        query: 'fresh query',
        results: { data: 'fresh' },
        timestamp: Date.now(),
        expiry: 300000 // 5 minutes
      });

      agentAny.cleanCache();

      expect(agentAny.researchCache.size).to.equal(1);
      expect(agentAny.researchCache.has('fresh-key')).to.be.true;
    });

    it('should handle cleaning empty cache gracefully', async () => {
      const agentAny = researchAgent as any;
      expect(agentAny.researchCache.size).to.equal(0);

      // Should not throw
      agentAny.cleanCache();

      expect(agentAny.researchCache.size).to.equal(0);
    });

    it('should clean all expired entries when multiple exist', async () => {
      const agentAny = researchAgent as any;

      // Add multiple expired entries
      for (let i = 0; i < 5; i++) {
        agentAny.researchCache.set(`expired-${i}`, {
          query: `query-${i}`,
          results: { data: `data-${i}` },
          timestamp: Date.now() - 200000, // Well past expiry
          expiry: 60000
        });
      }

      expect(agentAny.researchCache.size).to.equal(5);

      agentAny.cleanCache();

      expect(agentAny.researchCache.size).to.equal(0);
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await researchAgent.initialize();

      const info = researchAgent.getAgentInfo();

      expect(info.name).to.equal('Test Research Agent');
      expect(info.type).to.equal('ResearchAgent');
      expect(info.status).to.equal('idle');
    });

    it('should track status transitions during operations', async () => {
      await researchAgent.initialize();

      // Status should be idle initially
      expect(researchAgent.getAgentInfo().status).to.equal('idle');

      // Perform an operation
      await researchAgent.researchTopic('Topic', {
        aspects: ['aspect'],
        depth: 'basic'
      });

      // Status should return to idle after operation
      expect(researchAgent.getAgentInfo().status).to.equal('idle');
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await researchAgent.initialize();
    });

    it('should complete researchTopic within reasonable time', async () => {
      const startTime = Date.now();
      await researchAgent.researchTopic('Test Topic', {
        aspects: ['performance'],
        depth: 'basic'
      });
      const duration = Date.now() - startTime;

      expect(duration).to.be.below(10000);
    });

    it('should handle concurrent research requests', async () => {
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(
          researchAgent.researchTopic(`Topic ${i}`, {
            aspects: [`aspect-${i}`],
            depth: 'basic'
          })
        );
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('findings');
      });
    });

    it('should handle concurrent extraction requests', async () => {
      const requests = [];

      for (let i = 0; i < 3; i++) {
        requests.push(
          researchAgent.extractInformation(`Document ${i}`, `Query ${i}`)
        );
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(3);
      results.forEach(result => {
        expect(result).to.have.property('extraction');
        expect(result).to.have.property('confidence');
      });
    });

    it('should handle large documents for extraction', async () => {
      const largeDocument = 'Lorem ipsum dolor sit amet. '.repeat(500);

      const result = await researchAgent.extractInformation(largeDocument, 'Key information');
      expect(result).to.be.an('object');
      expect(result.extraction).to.be.a('string');
    });

    it('should handle large documents for summarization', async () => {
      const largeDocument = 'Detailed analysis paragraph. '.repeat(300);

      const result = await researchAgent.summarizeDocument(largeDocument);
      expect(result).to.be.an('object');
      expect(result.summary).to.be.a('string');
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully and clear cache', async () => {
      await researchAgent.initialize();

      const agentAny = researchAgent as any;
      agentAny.researchCache.set('key', {
        query: 'q',
        results: {},
        timestamp: Date.now(),
        expiry: 60000
      });

      const result = await researchAgent.shutdown();
      expect(result).to.be.true;
      expect(researchAgent.getAgentInfo().status).to.equal('offline');
      expect(agentAny.researchCache.size).to.equal(0);
    });

    it('should set status to offline on shutdown', async () => {
      await researchAgent.initialize();
      await researchAgent.shutdown();
      expect(researchAgent.getAgentInfo().status).to.equal('offline');
    });

    it('should return true even when cache is already empty', async () => {
      await researchAgent.initialize();
      const result = await researchAgent.shutdown();
      expect(result).to.be.true;
    });

    it('should handle errors during shutdown gracefully', async () => {
      await researchAgent.initialize();

      // Override updateAgentStatus to simulate an error condition
      // The ResearchAgent.shutdown catches errors and returns false
      const agentAny = researchAgent as any;
      const originalUpdateStatus = agentAny.updateStatus.bind(agentAny);
      agentAny.updateStatus = (status: string) => {
        if (status === 'offline') {
          throw new Error('Shutdown error');
        }
        originalUpdateStatus(status);
      };

      const result = await researchAgent.shutdown();
      // ResearchAgent.shutdown catches errors and returns false
      expect(result).to.be.false;
    });
  });
});
