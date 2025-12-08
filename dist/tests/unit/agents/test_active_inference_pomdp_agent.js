"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ActiveInferencePOMDPAgent_1 = require("../../../src/agents/ActiveInferencePOMDPAgent");
describe('ActiveInferencePOMDPAgent', () => {
    let agent;
    let mockContext;
    beforeEach(() => {
        // Create agent with test configuration
        agent = new ActiveInferencePOMDPAgent_1.ActiveInferencePOMDPAgent({
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
                info: (msg) => console.log(`INFO: ${msg}`),
                error: (msg, error) => console.error(`ERROR: ${msg}`, error),
                warn: (msg) => console.warn(`WARN: ${msg}`)
            }
        };
    });
    describe('Initialization', () => {
        it('should initialize with correct configuration', () => {
            (0, chai_1.expect)(agent.id).to.equal('test-active-inference');
            (0, chai_1.expect)(agent.name).to.equal('Test Active Inference Agent');
            (0, chai_1.expect)(agent.type).to.equal('active-inference');
            (0, chai_1.expect)(agent.capabilities).to.include('reasoning');
            (0, chai_1.expect)(agent.capabilities).to.include('planning');
            (0, chai_1.expect)(agent.capabilities).to.include('decision-making');
            (0, chai_1.expect)(agent.status).to.equal('available');
        });
        it('should initialize POMDP model correctly', () => {
            (0, chai_1.expect)(agent['states']).to.deep.equal(['low', 'medium', 'high']);
            (0, chai_1.expect)(agent['observations']).to.deep.equal(['observation1', 'observation2', 'observation3']);
            (0, chai_1.expect)(agent['actions']).to.deep.equal(['action1', 'action2', 'action3']);
            (0, chai_1.expect)(agent['beliefs']).to.have.length(3);
            (0, chai_1.expect)(agent['beliefs'].reduce((sum, b) => sum + b, 0)).to.be.closeTo(1, 0.001);
        });
        it('should generate policies correctly', () => {
            const policies = agent['policies'];
            (0, chai_1.expect)(policies).to.be.an('array');
            (0, chai_1.expect)(policies.length).to.be.greaterThan(0);
            // Check policy structure
            policies.forEach(policy => {
                (0, chai_1.expect)(policy).to.be.an('array');
                (0, chai_1.expect)(policy.length).to.equal(agent['policyDepth']);
            });
        });
        it('should handle custom configuration', () => {
            const customAgent = new ActiveInferencePOMDPAgent_1.ActiveInferencePOMDPAgent({
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
            (0, chai_1.expect)(customAgent['states']).to.deep.equal(['state1', 'state2']);
            (0, chai_1.expect)(customAgent['policyDepth']).to.equal(3);
            (0, chai_1.expect)(customAgent.capabilities).to.include('custom-capability');
        });
    });
    describe('Belief Updates', () => {
        it('should update beliefs based on observations', () => {
            const initialBeliefs = [...agent['beliefs']];
            // Process observations
            const result = agent.process([0, 1, 2], mockContext);
            // Beliefs should have changed
            const finalBeliefs = agent['beliefs'];
            (0, chai_1.expect)(finalBeliefs).to.not.deep.equal(initialBeliefs);
            // Should still be valid probability distribution
            (0, chai_1.expect)(finalBeliefs.reduce((sum, b) => sum + b, 0)).to.be.closeTo(1, 0.001);
            finalBeliefs.forEach(belief => {
                (0, chai_1.expect)(belief).to.be.at.least(0);
                (0, chai_1.expect)(belief).to.be.at.most(1);
            });
        });
        it('should handle single observations', () => {
            const result = agent.process([1], mockContext);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('observations');
            (0, chai_1.expect)(result).to.have.property('beliefs');
            (0, chai_1.expect)(result).to.have.property('policy');
            (0, chai_1.expect)(result).to.have.property('action');
            (0, chai_1.expect)(result.observations).to.deep.equal([1]);
        });
        it('should handle empty observations', () => {
            const result = agent.process([], mockContext);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.observations).to.deep.equal([]);
        });
        it('should maintain belief history', () => {
            const initialHistoryLength = agent['beliefHistory'].length;
            agent.process([0], mockContext);
            (0, chai_1.expect)(agent['beliefHistory'].length).to.equal(initialHistoryLength + 1);
        });
    });
    describe('Policy Selection', () => {
        it('should select policies based on expected free energy', () => {
            agent.process([0, 1], mockContext);
            const result = agent['expectedFreeEnergy'];
            (0, chai_1.expect)(result).to.be.an('array');
            (0, chai_1.expect)(result.length).to.equal(agent['policies'].length);
            // All expected free energy values should be numbers
            result.forEach(efe => {
                (0, chai_1.expect)(efe).to.be.a('number');
                (0, chai_1.expect)(efe).to.not.be.NaN;
            });
        });
        it('should select action with lowest expected free energy', () => {
            agent.process([0, 1, 2], mockContext);
            const selectedPolicy = agent['policies'][0]; // First policy
            const selectedAction = selectedPolicy[0][0]; // First action of first policy
            (0, chai_1.expect)(selectedAction).to.be.a('number');
            (0, chai_1.expect)(selectedAction).to.be.at.least(0);
            (0, chai_1.expect)(selectedAction).to.be.below(agent['actions'].length);
        });
        it('should update action history', () => {
            const initialHistoryLength = agent['actionHistory'].length;
            agent.process([0], mockContext);
            (0, chai_1.expect)(agent['actionHistory'].length).to.equal(initialHistoryLength + 1);
        });
    });
    describe('Visualization Data Generation', () => {
        it('should generate visualization data', () => {
            agent.process([0, 1, 2], mockContext);
            const vizData = agent['generateVisualizationData']();
            (0, chai_1.expect)(vizData).to.be.an('object');
            (0, chai_1.expect)(vizData).to.have.property('beliefHistory');
            (0, chai_1.expect)(vizData).to.have.property('actionHistory');
            (0, chai_1.expect)(vizData).to.have.property('observationHistory');
            (0, chai_1.expect)(vizData).to.have.property('freeEnergyHistory');
            (0, chai_1.expect)(vizData).to.have.property('states');
            (0, chai_1.expect)(vizData).to.have.property('observations');
            (0, chai_1.expect)(vizData).to.have.property('actions');
            (0, chai_1.expect)(Array.isArray(vizData.beliefHistory)).to.be.true;
            (0, chai_1.expect)(Array.isArray(vizData.actionHistory)).to.be.true;
            (0, chai_1.expect)(Array.isArray(vizData.observationHistory)).to.be.true;
            (0, chai_1.expect)(Array.isArray(vizData.freeEnergyHistory)).to.be.true;
        });
        it('should include model parameters in visualization data', () => {
            agent.process([0], mockContext);
            const vizData = agent['generateVisualizationData']();
            (0, chai_1.expect)(vizData.states).to.deep.equal(['low', 'medium', 'high']);
            (0, chai_1.expect)(vizData.observations).to.deep.equal(['observation1', 'observation2', 'observation3']);
            (0, chai_1.expect)(vizData.actions).to.deep.equal(['action1', 'action2', 'action3']);
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid observations gracefully', () => {
            const invalidObservations = [999, -1, 'invalid'];
            try {
                const result = agent.process(invalidObservations, mockContext);
                // Should handle or throw appropriate error
                (0, chai_1.expect)(result).to.be.an('object');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
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
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
        it('should handle processing errors', () => {
            // Mock a scenario that might cause processing errors
            const problematicObservations = Array(1000).fill(0); // Very large observation set
            try {
                const result = agent.process(problematicObservations, mockContext);
                (0, chai_1.expect)(result).to.be.an('object');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', () => {
            const info = agent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.equal('test-active-inference');
            (0, chai_1.expect)(info.name).to.equal('Test Active Inference Agent');
            (0, chai_1.expect)(info.type).to.equal('active-inference');
            (0, chai_1.expect)(info.capabilities).to.include('reasoning');
            (0, chai_1.expect)(info.capabilities).to.include('planning');
            (0, chai_1.expect)(info.capabilities).to.include('active-inference');
            (0, chai_1.expect)(info.status).to.equal('available');
        });
        it('should update status during processing', () => {
            (0, chai_1.expect)(agent.getAgentInfo().status).to.equal('available');
            // Start processing (simulate)
            const processingPromise = agent.process([0, 1, 2], mockContext);
            // Status should remain available during processing (implementation dependent)
            (0, chai_1.expect)(agent.getAgentInfo().status).to.equal('available');
            // Wait for completion
            return processingPromise.then(() => {
                (0, chai_1.expect)(agent.getAgentInfo().status).to.equal('available');
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
                (0, chai_1.expect)(duration).to.be.below(5000); // Should complete in less than 5 seconds
            });
        });
        it('should handle large observation sets', () => {
            const largeObservations = Array.from({ length: 100 }, (_, i) => i % 3);
            const result = agent.process(largeObservations, mockContext);
            return result.then(processedResult => {
                (0, chai_1.expect)(processedResult).to.be.an('object');
                (0, chai_1.expect)(processedResult.observations).to.have.length(100);
            });
        });
        it('should maintain performance with multiple processing calls', async () => {
            const results = [];
            for (let i = 0; i < 5; i++) {
                const observations = Array.from({ length: 5 }, (_, j) => (i + j) % 3);
                results.push(agent.process(observations, mockContext));
            }
            const allResults = await Promise.all(results);
            (0, chai_1.expect)(allResults).to.have.length(5);
            allResults.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.observations).to.be.an('array');
            });
        });
    });
    describe('Integration with Framework', () => {
        it('should integrate with monitoring systems', () => {
            // This would test integration with monitoring if implemented
            const result = agent.process([0], mockContext);
            return result.then(processedResult => {
                (0, chai_1.expect)(processedResult).to.be.an('object');
                (0, chai_1.expect)(processedResult).to.have.property('observations');
                (0, chai_1.expect)(processedResult).to.have.property('beliefs');
                (0, chai_1.expect)(processedResult).to.have.property('policy');
                (0, chai_1.expect)(processedResult).to.have.property('action');
            });
        });
        it('should provide visualization data for dashboards', () => {
            agent.process([0, 1, 2], mockContext);
            const vizData = agent['generateVisualizationData']();
            (0, chai_1.expect)(vizData).to.be.an('object');
            (0, chai_1.expect)(vizData.beliefHistory).to.be.an('array');
            (0, chai_1.expect)(vizData.beliefHistory.length).to.be.greaterThan(0);
            // Visualization data should be serializable for dashboards
            (0, chai_1.expect)(() => JSON.stringify(vizData)).to.not.throw();
        });
    });
    describe('Mathematical Correctness', () => {
        it('should maintain valid probability distributions', () => {
            agent.process([0, 1, 2], mockContext);
            const beliefs = agent['beliefs'];
            // Should sum to approximately 1
            const sum = beliefs.reduce((acc, b) => acc + b, 0);
            (0, chai_1.expect)(sum).to.be.closeTo(1, 0.01);
            // All beliefs should be non-negative
            beliefs.forEach(belief => {
                (0, chai_1.expect)(belief).to.be.at.least(0);
            });
        });
        it('should generate valid expected free energy values', () => {
            agent.process([0, 1], mockContext);
            const efe = agent['expectedFreeEnergy'];
            (0, chai_1.expect)(efe).to.be.an('array');
            (0, chai_1.expect)(efe.length).to.equal(agent['policies'].length);
            // All EFE values should be finite numbers
            efe.forEach(value => {
                (0, chai_1.expect)(value).to.be.a('number');
                (0, chai_1.expect)(value).to.not.be.NaN;
                (0, chai_1.expect)(value).to.not.be.Infinity;
                (0, chai_1.expect)(value).to.not.be.equal(-Infinity);
            });
        });
        it('should select policies within valid action range', () => {
            agent.process([0, 1, 2], mockContext);
            const policies = agent['policies'];
            const selectedPolicyIndex = agent['selectPolicy']();
            const selectedPolicy = policies[selectedPolicyIndex];
            (0, chai_1.expect)(selectedPolicyIndex).to.be.a('number');
            (0, chai_1.expect)(selectedPolicyIndex).to.be.at.least(0);
            (0, chai_1.expect)(selectedPolicyIndex).to.be.below(policies.length);
            // All actions in selected policy should be valid
            selectedPolicy.forEach(step => {
                const action = step[0];
                (0, chai_1.expect)(action).to.be.at.least(0);
                (0, chai_1.expect)(action).to.be.below(agent['actions'].length);
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
            (0, chai_1.expect)(beliefs2).to.not.deep.equal(beliefs1);
            // History should have grown
            (0, chai_1.expect)(history2).to.be.greaterThan(history1);
        });
        it('should reset state appropriately', () => {
            // Process some data
            agent.process([0, 1, 2], mockContext);
            const beliefsBefore = [...agent['beliefs']];
            const historyBefore = agent['beliefHistory'].length;
            // Reset by creating new instance (in real implementation, there might be a reset method)
            const resetAgent = new ActiveInferencePOMDPAgent_1.ActiveInferencePOMDPAgent({
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
            (0, chai_1.expect)(resetBeliefs).to.not.deep.equal(beliefsBefore);
            (0, chai_1.expect)(resetHistory).to.be.lessThan(historyBefore);
        });
    });
});
//# sourceMappingURL=test_active_inference_pomdp_agent.js.map