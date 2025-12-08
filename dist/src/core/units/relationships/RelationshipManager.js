"use strict";
/**
 * RelationshipManager Module
 *
 * Manages relationships between organizational units
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipManager = exports.PermissionLevel = exports.RelationshipType = void 0;
const uuid_1 = require("uuid");
const EventSystem_1 = require("../../events/EventSystem");
const StorageSystem_1 = require("../../storage/StorageSystem");
/**
 * Relationship types between organizational units
 */
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["HIERARCHY"] = "hierarchy";
    RelationshipType["PEER"] = "peer";
    RelationshipType["ADVISOR"] = "advisor";
    RelationshipType["SUPERVISOR"] = "supervisor";
    RelationshipType["DELEGATE"] = "delegate";
    RelationshipType["COLLABORATOR"] = "collaborator";
    RelationshipType["SERVICE_PROVIDER"] = "service_provider";
    RelationshipType["CUSTOM"] = "custom";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
/**
 * Permission level in a relationship
 */
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["NONE"] = "none";
    PermissionLevel["READ"] = "read";
    PermissionLevel["WRITE"] = "write";
    PermissionLevel["EXECUTE"] = "execute";
    PermissionLevel["ADMIN"] = "admin";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
/**
 * RelationshipManager class for handling unit relationships
 */
class RelationshipManager {
    /**
     * Get the singleton instance
     * @param logger - Logger instance
     * @returns RelationshipManager instance
     */
    static getInstance(logger = console) {
        if (!RelationshipManager.instance) {
            RelationshipManager.instance = new RelationshipManager(logger);
        }
        return RelationshipManager.instance;
    }
    /**
     * Create a new RelationshipManager
     * @param logger - Logger instance (defaults to console)
     */
    constructor(logger = console) {
        Object.defineProperty(this, "relationships", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unitCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.relationships = new Map();
        this.unitCache = new Map();
        this.logger = logger;
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.storageSystem = StorageSystem_1.StorageSystem.getInstance();
        // Initialize from storage if available
        this.loadFromStorage();
    }
    /**
     * Initialize the manager with a set of units
     * @param units - Array of organizational units
     */
    initializeWithUnits(units) {
        this.unitCache = new Map(units.map(unit => [unit.id, unit]));
        this.saveToStorage();
    }
    /**
     * Add a single unit
     * @param unit - Unit to add
     */
    addUnit(unit) {
        this.unitCache.set(unit.id, unit);
        this.saveToStorage();
        this.eventSystem.emit('relationships:unit:added', { unit });
    }
    /**
     * Remove a unit and its relationships
     * @param unitId - ID of the unit to remove
     * @returns Boolean indicating success
     */
    removeUnit(unitId) {
        if (!this.unitCache.has(unitId)) {
            return false;
        }
        // Remove unit
        const unit = this.unitCache.get(unitId);
        this.unitCache.delete(unitId);
        // Remove relationships involving this unit
        const relationshipsToRemove = [];
        for (const [id, relationship] of this.relationships.entries()) {
            if (relationship.sourceUnitId === unitId || relationship.targetUnitId === unitId) {
                relationshipsToRemove.push(id);
            }
        }
        relationshipsToRemove.forEach(id => this.relationships.delete(id));
        this.saveToStorage();
        this.eventSystem.emit('relationships:unit:removed', { unitId });
        return true;
    }
    /**
     * Load existing relationships
     * @param relationships - Array of relationships to load
     */
    loadRelationships(relationships) {
        relationships.forEach(rel => {
            this.relationships.set(rel.id, rel);
        });
        this.saveToStorage();
        this.logger.log(`Loaded ${relationships.length} relationships`);
    }
    /**
     * Create a new relationship between units
     * @param config - Relationship configuration
     * @returns Created relationship
     */
    createRelationship(config) {
        // Validate units exist
        if (!this.unitCache.has(config.sourceUnitId)) {
            throw new Error(`Source unit ${config.sourceUnitId} does not exist`);
        }
        if (!this.unitCache.has(config.targetUnitId)) {
            throw new Error(`Target unit ${config.targetUnitId} does not exist`);
        }
        // Create relationship
        const relationship = {
            id: (0, uuid_1.v4)(),
            sourceUnitId: config.sourceUnitId,
            targetUnitId: config.targetUnitId,
            type: config.type,
            description: config.description,
            permissions: config.permissions || [],
            metadata: config.metadata || {}
        };
        this.relationships.set(relationship.id, relationship);
        // Create bidirectional relationship if specified
        if (config.bidirectional) {
            const bidirectionalRel = {
                id: (0, uuid_1.v4)(),
                sourceUnitId: config.targetUnitId,
                targetUnitId: config.sourceUnitId,
                type: config.type,
                description: config.description ? `Bidirectional: ${config.description}` : undefined,
                permissions: config.permissions || [],
                metadata: {
                    ...(config.metadata || {}),
                    bidirectionalPair: relationship.id
                }
            };
            this.relationships.set(bidirectionalRel.id, bidirectionalRel);
            // Update the original relationship metadata to reference its pair
            relationship.metadata = {
                ...relationship.metadata,
                bidirectionalPair: bidirectionalRel.id
            };
        }
        this.saveToStorage();
        this.logger.log(`Created relationship: ${relationship.type} from ${config.sourceUnitId} to ${config.targetUnitId}`);
        this.eventSystem.emit('relationships:created', { relationship });
        return relationship;
    }
    /**
     * Delete a relationship
     * @param relationshipId - ID of the relationship to delete
     * @returns Boolean indicating success
     */
    deleteRelationship(relationshipId) {
        if (!this.relationships.has(relationshipId)) {
            return false;
        }
        const relationship = this.relationships.get(relationshipId);
        // Check if this is part of a bidirectional pair
        if (relationship?.metadata?.bidirectionalPair) {
            const pairId = relationship.metadata.bidirectionalPair;
            if (this.relationships.has(pairId)) {
                this.relationships.delete(pairId);
            }
        }
        const result = this.relationships.delete(relationshipId);
        if (result) {
            this.saveToStorage();
            this.eventSystem.emit('relationships:deleted', { relationshipId });
        }
        return result;
    }
    /**
     * Get a relationship by ID
     * @param relationshipId - ID of the relationship to get
     * @returns Relationship or null if not found
     */
    getRelationship(relationshipId) {
        return this.relationships.get(relationshipId) || null;
    }
    /**
     * Get all relationships
     * @returns Array of all relationships
     */
    getAllRelationships() {
        return Array.from(this.relationships.values());
    }
    /**
     * Find relationships by source unit
     * @param sourceUnitId - Source unit ID
     * @param type - Optional relationship type filter
     * @returns Array of relationships
     */
    findRelationshipsBySource(sourceUnitId, type) {
        return Array.from(this.relationships.values())
            .filter(rel => rel.sourceUnitId === sourceUnitId && (!type || rel.type === type));
    }
    /**
     * Find relationships by target unit
     * @param targetUnitId - Target unit ID
     * @param type - Optional relationship type filter
     * @returns Array of relationships
     */
    findRelationshipsByTarget(targetUnitId, type) {
        return Array.from(this.relationships.values())
            .filter(rel => rel.targetUnitId === targetUnitId && (!type || rel.type === type));
    }
    /**
     * Find units related to a given unit
     * @param unitId - Unit ID
     * @param type - Optional relationship type filter
     * @returns Array of related units
     */
    findRelatedUnits(unitId, type) {
        const relatedUnitIds = new Set();
        // Find relationships where unit is source
        this.findRelationshipsBySource(unitId, type).forEach(rel => {
            relatedUnitIds.add(rel.targetUnitId);
        });
        // Find relationships where unit is target
        this.findRelationshipsByTarget(unitId, type).forEach(rel => {
            relatedUnitIds.add(rel.sourceUnitId);
        });
        // Map IDs to units
        return Array.from(relatedUnitIds)
            .map(id => this.unitCache.get(id))
            .filter((unit) => unit !== undefined);
    }
    /**
     * Query relationships based on criteria
     * @param options - Query options
     * @returns Array of matching relationships
     */
    queryRelationships(options) {
        let results = Array.from(this.relationships.values());
        // Filter by source unit
        if (options.sourceUnitId) {
            results = results.filter(rel => rel.sourceUnitId === options.sourceUnitId);
        }
        // Filter by target unit
        if (options.targetUnitId) {
            results = results.filter(rel => rel.targetUnitId === options.targetUnitId);
        }
        // Filter by type
        if (options.type) {
            results = results.filter(rel => rel.type === options.type);
        }
        // Filter by resource permission
        if (options.resourcePermission) {
            results = results.filter(rel => {
                if (!rel.permissions)
                    return false;
                return rel.permissions.some(perm => perm.resource === options.resourcePermission);
            });
        }
        // Filter by minimum permission level
        if (options.minPermissionLevel && options.resourcePermission) {
            results = results.filter(rel => {
                if (!rel.permissions)
                    return false;
                const perm = rel.permissions.find(p => p.resource === options.resourcePermission);
                if (!perm)
                    return false;
                const levelOrder = {
                    [PermissionLevel.NONE]: 0,
                    [PermissionLevel.READ]: 1,
                    [PermissionLevel.WRITE]: 2,
                    [PermissionLevel.EXECUTE]: 3,
                    [PermissionLevel.ADMIN]: 4
                };
                return levelOrder[perm.level] >= levelOrder[options.minPermissionLevel];
            });
        }
        return results;
    }
    /**
     * Set permissions for a relationship
     * @param relationshipId - Relationship ID
     * @param permissions - Array of permissions
     * @returns Updated relationship or null if not found
     */
    setPermissions(relationshipId, permissions) {
        const relationship = this.relationships.get(relationshipId);
        if (!relationship) {
            return null;
        }
        relationship.permissions = permissions;
        this.saveToStorage();
        this.eventSystem.emit('relationships:permissions:updated', {
            relationshipId,
            permissions
        });
        return relationship;
    }
    /**
     * Check if a unit has permission for a resource
     * @param sourceUnitId - Unit checking permission
     * @param targetUnitId - Unit that owns the resource
     * @param resource - Resource identifier
     * @param requiredLevel - Required permission level
     * @returns Boolean indicating if permission exists
     */
    hasPermission(sourceUnitId, targetUnitId, resource, requiredLevel) {
        // Check direct relationships
        const relationships = this.queryRelationships({
            sourceUnitId,
            targetUnitId,
            resourcePermission: resource,
            minPermissionLevel: requiredLevel
        });
        if (relationships.length > 0) {
            return true;
        }
        // Check hierarchy permissions (inheritance)
        return this.hasHierarchicalPermission(sourceUnitId, targetUnitId, resource, requiredLevel);
    }
    /**
     * Check if a unit has hierarchical permission for a resource
     * @param sourceUnitId - Unit checking permission
     * @param targetUnitId - Unit that owns the resource
     * @param resource - Resource identifier
     * @param requiredLevel - Required permission level
     * @returns Boolean indicating if permission exists
     */
    hasHierarchicalPermission(sourceUnitId, targetUnitId, resource, requiredLevel) {
        // Get hierarchical relationships for the source unit
        const hierarchyUnits = this.findHierarchyUnits(sourceUnitId, 'up');
        for (const unit of hierarchyUnits) {
            // Check if any parent unit has the required permission
            const hasPermission = this.hasPermission(unit.id, targetUnitId, resource, requiredLevel);
            if (hasPermission) {
                return true;
            }
        }
        return false;
    }
    /**
     * Find units in the hierarchy
     * @param unitId - Unit ID to start from
     * @param direction - 'up' for parents, 'down' for children, 'both' for both
     * @returns Array of hierarchy units
     */
    findHierarchyUnits(unitId, direction = 'both') {
        const hierarchyUnits = [];
        const processed = new Set();
        if (direction === 'up' || direction === 'both') {
            // Find parent units
            const parentRels = this.findRelationshipsByTarget(unitId, RelationshipType.HIERARCHY);
            for (const rel of parentRels) {
                const parent = this.unitCache.get(rel.sourceUnitId);
                if (parent && !processed.has(parent.id)) {
                    hierarchyUnits.push(parent);
                    processed.add(parent.id);
                    // Recursively add parents of parent
                    const grandparents = this.findHierarchyUnits(parent.id, 'up');
                    for (const gp of grandparents) {
                        if (!processed.has(gp.id)) {
                            hierarchyUnits.push(gp);
                            processed.add(gp.id);
                        }
                    }
                }
            }
        }
        if (direction === 'down' || direction === 'both') {
            // Find child units
            const childRels = this.findRelationshipsBySource(unitId, RelationshipType.HIERARCHY);
            for (const rel of childRels) {
                const child = this.unitCache.get(rel.targetUnitId);
                if (child && !processed.has(child.id)) {
                    hierarchyUnits.push(child);
                    processed.add(child.id);
                    // Recursively add children of child
                    const grandchildren = this.findHierarchyUnits(child.id, 'down');
                    for (const gc of grandchildren) {
                        if (!processed.has(gc.id)) {
                            hierarchyUnits.push(gc);
                            processed.add(gc.id);
                        }
                    }
                }
            }
        }
        return hierarchyUnits;
    }
    /**
     * Get all units
     * @returns Array of all units
     */
    getAllUnits() {
        return Array.from(this.unitCache.values());
    }
    /**
     * Update a relationship
     * @param relationshipId - Relationship ID
     * @param updates - Updates to apply
     * @returns Updated relationship or null if not found
     */
    updateRelationship(relationshipId, updates) {
        const relationship = this.relationships.get(relationshipId);
        if (!relationship) {
            return null;
        }
        // Apply updates
        Object.assign(relationship, updates);
        this.saveToStorage();
        this.eventSystem.emit('relationships:updated', { relationshipId, updates });
        return relationship;
    }
    /**
     * Save the current state to storage
     */
    saveToStorage() {
        const data = {
            units: Array.from(this.unitCache.values()),
            relationships: Array.from(this.relationships.values())
        };
        this.storageSystem.set('relationshipManager', data);
    }
    /**
     * Load state from storage
     */
    async loadFromStorage() {
        try {
            const data = await this.storageSystem.get('relationshipManager');
            if (data) {
                if (data.units) {
                    this.unitCache = new Map(data.units.map(unit => [unit.id, unit]));
                }
                if (data.relationships) {
                    this.relationships = new Map(data.relationships.map(rel => [rel.id, rel]));
                }
                this.logger.log(`Loaded ${this.unitCache.size} units and ${this.relationships.size} relationships from storage`);
            }
        }
        catch (error) {
            this.logger.error('Error loading relationship data from storage:', error);
        }
    }
}
exports.RelationshipManager = RelationshipManager;
//# sourceMappingURL=RelationshipManager.js.map