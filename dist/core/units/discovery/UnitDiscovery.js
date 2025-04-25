"use strict";
/**
 * UnitDiscovery Module
 *
 * This module provides functionality to discover organizational units from
 * directory structures, parse their metadata, and identify relationships.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitDiscovery = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const UnitInterface_1 = require("../UnitInterface");
const UnitParser_1 = require("./UnitParser");
// Regex for matching Obsidian-style wiki links
const OBSIDIAN_LINK_REGEX = /\[\[(.*?)\]\]/g;
/**
 * UnitDiscovery class
 * Provides utilities for discovering organizational units from directory structures
 */
class UnitDiscovery {
    /**
     * Create a new UnitDiscovery instance
     * @param basePath - Base directory path where units are stored
     * @param logger - Logger instance (defaults to console)
     */
    constructor(basePath, logger = console) {
        this.basePath = basePath;
        this.unitParser = new UnitParser_1.UnitParser(logger);
        this.logger = logger;
    }
    /**
     * Discover organizational units from the directory structure
     * @returns Promise with array of discovered units and relationships
     */
    async discoverUnits() {
        const unitsMap = new Map();
        const relationships = [];
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
        }
        catch (error) {
            this.logger.error(`Error discovering units: ${error.message}`);
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
    loadUnitsRecursive(dirPath, parentId, unitsMap, relationships) {
        try {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
            dirents.forEach(dirent => {
                if (dirent.isDirectory() && !dirent.name.startsWith('.')) {
                    const unitNameRaw = dirent.name;
                    const unitName = unitNameRaw.replace(/_/g, ' '); // Sanitize name
                    const unitPath = path.join(dirPath, unitNameRaw);
                    const unitId = (0, uuid_1.v4)();
                    // Try to find README.md or primary unit file
                    const description = this.unitParser.extractDescription(unitPath, unitName);
                    // Extract capabilities from README or defaults
                    const capabilities = this.unitParser.extractCapabilities(unitPath) || [
                        { name: 'general_management', description: 'General organizational management' }
                    ];
                    // Create unit object
                    const unit = {
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
                                id: (0, uuid_1.v4)(),
                                sourceUnitId: parentId,
                                targetUnitId: unitId,
                                type: UnitInterface_1.RelationshipType.HIERARCHY,
                                description: `${parentUnit.name} contains ${unit.name}`
                            });
                        }
                    }
                    // Recurse into subdirectory
                    this.loadUnitsRecursive(unitPath, unitId, unitsMap, relationships);
                }
            });
        }
        catch (error) {
            this.logger.warn(`Error scanning directory ${dirPath}: ${error.message}`);
        }
    }
    /**
     * Parse markdown files for relationships using Obsidian-style links
     * @param unit - The organizational unit to check
     * @param unitsMap - Map of all units
     * @param relationships - Array to store relationships
     */
    parseMarkdownForRelationships(unit, unitsMap, relationships) {
        try {
            if (!unit.path)
                return;
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
                        id: (0, uuid_1.v4)(),
                        sourceUnitId: unit.id,
                        targetUnitName: targetName, // Temporary - will resolve later
                        type: UnitInterface_1.RelationshipType.LINK,
                        description: `Link found in ${path.basename(filePath)} to ${targetName}`
                    }); // Using 'as any' for the temporary targetUnitName
                }
            }
        }
        catch (error) {
            this.logger.warn(`Error parsing markdown in unit ${unit.name}: ${error.message}`);
        }
    }
    /**
     * Resolve target unit names in relationships to unit IDs
     * @param relationships - Array of relationships
     * @param units - Array of units
     */
    resolveRelationshipLinks(relationships, units) {
        const unitNameMap = new Map(units.map(u => [u.name.toLowerCase(), u.id]));
        // Filter out relationships with the temporary targetUnitName property
        const unresolved = relationships.filter(rel => rel.targetUnitName !== undefined);
        // Resolve or remove unresolved relationships
        for (let i = relationships.length - 1; i >= 0; i--) {
            const rel = relationships[i];
            if (rel.targetUnitName) {
                const targetName = rel.targetUnitName.toLowerCase();
                const targetId = unitNameMap.get(targetName);
                if (targetId) {
                    // Resolve the relationship
                    rel.targetUnitId = targetId;
                    delete rel.targetUnitName;
                    this.logger.log(`Resolved link: ${rel.sourceUnitId} -> ${rel.targetUnitId}`);
                }
                else {
                    // Remove unresolved relationship
                    this.logger.warn(`Removing unresolved relationship to: ${rel.targetUnitName}`);
                    relationships.splice(i, 1);
                }
            }
        }
    }
}
exports.UnitDiscovery = UnitDiscovery;
//# sourceMappingURL=UnitDiscovery.js.map