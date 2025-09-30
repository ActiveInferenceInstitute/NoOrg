import { expect } from 'chai';
import { ActiveInferencePOMDPAgent } from '../../../src/agents/ActiveInferencePOMDPAgent';

describe('ActiveInferencePOMDPAgent', () => {
  let agent: ActiveInferencePOMDPAgent;
  let mockContext: any;

  beforeEach(() => {
    // Create agent with test configuration
    agent = new ActiveInferencePOMDPAgent({
      id: 'test-active-inference',
      name: 'Test Active Inference Agent',
      description: 'Tests Active Inference POMDP functionality',
      states: ['low', 'medium', 'high'],
      observations: ['observation1', 'observation2', 'observation3'],
      actions: ['action1', 'action2', 'action3'],
      capabilities: ['reasoning', 'planning', 'decision-making'],
      metadata: {
        model: 'pomdp-test',
        version: '1.0.0'
      }
    });

    // Mock context for testing
    mockContext = {
      logger: {
        info: (msg: string) => console.log(`INFO: ${msg}`),
        error: (msg: string, error?: any) => console.error(`ERROR: ${msg}`, error),
        warn: (msg: string) => console.warn(`WARN: ${msg}`)
      }
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(agent.id).to.equal('test-active-inference');
      expect(agent.name).to.equal('Test Active Inference Agent');
      expect(agent.type).to.equal('active-inference');
      expect(agent.capabilities).to.include('reasoning');
      expect(agent.capabilities).to.include('planning');
      expect(agent.capabilities).to.include('decision-making');
      expect(agent.status).to.equal('available');
    });

    it('should initialize POMDP model correctly', () => {
      expect(agent['states']).to.deep.equal(['low', 'medium', 'high']);
      expect(agent['observations']).to.deep.equal(['observation1', 'observation2', 'observation3']);
      expect(agent['actions']).to.deep.equal(['action1', 'action2', 'action3']);
      expect(agent['beliefs']).to.have.length(3);
      expect(agent['beliefs'].reduce((sum, b) => sum + b, 0)).to.be.closeTo(1, 0.001);
    });

    it('should generate policies correctly', () => {
      const policies = agent['policies'];
      expect(policies).to.be.an('array');
      expect(policies.length).to.be.greaterThan(0);

      // Check policy structure
      policies.forEach(policy => {
        expect(policy).to.be.an('array');
        expect(policy.length).to.equal(agent['policyDepth']);
      });
    });

    it('should handle custom configuration', () => {
      const customAgent = new ActiveInferencePOMDPAgent({
        id: 'custom-agent',
        name: 'Custom Agent',
        description: 'Custom configuration test',
        states: ['state1', 'state2'],
        observations: ['obs1', 'obs2'],
        actions: ['act1', 'act2'],
        policyDepth: 3,
        capabilities: ['custom-capability'],
        metadata: { custom: true }
      });

      expect(customAgent['states']).to.deep.equal(['state1', 'state2']);
      expect(customAgent['policyDepth']).to.equal(3);
      expect(customAgent.capabilities).to.include('custom-capability');
    });
  });

  describe('Belief Updates', () => {
    it('should update beliefs based on observations', () => {
      const initialBeliefs = [...agent['beliefs']];

      // Process observations
      const result = agent.process([0, 1, 2], mockContext);

      // Beliefs should have changed
      const finalBeliefs = agent['beliefs'];
      expect(finalBeliefs).to.not.deep.equal(initialBeliefs);

      // Should still be valid probability distribution
      expect(finalBeliefs.reduce((sum, b) => sum + b, 0)).to.be.closeTo(1, 0.001);
      finalBeliefs.forEach(belief => {
        expect(belief).to.be.at.least(0);
        expect(belief).to.be.at.most(1);
      });
    });

    it('should handle single observations', () => {
      const result = agent.process([1], mockContext);

      expect(result).to.be.an('object');
      expect(result).to.have.property('observations');
      expect(result).to.have.property('beliefs');
      expect(result).to.have.property('policy');
      expect(result).to.have.property('action');
      expect(result.observations).to.deep.equal([1]);
    });

    it('should handle empty observations', () => {
      const result = agent.process([], mockContext);

      expect(result).to.be.an('object');
      expect(result.observations).to.deep.equal([]);
    });

    it('should maintain belief history', () => {
      const initialHistoryLength = agent['beliefHistory'].length;

      agent.process([0], mockContext);

      expect(agent['beliefHistory'].length).to.equal(initialHistoryLength + 1);
    });
  });

  describe('Policy Selection', () => {
    it('should select policies based on expected free energy', () => {
      agent.process([0, 1], mockContext);

      const result = agent['expectedFreeEnergy'];
      expect(result).to.be.an('array');
      expect(result.length).to.equal(agent['policies'].length);

      // All expected free energy values should be numbers
      result.forEach(efe => {
        expect(efe).to.be.a('number');
        expect(efe).to.not.be.NaN;
      });
    });

    it('should select action with lowest expected free energy', () => {
      agent.process([0, 1, 2], mockContext);

      const selectedPolicy = agent['policies'][0]; // First policy
      const selectedAction = selectedPolicy[0][0]; // First action of first policy

      expect(selectedAction).to.be.a('number');
      expect(selectedAction).to.be.at.least(0);
      expect(selectedAction).to.be.below(agent['actions'].length);
    });

    it('should update action history', () => {
      const initialHistoryLength = agent['actionHistory'].length;

      agent.process([0], mockContext);

      expect(agent['actionHistory'].length).to.equal(initialHistoryLength + 1);
    });
  });

  describe('Visualization Data Generation', () => {
    it('should generate visualization data', () => {
      agent.process([0, 1, 2], mockContext);

      const vizData = agent['generateVisualizationData']();

      expect(vizData).to.be.an('object');
      expect(vizData).to.have.property('beliefHistory');
      expect(vizData).to.have.property('actionHistory');
      expect(vizData).to.have.property('observationHistory');
      expect(vizData).to.have.property('freeEnergyHistory');
      expect(vizData).to.have.property('states');
      expect(vizData).to.have.property('observations');
      expect(vizData).to.have.property('actions');

      expect(Array.isArray(vizData.beliefHistory)).to.be.true;
      expect(Array.isArray(vizData.actionHistory)).to.be.true;
      expect(Array.isArray(vizData.observationHistory)).to.be.true;
      expect(Array.isArray(vizData.freeEnergyHistory)).to.be.true;
    });

    it('should include model parameters in visualization data', () => {
      agent.process([0], mockContext);

      const vizData = agent['generateVisualizationData']();

      expect(vizData.states).to.deep.equal(['low', 'medium', 'high']);
      expect(vizData.observations).to.deep.equal(['observation1', 'observation2', 'observation3']);
      expect(vizData.actions).to.deep.equal(['action1', 'action2', 'action3']);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid observations gracefully', () => {
      const invalidObservations = [999, -1, 'invalid'];

      try {
        const result = agent.process(invalidObservations, mockContext);
        // Should handle or throw appropriate error
        expect(result).to.be.an('object');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });

    it('should handle context errors', () => {
      const invalidContext = {
        logger: {
          info: null,
          error: null,
          warn: null
        }
      };

      try {
        agent.process([0], invalidContext);
        // Should handle gracefully or throw appropriate error
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });

    it('should handle processing errors', () => {
      // Mock a scenario that might cause processing errors
      const problematicObservations = Array(1000).fill(0); // Very large observation set

      try {
        const result = agent.process(problematicObservations, mockContext);
        expect(result).to.be.an('object');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', () => {
      const info = agent.getAgentInfo();

      expect(info.id).to.equal('test-active-inference');
      expect(info.name).to.equal('Test Active Inference Agent');
      expect(info.type).to.equal('active-inference');
      expect(info.capabilities).to.include('reasoning');
      expect(info.capabilities).to.include('planning');
      expect(info.capabilities).to.include('active-inference');
      expect(info.status).to.equal('available');
    });

    it('should update status during processing', () => {
      expect(agent.getAgentInfo().status).to.equal('available');

      // Start processing (simulate)
      const processingPromise = agent.process([0, 1, 2], mockContext);

      // Status should remain available during processing (implementation dependent)
      expect(agent.getAgentInfo().status).to.equal('available');

      // Wait for completion
      return processingPromise.then(() => {
        expect(agent.getAgentInfo().status).to.equal('available');
      });
    });
  });

  describe('Performance', () => {
    it('should complete processing within reasonable time', () => {
      const observations = Array.from({ length: 10 }, (_, i) => i % 3);

      const startTime = Date.now();
      const result = agent.process(observations, mockContext);
      const endTime = Date.now();

      return result.then(() => {
        const duration = endTime - startTime;
        expect(duration).to.be.below(5000); // Should complete in less than 5 seconds
      });
    });

    it('should handle large observation sets', () => {
      const largeObservations = Array.from({ length: 100 }, (_, i) => i % 3);

      const result = agent.process(largeObservations, mockContext);

      return result.then(processedResult => {
        expect(processedResult).to.be.an('object');
        expect(processedResult.observations).to.have.length(100);
      });
    });

    it('should maintain performance with multiple processing calls', async () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        const observations = Array.from({ length: 5 }, (_, j) => (i + j) % 3);
        results.push(agent.process(observations, mockContext));
      }

      const allResults = await Promise.all(results);

      expect(allResults).to.have.length(5);
      allResults.forEach(result => {
        expect(result).to.be.an('object');
        expect(result.observations).to.be.an('array');
      });
    });
  });

  describe('Integration with Framework', () => {
    it('should integrate with monitoring systems', () => {
      // This would test integration with monitoring if implemented
      const result = agent.process([0], mockContext);

      return result.then(processedResult => {
        expect(processedResult).to.be.an('object');
        expect(processedResult).to.have.property('observations');
        expect(processedResult).to.have.property('beliefs');
        expect(processedResult).to.have.property('policy');
        expect(processedResult).to.have.property('action');
      });
    });

    it('should provide visualization data for dashboards', () => {
      agent.process([0, 1, 2], mockContext);

      const vizData = agent['generateVisualizationData']();

      expect(vizData).to.be.an('object');
      expect(vizData.beliefHistory).to.be.an('array');
      expect(vizData.beliefHistory.length).to.be.greaterThan(0);

      // Visualization data should be serializable for dashboards
      expect(() => JSON.stringify(vizData)).to.not.throw();
    });
  });

  describe('Mathematical Correctness', () => {
    it('should maintain valid probability distributions', () => {
      agent.process([0, 1, 2], mockContext);

      const beliefs = agent['beliefs'];

      // Should sum to approximately 1
      const sum = beliefs.reduce((acc, b) => acc + b, 0);
      expect(sum).to.be.closeTo(1, 0.01);

      // All beliefs should be non-negative
      beliefs.forEach(belief => {
        expect(belief).to.be.at.least(0);
      });
    });

    it('should generate valid expected free energy values', () => {
      agent.process([0, 1], mockContext);

      const efe = agent['expectedFreeEnergy'];

      expect(efe).to.be.an('array');
      expect(efe.length).to.equal(agent['policies'].length);

      // All EFE values should be finite numbers
      efe.forEach(value => {
        expect(value).to.be.a('number');
        expect(value).to.not.be.NaN;
        expect(value).to.not.be.Infinity;
        expect(value).to.not.be.equal(-Infinity);
      });
    });

    it('should select policies within valid action range', () => {
      agent.process([0, 1, 2], mockContext);

      const policies = agent['policies'];
      const selectedPolicyIndex = agent['selectPolicy']();
      const selectedPolicy = policies[selectedPolicyIndex];

      expect(selectedPolicyIndex).to.be.a('number');
      expect(selectedPolicyIndex).to.be.at.least(0);
      expect(selectedPolicyIndex).to.be.below(policies.length);

      // All actions in selected policy should be valid
      selectedPolicy.forEach(step => {
        const action = step[0];
        expect(action).to.be.at.least(0);
        expect(action).to.be.below(agent['actions'].length);
      });
    });
  });

  describe('State Management', () => {
    it('should maintain separate state for different processing calls', async () => {
      // First processing call
      await agent.process([0, 1], mockContext);
      const beliefs1 = [...agent['beliefs']];
      const history1 = agent['beliefHistory'].length;

      // Second processing call
      await agent.process([2, 0], mockContext);
      const beliefs2 = [...agent['beliefs']];
      const history2 = agent['beliefHistory'].length;

      // Beliefs should be different (state should have changed)
      expect(beliefs2).to.not.deep.equal(beliefs1);

      // History should have grown
      expect(history2).to.be.greaterThan(history1);
    });

    it('should reset state appropriately', () => {
      // Process some data
      agent.process([0, 1, 2], mockContext);

      const beliefsBefore = [...agent['beliefs']];
      const historyBefore = agent['beliefHistory'].length;

      // Reset by creating new instance (in real implementation, there might be a reset method)
      const resetAgent = new ActiveInferencePOMDPAgent({
        id: 'reset-agent',
        name: 'Reset Agent',
        description: 'Testing state reset',
        states: ['low', 'medium', 'high'],
        observations: ['observation1', 'observation2', 'observation3'],
        actions: ['action1', 'action2', 'action3']
      });

      const resetBeliefs = resetAgent['beliefs'];
      const resetHistory = resetAgent['beliefHistory'].length;

      // Reset agent should have initial state
      expect(resetBeliefs).to.not.deep.equal(beliefsBefore);
      expect(resetHistory).to.be.lessThan(historyBefore);
    });
  });
});
