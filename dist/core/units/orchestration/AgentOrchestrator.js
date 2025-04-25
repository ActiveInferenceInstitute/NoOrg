"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const EventSystem_1 = require("../../events/EventSystem");
const StorageSystem_1 = require("../../storage/StorageSystem");
const AgentDiscoveryService_1 = require("../discovery/AgentDiscoveryService");
const patterns_1 = require("../../integration/patterns");
/**
 * AgentOrchestrator handles the assignment and execution of tasks
 * across a distributed multi-agent system.
 */
class AgentOrchestrator {
    constructor(options = {}) {
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.storageSystem = StorageSystem_1.StorageSystem.getInstance();
        this.discoveryService = AgentDiscoveryService_1.AgentDiscoveryService.getInstance();
        this.tasks = new Map();
        this.taskQueue = [];
        this.agentCircuitBreakers = new Map();
        this.options = {
            taskAssignmentInterval: 5000, // 5 seconds
            maxRetries: 3,
            circuitBreakerFailureThreshold: 3,
            ...options
        };
        this.taskRetry = new patterns_1.Retry('task-orchestrator', {
            maxAttempts: this.options.maxRetries,
            initialDelay: 1000,
            backoffFactor: 2
        });
        this.setupEventListeners();
        this.startTaskAssignment();
        this.loadTasksFromStorage();
    }
    static getInstance(options) {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator(options);
        }
        return AgentOrchestrator.instance;
    }
    /**
     * Submit a new task to the orchestrator for execution
     */
    async submitTask(task) {
        const taskDefinition = {
            ...task,
            createTime: Date.now(),
            status: 'pending'
        };
        this.tasks.set(task.id, taskDefinition);
        this.addToQueue(task.id);
        await this.storageSystem.set(`task:${task.id}`, taskDefinition);
        this.eventSystem.emit('orchestrator:task:submitted', { task: taskDefinition });
        return taskDefinition;
    }
    /**
     * Cancel a task that's currently in the system
     */
    async cancelTask(id) {
        const task = this.tasks.get(id);
        if (!task)
            return false;
        if (task.status === 'completed' || task.status === 'failed') {
            return false;
        }
        task.status = 'canceled';
        await this.storageSystem.set(`task:${id}`, task);
        this.eventSystem.emit('orchestrator:task:canceled', { taskId: id });
        // If assigned, notify the agent
        if (task.assignedTo) {
            this.eventSystem.emit('orchestrator:task:cancel_request', {
                taskId: id,
                agentId: task.assignedTo
            });
        }
        // Remove from queue if still there
        const queueIndex = this.taskQueue.indexOf(id);
        if (queueIndex !== -1) {
            this.taskQueue.splice(queueIndex, 1);
        }
        return true;
    }
    /**
     * Get the current status of a task
     */
    getTaskStatus(id) {
        return this.tasks.get(id);
    }
    /**
     * Get all tasks in the system
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * Get tasks filtered by status
     */
    getTasksByStatus(status) {
        return Array.from(this.tasks.values()).filter(task => task.status === status);
    }
    /**
     * Add a task to the priority queue
     */
    addToQueue(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== 'pending')
            return;
        // Find the right place in the queue based on priority
        const index = this.taskQueue.findIndex(id => {
            const queuedTask = this.tasks.get(id);
            return queuedTask && queuedTask.priority < task.priority;
        });
        if (index === -1) {
            this.taskQueue.push(taskId);
        }
        else {
            this.taskQueue.splice(index, 0, taskId);
        }
    }
    /**
     * Start the task assignment process
     */
    startTaskAssignment() {
        this.taskAssignmentInterval = setInterval(() => {
            this.assignPendingTasks();
            this.checkTaskTimeouts();
        }, this.options.taskAssignmentInterval);
    }
    /**
     * Assign pending tasks to available agents
     */
    async assignPendingTasks() {
        if (this.taskQueue.length === 0)
            return;
        // Clone the queue to avoid issues with concurrent modifications
        const queue = [...this.taskQueue];
        for (const taskId of queue) {
            const task = this.tasks.get(taskId);
            if (!task || task.status !== 'pending')
                continue;
            // Find suitable agents for this task
            const agents = this.discoveryService.findAgents({
                capabilities: task.requiredCapabilities,
                status: 'active'
            });
            if (agents.length === 0)
                continue;
            // Select the best agent (could implement more sophisticated selection)
            const agent = this.selectBestAgent(agents, task);
            if (!agent)
                continue;
            // Try to assign the task
            await this.assignTaskToAgent(task, agent);
            // Remove from queue
            const queueIndex = this.taskQueue.indexOf(taskId);
            if (queueIndex !== -1) {
                this.taskQueue.splice(queueIndex, 1);
            }
        }
    }
    /**
     * Select the best agent for a task based on criteria
     */
    selectBestAgent(agents, task) {
        // Filter out agents with open circuit breakers
        const availableAgents = agents.filter(agent => {
            const breaker = this.getCircuitBreaker(agent.id);
            return breaker.getState().status !== 'OPEN';
        });
        if (availableAgents.length === 0)
            return null;
        // In this simple implementation, just select the first available agent
        // In a real system, consider load balancing, agent specialization, etc.
        return availableAgents[0];
    }
    /**
     * Assign a task to a specific agent
     */
    async assignTaskToAgent(task, agent) {
        // Update task status
        task.status = 'assigned';
        task.assignedTo = agent.id;
        await this.storageSystem.set(`task:${task.id}`, task);
        // Try to send the task to the agent with retries
        try {
            const breaker = this.getCircuitBreaker(agent.id);
            await this.taskRetry.execute(async () => {
                return await breaker.execute(async () => {
                    // In a real system, this would send a message to the agent
                    this.eventSystem.emit('orchestrator:task:assigned', {
                        task,
                        agentId: agent.id
                    });
                    // Simulate waiting for acknowledgment
                    // In a real system, you'd wait for a response from the agent
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(true), 100);
                    });
                });
            });
            return true;
        }
        catch (error) {
            // Task assignment failed after retries
            console.error(`Failed to assign task ${task.id} to agent ${agent.id}:`, error);
            // Revert task status
            task.status = 'pending';
            task.assignedTo = undefined;
            await this.storageSystem.set(`task:${task.id}`, task);
            // Add back to queue
            this.addToQueue(task.id);
            return false;
        }
    }
    /**
     * Check for tasks that have exceeded their timeout
     */
    async checkTaskTimeouts() {
        const now = Date.now();
        for (const task of this.tasks.values()) {
            if (task.status !== 'running' && task.status !== 'assigned')
                continue;
            if (!task.timeout)
                continue;
            const ageMs = now - task.createTime;
            if (ageMs > task.timeout) {
                // Mark as failed due to timeout
                task.status = 'failed';
                task.error = `Task timed out after ${task.timeout}ms`;
                await this.storageSystem.set(`task:${task.id}`, task);
                this.eventSystem.emit('orchestrator:task:timeout', {
                    taskId: task.id,
                    timeout: task.timeout
                });
            }
        }
    }
    /**
     * Get or create a circuit breaker for an agent
     */
    getCircuitBreaker(agentId) {
        if (!this.agentCircuitBreakers.has(agentId)) {
            const breaker = new patterns_1.CircuitBreaker(`agent-${agentId}`, {
                failureThreshold: this.options.circuitBreakerFailureThreshold,
                resetTimeout: 60000 // 1 minute
            });
            this.agentCircuitBreakers.set(agentId, breaker);
        }
        return this.agentCircuitBreakers.get(agentId);
    }
    /**
     * Set up event listeners for orchestration events
     */
    setupEventListeners() {
        // Listen for task updates from agents
        this.eventSystem.on('agent:task:started', (event) => {
            const { taskId, agentId } = event.payload;
            this.handleTaskStarted(taskId, agentId);
        });
        this.eventSystem.on('agent:task:completed', (event) => {
            const { taskId, agentId, result } = event.payload;
            this.handleTaskCompleted(taskId, agentId, result);
        });
        this.eventSystem.on('agent:task:failed', (event) => {
            const { taskId, agentId, error } = event.payload;
            this.handleTaskFailed(taskId, agentId, error);
        });
        // Agent discovery events
        this.eventSystem.on('discovery:agent:expired', (event) => {
            const { agentId } = event.payload;
            this.handleAgentExpired(agentId);
        });
    }
    /**
     * Handle task started event from an agent
     */
    async handleTaskStarted(taskId, agentId) {
        const task = this.tasks.get(taskId);
        if (!task || task.assignedTo !== agentId)
            return;
        task.status = 'running';
        await this.storageSystem.set(`task:${taskId}`, task);
        this.eventSystem.emit('orchestrator:task:running', { taskId, agentId });
    }
    /**
     * Handle task completed event from an agent
     */
    async handleTaskCompleted(taskId, agentId, result) {
        const task = this.tasks.get(taskId);
        if (!task || task.assignedTo !== agentId)
            return;
        task.status = 'completed';
        task.result = result;
        await this.storageSystem.set(`task:${taskId}`, task);
        this.eventSystem.emit('orchestrator:task:completed', { taskId, agentId, result });
    }
    /**
     * Handle task failed event from an agent
     */
    async handleTaskFailed(taskId, agentId, error) {
        const task = this.tasks.get(taskId);
        if (!task || task.assignedTo !== agentId)
            return;
        task.status = 'failed';
        task.error = error;
        await this.storageSystem.set(`task:${taskId}`, task);
        this.eventSystem.emit('orchestrator:task:failed', { taskId, agentId, error });
    }
    /**
     * Handle agent expired event (agent is no longer available)
     */
    async handleAgentExpired(agentId) {
        // Reassign tasks from this agent
        for (const task of this.tasks.values()) {
            if (task.assignedTo === agentId &&
                (task.status === 'assigned' || task.status === 'running')) {
                // Reset task to pending state
                task.status = 'pending';
                task.assignedTo = undefined;
                await this.storageSystem.set(`task:${task.id}`, task);
                // Add back to queue
                this.addToQueue(task.id);
                this.eventSystem.emit('orchestrator:task:reassigned', {
                    taskId: task.id,
                    previousAgentId: agentId
                });
            }
        }
    }
    /**
     * Load tasks from storage on startup
     */
    async loadTasksFromStorage() {
        try {
            // In a real system, you'd need a way to get all task keys
            const taskRegistry = await this.storageSystem.get('task:registry') || [];
            for (const taskId of taskRegistry) {
                const task = await this.storageSystem.get(`task:${taskId}`);
                if (task) {
                    this.tasks.set(task.id, task);
                    // Add pending tasks to the queue
                    if (task.status === 'pending') {
                        this.addToQueue(task.id);
                    }
                }
            }
            this.eventSystem.emit('orchestrator:loaded', {
                taskCount: this.tasks.size,
                pendingCount: this.taskQueue.length
            });
        }
        catch (error) {
            console.error('Error loading tasks from storage:', error);
        }
    }
    /**
     * Clean up resources when service is shutting down
     */
    dispose() {
        if (this.taskAssignmentInterval) {
            clearInterval(this.taskAssignmentInterval);
        }
        // Dispose all circuit breakers
        for (const breaker of this.agentCircuitBreakers.values()) {
            breaker.dispose();
        }
        this.taskRetry.dispose();
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
//# sourceMappingURL=AgentOrchestrator.js.map