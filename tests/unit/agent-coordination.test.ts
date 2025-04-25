import { expect } from 'chai';
import { createTestFixture, createTestAgent, createTestTask, runWorkflowTest, CompositeAgentTesting } from '../utils/test-helpers';
import { Agent } from '../../src/agents/types';
import { Task } from '../../src/core/multiagent/types';

describe('Multiagent Coordination', () => {
  describe('Agent Registration and Discovery', () => {
    it('should register an agent and find it by ID', async () => {
      const fixture = createTestFixture();
      
      // Create a test agent
      const agent: Agent = createTestAgent('research', ['research', 'web-search'], {
        name: 'Test Research Agent'
      });
      
      // Initialize coordinator
      await fixture.coordinator.initialize();
      
      // Register the agent
      await fixture.coordinator.registerAgent(agent);
      
      // Retrieve the agent
      const retrievedAgent = await fixture.agentRegistry.getAgent(agent.id);
      
      // Verify
      expect(retrievedAgent).to.not.be.undefined;
      expect(retrievedAgent.id).to.equal(agent.id);
      expect(retrievedAgent.name).to.equal('Test Research Agent');
      expect(retrievedAgent.type).to.equal('research');
      expect(retrievedAgent.capabilities).to.deep.equal(['research', 'web-search']);
      
      // Cleanup
      await fixture.coordinator.stop();
    });
    
    it('should find agents by capability', async () => {
      const fixture = createTestFixture();
      
      // Create test agents
      const researchAgent = createTestAgent('research', ['research', 'analysis'], {
        name: 'Research Agent'
      });
      
      const writerAgent = createTestAgent('writer', ['writing', 'editing'], {
        name: 'Writer Agent'
      });
      
      const hybridAgent = createTestAgent('hybrid', ['research', 'writing', 'planning'], {
        name: 'Hybrid Agent'
      });
      
      // Initialize coordinator
      await fixture.coordinator.initialize();
      
      // Register agents
      await fixture.coordinator.registerAgent(researchAgent);
      await fixture.coordinator.registerAgent(writerAgent);
      await fixture.coordinator.registerAgent(hybridAgent);
      
      // Find agents with research capability
      const researchAgents = await fixture.agentRegistry.findAgentsByCapability('research');
      
      // Verify research agents
      expect(researchAgents.length).to.equal(2);
      expect(researchAgents.map(a => a.id)).to.include(researchAgent.id);
      expect(researchAgents.map(a => a.id)).to.include(hybridAgent.id);
      
      // Find agents with writing capability
      const writingAgents = await fixture.agentRegistry.findAgentsByCapability('writing');
      
      // Verify writing agents
      expect(writingAgents.length).to.equal(2);
      expect(writingAgents.map(a => a.id)).to.include(writerAgent.id);
      expect(writingAgents.map(a => a.id)).to.include(hybridAgent.id);
      
      // Find agents with planning capability
      const planningAgents = await fixture.agentRegistry.findAgentsByCapability('planning');
      
      // Verify planning agents
      expect(planningAgents.length).to.equal(1);
      expect(planningAgents[0].id).to.equal(hybridAgent.id);
      
      // Cleanup
      await fixture.coordinator.stop();
    });
  });
  
  describe('Task Management', () => {
    it('should create, assign, and complete a task', async () => {
      const fixture = createTestFixture();
      
      // Create a test agent
      const agent = createTestAgent('worker', ['processing'], {
        name: 'Worker Agent'
      });
      
      // Initialize coordinator
      await fixture.coordinator.initialize();
      
      // Register the agent
      await fixture.coordinator.registerAgent(agent);
      
      // Create a task
      const taskDetails: Partial<Task> = createTestTask('processing', 'Process the data');
      const taskId = await fixture.taskManager.createTask(taskDetails);
      
      // Assign the task
      await fixture.taskManager.assignTask(taskId, agent.id);
      
      // Check task assignment
      const task = await fixture.taskManager.getTask(taskId);
      expect(task.assignedTo).to.equal(agent.id);
      expect(task.status).to.equal('assigned');
      
      // Start the task
      await fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
      
      // Check task status
      const inProgressTask = await fixture.taskManager.getTask(taskId);
      expect(inProgressTask.status).to.equal('in-progress');
      
      // Complete the task
      await fixture.taskManager.updateTask(taskId, { 
        status: 'completed',
        metadata: {
          ...inProgressTask.metadata,
          result: { success: true, message: 'Data processed successfully' }
        }
      });
      
      // Check task completion
      const completedTask = await fixture.taskManager.getTask(taskId);
      expect(completedTask.status).to.equal('completed');
      expect(completedTask.metadata.result.success).to.equal(true);
      
      // Cleanup
      await fixture.coordinator.stop();
    });
    
    it('should handle task dependencies', async () => {
      const fixture = createTestFixture();
      
      // Create a test agent
      const agent = createTestAgent('worker', ['processing', 'analysis'], {
        name: 'Worker Agent'
      });
      
      // Initialize coordinator
      await fixture.coordinator.initialize();
      
      // Register the agent
      await fixture.coordinator.registerAgent(agent);
      
      // Create tasks with dependencies
      const task1Details: Partial<Task> = createTestTask('processing', 'Collect data');
      const task1Id = await fixture.taskManager.createTask(task1Details);
      
      const task2Details: Partial<Task> = createTestTask('processing', 'Process data', {
        dependsOn: [task1Id]
      });
      const task2Id = await fixture.taskManager.createTask(task2Details);
      
      const task3Details: Partial<Task> = createTestTask('analysis', 'Analyze results', {
        dependsOn: [task2Id]
      });
      const task3Id = await fixture.taskManager.createTask(task3Details);
      
      // Check if dependencies are correctly set
      const task2 = await fixture.taskManager.getTask(task2Id);
      const task3 = await fixture.taskManager.getTask(task3Id);
      
      expect(task2.dependsOn).to.deep.equal([task1Id]);
      expect(task3.dependsOn).to.deep.equal([task2Id]);
      
      // Check if dependencies are satisfied (should not be initially)
      const task2Ready = await fixture.taskManager.areDependenciesSatisfied(task2Id);
      expect(task2Ready).to.be.false;
      
      // Complete the first task
      await fixture.taskManager.assignTask(task1Id, agent.id);
      await fixture.taskManager.updateTask(task1Id, { status: 'in-progress' });
      await fixture.taskManager.updateTask(task1Id, { status: 'completed' });
      
      // Now task2's dependencies should be satisfied
      const task2ReadyNow = await fixture.taskManager.areDependenciesSatisfied(task2Id);
      expect(task2ReadyNow).to.be.true;
      
      // Task3's dependencies should still not be satisfied
      const task3Ready = await fixture.taskManager.areDependenciesSatisfied(task3Id);
      expect(task3Ready).to.be.false;
      
      // Complete the second task
      await fixture.taskManager.assignTask(task2Id, agent.id);
      await fixture.taskManager.updateTask(task2Id, { status: 'in-progress' });
      await fixture.taskManager.updateTask(task2Id, { status: 'completed' });
      
      // Now task3's dependencies should be satisfied
      const task3ReadyNow = await fixture.taskManager.areDependenciesSatisfied(task3Id);
      expect(task3ReadyNow).to.be.true;
      
      // Cleanup
      await fixture.coordinator.stop();
    });
  });
  
  describe('Shared State Management', () => {
    it('should store and retrieve shared state', async () => {
      const fixture = createTestFixture();
      
      // Initialize the shared state
      fixture.sharedStateManager.setState('test.value', 42);
      fixture.sharedStateManager.setState('test.nested.value', 'hello');
      fixture.sharedStateManager.setState('agents.count', 0);
      
      // Retrieve values
      const value = fixture.sharedStateManager.getState('test.value');
      const nestedValue = fixture.sharedStateManager.getState('test.nested.value');
      const agentCount = fixture.sharedStateManager.getState('agents.count');
      
      // Verify
      expect(value).to.equal(42);
      expect(nestedValue).to.equal('hello');
      expect(agentCount).to.equal(0);
      
      // Update a value
      fixture.sharedStateManager.setState('agents.count', 3);
      const updatedCount = fixture.sharedStateManager.getState('agents.count');
      expect(updatedCount).to.equal(3);
    });
    
    it('should watch for changes in state', async () => {
      const fixture = createTestFixture();
      
      let watchedValue = null;
      let watchCallCount = 0;
      
      // Set up a watcher
      fixture.sharedStateManager.watchState('test.watchable', (newValue, oldValue) => {
        watchedValue = newValue;
        watchCallCount++;
      });
      
      // Make changes
      fixture.sharedStateManager.setState('test.watchable', 'first');
      expect(watchedValue).to.equal('first');
      expect(watchCallCount).to.equal(1);
      
      fixture.sharedStateManager.setState('test.watchable', 'second');
      expect(watchedValue).to.equal('second');
      expect(watchCallCount).to.equal(2);
      
      // Unwatch
      fixture.sharedStateManager.unwatchState('test.watchable');
      
      // Make another change, should not trigger the watcher
      fixture.sharedStateManager.setState('test.watchable', 'third');
      expect(watchedValue).to.equal('second'); // Still the old value
      expect(watchCallCount).to.equal(2); // Still the old count
    });
  });
  
  describe('Agent Composability', () => {
    it('should create a composition of multiple agents and test it', async () => {
      const fixture = createTestFixture();
      
      // Create test agents
      const researchAgent = createTestAgent('research', ['research'], {
        name: 'Research Agent'
      });
      
      const analysisAgent = createTestAgent('analysis', ['analysis'], {
        name: 'Analysis Agent'
      });
      
      // Initialize coordinator
      await fixture.coordinator.initialize();
      
      // Register the agents
      await fixture.coordinator.registerAgent(researchAgent);
      await fixture.coordinator.registerAgent(analysisAgent);
      
      // Create a composition task that requires both capabilities
      const compositionTask: Partial<Task> = createTestTask('composite', 'Research and analyze data', {
        metadata: {
          requiredCapabilities: ['research', 'analysis'],
          input: {
            topic: 'AI coordination',
            depth: 'detailed'
          }
        }
      });
      
      const taskId = await fixture.taskManager.createTask(compositionTask);
      
      // Start the coordinator
      await fixture.coordinator.start();
      
      // Simulate the coordinator's work by updating tasks manually in this test
      
      // First, the research agent would work on the task
      await fixture.taskManager.assignTask(taskId, researchAgent.id);
      await fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
      
      // Update shared state with research results
      fixture.sharedStateManager.setState(`tasks.${taskId}.research_results`, {
        topic: 'AI coordination',
        sources: ['Source 1', 'Source 2'],
        findings: 'Key findings from research'
      });
      
      // Then, the analysis agent would analyze the results
      await fixture.taskManager.assignTask(taskId, analysisAgent.id);
      
      // Update shared state with analysis results
      fixture.sharedStateManager.setState(`tasks.${taskId}.analysis_results`, {
        insights: ['Insight 1', 'Insight 2'],
        recommendations: ['Recommendation 1', 'Recommendation 2']
      });
      
      // Complete the task
      await fixture.taskManager.updateTask(taskId, { 
        status: 'completed',
        metadata: {
          ...compositionTask.metadata,
          result: {
            research: fixture.sharedStateManager.getState(`tasks.${taskId}.research_results`),
            analysis: fixture.sharedStateManager.getState(`tasks.${taskId}.analysis_results`)
          }
        }
      });
      
      // Verify the final task state
      const finalTask = await fixture.taskManager.getTask(taskId);
      
      expect(finalTask.status).to.equal('completed');
      expect(finalTask.metadata.result.research.topic).to.equal('AI coordination');
      expect(finalTask.metadata.result.analysis.insights).to.have.lengthOf(2);
      
      // Cleanup
      await fixture.coordinator.stop();
    });
  });
}); 