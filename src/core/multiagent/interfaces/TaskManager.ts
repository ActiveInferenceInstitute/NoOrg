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
} 