import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { LLMResponse } from '../../src/core/multiagent/LLMClientInterface';

/**
 * Test utilities for multiagent system tests
 */

/**
 * Creates a temporary directory for test artifacts
 * @param basePath Base path to create the directory
 * @param dirName Name of the directory
 * @returns Path to the created directory
 */
export function createTempDirectory(basePath: string, dirName: string): string {
  const dirPath = path.join(basePath, dirName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Cleans up a temporary directory
 * @param dirPath Path to the directory to clean up
 */
export function cleanupTempDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Creates a test prompt template file
 * @param promptsDir Directory to create the template in
 * @param templateName Name of the template
 * @param content Content of the template
 * @returns Path to the created template file
 */
export function createPromptTemplate(
  promptsDir: string,
  templateName: string,
  content: string
): string {
  const templatePath = path.join(promptsDir, `${templateName}.prompt`);
  fs.writeFileSync(templatePath, content);
  return templatePath;
}

/**
 * Stubs the OpenAI client to return predetermined responses
 * @param client OpenAI client to stub
 * @param responseMap Map of prompt substrings to responses
 * @returns Sinon stub
 */
export function stubOpenAIClient(
  client: OpenAIClient,
  responseMap: Record<string, string | object>
): sinon.SinonStub {
  const sendPromptStub = sinon.stub(client, 'sendPrompt');
  
  sendPromptStub.callsFake((prompt) => {
    const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    
    // Default response if no match is found
    let content = 'Default test response';
    
    // Find matching response based on prompt content
    for (const [key, value] of Object.entries(responseMap)) {
      if (promptStr.includes(key)) {
        content = typeof value === 'string' ? value : JSON.stringify(value);
        break;
      }
    }
    
    // Create standard response
    const response: LLMResponse = {
      id: 'test-response-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'o3-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 150,
        total_tokens: 250
      }
    };
    
    return Promise.resolve(response);
  });
  
  return sendPromptStub;
}

/**
 * Creates a test logger for capturing test output
 * @param outputDir Directory to write log files
 * @param logName Base name for the log file
 * @returns Object with logger methods and path to the log file
 */
export function createTestLogger(outputDir: string, logName: string) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const logFilePath = path.join(outputDir, `${logName}_${Date.now()}.log`);
  const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });
  
  // Create logger
  const logger = {
    log: (message: string) => {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] INFO: ${message}\n`;
      logStream.write(formattedMessage);
      return message;
    },
    
    error: (message: string) => {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] ERROR: ${message}\n`;
      logStream.write(formattedMessage);
      return message;
    },
    
    step: (step: number, message: string) => {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] STEP ${step}: ${message}\n`;
      logStream.write(formattedMessage);
      return message;
    },
    
    result: (key: string, value: any) => {
      const timestamp = new Date().toISOString();
      const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
      const formattedMessage = `[${timestamp}] RESULT - ${key}: ${formattedValue}\n`;
      logStream.write(formattedMessage);
      return value;
    },
    
    close: () => {
      logStream.end();
    },
    
    filePath: logFilePath
  };
  
  return logger;
}

/**
 * Waits for a specified amount of time
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a test report from test results
 * @param outputDir Directory to write the report
 * @param reportName Name of the report file
 * @param data Report data
 * @returns Path to the created report file
 */
export function createTestReport(
  outputDir: string,
  reportName: string,
  data: Record<string, any>
): string {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Add timestamp to report
  const reportData = {
    ...data,
    generatedAt: new Date().toISOString()
  };
  
  // Write report file
  const reportPath = path.join(outputDir, `${reportName}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  return reportPath;
}

/**
 * Runs a series of test steps with logging
 * @param testSteps Array of test step functions
 * @param logger Test logger
 * @returns Results from all steps
 */
export async function runTestSteps(
  testSteps: Array<(results?: any) => Promise<any>>,
  logger: any
): Promise<any[]> {
  const results: any[] = [];
  
  for (let i = 0; i < testSteps.length; i++) {
    try {
      logger.step(i + 1, `Running step ${i + 1}/${testSteps.length}`);
      const result = await testSteps[i](results.length > 0 ? results[i - 1] : undefined);
      results.push(result);
      logger.result(`Step ${i + 1}`, result);
    } catch (error: any) {
      logger.error(`Step ${i + 1} failed: ${error.message}`);
      throw error;
    }
  }
  
  return results;
}

/**
 * Default test responses for common agent requests
 */
export const DEFAULT_TEST_RESPONSES = {
  'quantum computing': {
    findings: [
      'Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously',
      'Major applications include cryptography, optimization problems, and simulating quantum systems',
      'Companies like IBM, Google, and Microsoft are investing heavily in quantum computing research'
    ],
    sources: [
      'https://example.com/quantum-computing-basics',
      'https://example.com/quantum-applications'
    ],
    confidence: 0.92,
    processingTime: 450
  },
  
  'climate change': {
    findings: [
      'Global temperatures have increased by approximately 1.1°C since pre-industrial times',
      'Effects include rising sea levels, increased frequency of extreme weather events, and shifts in wildlife populations',
      'International agreements like the Paris Agreement aim to limit warming to well below 2°C'
    ],
    sources: [
      'https://example.com/climate-science',
      'https://example.com/ipcc-report'
    ],
    confidence: 0.95,
    processingTime: 380
  },
  
  'artificial intelligence': {
    findings: [
      'AI encompasses various approaches including machine learning, neural networks, and symbolic reasoning',
      'Recent advances in large language models have demonstrated significant capabilities in natural language tasks',
      'Ethical considerations include bias, privacy, security, and transparency'
    ],
    sources: [
      'https://example.com/ai-foundations',
      'https://example.com/machine-learning-overview'
    ],
    confidence: 0.91,
    processingTime: 420
  }
}; 