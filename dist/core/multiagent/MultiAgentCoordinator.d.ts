import { AgentRegistry } from './interfaces/AgentRegistry';
import { SharedStateManager } from './interfaces/SharedStateManager';
import { TaskManager } from './interfaces/TaskManager';
import { OpenAIClient } from './interfaces/OpenAIClient';
import { PromptManager } from './interfaces/PromptManager';
import { Task, Agent, TaskResult } from './types';
import { Agent as AgentType } from '../../agents/types';
/**
 * The MultiAgentCoordinator orchestrates interactions between multiple agents
 * through shared state management, task allocation, and communication.
 */
export declare class MultiAgentCoordinator {
    private static instance;
    private agents;
    private tasks;
    private stateManager;
    private logger;
    private agentRegistry;
    private id;
    private name;
    private sharedStateManager;
    private taskManager;
    private openAIClient;
    private promptManager;
    private executionConfig;
    private initialized;
    private isRunning;
    private stateFilePath;
    private coordinationStrategy;
    constructor(name?: string, options?: {
        sharedStateManager?: SharedStateManager;
        taskManager?: TaskManager;
        agentRegistry?: AgentRegistry;
        openAIClient?: OpenAIClient;
        promptManager?: PromptManager;
        stateFilePath?: string;
        executionConfig?: Partial<MultiAgentCoordinator['executionConfig']>;
        coordinationStrategy?: 'centralized' | 'decentralized' | 'hybrid';
    });
    static getInstance(): MultiAgentCoordinator;
    /**
     * Initialize the MultiAgentCoordinator
     * @param name Coordinator name
     * @param stateFilePath Optional path to a file for state persistence.
     * @param options Optional configuration options
     */
    initialize(): Promise<boolean>;
    /**
     * Start the coordinator and begin processing tasks
     */
    start(): Promise<boolean>;
    /**
     * Stop the coordinator and halt task processing
     */
    stop(): Promise<boolean>;
    /**
     * Register a new agent with the coordinator
     * @param agent Agent details (Using the type from ../../agents/types for registration input)
     * @returns Agent ID if successful
     */
    registerAgent(agentData: Omit<import('../../agents/types').Agent, 'id'>): Promise<string | null>;
    /**
     * Unregister an agent from the coordinator
     * @param agentId Agent ID
     * @returns Success status
     */
    unregisterAgent(agentId: string): Promise<boolean>;
    /**
     * Create a new task to be executed by agents
     * @param taskData Task details
     * @returns Task ID if successful
     */
    createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string | null>;
    /**
     * Assign a task to an agent
     * @param taskId Task ID
     * @param agentId Agent ID
     */
    assignTask(taskId: string, agentId: string): Promise<void>;
    /**
     * Get details for a specific task
     * @param taskId Task ID
     * @returns Task object or null
     */
    getTask(taskId: string): Promise<Task | null>;
    /**
     * Update task status
     * @param taskId Task ID
     * @param status New status
     * @param result Optional task result
     * @returns Success status
     */
    updateTaskStatus(taskId: string, status: Task['status'], result?: TaskResult): Promise<boolean>;
    /**
     * Get details for a specific agent
     * @param agentId Agent ID
     * @returns Agent object or null
     */
    getAgent(agentId: string): Promise<Agent | null>;
    /**
     * Update agent information
     * @param agentId Agent ID
     * @param updates Partial agent data
     * @returns Success status
     */
    updateAgent(agentId: string, updates: Partial<AgentType>): Promise<boolean>;
    /**
     * List all registered agents, optionally filtered
     * @param filter Optional filter criteria
     * @returns Array of agents
     */
    listAgents(filter?: Parameters<AgentRegistry['listAgents']>[0]): Promise<AgentType[]>;
    /**
     * List all tasks, optionally filtered
     * @param filter Optional filter criteria
     * @returns Array of tasks (local Task type)
     */
    listTasks(filter?: Parameters<TaskManager['listTasks']>[0]): Promise<Task[]>;
    /**
     * Process task queue
     */
    private processTaskQueue;
    /**
     * Start a task
     * @param taskId Task ID
     * @returns Success status
     */
    private startTask;
    /**
     * Execute a task
     * @param taskId Task ID
     * @returns Success status
     */
    private executeTask;
    /**
     * Find the most suitable agent for a task based on capabilities and availability
     * @param task Task to find an agent for
     * @returns Most suitable agent (using Agent type from ../../agents/types) or null
     */
    private findSuitableAgent;
    /**
     * Get the underlying agent registry
     * @returns Agent registry instance
     */
    getAgentRegistry(): AgentRegistry;
    /**
     * Get the underlying shared state manager
     * @returns Shared state manager instance
     */
    getSharedStateManager(): SharedStateManager;
    /**
     * Get the underlying task manager
     * @returns Task manager instance
     */
    getTaskManager(): TaskManager;
    /**
     * Get the underlying OpenAI client
     * @returns OpenAI client instance
     */
    getOpenAIClient(): OpenAIClient;
    /**
     * Get the underlying prompt manager
     * @returns Prompt manager instance
     */
    getPromptManager(): PromptManager;
    /**
     * Saves the current state of the coordinator to a file.
     * @param filePath The path to the file where state should be saved.
     */
    saveState(filePath: string): Promise<boolean>;
    /**
     * Loads the coordinator state from a file.
     * @param filePath The path to the file from which state should be loaded.
     */
    loadState(filePath: string): Promise<boolean>;
    private createAgentStatus;
    private createStateUpdateOptions;
    private createAgent;
    completeTask(taskId: string, agentId: string): Promise<void>;
    failTask(taskId: string, agentId: string, error: string): Promise<void>;
}
