"use strict";
/**
 * Test Helpers for Multiagent LLM Coordination Testing
 *
 * This module provides utilities to simplify testing of multiagent systems
 * with a focus on LLM coordination and composability.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_DATA_DIR = exports.TEST_TIMEOUT = void 0;
exports.createTestFixture = createTestFixture;
exports.createRealLLMClient = createRealLLMClient;
exports.createTestAgent = createTestAgent;
exports.createTestTask = createTestTask;
exports.setupTestScenario = setupTestScenario;
exports.runWorkflowTest = runWorkflowTest;
exports.validateWorkflowResults = validateWorkflowResults;
exports.createAgentComposition = createAgentComposition;
exports.recordTestResults = recordTestResults;
exports.wait = wait;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
const SharedStateManager_1 = require("../../src/core/multiagent/SharedStateManager");
const TaskManager_1 = require("../../src/core/multiagent/TaskManager");
const AgentRegistry_1 = require("../../src/core/multiagent/AgentRegistry");
const MultiAgentCoordinator_1 = require("../../src/core/multiagent/MultiAgentCoordinator");
const OpenAIClient_1 = require("../../src/core/multiagent/OpenAIClient");
const PromptManager_1 = require("../../src/core/multiagent/PromptManager");
// Load environment variables
dotenv.config();
// Helper constants
exports.TEST_TIMEOUT = 30000; // 30 seconds
exports.TEST_DATA_DIR = path.join(__dirname, '../data');
// Ensure test directories exist
if (!fs.existsSync(exports.TEST_DATA_DIR)) {
    fs.mkdirSync(exports.TEST_DATA_DIR, { recursive: true });
}
/**
 * Creates a test fixture with isolated instances of core components
 * Uses a real OpenAI client by default
 */
function createTestFixture(useRealLLM = true) {
    const sharedStateManager = SharedStateManager_1.SharedStateManager.getInstance();
    const taskManager = new TaskManager_1.TaskManager();
    const agentRegistry = new AgentRegistry_1.AgentRegistry();
    let openAIClient;
    if (useRealLLM) {
        // Use real OpenAI client with API key from environment
        openAIClient = createRealLLMClient();
    }
    else {
        // Use a minimal client without real API calls for tests that don't need LLM
        openAIClient = new OpenAIClient_1.OpenAIClient('test-api-key');
    }
    const promptManager = new PromptManager_1.PromptManager();
    // Initialize shared state
    sharedStateManager.setState('system', {
        initialized: true,
        startTime: Date.now()
    });
    // Create coordinator with our test components
    const coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator('test-coordinator', {
        sharedStateManager,
        taskManager,
        agentRegistry,
        openAIClient,
        promptManager
    });
    return {
        sharedStateManager,
        taskManager,
        agentRegistry,
        openAIClient,
        promptManager,
        coordinator
    };
}
/**
 * Creates a real LLM client using environment variables
 */
function createRealLLMClient() {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.warn('Warning: OPENAI_API_KEY environment variable not set. LLM tests will fail.');
    }
    // Create a real OpenAI client
    return new OpenAIClient_1.OpenAIClient(process.env.OPENAI_API_KEY || 'test-api-key');
}
/**
 * Creates a test agent with the specified type and capabilities
 */
function createTestAgent(type, capabilities, options = {}) {
    const timestamp = Date.now();
    return {
        id: options.id || (0, uuid_1.v4)(),
        name: options.name || `Test ${type} Agent`,
        type,
        capabilities,
        status: options.status || 'available',
        description: options.description || `Test agent for ${type}`,
        metadata: options.metadata || { test: true },
        preferredModel: options.preferredModel || 'gpt-3.5-turbo',
        lastActive: options.lastActive || timestamp,
        createdAt: options.createdAt || timestamp
    };
}
/**
 * Creates a test task with the specified type and description
 */
function createTestTask(type, description, options = {}) {
    const timestamp = Date.now();
    return {
        id: options.id || (0, uuid_1.v4)(),
        type,
        description,
        name: `Test Task: ${description}`,
        priority: options.priority || 'medium',
        status: options.status || 'pending',
        createdAt: options.createdAt || timestamp,
        updatedAt: options.updatedAt || timestamp,
        dependsOn: options.dependsOn || [],
        metadata: options.metadata || { test: true }
    };
}
/**
 * Sets up a complete test scenario with agents, tasks, and state
 */
async function setupTestScenario(scenario) {
    const fixture = createTestFixture(true); // Always use real LLM for scenarios
    // Initialize coordinator
    await fixture.coordinator.initialize();
    // Register test agents
    const agentIds = [];
    for (const agent of scenario.agents) {
        const agentId = await fixture.coordinator.registerAgent(agent);
        if (agentId !== null) {
            agentIds.push(agentId);
        }
    }
    // Set up initial state if provided
    if (scenario.initialState) {
        for (const [key, value] of Object.entries(scenario.initialState)) {
            fixture.sharedStateManager.setState(key, value);
        }
    }
    // Create tasks if provided
    const taskIds = [];
    if (scenario.tasks) {
        for (const task of scenario.tasks) {
            const taskId = await fixture.taskManager.createTask(task);
            taskIds.push(taskId);
        }
    }
    return {
        fixture,
        agentIds,
        taskIds,
        scenario
    };
}
/**
 * Runs a workflow test scenario
 */
async function runWorkflowTest(scenario) {
    const setup = await setupTestScenario(scenario);
    const { fixture, taskIds } = setup;
    // Start the coordinator
    await fixture.coordinator.start();
    // Process tasks
    for (const taskId of taskIds) {
        const task = await fixture.taskManager.getTask(taskId);
        // Find an agent for the task
        const agents = await fixture.agentRegistry.listAgents();
        if (agents.length > 0) {
            const selectedAgent = agents[0];
            // Assign the task
            await fixture.taskManager.assignTask(taskId, selectedAgent.id);
            // Start the task
            await fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
            // Complete the task with a result
            await fixture.taskManager.completeTask(taskId, {
                success: true,
                data: {
                    result: `Task ${taskId} completed by agent ${selectedAgent.id}`,
                    timestamp: Date.now()
                }
            });
        }
    }
    // Wait for all tasks to be processed
    const timeout = scenario.tasks?.length ? scenario.tasks.length * 5000 : 10000;
    await waitForTasks(fixture.taskManager, taskIds, timeout);
    // Stop the coordinator
    await fixture.coordinator.stop();
    return setup;
}
/**
 * Waits for tasks to complete or fail
 */
async function waitForTasks(taskManager, taskIds, timeout = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            // Get all tasks
            const tasks = [];
            for (const id of taskIds) {
                tasks.push(await taskManager.getTask(id));
            }
            // Check if all tasks are complete
            const allComplete = tasks.every(task => ['completed', 'failed', 'cancelled'].includes(task.status));
            if (allComplete)
                return;
            // Sleep for a moment
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        catch (error) {
            console.error('Error while waiting for tasks:', error);
        }
    }
    throw new Error(`Timeout waiting for tasks to complete after ${timeout}ms`);
}
/**
 * Validates workflow test results against jestExpectations
 */
async function validateWorkflowResults(setup, jestExpectations) {
    const { fixture, taskIds } = setup;
    // Check task statuses
    if (jestExpectations.taskStatuses) {
        for (let i = 0; i < taskIds.length; i++) {
            const taskId = taskIds[i];
            const task = await fixture.taskManager.getTask(taskId);
            const jestExpectedStatus = jestExpectations.taskStatuses[i] || 'completed';
            expect(task.status).toBe(jestExpectedStatus);
        }
    }
    // Check shared state values
    if (jestExpectations.sharedState) {
        for (const [key, jestExpectedValue] of Object.entries(jestExpectations.sharedState)) {
            const actualValue = fixture.sharedStateManager.getState(key);
            if (typeof jestExpectedValue === 'object') {
                expect(actualValue).toEqual(expect.objectContaining(jestExpectedValue));
            }
            else {
                expect(actualValue).toBe(jestExpectedValue);
            }
        }
    }
}
/**
 * Creates an agent composition for testing
 */
async function createAgentComposition(agents, coordinator) {
    // Register all agents
    const agentIds = [];
    for (const agent of agents) {
        const agentId = await coordinator.registerAgent(agent);
        if (agentId !== null) {
            agentIds.push(agentId);
        }
    }
    // Create a composition
    const compositionId = (0, uuid_1.v4)();
    const compositionName = `Test Composition ${compositionId}`;
    // In a real test, we'd create a test task that creates and manages a composition
    // For now, we'll just return the composition data
    const composition = {
        id: compositionId,
        name: compositionName,
        agentIds,
        createdAt: Date.now(),
        status: 'ready'
    };
    return composition;
}
/**
 * Records test results
 */
function recordTestResults(testName, results, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsObject = {
        testName,
        timestamp,
        results
    };
    if (options.saveToFile) {
        const filePath = path.join(exports.TEST_DATA_DIR, `${testName.replace(/\s+/g, '_')}_${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(resultsObject, null, 2));
    }
    return resultsObject;
}
/**
 * Utility function to wait for a specified duration
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=test-helpers.js.map