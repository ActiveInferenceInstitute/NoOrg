/**
 * WorkflowEngine module
 * 
 * Provides a complete workflow execution engine for organizational units with
 * support for DAG-based task dependencies, conditional execution, templates, and versioning.
 */

import { v4 as uuidv4 } from 'uuid';
import { EventSystem } from '../../events/EventSystem';
import { StorageSystem } from '../../storage/StorageSystem';
import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

/**
 * Workflow status enum
 */
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

/**
 * Condition type enum
 */
export enum ConditionType {
  TASK_SUCCESS = 'task_success',
  TASK_FAILURE = 'task_failure',
  TASK_COMPLETION = 'task_completion',
  EXPRESSION = 'expression',
  STATE_CONDITION = 'state_condition',
  ALWAYS = 'always'
}

/**
 * Task interface
 */
export interface WorkflowTask {
  id: string;
  name: string;
  description?: string;
  unitId: string;
  action: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  conditions?: TaskCondition[];
  timeout?: number;
  retries?: number;
  status: TaskStatus;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, any>;
  data?: Record<string, any>; // Input data for task execution
  dependencyResults?: Record<string, WorkflowTask>; // Results from dependent tasks
  output?: Record<string, any>; // Output data from task execution
}

/**
 * Task condition
 */
export interface TaskCondition {
  type: ConditionType;
  value?: any;
  taskId?: string;
  expression?: string;
  statePath?: string;
  options?: Record<string, any>;
}

/**
 * Workflow interface
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tasks: WorkflowTask[];
  status: WorkflowStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  owner?: string;
  templateId?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Workflow template interface
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  tasks: Omit<WorkflowTask, 'status' | 'result' | 'error' | 'startTime' | 'endTime'>[];
  variables?: Record<string, any>;
  createdAt: number;
  updatedAt?: number;
  author?: string;
  metadata?: Record<string, any>;
}

/**
 * Workflow execution options
 */
export interface WorkflowExecutionOptions {
  autoStart?: boolean;
  context?: Record<string, any>;
  owner?: string;
  metadata?: Record<string, any>;
}

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * TaskExecutor function type
 */
export type TaskExecutor = (
  task: WorkflowTask,
  context: Record<string, any>
) => Promise<TaskExecutionResult>;

/**
 * Custom logger interface to allow FileLogger
 */
export interface ILogger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info?: (...args: any[]) => void;
  warn?: (...args: any[]) => void;
}

/**
 * WorkflowEngine class
 */
export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, Workflow>;
  private templates: Map<string, WorkflowTemplate>;
  private eventSystem: EventSystem;
  private storageSystem: StorageSystem;
  private taskExecutors: Map<string, TaskExecutor>;
  private activeWorkflows: Set<string>;
  private logger: ILogger;
  private templateDirectory?: string;

  /**
   * Get singleton instance
   * @param options - Engine options
   * @returns WorkflowEngine instance
   */
  public static getInstance(options: {
    logger?: ILogger;
    templateDirectory?: string;
  } = {}): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine(
        options.logger,
        options.templateDirectory
      );
    }
    return WorkflowEngine.instance;
  }

  /**
   * Create a new WorkflowEngine
   * @param logger - Logger instance
   * @param templateDirectory - Directory for workflow templates
   */
  private constructor(logger: ILogger = console, templateDirectory?: string) {
    this.workflows = new Map();
    this.templates = new Map();
    this.eventSystem = EventSystem.getInstance();
    this.storageSystem = StorageSystem.getInstance();
    this.taskExecutors = new Map();
    this.activeWorkflows = new Set();
    this.logger = logger;
    this.templateDirectory = templateDirectory;
    
    // Load templates if directory is provided
    if (this.templateDirectory) {
      this.loadTemplatesFromDisk();
    }
    
    // Load workflow state
    this.loadState();
    
    // Resume any active workflows
    this.resumeActiveWorkflows();
  }

  /**
   * Register a task executor
   * @param action - Task action name
   * @param executor - Task executor function
   */
  public registerTaskExecutor(action: string, executor: TaskExecutor): void {
    this.taskExecutors.set(action, executor);
    this.logger.log(`Registered task executor for action: ${action}`);
  }

  /**
   * Create workflow from a template
   * @param templateIdOrName - Template ID or name
   * @param options - Workflow options
   * @returns Created workflow
   */
  public createWorkflowFromTemplate(
    templateIdOrName: string,
    options: WorkflowExecutionOptions = {}
  ): Workflow {
    // Find template by ID or name
    let template = this.templates.get(templateIdOrName);
    
    if (!template) {
      // Try finding by name
      template = Array.from(this.templates.values()).find(t => t.name === templateIdOrName);
    }
    
    if (!template) {
      throw new Error(`Template not found: ${templateIdOrName}`);
    }
    
    // Create workflow from template
    const workflow: Workflow = {
      id: uuidv4(),
      name: template.name,
      description: template.description,
      version: template.version,
      tasks: template.tasks.map(taskTemplate => ({
        ...taskTemplate,
        id: uuidv4(),
        status: TaskStatus.PENDING,
      })),
      status: WorkflowStatus.PENDING,
      createdAt: Date.now(),
      owner: options.owner,
      templateId: template.id,
      context: {
        ...(template.variables || {}),
        ...(options.context || {})
      },
      metadata: options.metadata || {}
    };
    
    // Store the workflow
    this.workflows.set(workflow.id, workflow);
    
    // Update dependencies to use the new IDs
    const oldToNewIdMap = new Map<string, string>();
    
    template.tasks.forEach((oldTask, index) => {
      oldToNewIdMap.set(oldTask.id, workflow.tasks[index].id);
    });
    
    // Update dependencies and conditions with new IDs
    workflow.tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies = task.dependencies.map(depId => {
          return oldToNewIdMap.get(depId) || depId;
        });
      }
      
      if (task.conditions) {
        task.conditions.forEach(condition => {
          if (condition.taskId && oldToNewIdMap.has(condition.taskId)) {
            condition.taskId = oldToNewIdMap.get(condition.taskId)!;
          }
        });
      }
    });
    
    // Save state
    this.saveState();
    
    // Start workflow if requested
    if (options.autoStart) {
      this.startWorkflow(workflow.id);
    }
    
    // Emit event
    this.eventSystem.emit('workflow:created', { workflowId: workflow.id });
    
    return workflow;
  }

  /**
   * Create a custom workflow
   * @param workflow - Workflow configuration
   * @param options - Workflow options
   * @returns Created workflow
   */
  public createWorkflow(
    workflow: Omit<Workflow, 'id' | 'status' | 'createdAt' | 'tasks'> & {
      tasks: Omit<WorkflowTask, 'status' | 'result' | 'error' | 'startTime' | 'endTime'>[];
    },
    options: WorkflowExecutionOptions = {}
  ): Workflow {
    // Create workflow
    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      tasks: workflow.tasks.map(taskTemplate => ({
        ...taskTemplate,
        id: taskTemplate.id || uuidv4(),
        status: TaskStatus.PENDING,
      })),
      status: WorkflowStatus.PENDING,
      createdAt: Date.now(),
      owner: options.owner || workflow.owner,
      templateId: workflow.templateId,
      context: {
        ...(workflow.context || {}),
        ...(options.context || {})
      },
      metadata: {
        ...(workflow.metadata || {}),
        ...(options.metadata || {})
      }
    };
    
    // Store the workflow
    this.workflows.set(newWorkflow.id, newWorkflow);
    
    // Save state
    this.saveState();
    
    // Start workflow if requested
    if (options.autoStart) {
      this.startWorkflow(newWorkflow.id);
    }
    
    // Emit event
    this.eventSystem.emit('workflow:created', { workflowId: newWorkflow.id });
    
    return newWorkflow;
  }

  /**
   * Get a workflow by ID
   * @param workflowId - Workflow ID
   * @returns Workflow or null if not found
   */
  public getWorkflow(workflowId: string): Workflow | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get all workflows
   * @returns Array of all workflows
   */
  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Start a workflow
   * @param workflowId - Workflow ID
   * @returns Started workflow
   */
  public startWorkflow(workflowId: string): Workflow {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    if (workflow.status === WorkflowStatus.RUNNING) {
      return workflow; // Already running
    }
    
    // Update workflow
    workflow.status = WorkflowStatus.RUNNING;
    workflow.startedAt = Date.now();
    
    // Add to active workflows
    this.activeWorkflows.add(workflowId);
    
    // Save state
    this.saveState();
    
    // Start executing workflow
    this.executeWorkflow(workflow);
    
    // Emit event
    this.eventSystem.emit('workflow:started', { workflowId });
    
    return workflow;
  }

  /**
   * Pause a workflow
   * @param workflowId - Workflow ID
   * @returns Paused workflow
   */
  public pauseWorkflow(workflowId: string): Workflow {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    if (workflow.status !== WorkflowStatus.RUNNING) {
      return workflow; // Not running
    }
    
    // Update workflow
    workflow.status = WorkflowStatus.PAUSED;
    
    // Remove from active workflows
    this.activeWorkflows.delete(workflowId);
    
    // Save state
    this.saveState();
    
    // Emit event
    this.eventSystem.emit('workflow:paused', { workflowId });
    
    return workflow;
  }

  /**
   * Resume a paused workflow
   * @param workflowId - Workflow ID
   * @returns Resumed workflow
   */
  public resumeWorkflow(workflowId: string): Workflow {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    if (workflow.status !== WorkflowStatus.PAUSED) {
      return workflow; // Not paused
    }
    
    // Update workflow
    workflow.status = WorkflowStatus.RUNNING;
    
    // Add to active workflows
    this.activeWorkflows.add(workflowId);
    
    // Save state
    this.saveState();
    
    // Resume executing workflow
    this.executeWorkflow(workflow);
    
    // Emit event
    this.eventSystem.emit('workflow:resumed', { workflowId });
    
    return workflow;
  }

  /**
   * Cancel a workflow
   * @param workflowId - Workflow ID
   * @returns Cancelled workflow
   */
  public cancelWorkflow(workflowId: string): Workflow {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    if (workflow.status === WorkflowStatus.COMPLETED || 
        workflow.status === WorkflowStatus.FAILED ||
        workflow.status === WorkflowStatus.CANCELLED) {
      return workflow; // Already in terminal state
    }
    
    // Update workflow
    workflow.status = WorkflowStatus.CANCELLED;
    workflow.completedAt = Date.now();
    
    // Update running tasks
    for (const task of workflow.tasks) {
      if (task.status === TaskStatus.RUNNING) {
        task.status = TaskStatus.CANCELLED;
        task.endTime = Date.now();
      } else if (task.status === TaskStatus.PENDING) {
        task.status = TaskStatus.SKIPPED;
      }
    }
    
    // Remove from active workflows
    this.activeWorkflows.delete(workflowId);
    
    // Save state
    this.saveState();
    
    // Emit event
    this.eventSystem.emit('workflow:cancelled', { workflowId });
    
    return workflow;
  }

  /**
   * Create a workflow template
   * @param template - Template configuration
   * @returns Created template
   */
  public createTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'createdAt'>
  ): WorkflowTemplate {
    // Create template
    const newTemplate: WorkflowTemplate = {
      id: uuidv4(),
      name: template.name,
      description: template.description,
      version: template.version,
      tasks: template.tasks.map(task => ({
        ...task,
        id: task.id || uuidv4()
      })),
      variables: template.variables || {},
      createdAt: Date.now(),
      author: template.author,
      metadata: template.metadata || {}
    };
    
    // Store the template
    this.templates.set(newTemplate.id, newTemplate);
    
    // Save template to disk if template directory is set
    if (this.templateDirectory) {
      this.saveTemplateToDisk(newTemplate);
    }
    
    // Emit event
    this.eventSystem.emit('workflow:template:created', { templateId: newTemplate.id });
    
    return newTemplate;
  }

  /**
   * Get a template by ID
   * @param templateId - Template ID
   * @returns Template or null if not found
   */
  public getTemplate(templateId: string): WorkflowTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates
   * @returns Array of all templates
   */
  public getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Update a template
   * @param templateId - Template ID
   * @param updates - Updates to apply
   * @returns Updated template
   */
  public updateTemplate(
    templateId: string,
    updates: Partial<Omit<WorkflowTemplate, 'id' | 'createdAt'>>
  ): WorkflowTemplate {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // Create new version if version is updated
    if (updates.version && updates.version !== template.version) {
      // Create a copy with a new ID
      const newTemplate: WorkflowTemplate = {
        ...template,
        id: uuidv4(),
        version: updates.version,
        updatedAt: Date.now(),
        ...updates
      };
      
      // Store the new template
      this.templates.set(newTemplate.id, newTemplate);
      
      // Save to disk if template directory is set
      if (this.templateDirectory) {
        this.saveTemplateToDisk(newTemplate);
      }
      
      // Emit event
      this.eventSystem.emit('workflow:template:versioned', { 
        originalTemplateId: templateId,
        newTemplateId: newTemplate.id
      });
      
      return newTemplate;
    }
    
    // Update the template in place
    Object.assign(template, updates);
    template.updatedAt = Date.now();
    
    // Save to disk if template directory is set
    if (this.templateDirectory) {
      this.saveTemplateToDisk(template);
    }
    
    // Emit event
    this.eventSystem.emit('workflow:template:updated', { templateId });
    
    return template;
  }

  /**
   * Delete a template
   * @param templateId - Template ID
   * @returns Whether the template was deleted
   */
  public deleteTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return false;
    }
    
    // Delete the template
    this.templates.delete(templateId);
    
    // Delete from disk if template directory is set
    if (this.templateDirectory) {
      this.deleteTemplateFromDisk(template);
    }
    
    // Emit event
    this.eventSystem.emit('workflow:template:deleted', { templateId });
    
    return true;
  }

  /**
   * Execute a workflow
   * @param workflow - Workflow to execute
   */
  private async executeWorkflow(workflow: Workflow): Promise<void> {
    // Check if workflow is running
    if (workflow.status !== WorkflowStatus.RUNNING) {
      return;
    }
    
    // Get tasks that are ready to execute
    const readyTasks = this.getReadyTasks(workflow);
    
    if (readyTasks.length === 0) {
      // Check if all tasks are done
      const allTasksDone = workflow.tasks.every(task => 
        task.status === TaskStatus.COMPLETED || 
        task.status === TaskStatus.FAILED ||
        task.status === TaskStatus.SKIPPED ||
        task.status === TaskStatus.CANCELLED
      );
      
      if (allTasksDone) {
        // Check if any tasks failed
        const anyTaskFailed = workflow.tasks.some(task => task.status === TaskStatus.FAILED);
        
        // Update workflow status
        workflow.status = anyTaskFailed ? WorkflowStatus.FAILED : WorkflowStatus.COMPLETED;
        workflow.completedAt = Date.now();
        
        // Remove from active workflows
        this.activeWorkflows.delete(workflow.id);
        
        // Save state
        this.saveState();
        
        // Emit event
        this.eventSystem.emit('workflow:completed', { 
          workflowId: workflow.id,
          success: !anyTaskFailed
        });
      }
      
      return;
    }
    
    // Start executing ready tasks
    for (const task of readyTasks) {
      // Update task status
      task.status = TaskStatus.RUNNING;
      task.startTime = Date.now();
      
      // Save state
      this.saveState();
      
      // Emit event
      this.eventSystem.emit('workflow:task:started', { 
        workflowId: workflow.id,
        taskId: task.id
      });
      
      // Execute the task asynchronously
      this.executeTask(workflow, task).then(() => {
        // Continue workflow execution after task completion
        this.executeWorkflow(workflow);
      });
    }
  }

  /**
   * Execute a task
   * @param workflow - Workflow containing the task
   * @param task - Task to execute
   */
  private async executeTask(workflow: Workflow, task: WorkflowTask): Promise<void> {
    try {
      // Mark task as running
      task.status = TaskStatus.RUNNING;
      task.startTime = Date.now();
      this.saveState();
      
      // Get the task executor
      const executor = this.taskExecutors.get(task.action);
      
      if (!executor) {
        throw new Error(`No executor registered for action: ${task.action}`);
      }
      
      // Prepare dependencies results if task has dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencyResults = {};
        
        for (const depId of task.dependencies) {
          const depTask = workflow.tasks.find(t => t.id === depId);
          if (depTask) {
            task.dependencyResults[depTask.name] = depTask;
          }
        }
      }
      
      // Log task execution
      if (this.logger.info) {
        this.logger.info(`Executing task ${task.name} (${task.id}) in workflow ${workflow.id}`);
      } else {
        this.logger.log(`Executing task ${task.name} (${task.id}) in workflow ${workflow.id}`);
      }
      
      // Execute task
      const result = await Promise.race([
        executor(task, workflow.context || {}),
        new Promise<TaskExecutionResult>((_, reject) => {
          if (task.timeout) {
            setTimeout(() => reject(new Error(`Task timed out after ${task.timeout}ms`)), task.timeout);
          }
        })
      ]);
      
      // Update task status
      if (result.success) {
        task.status = TaskStatus.COMPLETED;
        task.result = result.result;
      } else {
        task.status = TaskStatus.FAILED;
        task.error = result.error || 'Task failed without error message';
        
        // Check if we should retry
        if (task.retries && task.retries > 0) {
          // Create a retry task
          const retryTask: WorkflowTask = {
            ...task,
            id: uuidv4(),
            name: `${task.name} (Retry)`,
            status: TaskStatus.PENDING,
            retries: task.retries - 1,
            startTime: undefined,
            endTime: undefined,
            result: undefined,
            error: undefined,
            metadata: {
              ...(task.metadata || {}),
              originalTaskId: task.id,
              retryCount: (task.metadata?.retryCount || 0) + 1
            }
          };
          
          // Add retry task to workflow
          workflow.tasks.push(retryTask);
          
          // Update task status
          task.status = TaskStatus.FAILED;
          task.error = `${task.error} (Retrying)`;
        }
      }
      
      task.endTime = Date.now();
      
      // Update workflow context with task result
      if (workflow.context && result.result !== undefined) {
        workflow.context[`task_${task.id}_result`] = result.result;
      }
      
      // Save state
      this.saveState();
      
      // Emit event
      this.eventSystem.emit('workflow:task:completed', { 
        workflowId: workflow.id,
        taskId: task.id,
        success: result.success
      });
    } catch (error) {
      // Update task status
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.endTime = Date.now();
      
      // Save state
      this.saveState();
      
      // Emit event
      this.eventSystem.emit('workflow:task:failed', { 
        workflowId: workflow.id,
        taskId: task.id,
        error: task.error
      });
    }
  }

  /**
   * Get tasks that are ready to execute
   * @param workflow - Workflow to check
   * @returns Array of ready tasks
   */
  private getReadyTasks(workflow: Workflow): WorkflowTask[] {
    return workflow.tasks.filter(task => {
      // Skip tasks that are not pending
      if (task.status !== TaskStatus.PENDING) {
        return false;
      }
      
      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          const depTask = workflow.tasks.find(t => t.id === depId);
          
          if (!depTask) {
            if (this.logger.warn) {
              this.logger.warn(`Task ${task.id} depends on non-existent task ${depId}`);
            } else {
              this.logger.log(`WARNING: Task ${task.id} depends on non-existent task ${depId}`);
            }
            return false;
          }
          
          if (depTask.status !== TaskStatus.COMPLETED) {
            // Dependency not completed
            return false;
          }
        }
      }
      
      // Check conditions
      if (task.conditions && task.conditions.length > 0) {
        for (const condition of task.conditions) {
          const conditionMet = this.evaluateCondition(condition, workflow, task);
          if (!conditionMet) {
            // Skip task if condition not met
            task.status = TaskStatus.SKIPPED;
            this.logger.log(`Task ${task.id} skipped due to unsatisfied condition`);
            
            // Emit event
            this.eventSystem.emit('workflow:task:skipped', { 
              workflowId: workflow.id,
              taskId: task.id
            });
            
            return false;
          }
        }
      }
      
      return true;
    });
  }

  /**
   * Evaluate a condition
   * @param condition - Condition to evaluate
   * @param workflow - Workflow context
   * @param task - Task being evaluated
   * @returns Whether the condition is met
   */
  private evaluateCondition(
    condition: TaskCondition,
    workflow: Workflow,
    task: WorkflowTask
  ): boolean {
    switch (condition.type) {
      case ConditionType.TASK_SUCCESS:
        if (!condition.taskId) return true;
        const successTask = workflow.tasks.find(t => t.id === condition.taskId);
        return successTask?.status === TaskStatus.COMPLETED;
        
      case ConditionType.TASK_FAILURE:
        if (!condition.taskId) return true;
        const failureTask = workflow.tasks.find(t => t.id === condition.taskId);
        return failureTask?.status === TaskStatus.FAILED;
        
      case ConditionType.TASK_COMPLETION:
        if (!condition.taskId) return true;
        const completionTask = workflow.tasks.find(t => t.id === condition.taskId);
        return completionTask?.status === TaskStatus.COMPLETED || 
               completionTask?.status === TaskStatus.FAILED;
        
      case ConditionType.EXPRESSION:
        if (!condition.expression) return true;
        try {
          // Simple expression evaluation (for advanced cases, use a proper expression engine)
          // eslint-disable-next-line no-new-func
          const evalFunc = new Function(
            'context', 
            'task', 
            'workflow',
            `return ${condition.expression}`
          );
          return !!evalFunc(workflow.context || {}, task, workflow);
        } catch (error) {
          this.logger.error(`Error evaluating condition expression: ${error}`);
          return false;
        }
        
      case ConditionType.STATE_CONDITION:
        if (!condition.statePath || !workflow.context) return true;
        const pathParts = condition.statePath.split('.');
        let value = workflow.context;
        
        // Navigate to the value
        for (const part of pathParts) {
          if (value === undefined || value === null) return false;
          value = value[part];
        }
        
        if (condition.value === undefined) {
          return value !== undefined && value !== null;
        }
        
        return value === condition.value;
        
      case ConditionType.ALWAYS:
        return true;
        
      default:
        return true;
    }
  }

  /**
   * Resume active workflows after engine restart
   */
  private resumeActiveWorkflows(): void {
    for (const workflowId of this.activeWorkflows) {
      const workflow = this.workflows.get(workflowId);
      
      if (workflow && workflow.status === WorkflowStatus.RUNNING) {
        // Resume workflow execution
        setTimeout(() => {
          this.executeWorkflow(workflow);
        }, 0);
      }
    }
  }

  /**
   * Save engine state
   */
  private saveState(): void {
    const state = {
      workflows: Array.from(this.workflows.entries()),
      activeWorkflows: Array.from(this.activeWorkflows)
    };
    
    this.storageSystem.set('workflowEngine', state);
  }

  /**
   * Load engine state
   */
  private async loadState(): Promise<void> {
    try {
      const state = await this.storageSystem.get<{
        workflows: [string, Workflow][];
        activeWorkflows: string[];
      }>('workflowEngine');
      
      if (state) {
        this.workflows = new Map(state.workflows);
        this.activeWorkflows = new Set(state.activeWorkflows);
        this.logger.log(`Loaded ${this.workflows.size} workflows, ${this.activeWorkflows.size} active`);
      }
    } catch (error) {
      this.logger.error('Error loading workflow engine state:', error);
    }
  }

  /**
   * Load templates from disk
   */
  private loadTemplatesFromDisk(): void {
    if (!this.templateDirectory) return;
    
    try {
      if (!fs.existsSync(this.templateDirectory)) {
        fs.mkdirSync(this.templateDirectory, { recursive: true });
        return;
      }
      
      const files = fs.readdirSync(this.templateDirectory);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.templateDirectory, file);
            const template = fs.readJsonSync(filePath) as WorkflowTemplate;
            this.templates.set(template.id, template);
          } catch (error) {
            this.logger.error(`Error loading template from ${file}:`, error);
          }
        }
      }
      
      this.logger.log(`Loaded ${this.templates.size} workflow templates from disk`);
    } catch (error) {
      this.logger.error('Error loading templates from disk:', error);
    }
  }

  /**
   * Save template to disk
   * @param template - Template to save
   */
  private saveTemplateToDisk(template: WorkflowTemplate): void {
    if (!this.templateDirectory) return;
    
    try {
      if (!fs.existsSync(this.templateDirectory)) {
        fs.mkdirSync(this.templateDirectory, { recursive: true });
      }
      
      const filePath = path.join(this.templateDirectory, `${template.id}.json`);
      fs.writeJsonSync(filePath, template, { spaces: 2 });
    } catch (error) {
      this.logger.error(`Error saving template ${template.id} to disk:`, error);
    }
  }

  /**
   * Delete template from disk
   * @param template - Template to delete
   */
  private deleteTemplateFromDisk(template: WorkflowTemplate): void {
    if (!this.templateDirectory) return;
    
    try {
      const filePath = path.join(this.templateDirectory, `${template.id}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.error(`Error deleting template ${template.id} from disk:`, error);
    }
  }
} 