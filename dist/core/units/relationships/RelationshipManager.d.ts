/**
 * RelationshipManager Module
 *
 * Manages relationships between organizational units
 */
import { OrganizationalUnit, RelationshipType, UnitRelationship, RelationshipConfig } from '../UnitInterface';
/**
 * RelationshipManager class for handling unit relationships
 */
export declare class RelationshipManager {
    private relationships;
    private unitCache;
    private logger;
    /**
     * Create a new RelationshipManager
     * @param logger - Logger instance (defaults to console)
     */
    constructor(logger?: Console);
    /**
     * Initialize the manager with a set of units
     * @param units - Array of organizational units
     */
    initializeWithUnits(units: OrganizationalUnit[]): void;
    /**
     * Load existing relationships
     * @param relationships - Array of relationships to load
     */
    loadRelationships(relationships: UnitRelationship[]): void;
    /**
     * Create a new relationship between units
     * @param config - Relationship configuration
     * @returns Created relationship
     */
    createRelationship(config: RelationshipConfig): UnitRelationship;
    /**
     * Delete a relationship
     * @param relationshipId - ID of the relationship to delete
     * @returns Boolean indicating success
     */
    deleteRelationship(relationshipId: string): boolean;
    /**
     * Get a relationship by ID
     * @param relationshipId - ID of the relationship to get
     * @returns Relationship or null if not found
     */
    getRelationship(relationshipId: string): UnitRelationship | null;
    /**
     * Get all relationships
     * @returns Array of all relationships
     */
    getAllRelationships(): UnitRelationship[];
    /**
     * Find relationships by source unit
     * @param sourceUnitId - Source unit ID
     * @param type - Optional relationship type filter
     * @returns Array of relationships
     */
    findRelationshipsBySource(sourceUnitId: string, type?: RelationshipType | string): UnitRelationship[];
    /**
     * Find relationships by target unit
     * @param targetUnitId - Target unit ID
     * @param type - Optional relationship type filter
     * @returns Array of relationships
     */
    findRelationshipsByTarget(targetUnitId: string, type?: RelationshipType | string): UnitRelationship[];
    /**
     * Find units related to a given unit
     * @param unitId - Unit ID
     * @param type - Optional relationship type filter
     * @returns Array of related units
     */
    findRelatedUnits(unitId: string, type?: RelationshipType | string): OrganizationalUnit[];
    /**
     * Find units in the hierarchy
     * @param unitId - Unit ID to start from
     * @param direction - 'up' for parents, 'down' for children, 'both' for both
     * @returns Array of hierarchy units
     */
    findHierarchyUnits(unitId: string, direction?: 'up' | 'down' | 'both'): OrganizationalUnit[];
}
