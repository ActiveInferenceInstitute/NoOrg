/**
 * LexDAO Data Validator
 *
 * Validates data integrity and consistency across LexDAO governance data structures.
 * Ensures data quality for reliable analytics and visualization.
 */

import * as fs from 'fs-extra';
import * as crypto from 'crypto';

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'unique' | 'reference' | 'custom';
  validator?: (value: any, data: any) => boolean;
  message?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  field: string;
  value: any;
  rule: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  value: any;
  rule: string;
  message: string;
  severity: 'warning' | 'info';
}

export interface ValidationSummary {
  totalFields: number;
  validatedFields: number;
  errors: number;
  warnings: number;
  score: number; // 0-100 quality score
}

export class DataValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Initialize comprehensive validation rules for LexDAO data structures
   */
  private initializeValidationRules(): void {
    // Member validation rules
    this.rules.set('member', [
      {
        field: 'address',
        type: 'required',
        message: 'Member address is required',
        severity: 'error'
      },
      {
        field: 'address',
        type: 'format',
        validator: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
        message: 'Address must be valid Ethereum address format',
        severity: 'error'
      },
      {
        field: 'joined',
        type: 'required',
        message: 'Join date is required',
        severity: 'error'
      },
      {
        field: 'joined',
        type: 'format',
        validator: (value: string) => !isNaN(Date.parse(value)),
        message: 'Join date must be valid ISO date string',
        severity: 'error'
      },
      {
        field: 'status',
        type: 'format',
        validator: (value: string) => ['active', 'inactive'].includes(value),
        message: 'Status must be either "active" or "inactive"',
        severity: 'error'
      },
      {
        field: 'tokens',
        type: 'range',
        validator: (value: number) => value >= 0 && value <= 10000,
        message: 'Token count must be between 0 and 10000',
        severity: 'warning'
      },
      {
        field: 'votes',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'Vote count cannot be negative',
        severity: 'error'
      },
      {
        field: 'proposals',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'Proposal count cannot be negative',
        severity: 'error'
      }
    ]);

    // Proposal validation rules
    this.rules.set('proposal', [
      {
        field: 'id',
        type: 'required',
        message: 'Proposal ID is required',
        severity: 'error'
      },
      {
        field: 'title',
        type: 'required',
        message: 'Proposal title is required',
        severity: 'error'
      },
      {
        field: 'title',
        type: 'range',
        validator: (value: string) => value.length >= 5 && value.length <= 200,
        message: 'Title must be between 5 and 200 characters',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'required',
        message: 'Proposal description is required',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'range',
        validator: (value: string) => value.length >= 20 && value.length <= 2000,
        message: 'Description must be between 20 and 2000 characters',
        severity: 'warning'
      },
      {
        field: 'category',
        type: 'format',
        validator: (value: string) => ['membership', 'treasury', 'governance', 'technical', 'legal', 'partnership'].includes(value),
        message: 'Category must be one of: membership, treasury, governance, technical, legal, partnership',
        severity: 'error'
      },
      {
        field: 'status',
        type: 'format',
        validator: (value: string) => ['draft', 'pending', 'active', 'executed', 'rejected'].includes(value),
        message: 'Status must be one of: draft, pending, active, executed, rejected',
        severity: 'error'
      },
      {
        field: 'proposer',
        type: 'required',
        message: 'Proposer address is required',
        severity: 'error'
      },
      {
        field: 'proposer',
        type: 'format',
        validator: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
        message: 'Proposer must be valid Ethereum address',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'required',
        message: 'Timestamp is required',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'format',
        validator: (value: string) => !isNaN(Date.parse(value)),
        message: 'Timestamp must be valid ISO date string',
        severity: 'error'
      },
      {
        field: 'votesFor',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'Votes for count cannot be negative',
        severity: 'error'
      },
      {
        field: 'votesAgainst',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'Votes against count cannot be negative',
        severity: 'error'
      },
      {
        field: 'duration',
        type: 'range',
        validator: (value: number) => value >= 1 && value <= 90,
        message: 'Voting duration must be between 1 and 90 days',
        severity: 'warning'
      }
    ]);

    // Vote validation rules
    this.rules.set('vote', [
      {
        field: 'proposalId',
        type: 'required',
        message: 'Proposal ID is required',
        severity: 'error'
      },
      {
        field: 'voter',
        type: 'required',
        message: 'Voter address is required',
        severity: 'error'
      },
      {
        field: 'voter',
        type: 'format',
        validator: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
        message: 'Voter must be valid Ethereum address',
        severity: 'error'
      },
      {
        field: 'support',
        type: 'format',
        validator: (value: boolean) => typeof value === 'boolean',
        message: 'Support must be boolean (true/false)',
        severity: 'error'
      },
      {
        field: 'votingPower',
        type: 'range',
        validator: (value: number) => value > 0 && value <= 10000,
        message: 'Voting power must be between 1 and 10000',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'required',
        message: 'Vote timestamp is required',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'format',
        validator: (value: string) => !isNaN(Date.parse(value)),
        message: 'Vote timestamp must be valid ISO date string',
        severity: 'error'
      }
    ]);

    // Treasury validation rules
    this.rules.set('treasury', [
      {
        field: 'eth',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'ETH balance cannot be negative',
        severity: 'error'
      },
      {
        field: 'dai',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'DAI balance cannot be negative',
        severity: 'error'
      },
      {
        field: 'usdc',
        type: 'range',
        validator: (value: number) => value >= 0,
        message: 'USDC balance cannot be negative',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'required',
        message: 'Treasury timestamp is required',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'format',
        validator: (value: string) => !isNaN(Date.parse(value)),
        message: 'Treasury timestamp must be valid ISO date string',
        severity: 'error'
      }
    ]);

    // Activity validation rules
    this.rules.set('activity', [
      {
        field: 'type',
        type: 'format',
        validator: (value: string) => ['proposal', 'vote', 'execution', 'membership'].includes(value),
        message: 'Activity type must be one of: proposal, vote, execution, membership',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'required',
        message: 'Activity description is required',
        severity: 'error'
      },
      {
        field: 'actor',
        type: 'required',
        message: 'Activity actor is required',
        severity: 'error'
      },
      {
        field: 'actor',
        type: 'format',
        validator: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
        message: 'Actor must be valid Ethereum address',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'required',
        message: 'Activity timestamp is required',
        severity: 'error'
      },
      {
        field: 'timestamp',
        type: 'format',
        validator: (value: string) => !isNaN(Date.parse(value)),
        message: 'Activity timestamp must be valid ISO date string',
        severity: 'error'
      }
    ]);
  }

  /**
   * Validate a complete dataset
   */
  async validateData(data: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let totalFields = 0;
    let validatedFields = 0;

    // Validate members
    if (data.members && Array.isArray(data.members)) {
      data.members.forEach((member: any, index: number) => {
        const result = this.validateObject(member, 'member', `members[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        totalFields += Object.keys(member || {}).length;
        validatedFields += result.validatedFields;
      });
    }

    // Validate proposals
    if (data.proposals && Array.isArray(data.proposals)) {
      data.proposals.forEach((proposal: any, index: number) => {
        const result = this.validateObject(proposal, 'proposal', `proposals[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        totalFields += Object.keys(proposal || {}).length;
        validatedFields += result.validatedFields;
      });
    }

    // Validate votes
    if (data.votes && Array.isArray(data.votes)) {
      data.votes.forEach((vote: any, index: number) => {
        const result = this.validateObject(vote, 'vote', `votes[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        totalFields += Object.keys(vote || {}).length;
        validatedFields += result.validatedFields;
      });
    }

    // Validate treasury data
    if (data.treasury && Array.isArray(data.treasury)) {
      data.treasury.forEach((treasury: any, index: number) => {
        const result = this.validateObject(treasury, 'treasury', `treasury[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        totalFields += Object.keys(treasury || {}).length;
        validatedFields += result.validatedFields;
      });
    }

    // Validate activities
    if (data.activities && Array.isArray(data.activities)) {
      data.activities.forEach((activity: any, index: number) => {
        const result = this.validateObject(activity, 'activity', `activities[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        totalFields += Object.keys(activity || {}).length;
        validatedFields += result.validatedFields;
      });
    }

    // Cross-reference validation
    this.validateCrossReferences(data, errors, warnings);

    // Calculate quality score
    const totalIssues = errors.length + warnings.length;
    const maxPossibleIssues = totalFields * 0.1; // Assume 10% of fields might have issues
    const score = Math.max(0, 100 - (totalIssues / maxPossibleIssues) * 100);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalFields,
        validatedFields,
        errors: errors.length,
        warnings: warnings.length,
        score: Math.round(score)
      }
    };
  }

  /**
   * Validate a single object against its rules
   */
  private validateObject(obj: any, type: string, path: string): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    validatedFields: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validatedFields = 0;

    if (!obj || typeof obj !== 'object') {
      return { errors, warnings, validatedFields };
    }

    const rules = this.rules.get(type);
    if (!rules) {
      return { errors, warnings, validatedFields };
    }

    rules.forEach(rule => {
      const value = obj[rule.field];
      validatedFields++;

      try {
        let isValid = true;

        switch (rule.type) {
          case 'required':
            isValid = value != null && value !== '';
            break;

          case 'format':
            if (rule.validator) {
              isValid = rule.validator(value, obj);
            } else {
              isValid = true; // Assume valid if no validator
            }
            break;

          case 'range':
            if (rule.validator) {
              isValid = rule.validator(value, obj);
            } else {
              isValid = true;
            }
            break;

          case 'unique':
            // Unique validation would need to be handled at dataset level
            isValid = true;
            break;

          case 'reference':
            // Reference validation would need to be handled at dataset level
            isValid = true;
            break;

          case 'custom':
            if (rule.validator) {
              isValid = rule.validator(value, obj);
            } else {
              isValid = true;
            }
            break;

          default:
            isValid = true;
        }

        if (!isValid) {
          const message = rule.message || `Validation failed for field ${rule.field}`;
          const validationIssue = {
            field: `${path}.${rule.field}`,
            value,
            rule: rule.type,
            message,
            severity: rule.severity
          };

          if (rule.severity === 'error') {
            errors.push(validationIssue as ValidationError);
          } else {
            warnings.push(validationIssue as ValidationWarning);
          }
        }
      } catch (error) {
        const errorMessage = `Error validating ${path}.${rule.field}: ${error}`;
        if (rule.severity === 'error') {
          errors.push({
            field: `${path}.${rule.field}`,
            value,
            rule: rule.type,
            message: errorMessage,
            severity: 'error'
          });
        } else {
          warnings.push({
            field: `${path}.${rule.field}`,
            value,
            rule: rule.type,
            message: errorMessage,
            severity: rule.severity
          });
        }
      }
    });

    return { errors, warnings, validatedFields };
  }

  /**
   * Validate cross-references between data entities
   */
  private validateCrossReferences(data: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validate that proposal IDs in votes exist in proposals
    if (data.votes && data.proposals) {
      const proposalIds = new Set(data.proposals.map((p: any) => p.id));

      data.votes.forEach((vote: any, index: number) => {
        if (!proposalIds.has(vote.proposalId)) {
          errors.push({
            field: `votes[${index}].proposalId`,
            value: vote.proposalId,
            rule: 'reference',
            message: `Proposal ID ${vote.proposalId} not found in proposals`,
            severity: 'error'
          });
        }
      });
    }

    // Validate that proposer addresses exist in members
    if (data.proposals && data.members) {
      const memberAddresses = new Set(data.members.map((m: any) => m.address));

      data.proposals.forEach((proposal: any, index: number) => {
        if (!memberAddresses.has(proposal.proposer)) {
          warnings.push({
            field: `proposals[${index}].proposer`,
            value: proposal.proposer,
            rule: 'reference',
            message: `Proposer ${proposal.proposer} not found in members (might be external)`,
            severity: 'warning'
          });
        }
      });
    }

    // Validate that voter addresses exist in members
    if (data.votes && data.members) {
      const memberAddresses = new Set(data.members.map((m: any) => m.address));

      data.votes.forEach((vote: any, index: number) => {
        if (!memberAddresses.has(vote.voter)) {
          warnings.push({
            field: `votes[${index}].voter`,
            value: vote.voter,
            rule: 'reference',
            message: `Voter ${vote.voter} not found in members (might be external)`,
            severity: 'warning'
          });
        }
      });
    }
  }

  /**
   * Generate a validation report
   */
  async generateReport(result: ValidationResult, outputPath: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      errors: result.errors,
      warnings: result.warnings,
      recommendations: this.generateRecommendations(result)
    };

    await fs.writeJson(outputPath, report, { spaces: 2 });
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(result: ValidationResult): string[] {
    const recommendations: string[] = [];

    if (result.errors.length > 0) {
      recommendations.push(`Fix ${result.errors.length} validation errors before proceeding with analysis`);
    }

    if (result.warnings.length > result.summary.totalFields * 0.1) {
      recommendations.push('Consider reviewing warnings for data quality improvements');
    }

    if (result.summary.score < 80) {
      recommendations.push('Data quality is below recommended threshold (80%). Consider data cleanup.');
    }

    if (result.summary.validatedFields < result.summary.totalFields) {
      recommendations.push('Some fields were not validated. Consider adding validation rules.');
    }

    return recommendations;
  }

  /**
   * Add custom validation rule
   */
  addRule(type: string, rule: ValidationRule): void {
    if (!this.rules.has(type)) {
      this.rules.set(type, []);
    }
    this.rules.get(type)!.push(rule);
  }

  /**
   * Remove validation rule
   */
  removeRule(type: string, field: string): void {
    if (this.rules.has(type)) {
      const rules = this.rules.get(type)!;
      const index = rules.findIndex(r => r.field === field);
      if (index >= 0) {
        rules.splice(index, 1);
      }
    }
  }

  /**
   * Get all validation rules for a type
   */
  getRules(type: string): ValidationRule[] {
    return this.rules.get(type) || [];
  }
}

// CLI interface for data validation
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node data-validator.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  validate <data-file>           Validate data file');
    console.log('  report <data-file> <output>    Generate validation report');
    console.log('  rules <type>                   Show validation rules for type');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node data-validator.ts validate workflow_outputs.json');
    console.log('  ts-node data-validator.ts report workflow_outputs.json report.json');
    console.log('  ts-node data-validator.ts rules member');
    process.exit(1);
  }

  const command = args[0];

  try {
    const validator = new DataValidator();

    switch (command) {
      case 'validate': {
        const dataFile = args[1];

        if (!dataFile) {
          throw new Error('Data file path required');
        }

        if (!fs.existsSync(dataFile)) {
          throw new Error(`Data file not found: ${dataFile}`);
        }

        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        const result = await validator.validateData(data);

        console.log('🔍 Data Validation Results');
        console.log('========================');
        console.log(`✅ Valid: ${result.isValid ? 'Yes' : 'No'}`);
        console.log(`📊 Quality Score: ${result.summary.score}/100`);
        console.log(`🔴 Errors: ${result.errors.length}`);
        console.log(`🟡 Warnings: ${result.warnings.length}`);
        console.log(`📋 Validated Fields: ${result.summary.validatedFields}/${result.summary.totalFields}`);

        if (result.errors.length > 0) {
          console.log('\n❌ Errors:');
          result.errors.slice(0, 10).forEach(error => {
            console.log(`   ${error.field}: ${error.message}`);
          });
          if (result.errors.length > 10) {
            console.log(`   ... and ${result.errors.length - 10} more errors`);
          }
        }

        if (result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.warnings.slice(0, 5).forEach(warning => {
            console.log(`   ${warning.field}: ${warning.message}`);
          });
          if (result.warnings.length > 5) {
            console.log(`   ... and ${result.warnings.length - 5} more warnings`);
          }
        }

        // Exit with error code if validation failed
        if (!result.isValid) {
          process.exit(1);
        }
        break;
      }

      case 'report': {
        const dataFile = args[1];
        const outputFile = args[2];

        if (!dataFile || !outputFile) {
          throw new Error('Data file and output file paths required');
        }

        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        const result = await validator.validateData(data);
        await validator.generateReport(result, outputFile);

        console.log(`✅ Validation report generated: ${outputFile}`);
        console.log(`📊 Quality Score: ${result.summary.score}/100`);
        break;
      }

      case 'rules': {
        const type = args[1];

        if (!type) {
          throw new Error('Type required');
        }

        const rules = validator.getRules(type);

        if (rules.length === 0) {
          console.log(`No validation rules found for type: ${type}`);
        } else {
          console.log(`Validation Rules for ${type}:`);
          rules.forEach((rule, index) => {
            console.log(`${index + 1}. ${rule.field} (${rule.type}): ${rule.message}`);
          });
        }
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

export { DataValidator };
