const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { OrganizationalUnit } = require('./types'); // Import the class

// Constants from demo (can be adjusted)
const OBSIDIAN_LINK_REGEX = /\[\[(.*?)\]\]/g;

class UnitDiscovery {
    /**
     * @param {string} unitsBasePath - The absolute path to the root 'units' directory.
     * @param {object} [options] - Optional settings.
     * @param {object} [options.logger] - Optional logger instance (defaults to console).
     */
    constructor(unitsBasePath, options = {}) {
        if (!unitsBasePath || !fs.existsSync(unitsBasePath)) {
            throw new Error(`Units base path does not exist: ${unitsBasePath}`);
        }
        this.unitsBasePath = unitsBasePath;
        this.logger = options.logger || console; // Basic logging
        this.unitsMap = new Map(); // Stores unit objects keyed by path during discovery
        this.relationships = []; // Stores relationship objects during discovery
    }

    /**
     * Discovers all units and their relationships.
     * @returns {Promise<{units: OrganizationalUnit[], relationships: object[]}>} 
     */
    async discoverUnits() {
        this.logger.log(`🔍 Discovering units from: ${this.unitsBasePath}...`);
        this.unitsMap.clear();
        this.relationships = [];

        // Start recursive scan from the base path
        this._loadUnitsRecursive(this.unitsBasePath, null);
        
        const discoveredUnits = Array.from(this.unitsMap.values());

        // Parse links within discovered units' primary markdown files
        discoveredUnits.forEach(unit => {
            if (unit.primaryMdPath) {
                this._parseObsidianLinks(unit.primaryMdPath, unit.id);
            }
        });

        // Resolve relationship links (target names to target IDs)
        this._resolveRelationshipLinks(discoveredUnits);

        this.logger.log(`✅ Discovered ${discoveredUnits.length} units and ${this.relationships.length} potential relationships.`);
        
        return { 
            units: discoveredUnits, 
            relationships: this.relationships 
        };
    }
    
    // --- Private Helper Methods (Adapted from Demo) ---

    _loadUnitsRecursive(dirPath, parentId) {
        try {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
            const currentUnit = this.unitsMap.get(dirPath); // Get unit if path itself represents one

            dirents.forEach(dirent => {
                const fullPath = path.join(dirPath, dirent.name);
                
                if (dirent.isDirectory()) {
                    // Potential Organizational Unit found
                    const unitNameRaw = dirent.name;
                    // Basic check to avoid hidden dirs like .obsidian if they are not meant to be units
                    if (unitNameRaw.startsWith('.') && unitNameRaw !== '.obsidian') { 
                         this.logger.log(`  - Skipping hidden directory: ${unitNameRaw}`);
                         return; // Skip hidden directories unless explicitly handled
                    }
                    
                    const unitName = unitNameRaw.replace(/_/g, ' ');
                    const unitId = uuidv4();
                    let description = `Organizational unit for ${unitName}`; // Default description
                    let capabilities = [];
                    let primaryMdPath = null;
                    let documents = [];

                    try {
                        // Find primary MD file and other MD documents
                        const unitContents = fs.readdirSync(fullPath);
                        const potentialMdFiles = unitContents.filter(f => f.toLowerCase().endsWith('.md'));
                        documents = unitContents.map(f => path.join(fullPath, f)); // Add all files as documents for now

                        const primaryFileCandidates = potentialMdFiles
                          .filter(f => f.toLowerCase() === 'readme.md' || f.toLowerCase() === 'index.md' || f.toLowerCase().startsWith(unitNameRaw.toLowerCase()));
                        
                        if (primaryFileCandidates.length > 0) {
                            primaryMdPath = path.join(fullPath, primaryFileCandidates[0]); 
                            try {
                                const mdContent = fs.readFileSync(primaryMdPath, 'utf8');
                                // Basic metadata extraction (adapt as needed)
                                const lines = mdContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                                if (lines.length > 1 && lines[0].startsWith('#')) {
                                    description = lines[1]; 
                                } else if (lines.length > 0) {
                                    description = lines[0]; 
                                }
                                // TODO: Implement more robust capability extraction (e.g., from YAML frontmatter or specific sections)
                                if (mdContent.toLowerCase().includes('capabilities:')) {
                                     capabilities = ['extracted_placeholder']; // Placeholder
                                }
                            } catch (mdErr) {
                                this.logger.warn(`  ⚠️ Could not read or parse primary MD file ${primaryMdPath}: ${mdErr.message}`);
                            }
                        }
                    } catch (readErr) {
                         this.logger.warn(`  ⚠️ Could not read contents of directory ${fullPath}: ${readErr.message}`);
                    }

                    const unit = new OrganizationalUnit({
                        id: unitId,
                        name: unitName,
                        description: description.substring(0, 300) + (description.length > 300 ? '...' : ''), // Truncate
                        capabilities: capabilities,
                        documents: documents, // Store paths to all contained files/dirs for now
                        path: fullPath,
                        parentId: parentId,
                        primaryMdPath: primaryMdPath,
                    });
                    
                    this.unitsMap.set(fullPath, unit); // Map by path for parent lookup
                    this.logger.log(`  -> Discovered Unit: ${unit.name} (ID: ${unit.id}) at ${unit.path}`);

                    // Add hierarchical relationship
                    if (parentId) {
                        // Find parent by iterating Map values (less efficient but needed as parentId->path mapping isn't stored)
                         const parentUnit = Array.from(this.unitsMap.values()).find(u => u.id === parentId);
                         if (parentUnit) {
                            this.relationships.push({
                                id: uuidv4(),
                                sourceUnitId: parentId,
                                targetUnitId: unitId,
                                type: 'hierarchy',
                                description: `${parentUnit.name} contains ${unit.name}`
                            });
                        } else {
                             this.logger.warn(`  ⚠️ Parent unit ${parentId} not found in map for child ${unit.name}`);
                        }
                    }

                    // Recurse into the subdirectory
                    this._loadUnitsRecursive(fullPath, unitId);
                }
                 // Optionally handle files directly under a unit directory if needed
                 // else if (dirent.isFile() && currentUnit) {
                 //    currentUnit.documents.push(fullPath); 
                 // }
            });
        } catch (error) {
            // Log error but try to continue discovery if possible
            this.logger.error(`❌ Error scanning directory ${dirPath}: ${error.message}`, error.stack);
        }
    }

    _parseObsidianLinks(filePath, sourceUnitId) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let match;
            while ((match = OBSIDIAN_LINK_REGEX.exec(content)) !== null) {
                const targetNameRaw = match[1];
                // Basic cleanup: remove potential aliases like [[Target Name|Alias]] -> Target Name
                const targetName = targetNameRaw.split('|')[0].trim(); 
                if (targetName) {
                    this.relationships.push({
                        id: uuidv4(),
                        sourceUnitId: sourceUnitId,
                        targetUnitName: targetName, // Store name for later resolution
                        type: 'link',
                        description: `Link from ${path.basename(filePath)} to ${targetName}`
                    });
                    this.logger.log(`  🔗 Found potential link from Unit ${sourceUnitId} -> '${targetName}'`);
                }
            }
        } catch (error) {
            this.logger.warn(`  ⚠️ Could not read or parse links in ${filePath}: ${error.message}`);
        }
    }

    _resolveRelationshipLinks(units) {
        const unitNameMap = new Map(units.map(u => [u.name.toLowerCase(), u.id]));
        const unitPathMap = new Map(units.map(u => [u.path, u.id])); // Map path to ID
        const unitIdMap = new Map(units.map(u => [u.id, u])); // Map ID to unit

        this.relationships.forEach(rel => {
            if (rel.type === 'link' && rel.targetUnitName && !rel.targetUnitId) {
                let targetId = unitNameMap.get(rel.targetUnitName.toLowerCase());
                
                // Attempt to resolve by path if name resolution fails (basic relative/absolute)
                if (!targetId) {
                   const sourceUnit = unitIdMap.get(rel.sourceUnitId);
                   if (sourceUnit) {
                       // Simplistic path resolution - assumes targetName might be a relative path from source unit's dir
                       const potentialPath = path.resolve(path.dirname(sourceUnit.path), rel.targetUnitName);
                       targetId = unitPathMap.get(potentialPath);
                       // Could add more sophisticated path matching logic here
                   }
                }

                if (targetId) {
                    rel.targetUnitId = targetId;
                    this.logger.log(`  ✅ Resolved link: ${rel.sourceUnitId} -> ${rel.targetUnitId} ('${rel.targetUnitName}')`);
                    // delete rel.targetUnitName; // Keep name for context if desired
                } else {
                    this.logger.warn(`  ⚠️ Could not resolve link target '${rel.targetUnitName}' from unit ${rel.sourceUnitId} to a unit ID or path.`);
                    rel.targetUnitId = null; // Mark as unresolved
                }
            }
        });
        // Filter out relationships that couldn't be resolved? Optional.
        // this.relationships = this.relationships.filter(rel => rel.type !== 'link' || rel.targetUnitId !== null);
    }
}

module.exports = UnitDiscovery; 