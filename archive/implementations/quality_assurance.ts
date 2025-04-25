import {
  QualityConfig,
  QualityChecker,
  QualityMetric,
  CheckResult,
  MetricResult,
  QualityReport
} from '../types/quality';

/**
 * Quality Assurance System
 * Manages quality checks, metrics collection, and reporting
 */
export class QualityAssuranceSystem {
  private config: QualityConfig;
  private checkers: Map<string, QualityChecker>;
  private metrics: Map<string, QualityMetric>;

  constructor(config: QualityConfig) {
    this.config = config;
    this.checkers = new Map();
    this.metrics = new Map();
  }

  /**
   * Register quality checker
   */
  async registerChecker(checker: QualityChecker): Promise<void> {
    try {
      // Validate checker
      if (!checker.id || !checker.check) {
        throw new Error('Invalid checker interface');
      }

      // Register checker
      this.checkers.set(checker.id, checker);
    } catch (error) {
      throw new Error(`Failed to register checker: ${error.message}`);
    }
  }

  /**
   * Register quality metric
   */
  async registerMetric(metric: QualityMetric): Promise<void> {
    try {
      // Validate metric
      if (!metric.id || !metric.collect) {
        throw new Error('Invalid metric interface');
      }

      // Register metric
      this.metrics.set(metric.id, metric);
    } catch (error) {
      throw new Error(`Failed to register metric: ${error.message}`);
    }
  }

  /**
   * Run quality checks
   */
  async runChecks(context: any): Promise<QualityReport> {
    try {
      const startTime = new Date().toISOString();
      const checkResults: CheckResult[] = [];
      const metricResults: MetricResult[] = [];
      let totalChecks = 0;
      let passedChecks = 0;
      let failedChecks = 0;

      // Run all registered checkers
      for (const [, checker] of this.checkers) {
        try {
          totalChecks++;
          const result = await checker.check(context, checker.config);
          checkResults.push(result);
          
          if (result.success) {
            passedChecks++;
          } else {
            failedChecks++;
          }
        } catch (error) {
          failedChecks++;
          checkResults.push({
            checkerId: checker.id,
            success: false,
            timestamp: new Date().toISOString(),
            duration: 0,
            summary: `Check failed: ${error.message}`,
            error: error
          });
        }
      }

      // Collect all metrics
      for (const [, metric] of this.metrics) {
        try {
          const result = await metric.collect(context, metric.config);
          metricResults.push(result);
        } catch (error) {
          console.error(`Failed to collect metric ${metric.id}:`, error);
        }
      }

      // Calculate total issues and issues by severity
      const totalIssues = checkResults.reduce((sum, result) => 
        sum + (result.issues?.length || 0), 0);
      
      const issuesBySeverity = {
        info: 0,
        warning: 0,
        error: 0
      };

      checkResults.forEach(result => {
        result.issues?.forEach(issue => {
          switch (issue.severity) {
            case 'low':
              issuesBySeverity.info++;
              break;
            case 'medium':
              issuesBySeverity.warning++;
              break;
            case 'high':
            case 'critical':
              issuesBySeverity.error++;
              break;
          }
        });
      });

      // Generate quality report
      const endTime = new Date().toISOString();
      const report: QualityReport = {
        success: failedChecks === 0,
        startTime,
        endTime,
        summary: this.generateSummary(checkResults, metricResults),
        totalChecks,
        passedChecks,
        failedChecks,
        checkResults,
        metricResults,
        issues: this.collectIssues(checkResults),
        recommendations: this.generateRecommendations(checkResults, metricResults),
        metrics: {
          totalChecks,
          passedChecks,
          failedChecks,
          totalIssues,
          issuesBySeverity
        }
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to run quality checks: ${error.message}`);
    }
  }

  /**
   * Get checker by ID
   */
  getChecker(id: string): QualityChecker | undefined {
    return this.checkers.get(id);
  }

  /**
   * Get metric by ID
   */
  getMetric(id: string): QualityMetric | undefined {
    return this.metrics.get(id);
  }

  /**
   * Generate summary from check and metric results
   */
  private generateSummary(
    checkResults: CheckResult[],
    metricResults: MetricResult[]
  ): string {
    const passedChecks = checkResults.filter(r => r.success).length;
    const totalChecks = checkResults.length;
    const summary = `Passed ${passedChecks}/${totalChecks} quality checks`;

    const metricSummaries = metricResults
      .map(r => r.summary)
      .filter(Boolean)
      .join('. ');

    return metricSummaries ? `${summary}. ${metricSummaries}` : summary;
  }

  /**
   * Collect issues from check results
   */
  private collectIssues(checkResults: CheckResult[]): Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    checker: string;
    location?: {
      file?: string;
      line?: number;
      column?: number;
    };
  }> {
    const issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      checker: string;
      location?: {
        file?: string;
        line?: number;
        column?: number;
      };
    }> = [];

    for (const result of checkResults) {
      if (!result.success && result.issues) {
        issues.push(...result.issues.map(issue => ({
          type: issue.type,
          severity: issue.severity,
          message: issue.message,
          checker: result.checkerId,
          location: issue.location
        })));
      }
    }

    return issues;
  }

  /**
   * Generate recommendations based on check and metric results
   */
  private generateRecommendations(
    checkResults: CheckResult[],
    metricResults: MetricResult[]
  ): Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    effort: string;
  }> {
    const recommendations: Array<{
      type: string;
      priority: 'low' | 'medium' | 'high';
      description: string;
      impact: string;
      effort: string;
    }> = [];

    // Add recommendations from failed checks
    for (const result of checkResults) {
      if (!result.success && result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    }

    // Add recommendations from metrics
    for (const result of metricResults) {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    }

    return recommendations;
  }
} 