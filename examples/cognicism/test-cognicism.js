#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Cognicism Framework
 *
 * This test suite covers all components of the Cognicism framework:
 * - IrisAgent tests
 * - FourThoughtAgent tests
 * - SemanticLedgerAgent tests
 * - Trust mechanisms tests
 * - Integration and workflow tests
 * - Performance and reliability tests
 */

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { IrisAgent, FourThoughtAgent, SemanticLedgerAgent, TrustVisualizationAgent, Thought, SourceEmbedding } = require('./cognicism-workflow');

class CognicismTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
    this.testOutputDir = path.join('test-output', `cognicism-test-${Date.now()}`);
    fs.ensureDirSync(this.testOutputDir);
  }

  // Main test runner
  async runAllTests() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Cognicism Framework Test Suite                     ║
║              Comprehensive Component Testing                    ║
╚════════════════════════════════════════════════════════════════╝
    `);

    try {
      // Core agent tests
      await this.testIrisAgent();
      await this.testFourThoughtAgent();
      await this.testSemanticLedgerAgent();

      // Advanced feature tests
      await this.testTrustMechanisms();
      await this.testTemporalEmbeddings();
      await this.testSocialProof();
      await this.testProphetIncentives();

      // Integration tests
      await this.testWorkflowIntegration();
      await this.testMultiAgentCoordination();

      // Performance tests
      await this.testPerformance();
      await this.testReliability();

      // Visualization tests
      await this.testVisualizationGeneration();

      this.printSummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.failed++;
      this.testResults.total++;
      this.testResults.tests.push({
        name: 'Test Suite Execution',
        status: 'failed',
        error: error.message
      });
    }
  }

  // Test helper methods
  async test(name, testFn) {
    this.testResults.total++;
    try {
      await testFn();
      this.testResults.passed++;
      this.testResults.tests.push({ name, status: 'passed' });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name, status: 'failed', error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  createMockContext() {
    return {
      logger: {
        info: (msg) => console.log(`[INFO] ${msg}`),
        error: (msg) => console.error(`[ERROR] ${msg}`),
        warn: (msg) => console.warn(`[WARN] ${msg}`)
      },
      config: {
        OUTPUT_DIR: this.testOutputDir,
        LLM_CONFIG: {
          DEFAULT_MODEL: 'gpt-4o',
          DEFAULT_MAX_TOKENS: 1000
        }
      }
    };
  }

  async testIrisAgent() {
    console.log('\n🧠 Testing IrisAgent...');

    await this.test('IrisAgent Initialization', async () => {
      const iris = new IrisAgent({
        id: 'test_iris',
        name: 'Test Iris',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test Iris agent',
        systemPrompt: 'You are a test Iris agent for belief encoding.'
      });

      assert(iris.id === 'test_iris');
      assert(iris.name === 'Test Iris');
      assert(iris.sources.length === 0);
      assert(iris.thoughts.length === 0);
    });

    await this.test('IrisAgent Source Management', async () => {
      const iris = new IrisAgent({
        id: 'test_iris_sources',
        name: 'Test Iris Sources',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test Iris agent for source management',
        systemPrompt: 'You are a test Iris agent.'
      });

      const source: SourceEmbedding = {
        id: 'test_source',
        name: 'Test Source',
        description: 'A test source',
        reliability: 0.8,
        expertise: 0.7,
        alignment: 0.6
      };

      iris.addSource(source);
      assert(iris.sources.length === 1);
      assert(iris.sources[0].id === 'test_source');
    });

    await this.test('IrisAgent Trust Calculation', async () => {
      const iris = new IrisAgent({
        id: 'test_iris_trust',
        name: 'Test Iris Trust',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test Iris agent for trust calculation',
        systemPrompt: 'You are a test Iris agent.',
        initialSources: [{
          id: 'high_reliability',
          name: 'High Reliability Source',
          description: 'A highly reliable source',
          reliability: 0.9,
          expertise: 0.8,
          alignment: 0.7
        }]
      });

      iris.updateSourceTrust('high_reliability', 0.1);
      const trust = iris.trustDistribution.get('high_reliability');
      assert(trust !== undefined);
      assert(trust > 0.5); // Should be higher than initial 0.5
    });

    await this.test('IrisAgent Temporal Embeddings', async () => {
      const iris = new IrisAgent({
        id: 'test_iris_temporal',
        name: 'Test Iris Temporal',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test Iris agent for temporal embeddings',
        systemPrompt: 'You are a test Iris agent.'
      });

      const embedding = iris.generateTemporalEmbedding('test_source', new Date().toISOString());
      assert(embedding.timestamp);
      assert(typeof embedding.recency === 'number');
      assert(typeof embedding.relevance === 'number');
      assert(Array.isArray(embedding.periodicity));
      assert(embedding.periodicity.length === 4);
    });

    await this.test('IrisAgent Regenerative Wisdom', async () => {
      const iris = new IrisAgent({
        id: 'test_iris_wisdom',
        name: 'Test Iris Wisdom',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test Iris agent for regenerative wisdom',
        systemPrompt: 'You are a test Iris agent.'
      });

      const wisdom = iris.computeRegenerativeWisdomTensor('test_source');
      assert(Array.isArray(wisdom.dimensions));
      assert(Array.isArray(wisdom.values));
      assert(typeof wisdom.compressionRatio === 'number');
      assert(typeof wisdom.regenerationPotential === 'number');
    });
  }

  async testFourThoughtAgent() {
    console.log('\n💭 Testing FourThoughtAgent...');

    await this.test('FourThoughtAgent Initialization', async () => {
      const ftAgent = new FourThoughtAgent({
        id: 'test_fourthought',
        name: 'Test FourThought',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test FourThought agent',
        topic: 'test topic'
      });

      assert(ftAgent.id === 'test_fourthought');
      assert(ftAgent.topic === 'test topic');
      assert(ftAgent.thoughtLog.length === 0);
    });

    await this.test('FourThoughtAgent Belief Staking', async () => {
      const ftAgent = new FourThoughtAgent({
        id: 'test_staking',
        name: 'Test Staking',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test FourThought agent for belief staking',
        topic: 'test topic'
      });

      ftAgent.stakeBelief('thought_1', 0.8);
      const stake = ftAgent.beliefStaking.get('thought_1');
      assert(stake === 0.8);
    });

    await this.test('FourThoughtAgent Community Consensus', async () => {
      const ftAgent = new FourThoughtAgent({
        id: 'test_consensus',
        name: 'Test Consensus',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test FourThought agent for community consensus',
        topic: 'test topic'
      });

      ftAgent.updateCommunityConsensus('thought_1', 0.7);
      const consensus = ftAgent.communityConsensus.get('thought_1');
      assert(consensus === 0.7);
    });

    await this.test('FourThoughtAgent Analytics', async () => {
      const ftAgent = new FourThoughtAgent({
        id: 'test_analytics',
        name: 'Test Analytics',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test FourThought agent for analytics',
        topic: 'test topic'
      });

      // Add some test thoughts
      ftAgent.thoughtLog = [
        { type: 'prediction', uncertainty: 0.3, valence: 0.8 },
        { type: 'reflection', uncertainty: 0.5, valence: 0.2 },
        { type: 'statement', uncertainty: 0.1, valence: 0.9 }
      ];

      const analytics = ftAgent.getThoughtAnalytics();
      assert(analytics.totalThoughts === 3);
      assert(analytics.typeDistribution.prediction === 1);
      assert(analytics.typeDistribution.reflection === 1);
      assert(analytics.typeDistribution.statement === 1);
      assert(typeof analytics.averageUncertainty === 'number');
      assert(typeof analytics.averageValence === 'number');
    });
  }

  async testSemanticLedgerAgent() {
    console.log('\n📚 Testing SemanticLedgerAgent...');

    await this.test('SemanticLedgerAgent Initialization', async () => {
      const ledger = new SemanticLedgerAgent({
        id: 'test_ledger',
        name: 'Test Ledger',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test semantic ledger'
      });

      assert(ledger.id === 'test_ledger');
      assert(ledger.thoughts.length === 0);
    });

    await this.test('SemanticLedgerAgent Thought Storage', async () => {
      const ledger = new SemanticLedgerAgent({
        id: 'test_storage',
        name: 'Test Storage',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test semantic ledger for storage'
      });

      const testThought: Thought = {
        type: 'statement',
        content: 'This is a test thought for storage',
        author: 'Test Author',
        timestamp: new Date().toISOString(),
        valence: 0.5,
        uncertainty: 0.3
      };

      const context = this.createMockContext();
      const result = await ledger.process({ operation: 'store', thoughts: [testThought] }, context);

      assert(result.status === 'success');
      assert(result.stored_count === 1);
      assert(ledger.thoughts.length > 0);
    });

    await this.test('SemanticLedgerAgent Query Processing', async () => {
      const ledger = new SemanticLedgerAgent({
        id: 'test_query',
        name: 'Test Query',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test semantic ledger for queries'
      });

      // Store some test data first
      const testThoughts = [
        { type: 'statement', content: 'Climate change is real', author: 'Scientist', timestamp: new Date().toISOString() },
        { type: 'prediction', content: 'AI will solve climate change', author: 'Technologist', timestamp: new Date().toISOString() }
      ];

      const context = this.createMockContext();
      await ledger.process({ operation: 'store', thoughts: testThoughts }, context);

      // Test keyword search
      const result = await ledger.process({ operation: 'query', query: 'climate' }, context);
      assert(result.status === 'success');
      assert(result.results_count > 0);
    });

    await this.test('SemanticLedgerAgent Embedding Generation', async () => {
      const ledger = new SemanticLedgerAgent({
        id: 'test_embedding',
        name: 'Test Embedding',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test semantic ledger for embeddings'
      });

      const embedding = ledger.generateEmbedding('This is a test document for embedding generation');
      assert(Array.isArray(embedding));
      assert(embedding.length === 100); // Should be 100-dimensional
      assert(embedding.every(val => typeof val === 'number')); // All values should be numbers
    });
  }

  async testTrustMechanisms() {
    console.log('\n🔐 Testing Trust Mechanisms...');

    await this.test('Advanced Trust Calculation', async () => {
      const iris = new IrisAgent({
        id: 'test_trust_calc',
        name: 'Test Trust Calc',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test trust calculation',
        systemPrompt: 'Test agent'
      });

      const source: SourceEmbedding = {
        id: 'test_source',
        name: 'Test Source',
        description: 'Test source for trust calculation',
        reliability: 0.8,
        expertise: 0.7,
        alignment: 0.6,
        socialProofScore: 0.8,
        prophetScore: 0.7
      };

      iris.addSource(source);

      // Generate temporal embedding
      iris.generateTemporalEmbedding('test_source', new Date().toISOString());

      const advancedTrust = iris.calculateAdvancedTrust('test_source');
      assert(typeof advancedTrust === 'number');
      assert(advancedTrust >= 0 && advancedTrust <= 1);
    });

    await this.test('Prophet Incentive Calculation', async () => {
      const iris = new IrisAgent({
        id: 'test_prophet',
        name: 'Test Prophet',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test prophet incentives',
        systemPrompt: 'Test agent'
      });

      // Add a prediction thought
      const prediction: Thought = {
        type: 'prediction',
        content: 'AI will achieve human-level intelligence by 2030',
        author: 'Test Author',
        timestamp: new Date().toISOString(),
        valence: 0.8,
        uncertainty: 0.3
      };

      iris.thoughts.push(prediction);

      const reward = iris.calculateProphetIncentive(prediction.id || 'test_pred', true, 'test_source');
      assert(typeof reward === 'number');
      assert(reward >= 0);
    });
  }

  async testTemporalEmbeddings() {
    console.log('\n⏰ Testing Temporal Embeddings...');

    await this.test('Temporal Relevance Calculation', async () => {
      const iris = new IrisAgent({
        id: 'test_temporal',
        name: 'Test Temporal',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test temporal embeddings',
        systemPrompt: 'Test agent'
      });

      // Create temporal embedding for 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const embedding = iris.generateTemporalEmbedding('test_source', oneHourAgo);

      const relevance = iris.calculateTemporalRelevance('test_source');
      assert(typeof relevance === 'number');
      assert(relevance >= 0 && relevance <= 1);
    });

    await this.test('Temporal Decay Function', async () => {
      const iris = new IrisAgent({
        id: 'test_decay',
        name: 'Test Decay',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test temporal decay',
        systemPrompt: 'Test agent'
      });

      // Test exponential decay over 24 hours
      const oldTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const embedding = iris.generateTemporalEmbedding('test_source', oldTimestamp);

      const relevance = iris.calculateTemporalRelevance('test_source');
      // Should be significantly decayed after 24 hours
      assert(relevance < 0.5);
    });
  }

  async testSocialProof() {
    console.log('\n🤝 Testing Social Proof Mechanisms...');

    await this.test('Social Proof Metrics Update', async () => {
      const iris = new IrisAgent({
        id: 'test_social_proof',
        name: 'Test Social Proof',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test social proof mechanisms',
        systemPrompt: 'Test agent'
      });

      const source: SourceEmbedding = {
        id: 'test_source',
        name: 'Test Source',
        description: 'Test source for social proof',
        reliability: 0.7,
        expertise: 0.6,
        alignment: 0.5
      };

      iris.addSource(source);

      // Update trust with positive feedback
      iris.updateSourceTrust('test_source', 0.2);

      // Check that social proof metrics were updated
      const metrics = iris.socialProofMetrics.find(m => m.sourceId === 'test_source');
      assert(metrics !== undefined);
      assert(typeof metrics.communityValidation === 'number');
      assert(typeof metrics.impactScore === 'number');
    });
  }

  async testProphetIncentives() {
    console.log('\n🔮 Testing Prophet Incentives...');

    await this.test('Prophet Incentive Tracking', async () => {
      const iris = new IrisAgent({
        id: 'test_prophet_tracking',
        name: 'Test Prophet Tracking',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test prophet incentive tracking',
        systemPrompt: 'Test agent'
      });

      const source: SourceEmbedding = {
        id: 'test_source',
        name: 'Test Source',
        description: 'Test source for prophet incentives',
        reliability: 0.8,
        expertise: 0.7,
        alignment: 0.6
      };

      iris.addSource(source);

      // Calculate prophet incentive
      const reward = iris.calculateProphetIncentive('test_pred', true, 'test_source');

      // Check that incentive was recorded
      assert(iris.prophetIncentives.length > 0);
      const incentive = iris.prophetIncentives[0];
      assert(incentive.sourceId === 'test_source');
      assert(incentive.reward === reward);
    });
  }

  async testWorkflowIntegration() {
    console.log('\n🔄 Testing Workflow Integration...');

    await this.test('Multi-Agent Coordination', async () => {
      // This test would verify that multiple agents can work together
      // For now, we'll test basic agent instantiation and interaction

      const iris = new IrisAgent({
        id: 'integration_iris',
        name: 'Integration Iris',
        unitId: 'integration_unit',
        unitName: 'Integration Unit',
        description: 'Iris for integration testing',
        systemPrompt: 'Integration test agent'
      });

      const ft = new FourThoughtAgent({
        id: 'integration_ft',
        name: 'Integration FourThought',
        unitId: 'integration_unit',
        unitName: 'Integration Unit',
        description: 'FourThought for integration testing',
        topic: 'integration testing'
      });

      const ledger = new SemanticLedgerAgent({
        id: 'integration_ledger',
        name: 'Integration Ledger',
        unitId: 'integration_unit',
        unitName: 'Integration Unit',
        description: 'Ledger for integration testing'
      });

      assert(iris.id === 'integration_iris');
      assert(ft.id === 'integration_ft');
      assert(ledger.id === 'integration_ledger');

      // Test that agents can be instantiated together
      assert(true);
    });
  }

  async testMultiAgentCoordination() {
    console.log('\n🤝 Testing Multi-Agent Coordination...');

    await this.test('Agent Communication Patterns', async () => {
      // Test that agents can share data and coordinate

      const iris1 = new IrisAgent({
        id: 'coord_iris1',
        name: 'Coordination Iris 1',
        unitId: 'coord_unit',
        unitName: 'Coordination Unit',
        description: 'First coordination agent',
        systemPrompt: 'Coordination test agent 1'
      });

      const iris2 = new IrisAgent({
        id: 'coord_iris2',
        name: 'Coordination Iris 2',
        unitId: 'coord_unit',
        unitName: 'Coordination Unit',
        description: 'Second coordination agent',
        systemPrompt: 'Coordination test agent 2'
      });

      // Test trust distribution sharing
      const source: SourceEmbedding = {
        id: 'shared_source',
        name: 'Shared Source',
        description: 'Source shared between agents',
        reliability: 0.8,
        expertise: 0.7,
        alignment: 0.6
      };

      iris1.addSource(source);
      iris2.addSource(source);

      // Both should have the source
      assert(iris1.sources.length === 1);
      assert(iris2.sources.length === 1);

      // Test that they can maintain separate trust distributions
      iris1.updateSourceTrust('shared_source', 0.1);
      iris2.updateSourceTrust('shared_source', -0.1);

      assert(iris1.trustDistribution.get('shared_source') !== iris2.trustDistribution.get('shared_source'));
    });
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');

    await this.test('Agent Processing Speed', async () => {
      const startTime = Date.now();

      // Create and process multiple agents
      for (let i = 0; i < 5; i++) {
        const iris = new IrisAgent({
          id: `perf_iris_${i}`,
          name: `Performance Iris ${i}`,
          unitId: 'perf_unit',
          unitName: 'Performance Unit',
          description: `Performance test agent ${i}`,
          systemPrompt: `Performance test agent ${i}`
        });

        const source: SourceEmbedding = {
          id: `perf_source_${i}`,
          name: `Performance Source ${i}`,
          description: `Performance test source ${i}`,
          reliability: 0.7,
          expertise: 0.6,
          alignment: 0.5
        };

        iris.addSource(source);
        iris.generateTemporalEmbedding(`perf_source_${i}`, new Date().toISOString());
      }

      const duration = Date.now() - startTime;
      assert(duration < 5000); // Should complete in under 5 seconds
    });

    await this.test('Memory Usage', async () => {
      // Test that agents don't leak memory excessively
      const initialMemory = process.memoryUsage().heapUsed;

      // Create multiple agents and perform operations
      const agents = [];
      for (let i = 0; i < 10; i++) {
        const iris = new IrisAgent({
          id: `memory_iris_${i}`,
          name: `Memory Iris ${i}`,
          unitId: 'memory_unit',
          unitName: 'Memory Unit',
          description: `Memory test agent ${i}`,
          systemPrompt: `Memory test agent ${i}`
        });

        agents.push(iris);

        // Add sources and perform operations
        for (let j = 0; j < 5; j++) {
          const source: SourceEmbedding = {
            id: `memory_source_${i}_${j}`,
            name: `Memory Source ${i}_${j}`,
            description: `Memory test source ${i}_${j}`,
            reliability: 0.7,
            expertise: 0.6,
            alignment: 0.5
          };

          iris.addSource(source);
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for test)
      assert(memoryIncrease < 50 * 1024 * 1024);
    });
  }

  async testReliability() {
    console.log('\n🛡️ Testing Reliability...');

    await this.test('Error Handling', async () => {
      const iris = new IrisAgent({
        id: 'error_test',
        name: 'Error Test',
        unitId: 'error_unit',
        unitName: 'Error Unit',
        description: 'Test error handling',
        systemPrompt: 'Error test agent'
      });

      // Test with invalid source ID
      iris.updateSourceTrust('nonexistent_source', 0.1);

      // Should not throw error, should handle gracefully
      assert(true);
    });

    await this.test('Data Consistency', async () => {
      const ledger = new SemanticLedgerAgent({
        id: 'consistency_test',
        name: 'Consistency Test',
        unitId: 'consistency_unit',
        unitName: 'Consistency Unit',
        description: 'Test data consistency'
      });

      const context = this.createMockContext();

      // Store some thoughts
      const thoughts = [
        { type: 'statement', content: 'Test statement 1', author: 'Author 1' },
        { type: 'prediction', content: 'Test prediction 1', author: 'Author 1' },
        { type: 'reflection', content: 'Test reflection 1', author: 'Author 2' }
      ];

      await ledger.process({ operation: 'store', thoughts }, context);

      // Query and verify data integrity
      const result = await ledger.process({ operation: 'query', query: 'test' }, context);

      assert(result.status === 'success');
      assert(Array.isArray(result.results));
    });
  }

  async testVisualizationGeneration() {
    console.log('\n📊 Testing Visualization Generation...');

    await this.test('Visualization Agent Creation', async () => {
      const vizAgent = new TrustVisualizationAgent({
        id: 'test_viz',
        name: 'Test Visualization',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test visualization agent',
        visualizationType: 'network'
      });

      assert(vizAgent.id === 'test_viz');
      assert(vizAgent.visualizationType === 'network');
    });

    await this.test('Visualization Data Processing', async () => {
      const vizAgent = new TrustVisualizationAgent({
        id: 'test_viz_data',
        name: 'Test Viz Data',
        unitId: 'test_unit',
        unitName: 'Test Unit',
        description: 'Test visualization data processing',
        visualizationType: 'timeline'
      });

      const testData = {
        thoughts: [
          { type: 'prediction', content: 'Test prediction', timestamp: new Date().toISOString(), valence: 0.8, uncertainty: 0.2 },
          { type: 'reflection', content: 'Test reflection', timestamp: new Date().toISOString(), valence: 0.3, uncertainty: 0.7 }
        ]
      };

      const context = this.createMockContext();
      const result = await vizAgent.process(testData, context);

      assert(result.visualization_id);
      assert(result.visualization_type === 'timeline');
      assert(typeof result.html_content === 'string');
    });
  }

  printSummary() {
    console.log(`

╔════════════════════════════════════════════════════════════════╗
║                    Test Summary                                ║
╚════════════════════════════════════════════════════════════════╝

📊 Results:
  ✅ Passed: ${this.testResults.passed}
  ❌ Failed: ${this.testResults.failed}
  📈 Total:  ${this.testResults.total}
  🎯 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%

${this.testResults.failed === 0 ?
  '🎉 All tests passed! The Cognicism framework is working correctly.' :
  '⚠️  Some tests failed. Please review the implementation.'}

📁 Test output directory: ${this.testOutputDir}
    `);

    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests.filter(t => t.status === 'failed').forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`);
      });
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new CognicismTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = { CognicismTestSuite };
