import sinon from 'sinon';
import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
/**
 * Test utilities for multiagent system tests
 */
/**
 * Creates a temporary directory for test artifacts
 * @param basePath Base path to create the directory
 * @param dirName Name of the directory
 * @returns Path to the created directory
 */
export declare function createTempDirectory(basePath: string, dirName: string): string;
/**
 * Cleans up a temporary directory
 * @param dirPath Path to the directory to clean up
 */
export declare function cleanupTempDirectory(dirPath: string): void;
/**
 * Creates a test prompt template file
 * @param promptsDir Directory to create the template in
 * @param templateName Name of the template
 * @param content Content of the template
 * @returns Path to the created template file
 */
export declare function createPromptTemplate(promptsDir: string, templateName: string, content: string): string;
/**
 * Stubs the OpenAI client to return predetermined responses
 * @param client OpenAI client to stub
 * @param responseMap Map of prompt substrings to responses
 * @returns Sinon stub
 */
export declare function stubOpenAIClient(client: OpenAIClient, responseMap: Record<string, string | object>): sinon.SinonStub;
/**
 * Creates a test logger for capturing test output
 * @param outputDir Directory to write log files
 * @param logName Base name for the log file
 * @returns Object with logger methods and path to the log file
 */
export declare function createTestLogger(outputDir: string, logName: string): {
    log: (message: string) => string;
    error: (message: string) => string;
    step: (step: number, message: string) => string;
    result: (key: string, value: any) => any;
    close: () => void;
    filePath: string;
};
/**
 * Waits for a specified amount of time
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export declare function wait(ms: number): Promise<void>;
/**
 * Creates a test report from test results
 * @param outputDir Directory to write the report
 * @param reportName Name of the report file
 * @param data Report data
 * @returns Path to the created report file
 */
export declare function createTestReport(outputDir: string, reportName: string, data: Record<string, any>): string;
/**
 * Runs a series of test steps with logging
 * @param testSteps Array of test step functions
 * @param logger Test logger
 * @returns Results from all steps
 */
export declare function runTestSteps(testSteps: Array<(results?: any) => Promise<any>>, logger: any): Promise<any[]>;
/**
 * Default test responses for common agent requests
 */
export declare const DEFAULT_TEST_RESPONSES: {
    'quantum computing': {
        findings: string[];
        sources: string[];
        confidence: number;
        processingTime: number;
    };
    'climate change': {
        findings: string[];
        sources: string[];
        confidence: number;
        processingTime: number;
    };
    'artificial intelligence': {
        findings: string[];
        sources: string[];
        confidence: number;
        processingTime: number;
    };
};
//# sourceMappingURL=test_helpers.d.ts.map