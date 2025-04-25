"use strict";
/**
 * RelationshipManager Module
 *
 * Manages relationships between organizational units
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipManager = void 0;
const uuid_1 = require("uuid");
const UnitInterface_1 = require("../UnitInterface");
/**
 * RelationshipManager class for handling unit relationships
 */
class RelationshipManager {
    /**
     * Create a new RelationshipManager
     * @param logger - Logger instance (defaults to console)
     */
    constructor(logger = console) {
        this.relationships = new Map();
        this.unitCache = new Map();
        this.logger = logger;
    }
    /**
     * Initialize the manager with a set of units
     * @param units - Array of organizational units
     */
    initializeWithUnits(units) {
        this.unitCache = new Map(units.map(unit => [unit.id, unit]));
    }
    /**
     * Load existing relationships
     * @param relationships - Array of relationships to load
     */
    loadRelationships(relationships) {
        relationships.forEach(rel => {
            this.relationships.set(rel.id, rel);
        });
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
            metadata: config.metadata || {}
        };
        this.relationships.set(relationship.id, relationship);
        this.logger.log(`Created relationship: ${relationship.type} from ${config.sourceUnitId} to ${config.targetUnitId}`);
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
        return this.relationships.delete(relationshipId);
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
     * Find units in the hierarchy
     * @param unitId - Unit ID to start from
     * @param direction - 'up' for parents, 'down' for children, 'both' for both
     * @returns Array of hierarchy units
     */
    findHierarchyUnits(unitId, direction = 'both') {
        const hierarchyUnits = [];
        if (direction === 'up' || direction === 'both') {
            // Find parent units
            const parentRels = this.findRelationshipsByTarget(unitId, UnitInterface_1.RelationshipType.HIERARCHY);
            for (const rel of parentRels) {
                const parent = this.unitCache.get(rel.sourceUnitId);
                if (parent) {
                    hierarchyUnits.push(parent);
                    // Recursively add parents of parent
                    const grandparents = this.findHierarchyUnits(parent.id, 'up');
                    hierarchyUnits.push(...grandparents);
                }
            }
        }
        if (direction === 'down' || direction === 'both') {
            // Find child units
            const childRels = this.findRelationshipsBySource(unitId, UnitInterface_1.RelationshipType.HIERARCHY);
            for (const rel of childRels) {
                const child = this.unitCache.get(rel.targetUnitId);
                if (child) {
                    hierarchyUnits.push(child);
                    // Recursively add children of child
                    const grandchildren = this.findHierarchyUnits(child.id, 'down');
                    hierarchyUnits.push(...grandchildren);
                }
            }
        }
        return hierarchyUnits;
    }
}
exports.RelationshipManager = RelationshipManager;
//# sourceMappingURL=RelationshipManager.js.map