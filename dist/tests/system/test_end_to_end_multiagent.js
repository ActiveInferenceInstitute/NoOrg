"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const MultiAgentCoordinator_1 = require("../../src/core/multiagent/MultiAgentCoordinator");
const AgentRegistry_1 = require("../../src/core/multiagent/AgentRegistry");
const SharedStateManager_1 = require("../../src/core/multiagent/SharedStateManager");
const TaskManager_1 = require("../../src/core/multiagent/TaskManager");
const PromptManager_1 = require("../../src/core/multiagent/PromptManager");
const OpenAIClient_1 = require("../../src/core/multiagent/OpenAIClient");
const ResearchAgent_1 = require("../../src/agents/ResearchAgent");
const CreativeWritingAgent_1 = require("../../src/agents/CreativeWritingAgent");
const test_helpers_1 = require("../utils/test_helpers");
(0, mocha_1.describe)('End-to-End Multiagent System Test', function () {
    // Set timeout to allow for longer-running tests
    this.timeout(30000);
    let coordinator;
    let agentRegistry;
    let sharedStateManager;
    let taskManager;
    let promptManager;
    let openAIClient;
    let tempDir;
    let promptsDir;
    let outputDir;
    let logger;
    let sandbox;
    let researchAgent;
    let creativeAgent;
    let researchAgentId;
    let creativeAgentId;
    let coordinatorName = "TestCoordinator";
    (0, mocha_1.before)(async function () {
        // Set up sandbox for test isolation
        sandbox = sinon_1.default.createSandbox();
        // Create temporary test directories
        tempDir = (0, test_helpers_1.createTempDirectory)(path_1.default.join(__dirname, '../'), 'temp_system_test');
        promptsDir = path_1.default.join(tempDir, 'prompts');
        outputDir = path_1.default.join(tempDir, 'output');
        if (!fs_1.default.existsSync(promptsDir)) {
            fs_1.default.mkdirSync(promptsDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        // Create test logger
        logger = (0, test_helpers_1.createTestLogger)(outputDir, 'system_test');
        // Create test prompt templates
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'system_role', 'You are {agent_name}, an AI assistant with capabilities: {capabilities}. Your primary goal is: {goal}.');
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'agent_coordination', 'Task: {task_description}\nAvailable agents: {available_agents}\nShared state: {shared_state}');
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'research_prompt', 'Research the following topic: {topic}\nProvide detailed information including key facts, historical context, and current status.');
        (0, test_helpers_1.createPromptTemplate)(promptsDir, 'creative_prompt', 'Write a {type} about {topic} with the following themes: {themes}.\nUse the provided research to inform your writing: {research}');
        // Create component instances
        agentRegistry = new AgentRegistry_1.AgentRegistry();
        sharedStateManager = new SharedStateManager_1.SharedStateManager();
        taskManager = new TaskManager_1.TaskManager();
        promptManager = new PromptManager_1.PromptManager(promptsDir);
        openAIClient = new OpenAIClient_1.OpenAIClient({
            apiKey: 'test-api-key',
            defaultModel: 'test-model',
            maxTokens: 2000,
            temperature: 0.7
        });
        // Create stub for OpenAI client
        const openAIStub = (0, test_helpers_1.stubOpenAIClient)(openAIClient, {
            ...test_helpers_1.DEFAULT_TEST_RESPONSES,
            'research': {
                topic: 'quantum computing',
                findings: [
                    'Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously',
                    'Major quantum computing approaches include superconducting circuits, trapped ions, and photonic systems',
                    'Recent advancements include Google\'s quantum supremacy claim and IBM\'s 433-qubit Osprey processor',
                    'Quantum computing has potential applications in cryptography, drug discovery, and optimization problems'
                ],
                sources: [
                    'https://example.com/quantum-computing-approaches',
                    'https://example.com/quantum-supremacy'
                ],
                confidence: 0.95
            },
            'creative': {
                content: 'The Quantum Frontier: A Journey into Computing\'s Next Dimension\n\nIn the silent depths of near-absolute zero temperatures, where atoms barely whisper their movement, a revolution is taking place. Quantum computers, unlike their classical counterparts that speak in the binary language of 1s and 0s, communicate through qubits—entities that can exist in multiple states simultaneously through the mysterious phenomenon of superposition...',
                metrics: {
                    wordCount: 850,
                    readingLevel: 'Advanced',
                    toneScore: 0.85
                },
                confidence: 0.92
            }
        });
        // Initialize coordinator with components
        coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator(coordinatorName, {
            agentRegistry,
            sharedStateManager,
            taskManager,
            promptManager,
            openAIClient
        });
        // Initialize the coordinator
        await coordinator.initialize();
        // Create and initialize agents
        researchAgent = new ResearchAgent_1.ResearchAgent("ResearchBot", {
            openAIClient,
            sharedState: sharedStateManager,
            preferredModel: 'o3-mini',
            description: 'Research agent for gathering information and analyzing data',
            cacheTTL: 3600000 // 1 hour cache
        });
        creativeAgent = new CreativeWritingAgent_1.CreativeWritingAgent("CreativeBot", {
            openAIClient,
            sharedState: sharedStateManager,
            preferredModel: 'o3-mini',
            description: 'Creative writing agent for producing engaging content',
            cacheTTL: 3600000 // 1 hour cache
        });
        // Initialize the agents
        await researchAgent.initialize();
        await creativeAgent.initialize();
        // Register agents with coordinator
        const researchAgentResult = await coordinator.registerAgent(researchAgent.getAgentInfo());
        const creativeAgentResult = await coordinator.registerAgent(creativeAgent.getAgentInfo());
        // Make sure we have valid agent IDs
        if (researchAgentResult === null || creativeAgentResult === null) {
            throw new Error("Failed to register agents with coordinator");
        }
        researchAgentId = researchAgentResult;
        creativeAgentId = creativeAgentResult;
        // Start the coordinator
        await coordinator.start();
        // Log test setup completion
        logger.log('System test setup completed successfully');
    });
    (0, mocha_1.after)(async function () {
        // Clean up sandbox
        sandbox.restore();
        // Stop the coordinator
        await coordinator.stop();
        // Create test report
        (0, test_helpers_1.createTestReport)(outputDir, 'system_test_report', {
            testName: 'End-to-End Multiagent System Test',
            components: {
                coordinator: { name: coordinatorName },
                agents: [
                    { id: researchAgentId, name: 'ResearchBot', type: 'research' },
                    { id: creativeAgentId, name: 'CreativeBot', type: 'creative-writing' }
                ]
            },
            results: {
                success: true,
                completedTasks: 2
            }
        });
        // Close logger
        logger.close();
        // Clean up temporary directories
        (0, test_helpers_1.cleanupTempDirectory)(tempDir);
    });
    (0, mocha_1.it)('should execute a multi-agent task flow with research and content creation', async function () {
        // Test steps to execute in sequence
        const steps = [
            // Step 1: Create research task
            async () => {
                logger.step(1, 'Creating research task for quantum computing');
                const researchTaskId = await taskManager.createTask({
                    title: 'Research Quantum Computing',
                    description: 'Gather comprehensive information about quantum computing including principles, current state, and future applications',
                    type: 'research',
                    priority: 'high',
                    status: 'pending',
                    metadata: {
                        topic: 'quantum computing',
                        requiredSections: ['principles', 'current technology', 'applications']
                    }
                });
                // Assign to research agent
                await coordinator.assignTask(researchTaskId, researchAgentId);
                return { researchTaskId };
            },
            // Step 2: Wait for research task completion and verify results
            async (prevResult) => {
                logger.step(2, 'Waiting for research task completion');
                // Simulate the research agent processing the task
                const researchTask = await taskManager.getTask(prevResult.researchTaskId);
                // Mock the research process - in a real scenario, this would happen through the agent's own processing
                await (0, test_helpers_1.wait)(1000); // Simulate processing time
                // Complete the task with research results
                await taskManager.completeTask(prevResult.researchTaskId, {
                    success: true,
                    data: {
                        topic: 'quantum computing',
                        findings: [
                            'Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously',
                            'Current quantum computers require extreme cooling to near absolute zero',
                            'Major applications include cryptography, drug discovery, and optimization problems',
                            'Leading companies include IBM, Google, and Microsoft'
                        ],
                        sources: [
                            'https://example.com/quantum-computing-basics',
                            'https://example.com/quantum-applications'
                        ]
                    }
                });
                // Update shared state with research results
                await sharedStateManager.setState('research.quantumComputing', {
                    findings: [
                        'Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously',
                        'Current quantum computers require extreme cooling to near absolute zero',
                        'Major applications include cryptography, drug discovery, and optimization problems',
                        'Leading companies include IBM, Google, and Microsoft'
                    ],
                    completedAt: Date.now()
                });
                const updatedTask = await taskManager.getTask(prevResult.researchTaskId);
                // Verify task was completed successfully
                (0, chai_1.expect)(updatedTask.status).to.equal('completed');
                (0, chai_1.expect)(updatedTask.result.success).to.be.true;
                return {
                    ...prevResult,
                    researchResults: updatedTask.result.data
                };
            },
            // Step 3: Create content creation task using research results
            async (prevResult) => {
                logger.step(3, 'Creating content creation task based on research');
                const contentTaskId = await taskManager.createTask({
                    title: 'Create Article on Quantum Computing',
                    description: 'Write an engaging article about quantum computing for a general audience using the provided research',
                    type: 'content-creation',
                    priority: 'medium',
                    status: 'pending',
                    dependsOn: [prevResult.researchTaskId],
                    metadata: {
                        contentType: 'article',
                        topic: 'quantum computing',
                        audience: 'general',
                        tone: 'informative yet engaging',
                        maxLength: 1000
                    }
                });
                // Assign to creative writing agent
                await coordinator.assignTask(contentTaskId, creativeAgentId);
                return {
                    ...prevResult,
                    contentTaskId
                };
            },
            // Step 4: Wait for content creation task completion and verify results
            async (prevResult) => {
                logger.step(4, 'Waiting for content creation task completion');
                // Simulate the creative agent processing the task
                await (0, test_helpers_1.wait)(1500); // Simulate longer processing time for content creation
                // Mock article content
                const articleContent = 'The Quantum Revolution: Understanding Computing\'s Next Frontier\n\n' +
                    'In the world of computing, a revolution is brewing. Quantum computers, unlike their classical counterparts, ' +
                    'operate on principles that seem to defy our everyday understanding of reality. While classical computers use ' +
                    'bits that represent either 0 or 1, quantum computers use quantum bits or "qubits" that can exist in multiple ' +
                    'states simultaneously through a phenomenon called superposition...\n\n' +
                    '[Content continues with explanation of quantum principles, current technology state, and applications]';
                // Complete the task with content results
                await taskManager.completeTask(prevResult.contentTaskId, {
                    success: true,
                    data: {
                        title: 'The Quantum Revolution: Understanding Computing\'s Next Frontier',
                        content: articleContent,
                        wordCount: 850,
                        readabilityScore: 65, // Flesch-Kincaid score
                        targetAudience: 'general'
                    }
                });
                // Update shared state with content results
                await sharedStateManager.setState('content.quantumComputingArticle', {
                    title: 'The Quantum Revolution: Understanding Computing\'s Next Frontier',
                    excerpt: articleContent.substring(0, 200) + '...',
                    completedAt: Date.now(),
                    wordCount: 850
                });
                const updatedTask = await taskManager.getTask(prevResult.contentTaskId);
                // Verify task was completed successfully
                (0, chai_1.expect)(updatedTask.status).to.equal('completed');
                (0, chai_1.expect)(updatedTask.result.success).to.be.true;
                (0, chai_1.expect)(updatedTask.result.data.wordCount).to.be.approximately(850, 100);
                return {
                    ...prevResult,
                    contentResults: updatedTask.result.data
                };
            },
            // Step 5: Verify final state of the system
            async (prevResult) => {
                logger.step(5, 'Verifying final system state');
                // Check agent states
                const agents = await agentRegistry.listAgents();
                (0, chai_1.expect)(agents).to.have.lengthOf(2);
                // Verify tasks in task manager
                const completedTasks = await taskManager.listTasks({ status: ['completed'] });
                (0, chai_1.expect)(completedTasks).to.have.lengthOf(2);
                // Check shared state for final outputs
                const researchState = await sharedStateManager.getState('research.quantumComputing');
                const contentState = await sharedStateManager.getState('content.quantumComputingArticle');
                (0, chai_1.expect)(researchState).to.have.property('findings');
                (0, chai_1.expect)(contentState).to.have.property('title');
                // Final test results
                return {
                    success: true,
                    researchTaskId: prevResult.researchTaskId,
                    contentTaskId: prevResult.contentTaskId,
                    agents: agents.map(a => ({ id: a.id, name: a.name, type: a.type }))
                };
            }
        ];
        // Run all steps in sequence
        const results = await (0, test_helpers_1.runTestSteps)(steps, logger);
        (0, chai_1.expect)(results[results.length - 1].success).to.be.true;
    });
});
//# sourceMappingURL=test_end_to_end_multiagent.js.map