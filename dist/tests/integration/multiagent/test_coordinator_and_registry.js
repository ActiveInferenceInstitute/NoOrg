"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const MultiAgentCoordinator_1 = require("../../../src/core/multiagent/MultiAgentCoordinator");
const AgentRegistry_1 = require("../../../src/core/multiagent/AgentRegistry");
const SharedStateManager_1 = require("../../../src/core/multiagent/SharedStateManager");
const TaskManager_1 = require("../../../src/core/multiagent/TaskManager");
const PromptManager_1 = require("../../../src/core/multiagent/PromptManager");
const OpenAIClient_1 = require("../../../src/core/multiagent/OpenAIClient");
const test_helpers_1 = require("../../utils/test_helpers");
(0, mocha_1.describe)('MultiAgentCoordinator and AgentRegistry Integration', () => {
    let coordinator;
    let agentRegistry;
    let sharedStateManager;
    let taskManager;
    let promptManager;
    let openAIClient;
    let tempDir;
    let promptsDir;
    let logger;
    let sandbox;
    (0, mocha_1.beforeEach)(async () => {
        sandbox = sinon_1.default.createSandbox();
        // Create temporary test directories
        tempDir = (0, test_helpers_1.createTempDirectory)(path_1.default.join(__dirname, '../../'), 'temp_test_coordinator');
        promptsDir = path_1.default.join(tempDir, 'prompts');
        if (!fs_1.default.existsSync(promptsDir)) {
            fs_1.default.mkdirSync(promptsDir, { recursive: true });
        }
        // Create test logger
        logger = (0, test_helpers_1.createTestLogger)(tempDir, 'coordinator_registry_test');
        // Create test prompt templates
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'system_role', 'You are {agent_name}, an AI assistant with capabilities: {capabilities}. Your primary goal is: {goal}.');
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'agent_coordination', 'Task: {task_description}\nAvailable agents: {available_agents}\nShared state: {shared_state}');
        // Create component instances
        agentRegistry = new AgentRegistry_1.AgentRegistry();
        sharedStateManager = new SharedStateManager_1.SharedStateManager();
        taskManager = new TaskManager_1.TaskManager();
        promptManager = new PromptManager_1.PromptManager(promptsDir);
        openAIClient = new OpenAIClient_1.OpenAIClient({
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
        coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator("TestCoordinator", {
            agentRegistry,
            sharedStateManager,
            taskManager,
            promptManager,
            openAIClient
        });
        // Initialize the coordinator
        await coordinator.initialize();
    });
    (0, mocha_1.afterEach)(() => {
        // Clean up after tests
        sandbox.restore();
        logger.close();
        (0, test_helpers_1.cleanupTempDirectory)(tempDir);
    });
    (0, mocha_1.it)('should register an agent and find it in the registry', async () => {
        // Arrange
        const testAgent = {
            name: 'Test Agent',
            type: 'research',
            description: 'A test agent for integration testing',
            capabilities: ['search', 'analyze'],
            status: 'available',
            metadata: { version: '1.0.0' },
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        // Act
        const agentId = await coordinator.registerAgent(testAgent);
        (0, chai_1.expect)(agentId).to.not.be.null;
        // The ID should be a string at this point
        const id = agentId;
        const foundAgent = await agentRegistry.getAgent(id);
        const allAgents = await agentRegistry.listAgents();
        // Assert
        (0, chai_1.expect)(foundAgent).to.not.be.null;
        (0, chai_1.expect)(foundAgent.name).to.equal(testAgent.name);
        (0, chai_1.expect)(foundAgent.type).to.equal(testAgent.type);
        (0, chai_1.expect)(allAgents).to.have.lengthOf(1);
        // Verify shared state was updated with agent information
        const sharedState = await sharedStateManager.getState('agents');
        (0, chai_1.expect)(sharedState).to.have.property(id);
    });
    (0, mocha_1.it)('should unregister an agent and remove it from the registry', async () => {
        // Arrange
        const testAgent = {
            name: 'Test Agent 3',
            type: 'research',
            description: 'A test agent to be unregistered',
            capabilities: ['search'],
            status: 'available',
            metadata: {},
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        const agentId = await coordinator.registerAgent(testAgent);
        (0, chai_1.expect)(agentId).to.not.be.null;
        // The ID should be a string at this point
        const id = agentId;
        // Confirm agent was registered
        const registeredAgents = await agentRegistry.listAgents();
        (0, chai_1.expect)(registeredAgents).to.have.lengthOf(1);
        // Act
        const result = await coordinator.unregisterAgent(id);
        const remainingAgents = await agentRegistry.listAgents();
        // Assert
        (0, chai_1.expect)(result).to.be.true;
        (0, chai_1.expect)(remainingAgents).to.have.lengthOf(0);
        // Verify shared state was updated to remove the agent
        const sharedState = await sharedStateManager.getState('agents');
        (0, chai_1.expect)(sharedState).to.not.have.property(id);
    });
    (0, mocha_1.it)('should assign a task to an agent', async () => {
        // Arrange
        const testAgent = {
            name: 'Test Agent 2',
            type: 'assistant',
            description: 'Another test agent for integration testing',
            capabilities: ['chat', 'recommend'],
            status: 'available',
            metadata: { version: '1.0.0' },
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        const agentId = await coordinator.registerAgent(testAgent);
        (0, chai_1.expect)(agentId).to.not.be.null;
        // The ID should be a string at this point
        const id = agentId;
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
        (0, chai_1.expect)(assignResult).to.be.true;
        (0, chai_1.expect)(updatedTask.assignedTo).to.equal(id);
        (0, chai_1.expect)(updatedTask.status).to.equal('assigned');
        // Verify shared state was updated with task assignment
        const sharedState = await sharedStateManager.getState('tasks');
        (0, chai_1.expect)(sharedState).to.have.property(taskId);
        (0, chai_1.expect)(sharedState[taskId].assignedTo).to.equal(id);
    });
    (0, mocha_1.it)('should retrieve agent information from the registry', async () => {
        // Arrange
        const testAgent = {
            name: 'Research Agent',
            type: 'research',
            description: 'Performs research tasks',
            capabilities: ['search', 'analyze', 'summarize'],
            status: 'available',
            metadata: { specialty: 'science' },
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        // Register the agent
        const agentId = await coordinator.registerAgent(testAgent);
        (0, chai_1.expect)(agentId).to.not.be.null;
        // The ID should be a string at this point
        const id = agentId;
        // Act - Retrieve by filter using the registry
        const researchAgents = await agentRegistry.findAgents({ types: ['research'] });
        const summarizeAgents = await agentRegistry.findAgents({ capabilities: ['summarize'] });
        // Assert
        (0, chai_1.expect)(researchAgents).to.have.lengthOf(1);
        (0, chai_1.expect)(researchAgents[0].id).to.equal(id);
        (0, chai_1.expect)(summarizeAgents).to.have.lengthOf(1);
        (0, chai_1.expect)(summarizeAgents[0].id).to.equal(id);
    });
});
//# sourceMappingURL=test_coordinator_and_registry.js.map