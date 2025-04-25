/**
 * UnitDiscovery Module
 * 
 * This module provides functionality to discover organizational units from
 * directory structures, parse their metadata, and identify relationships.
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationalUnit, RelationshipType, UnitRelationship } from '../UnitInterface';
import { Capability } from '../../../agents/types';
import { UnitParser } from './UnitParser';

// Regex for matching Obsidian-style wiki links
const OBSIDIAN_LINK_REGEX = /\[\[(.*?)\]\]/g;

/**
 * UnitDiscovery class
 * Provides utilities for discovering organizational units from directory structures
 */
export class UnitDiscovery {
  private basePath: string;
  private unitParser: UnitParser;
  private logger: Console;

  /**
   * Create a new UnitDiscovery instance
   * @param basePath - Base directory path where units are stored
   * @param logger - Logger instance (defaults to console)
   */
  constructor(basePath: string, logger: Console = console) {
    this.basePath = basePath;
    this.unitParser = new UnitParser(logger);
    this.logger = logger;
  }

  /**
   * Discover organizational units from the directory structure
   * @returns Promise with array of discovered units and relationships
   */
  public async discoverUnits(): Promise<{
    units: OrganizationalUnit[];
    relationships: UnitRelationship[];
  }> {
    const unitsMap = new Map<string, OrganizationalUnit>();
    const relationships: UnitRelationship[] = [];

    try {
      // Check if base path exists
      if (!fs.existsSync(this.basePath)) {
        throw new Error(`Units directory not found at: ${this.basePath}`);
      }

      // Start recursive discovery from base path
      this.loadUnitsRecursive(this.basePath, null, unitsMap, relationships);

      // Parse unit markdown files for additional relationships
      for (const unit of unitsMap.values()) {
        if (unit.path) {
          this.parseMarkdownForRelationships(unit, unitsMap, relationships);
        }
      }

      // Resolve relationship names (convert unit names to IDs)
      this.resolveRelationshipLinks(relationships, Array.from(unitsMap.values()));

      return {
        units: Array.from(unitsMap.values()),
        relationships
      };
    } catch (error) {
      this.logger.error(`Error discovering units: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Recursively load units from directory structure
   * @param dirPath - Current directory path
   * @param parentId - Parent unit ID (null for top-level)
   * @param unitsMap - Map to store discovered units
   * @param relationships - Array to store unit relationships
   */
  private loadUnitsRecursive(
    dirPath: string,
    parentId: string | null,
    unitsMap: Map<string, OrganizationalUnit>,
    relationships: UnitRelationship[]
  ): void {
    try {
      const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

      dirents.forEach(dirent => {
        if (dirent.isDirectory() && !dirent.name.startsWith('.')) {
          const unitNameRaw = dirent.name;
          const unitName = unitNameRaw.replace(/_/g, ' '); // Sanitize name
          const unitPath = path.join(dirPath, unitNameRaw);
          const unitId = uuidv4();
          
          // Try to find README.md or primary unit file
          const description = this.unitParser.extractDescription(unitPath, unitName);
          
          // Extract capabilities from README or defaults
          const capabilities = this.unitParser.extractCapabilities(unitPath) || [
            { name: 'general_management', description: 'General organizational management' }
          ];
          
          // Create unit object
          const unit: OrganizationalUnit = {
            id: unitId,
            name: unitName,
            description,
            path: unitPath,
            parentId,
            capabilities,
            metadata: {}
          };
          
          unitsMap.set(unitPath, unit);
          this.logger.log(`Discovered Unit: ${unit.name} (ID: ${unit.id})`);

          // Add hierarchical relationship if it has a parent
          if (parentId) {
            const parentUnit = Array.from(unitsMap.values()).find(u => u.id === parentId);
            if (parentUnit) {
              relationships.push({
                id: uuidv4(),
                sourceUnitId: parentId,
                targetUnitId: unitId,
                type: RelationshipType.HIERARCHY,
                description: `${parentUnit.name} contains ${unit.name}`
              });
            }
          }

          // Recurse into subdirectory
          this.loadUnitsRecursive(unitPath, unitId, unitsMap, relationships);
        }
      });
    } catch (error) {
      this.logger.warn(`Error scanning directory ${dirPath}: ${(error as Error).message}`);
    }
  }

  /**
   * Parse markdown files for relationships using Obsidian-style links
   * @param unit - The organizational unit to check
   * @param unitsMap - Map of all units
   * @param relationships - Array to store relationships
   */
  private parseMarkdownForRelationships(
    unit: OrganizationalUnit,
    unitsMap: Map<string, OrganizationalUnit>,
    relationships: UnitRelationship[]
  ): void {
    try {
      if (!unit.path) return;
      
      // Get all markdown files
      const mdFiles = fs.readdirSync(unit.path)
        .filter(file => file.toLowerCase().endsWith('.md'));
      
      for (const mdFile of mdFiles) {
        const filePath = path.join(unit.path, mdFile);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find Obsidian-style links
        const matches = content.matchAll(OBSIDIAN_LINK_REGEX);
        for (const match of matches) {
          const targetName = match[1].trim();
          
          // Store link relationship
          relationships.push({
            id: uuidv4(),
            sourceUnitId: unit.id,
            targetUnitName: targetName, // Temporary - will resolve later
            type: RelationshipType.LINK,
            description: `Link found in ${path.basename(filePath)} to ${targetName}`
          } as any); // Using 'as any' for the temporary targetUnitName
        }
      }
    } catch (error) {
      this.logger.warn(`Error parsing markdown in unit ${unit.name}: ${(error as Error).message}`);
    }
  }

  /**
   * Resolve target unit names in relationships to unit IDs
   * @param relationships - Array of relationships
   * @param units - Array of units
   */
  private resolveRelationshipLinks(relationships: UnitRelationship[], units: OrganizationalUnit[]): void {
    const unitNameMap = new Map(units.map(u => [u.name.toLowerCase(), u.id]));

    // Filter out relationships with the temporary targetUnitName property
    const unresolved = relationships.filter(rel => (rel as any).targetUnitName !== undefined);
    
    // Resolve or remove unresolved relationships
    for (let i = relationships.length - 1; i >= 0; i--) {
      const rel = relationships[i];
      if ((rel as any).targetUnitName) {
        const targetName = (rel as any).targetUnitName.toLowerCase();
        const targetId = unitNameMap.get(targetName);
        
        if (targetId) {
          // Resolve the relationship
          rel.targetUnitId = targetId;
          delete (rel as any).targetUnitName;
          this.logger.log(`Resolved link: ${rel.sourceUnitId} -> ${rel.targetUnitId}`);
        } else {
          // Remove unresolved relationship
          this.logger.warn(`Removing unresolved relationship to: ${(rel as any).targetUnitName}`);
          relationships.splice(i, 1);
        }
      }
    }
  }
} 