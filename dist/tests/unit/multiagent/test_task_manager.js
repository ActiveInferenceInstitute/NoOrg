"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const TaskManager_1 = require("../../../src/core/multiagent/TaskManager");
(0, mocha_1.describe)('TaskManager', () => {
    let taskManager;
    (0, mocha_1.beforeEach)(() => {
        // Create a new task manager before each test
        taskManager = new TaskManager_1.TaskManager();
    });
    (0, mocha_1.describe)('createTask', () => {
        (0, mocha_1.it)('should create a task with provided values', async () => {
            const taskId = await taskManager.createTask({
                type: 'test',
                description: 'Test task',
                priority: 'high',
                metadata: {
                    testKey: 'testValue'
                }
            });
            (0, chai_1.expect)(taskId).to.be.a('string');
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task).to.not.be.undefined;
            (0, chai_1.expect)(task.id).to.equal(taskId);
            (0, chai_1.expect)(task.type).to.equal('test');
            (0, chai_1.expect)(task.description).to.equal('Test task');
            (0, chai_1.expect)(task.priority).to.equal('high');
            (0, chai_1.expect)(task.status).to.equal('pending');
            (0, chai_1.expect)(task.metadata).to.deep.equal({ testKey: 'testValue' });
        });
        (0, mocha_1.it)('should create a task with default values when not provided', async () => {
            const taskId = await taskManager.createTask({
                description: 'Minimal task'
            });
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.type).to.equal('default');
            (0, chai_1.expect)(task.priority).to.equal('normal');
            (0, chai_1.expect)(task.status).to.equal('pending');
            (0, chai_1.expect)(task.metadata).to.deep.equal({});
        });
        (0, mocha_1.it)('should generate a unique ID if not provided', async () => {
            const taskId1 = await taskManager.createTask({ description: 'Task 1' });
            const taskId2 = await taskManager.createTask({ description: 'Task 2' });
            (0, chai_1.expect)(taskId1).to.not.equal(taskId2);
        });
        (0, mocha_1.it)('should use a provided ID', async () => {
            const customId = 'custom-task-id';
            const taskId = await taskManager.createTask({
                id: customId,
                description: 'Task with custom ID'
            });
            (0, chai_1.expect)(taskId).to.equal(customId);
            const task = await taskManager.getTask(customId);
            (0, chai_1.expect)(task).to.not.be.undefined;
        });
    });
    (0, mocha_1.describe)('updateTask', () => {
        (0, mocha_1.it)('should update task properties', async () => {
            // Create a task
            const taskId = await taskManager.createTask({
                type: 'initial',
                description: 'Initial description',
                priority: 'low'
            });
            // Update task
            await taskManager.updateTask(taskId, {
                type: 'updated',
                description: 'Updated description',
                priority: 'high',
                metadata: { updated: true }
            });
            // Get updated task
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.type).to.equal('updated');
            (0, chai_1.expect)(task.description).to.equal('Updated description');
            (0, chai_1.expect)(task.priority).to.equal('high');
            (0, chai_1.expect)(task.metadata).to.deep.equal({ updated: true });
            (0, chai_1.expect)(task.status).to.equal('pending'); // Status shouldn't change with updateTask
        });
        (0, mocha_1.it)('should only update provided properties', async () => {
            // Create a task
            const taskId = await taskManager.createTask({
                type: 'partial',
                description: 'Will be partially updated',
                priority: 'normal',
                metadata: { original: true }
            });
            // Partially update task
            await taskManager.updateTask(taskId, {
                description: 'Only description updated'
            });
            // Get updated task
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.type).to.equal('partial'); // Unchanged
            (0, chai_1.expect)(task.description).to.equal('Only description updated'); // Updated
            (0, chai_1.expect)(task.priority).to.equal('normal'); // Unchanged
            (0, chai_1.expect)(task.metadata).to.deep.equal({ original: true }); // Unchanged
        });
        (0, mocha_1.it)('should throw an error when updating non-existent task', async () => {
            try {
                await taskManager.updateTask('non-existent-id', { description: 'Should fail' });
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('not found');
            }
        });
        (0, mocha_1.it)('should merge metadata when updating', async () => {
            // Create a task with initial metadata
            const taskId = await taskManager.createTask({
                description: 'Task with metadata',
                metadata: {
                    key1: 'value1',
                    key2: 'value2'
                }
            });
            // Update with new metadata
            await taskManager.updateTask(taskId, {
                metadata: {
                    key2: 'updated',
                    key3: 'value3'
                }
            });
            // Get updated task
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.metadata).to.deep.equal({
                key1: 'value1', // Original value preserved
                key2: 'updated', // Value updated
                key3: 'value3' // New key added
            });
        });
    });
    (0, mocha_1.describe)('getTask', () => {
        (0, mocha_1.it)('should return undefined for non-existent task', async () => {
            const task = await taskManager.getTask('non-existent-id');
            (0, chai_1.expect)(task).to.be.undefined;
        });
    });
    (0, mocha_1.describe)('listTasks', () => {
        (0, mocha_1.beforeEach)(async () => {
            // Create a set of test tasks
            await taskManager.createTask({
                type: 'type1',
                description: 'Task 1',
                priority: 'high',
                status: 'pending'
            });
            await taskManager.createTask({
                type: 'type1',
                description: 'Task 2',
                priority: 'normal',
                status: 'assigned',
                assignedTo: 'agent1'
            });
            await taskManager.createTask({
                type: 'type2',
                description: 'Task 3',
                priority: 'low',
                status: 'completed'
            });
        });
        (0, mocha_1.it)('should list all tasks when no filter is provided', async () => {
            const tasks = await taskManager.listTasks();
            (0, chai_1.expect)(tasks.length).to.equal(3);
        });
        (0, mocha_1.it)('should filter tasks by type', async () => {
            const tasks = await taskManager.listTasks({ type: 'type1' });
            (0, chai_1.expect)(tasks.length).to.equal(2);
            tasks.forEach(task => {
                (0, chai_1.expect)(task.type).to.equal('type1');
            });
        });
        (0, mocha_1.it)('should filter tasks by status', async () => {
            const tasks = await taskManager.listTasks({ status: 'pending' });
            (0, chai_1.expect)(tasks.length).to.equal(1);
            (0, chai_1.expect)(tasks[0].status).to.equal('pending');
        });
        (0, mocha_1.it)('should filter tasks by priority', async () => {
            const tasks = await taskManager.listTasks({ priority: 'high' });
            (0, chai_1.expect)(tasks.length).to.equal(1);
            (0, chai_1.expect)(tasks[0].priority).to.equal('high');
        });
        (0, mocha_1.it)('should filter tasks by assigned agent', async () => {
            const tasks = await taskManager.listTasks({ assignedTo: 'agent1' });
            (0, chai_1.expect)(tasks.length).to.equal(1);
            (0, chai_1.expect)(tasks[0].assignedTo).to.equal('agent1');
        });
        (0, mocha_1.it)('should combine multiple filter criteria with AND logic', async () => {
            const tasks = await taskManager.listTasks({
                type: 'type1',
                status: 'assigned'
            });
            (0, chai_1.expect)(tasks.length).to.equal(1);
            (0, chai_1.expect)(tasks[0].type).to.equal('type1');
            (0, chai_1.expect)(tasks[0].status).to.equal('assigned');
        });
    });
    (0, mocha_1.describe)('assignTask and unassignTask', () => {
        let taskId;
        (0, mocha_1.beforeEach)(async () => {
            // Create a test task
            taskId = await taskManager.createTask({
                description: 'Task to assign'
            });
        });
        (0, mocha_1.it)('should assign a task to an agent', async () => {
            const agentId = 'test-agent-id';
            await taskManager.assignTask(taskId, agentId);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.assignedTo).to.equal(agentId);
            (0, chai_1.expect)(task.status).to.equal('assigned');
            (0, chai_1.expect)(task.assignedAt).to.be.a('number');
        });
        (0, mocha_1.it)('should unassign a task', async () => {
            // First assign
            await taskManager.assignTask(taskId, 'test-agent-id');
            // Then unassign
            await taskManager.unassignTask(taskId);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.assignedTo).to.be.undefined;
            (0, chai_1.expect)(task.status).to.equal('pending');
            (0, chai_1.expect)(task.assignedAt).to.be.undefined;
        });
        (0, mocha_1.it)('should throw error when assigning non-existent task', async () => {
            try {
                await taskManager.assignTask('non-existent-id', 'agent-id');
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('not found');
            }
        });
        (0, mocha_1.it)('should throw error when assigning already completed task', async () => {
            // Complete the task
            await taskManager.startTask(taskId);
            await taskManager.completeTask(taskId, { outcome: 'Completed for test' });
            try {
                await taskManager.assignTask(taskId, 'agent-id');
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('cannot be assigned');
            }
        });
    });
    (0, mocha_1.describe)('Task lifecycle: startTask, completeTask, failTask, cancelTask', () => {
        let taskId;
        (0, mocha_1.beforeEach)(async () => {
            // Create and assign a test task
            taskId = await taskManager.createTask({
                description: 'Lifecycle task'
            });
            await taskManager.assignTask(taskId, 'lifecycle-agent');
        });
        (0, mocha_1.it)('should start an assigned task', async () => {
            await taskManager.startTask(taskId);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.status).to.equal('in-progress');
            (0, chai_1.expect)(task.startedAt).to.be.a('number');
        });
        (0, mocha_1.it)('should complete a task with results', async () => {
            await taskManager.startTask(taskId);
            const result = {
                outcome: 'Task completed successfully',
                data: {
                    key: 'value'
                }
            };
            await taskManager.completeTask(taskId, result);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.status).to.equal('completed');
            (0, chai_1.expect)(task.completedAt).to.be.a('number');
            (0, chai_1.expect)(task.result).to.deep.equal(result);
        });
        (0, mocha_1.it)('should fail a task with error details', async () => {
            await taskManager.startTask(taskId);
            const error = {
                message: 'Task failed',
                details: {
                    reason: 'Test error'
                }
            };
            await taskManager.failTask(taskId, error);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.status).to.equal('failed');
            (0, chai_1.expect)(task.completedAt).to.be.a('number');
            (0, chai_1.expect)(task.error).to.deep.equal(error);
        });
        (0, mocha_1.it)('should cancel a task', async () => {
            const reason = 'No longer needed';
            await taskManager.cancelTask(taskId, reason);
            const task = await taskManager.getTask(taskId);
            (0, chai_1.expect)(task.status).to.equal('cancelled');
            (0, chai_1.expect)(task.cancelledAt).to.be.a('number');
            (0, chai_1.expect)(task.cancelReason).to.equal(reason);
        });
        (0, mocha_1.it)('should not allow completing a cancelled task', async () => {
            await taskManager.cancelTask(taskId, 'Cancelled for test');
            try {
                await taskManager.completeTask(taskId, { outcome: 'Should fail' });
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('cannot be completed');
            }
        });
    });
    (0, mocha_1.describe)('Task dependencies', () => {
        let parentTaskId;
        let childTaskId;
        (0, mocha_1.beforeEach)(async () => {
            // Create parent task
            parentTaskId = await taskManager.createTask({
                description: 'Parent task'
            });
            // Create child task with dependency
            childTaskId = await taskManager.createTask({
                description: 'Child task',
                dependencies: [parentTaskId]
            });
        });
        (0, mocha_1.it)('should check if dependencies are satisfied', async () => {
            // Initially, parent is not completed, so dependencies not satisfied
            let satisfied = await taskManager.areDependenciesSatisfied(childTaskId);
            (0, chai_1.expect)(satisfied).to.be.false;
            // Complete parent task
            await taskManager.assignTask(parentTaskId, 'agent');
            await taskManager.startTask(parentTaskId);
            await taskManager.completeTask(parentTaskId, { outcome: 'Completed' });
            // Now dependencies should be satisfied
            satisfied = await taskManager.areDependenciesSatisfied(childTaskId);
            (0, chai_1.expect)(satisfied).to.be.true;
        });
        (0, mocha_1.it)('should get ready tasks', async () => {
            // Initially, parent is not completed, so child is not ready
            let readyTasks = await taskManager.getReadyTasks();
            const childTaskIncluded = readyTasks.some(task => task.id === childTaskId);
            (0, chai_1.expect)(childTaskIncluded).to.be.false;
            // Complete parent task
            await taskManager.assignTask(parentTaskId, 'agent');
            await taskManager.startTask(parentTaskId);
            await taskManager.completeTask(parentTaskId, { outcome: 'Completed' });
            // Now child task should be ready
            readyTasks = await taskManager.getReadyTasks();
            const childReady = readyTasks.some(task => task.id === childTaskId);
            (0, chai_1.expect)(childReady).to.be.true;
        });
        (0, mocha_1.it)('should handle circular dependencies gracefully', async () => {
            // Create a circular dependency (A -> B -> A)
            const taskA = await taskManager.createTask({
                description: 'Task A'
            });
            const taskB = await taskManager.createTask({
                description: 'Task B',
                dependencies: [taskA]
            });
            // Update taskA to depend on taskB, creating a circular dependency
            await taskManager.updateTask(taskA, {
                dependencies: [taskB]
            });
            // Checking if dependencies are satisfied should detect the cycle and return false
            const satisfiedA = await taskManager.areDependenciesSatisfied(taskA);
            const satisfiedB = await taskManager.areDependenciesSatisfied(taskB);
            (0, chai_1.expect)(satisfiedA).to.be.false;
            (0, chai_1.expect)(satisfiedB).to.be.false;
        });
    });
    (0, mocha_1.describe)('countTasksByStatus', () => {
        (0, mocha_1.beforeEach)(async () => {
            // Create tasks with different statuses
            await taskManager.createTask({
                description: 'Pending task 1',
                status: 'pending'
            });
            await taskManager.createTask({
                description: 'Pending task 2',
                status: 'pending'
            });
            const assignedId = await taskManager.createTask({
                description: 'Assigned task',
                status: 'pending'
            });
            await taskManager.assignTask(assignedId, 'agent');
            const progressId = await taskManager.createTask({
                description: 'In-progress task',
                status: 'pending'
            });
            await taskManager.assignTask(progressId, 'agent');
            await taskManager.startTask(progressId);
            const completedId = await taskManager.createTask({
                description: 'Completed task',
                status: 'pending'
            });
            await taskManager.assignTask(completedId, 'agent');
            await taskManager.startTask(completedId);
            await taskManager.completeTask(completedId, { outcome: 'Completed' });
            const failedId = await taskManager.createTask({
                description: 'Failed task',
                status: 'pending'
            });
            await taskManager.assignTask(failedId, 'agent');
            await taskManager.startTask(failedId);
            await taskManager.failTask(failedId, { message: 'Failed' });
            const cancelledId = await taskManager.createTask({
                description: 'Cancelled task',
                status: 'pending'
            });
            await taskManager.cancelTask(cancelledId, 'Cancelled');
        });
        (0, mocha_1.it)('should correctly count tasks by status', async () => {
            const counts = await taskManager.countTasksByStatus();
            (0, chai_1.expect)(counts.pending).to.equal(2);
            (0, chai_1.expect)(counts.assigned).to.equal(1);
            (0, chai_1.expect)(counts['in-progress']).to.equal(1);
            (0, chai_1.expect)(counts.completed).to.equal(1);
            (0, chai_1.expect)(counts.failed).to.equal(1);
            (0, chai_1.expect)(counts.cancelled).to.equal(1);
        });
    });
});
//# sourceMappingURL=test_task_manager.js.map