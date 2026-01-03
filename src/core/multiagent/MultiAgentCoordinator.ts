import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from './interfaces/AgentRegistry';
import { SharedStateManager } from './interfaces/SharedStateManager';
import { TaskManager } from './interfaces/TaskManager';
import { OpenAIClient as OpenAIClientInterface } from './interfaces/OpenAIClient';
import { PromptManager as PromptManagerInterface } from './interfaces/PromptManager';
import { SharedStateManager as SharedStateManagerImpl } from './SharedStateManager';
import { TaskManager as TaskManagerImpl } from './TaskManager';
import { AgentRegistry as AgentRegistryImpl } from './AgentRegistry';
import { OpenAIClient as OpenAIClientImpl } from './OpenAIClient';
import { PromptManager as PromptManagerImpl } from './PromptManager';
import { Task, Agent, TaskResult, Capability, AgentStatus, StateUpdateOptions, TaskFilter, TokenEstimate } from './types';
import { Agent as AgentType } from '../../agents/types';
import * as winston from 'winston';
import { Logger } from './Logger';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/coordinator.log' }),
    new winston.transports.Console()
  ]
});




/**
 * Convert AgentType to Agent
 */
function convertAgentTypeToAgent(agentType: AgentType): Agent {
  const now = Date.now();

  const agent: Agent = {
    id: agentType.id,
    name: agentType.name,
    type: agentType.type,
    description: agentType.description || '',
    capabilities: agentType.capabilities,
    status: agentType.status,
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
function convertAgentToAgentType(agent: Agent): AgentType {
  const metadata = agent.metadata || {};

  const agentType: AgentType = {
    id: agent.id,
    name: agent.name,
    type: agent.type,
    capabilities: agent.capabilities,
    status: agent.status,
    metadata: metadata || {},
    description: metadata.description as string || '',
    preferredModel: metadata.preferredModel as string || '',
    lastActive: metadata.lastActive as number || Date.now(),
    createdAt: metadata.createdAt as number || Date.now()
  };

  return agentType;
}

/**
 * Convert task status to agent status
 */
function convertTaskStatusToAgentStatus(status: Task['status']): AgentStatus['state'] {
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
function convertAgentStatusToTaskStatus(status: string): Task['status'] {
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
 * Defines the structure of the saved state.
 */
interface CoordinatorState {
  coordinatorId: string;
  coordinatorName: string;
  coordinationStrategy: 'centralized' | 'decentralized' | 'hybrid';
  executionConfig: MultiAgentCoordinator['executionConfig'];
  sharedState: Record<string, any>; // State from SharedStateManager
  tasks: Task[]; // State from TaskManager (local Task type)
  agents: Agent[]; // State for persistence (local Agent type)
  initialized: boolean;
  isRunning: boolean;
  savedAt: string;
}

/**
 * The MultiAgentCoordinator orchestrates interactions between multiple agents
 * through shared state management, task allocation, and communication.
 */
export class MultiAgentCoordinator {
  private static instance: MultiAgentCoordinator;
  private agents: Map<string, Agent>;
  private tasks: Map<string, Task>;
  private stateManager: SharedStateManagerImpl;
  private logger: Logger;
  private agentRegistry: AgentRegistry;
  private id: string;
  private name: string;
  private sharedStateManager: SharedStateManager;
  private taskManager: TaskManager;
  private openAIClient: OpenAIClientInterface;
  private promptManager: PromptManagerInterface;
  private executionConfig: {
    maxConcurrentTasks: number;
    enableAutoRetry: boolean;
    maxRetryAttempts: number;
    taskPriorityQueue: boolean;
    useAgentSpecialization: boolean;
    monitorAgentPerformance: boolean;
  };
  private initialized: boolean = false;
  private isRunning: boolean = false;
  private stateFilePath: string | null = null; // Path to save/load state
  private coordinationStrategy: 'centralized' | 'decentralized' | 'hybrid' = 'centralized';

  constructor(
    name: string = 'Default Coordinator',
    options?: {
      sharedStateManager?: SharedStateManager;
      taskManager?: TaskManager;
      agentRegistry?: AgentRegistry;
      openAIClient?: OpenAIClientInterface;
      promptManager?: PromptManagerInterface;
      stateFilePath?: string;
      executionConfig?: Partial<MultiAgentCoordinator['executionConfig']>;
      coordinationStrategy?: 'centralized' | 'decentralized' | 'hybrid';
    }
  ) {
    this.agents = new Map();
    this.tasks = new Map();
    this.stateManager = SharedStateManagerImpl.getInstance();
    this.logger = new Logger('MultiAgentCoordinator');
    this.id = uuidv4();
    this.name = name;
    
    // Initialize required components using provided options or full fallbacks matching interfaces
    this.sharedStateManager = options?.sharedStateManager || this.stateManager;
    
    // Real implementations (still allow override for testing)
    this.taskManager = options?.taskManager || TaskManagerImpl.getInstance();
    this.openAIClient = options?.openAIClient || new OpenAIClientImpl();
    this.promptManager = options?.promptManager || PromptManagerImpl.getInstance();
    this.agentRegistry = options?.agentRegistry || AgentRegistryImpl.getInstance();

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

  public static getInstance(): MultiAgentCoordinator {
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
  async initialize(): Promise<boolean> {
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
      } else {
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
       } catch (error: any) {
         console.error(`Failed to initialize MultiAgentCoordinator: ${error.message}`);
         return false;
       }
    }
    return false; // Should not be reached if logic is correct
  }
  
  /**
   * Start the coordinator and begin processing tasks
   */
  async start(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await this.initialize();
      } catch (error: any) {
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
    } catch (error: any) {
      console.error(`Failed to start MultiAgentCoordinator: ${error.message}`);
      this.isRunning = false;
      this.sharedStateManager.setState('system.coordinator.status', 'error');
      return false;
    }
  }
  
  /**
   * Stop the coordinator and halt task processing
   */
  async stop(): Promise<boolean> {
    try {
      this.isRunning = false;
      this.sharedStateManager.setState('system.coordinator.status', 'stopped');
      
      // Ensure all agents are marked as offline
      for (const agent of this.agents.values()) {
        try {
          if (agent.status !== 'offline') {
            await this.agentRegistry.updateAgent(agent.id, { status: 'offline' });
          }
        } catch (error: any) {
          this.logger.error(`Failed to update agent ${agent.id} status to offline during stop: ${error.message}`);
        }
      }
      
      console.info(`MultiAgentCoordinator "${this.name}" stopped successfully`);
      return true;
    } catch (error: any) {
      console.error(`Failed to stop MultiAgentCoordinator: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Register a new agent with the coordinator
   * @param agent Agent details (Using the type from ../../agents/types for registration input)
   * @returns Agent ID if successful
   */
  async registerAgent(agentData: Omit<import('../../agents/types').Agent, 'id'>): Promise<string | null> {
    try {
      this.logger.info(`Registering agent with data: ${JSON.stringify(agentData)}`);
      const agentId = uuidv4();
      const now = Date.now();
      const capabilities = agentData.capabilities || [];
      const initialStatus = agentData.status || 'available';
      const agentStatus = initialStatus;
      
      
      const coreAgent: Agent = {
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
      // Track locally for lifecycle operations
      this.agents.set(agentId, coreAgent);
      
      // Update shared state with new agent information
      this.sharedStateManager.setState(`agents.${agentId}`, {
        id: agentId,
        name: agentData.name,
        type: agentData.type,
        capabilities: Array.isArray(agentData.capabilities)
          ? agentData.capabilities
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
    } catch (error: any) {
      console.error(`Failed to register agent: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Unregister an agent from the coordinator
   * @param agentId Agent ID
   * @returns Success status
   */
  async unregisterAgent(agentId: string): Promise<boolean> {
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
        await this.taskManager.assignTask(activeTask.id, ''/*null*/); // Assign to empty string or handle null if TM supports
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
    } catch (error: any) {
      this.logger.error(`Failed to unregister agent ${agentId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Create a new task to be executed by agents
   * @param taskData Task details
   * @returns Task ID if successful
   */
  async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Date.now();
      const newTask: Task = {
        id: uuidv4(),
        ...taskData,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      // Persist through TaskManager (source of truth) and mirror locally
      const taskId = await this.taskManager.createTask(newTask);
      const storedTask = await this.taskManager.getTask(taskId);
      if (storedTask) {
        this.tasks.set(taskId, storedTask);
      }

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
        } else {
          this.logger.info(`No suitable agent found immediately for task ${taskId}. Task queued.`);
        }
      } else {
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
    } catch (error: any) {
      this.logger.error(`Failed to create task: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Assign a task to an agent
   * @param taskId Task ID
   * @param agentId Agent ID
   */
  async assignTask(taskId: string, agentId: string): Promise<void> {
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
      if (agent.status === 'available') {
        await this.startTask(task.id);
      }
    } catch (error: any) {
      console.error(`Failed to assign task: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get details for a specific task
   * @param taskId Task ID
   * @returns Task object or null
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      // Add await here
      return await this.taskManager.getTask(taskId);
    } catch (error: any) {
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
  async updateTaskStatus(
    taskId: string,
    status: Task['status'],
    result?: TaskResult
  ): Promise<boolean> {
    try {
      const task = await this.getTask(taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }
      
      const now = Date.now();
      const updates: Partial<Task> = {
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
        } else if (status === 'in-progress') {
          // Ensure agent is marked as busy
          await this.updateAgent(task.assignedTo, { 
            status: 'busy'
          });
        }
      }
      
      console.info(`Task ${taskId} status updated to ${status}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to update task status: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get details for a specific agent
   * @param agentId Agent ID
   * @returns Agent object or null
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      // Add await here
      return await this.agentRegistry.getAgent(agentId);
    } catch (error: any) {
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
  async updateAgent(agentId: string, updates: Partial<AgentType>): Promise<boolean> {
    try {
      this.logger.info(`Updating agent ${agentId} with data: ${JSON.stringify(updates)}`);
      const agent = this.agents.get(agentId);
      if (!agent) {
        this.logger.error(`Agent ${agentId} not found for update.`);
        return false;
      }

      // Convert AgentType updates to core Agent updates before applying to registry
      let coreUpdates: Partial<Agent> = {};

      // Directly map compatible fields
      if (updates.name !== undefined) coreUpdates.name = updates.name;
      if (updates.description !== undefined) coreUpdates.description = updates.description;
      if (updates.metadata !== undefined) coreUpdates.metadata = { ...agent.metadata, ...updates.metadata }; // Merge metadata
      if (updates.preferredModel !== undefined) coreUpdates.preferredModel = updates.preferredModel;
      if (updates.lastActive !== undefined) coreUpdates.lastActive = updates.lastActive;
      // createdAt and type typically shouldn't be updated

      // Convert capabilities if present
      if (updates.capabilities) {
        coreUpdates.capabilities = updates.capabilities;
      }
      
      // Convert status if present
      if (updates.status) {
        coreUpdates.status = updates.status;
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
      } else {
        this.logger.error(`Failed to update agent ${agentId} in registry.`);
        // Revert internal state change if registry update failed?
        this.agents.set(agentId, agent); 
      }
      return success;
    } catch (error: any) {
      this.logger.error(`Error updating agent ${agentId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * List all registered agents, optionally filtered
   * @param filter Optional filter criteria
   * @returns Array of agents
   */
  async listAgents(filter?: Parameters<AgentRegistry['listAgents']>[0]): Promise<AgentType[]> {
    try {
      // Directly use the agentRegistry's listAgents which should return AgentType[]
      const agents = await this.agentRegistry.listAgents(filter);
      // Ensure the description is handled correctly if optional in AgentType but required elsewhere
      return agents.map(agent => ({
        ...agent,
        description: agent.description || '' // Ensure description is always a string
      }));
    } catch (error: any) {
      this.logger.error(`Error listing agents: ${error.message}`);
      return [];
    }
  }
  
  /**
   * List all tasks, optionally filtered
   * @param filter Optional filter criteria
   * @returns Array of tasks (local Task type)
   */
  async listTasks(filter?: Parameters<TaskManager['listTasks']>[0]): Promise<Task[]> {
    try {
      // Add await here, assuming listTasks is async
      const tasks = await this.taskManager.listTasks(filter);
      return tasks || []; // Return empty array if null/undefined
    } catch (error: any) {
      console.error(`Failed to list tasks: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Process task queue
   */
  private async processTaskQueue(): Promise<void> {
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
        } else {
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
      const priorityMap: Record<string, number> = {
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
        } else {
          console.warn(`No suitable agent found for task ${task.id}`);
        }
      }
    } catch (error: any) {
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
  private async startTask(taskId: string): Promise<boolean> {
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
    } catch (error: any) {
      console.error(`Failed to start task ${taskId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Execute a task
   * @param taskId Task ID
   * @returns Success status
   */
  private async executeTask(taskId: string): Promise<boolean> {
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
    } catch (error: any) {
      console.error(`Task ${taskId} execution failed: ${error.message}`);
      
      try {
        // Mark task as failed
        await this.updateTaskStatus(taskId, 'failed', {
          success: false,
          error: error.message
        });
      } catch (e: any) {
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
  private async findSuitableAgent(task: Task): Promise<import('../../agents/types').Agent | null> {
    try {
      const agents = await this.listAgents();
      const availableAgents = agents.filter(agent => agent.status === 'available');

      if (!availableAgents || availableAgents.length === 0) {
        console.warn(`No agents found with status 'available'.`);
        return null;
      }
      
      const requiredCapabilities = task.metadata?.requiredCapabilities as string[] | undefined;
      if (!requiredCapabilities || requiredCapabilities.length === 0) {
        console.debug(`Task ${task.id} requires no specific capabilities. Selecting first available agent: ${availableAgents[0]?.id}`);
        return availableAgents[0];
      }
      
      const capableAgents = availableAgents.filter(agent => {
         if (!agent.capabilities) return false;
         return requiredCapabilities.every(reqCap => 
           agent.capabilities.includes(reqCap)
         );
      });
      
      if (capableAgents.length === 0) {
        console.warn(`No available agents found with required capabilities for task ${task.id}: ${requiredCapabilities.join(', ')}`);
        return null;
      }
      
      const agentsWithTaskCounts = await Promise.all(
        capableAgents.map(async agent => {
          const agentTasks = await this.listTasks({ 
            assignedTo: agent.id,
            status: ['assigned', 'in-progress'] 
          });
          return { agent, assignedTaskCount: agentTasks.length };
        })
      );
      
      agentsWithTaskCounts.sort((a, b) => a.assignedTaskCount - b.assignedTaskCount);
      
      const selectedAgent = agentsWithTaskCounts[0].agent;
      console.debug(`Selected agent ${selectedAgent.id} for task ${task.id} (has ${agentsWithTaskCounts[0].assignedTaskCount} tasks)`);
      return selectedAgent;

    } catch (error: any) {
      console.error(`Error finding suitable agent for task ${task.id}: ${error.message}`, error.stack);
      return null;
    }
  }
  
  /**
   * Get the underlying agent registry
   * @returns Agent registry instance
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Find agents by capability
   * @param capability Capability to search for
   * @returns Array of agents with the capability
   */
  async findAgentsByCapability(capability: string): Promise<AgentType[]> {
    const agents = await this.agentRegistry.findAgentsByCapability(capability);
    return agents.map(agent => convertAgentToAgentType(agent));
  }

  /**
   * Update agent status
   * @param agentId Agent ID
   * @param status New status
   */
  async updateAgentStatus(agentId: string, status: string): Promise<boolean> {
    return await this.agentRegistry.updateAgentStatus(agentId, status);
  }

  /**
   * Get ready tasks (dependencies satisfied)
   * @returns Array of ready tasks
   */
  async getReadyTasks(): Promise<Task[]> {
    return await this.taskManager.getReadyTasks();
  }

  /**
   * Check if task dependencies are satisfied
   * @param taskId Task ID
   * @returns True if dependencies are satisfied
   */
  async areDependenciesSatisfied(taskId: string): Promise<boolean> {
    return await this.taskManager.areDependenciesSatisfied(taskId);
  }
  
  /**
   * Get the underlying shared state manager
   * @returns Shared state manager instance
   */
  getSharedStateManager(): SharedStateManager {
    return this.sharedStateManager;
  }
  
  /**
   * Get the underlying task manager
   * @returns Task manager instance
   */
  getTaskManager(): TaskManager {
    return this.taskManager;
  }
  
  /**
   * Get the underlying OpenAI client
   * @returns OpenAI client instance
   */
  getOpenAIClient(): OpenAIClientInterface {
    return this.openAIClient;
  }
  
  /**
   * Get the underlying prompt manager
   * @returns Prompt manager instance
   */
  getPromptManager(): PromptManagerInterface {
    return this.promptManager;
  }

  // --- State Persistence Methods ---

  /**
   * Saves the current state of the coordinator to a file.
   * @param filePath The path to the file where state should be saved.
   */
  async saveState(filePath: string): Promise<boolean> {
    console.debug(`Attempting to save state to: ${filePath}`);
    try {
      // Get current agents from registry
      const registryAgents = await this.agentRegistry.listAgents();

      // Convert AgentType[] from registry to Agent[] for internal state
      // Ensure all required Agent properties are present
      const agentsToSave: Agent[] = registryAgents.map(regAgent => {
        const internalAgent = this.agents.get(regAgent.id);
        // Prefer internal state if available, otherwise convert from registry type
        if (internalAgent) {
          return internalAgent;
        } else {
          // Registry agent should already be compatible with core Agent interface
          return regAgent;
        }
      });

      // Prepare state object
      const state: CoordinatorState = {
        coordinatorId: this.id,
        coordinatorName: this.name,
        coordinationStrategy: this.coordinationStrategy,
        executionConfig: this.executionConfig,
        sharedState: this.sharedStateManager.getFullState() || {},
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
    } catch (error: any) {
      console.error(`Failed to save coordinator state to ${filePath}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Loads the coordinator state from a file.
   * @param filePath The path to the file from which state should be loaded.
   */
  async loadState(filePath: string): Promise<boolean> {
    console.debug(`Attempting to load state from: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.warn(`State file not found: ${filePath}. Cannot load state.`);
      return false;
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const state: CoordinatorState = JSON.parse(data);

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
      this.stateManager = SharedStateManagerImpl.getInstance(); 

      this.logger.info(`Coordinator state loaded successfully from ${filePath}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to load coordinator state from ${filePath}: ${error.message}`, error.stack);
      this.initialized = false;
      return false;
    }
  }

  // --- End State Persistence Methods ---


  private createStateUpdateOptions(agent: Agent, action: string): StateUpdateOptions {
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

  private createAgent(agentData: any): Agent {
    const now = Date.now();
    return {
      id: agentData.id,
      name: agentData.name,
      type: agentData.type,
      description: agentData.description || '',
      capabilities: agentData.capabilities || [],
      status: 'available',
      metadata: agentData.metadata || {},
      preferredModel: agentData.preferredModel || 'default',
      createdAt: agentData.createdAt || now,
      lastActive: agentData.lastActive || now
    };
  }

  public async completeTask(taskId: string, agentId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to complete task', {
        taskId,
        agentId,
        error
      });
      throw error;
    }
  }

  public async failTask(taskId: string, agentId: string, error: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to mark task as failed', {
        taskId,
        agentId,
        error
      });
      throw error;
    }
  }
} 