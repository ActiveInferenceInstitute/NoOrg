export interface TaskDefinition {
    id: string;
    type: string;
    priority: number;
    params: Record<string, any>;
    requiredCapabilities: string[];
    metadata?: Record<string, any>;
    timeout?: number;
    createTime: number;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'canceled';
    assignedTo?: string;
    result?: any;
    error?: string;
}
export interface OrchestratorOptions {
    taskAssignmentInterval?: number;
    maxRetries?: number;
    circuitBreakerFailureThreshold?: number;
}
/**
 * AgentOrchestrator handles the assignment and execution of tasks
 * across a distributed multi-agent system.
 */
export declare class AgentOrchestrator {
    private static instance;
    private eventSystem;
    private storageSystem;
    private discoveryService;
    private tasks;
    private taskQueue;
    private taskAssignmentInterval?;
    private agentCircuitBreakers;
    private taskRetry;
    private options;
    private constructor();
    static getInstance(options?: OrchestratorOptions): AgentOrchestrator;
    /**
     * Submit a new task to the orchestrator for execution
     */
    submitTask(task: Omit<TaskDefinition, 'createTime' | 'status'>): Promise<TaskDefinition>;
    /**
     * Cancel a task that's currently in the system
     */
    cancelTask(id: string): Promise<boolean>;
    /**
     * Get the current status of a task
     */
    getTaskStatus(id: string): TaskDefinition | undefined;
    /**
     * Get all tasks in the system
     */
    getAllTasks(): TaskDefinition[];
    /**
     * Get tasks filtered by status
     */
    getTasksByStatus(status: TaskDefinition['status']): TaskDefinition[];
    /**
     * Add a task to the priority queue
     */
    private addToQueue;
    /**
     * Start the task assignment process
     */
    private startTaskAssignment;
    /**
     * Assign pending tasks to available agents
     */
    private assignPendingTasks;
    /**
     * Select the best agent for a task based on criteria
     */
    private selectBestAgent;
    /**
     * Assign a task to a specific agent
     */
    private assignTaskToAgent;
    /**
     * Check for tasks that have exceeded their timeout
     */
    private checkTaskTimeouts;
    /**
     * Get or create a circuit breaker for an agent
     */
    private getCircuitBreaker;
    /**
     * Set up event listeners for orchestration events
     */
    private setupEventListeners;
    /**
     * Handle task started event from an agent
     */
    private handleTaskStarted;
    /**
     * Handle task completed event from an agent
     */
    private handleTaskCompleted;
    /**
     * Handle task failed event from an agent
     */
    private handleTaskFailed;
    /**
     * Handle agent expired event (agent is no longer available)
     */
    private handleAgentExpired;
    /**
     * Load tasks from storage on startup
     */
    private loadTasksFromStorage;
    /**
     * Clean up resources when service is shutting down
     */
    dispose(): void;
}
//# sourceMappingURL=AgentOrchestrator.d.ts.map