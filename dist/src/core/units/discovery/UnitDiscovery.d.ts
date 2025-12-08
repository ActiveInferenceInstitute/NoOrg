/**
 * UnitDiscovery Module
 *
 * This module provides functionality to discover organizational units from
 * directory structures, parse their metadata, and identify relationships.
 */
import { OrganizationalUnit, UnitRelationship } from '../UnitInterface';
/**
 * UnitDiscovery class
 * Provides utilities for discovering organizational units from directory structures
 */
export declare class UnitDiscovery {
    private basePath;
    private unitParser;
    private logger;
    /**
     * Create a new UnitDiscovery instance
     * @param basePath - Base directory path where units are stored
     * @param logger - Logger instance (defaults to console)
     */
    constructor(basePath: string, logger?: Console);
    /**
     * Discover organizational units from the directory structure
     * @returns Promise with array of discovered units and relationships
     */
    discoverUnits(): Promise<{
        units: OrganizationalUnit[];
        relationships: UnitRelationship[];
    }>;
    /**
     * Recursively load units from directory structure
     * @param dirPath - Current directory path
     * @param parentId - Parent unit ID (null for top-level)
     * @param unitsMap - Map to store discovered units
     * @param relationships - Array to store unit relationships
     */
    private loadUnitsRecursive;
    /**
     * Parse markdown files for relationships using Obsidian-style links
     * @param unit - The organizational unit to check
     * @param unitsMap - Map of all units
     * @param relationships - Array to store relationships
     */
    private parseMarkdownForRelationships;
    /**
     * Resolve target unit names in relationships to unit IDs
     * @param relationships - Array of relationships
     * @param units - Array of units
     */
    private resolveRelationshipLinks;
}
//# sourceMappingURL=UnitDiscovery.d.ts.map