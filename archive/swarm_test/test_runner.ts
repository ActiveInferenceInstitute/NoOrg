import { TestLogger } from './logger';
import { TestExecutionUtils } from './test_utils';
import { TEST_PATHS } from './test_config';
import { 
  testBasicSwarmCoordination,
  testSwarmScalability,
  testFaultTolerance,
  testPerformance,
  testTaskVisualization
} from './test_cases';
import path from 'path';
import fs from 'fs-extra';

interface TestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
}

interface TestReport {
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    totalDuration: number;
    timestamp: string;
  };
  results: TestResult[];
}

/**
 * Test runner for swarm coordination tests
 */
export class SwarmTestRunner {
  private results: TestResult[] = [];
  private startTime: number;
  private logger: TestLogger;

  constructor() {
    this.startTime = Date.now();
    // Ensure test directories exist before creating logger
    this.initializeDirectories();
    this.logger = new TestLogger('test_runner');
  }

  /**
   * Initialize required directories
   */
  private initializeDirectories(): void {
    // Synchronously create directories to ensure they exist before logging starts
    Object.values(TEST_PATHS).forEach(dir => {
      fs.ensureDirSync(dir);
    });
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('\n🚀 Starting Swarm Coordination Test Suite\n');
    await this.logger.info('Starting swarm coordination test suite');
    
    try {
      // Initialize test directories
      await this.initializeTestEnvironment();
      
      // Run tests in sequence
      const tests = [
        { name: 'Basic Coordination', fn: testBasicSwarmCoordination },
        { name: 'Scalability', fn: testSwarmScalability },
        { name: 'Fault Tolerance', fn: testFaultTolerance },
        { name: 'Performance', fn: testPerformance },
        { name: 'Task Visualization', fn: testTaskVisualization }
      ];

      for (const test of tests) {
        await this.logger.step(`Running Test: ${test.name}`);
        await this.runTest(test.name, test.fn);
        await this.logger.endStep();
        this.printTestProgress();
      }
      
      // Generate final report
      await this.generateReport();
      
      this.printFinalSummary();
      await this.logger.info('Test suite completed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logger.error('Test suite failed', error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Initialize test environment
   */
  private async initializeTestEnvironment(): Promise<void> {
    await this.logger.step('Initializing test environment');
    try {
      // Clean previous test artifacts while preserving directories
      await Promise.all(
        Object.values(TEST_PATHS).map(async (dir) => {
          const files = await fs.readdir(dir);
          await Promise.all(
            files.map(file => fs.remove(path.join(dir, file)))
          );
        })
      );
      await this.logger.success('Previous test artifacts cleaned');
      
    } catch (error) {
      await this.logger.error('Failed to initialize test environment', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
    await this.logger.endStep();
  }

  /**
   * Run individual test
   */
  private async runTest(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    const testLogger = new TestLogger(name.toLowerCase().replace(/\s+/g, '_'));
    
    try {
      await testLogger.info(`Starting test: ${name}`);
      await testFn();
      
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        duration,
        success: true
      });
      
      await testLogger.success(`Test completed successfully in ${duration}ms`);
      await this.logger.metric('testDuration', { name, duration, success: true });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      await testLogger.error('Test failed', error instanceof Error ? error : new Error(String(error)));
      await this.logger.metric('testDuration', { name, duration, success: false, error: String(error) });
    }
  }

  /**
   * Print test progress
   */
  private printTestProgress(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    console.log('\nProgress:');
    console.log('📊 Total Tests:', total);
    console.log('✅ Passed:', passed);
    console.log('❌ Failed:', failed);
    console.log();
  }

  /**
   * Generate test report
   */
  private async generateReport(): Promise<void> {
    await this.logger.step('Generating test report');
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    await this.logger.summary({ total, passed, failed });
    
    // Save detailed results
    try {
      const reportFile = path.join(TEST_PATHS.results, 'test_report.json');
      await fs.writeJson(reportFile, {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        summary: { total, passed, failed },
        results: this.results
      }, { spaces: 2 });
      
      await this.logger.success('Test report generated successfully');
    } catch (error) {
      await this.logger.error('Failed to generate test report', error instanceof Error ? error : new Error(String(error)));
    }
    
    await this.logger.endStep();
  }

  /**
   * Print final summary
   */
  private printFinalSummary(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const duration = Date.now() - this.startTime;
    
    console.log('\n====================================');
    console.log('🏁 Test Suite Complete');
    console.log('------------------------------------');
    console.log('📊 Total Tests:', total);
    console.log('✅ Passed:', passed);
    console.log('❌ Failed:', failed);
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('====================================\n');
    
    if (failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`❌ ${r.name}: ${r.error}`);
        });
      console.log();
    }
  }
}

// Run tests if this is the main module
if (require.main === module) {
  const runner = new SwarmTestRunner();
  runner.runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
} 