/**
 * TaskOrchestrator module
 *
 * Orchestrates tasks between organizational units based on workflows.
 */
import { Agent } from '../../../agents/types';
import { OrganizationalUnit, UnitWorkflow } from '../UnitInterface';
import { UnitStateManager } from '../state/UnitStateManager';
/**
 * Task data
 */
export interface UnitTask {
    id: string;
    name: string;
    description: string;
    unitId: string;
    agentId?: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    dependencies: string[];
    metadata: Record<string, any>;
    input?: string;
    context?: string;
    result?: any;
    error?: string;
    createdAt: number;
    updatedAt: number;
    startedAt?: number;
    completedAt?: number;
}
/**
 * Result of task execution
 */
export interface TaskExecutionResult {
    success: boolean;
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    error?: string;
}
/**
 * Configuration for the orchestrator
 */
export interface OrchestratorConfig {
    openaiApiKey?: string;
    modelName?: string;
    taskTimeoutMs?: number;
    maxRetries?: number;
    taskBatchSize?: number;
}
/**
 * TaskOrchestrator class
 * Orchestrates tasks between organizational units
 */
export declare class TaskOrchestrator {
    private units;
    private agents;
    private workflow?;
    private tasks;
    private stateManager;
    private openaiClient?;
    private agentFactory;
    private unitAgentMap;
    private logger;
    private config;
    /**
     * Create a new TaskOrchestrator
     * @param units - Array of organizational units
     * @param agents - Array of agents
     * @param workflow - Optional workflow to follow
     * @param stateManager - State manager for shared state
     * @param config - Orchestrator configuration
     * @param logger - Logger instance
     */
    constructor(units: OrganizationalUnit[], agents: Agent[], workflow: UnitWorkflow | undefined, stateManager: UnitStateManager, config?: OrchestratorConfig, logger?: Console);
    /**
     * Execute the workflow
     * @param options - Execution options
     * @returns Execution results
     */
    execute(options: {
        topic: string;
        initialTask: {
            title: string;
            description: string;
        };
    }): Promise<{
        success: boolean;
        tasks: UnitTask[];
        results: Record<string, any>;
        state: Record<string, any>;
        errors?: string[];
    }>;
    /**
     * Create a task
     * @param taskData - Partial task data
     * @returns Created task
     */
    createTask(taskData: Partial<UnitTask>): UnitTask;
    /**
     * Assign a task to a unit
     * @param taskId - Task ID
     * @param unitId - Unit ID
     * @returns Updated task
     */
    assignTask(taskId: string, unitId: string): UnitTask;
    /**
     * Update a task
     * @param taskId - Task ID
     * @param updates - Task updates
     * @returns Updated task
     */
    updateTask(taskId: string, updates: Partial<UnitTask>): UnitTask;
    /**
     * Get a task by ID
     * @param taskId - Task ID
     * @returns The task
     */
    getTask(taskId: string): UnitTask;
    /**
     * Get all tasks
     * @returns Array of all tasks
     */
    getAllTasks(): UnitTask[];
    /**
     * Check if all dependencies for a task are met
     * @param taskId - Task ID
     * @returns True if dependencies are met
     */
    areDependenciesMet(taskId: string): boolean;
    /**
     * Execute an individual task
     * @param taskId - Task ID
     * @returns Task execution result
     */
    executeTask(taskId: string): Promise<TaskExecutionResult>;
    /**
     * Execute a workflow
     * @param topic - Topic for the workflow
     * @param initialTask - Initial task info
     */
    private executeWorkflow;
    /**
     * Execute planning phase
     * @param topic - Topic for planning
     * @param initialTask - Initial task info
     */
    private executePlanningPhase;
    /**
     * Execute execution phase
     * @param topic - Topic for execution
     */
    private executeExecutionPhase;
    /**
     * Execute without a workflow structure (simple execution)
     * @param topic - Topic for execution
     * @param initialTask - Initial task info
     */
    private executeSimple;
    /**
     * Generate a prompt for a task
     * @param task - The task
     * @param unit - The unit handling the task
     * @returns Generated prompt
     */
    private generateTaskPrompt;
    /**
     * Build map from unit IDs to agent IDs
     * @param agents - Array of agents
     */
    private buildUnitAgentMap;
}
//# sourceMappingURL=TaskOrchestrator.d.ts.map