/**
 * Core interfaces for organizational units
 *
 * This file defines the fundamental types and interfaces for working with
 * organizational units in a multi-agent system.
 */
/**
 * Represents an organizational unit with its core properties
 */
export interface OrganizationalUnit {
    id: string;
    name: string;
    description: string;
    path?: string;
    parentId?: string | null;
    capabilities: string[];
    metadata?: Record<string, any>;
}
/**
 * Configuration for creating a new organizational unit
 */
export interface UnitConfig {
    name: string;
    description: string;
    capabilities: string[];
    parent?: string;
    metadata?: Record<string, any>;
}
/**
 * Types of relationships between organizational units
 */
export declare enum RelationshipType {
    HIERARCHY = "hierarchy",
    COLLABORATION = "collaboration",
    ADVISORY = "advisory",
    SERVICE = "service",
    REPORTING = "reporting",
    LINK = "link"
}
/**
 * Represents a relationship between two organizational units
 */
export interface UnitRelationship {
    id: string;
    sourceUnitId: string;
    targetUnitId: string;
    type: RelationshipType | string;
    description: string;
    metadata?: Record<string, any>;
}
/**
 * Configuration for creating a unit relationship
 */
export interface RelationshipConfig {
    sourceUnitId: string;
    targetUnitId: string;
    type: RelationshipType | string;
    description: string;
    metadata?: Record<string, any>;
}
/**
 * Workflow phase configuration for units
 */
export interface UnitWorkflowPhase {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    leadUnitId: string;
    participatingUnitIds: string[];
    outputType?: string;
    metadata?: Record<string, any>;
}
/**
 * Workflow for organizational units
 */
export interface UnitWorkflow {
    id: string;
    name: string;
    description: string;
    planningPhase?: UnitWorkflowPhase;
    executionPhase?: UnitWorkflowPhase;
    collaborations: UnitCollaboration[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    metadata?: Record<string, any>;
}
/**
 * Represents a collaboration between units in a workflow
 */
export interface UnitCollaboration {
    phase: string;
    units: string[];
    outputType?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
/**
 * Organizational structure manager interface
 */
export interface OrganizationalStructureManager {
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
}
/**
 * Represents a composition of agents based on organizational structure
 */
export interface OrganizationalComposition {
    id: string;
    name: string;
    description: string;
    units: string[];
    agents: string[];
    tasks: string[];
    status: 'draft' | 'active' | 'completed' | 'archived';
    metadata: Record<string, any>;
    createdAt: number;
    updatedAt: number;
}
/**
 * Interface for managing organizational compositions
 */
export interface OrganizationalCompositionManager {
    /**
     * Create a new composition
     */
    createComposition(name: string, description: string, unitIds: string[]): Promise<string>;
    /**
     * Get a composition by ID
     */
    getComposition(compositionId: string): Promise<OrganizationalComposition>;
    /**
     * Update a composition
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
}
