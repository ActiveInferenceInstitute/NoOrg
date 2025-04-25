/**
 * RelationshipManager Module
 *
 * Manages relationships between organizational units
 */
/**
 * Relationship types between organizational units
 */
export declare enum RelationshipType {
    HIERARCHY = "hierarchy",
    PEER = "peer",
    ADVISOR = "advisor",
    SUPERVISOR = "supervisor",
    DELEGATE = "delegate",
    COLLABORATOR = "collaborator",
    SERVICE_PROVIDER = "service_provider",
    CUSTOM = "custom"
}
/**
 * Permission level in a relationship
 */
export declare enum PermissionLevel {
    NONE = "none",
    READ = "read",
    WRITE = "write",
    EXECUTE = "execute",
    ADMIN = "admin"
}
/**
 * Permission definition for a resource
 */
export interface ResourcePermission {
    resource: string;
    level: PermissionLevel;
    conditions?: Record<string, any>;
}
/**
 * Organizational unit interface
 */
export interface OrganizationalUnit {
    id: string;
    name: string;
    type: string;
    description?: string;
    metadata?: Record<string, any>;
}
/**
 * Relationship configuration
 */
export interface RelationshipConfig {
    sourceUnitId: string;
    targetUnitId: string;
    type: RelationshipType | string;
    description?: string;
    bidirectional?: boolean;
    permissions?: ResourcePermission[];
    metadata?: Record<string, any>;
}
/**
 * Unit relationship
 */
export interface UnitRelationship {
    id: string;
    sourceUnitId: string;
    targetUnitId: string;
    type: RelationshipType | string;
    description?: string;
    permissions?: ResourcePermission[];
    metadata?: Record<string, any>;
}
/**
 * Relationship query options
 */
export interface RelationshipQueryOptions {
    sourceUnitId?: string;
    targetUnitId?: string;
    type?: RelationshipType | string;
    resourcePermission?: string;
    minPermissionLevel?: PermissionLevel;
}
/**
 * RelationshipManager class for handling unit relationships
 */
export declare class RelationshipManager {
    private relationships;
    private unitCache;
    private logger;
    private eventSystem;
    private storageSystem;
    private static instance;
    /**
     * Get the singleton instance
     * @param logger - Logger instance
     * @returns RelationshipManager instance
     */
    static getInstance(logger?: Console): RelationshipManager;
    /**
     * Create a new RelationshipManager
     * @param logger - Logger instance (defaults to console)
     */
    private constructor();
    /**
     * Initialize the manager with a set of units
     * @param units - Array of organizational units
     */
    initializeWithUnits(units: OrganizationalUnit[]): void;
    /**
     * Add a single unit
     * @param unit - Unit to add
     */
    addUnit(unit: OrganizationalUnit): void;
    /**
     * Remove a unit and its relationships
     * @param unitId - ID of the unit to remove
     * @returns Boolean indicating success
     */
    removeUnit(unitId: string): boolean;
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
     * Query relationships based on criteria
     * @param options - Query options
     * @returns Array of matching relationships
     */
    queryRelationships(options: RelationshipQueryOptions): UnitRelationship[];
    /**
     * Set permissions for a relationship
     * @param relationshipId - Relationship ID
     * @param permissions - Array of permissions
     * @returns Updated relationship or null if not found
     */
    setPermissions(relationshipId: string, permissions: ResourcePermission[]): UnitRelationship | null;
    /**
     * Check if a unit has permission for a resource
     * @param sourceUnitId - Unit checking permission
     * @param targetUnitId - Unit that owns the resource
     * @param resource - Resource identifier
     * @param requiredLevel - Required permission level
     * @returns Boolean indicating if permission exists
     */
    hasPermission(sourceUnitId: string, targetUnitId: string, resource: string, requiredLevel: PermissionLevel): boolean;
    /**
     * Check if a unit has hierarchical permission for a resource
     * @param sourceUnitId - Unit checking permission
     * @param targetUnitId - Unit that owns the resource
     * @param resource - Resource identifier
     * @param requiredLevel - Required permission level
     * @returns Boolean indicating if permission exists
     */
    private hasHierarchicalPermission;
    /**
     * Find units in the hierarchy
     * @param unitId - Unit ID to start from
     * @param direction - 'up' for parents, 'down' for children, 'both' for both
     * @returns Array of hierarchy units
     */
    findHierarchyUnits(unitId: string, direction?: 'up' | 'down' | 'both'): OrganizationalUnit[];
    /**
     * Get all units
     * @returns Array of all units
     */
    getAllUnits(): OrganizationalUnit[];
    /**
     * Update a relationship
     * @param relationshipId - Relationship ID
     * @param updates - Updates to apply
     * @returns Updated relationship or null if not found
     */
    updateRelationship(relationshipId: string, updates: Partial<Omit<UnitRelationship, 'id' | 'sourceUnitId' | 'targetUnitId'>>): UnitRelationship | null;
    /**
     * Save the current state to storage
     */
    private saveToStorage;
    /**
     * Load state from storage
     */
    private loadFromStorage;
}
