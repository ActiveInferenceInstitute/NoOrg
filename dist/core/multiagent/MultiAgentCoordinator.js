"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAgentCoordinator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const SharedStateManager_1 = require("./SharedStateManager");
const winston = __importStar(require("winston"));
const Logger_1 = require("./Logger");
// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'logs/coordinator.log' }),
        new winston.transports.Console()
    ]
});
/**
 * Convert string capabilities to Capability objects
 */
function convertCapabilities(capabilities) {
    return capabilities.map(cap => ({
        name: cap,
        description: `Capability: ${cap}`,
        parameters: {}
    }));
}
/**
 * Convert Capability objects to string capabilities
 */
function convertCapabilitiesToString(capabilities) {
    return capabilities.map(cap => cap.name);
}
/**
 * Convert string status to AgentStatus
 */
function convertStatusToAgentStatus(status) {
    const now = Date.now();
    return {
        id: 'temp-id', // Will be replaced
        name: 'temp-name', // Will be replaced
        type: 'temp-type', // Will be replaced
        status: status === 'initializing' ? 'available' : status,
        lastActive: now,
        capabilities: [],
        metadata: {},
        state: status === 'initializing' ? 'available' : status,
        lastUpdated: now,
        healthStatus: {
            isHealthy: status !== 'error',
            errors: status === 'error' ? ['Status error'] : [],
            lastHeartbeat: now
        },
        metrics: {}
    };
}
/**
 * Convert AgentStatus to string status
 */
function convertStatusToString(status) {
    const validStatuses = ['available', 'busy', 'offline', 'error', 'initializing'];
    return validStatuses.includes(status.state)
        ? status.state
        : 'offline';
}
/**
 * Convert AgentType to Agent
 */
function convertAgentTypeToAgent(agentType) {
    const now = Date.now();
    const agentStatus = convertStatusToAgentStatus(agentType.status);
    // Update status with agent-specific values
    agentStatus.id = agentType.id;
    agentStatus.name = agentType.name;
    agentStatus.type = agentType.type;
    const capabilities = Array.isArray(agentType.capabilities)
        ? agentType.capabilities.map(cap => ({
            name: cap,
            description: `Capability: ${cap}`,
            parameters: {}
        }))
        : [];
    const agent = {
        id: agentType.id,
        name: agentType.name,
        type: agentType.type,
        description: agentType.description || '',
        capabilities,
        status: agentStatus,
        metadata: {
            ...(agentType.metadata || {}),
            preferredModel: agentType.preferredModel,
            description: agentType.description,
            lastActive: agentType.lastActive,
            createdAt: agentType.createdAt
        },
        preferredModel: agentType.preferredModel || '',
        createdAt: agentType.createdAt || now,
        lastActive: agentType.lastActive || now
    };
    return agent;
}
/**
 * Convert Agent to AgentType
 */
function convertAgentToAgentType(agent) {
    const metadata = agent.metadata || {};
    const capabilities = convertCapabilitiesToString(agent.capabilities);
    const status = convertStatusToString(agent.status);
    const agentType = {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        capabilities,
        status,
        metadata: metadata || {},
        description: metadata.description || '',
        preferredModel: metadata.preferredModel || '',
        lastActive: metadata.lastActive || Date.now(),
        createdAt: metadata.createdAt || Date.now()
    };
    return agentType;
}
/**
 * Convert task status to agent status
 */
function convertTaskStatusToAgentStatus(status) {
    switch (status) {
        case 'in-progress':
            return 'busy';
        case 'completed':
        case 'failed':
            return 'offline';
        default:
            return 'available';
    }
}
/**
 * Convert agent status to task status
 */
function convertAgentStatusToTaskStatus(status) {
    switch (status) {
        case 'busy':
            return 'in-progress';
        case 'offline':
        case 'error':
            return 'failed';
        default:
            return 'pending';
    }
}
/**
 * The MultiAgentCoordinator orchestrates interactions between multiple agents
 * through shared state management, task allocation, and communication.
 */
class MultiAgentCoordinator {
    constructor(name = 'Default Coordinator', options) {
        this.initialized = false;
        this.isRunning = false;
        this.stateFilePath = null; // Path to save/load state
        this.coordinationStrategy = 'centralized';
        this.agents = new Map();
        this.tasks = new Map();
        this.stateManager = SharedStateManager_1.SharedStateManager.getInstance();
        this.logger = new Logger_1.Logger('MultiAgentCoordinator');
        this.id = (0, uuid_1.v4)();
        this.name = name;
        // Initialize required components using provided options or full fallbacks matching interfaces
        this.sharedStateManager = options?.sharedStateManager || this.stateManager;
        // TaskManager Fallback (Aligned with interface)
        this.taskManager = options?.taskManager || {
            assignTask: async (taskId, agentId) => { this.logger.warn('Using fallback TaskManager.assignTask'); },
            completeTask: async (taskId, result) => { this.logger.warn('Using fallback TaskManager.completeTask'); },
            failTask: async (taskId, error) => { this.logger.warn('Using fallback TaskManager.failTask'); },
            createTask: async (taskData) => { this.logger.warn('Using fallback TaskManager.createTask'); return (0, uuid_1.v4)(); },
            startTask: async (taskId) => { this.logger.warn('Using fallback TaskManager.startTask'); },
            cancelTask: async (taskId) => { this.logger.warn('Using fallback TaskManager.cancelTask'); },
            getTask: async (taskId) => { this.logger.warn('Using fallback TaskManager.getTask'); throw new Error('Fallback getTask not implemented'); },
            listTasks: async (filter) => { this.logger.warn('Using fallback TaskManager.listTasks'); return []; },
            areDependenciesSatisfied: async (taskId) => { this.logger.warn('Using fallback TaskManager.areDependenciesSatisfied'); return true; } // Added from interface
        };
        // OpenAIClient Fallback (Aligned with OpenAIClient interface)
        this.openAIClient = options?.openAIClient || {
            // Match methods from interfaces/OpenAIClient.ts
            createCompletion: async (prompt, options) => { this.logger.warn('Using fallback OpenAIClient.createCompletion'); return "Fallback response"; },
        };
        // PromptManager Fallback (Aligned with interface)
        this.promptManager = options?.promptManager || {
            getPrompt: async (name, variables) => `Fallback prompt: ${name}`,
            addPrompt: async (name, template) => { },
            updatePrompt: async (name, template) => { },
            deletePrompt: async (name) => { },
            createDefaultTemplates: async () => { } // Added missing method
        };
        // AgentRegistry Fallback (Aligned with AgentRegistry interface)
        this.agentRegistry = options?.agentRegistry || {
            // Match methods from interfaces/AgentRegistry.ts
            registerAgent: async (agent) => { this.logger.warn('Using fallback AgentRegistry.registerAgent'); return true; },
            unregisterAgent: async (agentId) => { this.logger.warn('Using fallback AgentRegistry.unregisterAgent'); return true; },
            updateAgent: async (agentId, updates) => { this.logger.warn('Using fallback AgentRegistry.updateAgent'); return true; },
            getAgent: async (agentId) => { this.logger.warn('Using fallback AgentRegistry.getAgent'); return null; },
            listAgents: async (filter) => { this.logger.warn('Using fallback AgentRegistry.listAgents'); return []; },
        };
        const now = Date.now();
        this.executionConfig = {
            maxConcurrentTasks: 5,
            enableAutoRetry: true,
            maxRetryAttempts: 3,
            taskPriorityQueue: true,
            useAgentSpecialization: true,
            monitorAgentPerformance: true
        };
    }
    static getInstance() {
        if (!MultiAgentCoordinator.instance) {
            MultiAgentCoordinator.instance = new MultiAgentCoordinator();
        }
        return MultiAgentCoordinator.instance;
    }
    /**
     * Initialize the MultiAgentCoordinator
     * @param name Coordinator name
     * @param stateFilePath Optional path to a file for state persistence.
     * @param options Optional configuration options
     */
    async initialize() {
        logger.info('Initializing coordinator');
        let loadedState = false;
        if (this.stateFilePath) {
            console.info(`Attempting to load state from: ${this.stateFilePath}`);
            loadedState = await this.loadState(this.stateFilePath);
            if (loadedState) {
                console.info(`Coordinator state successfully loaded for "${this.name}" (${this.id})`);
                // Ensure components reflect loaded state
                // TODO: Implement initializeFromState in AgentRegistry
                // this.agentRegistry.initializeFromState(this.agentRegistry.listAgents()); 
                // TODO: Implement initializeFromState in TaskManager
                // this.taskManager.initializeFromState(this.taskManager.listTasks()); 
                this.initialized = true; // Mark as initialized based on loaded state
                return true;
            }
            else {
                console.warn(`Could not load state from ${this.stateFilePath}. Initializing fresh state.`);
            }
        }
        // Proceed with fresh initialization if state wasn't loaded
        if (!loadedState) {
            try {
                // Initialize shared state with coordinator info
                this.sharedStateManager.setState('system.coordinator', {
                    id: this.id,
                    name: this.name,
                    status: 'initializing',
                    coordinationStrategy: this.coordinationStrategy,
                    startTime: Date.now()
                });
                // Create default prompt templates if not already created
                this.promptManager.createDefaultTemplates();
                // Mark as initialized
                this.initialized = true;
                this.sharedStateManager.setState('system.coordinator.status', 'initialized');
                console.info(`MultiAgentCoordinator "${this.name}" initialized successfully (fresh state)`);
                // Save initial state if path is provided
                if (this.stateFilePath) {
                    await this.saveState(this.stateFilePath);
                }
                return true;
            }
            catch (error) {
                console.error(`Failed to initialize MultiAgentCoordinator: ${error.message}`);
                return false;
            }
        }
        return false; // Should not be reached if logic is correct
    }
    /**
     * Start the coordinator and begin processing tasks
     */
    async start() {
        if (!this.initialized) {
            try {
                await this.initialize();
            }
            catch (error) {
                console.error(`Failed to initialize coordinator on start: ${error.message}`);
                return false;
            }
        }
        try {
            this.isRunning = true;
            this.sharedStateManager.setState('system.coordinator.status', 'running');
            // Start task processing loop
            this.processTaskQueue();
            console.info(`MultiAgentCoordinator "${this.name}" started successfully`);
            return true;
        }
        catch (error) {
            console.error(`Failed to start MultiAgentCoordinator: ${error.message}`);
            this.isRunning = false;
            this.sharedStateManager.setState('system.coordinator.status', 'error');
            return false;
        }
    }
    /**
     * Stop the coordinator and halt task processing
     */
    async stop() {
        try {
            this.isRunning = false;
            this.sharedStateManager.setState('system.coordinator.status', 'stopped');
            // Ensure all agents are marked as offline
            for (const agent of this.agents.values()) {
                try {
                    if (agent.status && typeof agent.status === 'object' && agent.status.state !== 'offline') {
                        // Add check for agent.status type before spreading
                        const updatedStatus = typeof agent.status === 'object'
                            ? { ...agent.status, state: 'offline' }
                            : {
                                id: agent.id,
                                name: agent.name,
                                type: agent.type,
                                status: 'offline', // Use literal type
                                lastActive: Date.now(),
                                capabilities: [],
                                metadata: {},
                                state: 'offline', // Use literal type
                                lastUpdated: Date.now(),
                                healthStatus: { isHealthy: true, errors: [], lastHeartbeat: Date.now() },
                                metrics: {}
                            };
                        // Ensure the combined type matches what updateAgent expects (Partial<Agent>)
                        await this.agentRegistry.updateAgent(agent.id, { status: updatedStatus });
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to update agent ${agent.id} status to offline during stop: ${error.message}`);
                }
            }
            console.info(`MultiAgentCoordinator "${this.name}" stopped successfully`);
            return true;
        }
        catch (error) {
            console.error(`Failed to stop MultiAgentCoordinator: ${error.message}`);
            return false;
        }
    }
    /**
     * Register a new agent with the coordinator
     * @param agent Agent details (Using the type from ../../agents/types for registration input)
     * @returns Agent ID if successful
     */
    async registerAgent(agentData) {
        try {
            this.logger.info(`Registering agent with data: ${JSON.stringify(agentData)}`);
            const agentId = (0, uuid_1.v4)();
            const now = Date.now();
            const capabilities = convertCapabilities(agentData.capabilities || []);
            const initialStatus = agentData.status || 'available';
            const agentStatus = convertStatusToAgentStatus(initialStatus);
            // Update status with agent-specific values
            agentStatus.id = agentId;
            agentStatus.name = agentData.name;
            agentStatus.type = agentData.type;
            const coreAgent = {
                id: agentId,
                name: agentData.name,
                type: agentData.type,
                description: agentData.description || '',
                capabilities: capabilities,
                status: agentStatus,
                metadata: {
                    ...(agentData.metadata || {}),
                    preferredModel: agentData.preferredModel,
                    description: agentData.description,
                    lastActive: agentData.lastActive || now,
                    createdAt: agentData.createdAt || now
                },
                preferredModel: agentData.preferredModel || '',
                createdAt: agentData.createdAt || now,
                lastActive: agentData.lastActive || now,
            };
            this.logger.info(`Core Agent created: ${JSON.stringify(coreAgent)}`);
            // Register with agent registry
            const success = await this.agentRegistry.registerAgent(coreAgent);
            if (!success) {
                throw new Error('Failed to register agent with registry');
            }
            // Update shared state with new agent information
            this.sharedStateManager.setState(`agents.${agentId}`, {
                id: agentId,
                name: agentData.name,
                type: agentData.type,
                capabilities: Array.isArray(agentData.capabilities)
                    ? convertCapabilities(agentData.capabilities)
                    : [],
                status: agentData.status,
                registeredAt: Date.now()
            });
            console.info(`Agent "${agentData.name}" (${agentId}) registered successfully`);
            // Save state after successful registration
            if (this.stateFilePath) {
                await this.saveState(this.stateFilePath);
            }
            return agentId;
        }
        catch (error) {
            console.error(`Failed to register agent: ${error.message}`);
            return null;
        }
    }
    /**
     * Unregister an agent from the coordinator
     * @param agentId Agent ID
     * @returns Success status
     */
    async unregisterAgent(agentId) {
        try {
            const agent = this.agents.get(agentId);
            if (!agent) {
                this.logger.warn(`Agent ${agentId} not found for unregistration.`);
                return false;
            }
            // Remove agent from internal map
            this.agents.delete(agentId);
            // Unregister from agent registry
            await this.agentRegistry.unregisterAgent(agentId);
            // Remove from shared state
            await this.sharedStateManager.setState(`agents.${agentId}`, undefined);
            // If agent was working on a task, reassign or fail it
            const activeTask = Array.from(this.tasks.values()).find(task => task.assignedTo === agentId && task.status === 'in-progress');
            if (activeTask) {
                this.logger.info(`Agent ${agentId} was working on task ${activeTask.id}. Reassigning task.`);
                // Consider making assignTask also handle unassigning/reassigning implicitly
                // Corrected: Call assignTask, but maybe the task should be failed or explicitly unassigned first?
                // Assuming TaskManager interface should have unassign or similar
                // await this.taskManager.unassignTask(activeTask.id); // Typo corrected below
                // Let's try assigning to null first, then trigger reassignment logic if needed
                await this.taskManager.assignTask(activeTask.id, '' /*null*/); // Assign to empty string or handle null if TM supports
                await this.updateTaskStatus(activeTask.id, 'pending'); // Reset status
                // Optionally trigger processTaskQueue or specific reassignment logic here
                this.processTaskQueue(); // Attempt to reassign immediately
            }
            this.logger.info(`Agent ${agentId} unregistered successfully.`);
            // Save state after successful unregistration
            if (this.stateFilePath) {
                await this.saveState(this.stateFilePath);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to unregister agent ${agentId}: ${error.message}`);
            return false;
        }
    }
    /**
     * Create a new task to be executed by agents
     * @param taskData Task details
     * @returns Task ID if successful
     */
    async createTask(taskData) {
        try {
            const taskId = (0, uuid_1.v4)();
            const now = Date.now();
            const newTask = {
                id: taskId,
                ...taskData,
                status: 'pending',
                createdAt: now,
                updatedAt: now,
            };
            // Store task locally
            this.tasks.set(taskId, newTask);
            // Add task to TaskManager if it has its own state
            // Assuming TaskManager handles persistence/state if needed
            // await this.taskManager.createTask(newTask); // If TM has createTask
            // Update shared state
            await this.sharedStateManager.setState(`tasks.${taskId}`, {
                id: taskId,
                description: newTask.description, // Use description instead of title
                status: 'pending',
                priority: newTask.priority,
                assignedTo: newTask.assignedTo,
                dependsOn: newTask.dependsOn // Corrected from dependencies
            });
            this.logger.info(`Task "${newTask.description}" (${taskId}) created successfully`); // Use description instead of title
            // Attempt to assign the task immediately if possible
            if (this.executionConfig.useAgentSpecialization) {
                const suitableAgent = await this.findSuitableAgent(newTask);
                if (suitableAgent) {
                    this.logger.info(`Found suitable agent ${suitableAgent.id} for new task ${taskId}. Assigning.`);
                    // Pass ID, not object
                    await this.assignTask(newTask.id, suitableAgent.id);
                }
                else {
                    this.logger.info(`No suitable agent found immediately for task ${taskId}. Task queued.`);
                }
            }
            else {
                // If not using specialization, maybe assign to first available or queue
                this.logger.info(`Task ${taskId} queued for assignment.`);
            }
            // Save state after successful task creation
            if (this.stateFilePath) {
                await this.saveState(this.stateFilePath);
            }
            // Trigger queue processing if coordinator is running
            if (this.isRunning) {
                this.processTaskQueue();
            }
            return taskId;
        }
        catch (error) {
            this.logger.error(`Failed to create task: ${error.message}`);
            return null;
        }
    }
    /**
     * Assign a task to an agent
     * @param taskId Task ID
     * @param agentId Agent ID
     */
    async assignTask(taskId, agentId) {
        try {
            // Get task and agent
            const task = await this.getTask(taskId);
            const agent = await this.getAgent(agentId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            if (!agent) {
                throw new Error(`Agent ${agentId} not found`);
            }
            // Update task status to assigned
            await this.updateTaskStatus(task.id, 'assigned');
            // Update task's assignedTo field
            task.assignedTo = agentId;
            task.updatedAt = Date.now();
            // Update agent status to busy
            await this.updateAgent(agentId, {
                status: 'busy'
            });
            // Update shared state
            await this.sharedStateManager.setState(`tasks.${task.id}.assignedTo`, agentId);
            await this.sharedStateManager.setState(`tasks.${task.id}.status`, 'assigned');
            await this.sharedStateManager.setState(`agents.${agentId}.assignedTasks`, [task.id]);
            console.info(`Task ${task.id} assigned to agent ${agentId}`);
            // Start the task if it's assigned and the agent is available
            if (agent.status.state === 'available') {
                await this.startTask(task.id);
            }
        }
        catch (error) {
            console.error(`Failed to assign task: ${error.message}`);
            throw error;
        }
    }
    /**
     * Get details for a specific task
     * @param taskId Task ID
     * @returns Task object or null
     */
    async getTask(taskId) {
        try {
            // Add await here
            return await this.taskManager.getTask(taskId);
        }
        catch (error) {
            console.error(`Failed to get task ${taskId}: ${error.message}`);
            return null;
        }
    }
    /**
     * Update task status
     * @param taskId Task ID
     * @param status New status
     * @param result Optional task result
     * @returns Success status
     */
    async updateTaskStatus(taskId, status, result) {
        try {
            const task = await this.getTask(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            const now = Date.now();
            const updates = {
                status,
                updatedAt: now
            };
            // Add additional updates based on status
            switch (status) {
                case 'completed':
                    updates.completedAt = now;
                    if (result?.data) {
                        updates.results = result.data;
                    }
                    break;
                case 'failed':
                    updates.failedAt = now;
                    if (result?.error) {
                        updates.error = result.error;
                    }
                    break;
                case 'in-progress':
                    // Nothing additional for in-progress
                    break;
                case 'pending':
                    // Reset assignment
                    updates.assignedTo = undefined;
                    break;
                case 'assigned':
                    // Nothing additional for assigned
                    break;
            }
            // Update task data
            Object.assign(task, updates);
            // Update shared state
            await this.sharedStateManager.setState(`tasks.${taskId}`, task);
            // Update agent status if task is assigned to an agent
            if (task.assignedTo) {
                if (status === 'completed' || status === 'failed') {
                    // Set agent back to available
                    await this.updateAgent(task.assignedTo, {
                        status: 'available'
                    });
                }
                else if (status === 'in-progress') {
                    // Ensure agent is marked as busy
                    await this.updateAgent(task.assignedTo, {
                        status: 'busy'
                    });
                }
            }
            console.info(`Task ${taskId} status updated to ${status}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to update task status: ${error.message}`);
            return false;
        }
    }
    /**
     * Get details for a specific agent
     * @param agentId Agent ID
     * @returns Agent object or null
     */
    async getAgent(agentId) {
        try {
            // Add await here
            return await this.agentRegistry.getAgent(agentId);
        }
        catch (error) {
            console.error(`Failed to get agent ${agentId}: ${error.message}`);
            return null;
        }
    }
    /**
     * Update agent information
     * @param agentId Agent ID
     * @param updates Partial agent data
     * @returns Success status
     */
    async updateAgent(agentId, updates) {
        try {
            this.logger.info(`Updating agent ${agentId} with data: ${JSON.stringify(updates)}`);
            const agent = this.agents.get(agentId);
            if (!agent) {
                this.logger.error(`Agent ${agentId} not found for update.`);
                return false;
            }
            // Convert AgentType updates to core Agent updates before applying to registry
            let coreUpdates = {};
            // Directly map compatible fields
            if (updates.name !== undefined)
                coreUpdates.name = updates.name;
            if (updates.description !== undefined)
                coreUpdates.description = updates.description;
            if (updates.metadata !== undefined)
                coreUpdates.metadata = { ...agent.metadata, ...updates.metadata }; // Merge metadata
            if (updates.preferredModel !== undefined)
                coreUpdates.preferredModel = updates.preferredModel;
            if (updates.lastActive !== undefined)
                coreUpdates.lastActive = updates.lastActive;
            // createdAt and type typically shouldn't be updated
            // Convert capabilities if present
            if (updates.capabilities) {
                coreUpdates.capabilities = convertCapabilities(updates.capabilities);
            }
            // Convert status if present
            if (updates.status) {
                // Handle string status or potential object status from AgentType
                if (typeof updates.status === 'string') {
                    coreUpdates.status = convertStatusToAgentStatus(updates.status);
                    coreUpdates.status.id = agent.id; // Ensure IDs match
                    coreUpdates.status.name = agent.name;
                    coreUpdates.status.type = agent.type;
                }
                else {
                    // If it's somehow already an AgentStatus-like object (though AgentType defines it as string literals)
                    // This case might indicate an inconsistency elsewhere, but handle defensively
                    this.logger.warn(`Received unexpected object status in updateAgent for ${agentId}. Attempting conversion.`);
                    coreUpdates.status = {
                        id: agent.id,
                        name: agent.name,
                        type: agent.type,
                        status: updates.status.state || updates.status.status || 'offline',
                        lastActive: Date.now(),
                        capabilities: agent.capabilities, // Keep existing capabilities
                        metadata: agent.metadata, // Keep existing metadata
                        state: updates.status.state || updates.status.status || 'offline',
                        lastUpdated: Date.now(),
                        healthStatus: { isHealthy: true, errors: [], lastHeartbeat: Date.now() }, // Default health
                        metrics: {}
                    };
                    // Ensure the status literal is valid
                    const validStates = ['available', 'busy', 'offline', 'error'];
                    if (!validStates.includes(coreUpdates.status.state)) {
                        this.logger.warn(`Invalid state found in status update: ${coreUpdates.status.state}. Defaulting to offline.`);
                        coreUpdates.status.state = 'offline';
                        coreUpdates.status.status = 'offline';
                    }
                }
            }
            // Update internal agent map first for consistency
            const updatedInternalAgent = { ...agent, ...coreUpdates };
            this.agents.set(agentId, updatedInternalAgent);
            // Call agent registry update with converted core updates
            const success = await this.agentRegistry.updateAgent(agentId, coreUpdates);
            if (success) {
                this.logger.info(`Agent ${agentId} updated successfully.`);
                // Update shared state (using AgentType structure)
                await this.sharedStateManager.setState(`agents.${agentId}`, convertAgentToAgentType(updatedInternalAgent));
                // Save state after successful update
                if (this.stateFilePath) {
                    await this.saveState(this.stateFilePath);
                }
            }
            else {
                this.logger.error(`Failed to update agent ${agentId} in registry.`);
                // Revert internal state change if registry update failed?
                this.agents.set(agentId, agent);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error updating agent ${agentId}: ${error.message}`);
            return false;
        }
    }
    /**
     * List all registered agents, optionally filtered
     * @param filter Optional filter criteria
     * @returns Array of agents
     */
    async listAgents(filter) {
        try {
            // Directly use the agentRegistry's listAgents which should return AgentType[]
            const agents = await this.agentRegistry.listAgents(filter);
            // Ensure the description is handled correctly if optional in AgentType but required elsewhere
            return agents.map(agent => ({
                ...agent,
                description: agent.description || '' // Ensure description is always a string
            }));
        }
        catch (error) {
            this.logger.error(`Error listing agents: ${error.message}`);
            return [];
        }
    }
    /**
     * List all tasks, optionally filtered
     * @param filter Optional filter criteria
     * @returns Array of tasks (local Task type)
     */
    async listTasks(filter) {
        try {
            // Add await here, assuming listTasks is async
            const tasks = await this.taskManager.listTasks(filter);
            return tasks || []; // Return empty array if null/undefined
        }
        catch (error) {
            console.error(`Failed to list tasks: ${error.message}`);
            return [];
        }
    }
    /**
     * Process task queue
     */
    async processTaskQueue() {
        if (!this.isRunning) {
            return;
        }
        try {
            // Get all pending tasks
            const pendingTasks = await this.listTasks({
                status: ['pending']
            });
            // Filter for tasks that don't have dependencies or have all dependencies satisfied
            const readyTasks = [];
            for (const task of pendingTasks) {
                if (!task.dependsOn || task.dependsOn.length === 0) {
                    readyTasks.push(task);
                }
                else {
                    const dependenciesSatisfied = await this.taskManager.areDependenciesSatisfied(task.id);
                    if (dependenciesSatisfied) {
                        readyTasks.push(task);
                    }
                }
            }
            // If no ready tasks, check again later
            if (readyTasks.length === 0) {
                setTimeout(() => this.processTaskQueue(), 5000);
                return;
            }
            // Sort tasks by priority
            const priorityMap = {
                'critical': 3,
                'high': 2,
                'medium': 1,
                'low': 0
            };
            const sortedTasks = readyTasks.sort((a, b) => {
                const aPriority = a.priority ? priorityMap[a.priority] : 0;
                const bPriority = b.priority ? priorityMap[b.priority] : 0;
                return bPriority - aPriority;
            });
            // Process up to available slots
            const availableSlots = this.executionConfig.maxConcurrentTasks;
            const activeTasks = await this.listTasks({
                status: ['in-progress']
            });
            const slotsToFill = Math.max(0, availableSlots - activeTasks.length);
            for (let i = 0; i < Math.min(slotsToFill, sortedTasks.length); i++) {
                const task = sortedTasks[i];
                // Find suitable agent
                const suitableAgent = await this.findSuitableAgent(task);
                if (suitableAgent) {
                    await this.assignTask(task.id, suitableAgent.id);
                }
                else {
                    console.warn(`No suitable agent found for task ${task.id}`);
                }
            }
        }
        catch (error) {
            console.error(`Error processing task queue: ${error.message}`);
        }
        // Check again after a delay
        setTimeout(() => this.processTaskQueue(), 5000);
    }
    /**
     * Start a task
     * @param taskId Task ID
     * @returns Success status
     */
    async startTask(taskId) {
        try {
            const task = await this.getTask(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            if (task.status !== 'assigned') {
                throw new Error(`Task ${taskId} must be assigned before starting`);
            }
            // Update task status to in-progress
            await this.updateTaskStatus(taskId, 'in-progress');
            // Execute the task
            this.executeTask(taskId).catch(error => {
                console.error(`Task ${taskId} execution failed: ${error.message}`);
                this.updateTaskStatus(taskId, 'failed', {
                    success: false,
                    error: error.message
                });
            });
            return true;
        }
        catch (error) {
            console.error(`Failed to start task ${taskId}: ${error.message}`);
            return false;
        }
    }
    /**
     * Execute a task
     * @param taskId Task ID
     * @returns Success status
     */
    async executeTask(taskId) {
        try {
            const task = await this.getTask(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            if (!task.assignedTo) {
                throw new Error(`Task ${taskId} is not assigned to any agent`);
            }
            const agent = await this.getAgent(task.assignedTo);
            if (!agent) {
                throw new Error(`Agent ${task.assignedTo} not found`);
            }
            console.info(`Executing task ${taskId} (${task.name}) with agent ${agent.name}`);
            // Get start time for metrics
            const startTime = Date.now();
            // This would normally involve calling the agent to perform the task
            // For now, we'll just simulate task execution with a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Calculate duration
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Mark task as completed
            await this.updateTaskStatus(taskId, 'completed', {
                success: true,
                data: {
                    message: `Task completed by agent ${agent.name}`,
                    processingTime: duration
                },
                metrics: {
                    startTime,
                    endTime,
                    duration
                }
            });
            console.info(`Task ${taskId} executed successfully in ${duration}ms`);
            return true;
        }
        catch (error) {
            console.error(`Task ${taskId} execution failed: ${error.message}`);
            try {
                // Mark task as failed
                await this.updateTaskStatus(taskId, 'failed', {
                    success: false,
                    error: error.message
                });
            }
            catch (e) {
                console.error(`Failed to update task status after error: ${e.message}`);
            }
            return false;
        }
    }
    /**
     * Find the most suitable agent for a task based on capabilities and availability
     * @param task Task to find an agent for
     * @returns Most suitable agent (using Agent type from ../../agents/types) or null
     */
    async findSuitableAgent(task) {
        try {
            const agents = await this.listAgents();
            const availableAgents = agents.filter(agent => agent.status === 'available');
            if (!availableAgents || availableAgents.length === 0) {
                console.warn(`No agents found with status 'available'.`);
                return null;
            }
            const requiredCapabilities = task.metadata?.requiredCapabilities;
            if (!requiredCapabilities || requiredCapabilities.length === 0) {
                console.debug(`Task ${task.id} requires no specific capabilities. Selecting first available agent: ${availableAgents[0]?.id}`);
                return availableAgents[0];
            }
            const capableAgents = availableAgents.filter(agent => {
                if (!agent.capabilities)
                    return false;
                return requiredCapabilities.every(reqCap => agent.capabilities.includes(reqCap));
            });
            if (capableAgents.length === 0) {
                console.warn(`No available agents found with required capabilities for task ${task.id}: ${requiredCapabilities.join(', ')}`);
                return null;
            }
            const agentsWithTaskCounts = await Promise.all(capableAgents.map(async (agent) => {
                const agentTasks = await this.listTasks({
                    assignedTo: agent.id,
                    status: ['assigned', 'in-progress']
                });
                return { agent, assignedTaskCount: agentTasks.length };
            }));
            agentsWithTaskCounts.sort((a, b) => a.assignedTaskCount - b.assignedTaskCount);
            const selectedAgent = agentsWithTaskCounts[0].agent;
            console.debug(`Selected agent ${selectedAgent.id} for task ${task.id} (has ${agentsWithTaskCounts[0].assignedTaskCount} tasks)`);
            return selectedAgent;
        }
        catch (error) {
            console.error(`Error finding suitable agent for task ${task.id}: ${error.message}`, error.stack);
            return null;
        }
    }
    /**
     * Get the underlying agent registry
     * @returns Agent registry instance
     */
    getAgentRegistry() {
        return this.agentRegistry;
    }
    /**
     * Get the underlying shared state manager
     * @returns Shared state manager instance
     */
    getSharedStateManager() {
        return this.sharedStateManager;
    }
    /**
     * Get the underlying task manager
     * @returns Task manager instance
     */
    getTaskManager() {
        return this.taskManager;
    }
    /**
     * Get the underlying OpenAI client
     * @returns OpenAI client instance
     */
    getOpenAIClient() {
        return this.openAIClient;
    }
    /**
     * Get the underlying prompt manager
     * @returns Prompt manager instance
     */
    getPromptManager() {
        return this.promptManager;
    }
    // --- State Persistence Methods ---
    /**
     * Saves the current state of the coordinator to a file.
     * @param filePath The path to the file where state should be saved.
     */
    async saveState(filePath) {
        console.debug(`Attempting to save state to: ${filePath}`);
        try {
            // Get current agents from registry
            const registryAgents = await this.agentRegistry.listAgents();
            // Convert AgentType[] from registry to Agent[] for internal state
            // Ensure all required Agent properties are present
            const agentsToSave = registryAgents.map(regAgent => {
                const internalAgent = this.agents.get(regAgent.id);
                // Prefer internal state if available, otherwise convert from registry type
                if (internalAgent) {
                    return internalAgent;
                }
                else {
                    // Use the conversion function, ensuring it provides all fields
                    // Or manually construct, ensuring all fields are present
                    const agentStatus = convertStatusToAgentStatus(regAgent.status);
                    agentStatus.id = regAgent.id;
                    agentStatus.name = regAgent.name;
                    agentStatus.type = regAgent.type;
                    const capabilities = Array.isArray(regAgent.capabilities)
                        ? regAgent.capabilities.map(cap => ({ name: cap, description: `Capability: ${cap}`, parameters: {} }))
                        : [];
                    return {
                        id: regAgent.id,
                        name: regAgent.name,
                        type: regAgent.type,
                        description: regAgent.description || '',
                        capabilities,
                        status: agentStatus,
                        metadata: regAgent.metadata || {},
                        preferredModel: regAgent.preferredModel || '',
                        createdAt: regAgent.createdAt || Date.now(),
                        lastActive: regAgent.lastActive || Date.now()
                    };
                }
            });
            // Prepare state object
            const state = {
                coordinatorId: this.id,
                coordinatorName: this.name,
                coordinationStrategy: this.coordinationStrategy,
                executionConfig: this.executionConfig,
                sharedState: this.sharedStateManager.getState('') || {},
                tasks: await this.taskManager.listTasks(),
                agents: agentsToSave,
                initialized: this.initialized,
                isRunning: this.isRunning,
                savedAt: new Date().toISOString(),
            };
            const stateJson = JSON.stringify(state, null, 2);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, stateJson, 'utf8');
            console.info(`Coordinator state successfully saved to: ${filePath}`);
            this.stateFilePath = filePath;
            return true;
        }
        catch (error) {
            console.error(`Failed to save coordinator state to ${filePath}: ${error.message}`, error.stack);
            return false;
        }
    }
    /**
     * Loads the coordinator state from a file.
     * @param filePath The path to the file from which state should be loaded.
     */
    async loadState(filePath) {
        console.debug(`Attempting to load state from: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            console.warn(`State file not found: ${filePath}. Cannot load state.`);
            return false;
        }
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const state = JSON.parse(data);
            // Restore coordinator properties
            // this.id = state.coordinatorId; // Usually shouldn't restore coordinator's own ID
            this.name = state.coordinatorName;
            this.executionConfig = state.executionConfig;
            this.initialized = state.initialized;
            this.isRunning = state.isRunning;
            this.coordinationStrategy = state.coordinationStrategy;
            // Restore shared state via SharedStateManager
            await this.sharedStateManager.clearState(); // Clear existing before loading
            for (const [key, value] of Object.entries(state.sharedState || {})) {
                await this.sharedStateManager.setState(key, value);
            }
            // Restore tasks (local map and potentially TaskManager)
            this.tasks.clear();
            state.tasks.forEach(task => this.tasks.set(task.id, task));
            // TODO: Potentially need to re-register tasks with the actual TaskManager instance
            // Restore agents (local map and AgentRegistry)
            this.agents.clear();
            for (const agent of state.agents) {
                this.agents.set(agent.id, agent);
                await this.agentRegistry.registerAgent(agent);
            }
            // Use getInstance for SharedStateManager
            // Ensure the instance used here is the same singleton instance
            // this.stateManager = new SharedStateManagerImpl(); // Incorrect: Use singleton
            this.stateManager = SharedStateManager_1.SharedStateManager.getInstance();
            this.logger.info(`Coordinator state loaded successfully from ${filePath}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to load coordinator state from ${filePath}: ${error.message}`, error.stack);
            this.initialized = false;
            return false;
        }
    }
    // --- End State Persistence Methods ---
    createAgentStatus(agent) {
        return {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status.status,
            lastActive: agent.lastActive,
            capabilities: agent.capabilities,
            metadata: agent.metadata,
            state: agent.status.state,
            lastUpdated: Date.now(),
            healthStatus: {
                isHealthy: true,
                errors: [],
                lastHeartbeat: Date.now()
            },
            metrics: {}
        };
    }
    createStateUpdateOptions(agent, action) {
        return {
            modifiedBy: agent.id,
            metadata: {
                action,
                agentId: agent.id,
                agentName: agent.name,
                agentType: agent.type,
                timestamp: new Date().toISOString()
            }
        };
    }
    createAgent(agentData) {
        const now = Date.now();
        return {
            id: agentData.id,
            name: agentData.name,
            type: agentData.type,
            description: agentData.description || '',
            capabilities: agentData.capabilities || [],
            status: {
                id: agentData.id,
                name: agentData.name,
                type: agentData.type,
                status: 'available',
                lastActive: now,
                capabilities: agentData.capabilities || [],
                metadata: {},
                state: 'available',
                lastUpdated: now,
                healthStatus: {
                    isHealthy: true,
                    errors: [],
                    lastHeartbeat: now
                },
                metrics: {}
            },
            metadata: agentData.metadata || {},
            preferredModel: agentData.preferredModel || 'default',
            createdAt: agentData.createdAt || now,
            lastActive: agentData.lastActive || now
        };
    }
    async completeTask(taskId, agentId) {
        try {
            const agentData = await this.stateManager.getState(`agents.${agentId}`);
            if (!agentData) {
                throw new Error(`Agent ${agentId} not found`);
            }
            const agent = this.createAgent(agentData);
            const stateUpdateOptions = this.createStateUpdateOptions(agent, 'completeTask');
            await this.stateManager.setState(`tasks.${taskId}.status`, 'completed', stateUpdateOptions);
            await this.stateManager.setState(`tasks.${taskId}.completedAt`, new Date().toISOString(), stateUpdateOptions);
            this.logger.info('Task completed successfully', {
                taskId,
                agentId,
                action: 'completeTask'
            });
        }
        catch (error) {
            this.logger.error('Failed to complete task', {
                taskId,
                agentId,
                error
            });
            throw error;
        }
    }
    async failTask(taskId, agentId, error) {
        try {
            const agentData = await this.stateManager.getState(`agents.${agentId}`);
            if (!agentData) {
                throw new Error(`Agent ${agentId} not found`);
            }
            const agent = this.createAgent(agentData);
            const stateUpdateOptions = this.createStateUpdateOptions(agent, 'failTask');
            await this.stateManager.setState(`tasks.${taskId}.status`, 'failed', stateUpdateOptions);
            await this.stateManager.setState(`tasks.${taskId}.error`, error, stateUpdateOptions);
            await this.stateManager.setState(`tasks.${taskId}.failedAt`, new Date().toISOString(), stateUpdateOptions);
            this.logger.error('Task failed', {
                taskId,
                agentId,
                error,
                action: 'failTask'
            });
        }
        catch (error) {
            this.logger.error('Failed to mark task as failed', {
                taskId,
                agentId,
                error
            });
            throw error;
        }
    }
}
exports.MultiAgentCoordinator = MultiAgentCoordinator;
//# sourceMappingURL=MultiAgentCoordinator.js.map