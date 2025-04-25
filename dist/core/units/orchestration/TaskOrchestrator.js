"use strict";
/**
 * TaskOrchestrator module
 *
 * Orchestrates tasks between organizational units based on workflows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOrchestrator = void 0;
const uuid_1 = require("uuid");
const OpenAIClient_1 = require("../../multiagent/OpenAIClient");
const UnitAgentFactory_1 = require("../agents/UnitAgentFactory");
/**
 * TaskOrchestrator class
 * Orchestrates tasks between organizational units
 */
class TaskOrchestrator {
    /**
     * Create a new TaskOrchestrator
     * @param units - Array of organizational units
     * @param agents - Array of agents
     * @param workflow - Optional workflow to follow
     * @param stateManager - State manager for shared state
     * @param config - Orchestrator configuration
     * @param logger - Logger instance
     */
    constructor(units, agents, workflow, stateManager, config = {}, logger = console) {
        this.units = new Map(units.map(unit => [unit.id, unit]));
        this.agents = new Map(agents.map(agent => [agent.id, agent]));
        this.workflow = workflow;
        this.tasks = new Map();
        this.stateManager = stateManager;
        this.unitAgentMap = new Map();
        this.logger = logger;
        // Default configuration
        this.config = {
            openaiApiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-4o-mini',
            taskTimeoutMs: 60000, // 1 minute
            maxRetries: 2,
            taskBatchSize: 5,
            ...config
        };
        // Initialize OpenAI client if API key is available
        if (this.config.openaiApiKey) {
            this.openaiClient = new OpenAIClient_1.OpenAIClient(this.config.openaiApiKey);
        }
        else {
            this.logger.warn('No OpenAI API key provided. LLM-based execution will be unavailable.');
        }
        // Initialize agent factory
        this.agentFactory = new UnitAgentFactory_1.UnitAgentFactory();
        // Build unit-agent map (for lookup optimization)
        this.buildUnitAgentMap(agents);
    }
    /**
     * Execute the workflow
     * @param options - Execution options
     * @returns Execution results
     */
    async execute(options) {
        const { topic, initialTask } = options;
        this.logger.log(`Starting execution for topic: ${topic}`);
        // Initialize state
        this.stateManager.setState('workflow.topic', topic);
        this.stateManager.setState('workflow.startTime', Date.now());
        this.stateManager.setState('workflow.status', 'in_progress');
        try {
            // Execute workflow if available, or simple execution if not
            if (this.workflow) {
                await this.executeWorkflow(topic, initialTask);
            }
            else {
                await this.executeSimple(topic, initialTask);
            }
            // Set workflow to completed
            this.stateManager.setState('workflow.status', 'completed');
            this.stateManager.setState('workflow.endTime', Date.now());
            // Gather results
            const errors = Array.from(this.tasks.values())
                .filter(task => task.status === 'failed')
                .map(task => task.error || 'Unknown error');
            return {
                success: errors.length === 0,
                tasks: Array.from(this.tasks.values()),
                results: this.stateManager.getState('workflow.results', {}),
                state: this.stateManager.getFullState(),
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            // Handle unexpected errors
            const errorMessage = error.message;
            this.logger.error(`Execution failed: ${errorMessage}`);
            this.stateManager.setState('workflow.status', 'failed');
            this.stateManager.setState('workflow.endTime', Date.now());
            this.stateManager.setState('workflow.error', errorMessage);
            return {
                success: false,
                tasks: Array.from(this.tasks.values()),
                results: this.stateManager.getState('workflow.results', {}),
                state: this.stateManager.getFullState(),
                errors: [errorMessage]
            };
        }
    }
    /**
     * Create a task
     * @param taskData - Partial task data
     * @returns Created task
     */
    createTask(taskData) {
        // Generate ID if not provided
        const id = taskData.id || (0, uuid_1.v4)();
        // Create task
        const task = {
            id,
            name: taskData.name || 'Unit Task',
            description: taskData.description || '',
            unitId: taskData.unitId || '',
            agentId: taskData.agentId,
            status: taskData.status || 'pending',
            priority: taskData.priority || 'medium',
            dependencies: taskData.dependencies || [],
            metadata: taskData.metadata || {},
            input: taskData.input,
            context: taskData.context,
            result: taskData.result,
            error: taskData.error,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            startedAt: taskData.startedAt,
            completedAt: taskData.completedAt
        };
        this.tasks.set(id, task);
        this.logger.log(`Created task: ${task.name} (ID: ${task.id})`);
        return task;
    }
    /**
     * Assign a task to a unit
     * @param taskId - Task ID
     * @param unitId - Unit ID
     * @returns Updated task
     */
    assignTask(taskId, unitId) {
        const task = this.getTask(taskId);
        const unit = this.units.get(unitId);
        if (!unit) {
            throw new Error(`Unit ${unitId} not found`);
        }
        // Find agent for unit
        const agentId = this.unitAgentMap.get(unitId);
        if (!agentId) {
            throw new Error(`No agent found for unit ${unitId}`);
        }
        // Update task
        task.unitId = unitId;
        task.agentId = agentId;
        task.status = 'assigned';
        task.updatedAt = Date.now();
        this.tasks.set(taskId, task);
        this.logger.log(`Assigned task ${taskId} to unit ${unit.name} (agent ID: ${agentId})`);
        return task;
    }
    /**
     * Update a task
     * @param taskId - Task ID
     * @param updates - Task updates
     * @returns Updated task
     */
    updateTask(taskId, updates) {
        const task = this.getTask(taskId);
        // Update task fields
        Object.assign(task, {
            ...updates,
            updatedAt: Date.now()
        });
        // Set special timestamps based on status changes
        if (updates.status === 'in_progress' && !task.startedAt) {
            task.startedAt = Date.now();
        }
        if ((updates.status === 'completed' || updates.status === 'failed') && !task.completedAt) {
            task.completedAt = Date.now();
        }
        this.tasks.set(taskId, task);
        this.logger.log(`Updated task ${taskId}: ${task.name} (status: ${task.status})`);
        return task;
    }
    /**
     * Get a task by ID
     * @param taskId - Task ID
     * @returns The task
     */
    getTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        return task;
    }
    /**
     * Get all tasks
     * @returns Array of all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * Check if all dependencies for a task are met
     * @param taskId - Task ID
     * @returns True if dependencies are met
     */
    areDependenciesMet(taskId) {
        const task = this.getTask(taskId);
        if (task.dependencies.length === 0) {
            return true;
        }
        return task.dependencies.every(depId => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status === 'completed';
        });
    }
    /**
     * Execute an individual task
     * @param taskId - Task ID
     * @returns Task execution result
     */
    async executeTask(taskId) {
        const task = this.getTask(taskId);
        // Check dependencies
        if (!this.areDependenciesMet(taskId)) {
            throw new Error(`Dependencies not met for task ${taskId}`);
        }
        // Check if we have OpenAI client
        if (!this.openaiClient) {
            throw new Error('OpenAI client not available');
        }
        // Ensure task is assigned
        if (!task.agentId || !task.unitId) {
            throw new Error(`Task ${taskId} is not properly assigned`);
        }
        // Get agent and unit info
        const agent = this.agents.get(task.agentId);
        const unit = this.units.get(task.unitId);
        if (!agent || !unit) {
            throw new Error(`Agent or unit not found for task ${taskId}`);
        }
        // Update task status
        this.updateTask(taskId, { status: 'in_progress' });
        try {
            // Prepare system prompt based on unit
            const systemPrompt = this.agentFactory.generateUnitAgentSystemPrompt(unit);
            // Prepare user prompt with task details
            const userPrompt = this.generateTaskPrompt(task, unit);
            // Call OpenAI
            const response = await this.openaiClient.sendPrompt(userPrompt, {
                systemPrompt,
                model: this.config.modelName,
                temperature: 0.5,
                maxTokens: 2000
            });
            // Process response
            const result = {
                success: true,
                content: response.content,
                usage: response.usage
            };
            // Update task with result
            this.updateTask(taskId, {
                status: 'completed',
                result: {
                    content: response.content,
                    usage: response.usage
                }
            });
            // Store result in state
            this.stateManager.setState(`workflow.results.${taskId}`, {
                unitName: unit.name,
                taskName: task.name,
                content: response.content,
                usage: response.usage
            });
            return result;
        }
        catch (error) {
            const errorMessage = error.message;
            // Update task with error
            this.updateTask(taskId, {
                status: 'failed',
                error: errorMessage
            });
            return {
                success: false,
                content: '',
                error: errorMessage
            };
        }
    }
    /**
     * Execute a workflow
     * @param topic - Topic for the workflow
     * @param initialTask - Initial task info
     */
    async executeWorkflow(topic, initialTask) {
        if (!this.workflow) {
            throw new Error('No workflow defined');
        }
        this.logger.log(`Executing workflow: ${this.workflow.name}`);
        this.stateManager.setState('workflow.name', this.workflow.name);
        // Execute planning phase if defined
        if (this.workflow.planningPhase) {
            await this.executePlanningPhase(topic, initialTask);
        }
        // Execute execution phase if defined
        if (this.workflow.executionPhase) {
            await this.executeExecutionPhase(topic);
        }
    }
    /**
     * Execute planning phase
     * @param topic - Topic for planning
     * @param initialTask - Initial task info
     */
    async executePlanningPhase(topic, initialTask) {
        if (!this.workflow?.planningPhase)
            return;
        const phase = this.workflow.planningPhase;
        this.logger.log(`Executing planning phase: ${phase.name}`);
        // Update phase status
        this.workflow.planningPhase.status = 'in_progress';
        this.stateManager.setState('workflow.planningPhase.status', 'in_progress');
        // Find lead unit and collaborator units
        const leadUnit = this.units.get(phase.leadUnitId);
        if (!leadUnit) {
            throw new Error(`Lead unit ${phase.leadUnitId} not found`);
        }
        // Create planning task for lead unit
        const planningTask = this.createTask({
            name: `Planning for ${topic}`,
            description: initialTask.description,
            unitId: leadUnit.id,
            priority: 'high',
            metadata: {
                phase: 'planning',
                role: 'leader',
                topic
            }
        });
        // Assign task to lead unit's agent
        this.assignTask(planningTask.id, leadUnit.id);
        // Execute planning task
        const planResult = await this.executeTask(planningTask.id);
        if (!planResult.success) {
            throw new Error(`Planning task failed: ${planResult.error}`);
        }
        // Create collaboration tasks for participating units
        const collaborationTasks = [];
        for (const unitId of phase.participatingUnitIds) {
            // Skip the lead unit
            if (unitId === phase.leadUnitId)
                continue;
            const unit = this.units.get(unitId);
            if (!unit) {
                this.logger.warn(`Participating unit ${unitId} not found, skipping`);
                continue;
            }
            // Create collaboration task
            const collabTask = this.createTask({
                name: `Collaboration on planning for ${topic}`,
                description: `Review and enhance the planning for "${topic}" created by ${leadUnit.name}`,
                unitId: unit.id,
                priority: 'high',
                dependencies: [planningTask.id],
                metadata: {
                    phase: 'planning',
                    role: 'collaborator',
                    topic
                },
                context: planResult.content
            });
            // Assign task to collaborator unit's agent
            this.assignTask(collabTask.id, unit.id);
            collaborationTasks.push(collabTask);
        }
        // Execute all collaboration tasks
        const collabResults = await Promise.all(collaborationTasks.map(task => this.executeTask(task.id)));
        // Check for failures
        const failures = collabResults.filter(result => !result.success);
        if (failures.length > 0) {
            this.logger.warn(`${failures.length} collaboration tasks failed`);
        }
        // Final consolidated output
        const planningOutput = {
            lead: {
                unit: leadUnit.name,
                content: planResult.content
            },
            collaborations: collaborationTasks.map((task, i) => ({
                unit: this.units.get(task.unitId)?.name || 'Unknown',
                content: collabResults[i].content,
                success: collabResults[i].success
            }))
        };
        // Store consolidated output
        this.stateManager.setState(`workflow.results.planning`, planningOutput);
        // Update phase status
        this.workflow.planningPhase.status = 'completed';
        this.stateManager.setState('workflow.planningPhase.status', 'completed');
        this.logger.log('Planning phase completed');
    }
    /**
     * Execute execution phase
     * @param topic - Topic for execution
     */
    async executeExecutionPhase(topic) {
        if (!this.workflow?.executionPhase)
            return;
        const phase = this.workflow.executionPhase;
        this.logger.log(`Executing execution phase: ${phase.name}`);
        // Update phase status
        this.workflow.executionPhase.status = 'in_progress';
        this.stateManager.setState('workflow.executionPhase.status', 'in_progress');
        // Get the planning results if available
        const planningResults = this.stateManager.getState('workflow.results.planning');
        // Find coordinator unit
        const coordinatorUnitId = phase.leadUnitId;
        const coordinatorUnit = this.units.get(coordinatorUnitId);
        if (!coordinatorUnit) {
            throw new Error(`Coordinator unit ${coordinatorUnitId} not found`);
        }
        // Create execution tasks for each participating unit
        const executionTasks = [];
        for (const unitId of phase.participatingUnitIds) {
            // Skip the coordinator unit for now, it will consolidate results at the end
            if (unitId === coordinatorUnitId)
                continue;
            const unit = this.units.get(unitId);
            if (!unit) {
                this.logger.warn(`Participating unit ${unitId} not found, skipping`);
                continue;
            }
            // Create execution task
            const executionTask = this.createTask({
                name: `Execution for ${topic} - ${unit.name}`,
                description: `Execute your part of the implementation for "${topic}" based on the planning.`,
                unitId: unit.id,
                priority: 'high',
                metadata: {
                    phase: 'execution',
                    role: 'executor',
                    topic
                },
                context: planningResults ? JSON.stringify(planningResults) : undefined
            });
            // Assign task to executor unit's agent
            this.assignTask(executionTask.id, unit.id);
            executionTasks.push(executionTask);
        }
        // Execute all executor tasks in parallel
        const executionResults = await Promise.all(executionTasks.map(task => this.executeTask(task.id)));
        // Create final consolidation task for coordinator
        const consolidationTask = this.createTask({
            name: `Consolidate results for ${topic}`,
            description: `Review and consolidate all execution results for "${topic}" into a final report.`,
            unitId: coordinatorUnitId,
            priority: 'high',
            dependencies: executionTasks.map(task => task.id),
            metadata: {
                phase: 'execution',
                role: 'coordinator',
                topic
            },
            context: JSON.stringify({
                planningResults,
                executionResults: executionTasks.map((task, i) => ({
                    unit: this.units.get(task.unitId)?.name || 'Unknown',
                    content: executionResults[i].content,
                    success: executionResults[i].success
                }))
            })
        });
        // Assign consolidation task to coordinator
        this.assignTask(consolidationTask.id, coordinatorUnitId);
        // Execute consolidation task
        const consolidationResult = await this.executeTask(consolidationTask.id);
        // Final consolidated output
        const executionOutput = {
            coordinator: {
                unit: coordinatorUnit.name,
                content: consolidationResult.content
            },
            executions: executionTasks.map((task, i) => ({
                unit: this.units.get(task.unitId)?.name || 'Unknown',
                content: executionResults[i].content,
                success: executionResults[i].success
            }))
        };
        // Store consolidated output
        this.stateManager.setState(`workflow.results.execution`, executionOutput);
        // Store final result for easy access
        this.stateManager.setState('workflow.results.final', consolidationResult.content);
        // Update phase status
        this.workflow.executionPhase.status = 'completed';
        this.stateManager.setState('workflow.executionPhase.status', 'completed');
        this.logger.log('Execution phase completed');
    }
    /**
     * Execute without a workflow structure (simple execution)
     * @param topic - Topic for execution
     * @param initialTask - Initial task info
     */
    async executeSimple(topic, initialTask) {
        this.logger.log(`Executing simple mode for topic: ${topic}`);
        // Get all units
        const allUnits = Array.from(this.units.values());
        // Sort units to prioritize high-level units (with no parentId) first
        allUnits.sort((a, b) => {
            if (!a.parentId && b.parentId)
                return -1;
            if (a.parentId && !b.parentId)
                return 1;
            return 0;
        });
        // Take the first unit as the starting point
        const startUnit = allUnits[0];
        if (!startUnit) {
            throw new Error('No units available for execution');
        }
        // Create initial task
        const task = this.createTask({
            name: initialTask.title,
            description: initialTask.description,
            unitId: startUnit.id,
            priority: 'high',
            metadata: { topic }
        });
        // Assign to the start unit
        this.assignTask(task.id, startUnit.id);
        // Execute the task
        const result = await this.executeTask(task.id);
        // Store the result
        this.stateManager.setState('workflow.results.final', result.content);
        this.logger.log('Simple execution completed');
    }
    /**
     * Generate a prompt for a task
     * @param task - The task
     * @param unit - The unit handling the task
     * @returns Generated prompt
     */
    generateTaskPrompt(task, unit) {
        // Get dependency context if available
        let previousContext = '';
        if (task.dependencies.length > 0) {
            previousContext = task.dependencies
                .map(depId => {
                const depTask = this.tasks.get(depId);
                if (depTask && depTask.status === 'completed' && depTask.result) {
                    const depUnit = this.units.get(depTask.unitId);
                    return `--- From ${depUnit?.name || 'Unknown Unit'} (${depTask.name}) ---\n${typeof depTask.result === 'object' && depTask.result.content
                        ? depTask.result.content
                        : JSON.stringify(depTask.result)}\n`;
                }
                return '';
            })
                .join('\n');
        }
        // Build prompt using unit info
        return `[TASK CONTEXT]
Unit: ${unit.name}
Task ID: ${task.id}
Task Name: ${task.name}
Task Description: ${task.description}

[UNIT CAPABILITIES]
${unit.capabilities.map(cap => `- ${cap.replace(/_/g, ' ')}`).join('\n')}

[PREVIOUS CONTEXT]
${task.context || previousContext || 'No previous context available.'}

[TASK INPUT]
${task.input || 'No specific input provided for this task.'}

Please respond to this task from the perspective of the ${unit.name} unit, using your specific expertise and capabilities.
`;
    }
    /**
     * Build map from unit IDs to agent IDs
     * @param agents - Array of agents
     */
    buildUnitAgentMap(agents) {
        agents.forEach(agent => {
            if (agent.metadata?.unitId) {
                this.unitAgentMap.set(agent.metadata.unitId, agent.id);
            }
        });
    }
}
exports.TaskOrchestrator = TaskOrchestrator;
//# sourceMappingURL=TaskOrchestrator.js.map