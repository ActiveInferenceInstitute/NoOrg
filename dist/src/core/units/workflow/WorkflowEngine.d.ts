/**
 * WorkflowEngine module
 *
 * Provides a complete workflow execution engine for organizational units with
 * support for DAG-based task dependencies, conditional execution, templates, and versioning.
 */
/**
 * Task status enum
 */
export declare enum TaskStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    SKIPPED = "skipped",
    CANCELLED = "cancelled"
}
/**
 * Workflow status enum
 */
export declare enum WorkflowStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    PAUSED = "paused",
    CANCELLED = "cancelled"
}
/**
 * Condition type enum
 */
export declare enum ConditionType {
    TASK_SUCCESS = "task_success",
    TASK_FAILURE = "task_failure",
    TASK_COMPLETION = "task_completion",
    EXPRESSION = "expression",
    STATE_CONDITION = "state_condition",
    ALWAYS = "always"
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
    data?: Record<string, any>;
    dependencyResults?: Record<string, WorkflowTask>;
    output?: Record<string, any>;
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
export type TaskExecutor = (task: WorkflowTask, context: Record<string, any>) => Promise<TaskExecutionResult>;
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
export declare class WorkflowEngine {
    private static instance;
    private workflows;
    private templates;
    private eventSystem;
    private storageSystem;
    private taskExecutors;
    private activeWorkflows;
    private logger;
    private templateDirectory?;
    /**
     * Get singleton instance
     * @param options - Engine options
     * @returns WorkflowEngine instance
     */
    static getInstance(options?: {
        logger?: ILogger;
        templateDirectory?: string;
    }): WorkflowEngine;
    /**
     * Create a new WorkflowEngine
     * @param logger - Logger instance
     * @param templateDirectory - Directory for workflow templates
     */
    private constructor();
    /**
     * Register a task executor
     * @param action - Task action name
     * @param executor - Task executor function
     */
    registerTaskExecutor(action: string, executor: TaskExecutor): void;
    /**
     * Create workflow from a template
     * @param templateIdOrName - Template ID or name
     * @param options - Workflow options
     * @returns Created workflow
     */
    createWorkflowFromTemplate(templateIdOrName: string, options?: WorkflowExecutionOptions): Workflow;
    /**
     * Create a custom workflow
     * @param workflow - Workflow configuration
     * @param options - Workflow options
     * @returns Created workflow
     */
    createWorkflow(workflow: Omit<Workflow, 'id' | 'status' | 'createdAt' | 'tasks'> & {
        tasks: Omit<WorkflowTask, 'status' | 'result' | 'error' | 'startTime' | 'endTime'>[];
    }, options?: WorkflowExecutionOptions): Workflow;
    /**
     * Get a workflow by ID
     * @param workflowId - Workflow ID
     * @returns Workflow or null if not found
     */
    getWorkflow(workflowId: string): Workflow | null;
    /**
     * Get all workflows
     * @returns Array of all workflows
     */
    getAllWorkflows(): Workflow[];
    /**
     * Start a workflow
     * @param workflowId - Workflow ID
     * @returns Started workflow
     */
    startWorkflow(workflowId: string): Workflow;
    /**
     * Pause a workflow
     * @param workflowId - Workflow ID
     * @returns Paused workflow
     */
    pauseWorkflow(workflowId: string): Workflow;
    /**
     * Resume a paused workflow
     * @param workflowId - Workflow ID
     * @returns Resumed workflow
     */
    resumeWorkflow(workflowId: string): Workflow;
    /**
     * Cancel a workflow
     * @param workflowId - Workflow ID
     * @returns Cancelled workflow
     */
    cancelWorkflow(workflowId: string): Workflow;
    /**
     * Create a workflow template
     * @param template - Template configuration
     * @returns Created template
     */
    createTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt'>): WorkflowTemplate;
    /**
     * Get a template by ID
     * @param templateId - Template ID
     * @returns Template or null if not found
     */
    getTemplate(templateId: string): WorkflowTemplate | null;
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates(): WorkflowTemplate[];
    /**
     * Update a template
     * @param templateId - Template ID
     * @param updates - Updates to apply
     * @returns Updated template
     */
    updateTemplate(templateId: string, updates: Partial<Omit<WorkflowTemplate, 'id' | 'createdAt'>>): WorkflowTemplate;
    /**
     * Delete a template
     * @param templateId - Template ID
     * @returns Whether the template was deleted
     */
    deleteTemplate(templateId: string): boolean;
    /**
     * Execute a workflow
     * @param workflow - Workflow to execute
     */
    private executeWorkflow;
    /**
     * Execute a task
     * @param workflow - Workflow containing the task
     * @param task - Task to execute
     */
    private executeTask;
    /**
     * Get tasks that are ready to execute
     * @param workflow - Workflow to check
     * @returns Array of ready tasks
     */
    private getReadyTasks;
    /**
     * Evaluate a condition
     * @param condition - Condition to evaluate
     * @param workflow - Workflow context
     * @param task - Task being evaluated
     * @returns Whether the condition is met
     */
    private evaluateCondition;
    /**
     * Resume active workflows after engine restart
     */
    private resumeActiveWorkflows;
    /**
     * Save engine state
     */
    private saveState;
    /**
     * Load engine state
     */
    private loadState;
    /**
     * Load templates from disk
     */
    private loadTemplatesFromDisk;
    /**
     * Save template to disk
     * @param template - Template to save
     */
    private saveTemplateToDisk;
    /**
     * Delete template from disk
     * @param template - Template to delete
     */
    private deleteTemplateFromDisk;
}
//# sourceMappingURL=WorkflowEngine.d.ts.map