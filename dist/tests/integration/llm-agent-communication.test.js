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
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
const test_helpers_1 = require("../utils/test-helpers");
const OpenAIClient_1 = require("../../src/core/multiagent/OpenAIClient");
// Load environment variables
dotenv.config();
// Utility function to count words in a string
function countWords(str) {
    return str.split(/\s+/).filter(word => word.length > 0).length;
}
// Utility function to log prompt and response details
function logLLMInteraction(testName, prompt, response) {
    console.log(`\n=== ${testName} ===`);
    // Log prompt details
    if (typeof prompt === 'string') {
        console.log(`Prompt (${countWords(prompt)} words): ${prompt.substring(0, 50)}...`);
    }
    else {
        let totalWords = 0;
        prompt.forEach(msg => {
            totalWords += countWords(msg.content);
        });
        console.log(`Prompt: ${prompt.length} messages, ${totalWords} total words`);
        console.log(`First message role: ${prompt[0].role}, Preview: ${prompt[0].content.substring(0, 50)}...`);
    }
    // Log response details
    if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        console.log(`Response (${countWords(content)} words): ${content.substring(0, 50)}...`);
        console.log(`Token usage: ${response.usage.prompt_tokens} prompt, ${response.usage.completion_tokens} completion, ${response.usage.total_tokens} total`);
    }
    console.log('===================\n');
}
describe.skip('LLM Agent Communication Integration Tests', () => {
    let openAIClient;
    beforeAll(() => {
        // Initialize the real OpenAI client with API key from .env
        openAIClient = new OpenAIClient_1.OpenAIClient({
            apiKey: process.env.OPENAI_API_KEY,
            defaultModel: process.env.DEFAULT_MODEL || 'o3-mini',
            maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 4096,
            temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.7
        });
        console.log(`Using model: ${process.env.DEFAULT_MODEL || 'o3-mini'}`);
    });
    describe('Basic LLM Communication', () => {
        it('should send a prompt and receive a valid response', async () => {
            const prompt = 'Respond with a JSON object that has the following properties: name, role, and a list of 3 capabilities.';
            const response = await openAIClient.sendPrompt(prompt);
            logLLMInteraction('Basic Prompt Test', prompt, response);
            (0, chai_1.expect)(response).to.not.be.undefined;
            (0, chai_1.expect)(response.choices[0].message.content).to.be.a('string');
            (0, chai_1.expect)(response.model).to.be.a('string');
            (0, chai_1.expect)(response.usage.prompt_tokens).to.be.a('number');
            (0, chai_1.expect)(response.usage.completion_tokens).to.be.a('number');
            (0, chai_1.expect)(response.usage.total_tokens).to.be.a('number');
            // Parse the response content as JSON
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(response.choices[0].message.content);
            }
            catch (error) {
                // If not valid JSON, the test will fail in the next step
            }
            // Verify JSON structure
            (0, chai_1.expect)(jsonResponse).to.have.property('name');
            (0, chai_1.expect)(jsonResponse).to.have.property('role');
            (0, chai_1.expect)(jsonResponse).to.have.property('capabilities').that.is.an('array');
            (0, chai_1.expect)(jsonResponse.capabilities).to.have.lengthOf(3);
        }).timeout(30000);
        it('should use structured messages format for conversation', async () => {
            const messages = [
                { role: 'system', content: 'You are a helpful assistant that responds in JSON format.' },
                { role: 'user', content: 'Create a JSON object with these properties: taskName, priority (high/medium/low), and estimatedDuration in minutes.' }
            ];
            const response = await openAIClient.sendPrompt(messages);
            logLLMInteraction('Structured Messages Test', messages, response);
            (0, chai_1.expect)(response).to.not.be.undefined;
            (0, chai_1.expect)(response.choices[0].message.content).to.be.a('string');
            // Parse the response content as JSON
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(response.choices[0].message.content);
            }
            catch (error) {
                // If not valid JSON, the test will fail in the next step
            }
            // Verify JSON structure 
            (0, chai_1.expect)(jsonResponse).to.have.property('taskName').that.is.a('string');
            (0, chai_1.expect)(jsonResponse).to.have.property('priority').that.is.a('string');
            (0, chai_1.expect)(['high', 'medium', 'low']).to.include(jsonResponse.priority);
            (0, chai_1.expect)(jsonResponse).to.have.property('estimatedDuration').that.is.a('number');
        }).timeout(30000);
    });
    describe('Agent-to-Agent Communication', () => {
        let fixture;
        beforeEach(async () => {
            fixture = (0, test_helpers_1.createTestFixture)();
            await fixture.coordinator.initialize();
            // Replace the mock OpenAI client with the real one
            fixture.openAIClient = openAIClient;
        });
        afterEach(async () => {
            await fixture.coordinator.stop();
        });
        it('should enable two agents to communicate through shared state', async () => {
            // Create two agents
            const extractorAgent = (0, test_helpers_1.createTestAgent)('extractor', ['information-extraction'], {
                name: 'Information Extractor'
            });
            const analyzerAgent = (0, test_helpers_1.createTestAgent)('analyzer', ['information-analysis'], {
                name: 'Information Analyzer'
            });
            // Register the agents
            await fixture.coordinator.registerAgent(extractorAgent);
            await fixture.coordinator.registerAgent(analyzerAgent);
            // Create a shared state key for the agents to communicate through
            const sessionId = (0, uuid_1.v4)();
            fixture.sharedStateManager.setState(`sessions.${sessionId}`, {
                id: sessionId,
                status: 'active',
                data: {},
                createdAt: Date.now()
            });
            // Extractor agent extracts information
            const extractorPrompt = [
                { role: 'system', content: 'You are an extraction agent that identifies key information from text.' },
                { role: 'user', content: 'Extract key entities, dates, and numbers from the following text and respond with a JSON object:\n\nApple Inc. reported quarterly revenue of $97.3 billion on April 28, 2022, which was an 8.6% increase compared to last year. CEO Tim Cook announced 3 new products launching in September 2022.' }
            ];
            const extractorResponse = await openAIClient.sendPrompt(extractorPrompt);
            logLLMInteraction('Extractor Agent', extractorPrompt, extractorResponse);
            let extractedData;
            try {
                extractedData = JSON.parse(extractorResponse.choices[0].message.content);
            }
            catch (error) {
                // Handle the error by creating a structured format from the text
                extractedData = {
                    raw: extractorResponse.choices[0].message.content,
                    parsed: false
                };
            }
            // Store the extracted data in the shared state
            fixture.sharedStateManager.setState(`sessions.${sessionId}.data.extracted`, extractedData);
            // Analyzer agent analyzes the extracted information
            const extractedState = fixture.sharedStateManager.getState(`sessions.${sessionId}.data.extracted`);
            const analyzerPrompt = [
                { role: 'system', content: 'You are an analysis agent that analyzes extracted information and provides insights.' },
                { role: 'user', content: `Analyze the following extracted data and provide insights in JSON format with properties: topInsights (array of strings), importance (high/medium/low), and suggestedActions (array of strings):\n\n${JSON.stringify(extractedState)}` }
            ];
            const analyzerResponse = await openAIClient.sendPrompt(analyzerPrompt);
            logLLMInteraction('Analyzer Agent', analyzerPrompt, analyzerResponse);
            let analysisData;
            try {
                analysisData = JSON.parse(analyzerResponse.choices[0].message.content);
            }
            catch (error) {
                // Handle the error by creating a structured format from the text
                analysisData = {
                    raw: analyzerResponse.choices[0].message.content,
                    parsed: false
                };
            }
            // Store the analysis in the shared state
            fixture.sharedStateManager.setState(`sessions.${sessionId}.data.analysis`, analysisData);
            // Verify the communication occurred by checking the shared state
            const sessionState = fixture.sharedStateManager.getState(`sessions.${sessionId}`);
            console.log('\n=== Agent Communication Results ===');
            console.log('Extracted data:', JSON.stringify(sessionState.data.extracted).substring(0, 100) + '...');
            console.log('Analysis data:', JSON.stringify(sessionState.data.analysis).substring(0, 100) + '...');
            console.log('=====================================\n');
            (0, chai_1.expect)(sessionState).to.have.nested.property('data.extracted');
            (0, chai_1.expect)(sessionState).to.have.nested.property('data.analysis');
            if (sessionState.data.analysis.parsed !== false) {
                (0, chai_1.expect)(sessionState.data.analysis).to.have.property('topInsights').that.is.an('array');
                (0, chai_1.expect)(sessionState.data.analysis).to.have.property('importance').that.is.a('string');
                (0, chai_1.expect)(sessionState.data.analysis).to.have.property('suggestedActions').that.is.an('array');
            }
        }).timeout(60000);
    });
    describe('Multi-step LLM Agent Task Processing', () => {
        let fixture;
        beforeEach(async () => {
            fixture = (0, test_helpers_1.createTestFixture)();
            await fixture.coordinator.initialize();
            // Replace the mock OpenAI client with the real one
            fixture.openAIClient = openAIClient;
        });
        afterEach(async () => {
            await fixture.coordinator.stop();
        });
        it('should perform a multi-step task with multiple agent interactions', async () => {
            console.log('\n=== Starting Multi-step Task Test ===');
            // Create agents for different stages of processing
            const researchAgent = (0, test_helpers_1.createTestAgent)('research', ['research'], {
                name: 'Research Agent'
            });
            const plannerAgent = (0, test_helpers_1.createTestAgent)('planner', ['planning'], {
                name: 'Planning Agent'
            });
            const writerAgent = (0, test_helpers_1.createTestAgent)('writer', ['writing'], {
                name: 'Writing Agent'
            });
            // Register the agents
            await fixture.coordinator.registerAgent(researchAgent);
            await fixture.coordinator.registerAgent(plannerAgent);
            await fixture.coordinator.registerAgent(writerAgent);
            // Create a new task
            const taskId = await fixture.taskManager.createTask({
                title: 'Create a summary of quantum computing',
                description: 'Research quantum computing, plan an outline, and write a summary',
                type: 'content_creation',
                priority: 'medium',
                status: 'pending',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                metadata: {
                    topic: 'quantum computing',
                    length: 'brief',
                    style: 'educational'
                }
            });
            console.log(`Created task: ${taskId}`);
            // Step 1: Research phase
            await fixture.taskManager.assignTask(taskId, researchAgent.id);
            await fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
            console.log(`Step 1: Research phase - Task assigned to ${researchAgent.id}`);
            const researchPrompt = [
                { role: 'system', content: 'You are a research agent specializing in gathering key information on topics.' },
                { role: 'user', content: `Research the topic of quantum computing and provide a JSON response with these properties: keyPoints (array of strings), importantConcepts (array of objects with name and description), and relevantFields (array of strings). Topic details: ${JSON.stringify(fixture.taskManager.getTask(taskId).metadata)}` }
            ];
            const researchResponse = await openAIClient.sendPrompt(researchPrompt);
            logLLMInteraction('Research Agent', researchPrompt, researchResponse);
            let researchData;
            try {
                researchData = JSON.parse(researchResponse.choices[0].message.content);
            }
            catch (error) {
                researchData = {
                    raw: researchResponse.choices[0].message.content,
                    parsed: false
                };
            }
            // Store the research results in the task metadata
            const task = await fixture.taskManager.getTask(taskId);
            await fixture.taskManager.updateTask(taskId, {
                metadata: {
                    ...task.metadata,
                    researchResults: researchData
                }
            });
            console.log('Research data stored in task metadata');
            // Step 2: Planning phase  
            await fixture.taskManager.assignTask(taskId, plannerAgent.id);
            console.log(`Step 2: Planning phase - Task assigned to ${plannerAgent.id}`);
            const updatedTask = await fixture.taskManager.getTask(taskId);
            const planningPrompt = [
                { role: 'system', content: 'You are a planning agent that organizes information into structured outlines.' },
                { role: 'user', content: `Create an outline for a summary on quantum computing based on this research: ${JSON.stringify(updatedTask.metadata?.researchResults)}. Respond with a JSON object having: title, introduction (string), sections (array of objects with heading and bulletPoints), and conclusion (string).` }
            ];
            const planningResponse = await openAIClient.sendPrompt(planningPrompt);
            logLLMInteraction('Planning Agent', planningPrompt, planningResponse);
            let outlineData;
            try {
                outlineData = JSON.parse(planningResponse.choices[0].message.content);
            }
            catch (error) {
                outlineData = {
                    raw: planningResponse.choices[0].message.content,
                    parsed: false
                };
            }
            // Store the outline in the task metadata
            await fixture.taskManager.updateTask(taskId, {
                metadata: {
                    ...updatedTask.metadata,
                    outlineData: outlineData
                }
            });
            console.log('Outline data stored in task metadata');
            // Step 3: Writing phase
            await fixture.taskManager.assignTask(taskId, writerAgent.id);
            console.log(`Step 3: Writing phase - Task assigned to ${writerAgent.id}`);
            const taskWithOutline = await fixture.taskManager.getTask(taskId);
            const writingPrompt = [
                { role: 'system', content: 'You are a writing agent that creates concise, informative content from outlines.' },
                { role: 'user', content: `Write a summary about quantum computing following this outline: ${JSON.stringify(taskWithOutline.metadata?.outlineData)}. Keep it educational and brief as specified in the task. Respond with a JSON object containing: title, content (the full text), and keyTakeaways (array of strings).` }
            ];
            const writingResponse = await openAIClient.sendPrompt(writingPrompt);
            logLLMInteraction('Writing Agent', writingPrompt, writingResponse);
            let summaryData;
            try {
                summaryData = JSON.parse(writingResponse.choices[0].message.content);
            }
            catch (error) {
                summaryData = {
                    raw: writingResponse.choices[0].message.content,
                    parsed: false
                };
            }
            // Complete the task with the final result
            await fixture.taskManager.updateTask(taskId, {
                status: 'completed',
                metadata: {
                    ...taskWithOutline.metadata,
                    finalResult: summaryData
                }
            });
            console.log('Final content stored, task completed');
            // Verify the multi-step process
            const finalTask = await fixture.taskManager.getTask(taskId);
            console.log('\n=== Multi-step Task Results ===');
            console.log(`Task status: ${finalTask.status}`);
            console.log('Final content title:', finalTask.metadata?.finalResult.title);
            console.log('Content length:', countWords(finalTask.metadata?.finalResult.content || ''), 'words');
            console.log('Key takeaways:', finalTask.metadata?.finalResult.keyTakeaways?.length || 0);
            console.log('==============================\n');
            (0, chai_1.expect)(finalTask.status).to.equal('completed');
            (0, chai_1.expect)(finalTask.metadata).to.have.property('researchResults');
            (0, chai_1.expect)(finalTask.metadata).to.have.property('outlineData');
            (0, chai_1.expect)(finalTask.metadata).to.have.property('finalResult');
            // The final result should contain the content
            if (finalTask.metadata?.finalResult.parsed !== false) {
                (0, chai_1.expect)(finalTask.metadata?.finalResult).to.have.property('title');
                (0, chai_1.expect)(finalTask.metadata?.finalResult).to.have.property('content').that.is.a('string');
                (0, chai_1.expect)(finalTask.metadata?.finalResult).to.have.property('keyTakeaways').that.is.an('array');
            }
        }).timeout(120000);
    });
    describe('LLM Utility Functions', () => {
        it('should calculate token usage correctly', async () => {
            const prompt = 'What is quantum computing?';
            const response = await openAIClient.sendPrompt(prompt);
            logLLMInteraction('Token Usage Test', prompt, response);
            (0, chai_1.expect)(response.usage.prompt_tokens).to.be.a('number');
            (0, chai_1.expect)(response.usage.completion_tokens).to.be.a('number');
            (0, chai_1.expect)(response.usage.total_tokens).to.be.a('number');
            // Verify total is sum of prompt and completion
            (0, chai_1.expect)(response.usage.total_tokens).to.equal(response.usage.prompt_tokens + response.usage.completion_tokens);
        }).timeout(30000);
        it('should generate embeddings for text', async () => {
            const text = 'Quantum computing uses quantum phenomena to perform operations on data.';
            const embedding = await openAIClient.generateEmbedding(text);
            console.log(`\n=== Embedding Test ===`);
            console.log(`Text (${countWords(text)} words): ${text}`);
            console.log(`Embedding vector length: ${embedding.length}`);
            console.log(`First 5 values: ${embedding.slice(0, 5).join(', ')}`);
            console.log(`=====================\n`);
            (0, chai_1.expect)(embedding).to.be.an('array');
            (0, chai_1.expect)(embedding.length).to.be.greaterThan(0);
            embedding.forEach(value => {
                (0, chai_1.expect)(value).to.be.a('number');
            });
        }).timeout(30000);
        it('should retrieve available models', async () => {
            const models = await openAIClient.getAvailableModels();
            console.log(`\n=== Available Models ===`);
            console.log(`Models available: ${models.length}`);
            console.log(`Model list: ${models.join(', ')}`);
            console.log(`======================\n`);
            (0, chai_1.expect)(models).to.be.an('array');
            (0, chai_1.expect)(models.length).to.be.greaterThan(0);
        }).timeout(30000);
        it('should get model information', async () => {
            const defaultModel = openAIClient.getDefaultModel();
            const modelInfo = await openAIClient.getModelInfo(defaultModel);
            console.log(`\n=== Model Info ===`);
            console.log(`Default model: ${defaultModel}`);
            console.log(`Model info: ${JSON.stringify(modelInfo, null, 2)}`);
            console.log(`================\n`);
            (0, chai_1.expect)(modelInfo).to.not.be.null;
            if (modelInfo) {
                (0, chai_1.expect)(modelInfo.id).to.equal(defaultModel);
                (0, chai_1.expect)(modelInfo.maxTokens).to.be.a('number');
                (0, chai_1.expect)(modelInfo.contextWindow).to.be.a('number');
                (0, chai_1.expect)(modelInfo.capabilities).to.be.an('array');
            }
        }).timeout(30000);
    });
});
//# sourceMappingURL=llm-agent-communication.test.js.map