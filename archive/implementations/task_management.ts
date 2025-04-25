import {
  Task,
  TaskConfig,
  TaskDefinition,
  TaskAssignment,
  TaskDependency,
  TaskPriority,
  TaskStatus,
  TaskResult,
  AssignmentResult
} from '../types/task';

import { WorkflowAutomationSystem } from './workflow_automation';

/**
 * Task Management System
 * Manages task lifecycle, assignments, dependencies, and execution
 */
export class TaskManagementSystem {
  private config: TaskConfig;
  private tasks: Map<string, Task>;
  private definitions: Map<string, TaskDefinition>;
  private assignments: Map<string, TaskAssignment>;
  private workflowSystem: WorkflowAutomationSystem;

  constructor(config: TaskConfig, workflowSystem: WorkflowAutomationSystem) {
    this.config = config;
    this.tasks = new Map();
    this.definitions = new Map();
    this.assignments = new Map();
    this.workflowSystem = workflowSystem;
  }

  /**
   * Register task definition
   */
  async registerTaskDefinition(definition: TaskDefinition): Promise<void> {
    try {
      // Validate definition
      await this.validateTaskDefinition(definition);
      
      // Register definition
      this.definitions.set(definition.id, definition);
    } catch (error) {
      throw new Error(`Failed to register task definition: ${error.message}`);
    }
  }

  /**
   * Create new task
   */
  async createTask(
    definitionId: string,
    context: any
  ): Promise<Task> {
    try {
      // Get task definition
      const definition = this.definitions.get(definitionId);
      if (!definition) {
        throw new Error(`Task definition not found: ${definitionId}`);
      }

      // Create task instance
      const task = await this.createTaskInstance(definition, context);
      
      // Store task
      this.tasks.set(task.id, task);
      
      // Process task creation
      await this.processTaskCreation(task);
      
      return task;
    } catch (error) {
      throw new Error(`Task creation failed: ${error.message}`);
    }
  }

  /**
   * Assign task
   */
  async assignTask(
    taskId: string,
    assignee: string,
    options?: any
  ): Promise<AssignmentResult> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Create assignment
      const assignment = await this.createTaskAssignment(task, assignee, options);
      
      // Store assignment
      this.assignments.set(assignment.id, assignment);
      
      // Process assignment
      await this.processTaskAssignment(task, assignment);
      
      return {
        success: true,
        taskId: task.id,
        assignmentId: assignment.id
      };
    } catch (error) {
      throw new Error(`Task assignment failed: ${error.message}`);
    }
  }

  /**
   * Start task execution
   */
  async startTask(taskId: string): Promise<TaskResult> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Validate task can be started
      await this.validateTaskStart(task);
      
      // Start task execution
      const result = await this.executeTask(task);
      
      // Process execution result
      await this.processTaskResult(task, result);
      
      return result;
    } catch (error) {
      throw new Error(`Task execution failed: ${error.message}`);
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    context?: any
  ): Promise<void> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Update task status
      task.status = status;
      task.lastUpdated = new Date().toISOString();
      
      if (context) {
        task.context = { ...task.context, ...context };
      }

      // Process status update
      await this.processTaskStatusUpdate(task, status);
    } catch (error) {
      throw new Error(`Task status update failed: ${error.message}`);
    }
  }

  /**
   * Set task dependencies
   */
  async setTaskDependencies(
    taskId: string,
    dependencies: TaskDependency[]
  ): Promise<void> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Validate dependencies
      await this.validateTaskDependencies(task, dependencies);
      
      // Set dependencies
      task.dependencies = dependencies;
      
      // Process dependency update
      await this.processTaskDependencyUpdate(task);
    } catch (error) {
      throw new Error(`Failed to set task dependencies: ${error.message}`);
    }
  }

  /**
   * Set task priority
   */
  async setTaskPriority(
    taskId: string,
    priority: TaskPriority
  ): Promise<void> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Update priority
      task.priority = priority;
      task.lastUpdated = new Date().toISOString();
      
      // Process priority update
      await this.processTaskPriorityUpdate(task);
    } catch (error) {
      throw new Error(`Failed to set task priority: ${error.message}`);
    }
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string, reason?: string): Promise<void> {
    try {
      // Get task
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Cancel task execution
      await this.cancelTaskExecution(task, reason);
      
      // Update task status
      await this.updateTaskStatus(taskId, TaskStatus.Cancelled);
    } catch (error) {
      throw new Error(`Task cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get task assignment
   */
  getTaskAssignment(assignmentId: string): TaskAssignment | undefined {
    return this.assignments.get(assignmentId);
  }

  /**
   * Validate task definition
   */
  private async validateTaskDefinition(definition: TaskDefinition): Promise<void> {
    // Validate interface
    if (!definition.id || !definition.type) {
      throw new Error('Invalid task definition interface');
    }

    // Check for duplicate registration
    if (this.definitions.has(definition.id)) {
      throw new Error('Task definition already registered');
    }

    // Validate definition configuration
    if (definition.config) {
      await this.validateDefinitionConfig(definition.config);
    }
  }

  /**
   * Create task instance
   */
  private async createTaskInstance(
    definition: TaskDefinition,
    context: any
  ): Promise<Task> {
    return {
      id: `${definition.id}-${Date.now()}`,
      definitionId: definition.id,
      type: definition.type,
      status: TaskStatus.Created,
      priority: TaskPriority.Normal,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      context: context,
      config: definition.config
    };
  }

  /**
   * Create task assignment
   */
  private async createTaskAssignment(
    task: Task,
    assignee: string,
    options?: any
  ): Promise<TaskAssignment> {
    return {
      id: `${task.id}-${assignee}-${Date.now()}`,
      taskId: task.id,
      assignee: assignee,
      status: TaskStatus.Assigned,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      options: options
    };
  }

  /**
   * Validate task can be started
   */
  private async validateTaskStart(task: Task): Promise<void> {
    // Check task status
    if (task.status !== TaskStatus.Created && task.status !== TaskStatus.Ready) {
      throw new Error(`Invalid task status for execution: ${task.status}`);
    }

    // Check dependencies
    if (task.dependencies) {
      await this.validateDependenciesMet(task.dependencies);
    }

    // Check assignment
    const assignment = Array.from(this.assignments.values())
      .find(a => a.taskId === task.id);
    if (!assignment) {
      throw new Error('Task must be assigned before execution');
    }
  }

  /**
   * Execute task
   */
  private async executeTask(task: Task): Promise<TaskResult> {
    try {
      // Update task status
      await this.updateTaskStatus(task.id, TaskStatus.InProgress);
      
      // Create workflow context
      const workflowContext = {
        taskId: task.id,
        context: task.context
      };

      // Execute task workflow
      const workflowResult = await this.workflowSystem.executeWorkflow(
        task.definitionId,
        workflowContext
      );

      // Create task result
      return this.createTaskResult(task, workflowResult);
    } catch (error) {
      // Handle execution error
      await this.updateTaskStatus(task.id, TaskStatus.Failed);
      throw error;
    }
  }

  /**
   * Create task result
   */
  private createTaskResult(task: Task, workflowResult: any): TaskResult {
    return {
      success: workflowResult.success,
      taskId: task.id,
      startTime: workflowResult.startTime,
      endTime: workflowResult.endTime,
      outputs: workflowResult.outputs,
      error: workflowResult.error
    };
  }

  /**
   * Process task creation
   */
  private async processTaskCreation(task: Task): Promise<void> {
    // Store task metrics
    await this.storeTaskMetrics(task);
    
    // Update indexes
    await this.updateTaskIndexes(task);
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'created');
  }

  /**
   * Process task assignment
   */
  private async processTaskAssignment(
    task: Task,
    assignment: TaskAssignment
  ): Promise<void> {
    // Store assignment metrics
    await this.storeAssignmentMetrics(assignment);
    
    // Update task status
    await this.updateTaskStatus(task.id, TaskStatus.Assigned);
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'assigned');
  }

  /**
   * Process task result
   */
  private async processTaskResult(task: Task, result: TaskResult): Promise<void> {
    // Store result metrics
    await this.storeTaskResultMetrics(result);
    
    // Update task status
    await this.updateTaskStatus(
      task.id,
      result.success ? TaskStatus.Completed : TaskStatus.Failed
    );
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'completed');
  }

  /**
   * Process task status update
   */
  private async processTaskStatusUpdate(
    task: Task,
    status: TaskStatus
  ): Promise<void> {
    // Store status metrics
    await this.storeTaskStatusMetrics(task, status);
    
    // Update indexes
    await this.updateTaskIndexes(task);
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'statusUpdated');
  }

  /**
   * Process task dependency update
   */
  private async processTaskDependencyUpdate(task: Task): Promise<void> {
    // Update dependency metrics
    await this.updateDependencyMetrics(task);
    
    // Update indexes
    await this.updateTaskIndexes(task);
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'dependenciesUpdated');
  }

  /**
   * Process task priority update
   */
  private async processTaskPriorityUpdate(task: Task): Promise<void> {
    // Update priority metrics
    await this.updatePriorityMetrics(task);
    
    // Update indexes
    await this.updateTaskIndexes(task);
    
    // Notify subscribers
    await this.notifyTaskSubscribers(task, 'priorityUpdated');
  }

  /**
   * Validate task dependencies
   */
  private async validateTaskDependencies(
    task: Task,
    dependencies: TaskDependency[]
  ): Promise<void> {
    // Check for circular dependencies
    await this.checkCircularDependencies(task, dependencies);
    
    // Validate all dependency tasks exist
    for (const dep of dependencies) {
      if (!this.tasks.has(dep.taskId)) {
        throw new Error(`Dependency task not found: ${dep.taskId}`);
      }
    }
  }

  /**
   * Check for circular dependencies
   */
  private async checkCircularDependencies(
    task: Task,
    dependencies: TaskDependency[]
  ): Promise<void> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (!visited.has(taskId)) {
        visited.add(taskId);
        recursionStack.add(taskId);

        const task = this.tasks.get(taskId);
        if (task && task.dependencies) {
          for (const dep of task.dependencies) {
            if (!visited.has(dep.taskId) && hasCycle(dep.taskId)) {
              return true;
            } else if (recursionStack.has(dep.taskId)) {
              return true;
            }
          }
        }
      }
      recursionStack.delete(taskId);
      return false;
    };

    for (const dep of dependencies) {
      if (hasCycle(dep.taskId)) {
        throw new Error('Circular dependency detected');
      }
    }
  }

  /**
   * Validate dependencies are met
   */
  private async validateDependenciesMet(
    dependencies: TaskDependency[]
  ): Promise<void> {
    for (const dep of dependencies) {
      const depTask = this.tasks.get(dep.taskId);
      if (!depTask) {
        throw new Error(`Dependency task not found: ${dep.taskId}`);
      }

      if (depTask.status !== TaskStatus.Completed) {
        throw new Error(`Dependency task not completed: ${dep.taskId}`);
      }
    }
  }

  /**
   * Cancel task execution
   */
  private async cancelTaskExecution(task: Task, reason?: string): Promise<void> {
    // Cancel any active workflow
    if (task.workflowId) {
      await this.workflowSystem.cancelWorkflow(task.workflowId);
    }

    // Update task context with cancellation reason
    if (reason) {
      task.context = {
        ...task.context,
        cancellationReason: reason
      };
    }
  }

  /**
   * Store task metrics
   */
  private async storeTaskMetrics(task: Task): Promise<void> {
    // Implementation for storing task metrics
  }

  /**
   * Store assignment metrics
   */
  private async storeAssignmentMetrics(assignment: TaskAssignment): Promise<void> {
    // Implementation for storing assignment metrics
  }

  /**
   * Store task result metrics
   */
  private async storeTaskResultMetrics(result: TaskResult): Promise<void> {
    // Implementation for storing result metrics
  }

  /**
   * Store task status metrics
   */
  private async storeTaskStatusMetrics(
    task: Task,
    status: TaskStatus
  ): Promise<void> {
    // Implementation for storing status metrics
  }

  /**
   * Update dependency metrics
   */
  private async updateDependencyMetrics(task: Task): Promise<void> {
    // Implementation for updating dependency metrics
  }

  /**
   * Update priority metrics
   */
  private async updatePriorityMetrics(task: Task): Promise<void> {
    // Implementation for updating priority metrics
  }

  /**
   * Update task indexes
   */
  private async updateTaskIndexes(task: Task): Promise<void> {
    // Implementation for updating task indexes
  }

  /**
   * Notify task subscribers
   */
  private async notifyTaskSubscribers(
    task: Task,
    event: string
  ): Promise<void> {
    // Implementation for notifying subscribers
  }

  /**
   * Validate definition configuration
   */
  private async validateDefinitionConfig(config: any): Promise<void> {
    // Implementation for validating definition config
  }
} 