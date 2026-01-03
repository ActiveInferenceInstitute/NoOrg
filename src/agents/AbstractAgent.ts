import { Agent, AgentType } from './types';
import { Capability } from '../core/multiagent/types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { Logger } from '../core/multiagent/Logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base options for constructing an AbstractAgent.
 */
export interface AbstractAgentOptions {
    id?: string;
    name: string;
    type: AgentType;
    description?: string;
    capabilities: string[]; // Use string array as defined in Agent interface
    status?: Agent['status'];
    metadata?: Record<string, any>;
    preferredModel?: string;
    openAIClient: OpenAIClient; // Make required
    sharedState: SharedStateManager; // Make required
}

/**
 * Abstract base class for all agents in the multiagent system.
 * Handles common properties, initialization, status updates, and service access.
 */
export abstract class AbstractAgent implements Agent {
    public readonly id: string;
    public readonly name: string;
    public readonly type: AgentType;
    public readonly description?: string;
    public readonly capabilities: string[];
    public status: Agent['status'];
    public readonly metadata?: Record<string, any>;
    public readonly preferredModel?: string;
    public lastActive: number;
    public readonly createdAt: number;

    protected openAIClient: OpenAIClient;
    protected sharedState: SharedStateManager;
    protected logger: Logger;
    protected isInitialized: boolean = false;

    /**
     * Constructs a new AbstractAgent.
     * @param options - Configuration options for the agent.
     */
    constructor(options: AbstractAgentOptions) {
        const timestamp = Date.now();
        this.id = options.id || uuidv4();
        this.name = options.name;
        this.type = options.type;
        this.description = options.description;
        this.capabilities = options.capabilities;
        this.status = options.status || 'offline';
        this.metadata = options.metadata || {};
        this.preferredModel = options.preferredModel;
        this.lastActive = timestamp;
        this.createdAt = timestamp;

        // Store required services
        this.openAIClient = options.openAIClient;
        this.sharedState = options.sharedState;

        // Initialize logger
        this.logger = new Logger(`AbstractAgent-${this.name}`, 'info');
    }

    /**
     * Initializes the agent, setting its status to 'available' and registering in shared state.
     * @returns True if initialization was successful, false otherwise.
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) {
            this.logger.warn('Agent already initialized', { agentId: this.id, agentName: this.name });
            return true;
        }

        this.logger.info('Initializing agent', { agentId: this.id, agentName: this.name, type: this.type });
        try {
            // Register initial agent state in shared state
            this.updateSharedState({ status: 'initializing', lastActive: Date.now() });

            // Perform any subclass-specific initialization (optional override)
            await this.onInitialize();

            // Mark agent as available
            this.isInitialized = true;
            this.updateStatus('available'); // This also updates shared state

            this.logger.info('Agent initialized successfully', { agentId: this.id, agentName: this.name });
            return true;
        } catch (error: any) {
            this.logger.error('Failed to initialize agent', {
                agentId: this.id,
                agentName: this.name,
                error: error.message,
                stack: error.stack
            });
            this.updateStatus('error'); // This also updates shared state
            this.isInitialized = false; // Ensure it's marked as not initialized on failure
            return false;
        }
    }

    /**
     * Optional hook for subclasses to perform specific initialization logic.
     */
    protected async onInitialize(): Promise<void> {
        // Default implementation does nothing. Subclasses can override.
    }

    /**
     * Updates the agent's status and last active time, both locally and in shared state.
     * @param newStatus - The new status for the agent.
     */
    updateStatus(newStatus: Agent['status']): void {
        if (this.status === newStatus) {
            return; // No change needed
        }
        this.logger.debug('Agent status changing', {
            agentId: this.id,
            agentName: this.name,
            fromStatus: this.status,
            toStatus: newStatus
        });
        this.status = newStatus;
        this.lastActive = Date.now();
        this.updateSharedState({ status: this.status, lastActive: this.lastActive });
    }

    /**
     * Provides the agent's core information.
     * @returns An object containing the agent's properties.
     */
    getAgentInfo(): Agent {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            capabilities: this.capabilities,
            status: this.status,
            metadata: this.metadata,
            preferredModel: this.preferredModel,
            lastActive: this.lastActive,
            createdAt: this.createdAt,
        };
    }

    /**
     * Updates the agent's representation in the SharedStateManager.
     * @param updates - An object containing the fields to update.
     */
    protected updateSharedState(updates: Partial<Agent>): void {
        try {
             // Get the current state or an empty object if it doesn't exist
             const currentState = this.sharedState.getState(`agents.${this.id}`) || {};
             // Merge updates with current state
             const newState = { ...currentState, ...updates };
             // Set the updated state
            this.sharedState.setState(`agents.${this.id}`, newState);
        } catch (error: any) {
            this.logger.error('Failed to update shared state', {
                agentId: this.id,
                agentName: this.name,
                error: error.message
            });
        }
    }

     /**
      * Abstract method for executing a task. Subclasses must implement this
      * to define the agent's core behavior.
      * @param taskDetails - Information about the task to execute.
      * @param context - Additional context or shared state relevant to the task.
      * @returns A promise resolving with the task result.
      */
     abstract executeTask(taskDetails: any, context?: any): Promise<any>;


    /**
     * Shuts down the agent, setting its status to 'offline'.
     * Subclasses can override `onShutdown` for custom cleanup.
     * @returns True if shutdown was successful, false otherwise.
     */
    async shutdown(): Promise<boolean> {
        if (this.status === 'offline') {
            this.logger.warn('Agent already offline', { agentId: this.id, agentName: this.name });
            return true;
        }

        this.logger.info('Shutting down agent', { agentId: this.id, agentName: this.name });
        try {
            // Perform any subclass-specific shutdown logic
            await this.onShutdown();

            this.updateStatus('offline');
            this.isInitialized = false; // Mark as not initialized

            this.logger.info('Agent shut down successfully', { agentId: this.id, agentName: this.name });
            return true;
        } catch (error: any) {
            this.logger.error('Error during agent shutdown', {
                agentId: this.id,
                agentName: this.name,
                error: error.message,
                stack: error.stack
            });
            // Still attempt to mark as offline, even if onShutdown fails
            this.updateStatus('offline');
            this.isInitialized = false;
            return false; // Indicate that shutdown had issues
        }
    }

    /**
     * Optional hook for subclasses to perform specific cleanup logic during shutdown.
     */
    protected async onShutdown(): Promise<void> {
        // Default implementation does nothing. Subclasses can override.
    }
} 