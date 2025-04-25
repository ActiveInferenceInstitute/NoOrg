import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { MultiAgentCoordinator } from '../../../src/core/multiagent/MultiAgentCoordinator';
import { AgentRegistry } from '../../../src/core/multiagent/AgentRegistry';
import { TaskManager } from '../../../src/core/multiagent/TaskManager';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';
import { PromptManager } from '../../../src/core/multiagent/PromptManager';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { Agent } from '../../../src/agents/types';
import path from 'path';
import fs from 'fs';

describe('MultiAgentCoordinator Integration', () => {
  let coordinator: MultiAgentCoordinator;
  let agentRegistry: AgentRegistry;
  let taskManager: TaskManager;
  let sharedState: SharedStateManager;
  let promptManager: PromptManager;
  let openAIClient: OpenAIClient;
  
  let tempPromptDir: string;
  
  beforeEach(async () => {
    // Create a temporary directory for prompt templates
    tempPromptDir = path.join(__dirname, 'temp_prompts');
    if (!fs.existsSync(tempPromptDir)) {
      fs.mkdirSync(tempPromptDir, { recursive: true });
    }
    
    // Create a basic system prompt template
    const systemPromptPath = path.join(tempPromptDir, 'system_role.prompt');
    fs.writeFileSync(systemPromptPath, 'You are {{agent_name}}, an AI assistant with capabilities: {{capabilities}}');
    
    // Initialize components
    agentRegistry = new AgentRegistry();
    taskManager = new TaskManager();
    sharedState = new SharedStateManager();
    promptManager = new PromptManager(tempPromptDir);
    
    // Stub OpenAI client to prevent actual API calls
    openAIClient = new OpenAIClient({
      apiKey: 'test-api-key',
      defaultModel: 'o3-mini'
    });
    
    sinon.stub(openAIClient, 'sendPrompt').resolves({
      id: 'test-response-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'o3-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a test response'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15
      }
    });
    
    // Create coordinator with all components
    coordinator = new MultiAgentCoordinator({
      agentRegistry,
      taskManager,
      sharedState,
      promptManager,
      openAIClient
    });
    
    // Initialize coordinator
    await coordinator.initialize();
  });
  
  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempPromptDir)) {
      fs.rmSync(tempPromptDir, { recursive: true, force: true });
    }
    
    // Restore all stubs
    sinon.restore();
  });
  
  describe('Agent Registration and Discovery', () => {
    it('should register agents and find them by capability', async () => {
      // Register research agent
      const researchAgent: Omit<Agent, 'id'> = {
        name: 'ResearchAgent',
        type: 'researcher',
        capabilities: ['research', 'information-retrieval'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      
      // Register writing agent
      const writingAgent: Omit<Agent, 'id'> = {
        name: 'WritingAgent',
        type: 'writer',
        capabilities: ['content-creation', 'editing'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      
      // Register multi-capability agent
      const multiAgent: Omit<Agent, 'id'> = {
        name: 'MultiAgent',
        type: 'assistant',
        capabilities: ['research', 'content-creation', 'summarization'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      
      // Register all agents
      const researchId = await coordinator.registerAgent(researchAgent);
      const writingId = await coordinator.registerAgent(writingAgent);
      const multiId = await coordinator.registerAgent(multiAgent);
      
      // Find agents by capability
      const researchAgents = await coordinator.findAgentsByCapability('research');
      const contentAgents = await coordinator.findAgentsByCapability('content-creation');
      
      // Verify correct agents are found
      expect(researchAgents.length).to.equal(2);
      expect(researchAgents.some(a => a.id === researchId)).to.be.true;
      expect(researchAgents.some(a => a.id === multiId)).to.be.true;
      
      expect(contentAgents.length).to.equal(2);
      expect(contentAgents.some(a => a.id === writingId)).to.be.true;
      expect(contentAgents.some(a => a.id === multiId)).to.be.true;
      
      // Verify agent retrieval by ID
      const agent = await coordinator.getAgent(researchId);
      expect(agent).to.not.be.undefined;
      expect(agent?.name).to.equal('ResearchAgent');
    });
    
    it('should update agent status', async () => {
      // Register an agent
      const agentId = await coordinator.registerAgent({
        name: 'StatusAgent',
        type: 'tester',
        capabilities: ['testing'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
      
      // Update status to busy
      await coordinator.updateAgentStatus(agentId, 'busy');
      
      // Verify status update
      const agent = await coordinator.getAgent(agentId);
      expect(agent?.status).to.equal('busy');
      
      // Find available agents (should not include our agent)
      const availableAgents = await coordinator.listAgents({ status: 'available' });
      expect(availableAgents.some(a => a.id === agentId)).to.be.false;
    });
  });
  
  describe('Task Creation and Assignment', () => {
    let agentId: string;
    
    beforeEach(async () => {
      // Register an agent for task assignment
      agentId = await coordinator.registerAgent({
        name: 'TaskAgent',
        type: 'worker',
        capabilities: ['processing'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
    });
    
    it('should create, assign, and execute tasks', async () => {
      // Create task
      const taskId = await coordinator.createTask({
        type: 'test',
        description: 'Test task for agent',
        priority: 'high'
      });
      
      // Assign task to agent
      await coordinator.assignTaskToAgent(taskId, agentId);
      
      // Verify task assignment
      const task = await coordinator.getTask(taskId);
      expect(task?.assignedTo).to.equal(agentId);
      expect(task?.status).to.equal('assigned');
      
      // Execute task
      await coordinator.startTask(taskId);
      
      // Verify task started
      const startedTask = await coordinator.getTask(taskId);
      expect(startedTask?.status).to.equal('in-progress');
      
      // Complete task
      await coordinator.completeTask(taskId, { outcome: 'Task completed successfully' });
      
      // Verify task completion
      const completedTask = await coordinator.getTask(taskId);
      expect(completedTask?.status).to.equal('completed');
    });
    
    it('should manage task dependencies', async () => {
      // Create parent task
      const parentTaskId = await coordinator.createTask({
        type: 'parent',
        description: 'Parent task',
        priority: 'high'
      });
      
      // Create child task with dependency
      const childTaskId = await coordinator.createTask({
        type: 'child',
        description: 'Child task',
        priority: 'medium',
        dependencies: [parentTaskId]
      });
      
      // Verify child task is not ready (parent not completed)
      const ready = await coordinator.areDependenciesSatisfied(childTaskId);
      expect(ready).to.be.false;
      
      // Complete parent task
      await coordinator.assignTaskToAgent(parentTaskId, agentId);
      await coordinator.startTask(parentTaskId);
      await coordinator.completeTask(parentTaskId, { outcome: 'Parent completed' });
      
      // Verify child task is now ready
      const readyAfterParent = await coordinator.areDependenciesSatisfied(childTaskId);
      expect(readyAfterParent).to.be.true;
      
      // Get ready tasks (should include child)
      const readyTasks = await coordinator.getReadyTasks();
      expect(readyTasks.some(t => t.id === childTaskId)).to.be.true;
    });
  });
  
  describe('Shared State Management', () => {
    it('should store and retrieve shared state between agents', async () => {
      // Register two agents
      const agent1Id = await coordinator.registerAgent({
        name: 'Agent1',
        type: 'worker',
        capabilities: ['processing'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
      
      const agent2Id = await coordinator.registerAgent({
        name: 'Agent2',
        type: 'worker',
        capabilities: ['processing'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
      
      // Agent 1 sets state
      await coordinator.setState('shared.data', {
        key: 'value',
        timestamp: Date.now()
      });
      
      // Set agent-specific state
      await coordinator.setState(`agents.${agent1Id}.private`, 'agent1-data');
      await coordinator.setState(`agents.${agent2Id}.private`, 'agent2-data');
      
      // Verify shared state is accessible
      const sharedData = coordinator.getState('shared.data');
      expect(sharedData).to.have.property('key', 'value');
      
      // Verify agent-specific state
      const agent1Data = coordinator.getState(`agents.${agent1Id}.private`);
      const agent2Data = coordinator.getState(`agents.${agent2Id}.private`);
      
      expect(agent1Data).to.equal('agent1-data');
      expect(agent2Data).to.equal('agent2-data');
    });
    
    it('should notify watchers when state changes', async () => {
      const callback = sinon.spy();
      
      // Watch a state path
      coordinator.watchState('observed.value', callback);
      
      // Set the value
      await coordinator.setState('observed.value', 'initial');
      
      // Update the value
      await coordinator.setState('observed.value', 'updated');
      
      // Verify callback was called twice
      expect(callback.calledTwice).to.be.true;
      expect(callback.secondCall.args[0]).to.equal('updated');
      expect(callback.secondCall.args[1]).to.equal('initial');
      
      // Unwatch the state
      coordinator.unwatchState('observed.value', callback);
      
      // Update again
      await coordinator.setState('observed.value', 'final');
      
      // Verify callback wasn't called again
      expect(callback.calledTwice).to.be.true;
    });
  });
  
  describe('Multi-Agent Task Workflow', () => {
    let researchAgentId: string;
    let writingAgentId: string;
    
    beforeEach(async () => {
      // Register research and writing agents
      researchAgentId = await coordinator.registerAgent({
        name: 'Researcher',
        type: 'researcher',
        capabilities: ['research', 'information-retrieval'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
      
      writingAgentId = await coordinator.registerAgent({
        name: 'Writer',
        type: 'writer',
        capabilities: ['content-creation'],
        status: 'available',
        createdAt: Date.now(),
        lastActive: Date.now()
      });
    });
    
    it('should execute a multi-agent workflow with task dependencies', async () => {
      // Create research task
      const researchTaskId = await coordinator.createTask({
        type: 'research',
        description: 'Research the topic',
        priority: 'high'
      });
      
      // Create content creation task (dependent on research)
      const contentTaskId = await coordinator.createTask({
        type: 'content',
        description: 'Create content based on research',
        priority: 'high',
        dependencies: [researchTaskId]
      });
      
      // Assign research task to research agent
      await coordinator.assignTaskToAgent(researchTaskId, researchAgentId);
      
      // Assign content task to writing agent
      await coordinator.assignTaskToAgent(contentTaskId, writingAgentId);
      
      // Execute research task
      await coordinator.startTask(researchTaskId);
      
      // Simulate research results
      await coordinator.setState(`tasks.${researchTaskId}.data`, {
        findings: ['finding1', 'finding2'],
        sources: ['source1', 'source2']
      });
      
      // Complete research task
      await coordinator.completeTask(researchTaskId, {
        outcome: 'Research completed',
        data: {
          findings: ['finding1', 'finding2'],
          sources: ['source1', 'source2']
        }
      });
      
      // Content task should now be ready
      const isReady = await coordinator.areDependenciesSatisfied(contentTaskId);
      expect(isReady).to.be.true;
      
      // Execute content task
      await coordinator.startTask(contentTaskId);
      
      // Simulate content creation
      await coordinator.setState(`tasks.${contentTaskId}.data`, {
        content: 'Generated content based on findings'
      });
      
      // Complete content task
      await coordinator.completeTask(contentTaskId, {
        outcome: 'Content created',
        data: {
          content: 'Generated content based on findings'
        }
      });
      
      // Verify both tasks completed
      const researchTask = await coordinator.getTask(researchTaskId);
      const contentTask = await coordinator.getTask(contentTaskId);
      
      expect(researchTask?.status).to.equal('completed');
      expect(contentTask?.status).to.equal('completed');
    });
  });
}); 