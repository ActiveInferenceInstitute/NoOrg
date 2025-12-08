import { Task, TaskFilter, TaskResult } from './types';
import { SharedStateManager } from './SharedStateManager';
import { TaskManager as ITaskManager } from './interfaces/TaskManager';
/**
 * Implementation of the TaskManager
 * Manages tasks in the system including creation, assignment, and status tracking
 */
export declare class TaskManager implements ITaskManager {
    private static instance;
    private tasks;
    private stateManager;
    /**
     * Get the singleton instance of TaskManager
     * @returns TaskManager instance
     */
    static getInstance(): TaskManager;
    /**
     * Constructor initializes with SharedStateManager
     * @param stateManager Optional SharedStateManager instance
     */
    constructor(stateManager?: SharedStateManager);
    /**
     * Create a new task
     * @param taskData Task data
     * @returns Task ID if successful
     */
    createTask(taskData: Partial<Task>): Promise<string>;
    /**
     * Assign a task to an agent
     * @param taskId Task ID
     * @param agentId Agent ID
     */
    assignTask(taskId: string, agentId: string): Promise<void>;
    /**
     * Start a task
     * @param taskId Task ID
     */
    startTask(taskId: string): Promise<void>;
    /**
     * Complete a task
     * @param taskId Task ID
     * @param result Task result
     */
    completeTask(taskId: string, result: TaskResult): Promise<void>;
    /**
     * Fail a task
     * @param taskId Task ID
     * @param error Error
     */
    failTask(taskId: string, error: Error): Promise<void>;
    /**
     * Cancel a task
     * @param taskId Task ID
     */
    cancelTask(taskId: string): Promise<void>;
    /**
     * Get a task by ID
     * @param taskId Task ID
     * @returns Task
     */
    getTask(taskId: string): Promise<Task>;
    /**
     * List tasks with optional filtering
     * @param filter Optional filter
     * @returns Array of tasks
     */
    listTasks(filter?: TaskFilter): Promise<Task[]>;
    /**
     * Check if task dependencies are satisfied
     * @param taskId Task ID
     * @returns True if dependencies are satisfied
     */
    areDependenciesSatisfied(taskId: string): Promise<boolean>;
    /**
     * Unassign a task from its current agent
     * @param taskId Task ID
     */
    unassignTask(taskId: string): Promise<void>;
    /**
     * Reassign a task to a different agent
     * @param taskId Task ID
     * @param newAgentId New agent ID
     */
    reassignTask(taskId: string, newAgentId: string): Promise<void>;
    /**
     * Get task history including all state changes
     * @param taskId Task ID
     * @returns Task history
     */
    getTaskHistory(taskId: string): Promise<TaskHistory[]>;
    /**
     * Estimate task duration based on historical data
     * @param task Task to estimate
     * @returns Estimated duration in milliseconds
     */
    estimateTaskDuration(task: Task): Promise<number>;
    /**
     * Get task statistics
     * @returns Task statistics
     */
    getTaskStatistics(): Promise<TaskStatistics>;
    /**
     * Clean up old completed tasks
     * @param olderThan Timestamp - remove tasks older than this
     */
    cleanupOldTasks(olderThan: number): Promise<number>;
    /**
     * Update task properties
     * @param taskId Task ID
     * @param updates Partial task data for updates
     */
    updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void>;
}
interface TaskHistory {
    timestamp: number;
    event: 'created' | 'assigned' | 'started' | 'completed' | 'failed' | 'reassigned';
    status: Task['status'];
    agentId?: string;
    metadata: Record<string, any>;
}
interface TaskStatistics {
    total: number;
    byStatus: Record<Task['status'], number>;
    byPriority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    avgProcessingTime: number;
    successRate: number;
}
export {};
//# sourceMappingURL=TaskManager.d.ts.map