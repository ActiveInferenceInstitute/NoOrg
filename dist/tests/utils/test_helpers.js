"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TEST_RESPONSES = void 0;
exports.createTempDirectory = createTempDirectory;
exports.cleanupTempDirectory = cleanupTempDirectory;
exports.createPromptTemplate = createPromptTemplate;
exports.stubOpenAIClient = stubOpenAIClient;
exports.createTestLogger = createTestLogger;
exports.wait = wait;
exports.createTestReport = createTestReport;
exports.runTestSteps = runTestSteps;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
/**
 * Test utilities for multiagent system tests
 */
/**
 * Creates a temporary directory for test artifacts
 * @param basePath Base path to create the directory
 * @param dirName Name of the directory
 * @returns Path to the created directory
 */
function createTempDirectory(basePath, dirName) {
    const dirPath = path_1.default.join(basePath, dirName);
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
}
/**
 * Cleans up a temporary directory
 * @param dirPath Path to the directory to clean up
 */
function cleanupTempDirectory(dirPath) {
    if (fs_1.default.existsSync(dirPath)) {
        fs_1.default.rmSync(dirPath, { recursive: true, force: true });
    }
}
/**
 * Creates a test prompt template file
 * @param promptsDir Directory to create the template in
 * @param templateName Name of the template
 * @param content Content of the template
 * @returns Path to the created template file
 */
function createPromptTemplate(promptsDir, templateName, content) {
    const templatePath = path_1.default.join(promptsDir, `${templateName}.prompt`);
    fs_1.default.writeFileSync(templatePath, content);
    return templatePath;
}
/**
 * Stubs the OpenAI client to return predetermined responses
 * @param client OpenAI client to stub
 * @param responseMap Map of prompt substrings to responses
 * @returns Sinon stub
 */
function stubOpenAIClient(client, responseMap) {
    const sendPromptStub = sinon_1.default.stub(client, 'sendPrompt');
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
        const response = {
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
function createTestLogger(outputDir, logName) {
    // Ensure output directory exists
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const logFilePath = path_1.default.join(outputDir, `${logName}_${Date.now()}.log`);
    const logStream = fs_1.default.createWriteStream(logFilePath, { flags: 'w' });
    // Create logger
    const logger = {
        log: (message) => {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] INFO: ${message}\n`;
            logStream.write(formattedMessage);
            return message;
        },
        error: (message) => {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] ERROR: ${message}\n`;
            logStream.write(formattedMessage);
            return message;
        },
        step: (step, message) => {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] STEP ${step}: ${message}\n`;
            logStream.write(formattedMessage);
            return message;
        },
        result: (key, value) => {
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
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Creates a test report from test results
 * @param outputDir Directory to write the report
 * @param reportName Name of the report file
 * @param data Report data
 * @returns Path to the created report file
 */
function createTestReport(outputDir, reportName, data) {
    // Ensure output directory exists
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    // Add timestamp to report
    const reportData = {
        ...data,
        generatedAt: new Date().toISOString()
    };
    // Write report file
    const reportPath = path_1.default.join(outputDir, `${reportName}.json`);
    fs_1.default.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    return reportPath;
}
/**
 * Runs a series of test steps with logging
 * @param testSteps Array of test step functions
 * @param logger Test logger
 * @returns Results from all steps
 */
async function runTestSteps(testSteps, logger) {
    const results = [];
    for (let i = 0; i < testSteps.length; i++) {
        try {
            logger.step(i + 1, `Running step ${i + 1}/${testSteps.length}`);
            const result = await testSteps[i](results.length > 0 ? results[i - 1] : undefined);
            results.push(result);
            logger.result(`Step ${i + 1}`, result);
        }
        catch (error) {
            logger.error(`Step ${i + 1} failed: ${error.message}`);
            throw error;
        }
    }
    return results;
}
/**
 * Default test responses for common agent requests
 */
exports.DEFAULT_TEST_RESPONSES = {
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
//# sourceMappingURL=test_helpers.js.map