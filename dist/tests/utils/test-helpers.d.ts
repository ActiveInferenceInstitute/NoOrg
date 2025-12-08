/**
 * Test Helpers for Multiagent LLM Coordination Testing
 *
 * This module provides utilities to simplify testing of multiagent systems
 * with a focus on LLM coordination and composability.
 */
import { Agent } from '../../src/agents/types';
import { SharedStateManager } from '../../src/core/multiagent/SharedStateManager';
import { TaskManager } from '../../src/core/multiagent/TaskManager';
import { AgentRegistry } from '../../src/core/multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../../src/core/multiagent/MultiAgentCoordinator';
import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { PromptManager } from '../../src/core/multiagent/PromptManager';
import { Task } from '../../src/core/multiagent/types';
export interface TestAgent extends Agent {
    responses?: Record<string, any>;
}
export interface TestScenario {
    name: string;
    description: string;
    agents: TestAgent[];
    initialState?: Record<string, any>;
    tasks?: Partial<Task>[];
    jestExpectedResults?: any;
}
export declare const TEST_TIMEOUT = 30000;
export declare const TEST_DATA_DIR: string;
/**
 * Creates a test fixture with isolated instances of core components
 * Uses a real OpenAI client by default
 */
export declare function createTestFixture(useRealLLM?: boolean): {
    sharedStateManager: SharedStateManager;
    taskManager: TaskManager;
    agentRegistry: AgentRegistry;
    openAIClient: OpenAIClient;
    promptManager: PromptManager;
    coordinator: MultiAgentCoordinator;
};
/**
 * Creates a real LLM client using environment variables
 */
export declare function createRealLLMClient(): OpenAIClient;
/**
 * Creates a test agent with the specified type and capabilities
 */
export declare function createTestAgent(type: string, capabilities: string[], options?: Partial<TestAgent>): TestAgent;
/**
 * Creates a test task with the specified type and description
 */
export declare function createTestTask(type: string, description: string, options?: Partial<Task>): Partial<Task>;
/**
 * Sets up a complete test scenario with agents, tasks, and state
 */
export declare function setupTestScenario(scenario: TestScenario): Promise<{
    fixture: {
        sharedStateManager: SharedStateManager;
        taskManager: TaskManager;
        agentRegistry: AgentRegistry;
        openAIClient: OpenAIClient;
        promptManager: PromptManager;
        coordinator: MultiAgentCoordinator;
    };
    agentIds: string[];
    taskIds: string[];
    scenario: TestScenario;
}>;
/**
 * Runs a workflow test scenario
 */
export declare function runWorkflowTest(scenario: TestScenario): Promise<{
    fixture: {
        sharedStateManager: SharedStateManager;
        taskManager: TaskManager;
        agentRegistry: AgentRegistry;
        openAIClient: OpenAIClient;
        promptManager: PromptManager;
        coordinator: MultiAgentCoordinator;
    };
    agentIds: string[];
    taskIds: string[];
    scenario: TestScenario;
}>;
/**
 * Validates workflow test results against jestExpectations
 */
export declare function validateWorkflowResults(setup: Awaited<ReturnType<typeof setupTestScenario>>, jestExpectations: Record<string, any>): Promise<void>;
/**
 * Creates an agent composition for testing
 */
export declare function createAgentComposition(agents: TestAgent[], coordinator: MultiAgentCoordinator): Promise<{
    id: string;
    name: string;
    agentIds: string[];
    createdAt: number;
    status: string;
}>;
/**
 * Records test results
 */
export declare function recordTestResults(testName: string, results: any, options?: {
    saveToFile?: boolean;
}): {
    testName: string;
    timestamp: string;
    results: any;
};
/**
 * Utility function to wait for a specified duration
 */
export declare function wait(ms: number): Promise<void>;
//# sourceMappingURL=test-helpers.d.ts.map