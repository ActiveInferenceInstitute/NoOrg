/**
 * UnitAgentFactory module
 *
 * Creates agents from organizational units, with integrated capabilities and context.
 */
import { OrganizationalUnit } from '../UnitInterface';
import { Agent } from '../../../agents/types';
import { RelationshipManager } from '../relationships/RelationshipManager';
/**
 * Configuration for agent creation
 */
export interface UnitAgentConfig {
    defaultModel?: string;
    defaultCapabilities?: string[];
    includeUnitContext?: boolean;
}
/**
 * UnitAgentFactory class
 * Creates and configures agents based on organizational units
 */
export declare class UnitAgentFactory {
    private relationshipManager?;
    private logger;
    private config;
    /**
     * Create a new UnitAgentFactory
     * @param relationshipManager - Optional relationship manager for context enhancement
     * @param config - Configuration options
     * @param logger - Logger instance
     */
    constructor(relationshipManager?: RelationshipManager, config?: UnitAgentConfig, logger?: Console);
    /**
     * Create agents for a set of organizational units
     * @param units - Array of organizational units
     * @returns Array of created agents
     */
    createAgentsForUnits(units: OrganizationalUnit[]): Agent[];
    /**
     * Create an agent for a specific organizational unit
     * @param unit - Organizational unit
     * @returns Created agent
     */
    createAgentForUnit(unit: OrganizationalUnit): Agent;
    /**
     * Generate a system prompt for the agent based on organizational unit
     * @param unit - Organizational unit
     * @returns System prompt string
     */
    generateUnitAgentSystemPrompt(unit: OrganizationalUnit): string;
    /**
     * Generate a user message prompt template for agent
     * @param unit - Organizational unit
     * @returns User message template
     */
    generateUnitAgentUserPrompt(unit: OrganizationalUnit): string;
    /**
     * Normalize a unit name into an agent type string
     * @param unitName - Name of the unit
     * @returns Normalized agent type
     */
    private normalizeUnitTypeForAgent;
}
