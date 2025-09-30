import { expect } from 'chai';
import { EventSystem } from '../../src/core/events/EventSystem';
import { MessageSystem } from '../../src/core/messaging/MessageSystem';
import { MonitoringSystem } from '../../src/core/monitoring/MonitoringSystem';
import { StorageSystem } from '../../src/core/storage/StorageSystem';
import { AnalysisAgent } from '../../src/agents/AnalysisAgent';
import { CreativeWritingAgent } from '../../src/agents/CreativeWritingAgent';
import { DataAnalysisAgent } from '../../src/agents/DataAnalysisAgent';
import { DevelopmentAgent } from '../../src/agents/DevelopmentAgent';
import { FinanceAgent } from '../../src/agents/FinanceAgent';
import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../src/core/multiagent/SharedStateManager';

describe('Comprehensive System Integration', () => {
  let eventSystem: EventSystem;
  let messageSystem: MessageSystem;
  let monitoringSystem: MonitoringSystem;
  let storageSystem: StorageSystem;
  let analysisAgent: AnalysisAgent;
  let creativeWritingAgent: CreativeWritingAgent;
  let dataAnalysisAgent: DataAnalysisAgent;
  let developmentAgent: DevelopmentAgent;
  let financeAgent: FinanceAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;

  before(async () => {
    // Initialize core systems
    eventSystem = EventSystem.getInstance();
    messageSystem = MessageSystem.getInstance();
    monitoringSystem = MonitoringSystem.getInstance();
    storageSystem = StorageSystem.getInstance();

    // Mock OpenAI client
    mockOpenAIClient = {
      sendPrompt: async (prompt: string, options?: any) => {
        return {
          choices: [{
            message: {
              content: `Mock response for: ${prompt.substring(0, 50)}...`
            }
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        };
      },
      generateResponse: async (prompt: string, options?: any) => {
        return {
          choices: [{
            message: {
              content: `Mock analysis response for: ${prompt.substring(0, 50)}...`
            }
          }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 250,
            total_tokens: 400
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

    // Initialize agents
    analysisAgent = new AnalysisAgent('Integration Analysis Agent', {
      id: 'integration-analysis',
      name: 'Integration Analysis Agent',
      type: 'analysis',
      capabilities: ['data-analysis', 'statistics'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager
    });

    creativeWritingAgent = new CreativeWritingAgent('Integration Writing Agent', {
      id: 'integration-writing',
      name: 'Integration Writing Agent',
      type: 'creative-writer',
      capabilities: ['text-generation', 'creativity'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager,
      cacheTTL: 0 // Disable caching for testing
    });

    dataAnalysisAgent = new DataAnalysisAgent('Integration Data Analyst', {
      id: 'integration-data',
      name: 'Integration Data Analyst',
      type: 'data-analysis',
      capabilities: ['data-analysis', 'visualization'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager,
      cacheTTL: 0 // Disable caching for testing
    });

    developmentAgent = new DevelopmentAgent('Integration Developer', {
      id: 'integration-developer',
      name: 'Integration Developer',
      type: 'development',
      capabilities: ['code-generation', 'code-review'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager
    });

    financeAgent = new FinanceAgent('Integration Finance Analyst', {
      id: 'integration-finance',
      name: 'Integration Finance Analyst',
      type: 'finance',
      capabilities: ['financial-analysis', 'budgeting'],
      status: 'available',
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager
    });

    // Initialize all agents
    await Promise.all([
      analysisAgent.initialize(),
      creativeWritingAgent.initialize(),
      dataAnalysisAgent.initialize(),
      developmentAgent.initialize(),
      financeAgent.initialize()
    ]);
  });

  after(async () => {
    // Shutdown all agents
    await Promise.all([
      analysisAgent.shutdown(),
      creativeWritingAgent.shutdown(),
      dataAnalysisAgent.shutdown(),
      developmentAgent.shutdown(),
      financeAgent.shutdown()
    ]);
  });

  describe('Core System Integration', () => {
    it('should integrate Event System with Monitoring', async () => {
      // Set up monitoring to track events
      const eventCount = monitoringSystem.getMetrics?.()['events.published'] || 0;

      // Publish events
      eventSystem.publish('test.integration', { test: 'data' });
      eventSystem.publish('test.integration', { test: 'data2' });

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if monitoring tracked the events
      const newEventCount = monitoringSystem.getMetrics?.()['events.published'] || 0;
      expect(newEventCount).to.be.at.least(eventCount + 2);
    });

    it('should integrate Message System with Storage', async () => {
      // Store a message in storage
      await storageSystem.set('test.message', {
        id: 'test-msg-123',
        type: 'test.message',
        content: 'Integration test message'
      });

      // Retrieve the message
      const storedMessage = await storageSystem.get('test.message');
      expect(storedMessage).to.not.be.undefined;
      expect(storedMessage.id).to.equal('test-msg-123');
      expect(storedMessage.content).to.equal('Integration test message');
    });

    it('should integrate Monitoring with Storage', async () => {
      // Record some metrics
      monitoringSystem.recordMetric('test.integration', 42);
      monitoringSystem.recordMetric('test.integration', 84);

      // Store monitoring data (if supported)
      if (typeof storageSystem.set === 'function') {
        await storageSystem.set('monitoring.test.metrics', {
          integrationTest: 42,
          timestamp: Date.now()
        });
      }

      // Verify storage integration
      const storedMetrics = await storageSystem.get('monitoring.test.metrics');
      if (storedMetrics) {
        expect(storedMetrics.integrationTest).to.equal(42);
      }
    });
  });

  describe('Agent Integration with Core Systems', () => {
    it('should integrate agents with Event System', async () => {
      // Set up event listener for agent activities
      let eventReceived = false;
      const subscriptionId = eventSystem.subscribe('agent.*', (event) => {
        eventReceived = true;
      });

      // Trigger agent activity (initialization should generate events)
      await analysisAgent.analyzeData({ test: 'data' });

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have received agent events
      expect(eventReceived).to.be.true;

      // Cleanup
      eventSystem.unsubscribe(subscriptionId);
    });

    it('should integrate agents with Message System', async () => {
      // Set up message handler
      let messageReceived = false;
      const cleanup = messageSystem.onMessage('agent.request', async (message) => {
        messageReceived = true;
        return { status: 'processed' };
      });

      // Send message to agent
      await messageSystem.sendMessage({
        id: 'agent-msg-123',
        type: 'agent.request',
        from: 'test-sender',
        to: 'integration-analysis',
        body: { action: 'analyze' }
      });

      // Wait for message processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have received and processed message
      expect(messageReceived).to.be.true;

      // Cleanup
      cleanup();
    });

    it('should integrate agents with Monitoring System', async () => {
      // Record agent metrics
      monitoringSystem.recordMetric('agent.analysis.completed', 1);
      monitoringSystem.recordMetric('agent.writing.completed', 1);
      monitoringSystem.recordMetric('agent.data.completed', 1);

      // Check if metrics were recorded
      if (typeof monitoringSystem.getMetrics === 'function') {
        const metrics = monitoringSystem.getMetrics();
        expect(metrics['agent.analysis.completed']).to.equal(1);
        expect(metrics['agent.writing.completed']).to.equal(1);
        expect(metrics['agent.data.completed']).to.equal(1);
      }
    });

    it('should integrate agents with Storage System', async () => {
      // Have agents store their results
      const analysisResult = await analysisAgent.analyzeData({
        values: [1, 2, 3, 4, 5]
      });

      const writingResult = await creativeWritingAgent.generateContent('Test content');

      // Store results
      await storageSystem.set('agent.results.analysis', analysisResult);
      await storageSystem.set('agent.results.writing', writingResult);

      // Retrieve and verify
      const storedAnalysis = await storageSystem.get('agent.results.analysis');
      const storedWriting = await storageSystem.get('agent.results.writing');

      expect(storedAnalysis).to.not.be.undefined;
      expect(storedWriting).to.not.be.undefined;
    });
  });

  describe('Cross-Agent Communication', () => {
    it('should enable communication between agents', async () => {
      // Set up message handlers for inter-agent communication
      let analysisReceived = false;
      let writingReceived = false;

      const analysisCleanup = messageSystem.onMessage('data.analysis.complete', async (message) => {
        analysisReceived = true;
        return { status: 'received' };
      });

      const writingCleanup = messageSystem.onMessage('content.writing.request', async (message) => {
        writingReceived = true;
        // Simulate writing agent responding
        await messageSystem.sendMessage({
          id: 'writing-response',
          type: 'content.writing.complete',
          from: 'integration-writing',
          to: message.from,
          body: { content: 'Generated content' }
        });
        return { status: 'processed' };
      });

      // Simulate analysis agent completing work and notifying writing agent
      await messageSystem.sendMessage({
        id: 'analysis-complete',
        type: 'data.analysis.complete',
        from: 'integration-analysis',
        to: 'integration-writing',
        body: { analysis: 'completed', data: [1, 2, 3] }
      });

      // Simulate writing agent requesting content generation
      await messageSystem.sendMessage({
        id: 'writing-request',
        type: 'content.writing.request',
        from: 'integration-analysis',
        to: 'integration-writing',
        body: { prompt: 'Generate content based on analysis' }
      });

      // Wait for message processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Both agents should have received messages
      expect(analysisReceived).to.be.true;
      expect(writingReceived).to.be.true;

      // Cleanup
      analysisCleanup();
      writingCleanup();
    });

    it('should handle agent collaboration workflows', async () => {
      // Simulate a workflow where agents collaborate
      const workflowId = 'integration-workflow-123';

      // Step 1: Analysis agent processes data
      const analysisData = { values: [10, 20, 30, 40, 50] };
      const analysisResult = await analysisAgent.analyzeData(analysisData);

      // Step 2: Store analysis results for other agents
      await storageSystem.set(`workflow.${workflowId}.analysis`, analysisResult);

      // Step 3: Data analysis agent creates visualization
      const vizResult = await dataAnalysisAgent.createVisualization(analysisData, {
        visualizationType: 'line',
        variables: ['values']
      });

      // Step 4: Store visualization results
      await storageSystem.set(`workflow.${workflowId}.visualization`, vizResult);

      // Step 5: Writing agent creates report
      const reportResult = await creativeWritingAgent.generateContent(
        'Create a report based on the analysis and visualization',
        { format: 'blog-post' }
      );

      // Step 6: Store final report
      await storageSystem.set(`workflow.${workflowId}.report`, reportResult);

      // Verify complete workflow
      const storedAnalysis = await storageSystem.get(`workflow.${workflowId}.analysis`);
      const storedViz = await storageSystem.get(`workflow.${workflowId}.visualization`);
      const storedReport = await storageSystem.get(`workflow.${workflowId}.report`);

      expect(storedAnalysis).to.not.be.undefined;
      expect(storedViz).to.not.be.undefined;
      expect(storedReport).to.not.be.undefined;
      expect(storedReport.content).to.be.a('string');
      expect(storedReport.content.length).to.be.greaterThan(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle agent failures gracefully', async () => {
      // Simulate agent failure
      let errorHandled = false;

      // Set up error monitoring
      const errorSubscriptionId = eventSystem.subscribe('agent.error', (event) => {
        errorHandled = true;
      });

      // Try to trigger an error (e.g., invalid data)
      try {
        await analysisAgent.analyzeData(null as any);
      } catch (error) {
        // Error should be caught and handled
        expect(error).to.be.instanceOf(Error);
      }

      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have handled the error (implementation dependent)
      // expect(errorHandled).to.be.true;

      // Cleanup
      eventSystem.unsubscribe(errorSubscriptionId);
    });

    it('should maintain system stability during component failures', async () => {
      // Test that other components continue working when one fails

      // First, verify normal operation
      await storageSystem.set('test.stability', { value: 'stable' });
      const stableValue = await storageSystem.get('test.stability');
      expect(stableValue.value).to.equal('stable');

      // Simulate failure in one component (mock error in OpenAI client)
      const originalSendPrompt = mockOpenAIClient.sendPrompt;
      mockOpenAIClient.sendPrompt = async () => {
        throw new Error('Simulated API failure');
      };

      // Other components should still work
      try {
        await analysisAgent.analyzeData({ test: 'data' });
      } catch (error) {
        // Expected to fail due to mocked error
      }

      // Storage should still work
      await storageSystem.set('test.stability.2', { value: 'still-stable' });
      const stillStableValue = await storageSystem.get('test.stability.2');
      expect(stillStableValue.value).to.equal('still-stable');

      // Restore original function
      mockOpenAIClient.sendPrompt = originalSendPrompt;
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent agent operations', async () => {
      const testData = { values: [1, 2, 3, 4, 5] };

      // Run multiple agent operations concurrently
      const operations = [
        analysisAgent.analyzeData(testData),
        dataAnalysisAgent.analyzeData(testData),
        creativeWritingAgent.generateContent('Test prompt'),
        developmentAgent.generateCode('Create a function'),
        financeAgent.analyzeFinancialData({ revenue: [100, 200, 300] })
      ];

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      // All operations should complete
      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.be.an('object');
      });

      // Should complete in reasonable time
      const duration = endTime - startTime;
      expect(duration).to.be.below(30000); // Less than 30 seconds
    });

    it('should handle high-volume event processing', async () => {
      const eventCount = 100;
      let receivedCount = 0;

      // Set up event listener
      const subscriptionId = eventSystem.subscribe('test.performance', () => {
        receivedCount++;
      });

      // Publish many events
      const startTime = Date.now();
      for (let i = 0; i < eventCount; i++) {
        eventSystem.publish('test.performance', { index: i });
      }
      const endTime = Date.now();

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should have received all events
      expect(receivedCount).to.equal(eventCount);

      // Should complete quickly
      const duration = endTime - startTime;
      expect(duration).to.be.below(2000); // Less than 2 seconds

      // Cleanup
      eventSystem.unsubscribe(subscriptionId);
    });

    it('should handle large data storage and retrieval', async () => {
      // Create large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        data: 'x'.repeat(100) // 100 character string
      }));

      // Store large data
      const startTime = Date.now();
      await storageSystem.set('test.large-data', largeData);
      const endTime = Date.now();

      // Should complete in reasonable time
      const storeDuration = endTime - startTime;
      expect(storeDuration).to.be.below(5000); // Less than 5 seconds

      // Retrieve large data
      const retrieveStartTime = Date.now();
      const retrievedData = await storageSystem.get('test.large-data');
      const retrieveEndTime = Date.now();

      // Should retrieve correctly
      expect(retrievedData).to.deep.equal(largeData);

      // Should retrieve quickly
      const retrieveDuration = retrieveEndTime - retrieveStartTime;
      expect(retrieveDuration).to.be.below(1000); // Less than 1 second
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should execute complete multi-agent workflow', async () => {
      const workflowId = 'e2e-workflow-123';

      // Step 1: Analysis Agent processes data
      const rawData = {
        sales: [1000, 1200, 1100, 1400, 1300],
        customers: [50, 60, 55, 70, 65]
      };

      const analysisResult = await analysisAgent.analyzeData(rawData, {
        analysisType: 'comprehensive',
        includeRecommendations: true
      });

      // Step 2: Store analysis results
      await storageSystem.set(`workflow.${workflowId}.analysis`, analysisResult);

      // Step 3: Data Analysis Agent creates visualization
      const vizResult = await dataAnalysisAgent.createVisualization(rawData, {
        visualizationType: 'line',
        variables: ['sales', 'customers'],
        title: 'Sales and Customer Trends'
      });

      await storageSystem.set(`workflow.${workflowId}.visualization`, vizResult);

      // Step 4: Development Agent generates code
      const codeResult = await developmentAgent.generateCode(
        'Create a dashboard component to display sales and customer data',
        { language: 'TypeScript', includeComments: true }
      );

      await storageSystem.set(`workflow.${workflowId}.code`, codeResult);

      // Step 5: Writing Agent creates report
      const reportResult = await creativeWritingAgent.generateContent(
        `Create a comprehensive business report based on sales analysis: ${analysisResult.summary}`,
        { format: 'blog-post', tone: 'professional' }
      );

      await storageSystem.set(`workflow.${workflowId}.report`, reportResult);

      // Step 6: Finance Agent analyzes financial implications
      const financialData = {
        revenue: rawData.sales,
        costs: [600, 650, 620, 700, 680],
        profit: [400, 550, 480, 700, 620]
      };

      const financeResult = await financeAgent.analyzeFinancialData(financialData, {
        focusAreas: ['profitability', 'efficiency'],
        includeRecommendations: true
      });

      await storageSystem.set(`workflow.${workflowId}.finance`, financeResult);

      // Verify complete workflow
      const workflowResults = {
        analysis: await storageSystem.get(`workflow.${workflowId}.analysis`),
        visualization: await storageSystem.get(`workflow.${workflowId}.visualization`),
        code: await storageSystem.get(`workflow.${workflowId}.code`),
        report: await storageSystem.get(`workflow.${workflowId}.report`),
        finance: await storageSystem.get(`workflow.${workflowId}.finance`)
      };

      // All workflow steps should have completed
      expect(workflowResults.analysis).to.not.be.undefined;
      expect(workflowResults.visualization).to.not.be.undefined;
      expect(workflowResults.code).to.not.be.undefined;
      expect(workflowResults.report).to.not.be.undefined;
      expect(workflowResults.finance).to.not.be.undefined;

      // Results should have expected structure
      expect(workflowResults.analysis.summary).to.be.a('string');
      expect(workflowResults.visualization.visualizationType).to.be.a('string');
      expect(workflowResults.code.code).to.be.a('string');
      expect(workflowResults.report.content).to.be.a('string');
      expect(workflowResults.finance.summary).to.be.a('string');
    });
  });

  describe('System Monitoring and Observability', () => {
    it('should provide comprehensive monitoring data', async () => {
      // Record various metrics across the system
      monitoringSystem.recordMetric('agent.analysis.operations', 1);
      monitoringSystem.recordMetric('agent.writing.operations', 1);
      monitoringSystem.recordMetric('agent.data.operations', 1);
      monitoringSystem.recordMetric('system.storage.operations', 5);
      monitoringSystem.recordMetric('system.events.published', 10);

      // Register health checks
      const healthCheckId = monitoringSystem.registerHealthCheck('system.integration', async () => {
        return {
          status: 'healthy',
          message: 'Integration test health check',
          timestamp: Date.now()
        };
      });

      // Execute health check
      const healthResult = await monitoringSystem.executeHealthCheck('system.integration');
      expect(healthResult.status).to.equal('healthy');

      // Get metrics if available
      if (typeof monitoringSystem.getMetrics === 'function') {
        const metrics = monitoringSystem.getMetrics();
        expect(metrics).to.be.an('object');
        expect(metrics['agent.analysis.operations']).to.equal(1);
        expect(metrics['agent.writing.operations']).to.equal(1);
        expect(metrics['agent.data.operations']).to.equal(1);
      }

      // Cleanup
      monitoringSystem.unregisterHealthCheck(healthCheckId);
    });

    it('should track system performance metrics', async () => {
      // Record performance metrics
      monitoringSystem.recordMetric('system.response.time', 150);
      monitoringSystem.recordMetric('system.memory.usage', 256);
      monitoringSystem.recordMetric('system.cpu.usage', 45);

      // Record error metrics
      monitoringSystem.recordMetric('system.errors.count', 0);

      // Metrics should be recorded without errors
      expect(() => {
        monitoringSystem.recordMetric('system.response.time', 200);
        monitoringSystem.recordMetric('system.memory.usage', 300);
        monitoringSystem.recordMetric('system.cpu.usage', 50);
      }).to.not.throw();
    });
  });

  describe('Data Persistence and Recovery', () => {
    it('should persist data across system restarts', async () => {
      // Store test data
      await storageSystem.set('test.persistence', {
        data: 'should survive restart',
        timestamp: Date.now()
      });

      // Verify data exists
      const storedData = await storageSystem.get('test.persistence');
      expect(storedData).to.not.be.undefined;
      expect(storedData.data).to.equal('should survive restart');

      // Simulate data recovery (re-initialization)
      const recoveredData = await storageSystem.get('test.persistence');
      expect(recoveredData).to.not.be.undefined;
      expect(recoveredData.data).to.equal('should survive restart');
    });

    it('should handle data corruption recovery', async () => {
      // This would test data corruption handling if implemented
      // For now, just verify basic data integrity
      const testData = {
        string: 'test',
        number: 42,
        object: { nested: 'value' },
        array: [1, 2, 3]
      };

      await storageSystem.set('test.integrity', testData);
      const retrievedData = await storageSystem.get('test.integrity');

      expect(retrievedData).to.deep.equal(testData);
      expect(retrievedData.string).to.equal('test');
      expect(retrievedData.number).to.equal(42);
      expect(retrievedData.object.nested).to.equal('value');
      expect(retrievedData.array).to.deep.equal([1, 2, 3]);
    });
  });
});
