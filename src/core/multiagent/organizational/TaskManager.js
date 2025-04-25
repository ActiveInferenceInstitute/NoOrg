// Placeholder for Task Manager Logic
const { Task } = require('./types');
const { v4: uuidv4 } = require('uuid');

class TaskManager {
    constructor() {
        this.tasks = new Map(); // taskId -> Task instance
        this.taskHistory = []; // Log of significant task events
    }

    /**
     * Creates a new task instance.
     * @param {object} taskData - Initial data for the task (title, description, etc.)
     * @returns {Task} The created task instance.
     */
    createTask(taskData) {
        const task = new Task(taskData); // Use the Task class constructor
        this.tasks.set(task.id, task);
        this._logHistory('created', task.id, { title: task.title });
        console.log(`📝 Task created: ${task.title} (ID: ${task.id})`);
        return task;
    }

    /**
     * Assigns a task to a specific agent and unit.
     * @param {string} taskId - The ID of the task to assign.
     * @param {string} agentId - The ID of the agent to assign the task to.
     * @param {string} unitId - The ID of the unit the agent represents.
     * @returns {Task} The updated task instance.
     */
    assignTask(taskId, agentId, unitId) {
        const task = this._getTaskOrFail(taskId);
        task.assignedToAgentId = agentId;
        task.assignedToUnitId = unitId;
        task.status = 'assigned';
        task.updatedAt = new Date().toISOString();
        this._logHistory('assigned', taskId, { agentId, unitId });
        console.log(`🔗 Task "${task.title}" assigned to Agent ID: ${agentId} (Unit ID: ${unitId})`);
        return task;
    }

    /**
     * Updates properties of an existing task.
     * @param {string} taskId - The ID of the task to update.
     * @param {object} updates - An object containing properties to update (e.g., { status: 'processing', output: '...' }).
     * @returns {Task} The updated task instance.
     */
    updateTask(taskId, updates) {
        const task = this._getTaskOrFail(taskId);
        const originalStatus = task.status;
        
        // Automatically set timestamps based on status changes
        if (updates.status && updates.status !== originalStatus) {
            if (updates.status === 'processing' && !task.startedAt) {
                updates.startedAt = new Date().toISOString();
            }
            if ((updates.status === 'completed' || updates.status === 'failed') && !task.completedAt) {
                updates.completedAt = new Date().toISOString();
            }
        }
        
        Object.assign(task, updates, { updatedAt: new Date().toISOString() });
        this._logHistory('updated', taskId, { updatedFields: Object.keys(updates) });
        return task;
    }

    getTask(taskId) {
        return this.tasks.get(taskId);
    }

    _getTaskOrFail(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        return task;
    }

    getTasks(filter = {}) {
        let tasks = Array.from(this.tasks.values());
        Object.keys(filter).forEach(key => {
            if (filter[key] !== undefined) {
                tasks = tasks.filter(task => task[key] === filter[key]);
            }
        });
        return tasks;
    }

    /**
     * Checks if all dependencies for a given task have been completed.
     * @param {string} taskId - The ID of the task to check.
     * @returns {boolean} True if all dependencies are met, false otherwise.
     */
    areDependenciesMet(taskId) {
        const task = this._getTaskOrFail(taskId);
        if (!task.dependsOn || task.dependsOn.length === 0) {
            return true;
        }
        return task.dependsOn.every(depId => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status === 'completed';
        });
    }

    _logHistory(action, taskId, details = {}) {
        this.taskHistory.push({
            action,
            taskId,
            timestamp: new Date().toISOString(),
            details,
        });
    }
    
    getTaskHistory() {
        return this.taskHistory;
    }
}

module.exports = TaskManager; 