/**
 * UnitParser module
 *
 * Extracts unit metadata from directories and files
 */
/**
 * UnitParser class for extracting metadata from unit directories
 */
export declare class UnitParser {
    private logger;
    /**
     * Create a new UnitParser
     * @param logger - Logger instance (defaults to console)
     */
    constructor(logger?: Console);
    /**
     * Extract description from unit directory
     * @param unitPath - Path to the unit directory
     * @param unitName - Name of the unit
     * @returns Description text
     */
    extractDescription(unitPath: string, unitName: string): string;
    /**
     * Extract capabilities from unit directory
     * @param unitPath - Path to the unit directory
     * @returns Array of capabilities or null if none found
     */
    extractCapabilities(unitPath: string): string[] | null;
    /**
     * Extract description text from a markdown file
     * @param filePath - Path to markdown file
     * @returns Extracted description
     */
    private extractDescriptionFromMarkdown;
    /**
     * Extract capabilities from a markdown file
     * @param filePath - Path to markdown file
     * @returns Array of capabilities
     */
    private extractCapabilitiesFromMarkdown;
    /**
     * Infer capabilities from directory structure
     * @param unitPath - Path to unit directory
     * @returns Array of capabilities
     */
    private inferCapabilitiesFromDirectory;
    /**
     * Normalize capability name for consistent format
     * @param text - Raw capability text
     * @returns Normalized capability name
     */
    private normalizeCapabilityName;
}
