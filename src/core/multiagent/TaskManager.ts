import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskFilter,
  TaskResult
} from './types';
import { SharedStateManager } from './SharedStateManager';
import { TaskManager as ITaskManager } from './interfaces/TaskManager';

/**
 * Implementation of the TaskManager
 * Manages tasks in the system including creation, assignment, and status tracking
 */
export class TaskManager implements ITaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, Task> = new Map();
  private stateManager: SharedStateManager;

  /**
   * Get the singleton instance of TaskManager
   * @returns TaskManager instance
   */
  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  /**
   * Constructor initializes with SharedStateManager
   * @param stateManager Optional SharedStateManager instance
   */
  constructor(stateManager?: SharedStateManager) {
    this.stateManager = stateManager || SharedStateManager.getInstance();
  }

  /**
   * Create a new task
   * @param taskData Task data
   * @returns Task ID if successful
   */
  async createTask(taskData: Partial<Task>): Promise<string> {
    const taskId = taskData.id || uuidv4();
    const now = Date.now();
    
    const task: Task = {
      id: taskId,
      name: taskData.name || `Task ${taskId}`,
      description: taskData.description || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: taskData.metadata || {},
      type: taskData.type,
      priority: taskData.priority,
      dependsOn: taskData.dependsOn,
      assignedTo: taskData.assignedTo
    };
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
    
    return taskId;
  }

  /**
   * Assign a task to an agent
   * @param taskId Task ID
   * @param agentId Agent ID
   */
  async assignTask(taskId: string, agentId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    task.assignedTo = agentId;
    task.status = 'assigned';
    task.updatedAt = Date.now();
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
  }

  /**
   * Start a task
   * @param taskId Task ID
   */
  async startTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    if (task.status !== 'assigned') {
      throw new Error(`Task ${taskId} must be assigned before starting`);
    }
    
    task.status = 'in-progress';
    task.updatedAt = Date.now();
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
  }

  /**
   * Complete a task
   * @param taskId Task ID
   * @param result Task result
   */
  async completeTask(taskId: string, result: TaskResult): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const now = Date.now();
    
    task.status = 'completed';
    task.updatedAt = now;
    task.completedAt = now;
    task.results = result.data;
    
    if (result.metrics?.duration) {
      task.processingTime = result.metrics.duration;
    }
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
  }

  /**
   * Fail a task
   * @param taskId Task ID
   * @param error Error
   */
  async failTask(taskId: string, error: Error): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const now = Date.now();
    
    task.status = 'failed';
    task.updatedAt = now;
    task.failedAt = now;
    task.error = error.message;
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
  }

  /**
   * Cancel a task
   * @param taskId Task ID
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    task.status = 'failed';  // We'll use 'failed' since our status doesn't include 'cancelled'
    task.updatedAt = Date.now();
    task.error = 'Task cancelled';
    
    this.tasks.set(taskId, task);
    
    // Update shared state
    await this.stateManager.setState(`tasks.${taskId}`, task);
  }

  /**
   * Get a task by ID
   * @param taskId Task ID
   * @returns Task
   */
  async getTask(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    return { ...task };
  }

  /**
   * List tasks with optional filtering
   * @param filter Optional filter
   * @returns Array of tasks
   */
  async listTasks(filter?: TaskFilter): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (filter) {
      if (filter.types && filter.types.length > 0) {
        tasks = tasks.filter(task => task.type && filter.types?.includes(task.type));
      }
      
      if (filter.status && filter.status.length > 0) {
        tasks = tasks.filter(task => filter.status?.includes(task.status));
      }
      
      if (filter.priority && filter.priority.length > 0) {
        tasks = tasks.filter(task => task.priority && filter.priority?.includes(task.priority));
      }
      
      if (filter.assignedTo) {
        tasks = tasks.filter(task => task.assignedTo === filter.assignedTo);
      }
      
      if (filter.createdAfter) {
        tasks = tasks.filter(task => task.createdAt >= filter.createdAfter!);
      }
      
      if (filter.createdBefore) {
        tasks = tasks.filter(task => task.createdAt <= filter.createdBefore!);
      }
      
      if (filter.updatedAfter) {
        tasks = tasks.filter(task => task.updatedAt >= filter.updatedAfter!);
      }
      
      if (filter.updatedBefore) {
        tasks = tasks.filter(task => task.updatedAt <= filter.updatedBefore!);
      }
    }
    
    return tasks;
  }

  /**
   * Check if task dependencies are satisfied
   * @param taskId Task ID
   * @returns True if dependencies are satisfied
   */
  async areDependenciesSatisfied(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    if (!task.dependsOn || task.dependsOn.length === 0) {
      return true;
    }
    
    for (const dependencyId of task.dependsOn) {
      const dependency = this.tasks.get(dependencyId);
      if (!dependency || dependency.status !== 'completed') {
        return false;
      }
    }
    
    return true;
  }
} 