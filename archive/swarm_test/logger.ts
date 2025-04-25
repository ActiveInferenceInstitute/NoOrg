import fs from 'fs-extra';
import path from 'path';
import { TEST_PATHS } from './test_config';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  step?: string;
  testName: string;
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'METRIC';
type LogCategory = 'TEST' | 'VISUALIZATION' | 'METRICS' | 'SYSTEM' | 'PERFORMANCE';

interface TestStep {
  name: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  metrics: Record<string, any>;
}

/**
 * Enhanced test logger with structured logging and visualization support
 */
export class TestLogger {
  private logFile: string;
  private testName: string;
  private currentStep?: TestStep;
  private steps: TestStep[] = [];
  private metrics: Map<string, any[]> = new Map();

  constructor(testName: string) {
    this.testName = testName;
    this.logFile = path.join(TEST_PATHS.logs, `${testName}.log`);
    this.initializeLogFile();
  }

  /**
   * Initialize log file with header
   */
  private async initializeLogFile(): Promise<void> {
    const header = {
      testName: this.testName,
      startTime: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    await fs.ensureFile(this.logFile);
    await this.writeLog({
      level: 'INFO',
      category: 'TEST',
      message: 'Test session started',
      metadata: header,
      testName: this.testName
    });
  }

  /**
   * Write structured log entry
   */
  private async writeLog(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
      step: this.currentStep?.name
    };

    const formattedLog = JSON.stringify(logEntry);
    await fs.appendFile(this.logFile, formattedLog + '\n');

    // Console output with color coding
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      METRIC: '\x1b[35m' // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];
    console.log(`${color}[${entry.level}]${reset} ${entry.category}: ${entry.message}`);
  }

  /**
   * Start a new test step
   */
  async step(name: string): Promise<void> {
    if (this.currentStep) {
      await this.endStep();
    }

    this.currentStep = {
      name,
      startTime: Date.now(),
      status: 'running',
      metrics: {}
    };

    await this.writeLog({
      level: 'INFO',
      category: 'TEST',
      message: `Starting step: ${name}`,
      testName: this.testName
    });
  }

  /**
   * End current test step
   */
  async endStep(): Promise<void> {
    if (this.currentStep) {
      this.currentStep.endTime = Date.now();
      this.currentStep.status = 'completed';
      
      const duration = this.currentStep.endTime - this.currentStep.startTime;
      await this.writeLog({
        level: 'INFO',
        category: 'TEST',
        message: `Completed step: ${this.currentStep.name}`,
        metadata: {
          duration,
          metrics: this.currentStep.metrics
        },
        testName: this.testName
      });

      this.steps.push(this.currentStep);
      this.currentStep = undefined;
    }
  }

  /**
   * Log debug message
   */
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'DEBUG',
      category: 'TEST',
      message,
      metadata,
      testName: this.testName
    });
  }

  /**
   * Log info message
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'INFO',
      category: 'TEST',
      message,
      metadata,
      testName: this.testName
    });
  }

  /**
   * Log warning message
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'WARN',
      category: 'TEST',
      message,
      metadata,
      testName: this.testName
    });
  }

  /**
   * Log error message
   */
  async error(message: string, error?: Error): Promise<void> {
    await this.writeLog({
      level: 'ERROR',
      category: 'TEST',
      message,
      metadata: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      testName: this.testName
    });
  }

  /**
   * Log success message
   */
  async success(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'INFO',
      category: 'TEST',
      message: `✅ ${message}`,
      metadata,
      testName: this.testName
    });
  }

  /**
   * Log metric value
   */
  async metric(name: string, value: any): Promise<void> {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricPoint = {
      timestamp: Date.now(),
      value
    };

    this.metrics.get(name)?.push(metricPoint);

    if (this.currentStep) {
      this.currentStep.metrics[name] = value;
    }

    await this.writeLog({
      level: 'METRIC',
      category: 'METRICS',
      message: `Recorded metric: ${name}`,
      metadata: { name, value },
      testName: this.testName
    });
  }

  /**
   * Log visualization generation
   */
  async visualization(type: string, data: any): Promise<void> {
    await this.writeLog({
      level: 'INFO',
      category: 'VISUALIZATION',
      message: `Generating visualization: ${type}`,
      metadata: { type, dataPoints: Array.isArray(data) ? data.length : 0 },
      testName: this.testName
    });
  }

  /**
   * Get test summary
   */
  getSummary(): Record<string, any> {
    const endTime = Date.now();
    const startTime = this.steps[0]?.startTime || endTime;

    return {
      testName: this.testName,
      duration: endTime - startTime,
      steps: this.steps.map(step => ({
        name: step.name,
        duration: (step.endTime || endTime) - step.startTime,
        status: step.status,
        metrics: step.metrics
      })),
      metrics: Object.fromEntries(this.metrics)
    };
  }

  /**
   * Generate test report
   */
  async generateReport(): Promise<void> {
    const summary = this.getSummary();
    const reportPath = path.join(TEST_PATHS.results, `${this.testName}_report.json`);
    
    await fs.writeJson(reportPath, summary, { spaces: 2 });
    
    // Generate visualization data
    const visualData = {
      stepDurations: this.steps.map(step => ({
        name: step.name,
        duration: (step.endTime || Date.now()) - step.startTime
      })),
      metrics: Array.from(this.metrics.entries()).map(([name, values]) => ({
        name,
        values: values.map(v => v.value)
      }))
    };

    const visualPath = path.join(TEST_PATHS.visualizations, `${this.testName}_report.html`);
    await this.generateReportVisualization(visualPath, visualData);
  }

  /**
   * Generate HTML visualization of test report
   */
  private async generateReportVisualization(
    filePath: string,
    data: any
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Report: ${this.testName}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .chart { width: 800px; height: 400px; margin: 20px 0; }
            .summary { margin: 20px 0; }
            .metric { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Test Report: ${this.testName}</h1>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Duration: ${this.getSummary().duration}ms</p>
            <p>Steps: ${this.steps.length}</p>
            <p>Metrics: ${this.metrics.size}</p>
          </div>

          <div class="chart" id="stepDurations"></div>
          <div class="chart" id="metrics"></div>

          <script>
            // Step durations chart
            const stepData = ${JSON.stringify(data.stepDurations)};
            Plotly.newPlot('stepDurations', [{
              x: stepData.map(d => d.name),
              y: stepData.map(d => d.duration),
              type: 'bar',
              name: 'Step Duration (ms)'
            }], {
              title: 'Step Durations',
              xaxis: { title: 'Step' },
              yaxis: { title: 'Duration (ms)' }
            });

            // Metrics chart
            const metricData = ${JSON.stringify(data.metrics)};
            Plotly.newPlot('metrics', 
              metricData.map(m => ({
                y: m.values,
                type: 'box',
                name: m.name
              })), {
                title: 'Metric Distributions',
                yaxis: { title: 'Value' }
              }
            );
          </script>
        </body>
      </html>
    `;

    await fs.writeFile(filePath, html);
  }
} 