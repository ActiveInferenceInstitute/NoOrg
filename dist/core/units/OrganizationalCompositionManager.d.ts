/**
 * Implementation of the Organizational Composition Manager
 *
 * This class provides functionality for managing compositions of organizational units
 * for multiagent deployments and workflows.
 */
import { OrganizationalComposition, OrganizationalCompositionManager, OrganizationalStructureManager } from './UnitInterface';
export declare class DefaultOrganizationalCompositionManager implements OrganizationalCompositionManager {
    private compositions;
    private structureManager;
    constructor(structureManager: OrganizationalStructureManager);
    /**
     * Create a new organizational composition
     */
    createComposition(name: string, description: string, unitIds: string[]): Promise<string>;
    /**
     * Get composition by ID
     */
    getComposition(compositionId: string): Promise<OrganizationalComposition>;
    /**
     * Update an existing composition
     */
    updateComposition(compositionId: string, updates: Partial<OrganizationalComposition>): Promise<OrganizationalComposition>;
    /**
     * Delete a composition
     */
    deleteComposition(compositionId: string): Promise<boolean>;
    /**
     * Add a unit to a composition
     */
    addUnitToComposition(compositionId: string, unitId: string): Promise<boolean>;
    /**
     * Remove a unit from a composition
     */
    removeUnitFromComposition(compositionId: string, unitId: string): Promise<boolean>;
    /**
     * Get all compositions
     */
    getAllCompositions(): Promise<OrganizationalComposition[]>;
    /**
     * Get compositions containing a specific unit
     */
    getCompositionsForUnit(unitId: string): Promise<OrganizationalComposition[]>;
    /**
     * Clone a composition
     */
    cloneComposition(compositionId: string, newName: string): Promise<string>;
    /**
     * Export a composition to JSON
     */
    exportComposition(compositionId: string): Promise<string>;
    /**
     * Import a composition from JSON
     */
    importComposition(json: string): Promise<string>;
}
