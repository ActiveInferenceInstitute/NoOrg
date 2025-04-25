/**
 * Implementation of the Organizational Composition Manager
 * 
 * This class provides functionality for managing compositions of organizational units
 * for multiagent deployments and workflows.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  OrganizationalComposition, 
  OrganizationalCompositionManager,
  OrganizationalStructureManager
} from './UnitInterface';

export class DefaultOrganizationalCompositionManager implements OrganizationalCompositionManager {
  private compositions: Map<string, OrganizationalComposition>;
  private structureManager: OrganizationalStructureManager;
  
  constructor(structureManager: OrganizationalStructureManager) {
    this.compositions = new Map();
    this.structureManager = structureManager;
  }
  
  /**
   * Create a new organizational composition
   */
  async createComposition(
    name: string, 
    description: string, 
    unitIds: string[]
  ): Promise<string> {
    // Validate that all units exist
    for (const unitId of unitIds) {
      await this.structureManager.getUnit(unitId);
    }
    
    const id = uuidv4();
    const timestamp = Date.now();
    
    const composition: OrganizationalComposition = {
      id,
      name,
      description,
      units: unitIds,
      agents: [],
      tasks: [],
      status: 'draft',
      metadata: {},
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    this.compositions.set(id, composition);
    
    return id;
  }
  
  /**
   * Get composition by ID
   */
  async getComposition(compositionId: string): Promise<OrganizationalComposition> {
    const composition = this.compositions.get(compositionId);
    if (!composition) {
      throw new Error(`Composition with ID ${compositionId} not found`);
    }
    return composition;
  }
  
  /**
   * Update an existing composition
   */
  async updateComposition(
    compositionId: string, 
    updates: Partial<OrganizationalComposition>
  ): Promise<OrganizationalComposition> {
    const composition = await this.getComposition(compositionId);
    
    // Apply updates
    if (updates.name !== undefined) composition.name = updates.name;
    if (updates.description !== undefined) composition.description = updates.description;
    if (updates.status !== undefined) composition.status = updates.status;
    if (updates.metadata !== undefined) {
      composition.metadata = { ...composition.metadata, ...updates.metadata };
    }
    
    // Handle units update
    if (updates.units !== undefined) {
      // Validate that all units exist
      for (const unitId of updates.units) {
        await this.structureManager.getUnit(unitId);
      }
      composition.units = updates.units;
    }
    
    // Handle agents update
    if (updates.agents !== undefined) {
      composition.agents = updates.agents;
    }
    
    // Handle tasks update
    if (updates.tasks !== undefined) {
      composition.tasks = updates.tasks;
    }
    
    // Update timestamp
    composition.updatedAt = Date.now();
    
    // Save updated composition
    this.compositions.set(compositionId, composition);
    
    return composition;
  }
  
  /**
   * Delete a composition
   */
  async deleteComposition(compositionId: string): Promise<boolean> {
    if (!this.compositions.has(compositionId)) {
      throw new Error(`Composition with ID ${compositionId} not found`);
    }
    
    return this.compositions.delete(compositionId);
  }
  
  /**
   * Add a unit to a composition
   */
  async addUnitToComposition(compositionId: string, unitId: string): Promise<boolean> {
    const composition = await this.getComposition(compositionId);
    
    // Validate that the unit exists
    await this.structureManager.getUnit(unitId);
    
    if (!composition.units.includes(unitId)) {
      composition.units.push(unitId);
      composition.updatedAt = Date.now();
      this.compositions.set(compositionId, composition);
    }
    
    return true;
  }
  
  /**
   * Remove a unit from a composition
   */
  async removeUnitFromComposition(compositionId: string, unitId: string): Promise<boolean> {
    const composition = await this.getComposition(compositionId);
    
    if (composition.units.includes(unitId)) {
      composition.units = composition.units.filter(id => id !== unitId);
      composition.updatedAt = Date.now();
      this.compositions.set(compositionId, composition);
    }
    
    return true;
  }
  
  /**
   * Get all compositions
   */
  async getAllCompositions(): Promise<OrganizationalComposition[]> {
    return Array.from(this.compositions.values());
  }
  
  /**
   * Get compositions containing a specific unit
   */
  async getCompositionsForUnit(unitId: string): Promise<OrganizationalComposition[]> {
    // Verify that the unit exists
    await this.structureManager.getUnit(unitId);
    
    return Array.from(this.compositions.values()).filter(
      composition => composition.units.includes(unitId)
    );
  }
  
  /**
   * Clone a composition
   */
  async cloneComposition(compositionId: string, newName: string): Promise<string> {
    const composition = await this.getComposition(compositionId);
    
    const id = uuidv4();
    const timestamp = Date.now();
    
    const clonedComposition: OrganizationalComposition = {
      id,
      name: newName,
      description: `Clone of ${composition.name}: ${composition.description}`,
      units: [...composition.units],
      agents: [...composition.agents],
      tasks: [...composition.tasks],
      status: 'draft',
      metadata: { ...composition.metadata, clonedFrom: compositionId },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    this.compositions.set(id, clonedComposition);
    
    return id;
  }
  
  /**
   * Export a composition to JSON
   */
  async exportComposition(compositionId: string): Promise<string> {
    const composition = await this.getComposition(compositionId);
    
    // Collect all unit data
    const unitData = await Promise.all(
      composition.units.map(async unitId => {
        const unit = await this.structureManager.getUnit(unitId);
        return unit;
      })
    );
    
    // Collect all relationships between included units
    const relationships: any[] = [];
    for (const unitId of composition.units) {
      const unitRelationships = await this.structureManager.getUnitRelationships(unitId);
      
      // Only include relationships where both units are in the composition
      for (const relationship of unitRelationships) {
        if (
          composition.units.includes(relationship.sourceUnitId) && 
          composition.units.includes(relationship.targetUnitId)
        ) {
          relationships.push(relationship);
        }
      }
    }
    
    const exportData = {
      composition,
      units: unitData,
      relationships
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import a composition from JSON
   */
  async importComposition(json: string): Promise<string> {
    try {
      const data = JSON.parse(json);
      
      if (!data.composition || !data.units || !Array.isArray(data.units)) {
        throw new Error('Invalid composition format');
      }
      
      // Create all units first
      const unitIdMap: Record<string, string> = {};
      
      for (const unit of data.units) {
        // Create a new unit with a new ID
        const newUnitId = await this.structureManager.createUnit({
          name: unit.name,
          description: unit.description,
          capabilities: unit.capabilities,
          metadata: unit.metadata
        });
        
        // Track the mapping from old ID to new ID
        unitIdMap[unit.id] = newUnitId;
      }
      
      // Set up parent-child relationships
      for (const unit of data.units) {
        if (unit.parent && unitIdMap[unit.parent]) {
          await this.structureManager.updateUnit(unitIdMap[unit.id], {
            parent: unitIdMap[unit.parent]
          });
        }
      }
      
      // Create relationships
      if (data.relationships && Array.isArray(data.relationships)) {
        for (const relationship of data.relationships) {
          if (
            unitIdMap[relationship.sourceUnitId] && 
            unitIdMap[relationship.targetUnitId]
          ) {
            await this.structureManager.createUnitRelationship(
              unitIdMap[relationship.sourceUnitId],
              unitIdMap[relationship.targetUnitId],
              relationship.type,
              relationship.description
            );
          }
        }
      }
      
      // Create the composition
      const mappedUnitIds = data.composition.units
        .map((id: string) => unitIdMap[id])
        .filter((id: string) => id !== undefined);
      
      const compositionId = await this.createComposition(
        data.composition.name,
        data.composition.description,
        mappedUnitIds
      );
      
      // Update status and metadata if they exist
      const updates: Partial<OrganizationalComposition> = {};
      
      if (data.composition.status) {
        updates.status = data.composition.status;
      }
      
      if (data.composition.metadata) {
        updates.metadata = data.composition.metadata;
      }
      
      if (Object.keys(updates).length > 0) {
        await this.updateComposition(compositionId, updates);
      }
      
      return compositionId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to import composition: ${errorMessage}`);
    }
  }
} 