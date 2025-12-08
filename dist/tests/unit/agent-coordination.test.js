"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Using Jest's built-in expect
const globals_1 = require("@jest/globals");
const test_helpers_1 = require("../utils/test-helpers");
describe('Multiagent Coordination', () => {
    describe('Agent Registration and Discovery', () => {
        it('should register an agent and find it by ID', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Create a test agent
            const agent = (0, test_helpers_1.createTestAgent)('research', ['research', 'web-search'], {
                name: 'Test Research Agent'
            });
            // Initialize coordinator
            await fixture.coordinator.initialize();
            // Register the agent and get the assigned ID
            const registeredId = await fixture.coordinator.registerAgent(agent);
            (0, globals_1.expect)(registeredId).toBeDefined();
            // Retrieve the agent using the registered ID
            const retrievedAgent = await fixture.agentRegistry.getAgent(registeredId);
            // Verify
            (0, globals_1.expect)(retrievedAgent).toBeDefined();
            (0, globals_1.expect)(retrievedAgent?.id).toBe(registeredId);
            (0, globals_1.expect)(retrievedAgent?.name).toBe('Test Research Agent');
            (0, globals_1.expect)(retrievedAgent?.type).toBe('research');
            (0, globals_1.expect)(retrievedAgent?.capabilities.map(c => c.name)).toEqual(globals_1.expect.arrayContaining(['research', 'web-search']));
            // Cleanup
            await fixture.coordinator.stop();
        });
        it('should find agents by capability', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Create test agents
            const researchAgent = (0, test_helpers_1.createTestAgent)('research', ['research', 'analysis'], {
                name: 'Research Agent'
            });
            const writerAgent = (0, test_helpers_1.createTestAgent)('writer', ['writing', 'editing'], {
                name: 'Writer Agent'
            });
            const hybridAgent = (0, test_helpers_1.createTestAgent)('hybrid', ['research', 'writing', 'planning'], {
                name: 'Hybrid Agent'
            });
            // Initialize coordinator
            await fixture.coordinator.initialize();
            // Register agents and capture assigned IDs
            const researchAgentId = await fixture.coordinator.registerAgent(researchAgent);
            const writerAgentId = await fixture.coordinator.registerAgent(writerAgent);
            const hybridAgentId = await fixture.coordinator.registerAgent(hybridAgent);
            // Find agents with research capability
            const researchAgents = await fixture.agentRegistry.findAgentsByCapability('research');
            // Verify research agents
            (0, globals_1.expect)(researchAgents.length).toBe(2);
            (0, globals_1.expect)(researchAgents.map(a => a.id)).toContain(researchAgentId);
            (0, globals_1.expect)(researchAgents.map(a => a.id)).toContain(hybridAgentId);
            // Find agents with writing capability
            const writingAgents = await fixture.agentRegistry.findAgentsByCapability('writing');
            // Verify writing agents
            (0, globals_1.expect)(writingAgents.length).toBe(2);
            (0, globals_1.expect)(writingAgents.map(a => a.id)).toContain(writerAgentId);
            (0, globals_1.expect)(writingAgents.map(a => a.id)).toContain(hybridAgentId);
            // Find agents with planning capability
            const planningAgents = await fixture.agentRegistry.findAgentsByCapability('planning');
            // Verify planning agents
            (0, globals_1.expect)(planningAgents.length).toBe(1);
            (0, globals_1.expect)(planningAgents[0].id).toBe(hybridAgentId);
            // Cleanup
            await fixture.coordinator.stop();
        });
    });
    describe('Task Management', () => {
        it('should create, assign, and complete a task', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Create a test agent
            const agent = (0, test_helpers_1.createTestAgent)('worker', ['processing'], {
                name: 'Worker Agent'
            });
            // Initialize coordinator
            await fixture.coordinator.initialize();
            // Register the agent and get assigned ID
            const agentId = await fixture.coordinator.registerAgent(agent);
            (0, globals_1.expect)(agentId).toBeDefined();
            // Create a task
            const taskDetails = (0, test_helpers_1.createTestTask)('processing', 'Process the data');
            const taskId = await fixture.taskManager.createTask(taskDetails);
            // Assign the task
            await fixture.taskManager.assignTask(taskId, agentId);
            // Check task assignment
            const task = await fixture.taskManager.getTask(taskId);
            (0, globals_1.expect)(task.assignedTo).toBe(agentId);
            (0, globals_1.expect)(task.status).toBe('assigned');
            // Start the task
            await fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
            // Check task status
            const inProgressTask = await fixture.taskManager.getTask(taskId);
            (0, globals_1.expect)(inProgressTask.status).toBe('in-progress');
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
            (0, globals_1.expect)(completedTask.status).toBe('completed');
            (0, globals_1.expect)(completedTask.metadata.result?.success).toBe(true);
            // Cleanup
            await fixture.coordinator.stop();
        });
        it('should handle task dependencies', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Create a test agent
            const agent = (0, test_helpers_1.createTestAgent)('worker', ['processing', 'analysis'], {
                name: 'Worker Agent'
            });
            // Initialize coordinator
            await fixture.coordinator.initialize();
            // Register the agent and get assigned ID
            const agentId = await fixture.coordinator.registerAgent(agent);
            (0, globals_1.expect)(agentId).toBeDefined();
            // Create tasks with dependencies
            const task1Details = (0, test_helpers_1.createTestTask)('processing', 'Collect data');
            const task1Id = await fixture.taskManager.createTask(task1Details);
            const task2Details = (0, test_helpers_1.createTestTask)('processing', 'Process data', {
                dependsOn: [task1Id]
            });
            const task2Id = await fixture.taskManager.createTask(task2Details);
            const task3Details = (0, test_helpers_1.createTestTask)('analysis', 'Analyze results', {
                dependsOn: [task2Id]
            });
            const task3Id = await fixture.taskManager.createTask(task3Details);
            // Check if dependencies are correctly set
            const task2 = await fixture.taskManager.getTask(task2Id);
            const task3 = await fixture.taskManager.getTask(task3Id);
            (0, globals_1.expect)(task2.dependsOn).toEqual([task1Id]);
            (0, globals_1.expect)(task3.dependsOn).toEqual([task2Id]);
            // Check if dependencies are satisfied (should not be initially)
            const task2Ready = await fixture.taskManager.areDependenciesSatisfied(task2Id);
            (0, globals_1.expect)(task2Ready).toBe(false);
            // Complete the first task
            await fixture.taskManager.assignTask(task1Id, agentId);
            await fixture.taskManager.updateTask(task1Id, { status: 'in-progress' });
            await fixture.taskManager.updateTask(task1Id, { status: 'completed' });
            // Now task2's dependencies should be satisfied
            const task2ReadyNow = await fixture.taskManager.areDependenciesSatisfied(task2Id);
            (0, globals_1.expect)(task2ReadyNow).toBe(true);
            // Task3's dependencies should still not be satisfied
            const task3Ready = await fixture.taskManager.areDependenciesSatisfied(task3Id);
            (0, globals_1.expect)(task3Ready).toBe(false);
            // Complete the second task
            await fixture.taskManager.assignTask(task2Id, agentId);
            await fixture.taskManager.updateTask(task2Id, { status: 'in-progress' });
            await fixture.taskManager.updateTask(task2Id, { status: 'completed' });
            // Now task3's dependencies should be satisfied
            const task3ReadyNow = await fixture.taskManager.areDependenciesSatisfied(task3Id);
            (0, globals_1.expect)(task3ReadyNow).toBe(true);
            // Cleanup
            await fixture.coordinator.stop();
        });
    });
    describe('Shared State Management', () => {
        it('should store and retrieve shared state', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Initialize the shared state
            await fixture.sharedStateManager.setState('test.value', 42);
            await fixture.sharedStateManager.setState('test.nested.value', 'hello');
            await fixture.sharedStateManager.setState('agents.count', 0);
            // Retrieve values
            const value = await fixture.sharedStateManager.getState('test.value');
            const nestedValue = await fixture.sharedStateManager.getState('test.nested.value');
            const agentCount = await fixture.sharedStateManager.getState('agents.count');
            // Verify
            (0, globals_1.expect)(value).toBe(42);
            (0, globals_1.expect)(nestedValue).toBe('hello');
            (0, globals_1.expect)(agentCount).toBe(0);
            // Update a value
            await fixture.sharedStateManager.setState('agents.count', 3);
            const updatedCount = await fixture.sharedStateManager.getState('agents.count');
            (0, globals_1.expect)(updatedCount).toBe(3);
        });
        it('should watch for changes in state', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            let watchedValue = null;
            let watchCallCount = 0;
            // Set up a watcher
            const subscriptionId = fixture.sharedStateManager.subscribe('test.watchable', (path, newValue) => {
                watchedValue = newValue;
                watchCallCount++;
            });
            // Make changes
            await fixture.sharedStateManager.setState('test.watchable', 'first');
            (0, globals_1.expect)(watchedValue).toBe('first');
            (0, globals_1.expect)(watchCallCount).toBe(1);
            await fixture.sharedStateManager.setState('test.watchable', 'second');
            (0, globals_1.expect)(watchedValue).toBe('second');
            (0, globals_1.expect)(watchCallCount).toBe(2);
            // Unwatch
            fixture.sharedStateManager.unsubscribe(subscriptionId);
            // Make another change, should not trigger the watcher
            await fixture.sharedStateManager.setState('test.watchable', 'third');
            (0, globals_1.expect)(watchedValue).toBe('second'); // Still the old value
            (0, globals_1.expect)(watchCallCount).toBe(2); // Still the old count
        });
    });
    describe('Agent Composability', () => {
        it('should create a composition of multiple agents and test it', async () => {
            const fixture = (0, test_helpers_1.createTestFixture)();
            // Create test agents
            const researchAgent = (0, test_helpers_1.createTestAgent)('research', ['research'], {
                name: 'Research Agent'
            });
            const analysisAgent = (0, test_helpers_1.createTestAgent)('analysis', ['analysis'], {
                name: 'Analysis Agent'
            });
            // Initialize coordinator
            await fixture.coordinator.initialize();
            // Register the agents
            await fixture.coordinator.registerAgent(researchAgent);
            await fixture.coordinator.registerAgent(analysisAgent);
            // Create a composition task that requires both capabilities
            const compositionTask = (0, test_helpers_1.createTestTask)('composite', 'Research and analyze data', {
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
            (0, globals_1.expect)(finalTask.status).toBe('completed');
            (0, globals_1.expect)(finalTask.metadata.result?.research?.topic).toBe('AI coordination');
            (0, globals_1.expect)(finalTask.metadata.result?.analysis?.insights).toHaveLength(2);
            // Cleanup
            await fixture.coordinator.stop();
        });
    });
});
//# sourceMappingURL=agent-coordination.test.js.map