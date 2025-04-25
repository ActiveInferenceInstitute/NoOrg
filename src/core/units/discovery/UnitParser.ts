/**
 * UnitParser module
 * 
 * Extracts unit metadata from directories and files
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * UnitParser class for extracting metadata from unit directories
 */
export class UnitParser {
  private logger: Console;

  /**
   * Create a new UnitParser
   * @param logger - Logger instance (defaults to console)
   */
  constructor(logger: Console = console) {
    this.logger = logger;
  }

  /**
   * Extract description from unit directory
   * @param unitPath - Path to the unit directory
   * @param unitName - Name of the unit
   * @returns Description text
   */
  public extractDescription(unitPath: string, unitName: string): string {
    try {
      // Look for README.md file first
      const readmePath = path.join(unitPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        return this.extractDescriptionFromMarkdown(readmePath);
      }
      
      // Look for unit-named markdown file
      const unitFileName = `${unitName.replace(/\s+/g, '')}.md`;
      const unitFilePath = path.join(unitPath, unitFileName);
      if (fs.existsSync(unitFilePath)) {
        return this.extractDescriptionFromMarkdown(unitFilePath);
      }
      
      // Look for index.md
      const indexPath = path.join(unitPath, 'index.md');
      if (fs.existsSync(indexPath)) {
        return this.extractDescriptionFromMarkdown(indexPath);
      }
      
      // Use default description
      return `Organizational unit for ${unitName}`;
    } catch (error) {
      this.logger.warn(`Error extracting description for ${unitName}: ${(error as Error).message}`);
      return `Organizational unit for ${unitName}`;
    }
  }

  /**
   * Extract capabilities from unit directory
   * @param unitPath - Path to the unit directory
   * @returns Array of capabilities or null if none found
   */
  public extractCapabilities(unitPath: string): string[] | null {
    try {
      // Look for capabilities in README.md or other markdown files
      const mdFiles = ['README.md', 'index.md', 'Capabilities.md'].map(f => path.join(unitPath, f));
      
      for (const filePath of mdFiles) {
        if (fs.existsSync(filePath)) {
          const capabilities = this.extractCapabilitiesFromMarkdown(filePath);
          if (capabilities && capabilities.length > 0) {
            return capabilities;
          }
        }
      }
      
      // If no capabilities found, infer from directory names
      return this.inferCapabilitiesFromDirectory(unitPath);
    } catch (error) {
      this.logger.warn(`Error extracting capabilities from ${unitPath}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Extract description text from a markdown file
   * @param filePath - Path to markdown file
   * @returns Extracted description
   */
  private extractDescriptionFromMarkdown(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Try to find description after the first heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
          // Look for the first non-empty, non-heading line after this
          for (let j = i + 1; j < lines.length; j++) {
            if (!lines[j].startsWith('#') && lines[j].length > 0) {
              return lines[j].substring(0, 250); // Limit description length
            }
          }
        }
      }
      
      // If no heading or description found, just use the first line
      return lines[0].substring(0, 250);
    } catch (error) {
      this.logger.warn(`Error reading markdown file ${filePath}: ${(error as Error).message}`);
      return 'No description available';
    }
  }

  /**
   * Extract capabilities from a markdown file
   * @param filePath - Path to markdown file
   * @returns Array of capabilities
   */
  private extractCapabilitiesFromMarkdown(filePath: string): string[] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const capabilities: string[] = [];
      
      // Simple regex-based approach to find capabilities
      // Look for capability lists under headings like "Capabilities", "Skills", "Expertise"
      const capabilitySections = [
        /#+\s*Capabilities\s*\n([\s\S]*?)(?=\n#+|$)/i,
        /#+\s*Skills\s*\n([\s\S]*?)(?=\n#+|$)/i, 
        /#+\s*Expertise\s*\n([\s\S]*?)(?=\n#+|$)/i,
        /#+\s*Functions\s*\n([\s\S]*?)(?=\n#+|$)/i
      ];
      
      for (const regex of capabilitySections) {
        const match = content.match(regex);
        if (match && match[1]) {
          // Extract items from the section - look for lists with bullet points
          const itemLines = match[1].split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'));
          
          for (const line of itemLines) {
            // Remove bullet point and extract capability name
            const capText = line.replace(/^[-*•]\s*/, '').trim();
            if (capText) {
              capabilities.push(this.normalizeCapabilityName(capText));
            }
          }
          
          if (capabilities.length > 0) break; // Stop after finding capabilities
        }
      }
      
      return capabilities;
    } catch (error) {
      this.logger.warn(`Error extracting capabilities from ${filePath}: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Infer capabilities from directory structure
   * @param unitPath - Path to unit directory
   * @returns Array of capabilities
   */
  private inferCapabilitiesFromDirectory(unitPath: string): string[] {
    try {
      const subdirs = fs.readdirSync(unitPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      return subdirs.map(dir => this.normalizeCapabilityName(dir));
    } catch (error) {
      this.logger.warn(`Error inferring capabilities: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Normalize capability name for consistent format
   * @param text - Raw capability text
   * @returns Normalized capability name
   */
  private normalizeCapabilityName(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
  }
} 