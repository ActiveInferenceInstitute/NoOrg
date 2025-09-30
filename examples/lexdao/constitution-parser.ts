/**
 * LexDAO Constitution Parser
 *
 * Advanced parser for analyzing and extracting structured data from the LexDAO Constitution.
 * Provides comprehensive analysis of governance structures, membership requirements,
 * and operational procedures defined in the constitution.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface ConstitutionSection {
  id: string;
  title: string;
  content: string;
  subsections?: ConstitutionSection[];
  type: 'article' | 'section' | 'subsection' | 'paragraph';
  order: number;
}

export interface ConstitutionAnalysis {
  metadata: {
    title: string;
    adopted: string;
    version: string;
    totalSections: number;
    totalArticles: number;
    wordCount: number;
  };
  structure: ConstitutionSection[];
  governance: {
    daoType: string;
    membership: MembershipRules;
    voting: VotingRules;
    treasury: TreasuryRules;
    disputeResolution: DisputeRules;
  };
  legal: {
    disclaimers: string[];
    liabilities: string[];
    compliance: string[];
    definitions: Record<string, string>;
  };
  analysis: {
    complexity: number;
    readability: number;
    governanceScore: number;
    recommendations: string[];
  };
}

export interface MembershipRules {
  eligibility: string[];
  admission: string[];
  rights: string[];
  responsibilities: string[];
  termination: string[];
}

export interface VotingRules {
  mechanisms: string[];
  quorum: string;
  thresholds: Record<string, string>;
  procedures: string[];
}

export interface TreasuryRules {
  management: string[];
  allocation: string[];
  reporting: string[];
  audits: string[];
}

export interface DisputeRules {
  mechanisms: string[];
  mediation: string[];
  arbitration: string[];
  jurisdiction: string[];
}

export class ConstitutionParser {
  private content: string;
  private lines: string[];
  private currentSection: number = 0;

  constructor(filePath: string) {
    this.content = fs.readFileSync(filePath, 'utf-8');
    this.lines = this.content.split('\n');
  }

  /**
   * Parse the entire constitution and return structured analysis
   */
  async parse(): Promise<ConstitutionAnalysis> {
    const structure = this.parseStructure();
    const metadata = this.extractMetadata();
    const governance = this.extractGovernanceRules();
    const legal = this.extractLegalAspects();
    const analysis = this.analyzeConstitution();

    return {
      metadata,
      structure,
      governance,
      legal,
      analysis
    };
  }

  /**
   * Parse the document structure into sections and articles
   */
  private parseStructure(): ConstitutionSection[] {
    const sections: ConstitutionSection[] = [];
    let currentArticle: ConstitutionSection | null = null;
    let currentSection: ConstitutionSection | null = null;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].trim();

      // Match article headers (Article I, Article II, etc.)
      const articleMatch = line.match(/^(#{1,3})\s*Article\s+([IVXLC]+)\s*-?\s*(.+)?$/i);
      if (articleMatch) {
        if (currentArticle) {
          sections.push(currentArticle);
        }

        currentArticle = {
          id: `article_${articleMatch[2].toLowerCase()}`,
          title: `Article ${articleMatch[2]} - ${articleMatch[3] || 'General'}`,
          content: '',
          type: 'article',
          order: this.currentSection++,
          subsections: []
        };
        continue;
      }

      // Match section headers (Section 1.1, **Section 1.2**, etc.)
      const sectionMatch = line.match(/^(#{2,4})\s*(?:Section\s+)?(\d+(?:\.\d+)*)\s*-?\s*(.+)?$/);
      if (sectionMatch) {
        if (currentSection && currentArticle?.subsections) {
          currentArticle.subsections.push(currentSection);
        }

        currentSection = {
          id: `section_${sectionMatch[2].replace(/\./g, '_')}`,
          title: `Section ${sectionMatch[2]} - ${sectionMatch[3] || 'General'}`,
          content: '',
          type: 'section',
          order: this.currentSection++,
          subsections: []
        };
        continue;
      }

      // Match subsection headers (bold text followed by content)
      const subsectionMatch = line.match(/^\*\*(.+)\*\*\s*(.+)?$/);
      if (subsectionMatch && currentSection) {
        const subsection: ConstitutionSection = {
          id: `subsection_${subsectionMatch[1].toLowerCase().replace(/\s+/g, '_')}`,
          title: subsectionMatch[1],
          content: subsectionMatch[2] || '',
          type: 'subsection',
          order: this.currentSection++,
          subsections: []
        };

        if (currentSection.subsections) {
          currentSection.subsections.push(subsection);
        } else {
          currentSection.subsections = [subsection];
        }
        continue;
      }

      // Add content to current section
      if (currentSection && line) {
        currentSection.content += line + '\n';
      }
    }

    // Add final sections
    if (currentSection && currentArticle?.subsections) {
      currentArticle.subsections.push(currentSection);
    }
    if (currentArticle) {
      sections.push(currentArticle);
    }

    return sections;
  }

  /**
   * Extract metadata from the constitution header
   */
  private extractMetadata() {
    const titleMatch = this.content.match(/# Constitution of LexDAO Club/i);
    const adoptedMatch = this.content.match(/Originally Adopted (\w+ \d+, \d+)/i);
    const versionMatch = this.content.match(/Version:\s*([^\n]+)/i);

    const wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;

    return {
      title: titleMatch ? 'Constitution of LexDAO Club' : 'Unknown',
      adopted: adoptedMatch ? adoptedMatch[1] : 'Unknown',
      version: versionMatch ? versionMatch[1] : '1.0',
      totalSections: this.currentSection,
      totalArticles: (this.content.match(/Article\s+[IVXLC]+/gi) || []).length,
      wordCount
    };
  }

  /**
   * Extract governance rules from the constitution
   */
  private extractGovernanceRules(): ConstitutionAnalysis['governance'] {
    const membership: MembershipRules = {
      eligibility: this.extractRules('eligibility', 'Section 2.1'),
      admission: this.extractRules('admission', 'Section 2.2'),
      rights: this.extractRules('rights', 'Section 2.3'),
      responsibilities: this.extractRules('responsibilities', 'Section 2.4'),
      termination: this.extractRules('termination', 'Section 2.6')
    };

    const voting: VotingRules = {
      mechanisms: this.extractRules('voting', 'Section 3.6'),
      quorum: this.extractRules('quorum', 'Section 3.5'),
      thresholds: this.extractVotingThresholds(),
      procedures: this.extractRules('procedures', 'Section 3')
    };

    const treasury: TreasuryRules = {
      management: this.extractRules('management', 'Section 5'),
      allocation: this.extractRules('allocation', 'Section 5'),
      reporting: this.extractRules('reporting', 'Section 2.7'),
      audits: this.extractRules('audits', 'Section 5')
    };

    const disputeResolution: DisputeRules = {
      mechanisms: this.extractRules('mechanisms', 'Section 2.8'),
      mediation: this.extractRules('mediation', 'Section 2.8'),
      arbitration: this.extractRules('arbitration', 'Section 2.8'),
      jurisdiction: this.extractRules('jurisdiction', 'Section 2.8')
    };

    return {
      daoType: 'Decentralized Autonomous Organization (DAO)',
      membership,
      voting,
      treasury,
      disputeResolution
    };
  }

  /**
   * Extract legal aspects and disclaimers
   */
  private extractLegalAspects(): ConstitutionAnalysis['legal'] {
    const disclaimers = this.extractRules('disclaimers', 'Section 1.3');
    const liabilities = this.extractRules('liabilities', 'Section 2.5');
    const compliance = this.extractRules('compliance', 'Section 1.3');

    // Extract definitions from Article XI
    const definitionsSection = this.content.match(/# Article XI - Definitions([\s\S]*?)(?=#|$)/i);
    const definitions: Record<string, string> = {};

    if (definitionsSection) {
      const definitionMatches = definitionsSection[1].match(/\(\w+\)\s*\*\*([^*]+)\*\*[\s\S]*?([^*]+?)(?=\(\w+\)|$)/g);
      if (definitionMatches) {
        definitionMatches.forEach(match => {
          const defMatch = match.match(/\(\w+\)\s*\*\*([^*]+)\*\*[\s\S]*?([^*]+?)(?=\(\w+\)|$)/);
          if (defMatch) {
            definitions[defMatch[1]] = defMatch[2].trim();
          }
        });
      }
    }

    return {
      disclaimers,
      liabilities,
      compliance,
      definitions
    };
  }

  /**
   * Analyze the constitution for complexity and quality metrics
   */
  private analyzeConstitution(): ConstitutionAnalysis['analysis'] {
    const wordCount = this.content.split(/\s+/).length;
    const sentenceCount = this.content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Calculate complexity score (0-100, higher = more complex)
    const complexity = Math.min(100, (avgWordsPerSentence * 2) + (this.currentSection * 0.5));

    // Calculate readability score (0-100, higher = more readable)
    const readability = Math.max(0, 100 - (complexity * 0.8) - (this.currentSection * 0.2));

    // Calculate governance score based on completeness
    const governanceScore = this.calculateGovernanceScore();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      complexity,
      readability,
      governanceScore,
      recommendations
    };
  }

  /**
   * Extract specific rules from sections
   */
  private extractRules(type: string, sectionPattern: string): string[] {
    const rules: string[] = [];

    // Find the section
    const sectionMatch = this.content.match(new RegExp(`${sectionPattern}[\\s\\S]*?(?=Section|# Article|$)`, 'i'));
    if (!sectionMatch) return rules;

    const sectionContent = sectionMatch[0];

    // Extract bullet points and numbered lists
    const bulletMatches = sectionContent.match(/[-*]\s*(.+)/g);
    if (bulletMatches) {
      rules.push(...bulletMatches.map(match => match.replace(/[-*]\s*/, '').trim()));
    }

    // Extract numbered items
    const numberedMatches = sectionContent.match(/\d+\.\s*(.+)/g);
    if (numberedMatches) {
      rules.push(...numberedMatches.map(match => match.replace(/\d+\.\s*/, '').trim()));
    }

    // Extract parenthetical content
    const parentheticalMatches = sectionContent.match(/\(([^)]+)\)/g);
    if (parentheticalMatches) {
      rules.push(...parentheticalMatches.map(match => match.replace(/[()]/g, '').trim()));
    }

    return rules.filter(rule => rule.length > 10); // Filter out very short rules
  }

  /**
   * Extract voting thresholds from the constitution
   */
  private extractVotingThresholds(): Record<string, string> {
    const thresholds: Record<string, string> = {};

    // Look for voting threshold patterns
    const thresholdPatterns = [
      /(\d+)\/(\d+)\s+majority/gi,
      /majority\s+(?:of\s+)?(\d+)/gi,
      /quorum\s+(?:of\s+)?(\d+)/gi,
      /consensus/gi,
      /unanimous/gi
    ];

    thresholdPatterns.forEach(pattern => {
      const matches = this.content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const key = match.toLowerCase().replace(/\s+/g, '_');
          thresholds[key] = match;
        });
      }
    });

    return thresholds;
  }

  /**
   * Calculate governance completeness score
   */
  private calculateGovernanceScore(): number {
    let score = 0;

    // Check for essential governance components
    const essentialComponents = [
      'membership', 'voting', 'treasury', 'dispute', 'amendment'
    ];

    essentialComponents.forEach(component => {
      if (this.content.toLowerCase().includes(component)) {
        score += 20;
      }
    });

    // Bonus for detailed procedures
    if (this.content.includes('Section') && this.currentSection > 5) {
      score += 10;
    }

    // Bonus for clear definitions
    const definitionCount = Object.keys(this.extractLegalAspects().definitions).length;
    score += Math.min(10, definitionCount);

    return Math.min(100, score);
  }

  /**
   * Generate recommendations for constitution improvement
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for missing essential sections
    if (!this.content.toLowerCase().includes('amendment')) {
      recommendations.push('Consider adding an amendment procedure section');
    }

    if (!this.content.toLowerCase().includes('emergency')) {
      recommendations.push('Consider adding emergency procedures for critical situations');
    }

    if (!this.content.toLowerCase().includes('audit')) {
      recommendations.push('Consider adding regular audit requirements');
    }

    // Check for clarity issues
    const wordCount = this.content.split(/\s+/).length;
    if (wordCount > 5000) {
      recommendations.push('Constitution is quite long - consider simplifying language');
    }

    // Check for legal completeness
    if (this.calculateGovernanceScore() < 70) {
      recommendations.push('Governance procedures could be more comprehensive');
    }

    return recommendations;
  }

  /**
   * Export parsed constitution as JSON
   */
  async exportToJSON(outputPath: string): Promise<void> {
    const analysis = await this.parse();
    await fs.writeJson(outputPath, analysis, { spaces: 2 });
  }

  /**
   * Export parsed constitution as Markdown with enhanced formatting
   */
  async exportToMarkdown(outputPath: string): Promise<void> {
    const analysis = await this.parse();
    let markdown = `# LexDAO Constitution Analysis\n\n`;

    markdown += `## Metadata\n`;
    markdown += `- **Title**: ${analysis.metadata.title}\n`;
    markdown += `- **Adopted**: ${analysis.metadata.adopted}\n`;
    markdown += `- **Version**: ${analysis.metadata.version}\n`;
    markdown += `- **Total Sections**: ${analysis.metadata.totalSections}\n`;
    markdown += `- **Total Articles**: ${analysis.metadata.totalArticles}\n`;
    markdown += `- **Word Count**: ${analysis.metadata.wordCount}\n\n`;

    markdown += `## Analysis Scores\n`;
    markdown += `- **Complexity**: ${analysis.analysis.complexity.toFixed(1)}/100\n`;
    markdown += `- **Readability**: ${analysis.analysis.readability.toFixed(1)}/100\n`;
    markdown += `- **Governance Score**: ${analysis.analysis.governanceScore}/100\n\n`;

    if (analysis.analysis.recommendations.length > 0) {
      markdown += `## Recommendations\n`;
      analysis.analysis.recommendations.forEach((rec, i) => {
        markdown += `${i + 1}. ${rec}\n`;
      });
      markdown += '\n';
    }

    markdown += `## Structure\n`;
    analysis.structure.forEach(article => {
      markdown += `### ${article.title}\n`;
      if (article.subsections) {
        article.subsections.forEach(section => {
          markdown += `#### ${section.title}\n`;
          if (section.content) {
            markdown += `${section.content.substring(0, 200)}...\n\n`;
          }
        });
      }
    });

    await fs.writeFile(outputPath, markdown);
  }
}

// CLI interface for the constitution parser
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node constitution-parser.ts <constitution-file> [output-dir]');
    console.log('Example: ts-node constitution-parser.ts lexdao_constitution.md ./output');
    process.exit(1);
  }

  const constitutionFile = args[0];
  const outputDir = args[1] || './output';

  try {
    console.log(`Parsing LexDAO Constitution: ${constitutionFile}`);

    if (!fs.existsSync(constitutionFile)) {
      throw new Error(`Constitution file not found: ${constitutionFile}`);
    }

    const parser = new ConstitutionParser(constitutionFile);
    const analysis = await parser.parse();

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Export results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(outputDir, `constitution-analysis-${timestamp}.json`);
    const markdownPath = path.join(outputDir, `constitution-analysis-${timestamp}.md`);

    await parser.exportToJSON(jsonPath);
    await parser.exportToMarkdown(markdownPath);

    console.log(`✅ Constitution analysis completed!`);
    console.log(`📄 JSON output: ${jsonPath}`);
    console.log(`📝 Markdown output: ${markdownPath}`);

    // Display summary
    console.log(`\n📊 Analysis Summary:`);
    console.log(`   Articles: ${analysis.metadata.totalArticles}`);
    console.log(`   Sections: ${analysis.metadata.totalSections}`);
    console.log(`   Complexity: ${analysis.analysis.complexity.toFixed(1)}/100`);
    console.log(`   Governance Score: ${analysis.analysis.governanceScore}/100`);

    if (analysis.analysis.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      analysis.analysis.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

  } catch (error) {
    console.error('❌ Error parsing constitution:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ConstitutionParser };
