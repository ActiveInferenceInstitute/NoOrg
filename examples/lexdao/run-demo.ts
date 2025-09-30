/**
 * LexDAO Complete Demo Runner
 *
 * Orchestrates the complete LexDAO governance workflow demonstration including:
 * - Constitution analysis and parsing
 * - Proposal generation and simulation
 * - Workflow execution with all agents
 * - Visualization generation
 * - Analytics and reporting
 * - Data validation and quality checks
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { runLexDAOWorkflow } from './lexdao_workflow';
import { ConstitutionParser } from './constitution-parser';
import { ProposalGenerator } from './proposal-generator';
import { DAOAnalytics } from './dao-analytics';
import { DataValidator } from './utils/data-validator';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

export interface DemoOptions {
  skipConstitutionAnalysis?: boolean;
  skipProposalGeneration?: boolean;
  skipWorkflowExecution?: boolean;
  skipVisualization?: boolean;
  skipAnalytics?: boolean;
  skipValidation?: boolean;
  outputDir?: string;
  verbose?: boolean;
}

export interface DemoResult {
  success: boolean;
  duration: number;
  outputs: {
    constitutionAnalysis?: string;
    proposalData?: string;
    workflowOutput?: string;
    visualizations?: string[];
    analyticsReport?: string;
    validationReport?: string;
  };
  errors: string[];
  summary: string;
}

export class LexDAODemoRunner {
  private options: DemoOptions;
  private startTime: number;
  private outputs: DemoResult['outputs'] = {};
  private errors: string[] = [];

  constructor(options: DemoOptions = {}) {
    this.options = {
      outputDir: process.env.OUTPUT_DIR || path.join(__dirname, '../../output'),
      verbose: false,
      ...options
    };
    this.startTime = Date.now();
  }

  /**
   * Run the complete LexDAO demonstration
   */
  async run(): Promise<DemoResult> {
    console.log('🚀 Starting LexDAO Complete Governance Demo');
    console.log('============================================\n');

    try {
      // Step 1: Constitution Analysis
      if (!this.options.skipConstitutionAnalysis) {
        await this.runConstitutionAnalysis();
      }

      // Step 2: Proposal Generation
      if (!this.options.skipProposalGeneration) {
        await this.runProposalGeneration();
      }

      // Step 3: Main Workflow Execution
      if (!this.options.skipWorkflowExecution) {
        await this.runWorkflowExecution();
      }

      // Step 4: Visualization Generation
      if (!this.options.skipVisualization) {
        await this.runVisualizationGeneration();
      }

      // Step 5: Analytics and Insights
      if (!this.options.skipAnalytics) {
        await this.runAnalyticsGeneration();
      }

      // Step 6: Data Validation
      if (!this.options.skipValidation) {
        await this.runDataValidation();
      }

      // Generate final summary
      const duration = Date.now() - this.startTime;
      const summary = this.generateSummary();

      const result: DemoResult = {
        success: this.errors.length === 0,
        duration,
        outputs: this.outputs,
        errors: this.errors,
        summary
      };

      console.log(`\n${result.success ? '✅' : '⚠️'} Demo completed in ${duration}ms`);
      if (result.errors.length > 0) {
        console.log(`❌ Errors encountered: ${result.errors.length}`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - this.startTime;
      console.error(`❌ Demo failed after ${duration}ms:`, error);

      return {
        success: false,
        duration,
        outputs: this.outputs,
        errors: [error.message || String(error)],
        summary: `Demo failed: ${error.message || String(error)}`
      };
    }
  }

  /**
   * Step 1: Analyze the LexDAO Constitution
   */
  private async runConstitutionAnalysis(): Promise<void> {
    console.log('📜 Step 1: Constitution Analysis');
    console.log('--------------------------------');

    try {
      const constitutionPath = path.join(__dirname, 'lexdao_constitution.md');
      const parser = new ConstitutionParser(constitutionPath);

      console.log('   Parsing constitution document...');
      const analysis = await parser.parse();

      console.log('   Generating analysis reports...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const analysisDir = path.join(this.options.outputDir!, 'constitution-analysis');

      await fs.ensureDir(analysisDir);

      const jsonPath = path.join(analysisDir, `analysis-${timestamp}.json`);
      const markdownPath = path.join(analysisDir, `analysis-${timestamp}.md`);

      await parser.exportToJSON(jsonPath);
      await parser.exportToMarkdown(markdownPath);

      this.outputs.constitutionAnalysis = analysisDir;

      console.log(`   ✅ Constitution analysis completed`);
      console.log(`      📄 JSON: ${jsonPath}`);
      console.log(`      📝 Markdown: ${markdownPath}`);
      console.log(`      📊 Articles: ${analysis.metadata.totalArticles}`);
      console.log(`      📋 Sections: ${analysis.metadata.totalSections}`);
      console.log(`      🎯 Governance Score: ${analysis.analysis.governanceScore}/100`);

      if (this.options.verbose) {
        console.log(`      💡 Recommendations: ${analysis.analysis.recommendations.length}`);
      }

    } catch (error) {
      const errorMsg = `Constitution analysis failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      throw error;
    }

    console.log('');
  }

  /**
   * Step 2: Generate realistic governance proposals
   */
  private async runProposalGeneration(): Promise<void> {
    console.log('📋 Step 2: Proposal Generation');
    console.log('------------------------------');

    try {
      const generator = new ProposalGenerator();

      console.log('   Generating sample members...');
      // Generate sample members for realistic proposals
      const sampleMembers = Array.from({ length: 50 }, (_, i) => ({
        address: `0x${i.toString(16).padStart(40, '0')}`,
        joined: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        tokens: 1000,
        votes: Math.floor(Math.random() * 20),
        proposals: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        lastActivity: new Date().toISOString()
      }));

      generator.setMembers(sampleMembers.map(m => m.address));

      console.log('   Generating governance proposals...');
      const proposals = generator.generateMultiple(15, {
        categories: ['membership', 'treasury', 'governance', 'technical', 'legal', 'partnership']
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const proposalsDir = path.join(this.options.outputDir!, 'proposals');
      await fs.ensureDir(proposalsDir);

      const proposalsPath = path.join(proposalsDir, `proposals-${timestamp}.json`);
      await generator.exportProposals(proposals, 'json', proposalsPath);

      this.outputs.proposalData = proposalsDir;

      console.log(`   ✅ Proposal generation completed`);
      console.log(`      📄 Proposals: ${proposalsPath}`);
      console.log(`      📊 Generated: ${proposals.length} proposals`);

      if (this.options.verbose) {
        const categories = [...new Set(proposals.map(p => p.category))];
        console.log(`      🏷️  Categories: ${categories.join(', ')}`);
      }

    } catch (error) {
      const errorMsg = `Proposal generation failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      throw error;
    }

    console.log('');
  }

  /**
   * Step 3: Execute the main governance workflow
   */
  private async runWorkflowExecution(): Promise<void> {
    console.log('⚙️  Step 3: Workflow Execution');
    console.log('-----------------------------');

    try {
      console.log('   Running LexDAO governance workflow...');
      console.log('   This may take several minutes...');

      const workflowOutput = await runLexDAOWorkflow();

      this.outputs.workflowOutput = workflowOutput;

      console.log(`   ✅ Workflow execution completed`);
      console.log(`      📁 Output directory: ${workflowOutput}`);

      // Check for generated files
      const files = await fs.readdir(workflowOutput);
      const outputFiles = files.filter(f => !f.startsWith('.'));
      console.log(`      📄 Generated files: ${outputFiles.length}`);

      if (this.options.verbose && outputFiles.length > 0) {
        outputFiles.slice(0, 5).forEach(file => {
          console.log(`         • ${file}`);
        });
        if (outputFiles.length > 5) {
          console.log(`         ... and ${outputFiles.length - 5} more files`);
        }
      }

    } catch (error) {
      const errorMsg = `Workflow execution failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      throw error;
    }

    console.log('');
  }

  /**
   * Step 4: Generate visualizations
   */
  private async runVisualizationGeneration(): Promise<void> {
    console.log('📊 Step 4: Visualization Generation');
    console.log('----------------------------------');

    try {
      // Check if workflow outputs exist
      if (!this.outputs.workflowOutput) {
        throw new Error('Workflow must be executed before visualization generation');
      }

      const workflowOutputsPath = path.join(this.outputs.workflowOutput, 'workflow_outputs.json');
      if (!await fs.pathExists(workflowOutputsPath)) {
        throw new Error('Workflow outputs not found');
      }

      console.log('   Running Python visualization script...');

      // Import and run the Python visualizer
      const { spawn } = require('child_process');
      const pythonProcess = spawn('python3', [
        path.join(__dirname, 'lexdao_visualizer.py'),
        '--output-dir',
        this.outputs.workflowOutput
      ], {
        stdio: 'pipe',
        cwd: __dirname
      });

      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
          if (this.options.verbose) {
            console.log(`   ${data.toString().trim()}`);
          }
        });

        pythonProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
          console.error(`   ${data.toString().trim()}`);
        });

        pythonProcess.on('close', async (code: number) => {
          if (code === 0) {
            console.log(`   ✅ Visualization generation completed`);

            // List generated visualizations
            try {
              const vizDir = path.join(this.outputs.workflowOutput, 'visualizations');
              if (await fs.pathExists(vizDir)) {
                const vizFiles = await fs.readdir(vizDir);
                this.outputs.visualizations = vizFiles.map(f => path.join(vizDir, f));

                console.log(`      🎨 Generated: ${vizFiles.length} visualizations`);
                if (this.options.verbose && vizFiles.length > 0) {
                  vizFiles.forEach(file => {
                    console.log(`         • ${file}`);
                  });
                }
              }
            } catch (listError) {
              console.warn(`   ⚠️  Could not list visualization files: ${listError.message}`);
            }

            resolve();
          } else {
            const errorMsg = `Visualization script failed with code ${code}: ${stderr}`;
            console.error(`   ❌ ${errorMsg}`);
            this.errors.push(errorMsg);
            reject(new Error(errorMsg));
          }
        });

        pythonProcess.on('error', (error: Error) => {
          const errorMsg = `Failed to start visualization script: ${error.message}`;
          console.error(`   ❌ ${errorMsg}`);
          this.errors.push(errorMsg);
          reject(error);
        });
      });

    } catch (error) {
      const errorMsg = `Visualization generation failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      throw error;
    }

    console.log('');
  }

  /**
   * Step 5: Generate analytics and insights
   */
  private async runAnalyticsGeneration(): Promise<void> {
    console.log('📈 Step 5: Analytics Generation');
    console.log('-------------------------------');

    try {
      // Use workflow outputs for analytics
      if (!this.outputs.workflowOutput) {
        throw new Error('Workflow must be executed before analytics generation');
      }

      const workflowOutputsPath = path.join(this.outputs.workflowOutput, 'workflow_outputs.json');
      if (!await fs.pathExists(workflowOutputsPath)) {
        throw new Error('Workflow outputs not found for analytics');
      }

      console.log('   Generating comprehensive analytics...');

      const analytics = new DAOAnalytics(workflowOutputsPath);
      const report = await analytics.generateAnalytics();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const analyticsDir = path.join(this.outputs.workflowOutput, 'analytics');
      await fs.ensureDir(analyticsDir);

      const reportPath = path.join(analyticsDir, `analytics-report-${timestamp}.json`);
      await analytics.exportReport(report, 'json', reportPath);

      // Also generate HTML report for web viewing
      const htmlPath = path.join(analyticsDir, `analytics-report-${timestamp}.html`);
      await analytics.exportReport(report, 'html', htmlPath);

      this.outputs.analyticsReport = analyticsDir;

      console.log(`   ✅ Analytics generation completed`);
      console.log(`      📊 Overview: ${report.overview.totalMembers} members, ${report.overview.totalProposals} proposals`);
      console.log(`      📈 Governance Score: ${report.insights.governance.proposalSuccessRate.toFixed(1)}%`);
      console.log(`      📄 JSON: ${reportPath}`);
      console.log(`      🌐 HTML: ${htmlPath}`);

      if (this.options.verbose && report.recommendations.length > 0) {
        console.log(`      💡 Top recommendation: ${report.recommendations[0].title}`);
      }

    } catch (error) {
      const errorMsg = `Analytics generation failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      throw error;
    }

    console.log('');
  }

  /**
   * Step 6: Validate all generated data
   */
  private async runDataValidation(): Promise<void> {
    console.log('🔍 Step 6: Data Validation');
    console.log('--------------------------');

    try {
      // Validate workflow outputs if available
      if (this.outputs.workflowOutput) {
        const workflowOutputsPath = path.join(this.outputs.workflowOutput, 'workflow_outputs.json');
        if (await fs.pathExists(workflowOutputsPath)) {
          console.log('   Validating workflow outputs...');

          const validator = new DataValidator();
          const data = JSON.parse(await fs.readFile(workflowOutputsPath, 'utf-8'));
          const result = await validator.validateData(data);

          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const validationDir = path.join(this.outputs.workflowOutput, 'validation');
          await fs.ensureDir(validationDir);

          const reportPath = path.join(validationDir, `validation-report-${timestamp}.json`);
          await validator.generateReport(result, reportPath);

          this.outputs.validationReport = validationDir;

          console.log(`   ✅ Data validation completed`);
          console.log(`      📊 Quality Score: ${result.summary.score}/100`);
          console.log(`      ✅ Valid: ${result.isValid ? 'Yes' : 'No'}`);
          console.log(`      🔴 Errors: ${result.errors.length}`);
          console.log(`      🟡 Warnings: ${result.warnings.length}`);
          console.log(`      📄 Report: ${reportPath}`);

          if (!result.isValid) {
            console.log(`   ⚠️  Data validation found errors - check report for details`);
          }
        }
      } else {
        console.log('   ⚠️  Skipping validation - workflow outputs not available');
      }

    } catch (error) {
      const errorMsg = `Data validation failed: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      this.errors.push(errorMsg);
      // Don't throw - validation failure shouldn't stop the demo
    }

    console.log('');
  }

  /**
   * Generate a comprehensive summary of the demo execution
   */
  private generateSummary(): string {
    const duration = Date.now() - this.startTime;
    const outputCount = Object.keys(this.outputs).length;

    let summary = `LexDAO Governance Demo completed in ${duration}ms\n`;
    summary += `Generated ${outputCount} output categories:\n`;

    if (this.outputs.constitutionAnalysis) {
      summary += `• Constitution Analysis: ${this.outputs.constitutionAnalysis}\n`;
    }
    if (this.outputs.proposalData) {
      summary += `• Proposal Data: ${this.outputs.proposalData}\n`;
    }
    if (this.outputs.workflowOutput) {
      summary += `• Workflow Output: ${this.outputs.workflowOutput}\n`;
    }
    if (this.outputs.visualizations && this.outputs.visualizations.length > 0) {
      summary += `• Visualizations: ${this.outputs.visualizations.length} files\n`;
    }
    if (this.outputs.analyticsReport) {
      summary += `• Analytics Report: ${this.outputs.analyticsReport}\n`;
    }
    if (this.outputs.validationReport) {
      summary += `• Validation Report: ${this.outputs.validationReport}\n`;
    }

    if (this.errors.length > 0) {
      summary += `\nErrors encountered (${this.errors.length}):\n`;
      this.errors.forEach(error => {
        summary += `• ${error}\n`;
      });
    }

    return summary;
  }

  /**
   * Get the demo outputs for further processing
   */
  getOutputs(): DemoResult['outputs'] {
    return this.outputs;
  }

  /**
   * Get any errors that occurred during execution
   */
  getErrors(): string[] {
    return this.errors;
  }
}

// CLI interface for the demo runner
async function main() {
  const args = process.argv.slice(2);

  // Parse command line options
  const options: DemoOptions = {
    outputDir: process.env.OUTPUT_DIR || path.join(__dirname, '../../output'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };

  // Check for skip options
  options.skipConstitutionAnalysis = args.includes('--skip-constitution');
  options.skipProposalGeneration = args.includes('--skip-proposals');
  options.skipWorkflowExecution = args.includes('--skip-workflow');
  options.skipVisualization = args.includes('--skip-visualization');
  options.skipAnalytics = args.includes('--skip-analytics');
  options.skipValidation = args.includes('--skip-validation');

  // Custom output directory
  const outputDirIndex = args.findIndex(arg => arg === '--output-dir' || arg === '-o');
  if (outputDirIndex >= 0 && args[outputDirIndex + 1]) {
    options.outputDir = args[outputDirIndex + 1];
  }

  try {
    const demo = new LexDAODemoRunner(options);
    const result = await demo.run();

    if (result.success) {
      console.log('\n🎉 Demo completed successfully!');
      console.log('\n📁 Output locations:');
      Object.entries(result.outputs).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      console.log('\n🔗 Next steps:');
      console.log('   • View HTML reports in your browser');
      console.log('   • Analyze JSON data files');
      console.log('   • Run individual components for customization');
      console.log('   • Check validation reports for data quality');

      process.exit(0);
    } else {
      console.log('\n⚠️  Demo completed with errors');
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Demo runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { LexDAODemoRunner };
