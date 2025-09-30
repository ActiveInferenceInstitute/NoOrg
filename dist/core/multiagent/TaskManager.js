"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManager = void 0;
const uuid_1 = require("uuid");
const SharedStateManager_1 = require("./SharedStateManager");
/**
 * Implementation of the TaskManager
 * Manages tasks in the system including creation, assignment, and status tracking
 */
class TaskManager {
    /**
     * Get the singleton instance of TaskManager
     * @returns TaskManager instance
     */
    static getInstance() {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }
    /**
     * Constructor initializes with SharedStateManager
     * @param stateManager Optional SharedStateManager instance
     */
    constructor(stateManager) {
        this.tasks = new Map();
        this.stateManager = stateManager || SharedStateManager_1.SharedStateManager.getInstance();
    }
    /**
     * Create a new task
     * @param taskData Task data
     * @returns Task ID if successful
     */
    async createTask(taskData) {
        const taskId = taskData.id || (0, uuid_1.v4)();
        const now = Date.now();
        const task = {
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
    async assignTask(taskId, agentId) {
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
    async startTask(taskId) {
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
    async completeTask(taskId, result) {
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
    async failTask(taskId, error) {
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
    async cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        task.status = 'failed'; // We'll use 'failed' since our status doesn't include 'cancelled'
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
    async getTask(taskId) {
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
    async listTasks(filter) {
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
                tasks = tasks.filter(task => task.createdAt >= filter.createdAfter);
            }
            if (filter.createdBefore) {
                tasks = tasks.filter(task => task.createdAt <= filter.createdBefore);
            }
            if (filter.updatedAfter) {
                tasks = tasks.filter(task => task.updatedAt >= filter.updatedAfter);
            }
            if (filter.updatedBefore) {
                tasks = tasks.filter(task => task.updatedAt <= filter.updatedBefore);
            }
        }
        return tasks;
    }
    /**
     * Check if task dependencies are satisfied
     * @param taskId Task ID
     * @returns True if dependencies are satisfied
     */
    async areDependenciesSatisfied(taskId) {
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
    /**
     * Unassign a task from its current agent
     * @param taskId Task ID
     */
    async unassignTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        task.assignedTo = undefined;
        task.status = 'pending';
        task.updatedAt = Date.now();
        this.tasks.set(taskId, task);
        // Update shared state
        await this.stateManager.setState(`tasks.${taskId}`, task);
    }
    /**
     * Reassign a task to a different agent
     * @param taskId Task ID
     * @param newAgentId New agent ID
     */
    async reassignTask(taskId, newAgentId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        const previousAgent = task.assignedTo;
        task.assignedTo = newAgentId;
        task.status = 'assigned';
        task.updatedAt = Date.now();
        // Store reassignment history in metadata
        if (!task.metadata) {
            task.metadata = {};
        }
        if (!task.metadata.reassignmentHistory) {
            task.metadata.reassignmentHistory = [];
        }
        task.metadata.reassignmentHistory.push({
            from: previousAgent,
            to: newAgentId,
            timestamp: Date.now()
        });
        this.tasks.set(taskId, task);
        // Update shared state
        await this.stateManager.setState(`tasks.${taskId}`, task);
    }
    /**
     * Get task history including all state changes
     * @param taskId Task ID
     * @returns Task history
     */
    async getTaskHistory(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        const history = [
            {
                timestamp: task.createdAt,
                event: 'created',
                status: 'pending',
                metadata: { task: task.name }
            }
        ];
        if (task.assignedTo) {
            history.push({
                timestamp: task.updatedAt,
                event: 'assigned',
                status: 'assigned',
                agentId: task.assignedTo,
                metadata: {}
            });
        }
        if (task.status === 'in-progress' || task.status === 'completed' || task.status === 'failed') {
            history.push({
                timestamp: task.updatedAt,
                event: 'started',
                status: 'in-progress',
                agentId: task.assignedTo,
                metadata: {}
            });
        }
        if (task.status === 'completed' && task.completedAt) {
            history.push({
                timestamp: task.completedAt,
                event: 'completed',
                status: 'completed',
                agentId: task.assignedTo,
                metadata: { processingTime: task.processingTime }
            });
        }
        if (task.status === 'failed' && task.failedAt) {
            history.push({
                timestamp: task.failedAt,
                event: 'failed',
                status: 'failed',
                agentId: task.assignedTo,
                metadata: { error: task.error }
            });
        }
        // Add reassignment history if exists
        if (task.metadata?.reassignmentHistory) {
            const reassignments = task.metadata.reassignmentHistory;
            reassignments.forEach(reassignment => {
                history.push({
                    timestamp: reassignment.timestamp,
                    event: 'reassigned',
                    status: task.status,
                    agentId: reassignment.to,
                    metadata: { previousAgent: reassignment.from }
                });
            });
        }
        // Sort by timestamp
        return history.sort((a, b) => a.timestamp - b.timestamp);
    }
    /**
     * Estimate task duration based on historical data
     * @param task Task to estimate
     * @returns Estimated duration in milliseconds
     */
    async estimateTaskDuration(task) {
        // Get completed tasks of similar type
        const completedTasks = Array.from(this.tasks.values()).filter(t => t.type === task.type &&
            t.status === 'completed' &&
            t.processingTime !== undefined);
        if (completedTasks.length === 0) {
            // No historical data, return default estimate
            const priorityMultipliers = {
                'critical': 0.5, // Critical tasks get done faster
                'high': 0.75,
                'medium': 1.0,
                'low': 1.5
            };
            const baseEstimate = 60000; // 1 minute default
            const multiplier = task.priority ? priorityMultipliers[task.priority] || 1.0 : 1.0;
            return baseEstimate * multiplier;
        }
        // Calculate average processing time
        const totalTime = completedTasks.reduce((sum, t) => sum + (t.processingTime || 0), 0);
        const avgTime = totalTime / completedTasks.length;
        // Adjust based on priority
        const priorityMultipliers = {
            'critical': 0.8,
            'high': 0.9,
            'medium': 1.0,
            'low': 1.2
        };
        const multiplier = task.priority ? priorityMultipliers[task.priority] || 1.0 : 1.0;
        return Math.round(avgTime * multiplier);
    }
    /**
     * Get task statistics
     * @returns Task statistics
     */
    async getTaskStatistics() {
        const tasks = Array.from(this.tasks.values());
        const stats = {
            total: tasks.length,
            byStatus: {
                pending: 0,
                assigned: 0,
                'in-progress': 0,
                completed: 0,
                failed: 0
            },
            byPriority: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            avgProcessingTime: 0,
            successRate: 0
        };
        let totalProcessingTime = 0;
        let processedTaskCount = 0;
        let successfulTasks = 0;
        tasks.forEach(task => {
            // Count by status
            stats.byStatus[task.status]++;
            // Count by priority
            if (task.priority) {
                stats.byPriority[task.priority]++;
            }
            // Calculate processing time average
            if (task.processingTime) {
                totalProcessingTime += task.processingTime;
                processedTaskCount++;
            }
            // Calculate success rate
            if (task.status === 'completed') {
                successfulTasks++;
            }
        });
        if (processedTaskCount > 0) {
            stats.avgProcessingTime = totalProcessingTime / processedTaskCount;
        }
        const finishedTasks = stats.byStatus.completed + stats.byStatus.failed;
        if (finishedTasks > 0) {
            stats.successRate = (successfulTasks / finishedTasks) * 100;
        }
        return stats;
    }
    /**
     * Clean up old completed tasks
     * @param olderThan Timestamp - remove tasks older than this
     */
    async cleanupOldTasks(olderThan) {
        const tasks = Array.from(this.tasks.values());
        let removedCount = 0;
        for (const task of tasks) {
            if ((task.status === 'completed' || task.status === 'failed') &&
                task.updatedAt < olderThan) {
                this.tasks.delete(task.id);
                await this.stateManager.setState(`tasks.${task.id}`, undefined);
                removedCount++;
            }
        }
        return removedCount;
    }
    /**
     * Update task properties
     * @param taskId Task ID
     * @param updates Partial task data for updates
     */
    async updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        // Update task properties
        const updatedTask = {
            ...task,
            ...updates,
            id: taskId,
            updatedAt: Date.now()
        };
        this.tasks.set(taskId, updatedTask);
        // Update shared state
        await this.stateManager.setState(`tasks.${taskId}`, updatedTask);
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=TaskManager.js.map