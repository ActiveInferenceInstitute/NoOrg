import { Agent, AgentFilter } from '../types';
import { Agent as AgentType } from '../../../agents/types';
/**
 * Interface for the AgentRegistry
 * Defines methods for managing agents in the system
 */
export interface AgentRegistry {
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
     * Find agents by capability
     * @param capability Capability to search for
     * @returns Array of agents with the specified capability
     */
    findAgentsByCapability(capability: string): Promise<AgentType[]>;
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