import { Agent, AgentFilter, AgentStatus, Capability } from './types';
import { Agent as AgentType } from '../../agents/types';
import { SharedStateManager } from './SharedStateManager';
import { AgentRegistry as IAgentRegistry } from './interfaces/AgentRegistry';
/**
 * Implementation of the AgentRegistry
 * Manages agent registration, updates, and querying
 */
export declare class AgentRegistry implements IAgentRegistry {
    private static instance;
    private agents;
    private capabilityIndex;
    private stateManager;
    id: string;
    name: string;
    type: string;
    description: string;
    capabilities: Capability[];
    status: any;
    metadata: Record<string, unknown>;
    preferredModel: string;
    createdAt: number;
    lastActive: number;
    sharedStateManager: any;
    taskManager: any;
    openAIClient: any;
    promptManager: any;
    executionConfig: any;
    /**
     * Get the singleton instance of AgentRegistry
     * @returns AgentRegistry instance
     */
    static getInstance(): AgentRegistry;
    /**
     * Constructor initializes registry and required properties
     * @param stateManager Optional SharedStateManager instance
     */
    constructor(stateManager?: SharedStateManager);
    /**
     * Register a new agent
     * @param agent Agent data
     * @returns True if successful
     */
    registerAgent(agent: Agent): Promise<boolean>;
    /**
     * Unregister an agent
     * @param agentId Agent ID
     * @returns True if successful
     */
    unregisterAgent(agentId: string): Promise<boolean>;
    /**
     * Update an agent
     * @param agentId Agent ID
     * @param updates Partial agent data for updates
     * @returns True if successful
     */
    updateAgent(agentId: string, updates: Partial<Agent>): Promise<boolean>;
    /**
     * Get an agent by ID
     * @param agentId Agent ID
     * @returns Agent if found, null otherwise
     */
    getAgent(agentId: string): Promise<Agent | null>;
    /**
     * List agents with optional filtering
     * @param filter Optional filter
     * @returns Array of agents
     */
    listAgents(filter?: AgentFilter): Promise<AgentType[]>;
    /**
     * Convert Agent to AgentType
     * @param agent Agent object
     * @returns AgentType object
     */
    private convertToAgentType;
    /**
     * Update agent capabilities
     * @param agentId Agent ID
     * @param capabilities New capabilities
     * @returns Success status
     */
    updateAgentCapabilities(agentId: string, capabilities: Capability[]): Promise<boolean>;
    /**
     * Update agent status
     * @param agentId Agent ID
     * @param status New status
     * @returns Success status
     */
    updateAgentStatus(agentId: string, status: AgentStatus): Promise<boolean>;
    /**
     * Get agent status
     * @param agentId Agent ID
     * @returns Agent status or null
     */
    getAgentStatus(agentId: string): Promise<AgentStatus | null>;
    /**
     * Check if agent is available
     * @param agentId Agent ID
     * @returns Availability status
     */
    isAgentAvailable(agentId: string): Promise<boolean>;
    /**
     * Validate agent data
     * @param agent Agent to validate
     * @returns Validation result
     */
    private validateAgent;
    /**
     * Index agent capabilities
     * @param agent Agent to index
     */
    private indexCapabilities;
    /**
     * Remove agent from capabilities index
     * @param agent Agent to remove
     */
    private removeFromCapabilitiesIndex;
    /**
     * Get agents by capability
     * @param capability Capability name to filter by
     * @param minLevel Optional minimum capability level (Note: Capability type has no level, this param is unused)
     * @returns Agents with the specified capability
     */
    getAgentsByCapability(capability: string, minLevel?: number): Promise<Agent[]>;
    /**
     * Get the total number of registered agents
     * @returns Total agent count
     */
    getAgentCount(): Promise<number>;
    /**
     * Get agents by current state
     * @param state State to filter by
     * @returns Agents in the specified state
     */
    getAgentsByState(state: AgentStatus['state']): Promise<Agent[]>;
    /**
     * Find agents with a specific capability
     * @param capability The capability to look for
     * @returns Array of agents with the specified capability
     */
    findAgentsByCapability(capability: string): Promise<Agent[]>;
    /**
     * Get the count of agents by status
     * @returns Object with counts for each status state
     */
    getAgentCountsByStatus(): Promise<Record<AgentStatus['state'], number>>;
    /**
     * Get the count of agents by type
     * @returns Object with counts for each type
     */
    getAgentCountsByType(): Promise<Record<string, number>>;
    /**
     * Get all available capabilities across all agents
     * @returns Array of unique capabilities
     */
    getAvailableCapabilities(): Promise<string[]>;
    /**
     * Clear all agents from the registry
     */
    clear(): Promise<void>;
    /**
     * Find agents by type
     * @param type Agent type to search for
     * @returns Array of agents of the specified type
     */
    findAgentsByType(type: string): Promise<AgentType[]>;
    /**
     * Get capabilities for a specific agent
     * @param agentId Agent ID
     * @returns Array of capabilities
     */
    getAgentCapabilities(agentId: string): Promise<string[]>;
}
//# sourceMappingURL=AgentRegistry.d.ts.map