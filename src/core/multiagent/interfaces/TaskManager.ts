import { Task, TaskResult, TaskFilter } from '../types';

/**
 * Interface for the TaskManager
 * Defines methods for managing tasks in the system
 */
export interface TaskManager {
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
   * @param result Task result (flexible format)
   */
  completeTask(taskId: string, result: TaskResult | { outcome?: string; data?: any }): Promise<void>;
  
  /**
   * Fail a task
   * @param taskId Task ID
   * @param error Error or error object
   */
  failTask(taskId: string, error: Error | { message: string; details?: any }): Promise<void>;
  
  /**
   * Cancel a task
   * @param taskId Task ID
   * @param reason Optional cancellation reason
   */
  cancelTask(taskId: string, reason?: string): Promise<void>;
  
  /**
   * Get a task by ID
   * @param taskId Task ID
   * @returns Task or undefined if not found
   */
  getTask(taskId: string): Promise<Task | undefined>;
  
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
   * Update task properties
   * @param taskId Task ID
   * @param updates Partial task data for updates
   */
  updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void>;
  
  /**
   * Get tasks that are ready to be executed (dependencies satisfied)
   * @returns Array of ready tasks
   */
  getReadyTasks(): Promise<Task[]>;
  
  /**
   * Count tasks by status
   * @returns Object with counts for each status
   */
  countTasksByStatus(): Promise<Record<string, number>>;
  
  /**
   * Get task history including all state changes
   * @param taskId Task ID
   * @returns Task history
   */
  getTaskHistory(taskId: string): Promise<any[]>;
  
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
  getTaskStatistics(): Promise<any>;
  
  /**
   * Clean up old completed tasks
   * @param olderThan Timestamp - remove tasks older than this
   * @returns Number of tasks removed
   */
  cleanupOldTasks(olderThan: number): Promise<number>;
} 