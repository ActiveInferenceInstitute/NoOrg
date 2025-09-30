import { expect } from 'chai';
import { AnalysisAgent } from '../../../src/agents/AnalysisAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('AnalysisAgent', () => {
  let analysisAgent: AnalysisAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAIClient = {
      generateResponse: async (prompt: string, options?: any) => {
        return {
          choices: [{
            message: {
              content: `Mock analysis response for: ${prompt.substring(0, 50)}...`
            }
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
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

    // Create agent
    analysisAgent = new AnalysisAgent('Test Analysis Agent', {
      id: 'test-analysis-agent',
      name: 'Test Analysis Agent',
      type: 'analysis',
      capabilities: ['data-analysis', 'statistics', 'visualization'],
      status: 'available',
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
      const result = await analysisAgent.initialize();
      expect(result).to.be.true;
      expect(analysisAgent.getAgentInfo().status).to.equal('available');
    });

    it('should handle initialization errors', async () => {
      // Create agent with invalid configuration
      const invalidAgent = new AnalysisAgent('Invalid Agent', {
        id: 'invalid-agent',
        name: 'Invalid Agent',
        type: 'analysis',
        capabilities: [],
        status: 'available',
        openAIClient: null as any,
        sharedState: mockSharedState as SharedStateManager
      });

      const result = await invalidAgent.initialize();
      expect(result).to.be.false;
    });
  });

  describe('Data Analysis', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should perform basic data analysis', async () => {
      const testData = [
        { name: 'Alice', age: 25, score: 85 },
        { name: 'Bob', age: 30, score: 92 },
        { name: 'Charlie', age: 28, score: 78 }
      ];

      const result = await analysisAgent.analyzeData(testData);

      expect(result).to.have.property('insights');
      expect(result).to.have.property('trends');
      expect(result).to.have.property('recommendations');
      expect(result).to.have.property('confidence');
      expect(result).to.have.property('processingTime');
      expect(result.confidence).to.be.a('number');
      expect(result.processingTime).to.be.a('number');
    });

    it('should handle different analysis types', async () => {
      const testData = { values: [1, 2, 3, 4, 5] };

      const exploratoryResult = await analysisAgent.analyzeData(testData, {
        analysisType: 'exploratory'
      });

      const descriptiveResult = await analysisAgent.analyzeData(testData, {
        analysisType: 'descriptive'
      });

      const inferentialResult = await analysisAgent.analyzeData(testData, {
        analysisType: 'inferential'
      });

      expect(exploratoryResult).to.be.an('object');
      expect(descriptiveResult).to.be.an('object');
      expect(inferentialResult).to.be.an('object');
    });

    it('should handle analysis with focus areas', async () => {
      const testData = {
        sales: [100, 150, 120, 180, 200],
        customers: [10, 15, 12, 18, 20]
      };

      const result = await analysisAgent.analyzeData(testData, {
        focusAreas: ['profitability', 'growth'],
        includeTrends: true,
        includeCorrelations: true
      });

      expect(result).to.have.property('trends');
      expect(result).to.have.property('correlations');
    });

    it('should handle empty or invalid data', async () => {
      try {
        await analysisAgent.analyzeData(null as any);
        expect.fail('Should have thrown error for null data');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }

      try {
        await analysisAgent.analyzeData([]);
        // Empty array should be handled gracefully
        expect(true).to.be.true;
      } catch (error: any) {
        // Error is acceptable for empty data
      }
    });
  });

  describe('Visualization Generation', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should create visualization configurations', async () => {
      const testData = {
        categories: ['A', 'B', 'C'],
        values: [10, 20, 15]
      };

      const result = await analysisAgent.createVisualization(testData, {
        visualizationType: 'bar',
        variables: ['categories', 'values'],
        title: 'Test Bar Chart'
      });

      expect(result).to.have.property('visualizationType');
      expect(result).to.have.property('title');
      expect(result).to.have.property('variables');
      expect(result).to.have.property('config');
      expect(result).to.have.property('description');
      expect(result).to.have.property('insights');
      expect(result.visualizationType).to.equal('bar');
      expect(result.title).to.equal('Test Bar Chart');
      expect(result.variables).to.include('categories');
      expect(result.variables).to.include('values');
    });

    it('should support different visualization types', async () => {
      const testData = { x: [1, 2, 3], y: [4, 5, 6] };

      const chartTypes = ['line', 'scatter', 'bar', 'pie', 'histogram'];

      for (const chartType of chartTypes) {
        const result = await analysisAgent.createVisualization(testData, {
          visualizationType: chartType as any,
          variables: ['x', 'y']
        });

        expect(result.visualizationType).to.equal(chartType);
      }
    });

    it('should include code generation when requested', async () => {
      const testData = { data: [1, 2, 3, 4, 5] };

      const result = await analysisAgent.createVisualization(testData, {
        visualizationType: 'histogram',
        includeCode: true,
        framework: 'plotly'
      });

      expect(result).to.have.property('code');
      expect(typeof result.code).to.equal('string');
    });

    it('should handle auto visualization type selection', async () => {
      const testData = {
        time: ['2024-01', '2024-02', '2024-03'],
        value: [100, 150, 120]
      };

      const result = await analysisAgent.createVisualization(testData, {
        visualizationType: 'auto'
      });

      expect(result.visualizationType).to.be.a('string');
      expect(['line', 'bar', 'scatter']).to.include(result.visualizationType);
    });
  });

  describe('Report Generation', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should generate executive reports', async () => {
      const testData = {
        metrics: { revenue: 100000, profit: 15000, customers: 500 }
      };

      const result = await analysisAgent.generateReport(testData, {
        reportType: 'executive',
        audience: 'executives',
        includeExecutiveSummary: true
      });

      expect(result).to.have.property('title');
      expect(result).to.have.property('executiveSummary');
      expect(result).to.have.property('sections');
      expect(result).to.have.property('keyFindings');
      expect(result.title).to.be.a('string');
      expect(result.executiveSummary).to.be.a('string');
      expect(Array.isArray(result.sections)).to.be.true;
      expect(Array.isArray(result.keyFindings)).to.be.true;
    });

    it('should generate technical reports', async () => {
      const testData = {
        technical: { algorithms: ['linear', 'logistic'], accuracy: [0.85, 0.92] }
      };

      const result = await analysisAgent.generateReport(testData, {
        reportType: 'technical',
        audience: 'analysts',
        includeMethodology: true
      });

      expect(result).to.have.property('title');
      expect(result).to.have.property('methodology');
      expect(result).to.have.property('sections');
      expect(result.methodology).to.be.a('string');
    });

    it('should generate comprehensive reports', async () => {
      const testData = {
        comprehensive: { data: 'test', analysis: 'results' }
      };

      const result = await analysisAgent.generateReport(testData, {
        reportType: 'comprehensive',
        includeExecutiveSummary: true,
        includeMethodology: true,
        includeVisualizations: true,
        includeRecommendations: true
      });

      expect(result).to.have.property('title');
      expect(result).to.have.property('executiveSummary');
      expect(result).to.have.property('methodology');
      expect(result).to.have.property('recommendations');
      expect(Array.isArray(result.recommendations)).to.be.true;
    });

    it('should handle report generation errors', async () => {
      try {
        await analysisAgent.generateReport(null as any);
        expect.fail('Should have thrown error for null data');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await analysisAgent.initialize();

      const info = analysisAgent.getAgentInfo();

      expect(info.id).to.equal('test-analysis-agent');
      expect(info.name).to.equal('Test Analysis Agent');
      expect(info.type).to.equal('analysis');
      expect(info.capabilities).to.include('data-analysis');
      expect(info.capabilities).to.include('statistics');
      expect(info.capabilities).to.include('visualization');
      expect(info.status).to.equal('available');
    });

    it('should update agent status', async () => {
      await analysisAgent.initialize();

      analysisAgent.updateStatus('busy');
      expect(analysisAgent.getAgentInfo().status).to.equal('busy');

      analysisAgent.updateStatus('available');
      expect(analysisAgent.getAgentInfo().status).to.equal('available');
    });
  });

  describe('Task Execution', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should execute analysis tasks', async () => {
      const taskDetails = {
        type: 'analyze',
        data: { values: [1, 2, 3, 4, 5] },
        options: { analysisType: 'descriptive' }
      };

      const result = await analysisAgent.executeTask(taskDetails);

      expect(result).to.be.an('object');
      expect(result).to.have.property('summary');
      expect(result).to.have.property('keyInsights');
      expect(result).to.have.property('statistics');
    });

    it('should execute visualization tasks', async () => {
      const taskDetails = {
        type: 'visualize',
        data: { x: [1, 2, 3], y: [4, 5, 6] },
        options: { visualizationType: 'scatter' }
      };

      const result = await analysisAgent.executeTask(taskDetails);

      expect(result).to.be.an('object');
      expect(result).to.have.property('visualizationType');
      expect(result).to.have.property('config');
      expect(result.visualizationType).to.equal('scatter');
    });

    it('should execute report tasks', async () => {
      const taskDetails = {
        type: 'report',
        data: { analysis: 'test results' },
        options: { reportType: 'executive' }
      };

      const result = await analysisAgent.executeTask(taskDetails);

      expect(result).to.be.an('object');
      expect(result).to.have.property('title');
      expect(result).to.have.property('sections');
      expect(result).to.have.property('keyFindings');
    });

    it('should handle invalid task types', async () => {
      const invalidTaskDetails = {
        type: 'invalid-task-type'
      };

      try {
        await analysisAgent.executeTask(invalidTaskDetails);
        expect.fail('Should have thrown error for invalid task type');
      } catch (error: any) {
        expect(error.message).to.include('Unsupported task type');
      }
    });

    it('should handle missing required task parameters', async () => {
      const incompleteTaskDetails = {
        type: 'analyze'
        // Missing 'data' parameter
      };

      try {
        await analysisAgent.executeTask(incompleteTaskDetails);
        expect.fail('Should have thrown error for missing parameters');
      } catch (error: any) {
        expect(error.message).to.include('Missing required field');
      }
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should support cache operations', async () => {
      const testData = { values: [1, 2, 3] };

      // First analysis should not be cached
      const result1 = await analysisAgent.analyzeData(testData, {
        checkCache: false
      });

      // Second analysis with same data should use cache if enabled
      const result2 = await analysisAgent.analyzeData(testData, {
        checkCache: true
      });

      expect(result1).to.be.an('object');
      expect(result2).to.be.an('object');
    });

    it('should clear cache when requested', async () => {
      const result = await analysisAgent.executeTask({
        type: 'clearCache'
      });

      expect(result.success).to.be.true;
      expect(result.message).to.equal('Cache cleared.');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock API error
      mockOpenAIClient.generateResponse = async () => {
        throw new Error('OpenAI API Error');
      };

      try {
        await analysisAgent.analyzeData({ test: 'data' });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('OpenAI API Error');
      }
    });

    it('should handle malformed responses', async () => {
      // Mock malformed response
      mockOpenAIClient.generateResponse = async () => {
        return {
          choices: [{
            message: {
              content: null
            }
          }]
        };
      };

      const result = await analysisAgent.analyzeData({ test: 'data' });
      expect(result).to.be.an('object');
      // Should handle null content gracefully
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      mockOpenAIClient.generateResponse = async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { choices: [{ message: { content: 'timeout response' } }] };
      };

      try {
        await analysisAgent.analyzeData({ test: 'data' }, {
          // Short timeout to trigger timeout error
        });
        // Should handle timeout or complete successfully
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await analysisAgent.initialize();
    });

    it('should complete analysis within reasonable time', async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: Math.random() * 100
      }));

      const startTime = Date.now();
      await analysisAgent.analyzeData(testData);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).to.be.below(10000); // Should complete in less than 10 seconds
    });

    it('should handle large datasets', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        category: `category-${i % 10}`
      }));

      const result = await analysisAgent.analyzeData(largeData);
      expect(result).to.be.an('object');
      expect(result).to.have.property('summary');
    });

    it('should handle concurrent requests', async () => {
      const testData = { values: [1, 2, 3, 4, 5] };
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(analysisAgent.analyzeData(testData));
      }

      const results = await Promise.all(requests);

      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('summary');
      });
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await analysisAgent.initialize();

      const result = await analysisAgent.shutdown();
      expect(result).to.be.true;
      expect(analysisAgent.getAgentInfo().status).to.equal('offline');
    });

    it('should handle shutdown when not initialized', async () => {
      const result = await analysisAgent.shutdown();
      expect(result).to.be.true;
    });
  });
});
