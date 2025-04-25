/**
 * Implementation of the Organizational Structure Manager
 * 
 * This class provides functionality for managing organizational units 
 * and their relationships for multiagent compositions.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  OrganizationalStructureManager,
  OrganizationalUnit,
  UnitConfig,
  UnitRelationship
} from './UnitInterface';

export class DefaultOrganizationalStructureManager implements OrganizationalStructureManager {
  private units: Map<string, OrganizationalUnit>;
  private relationships: Map<string, UnitRelationship>;
  
  constructor() {
    this.units = new Map();
    this.relationships = new Map();
  }
  
  /**
   * Create a new organizational unit
   */
  async createUnit(config: UnitConfig): Promise<string> {
    const id = uuidv4();
    
    const unit: OrganizationalUnit = {
      id,
      name: config.name,
      description: config.description,
      capabilities: config.capabilities || [],
      parentId: config.parent,
    };
    
    this.units.set(id, unit);
    
    return id;
  }
  
  /**
   * Get unit by ID
   */
  async getUnit(unitId: string): Promise<OrganizationalUnit> {
    const unit = this.units.get(unitId);
    if (!unit) {
      throw new Error(`Unit with ID ${unitId} not found`);
    }
    return unit;
  }
  
  /**
   * Update an existing unit
   */
  async updateUnit(unitId: string, updates: Partial<UnitConfig>): Promise<OrganizationalUnit> {
    const unit = await this.getUnit(unitId);
    
    // Apply updates
    if (updates.name !== undefined) unit.name = updates.name;
    if (updates.description !== undefined) unit.description = updates.description;
    if (updates.capabilities !== undefined) unit.capabilities = updates.capabilities;
    
    // Handle parent changes
    if (updates.parent !== undefined && updates.parent !== unit.parentId) {
      unit.parentId = updates.parent;
    }
    
    // Save updated unit
    this.units.set(unitId, unit);
    
    return unit;
  }
  
  /**
   * Delete a unit
   */
  async deleteUnit(unitId: string): Promise<boolean> {
    const unit = await this.getUnit(unitId);
    
    const children = Array.from(this.units.values()).filter(u => u.parentId === unitId);
    if (children.length > 0) {
       const childIds = children.map(c => c.id);
       throw new Error(`Cannot delete unit ${unitId} as it is the parent of other units: ${childIds.join(', ')}`);
    }
    
    // Delete relationships involving this unit
    for (const [relationshipId, relationship] of this.relationships.entries()) {
      if (relationship.sourceUnitId === unitId || relationship.targetUnitId === unitId) {
        this.relationships.delete(relationshipId);
      }
    }
    
    // Delete the unit
    return this.units.delete(unitId);
  }
  
  /**
   * Assign an agent to a unit
   */
  async assignAgentToUnit(unitId: string, agentId: string): Promise<boolean> {
    const unit = await this.getUnit(unitId);
    
    console.warn(`assignAgentToUnit is called, but OrganizationalUnit interface has no 'agents'. Agent assignment logic should be handled elsewhere for unit ${unitId} and agent ${agentId}.`);
    
    return true;
  }
  
  /**
   * Remove an agent from a unit
   */
  async removeAgentFromUnit(unitId: string, agentId: string): Promise<boolean> {
    const unit = await this.getUnit(unitId);
    
    console.warn(`removeAgentFromUnit is called, but OrganizationalUnit interface has no 'agents'. Agent removal logic should be handled elsewhere for unit ${unitId} and agent ${agentId}.`);
    
    return true;
  }
  
  /**
   * Assign a task to a unit
   */
  async assignTaskToUnit(unitId: string, taskId: string): Promise<boolean> {
    const unit = await this.getUnit(unitId);
    
    console.warn(`assignTaskToUnit is called, but OrganizationalUnit interface has no 'tasks'. Task assignment logic should be handled elsewhere for unit ${unitId} and task ${taskId}.`);

    return true;
  }
  
  /**
   * Remove a task from a unit
   */
  async removeTaskFromUnit(unitId: string, taskId: string): Promise<boolean> {
    const unit = await this.getUnit(unitId);
    
    console.warn(`removeTaskFromUnit is called, but OrganizationalUnit interface has no 'tasks'. Task removal logic should be handled elsewhere for unit ${unitId} and task ${taskId}.`);
    
    return true;
  }
  
  /**
   * Create a relationship between units
   */
  async createUnitRelationship(
    sourceUnitId: string, 
    targetUnitId: string, 
    type: UnitRelationship['type'], 
    description?: string
  ): Promise<string> {
    // Verify both units exist
    await this.getUnit(sourceUnitId);
    await this.getUnit(targetUnitId);
    
    const relationshipId = uuidv4();
    const relationship: UnitRelationship = {
      id: relationshipId,
      sourceUnitId,
      targetUnitId,
      type,
      description,
    };
    
    this.relationships.set(relationshipId, relationship);
    
    return relationshipId;
  }
  
  /**
   * Get relationships for a unit
   */
  async getUnitRelationships(unitId: string): Promise<UnitRelationship[]> {
    // Verify unit exists
    await this.getUnit(unitId);
    
    return Array.from(this.relationships.values()).filter(
      relationship => relationship.sourceUnitId === unitId || relationship.targetUnitId === unitId
    );
  }
  
  /**
   * Delete a relationship
   */
  async deleteUnitRelationship(relationshipId: string): Promise<boolean> {
    if (!this.relationships.has(relationshipId)) {
      throw new Error(`Relationship with ID ${relationshipId} not found`);
    }
    
    return this.relationships.delete(relationshipId);
  }
  
  /**
   * Get all units
   */
  async getAllUnits(): Promise<OrganizationalUnit[]> {
    return Array.from(this.units.values());
  }
  
  /**
   * Get child units
   */
  async getChildUnits(unitId: string): Promise<OrganizationalUnit[]> {
    // Verify unit exists
    await this.getUnit(unitId);
    
    return Array.from(this.units.values()).filter(u => u.parentId === unitId);
  }
  
  /**
   * Get parent unit
   */
  async getParentUnit(unitId: string): Promise<OrganizationalUnit | null> {
    const unit = await this.getUnit(unitId);
    
    if (!unit.parentId) {
      return null;
    }
    
    return this.units.get(unit.parentId) || null;
  }
  
  /**
   * Initialize from existing organizational structure
   */
  async initializeFromDirectoryStructure(directoryPath: string): Promise<void> {
    // This method would read from a directory structure (like units/)
    // and create units based on the directory structure
    // For a real implementation, this would require file system access
    
    // Example:
    // - Read directories from the specified path
    // - Create a unit for each directory
    // - Set up parent-child relationships based on directory structure
    // - Read metadata from configuration files in each directory
    
    // For this skeleton implementation, we'll just do nothing
    return;
  }
  
  /**
   * Load units from a JSON configuration
   */
  async loadFromConfig(config: {units: UnitConfig[], relationships: any[]}): Promise<void> {
    // Clear existing units and relationships
    this.units.clear();
    this.relationships.clear();
    
    // Create all units first
    for (const unitConfig of config.units) {
      await this.createUnit(unitConfig);
    }
    
    // Then create relationships
    if (config.relationships) {
      for (const rel of config.relationships) {
        await this.createUnitRelationship(
          rel.sourceUnitId,
          rel.targetUnitId,
          rel.type,
          rel.description
        );
      }
    }
  }
} 