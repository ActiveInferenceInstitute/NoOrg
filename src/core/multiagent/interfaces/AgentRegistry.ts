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
} 