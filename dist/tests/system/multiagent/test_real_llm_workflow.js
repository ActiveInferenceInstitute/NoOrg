"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const util_1 = require("util");
const uuid_1 = require("uuid");
const MultiAgentCoordinator_1 = require("../../../src/core/multiagent/MultiAgentCoordinator");
const AgentRegistry_1 = require("../../../src/core/multiagent/AgentRegistry");
const TaskManager_1 = require("../../../src/core/multiagent/TaskManager");
const SharedStateManager_1 = require("../../../src/core/multiagent/SharedStateManager");
// Import test utilities
const test_helpers_1 = require("../../utils/test-helpers");
// Constants
const TEST_TIMEOUT = 120000; // 2 minutes
const mkdtemp = (0, util_1.promisify)(fs.mkdtemp);
const rmdir = (0, util_1.promisify)(fs.rm);
const writeFile = (0, util_1.promisify)(fs.writeFile);
// Utility to count words
function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}
// Utility to log LLM interactions
function logLLMInteraction(prompt, response, usageStats) {
    console.log('\n--------- LLM INTERACTION ---------');
    console.log(`PROMPT (${countWords(prompt)} words):`);
    console.log(`${prompt.substring(0, 150)}...`);
    console.log(`\nRESPONSE (${countWords(response)} words):`);
    console.log(`${response.substring(0, 150)}...`);
    if (usageStats) {
        console.log('\nUSAGE STATS:');
        console.log(JSON.stringify(usageStats, null, 2));
    }
    console.log('----------------------------------\n');
}
describe('Real LLM Multiagent Workflow', function () {
    this.timeout(TEST_TIMEOUT);
    // Test directories
    let tempDir;
    let promptsDir;
    let outputsDir;
    // System components
    let llmClient;
    let taskManager;
    let sharedStateManager;
    let agentRegistry;
    let coordinator;
    // Agent IDs
    let researchAgentId;
    let analysisAgentId;
    let writingAgentId;
    before(async function () {
        // Create temp directories
        tempDir = await mkdtemp(path.join(os.tmpdir(), 'multiagent-test-'));
        promptsDir = path.join(tempDir, 'prompts');
        outputsDir = path.join(tempDir, 'outputs');
        fs.mkdirSync(promptsDir, { recursive: true });
        fs.mkdirSync(outputsDir, { recursive: true });
        console.log(`Created test directories:`);
        console.log(`- Temp dir: ${tempDir}`);
        console.log(`- Prompts: ${promptsDir}`);
        console.log(`- Outputs: ${outputsDir}`);
        // Create real OpenAI client
        llmClient = (0, test_helpers_1.createRealLLMClient)();
        // Initialize system components
        taskManager = new TaskManager_1.TaskManager();
        sharedStateManager = new SharedStateManager_1.SharedStateManager();
        agentRegistry = new AgentRegistry_1.AgentRegistry(taskManager);
        // Create coordinator
        coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator({
            taskManager,
            agentRegistry,
            sharedStateManager,
            llmClient
        });
        // Create and register agents
        const researchAgent = createResearchAgent(llmClient);
        const analysisAgent = createAnalysisAgent(llmClient);
        const writingAgent = createWritingAgent(llmClient);
        researchAgentId = await agentRegistry.registerAgent(researchAgent);
        analysisAgentId = await agentRegistry.registerAgent(analysisAgent);
        writingAgentId = await agentRegistry.registerAgent(writingAgent);
        console.log(`Registered agents:`);
        console.log(`- Research: ${researchAgentId}`);
        console.log(`- Analysis: ${analysisAgentId}`);
        console.log(`- Writing: ${writingAgentId}`);
    });
    after(async function () {
        // Clean up temp directories
        if (tempDir && fs.existsSync(tempDir)) {
            await rmdir(tempDir, { recursive: true });
            console.log(`Cleaned up test directories`);
        }
    });
    it('should complete a multi-step task with agent collaboration', async function () {
        // Define a multi-step task
        const topic = 'The impact of artificial intelligence on healthcare';
        // Create shared state for the task
        const sessionId = (0, uuid_1.v4)();
        // Set initial state
        await sharedStateManager.setState(`sessions.${sessionId}.topic`, topic);
        await sharedStateManager.setState(`sessions.${sessionId}.status`, 'initialized');
        // Create main task
        const mainTaskId = await taskManager.createTask({
            type: 'generate-report',
            title: `Generate report on ${topic}`,
            description: `Create a comprehensive report on the topic: ${topic}`,
            priority: 'high',
            status: 'pending',
            metadata: {
                sessionId,
                topic
            }
        });
        console.log(`Created main task: ${mainTaskId}`);
        // Create subtasks
        const researchTaskId = await taskManager.createTask({
            type: 'research',
            title: `Research on ${topic}`,
            description: `Gather key information and facts about ${topic}`,
            priority: 'high',
            status: 'pending',
            assignedTo: researchAgentId,
            metadata: {
                sessionId,
                topic,
                parentTask: mainTaskId
            }
        });
        console.log(`Created research task: ${researchTaskId}`);
        // Start processing tasks
        await coordinator.startProcessing();
        // Wait for research task to complete
        await waitForTask(taskManager, researchTaskId);
        // Get research results
        const researchTask = await taskManager.getTask(researchTaskId);
        (0, chai_1.expect)(researchTask.status).to.equal('completed');
        // Create analysis task based on research output
        const analysisTaskId = await taskManager.createTask({
            type: 'analyze',
            title: `Analyze research on ${topic}`,
            description: `Analyze the research findings and identify key insights about ${topic}`,
            priority: 'high',
            status: 'pending',
            assignedTo: analysisAgentId,
            dependsOn: [researchTaskId],
            metadata: {
                sessionId,
                topic,
                parentTask: mainTaskId
            }
        });
        console.log(`Created analysis task: ${analysisTaskId}`);
        // Wait for analysis task to complete
        await waitForTask(taskManager, analysisTaskId);
        // Get analysis results
        const analysisTask = await taskManager.getTask(analysisTaskId);
        (0, chai_1.expect)(analysisTask.status).to.equal('completed');
        // Create writing task based on research and analysis
        const writingTaskId = await taskManager.createTask({
            type: 'write',
            title: `Write report on ${topic}`,
            description: `Write a comprehensive report on ${topic} based on research and analysis`,
            priority: 'high',
            status: 'pending',
            assignedTo: writingAgentId,
            dependsOn: [researchTaskId, analysisTaskId],
            metadata: {
                sessionId,
                topic,
                parentTask: mainTaskId,
                outputPath: path.join(outputsDir, 'final-report.md')
            }
        });
        console.log(`Created writing task: ${writingTaskId}`);
        // Wait for writing task to complete
        await waitForTask(taskManager, writingTaskId);
        // Get writing results
        const writingTask = await taskManager.getTask(writingTaskId);
        (0, chai_1.expect)(writingTask.status).to.equal('completed');
        // Check that the output file was created
        const outputPath = path.join(outputsDir, 'final-report.md');
        (0, chai_1.expect)(fs.existsSync(outputPath)).to.be.true;
        // Verify final report content
        const reportContent = fs.readFileSync(outputPath, 'utf8');
        (0, chai_1.expect)(reportContent).to.include(topic);
        (0, chai_1.expect)(countWords(reportContent)).to.be.greaterThan(300);
        // Log token usage
        const usageStats = await llmClient.getUsageStats();
        console.log('\n--------- TOTAL LLM USAGE ---------');
        console.log(JSON.stringify(usageStats, null, 2));
        console.log('----------------------------------\n');
        // Stop processing
        await coordinator.stopProcessing();
    });
});
// Helper function to wait for a task to complete
async function waitForTask(taskManager, taskId, timeout = 60000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const task = await taskManager.getTask(taskId);
        if (['completed', 'failed', 'cancelled'].includes(task.status)) {
            return task;
        }
        // Sleep for a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Waiting for task ${taskId}, current status: ${task.status}`);
    }
    throw new Error(`Timeout waiting for task ${taskId} to complete`);
}
// Create specialized agents
function createResearchAgent(llmClient) {
    const agent = {
        name: 'Research Agent',
        description: 'Specializes in gathering information and facts on various topics',
        capabilities: ['research', 'information-gathering', 'fact-checking'],
        async processTask(task) {
            console.log(`Research Agent processing task: ${task.id}`);
            // Prepare research prompt
            const prompt = `
        You are a research assistant tasked with gathering key information on the following topic:
        ${task.metadata?.topic}
        
        Please provide:
        1. A brief overview of the topic
        2. Key facts and statistics
        3. Recent developments or trends
        4. Major challenges or opportunities
        5. Key stakeholders or players in this field
        
        Format your response as structured research notes that can be used by analysts.
      `;
            // Send to LLM
            const response = await llmClient.sendPrompt(prompt, {
                maxTokens: 1000,
                temperature: 0.3
            });
            // Log interaction
            logLLMInteraction(prompt, response.content, response.usage);
            // Return research results
            return {
                success: true,
                data: {
                    researchNotes: response.content,
                    topic: task.metadata?.topic,
                    timestamp: Date.now()
                }
            };
        }
    };
    return agent;
}
function createAnalysisAgent(llmClient) {
    const agent = {
        name: 'Analysis Agent',
        description: 'Specializes in analyzing information and extracting insights',
        capabilities: ['analysis', 'insight-generation', 'critical-thinking'],
        async processTask(task) {
            console.log(`Analysis Agent processing task: ${task.id}`);
            // Get research data from task dependencies
            const dependencyIds = task.dependsOn || [];
            if (dependencyIds.length === 0) {
                return {
                    success: false,
                    error: 'No research task dependency specified'
                };
            }
            // Get the research task result
            const researchTaskId = dependencyIds[0];
            const researchTask = await this.taskManager?.getTask(researchTaskId);
            const researchResult = researchTask?.result?.data?.researchNotes;
            if (!researchResult) {
                return {
                    success: false,
                    error: 'No research data available to analyze'
                };
            }
            // Prepare analysis prompt
            const prompt = `
        You are an analysis expert. Based on the following research about "${task.metadata?.topic}":
        
        ${researchResult}
        
        Please provide:
        1. Critical analysis of the information
        2. Key insights and patterns
        3. Implications for the future
        4. Gaps in the research or areas needing more investigation
        5. Recommendations based on the analysis
        
        Format your response as a structured analysis that can be used by report writers.
      `;
            // Send to LLM
            const response = await llmClient.sendPrompt(prompt, {
                maxTokens: 1000,
                temperature: 0.4
            });
            // Log interaction
            logLLMInteraction(prompt, response.content, response.usage);
            // Return analysis results
            return {
                success: true,
                data: {
                    analysis: response.content,
                    topic: task.metadata?.topic,
                    timestamp: Date.now()
                }
            };
        }
    };
    return agent;
}
function createWritingAgent(llmClient) {
    const agent = {
        name: 'Writing Agent',
        description: 'Specializes in creating well-written reports and documents',
        capabilities: ['writing', 'report-generation', 'content-creation'],
        async processTask(task) {
            console.log(`Writing Agent processing task: ${task.id}`);
            // Get dependency tasks
            const dependencyIds = task.dependsOn || [];
            if (dependencyIds.length < 2) {
                return {
                    success: false,
                    error: 'Missing dependencies (need both research and analysis)'
                };
            }
            // Get task results
            const tasks = await Promise.all(dependencyIds.map(id => this.taskManager?.getTask(id)));
            // Extract research and analysis data
            const researchTask = tasks.find(t => t.type === 'research');
            const analysisTask = tasks.find(t => t.type === 'analyze');
            if (!researchTask || !analysisTask) {
                return {
                    success: false,
                    error: 'Could not find both research and analysis tasks'
                };
            }
            const researchData = researchTask.result?.data?.researchNotes;
            const analysisData = analysisTask.result?.data?.analysis;
            // Prepare writing prompt
            const prompt = `
        You are a professional report writer. Please create a comprehensive report on 
        "${task.metadata?.topic}" based on the following research and analysis:
        
        ## RESEARCH:
        ${researchData}
        
        ## ANALYSIS:
        ${analysisData}
        
        Create a well-structured report with:
        1. Executive summary
        2. Introduction to the topic
        3. Key findings from the research
        4. Analysis and insights
        5. Implications and recommendations
        6. Conclusion
        
        Format the report in Markdown. Use appropriate headings, lists, and formatting to make it readable.
      `;
            // Send to LLM
            const response = await llmClient.sendPrompt(prompt, {
                maxTokens: 2000,
                temperature: 0.5
            });
            // Log interaction
            logLLMInteraction(prompt, response.content, response.usage);
            // Save the report to file
            const outputPath = task.metadata?.outputPath;
            if (outputPath) {
                await writeFile(outputPath, response.content);
                console.log(`Report written to ${outputPath}`);
            }
            // Return writing results
            return {
                success: true,
                data: {
                    report: response.content,
                    topic: task.metadata?.topic,
                    timestamp: Date.now(),
                    outputPath
                }
            };
        }
    };
    return agent;
}
//# sourceMappingURL=test_real_llm_workflow.js.map