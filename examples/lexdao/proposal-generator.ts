/**
 * LexDAO Proposal Generator
 *
 * Generates realistic governance proposals for LexDAO based on the constitution
 * and typical DAO governance scenarios. Useful for testing, demonstrations,
 * and educational purposes.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ProposalTemplate {
  id: string;
  title: string;
  category: 'membership' | 'treasury' | 'governance' | 'technical' | 'legal' | 'partnership';
  description: string;
  rationale: string;
  implementation: string[];
  impact: {
    membership?: string;
    treasury?: string;
    governance?: string;
    technical?: string;
    legal?: string;
  };
  votingThreshold: string;
  duration: number; // in days
  tags: string[];
}

export interface GeneratedProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  category: string;
  status: 'draft' | 'pending' | 'active' | 'executed' | 'rejected';
  timestamp: string;
  votesFor: number;
  votesAgainst: number;
  votingThreshold: string;
  votingDuration: number;
  rationale: string;
  implementation: string[];
  impact: Record<string, string>;
  tags: string[];
}

export class ProposalGenerator {
  private templates: ProposalTemplate[] = [];
  private members: string[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize proposal templates based on LexDAO constitution and common scenarios
   */
  private initializeTemplates(): void {
    this.templates = [
      // Membership Proposals
      {
        id: 'membership_bootcamp',
        title: 'Fund Legal Engineering Bootcamp',
        category: 'membership',
        description: 'Allocate treasury funds to organize a comprehensive legal engineering bootcamp for new and existing members.',
        rationale: 'Investing in member education strengthens the DAO and ensures high-quality contributions.',
        implementation: [
          'Allocate 2000 DAI from treasury',
          'Hire qualified instructors',
          'Set up 4-week intensive program',
          'Provide certificates upon completion'
        ],
        impact: {
          membership: 'Increase member skills and engagement',
          treasury: 'Short-term expenditure for long-term value'
        },
        votingThreshold: 'Simple Majority',
        duration: 7,
        tags: ['education', 'skill-building', 'member-development']
      },
      {
        id: 'membership_mentorship',
        title: 'Implement Mentorship Program',
        category: 'membership',
        description: 'Establish a structured mentorship program pairing experienced members with newcomers.',
        rationale: 'Accelerate onboarding and knowledge transfer within the DAO.',
        implementation: [
          'Create mentorship matching algorithm',
          'Establish mentorship guidelines',
          'Set up progress tracking',
          'Provide recognition for active mentors'
        ],
        impact: {
          membership: 'Faster integration of new members',
          governance: 'Improved knowledge distribution'
        },
        votingThreshold: 'Simple Majority',
        duration: 5,
        tags: ['mentorship', 'onboarding', 'knowledge-transfer']
      },

      // Treasury Proposals
      {
        id: 'treasury_allocation',
        title: 'Treasury Diversification Strategy',
        category: 'treasury',
        description: 'Implement a comprehensive treasury diversification strategy across multiple assets and protocols.',
        rationale: 'Reduce risk and optimize returns through strategic asset allocation.',
        implementation: [
          'Allocate 30% to stablecoins',
          'Allocate 40% to ETH and L2 tokens',
          'Allocate 20% to DeFi protocols',
          'Allocate 10% to NFT and collectibles'
        ],
        impact: {
          treasury: 'Improved risk-adjusted returns',
          governance: 'Longer-term financial stability'
        },
        votingThreshold: '2/3 Majority',
        duration: 10,
        tags: ['treasury', 'diversification', 'risk-management']
      },
      {
        id: 'treasury_grants',
        title: 'Establish Grant Program',
        category: 'treasury',
        description: 'Create a grants program to fund external projects that align with LexDAO mission.',
        rationale: 'Support ecosystem development and build strategic partnerships.',
        implementation: [
          'Allocate 5000 DAI for initial grant pool',
          'Establish grant committee',
          'Create application and review process',
          'Set up milestone-based funding'
        ],
        impact: {
          treasury: 'Strategic allocation for ecosystem growth',
          governance: 'Influence on broader legal tech space'
        },
        votingThreshold: 'Simple Majority',
        duration: 7,
        tags: ['grants', 'ecosystem', 'partnerships']
      },

      // Governance Proposals
      {
        id: 'governance_voting',
        title: 'Quadratic Voting Implementation',
        category: 'governance',
        description: 'Implement quadratic voting mechanism for proposal decisions to better reflect member preferences.',
        rationale: 'Quadratic voting gives more nuanced representation of member preferences.',
        implementation: [
          'Deploy quadratic voting smart contract',
          'Update voting interface',
          'Educate members on new system',
          'Phase in gradually over 3 months'
        ],
        impact: {
          governance: 'More democratic decision-making',
          membership: 'Better representation of diverse views'
        },
        votingThreshold: '2/3 Majority',
        duration: 14,
        tags: ['voting', 'quadratic', 'democracy']
      },
      {
        id: 'governance_transparency',
        title: 'Enhanced Transparency Dashboard',
        category: 'governance',
        description: 'Build comprehensive transparency dashboard showing all DAO activities and financials.',
        rationale: 'Improve accountability and member trust through better visibility.',
        implementation: [
          'Develop real-time dashboard',
          'Integrate with existing systems',
          'Add data export capabilities',
          'Implement privacy-preserving features'
        ],
        impact: {
          governance: 'Increased accountability',
          membership: 'Better informed participation'
        },
        votingThreshold: 'Simple Majority',
        duration: 10,
        tags: ['transparency', 'dashboard', 'accountability']
      },

      // Technical Proposals
      {
        id: 'technical_upgrade',
        title: 'Smart Contract Security Audit',
        category: 'technical',
        description: 'Conduct comprehensive security audit of all LexDAO smart contracts.',
        rationale: 'Ensure the security and reliability of DAO infrastructure.',
        implementation: [
          'Hire reputable audit firm',
          'Comprehensive code review',
          'Fix identified vulnerabilities',
          'Implement ongoing monitoring'
        ],
        impact: {
          technical: 'Enhanced security posture',
          governance: 'Reduced operational risk'
        },
        votingThreshold: '2/3 Majority',
        duration: 21,
        tags: ['security', 'audit', 'smart-contracts']
      },
      {
        id: 'technical_scaling',
        title: 'Layer 2 Migration Strategy',
        category: 'technical',
        description: 'Migrate DAO operations to Layer 2 solutions for improved scalability and reduced costs.',
        rationale: 'Reduce gas costs and improve user experience.',
        implementation: [
          'Evaluate L2 solutions (Arbitrum, Optimism)',
          'Deploy bridge contracts',
          'Migrate governance contracts',
          'Update member interfaces'
        ],
        impact: {
          technical: 'Lower transaction costs',
          treasury: 'Reduced operational expenses'
        },
        votingThreshold: '2/3 Majority',
        duration: 30,
        tags: ['layer2', 'scaling', 'gas-optimization']
      },

      // Legal Proposals
      {
        id: 'legal_compliance',
        title: 'Regulatory Compliance Framework',
        category: 'legal',
        description: 'Establish comprehensive regulatory compliance framework for international operations.',
        rationale: 'Ensure DAO can operate legally across jurisdictions.',
        implementation: [
          'Legal jurisdiction analysis',
          'Compliance policy development',
          'Legal counsel engagement',
          'Regular compliance audits'
        ],
        impact: {
          legal: 'Reduced regulatory risk',
          governance: 'Framework for international expansion'
        },
        votingThreshold: '2/3 Majority',
        duration: 21,
        tags: ['compliance', 'regulatory', 'international']
      },

      // Partnership Proposals
      {
        id: 'partnership_strategic',
        title: 'Strategic Partnership with CodexDAO',
        category: 'partnership',
        description: 'Establish formal partnership with CodexDAO for collaborative legal tech development.',
        rationale: 'Leverage complementary strengths for mutual benefit.',
        implementation: [
          'Sign partnership agreement',
          'Establish joint working groups',
          'Coordinate development efforts',
          'Share resources and expertise'
        ],
        impact: {
          governance: 'Stronger ecosystem position',
          technical: 'Accelerated development'
        },
        votingThreshold: '2/3 Majority',
        duration: 14,
        tags: ['partnership', 'collaboration', 'ecosystem']
      }
    ];
  }

  /**
   * Set member addresses for realistic proposal generation
   */
  setMembers(members: string[]): void {
    this.members = members;
  }

  /**
   * Generate a single proposal based on template and randomization
   */
  generateProposal(template?: ProposalTemplate): GeneratedProposal {
    const selectedTemplate = template || this.getRandomTemplate();
    const proposer = this.getRandomMember();

    // Randomize some aspects for realism
    const statusOptions: GeneratedProposal['status'][] = ['draft', 'pending', 'active'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Generate realistic vote counts if not draft
    let votesFor = 0;
    let votesAgainst = 0;
    if (status !== 'draft' && status !== 'pending') {
      const totalMembers = this.members.length || 50;
      const participationRate = 0.6 + Math.random() * 0.3; // 60-90% participation
      const totalVotes = Math.floor(totalMembers * participationRate);

      if (status === 'executed') {
        // Successful proposals have more yes votes
        votesFor = Math.floor(totalVotes * (0.7 + Math.random() * 0.25));
        votesAgainst = totalVotes - votesFor;
      } else if (status === 'rejected') {
        // Failed proposals have more no votes
        votesAgainst = Math.floor(totalVotes * (0.7 + Math.random() * 0.25));
        votesFor = totalVotes - votesAgainst;
      } else {
        // Active proposals have mixed votes
        const split = 0.4 + Math.random() * 0.4; // 40-80% split
        votesFor = Math.floor(totalVotes * split);
        votesAgainst = totalVotes - votesFor;
      }
    }

    return {
      id: crypto.randomBytes(8).toString('hex'),
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      proposer,
      category: selectedTemplate.category,
      status,
      timestamp: this.generateRandomTimestamp(),
      votesFor,
      votesAgainst,
      votingThreshold: selectedTemplate.votingThreshold,
      votingDuration: selectedTemplate.duration,
      rationale: selectedTemplate.rationale,
      implementation: selectedTemplate.implementation,
      impact: selectedTemplate.impact,
      tags: selectedTemplate.tags
    };
  }

  /**
   * Generate multiple proposals for testing or demonstration
   */
  generateMultiple(count: number, options?: {
    categories?: string[];
    statuses?: GeneratedProposal['status'][];
  }): GeneratedProposal[] {
    const proposals: GeneratedProposal[] = [];

    for (let i = 0; i < count; i++) {
      let template = this.getRandomTemplate();

      // Filter by categories if specified
      if (options?.categories && options.categories.length > 0) {
        const filteredTemplates = this.templates.filter(t =>
          options.categories!.includes(t.category)
        );
        if (filteredTemplates.length > 0) {
          template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
        }
      }

      const proposal = this.generateProposal(template);

      // Override status if specified
      if (options?.statuses && options.statuses.length > 0) {
        proposal.status = options.statuses[Math.floor(Math.random() * options.statuses.length)];
      }

      proposals.push(proposal);
    }

    return proposals;
  }

  /**
   * Generate proposals for a specific scenario
   */
  generateScenario(scenario: 'new-dao' | 'growth-phase' | 'crisis-management' | 'expansion'): GeneratedProposal[] {
    switch (scenario) {
      case 'new-dao':
        return this.generateMultiple(5, {
          categories: ['membership', 'governance'],
          statuses: ['pending', 'active']
        });

      case 'growth-phase':
        return this.generateMultiple(7, {
          categories: ['treasury', 'partnership', 'technical'],
          statuses: ['active', 'executed']
        });

      case 'crisis-management':
        return this.generateMultiple(3, {
          categories: ['governance', 'legal'],
          statuses: ['active']
        });

      case 'expansion':
        return this.generateMultiple(8, {
          categories: ['partnership', 'treasury', 'membership'],
          statuses: ['pending', 'active', 'executed']
        });

      default:
        return this.generateMultiple(5);
    }
  }

  /**
   * Get a random proposal template
   */
  private getRandomTemplate(): ProposalTemplate {
    return this.templates[Math.floor(Math.random() * this.templates.length)];
  }

  /**
   * Get a random member address
   */
  private getRandomMember(): string {
    if (this.members.length === 0) {
      // Generate a fake address if no members set
      return '0x' + crypto.randomBytes(20).toString('hex');
    }
    return this.members[Math.floor(Math.random() * this.members.length)];
  }

  /**
   * Generate a random timestamp within the last year
   */
  private generateRandomTimestamp(): string {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const randomTime = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
    return new Date(randomTime).toISOString();
  }

  /**
   * Export proposals to various formats
   */
  async exportProposals(proposals: GeneratedProposal[], format: 'json' | 'csv' | 'markdown', outputPath: string): Promise<void> {
    switch (format) {
      case 'json':
        await fs.writeJson(outputPath, proposals, { spaces: 2 });
        break;

      case 'csv':
        await this.exportToCSV(proposals, outputPath);
        break;

      case 'markdown':
        await this.exportToMarkdown(proposals, outputPath);
        break;
    }
  }

  private async exportToCSV(proposals: GeneratedProposal[], outputPath: string): Promise<void> {
    const headers = [
      'id', 'title', 'category', 'status', 'proposer', 'timestamp',
      'votesFor', 'votesAgainst', 'votingThreshold', 'votingDuration',
      'tags', 'rationale'
    ];

    const csvData = [
      headers.join(','),
      ...proposals.map(p => [
        p.id,
        `"${p.title}"`,
        p.category,
        p.status,
        p.proposer,
        p.timestamp,
        p.votesFor,
        p.votesAgainst,
        `"${p.votingThreshold}"`,
        p.votingDuration,
        `"${p.tags.join(';')}"`,
        `"${p.rationale}"`
      ].join(','))
    ].join('\n');

    await fs.writeFile(outputPath, csvData);
  }

  private async exportToMarkdown(proposals: GeneratedProposal[], outputPath: string): Promise<void> {
    let markdown = `# LexDAO Governance Proposals\n\n`;
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;

    proposals.forEach((proposal, index) => {
      markdown += `## Proposal ${index + 1}: ${proposal.title}\n\n`;
      markdown += `**ID:** ${proposal.id}\n`;
      markdown += `**Category:** ${proposal.category}\n`;
      markdown += `**Status:** ${proposal.status}\n`;
      markdown += `**Proposer:** ${proposal.proposer}\n`;
      markdown += `**Timestamp:** ${proposal.timestamp}\n`;
      markdown += `**Voting:** ${proposal.votesFor} For, ${proposal.votesAgainst} Against\n`;
      markdown += `**Threshold:** ${proposal.votingThreshold}\n`;
      markdown += `**Duration:** ${proposal.votingDuration} days\n\n`;

      markdown += `### Description\n${proposal.description}\n\n`;
      markdown += `### Rationale\n${proposal.rationale}\n\n`;

      if (proposal.implementation.length > 0) {
        markdown += `### Implementation Steps\n`;
        proposal.implementation.forEach(step => {
          markdown += `- ${step}\n`;
        });
        markdown += '\n';
      }

      if (Object.keys(proposal.impact).length > 0) {
        markdown += `### Expected Impact\n`;
        Object.entries(proposal.impact).forEach(([area, description]) => {
          markdown += `- **${area}:** ${description}\n`;
        });
        markdown += '\n';
      }

      if (proposal.tags.length > 0) {
        markdown += `**Tags:** ${proposal.tags.join(', ')}\n`;
      }

      markdown += '\n---\n\n';
    });

    await fs.writeFile(outputPath, markdown);
  }

  /**
   * Get all available proposal templates
   */
  getTemplates(): ProposalTemplate[] {
    return [...this.templates];
  }

  /**
   * Filter templates by category
   */
  getTemplatesByCategory(category: ProposalTemplate['category']): ProposalTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Generate voting data for a proposal
   */
  generateVotingData(proposal: GeneratedProposal, memberCount?: number): any[] {
    const members = memberCount || this.members.length || 50;
    const votes = [];

    // Generate individual votes based on proposal outcome
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const forRatio = proposal.votesFor / totalVotes;

    for (let i = 0; i < totalVotes; i++) {
      const isForVote = i < proposal.votesFor;
      const voterIndex = Math.floor(Math.random() * members);
      const voter = this.members[voterIndex] || `0x${crypto.randomBytes(20).toString('hex')}`;

      votes.push({
        proposalId: proposal.id,
        voter,
        support: isForVote,
        votingPower: 1000, // Assuming standard voting power
        timestamp: this.generateRandomTimestamp()
      });
    }

    return votes;
  }
}

// CLI interface for the proposal generator
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node proposal-generator.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  generate <count> [--category <cat>] [--status <status>]  Generate proposals');
    console.log('  scenario <scenario> [--count <n>]                        Generate scenario proposals');
    console.log('  export <format> <file>                                   Export templates');
    console.log('  list                                                     List all templates');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node proposal-generator.ts generate 5');
    console.log('  ts-node proposal-generator.ts scenario growth-phase --count 10');
    console.log('  ts-node proposal-generator.ts export json templates.json');
    process.exit(1);
  }

  const command = args[0];

  try {
    const generator = new ProposalGenerator();

    switch (command) {
      case 'generate': {
        const count = parseInt(args[1]) || 5;
        const category = args.find((arg, i) => args[i-1] === '--category')?.split(' ')[0];
        const status = args.find((arg, i) => args[i-1] === '--status')?.split(' ')[0];

        const options: any = {};
        if (category) options.categories = [category];
        if (status) options.statuses = [status];

        const proposals = generator.generateMultiple(count, options);

        console.log(`Generated ${proposals.length} proposals:`);
        proposals.forEach((p, i) => {
          console.log(`${i+1}. [${p.category.toUpperCase()}] ${p.title} (${p.status})`);
        });

        // Export to JSON by default
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = `./proposals-${timestamp}.json`;
        await generator.exportProposals(proposals, 'json', outputPath);
        console.log(`\n📄 Exported to: ${outputPath}`);
        break;
      }

      case 'scenario': {
        const scenario = args[1] as any;
        const count = parseInt(args.find((arg, i) => args[i-1] === '--count') || '5');

        if (!scenario) {
          throw new Error('Scenario type required (new-dao, growth-phase, crisis-management, expansion)');
        }

        const proposals = generator.generateScenario(scenario);

        console.log(`Generated ${scenario} scenario with ${proposals.length} proposals:`);
        proposals.forEach((p, i) => {
          console.log(`${i+1}. [${p.category.toUpperCase()}] ${p.title} (${p.status})`);
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = `./proposals-${scenario}-${timestamp}.json`;
        await generator.exportProposals(proposals, 'json', outputPath);
        console.log(`\n📄 Exported to: ${outputPath}`);
        break;
      }

      case 'export': {
        const format = args[1];
        const file = args[2];

        if (!format || !file) {
          throw new Error('Format and file path required');
        }

        const templates = generator.getTemplates();
        await generator.exportProposals(templates.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          proposer: '',
          category: t.category,
          status: 'draft' as const,
          timestamp: new Date().toISOString(),
          votesFor: 0,
          votesAgainst: 0,
          votingThreshold: t.votingThreshold,
          votingDuration: t.duration,
          rationale: t.rationale,
          implementation: t.implementation,
          impact: t.impact,
          tags: t.tags
        })), format as any, file);

        console.log(`✅ Exported ${templates.length} templates to ${file}`);
        break;
      }

      case 'list': {
        const templates = generator.getTemplates();

        console.log(`Available Proposal Templates (${templates.length}):`);
        console.log('');

        const categories = [...new Set(templates.map(t => t.category))];
        categories.forEach(category => {
          console.log(`${category.toUpperCase()}:`);
          templates.filter(t => t.category === category).forEach(template => {
            console.log(`  • ${template.title}`);
          });
          console.log('');
        });
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ProposalGenerator };
