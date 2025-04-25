/**
 * Test Helpers for Multiagent LLM Coordination Testing
 * 
 * This module provides utilities to simplify testing of multiagent systems
 * with a focus on LLM coordination and composability.
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { Agent, Capability } from '../../src/agents/types';
import { SharedStateManager } from '../../src/core/multiagent/SharedStateManager';
import { TaskManager } from '../../src/core/multiagent/TaskManager';
import { AgentRegistry } from '../../src/core/multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../../src/core/multiagent/MultiAgentCoordinator';
import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { PromptManager } from '../../src/core/multiagent/PromptManager';
import { Task } from '../../src/core/multiagent/types';

// Load environment variables
dotenv.config();

// Types for test fixtures
export interface TestAgent extends Agent {
  responses?: Record<string, any>;
}

export interface TestScenario {
  name: string;
  description: string;
  agents: TestAgent[];
  initialState?: Record<string, any>;
  tasks?: Partial<Task>[];
  expectedResults?: any;
}

// Helper constants
export const TEST_TIMEOUT = 30000; // 30 seconds
export const TEST_DATA_DIR = path.join(__dirname, '../data');

// Ensure test directories exist
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

/**
 * Creates a test fixture with isolated instances of core components
 * Uses a real OpenAI client by default
 */
export function createTestFixture(useRealLLM = true) {
  const sharedStateManager = new SharedStateManager();
  const taskManager = new TaskManager();
  const agentRegistry = new AgentRegistry();
  
  let openAIClient: OpenAIClient;
  
  if (useRealLLM) {
    // Use real OpenAI client with API key from environment
    openAIClient = createRealLLMClient();
  } else {
    // Use a minimal client without real API calls for tests that don't need LLM
    openAIClient = new OpenAIClient({
      apiKey: 'test-api-key',
      defaultModel: 'gpt-3.5-turbo'
    });
  }
  
  const promptManager = new PromptManager();
  
  // Initialize shared state
  sharedStateManager.setState('system', {
    initialized: true,
    startTime: Date.now()
  });
  
  // Create coordinator with our test components
  const coordinator = new MultiAgentCoordinator('test-coordinator', {
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
export function createRealLLMClient() {
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY environment variable not set. LLM tests will fail.');
  }
  
  // Create a real OpenAI client
  return new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
    maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000,
    temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.7,
    billingLimits: {
      maxMonthlySpend: process.env.MAX_MONTHLY_SPEND ? parseFloat(process.env.MAX_MONTHLY_SPEND) : 50,
      alertThreshold: process.env.ALERT_THRESHOLD ? parseFloat(process.env.ALERT_THRESHOLD) : 0.8
    }
  });
}

/**
 * Creates a test agent with the specified type and capabilities
 */
export function createTestAgent(
  type: string,
  capabilities: string[],
  options: Partial<TestAgent> = {}
): TestAgent {
  const timestamp = Date.now();
  return {
    id: options.id || uuidv4(),
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
export function createTestTask(
  type: string,
  description: string,
  options: Partial<Task> = {}
): Partial<Task> {
  const timestamp = Date.now();
  return {
    id: options.id || uuidv4(),
    type,
    description,
    title: options.title || `Test Task: ${description}`,
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
export async function setupTestScenario(scenario: TestScenario) {
  const fixture = createTestFixture(true); // Always use real LLM for scenarios
  
  // Initialize coordinator
  await fixture.coordinator.initialize();
  
  // Register test agents
  const agentIds: string[] = [];
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
  const taskIds: string[] = [];
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
export async function runWorkflowTest(scenario: TestScenario) {
  const setup = await setupTestScenario(scenario);
  const { fixture, taskIds } = setup;
  
  // Start the coordinator
  await fixture.coordinator.start();
  
  // Process tasks
  for (const taskId of taskIds) {
    const task = await fixture.taskManager.getTask(taskId);
    
    // Find an agent for the task
    const agents = await fixture.agentRegistry.findAgents({
      status: ['available']
    });
    
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
async function waitForTasks(taskManager: TaskManager, taskIds: string[], timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      // Get all tasks
      const tasks: Task[] = [];
      for (const id of taskIds) {
        tasks.push(await taskManager.getTask(id));
      }
      
      // Check if all tasks are complete
      const allComplete = tasks.every(task => 
        ['completed', 'failed', 'cancelled'].includes(task.status)
      );
      
      if (allComplete) return;
      
      // Sleep for a moment
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error while waiting for tasks:', error);
    }
  }
  
  throw new Error(`Timeout waiting for tasks to complete after ${timeout}ms`);
}

/**
 * Validates workflow test results against expectations
 */
export function validateWorkflowResults(
  setup: Awaited<ReturnType<typeof setupTestScenario>>,
  expectations: Record<string, any>
) {
  const { fixture, taskIds } = setup;
  
  // Check task statuses
  if (expectations.taskStatuses) {
    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const task = fixture.taskManager.getTask(taskId);
      const expectedStatus = expectations.taskStatuses[i] || 'completed';
      
      expect(task.status).to.equal(expectedStatus);
    }
  }
  
  // Check shared state values
  if (expectations.sharedState) {
    for (const [key, expectedValue] of Object.entries(expectations.sharedState)) {
      const actualValue = fixture.sharedStateManager.getState(key);
      
      if (typeof expectedValue === 'object') {
        expect(actualValue).to.deep.include(expectedValue);
      } else {
        expect(actualValue).to.equal(expectedValue);
      }
    }
  }
}

/**
 * Creates an agent composition for testing
 */
export async function createAgentComposition(agents: TestAgent[], coordinator: MultiAgentCoordinator) {
  // Register all agents
  const agentIds: string[] = [];
  for (const agent of agents) {
    const agentId = await coordinator.registerAgent(agent);
    if (agentId !== null) {
      agentIds.push(agentId);
    }
  }
  
  // Create a composition
  const compositionId = uuidv4();
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
export function recordTestResults(
  testName: string,
  results: any,
  options: { saveToFile?: boolean } = {}
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsObject = {
    testName,
    timestamp,
    results
  };
  
  if (options.saveToFile) {
    const filePath = path.join(TEST_DATA_DIR, `${testName.replace(/\s+/g, '_')}_${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(resultsObject, null, 2));
  }
  
  return resultsObject;
}

/**
 * Utility function to wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 