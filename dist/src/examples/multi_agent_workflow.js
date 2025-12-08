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
const MultiAgentCoordinator_1 = require("../core/multiagent/MultiAgentCoordinator");
const ResearchAgent_1 = require("../agents/ResearchAgent");
const CreativeWritingAgent_1 = require("../agents/CreativeWritingAgent");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const TaskManager_1 = require("../core/multiagent/TaskManager");
const AgentRegistry_1 = require("../core/multiagent/AgentRegistry");
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const PromptManager_1 = require("../core/multiagent/PromptManager");
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load environment variables
dotenv.config();
// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../../output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
/**
 * This example demonstrates a multi-agent workflow where:
 * 1. A Research Agent collects information on a topic
 * 2. A Creative Writing Agent uses that research to create content
 * 3. The coordinator manages the workflow and shared state
 */
async function runMultiAgentWorkflow() {
    console.log('Starting Multi-Agent Workflow Example');
    // Initialize shared components
    const sharedState = SharedStateManager_1.SharedStateManager.getInstance();
    const taskManager = TaskManager_1.TaskManager.getInstance();
    const agentRegistry = AgentRegistry_1.AgentRegistry.getInstance();
    const openAIClient = new OpenAIClient_1.OpenAIClient(process.env.OPENAI_API_KEY);
    const promptManager = PromptManager_1.PromptManager.getInstance('src/prompts');
    // Create the coordinator
    const coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator("Multi-Agent Workflow Coordinator", {
        sharedStateManager: sharedState,
        taskManager: taskManager,
        agentRegistry: agentRegistry,
        openAIClient: openAIClient,
        promptManager: promptManager
    });
    // Initialize the coordinator
    await coordinator.initialize();
    console.log('Coordinator initialized');
    // Create agents
    const researchAgentId = (0, uuid_1.v4)();
    const researchAgent = new ResearchAgent_1.ResearchAgent('Research Assistant', {
        id: researchAgentId,
        name: 'Research Assistant',
        type: 'research',
        description: 'Specialized in gathering and analyzing information from various sources',
        capabilities: ['research', 'information-extraction', 'fact-checking'],
        preferredModel: 'o3-mini',
        metadata: {}
    });
    const writingAgentId = (0, uuid_1.v4)();
    const writingAgent = new CreativeWritingAgent_1.CreativeWritingAgent('Content Creator', {
        id: writingAgentId,
        name: 'Content Creator',
        description: 'Expert in creating engaging and informative content',
        capabilities: ['content-creation', 'storytelling', 'blog-writing', 'editing'],
        preferredModel: 'o3-mini',
        metadata: {
            specialty: 'creative content',
            creativityLevel: 0.9
        },
        openAIClient: openAIClient,
        sharedState: sharedState
    });
    // Initialize agents
    await researchAgent.initialize();
    await writingAgent.initialize();
    // Register agents with the coordinator
    await coordinator.registerAgent({
        name: 'Research Assistant',
        type: 'research',
        description: 'Specialized in gathering and analyzing information from various sources',
        capabilities: ['research', 'information-extraction', 'fact-checking'],
        preferredModel: 'o3-mini',
        status: 'available',
        lastActive: Date.now(),
        createdAt: Date.now(),
        metadata: {}
    });
    await coordinator.registerAgent({
        name: 'Content Creator',
        type: 'creative-writer',
        description: 'Expert in creating engaging and informative content',
        capabilities: ['content-creation', 'storytelling', 'blog-writing', 'editing'],
        preferredModel: 'o3-mini',
        status: 'available',
        lastActive: Date.now(),
        createdAt: Date.now(),
        metadata: {
            specialty: 'creative content',
            creativityLevel: 0.9
        }
    });
    console.log('Agents registered and initialized');
    // Define the workflow topic
    const topic = 'The impact of quantum computing on cybersecurity';
    // Create workflow steps as tasks
    const researchTaskId = (0, uuid_1.v4)();
    const writingTaskId = (0, uuid_1.v4)();
    // Step 1: Create research task
    await taskManager.createTask({
        id: researchTaskId,
        name: 'Research quantum computing and cybersecurity',
        description: `Gather comprehensive information about ${topic}, including current developments, key challenges, and future implications.`,
        status: 'pending',
        priority: 'high',
        type: 'research',
        metadata: {
            topic
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    // Step 2: Create content creation task (dependent on research)
    await taskManager.createTask({
        id: writingTaskId,
        name: `Create blog post about ${topic}`,
        description: 'Use the research findings to create an informative and engaging blog post about the topic.',
        status: 'pending',
        priority: 'high',
        type: 'content-creation',
        dependsOn: [researchTaskId],
        metadata: {
            format: 'blog-post',
            tone: 'professional',
            length: 'medium'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    console.log('Tasks created');
    // Assign research task to the research agent
    await taskManager.assignTask(researchTaskId, researchAgentId);
    // Assign writing task to the writing agent
    await taskManager.assignTask(writingTaskId, writingAgentId);
    console.log('Tasks assigned to agents');
    // Execute the research task
    console.log('Starting research task...');
    await taskManager.startTask(researchTaskId);
    try {
        // Research agent performs research
        const researchResults = await researchAgent.researchTopic(topic, {
            aspects: ['technical', 'security', 'future'],
            depth: 'comprehensive'
        });
        // Store research results in shared state
        await sharedState.setState(`tasks.${researchTaskId}.results`, researchResults);
        // Save research results to file
        const researchOutputPath = path.join(outputDir, `research_${researchTaskId}.json`);
        fs.writeFileSync(researchOutputPath, JSON.stringify(researchResults, null, 2));
        console.log(`Research results saved to: ${researchOutputPath}`);
        // Mark research task as complete
        await taskManager.completeTask(researchTaskId, {
            success: true,
            data: {
                outputLocation: `tasks.${researchTaskId}.results`
            }
        });
        console.log('Research task completed');
        // Check if writing task is ready (dependencies satisfied)
        if (await taskManager.areDependenciesSatisfied(writingTaskId)) {
            console.log('Starting content creation task...');
            await taskManager.startTask(writingTaskId);
            // Get research results from shared state
            const research = await sharedState.getState(`tasks.${researchTaskId}.results`);
            // Creative writing agent creates content based on research
            const content = await writingAgent.generateContent(topic, {
                format: 'blog-post',
                tone: 'professional',
                length: 'medium',
                keywords: ['quantum computing', 'cybersecurity', 'encryption']
            });
            // Store content in shared state
            await sharedState.setState(`tasks.${writingTaskId}.results`, content);
            // Save generated content to file
            const contentOutputPath = path.join(outputDir, `content_${writingTaskId}.md`);
            fs.writeFileSync(contentOutputPath, `# ${content.title || topic}\n\n${content.content}`);
            console.log(`Generated content saved to: ${contentOutputPath}`);
            // Mark content creation task as complete
            await taskManager.completeTask(writingTaskId, {
                success: true,
                data: {
                    outputLocation: `tasks.${writingTaskId}.results`
                }
            });
            console.log('Content creation task completed');
            // Display the final content
            console.log('\n======= GENERATED CONTENT =======\n');
            console.log(`Title: ${content.title || topic}`);
            console.log(`Word count: ${content.wordCount}`);
            console.log('-----------------------------------\n');
            console.log(content.content);
            console.log('\n=================================\n');
            // Display metrics
            console.log('Workflow metrics:');
            try {
                const researchData = research;
                const contentData = content;
                console.log(`- Research processing time: ${researchData?.processingTime || 'N/A'}ms`);
                console.log(`- Content creation processing time: ${contentData?.processingTime || 'N/A'}ms`);
                console.log(`- Total sources analyzed: ${researchData?.sources?.length || 0}`);
                console.log(`- Output files:`);
                console.log(`  - Research: ${researchOutputPath}`);
                console.log(`  - Content: ${contentOutputPath}`);
            }
            catch (error) {
                console.log('- Could not display detailed metrics');
            }
        }
    }
    catch (error) {
        console.error(`Workflow error: ${error.message}`);
        // Mark failed tasks
        try {
            const researchTask = await taskManager.getTask(researchTaskId);
            if (researchTask.status === 'in-progress') {
                await taskManager.failTask(researchTaskId, new Error(error.message));
            }
        }
        catch (e) {
            console.error(`Error marking research task as failed: ${e}`);
        }
        try {
            const writingTask = await taskManager.getTask(writingTaskId);
            if (writingTask.status === 'in-progress') {
                await taskManager.failTask(writingTaskId, new Error(error.message));
            }
        }
        catch (e) {
            console.error(`Error marking writing task as failed: ${e}`);
        }
    }
    // Workflow complete - clean up
    console.log('Shutting down agents...');
    await researchAgent.shutdown();
    await writingAgent.shutdown();
    console.log('Workflow complete');
}
// Run the example
runMultiAgentWorkflow().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
});
//# sourceMappingURL=multi_agent_workflow.js.map