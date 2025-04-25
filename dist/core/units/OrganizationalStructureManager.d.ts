/**
 * Implementation of the Organizational Structure Manager
 *
 * This class provides functionality for managing organizational units
 * and their relationships for multiagent compositions.
 */
import { OrganizationalStructureManager, OrganizationalUnit, UnitConfig, UnitRelationship } from './UnitInterface';
export declare class DefaultOrganizationalStructureManager implements OrganizationalStructureManager {
    private units;
    private relationships;
    constructor();
    /**
     * Create a new organizational unit
     */
    createUnit(config: UnitConfig): Promise<string>;
    /**
     * Get unit by ID
     */
    getUnit(unitId: string): Promise<OrganizationalUnit>;
    /**
     * Update an existing unit
     */
    updateUnit(unitId: string, updates: Partial<UnitConfig>): Promise<OrganizationalUnit>;
    /**
     * Delete a unit
     */
    deleteUnit(unitId: string): Promise<boolean>;
    /**
     * Assign an agent to a unit
     */
    assignAgentToUnit(unitId: string, agentId: string): Promise<boolean>;
    /**
     * Remove an agent from a unit
     */
    removeAgentFromUnit(unitId: string, agentId: string): Promise<boolean>;
    /**
     * Assign a task to a unit
     */
    assignTaskToUnit(unitId: string, taskId: string): Promise<boolean>;
    /**
     * Remove a task from a unit
     */
    removeTaskFromUnit(unitId: string, taskId: string): Promise<boolean>;
    /**
     * Create a relationship between units
     */
    createUnitRelationship(sourceUnitId: string, targetUnitId: string, type: UnitRelationship['type'], description?: string): Promise<string>;
    /**
     * Get relationships for a unit
     */
    getUnitRelationships(unitId: string): Promise<UnitRelationship[]>;
    /**
     * Delete a relationship
     */
    deleteUnitRelationship(relationshipId: string): Promise<boolean>;
    /**
     * Get all units
     */
    getAllUnits(): Promise<OrganizationalUnit[]>;
    /**
     * Get child units
     */
    getChildUnits(unitId: string): Promise<OrganizationalUnit[]>;
    /**
     * Get parent unit
     */
    getParentUnit(unitId: string): Promise<OrganizationalUnit | null>;
    /**
     * Initialize from existing organizational structure
     */
    initializeFromDirectoryStructure(directoryPath: string): Promise<void>;
    /**
     * Load units from a JSON configuration
     */
    loadFromConfig(config: {
        units: UnitConfig[];
        relationships: any[];
    }): Promise<void>;
}
