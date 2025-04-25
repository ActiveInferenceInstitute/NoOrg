import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { MultiAgentCoordinator } from '../../../src/core/multiagent/MultiAgentCoordinator';
import { AgentRegistry } from '../../../src/core/multiagent/AgentRegistry';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';
import { TaskManager } from '../../../src/core/multiagent/TaskManager';
import { PromptManager } from '../../../src/core/multiagent/PromptManager';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { Agent } from '../../../src/agents/types';
import { 
  createTempDirectory, 
  cleanupTempDirectory,
  createPromptTemplate,
  createTestLogger
} from '../../utils/test_helpers';

describe('MultiAgentCoordinator and AgentRegistry Integration', () => {
  let coordinator: MultiAgentCoordinator;
  let agentRegistry: AgentRegistry;
  let sharedStateManager: SharedStateManager;
  let taskManager: TaskManager;
  let promptManager: PromptManager;
  let openAIClient: OpenAIClient;
  let tempDir: string;
  let promptsDir: string;
  let logger: any;
  let sandbox: sinon.SinonSandbox;
  
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    
    // Create temporary test directories
    tempDir = createTempDirectory(path.join(__dirname, '../../'), 'temp_test_coordinator');
    promptsDir = path.join(tempDir, 'prompts');
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }
    
    // Create test logger
    logger = createTestLogger(tempDir, 'coordinator_registry_test');
    
    // Create test prompt templates
    createPromptTemplate(
      promptsDir,
      'system_role',
      'You are {agent_name}, an AI assistant with capabilities: {capabilities}. Your primary goal is: {goal}.'
    );
    
    createPromptTemplate(
      promptsDir,
      'agent_coordination',
      'Task: {task_description}\nAvailable agents: {available_agents}\nShared state: {shared_state}'
    );
    
    // Create component instances
    agentRegistry = new AgentRegistry();
    sharedStateManager = new SharedStateManager();
    taskManager = new TaskManager();
    promptManager = new PromptManager(promptsDir);
    openAIClient = new OpenAIClient({
      apiKey: 'test-api-key',
      defaultModel: 'test-model',
      maxTokens: 100,
      temperature: 0.7
    });
    
    // Mock OpenAI client to avoid actual API calls
    sandbox.stub(openAIClient, 'sendPrompt').resolves({
      id: 'test-response-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'test-model',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Test response content'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    });
    
    // Initialize coordinator with components
    coordinator = new MultiAgentCoordinator("TestCoordinator", {
      agentRegistry,
      sharedStateManager,
      taskManager,
      promptManager,
      openAIClient
    });
    
    // Initialize the coordinator
    await coordinator.initialize();
  });
  
  afterEach(() => {
    // Clean up after tests
    sandbox.restore();
    logger.close();
    cleanupTempDirectory(tempDir);
  });
  
  it('should register an agent and find it in the registry', async () => {
    // Arrange
    const testAgent = {
      name: 'Test Agent',
      type: 'research',
      description: 'A test agent for integration testing',
      capabilities: ['search', 'analyze'],
      status: 'available' as const,
      metadata: { version: '1.0.0' },
      lastActive: Date.now(),
      createdAt: Date.now()
    };
    
    // Act
    const agentId = await coordinator.registerAgent(testAgent);
    expect(agentId).to.not.be.null;
    
    // The ID should be a string at this point
    const id = agentId as string;
    
    const foundAgent = await agentRegistry.getAgent(id);
    const allAgents = await agentRegistry.listAgents();
    
    // Assert
    expect(foundAgent).to.not.be.null;
    expect(foundAgent!.name).to.equal(testAgent.name);
    expect(foundAgent!.type).to.equal(testAgent.type);
    expect(allAgents).to.have.lengthOf(1);
    
    // Verify shared state was updated with agent information
    const sharedState = await sharedStateManager.getState('agents');
    expect(sharedState).to.have.property(id);
  });
  
  it('should unregister an agent and remove it from the registry', async () => {
    // Arrange
    const testAgent = {
      name: 'Test Agent 3',
      type: 'research',
      description: 'A test agent to be unregistered',
      capabilities: ['search'],
      status: 'available' as const,
      metadata: {},
      lastActive: Date.now(),
      createdAt: Date.now()
    };
    
    const agentId = await coordinator.registerAgent(testAgent);
    expect(agentId).to.not.be.null;
    
    // The ID should be a string at this point
    const id = agentId as string;
    
    // Confirm agent was registered
    const registeredAgents = await agentRegistry.listAgents();
    expect(registeredAgents).to.have.lengthOf(1);
    
    // Act
    const result = await coordinator.unregisterAgent(id);
    const remainingAgents = await agentRegistry.listAgents();
    
    // Assert
    expect(result).to.be.true;
    expect(remainingAgents).to.have.lengthOf(0);
    
    // Verify shared state was updated to remove the agent
    const sharedState = await sharedStateManager.getState('agents');
    expect(sharedState).to.not.have.property(id);
  });
  
  it('should assign a task to an agent', async () => {
    // Arrange
    const testAgent = {
      name: 'Test Agent 2',
      type: 'assistant',
      description: 'Another test agent for integration testing',
      capabilities: ['chat', 'recommend'],
      status: 'available' as const,
      metadata: { version: '1.0.0' },
      lastActive: Date.now(),
      createdAt: Date.now()
    };
    
    const agentId = await coordinator.registerAgent(testAgent);
    expect(agentId).to.not.be.null;
    
    // The ID should be a string at this point
    const id = agentId as string;
    
    // Create a task
    const taskId = await taskManager.createTask({
      title: 'Test Task',
      description: 'A test task for integration testing',
      type: 'research',
      priority: 'medium',
      status: 'pending'
    });
    
    // Act
    const assignResult = await coordinator.assignTask(taskId, id);
    const updatedTask = await taskManager.getTask(taskId);
    
    // Assert
    expect(assignResult).to.be.true;
    expect(updatedTask!.assignedTo).to.equal(id);
    expect(updatedTask!.status).to.equal('assigned');
    
    // Verify shared state was updated with task assignment
    const sharedState = await sharedStateManager.getState('tasks');
    expect(sharedState).to.have.property(taskId);
    expect(sharedState[taskId].assignedTo).to.equal(id);
  });
  
  it('should retrieve agent information from the registry', async () => {
    // Arrange
    const testAgent = {
      name: 'Research Agent',
      type: 'research',
      description: 'Performs research tasks',
      capabilities: ['search', 'analyze', 'summarize'],
      status: 'available' as const,
      metadata: { specialty: 'science' },
      lastActive: Date.now(),
      createdAt: Date.now()
    };
    
    // Register the agent
    const agentId = await coordinator.registerAgent(testAgent);
    expect(agentId).to.not.be.null;
    
    // The ID should be a string at this point
    const id = agentId as string;
    
    // Act - Retrieve by filter using the registry
    const researchAgents = await agentRegistry.findAgents({ types: ['research'] });
    const summarizeAgents = await agentRegistry.findAgents({ capabilities: ['summarize'] });
    
    // Assert
    expect(researchAgents).to.have.lengthOf(1);
    expect(researchAgents[0].id).to.equal(id);
    
    expect(summarizeAgents).to.have.lengthOf(1);
    expect(summarizeAgents[0].id).to.equal(id);
  });
}); 