import { Agent, AgentType } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { Logger } from '../core/multiagent/Logger';
/**
 * Base options for constructing an AbstractAgent.
 */
export interface AbstractAgentOptions {
    id?: string;
    name: string;
    type: AgentType;
    description?: string;
    capabilities: string[];
    status?: Agent['status'];
    metadata?: Record<string, any>;
    preferredModel?: string;
    openAIClient: OpenAIClient;
    sharedState: SharedStateManager;
}
/**
 * Abstract base class for all agents in the multiagent system.
 * Handles common properties, initialization, status updates, and service access.
 */
export declare abstract class AbstractAgent implements Agent {
    readonly id: string;
    readonly name: string;
    readonly type: AgentType;
    readonly description?: string;
    readonly capabilities: string[];
    status: Agent['status'];
    readonly metadata?: Record<string, any>;
    readonly preferredModel?: string;
    lastActive: number;
    readonly createdAt: number;
    protected openAIClient: OpenAIClient;
    protected sharedState: SharedStateManager;
    protected logger: Logger;
    protected isInitialized: boolean;
    /**
     * Constructs a new AbstractAgent.
     * @param options - Configuration options for the agent.
     */
    constructor(options: AbstractAgentOptions);
    /**
     * Initializes the agent, setting its status to 'available' and registering in shared state.
     * @returns True if initialization was successful, false otherwise.
     */
    initialize(): Promise<boolean>;
    /**
     * Optional hook for subclasses to perform specific initialization logic.
     */
    protected onInitialize(): Promise<void>;
    /**
     * Updates the agent's status and last active time, both locally and in shared state.
     * @param newStatus - The new status for the agent.
     */
    updateStatus(newStatus: Agent['status']): void;
    /**
     * Provides the agent's core information.
     * @returns An object containing the agent's properties.
     */
    getAgentInfo(): Agent;
    /**
     * Updates the agent's representation in the SharedStateManager.
     * @param updates - An object containing the fields to update.
     */
    protected updateSharedState(updates: Partial<Agent>): void;
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
    shutdown(): Promise<boolean>;
    /**
     * Optional hook for subclasses to perform specific cleanup logic during shutdown.
     */
    protected onShutdown(): Promise<void>;
}
//# sourceMappingURL=AbstractAgent.d.ts.map