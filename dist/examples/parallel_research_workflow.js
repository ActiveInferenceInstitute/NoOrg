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
const AnalysisAgent_1 = require("../agents/AnalysisAgent");
const PlanningAgent_1 = require("../agents/PlanningAgent");
const WritingAgent_1 = require("../agents/WritingAgent");
const ReviewAgent_1 = require("../agents/ReviewAgent");
const FinalReviewAgent_1 = require("../agents/FinalReviewAgent");
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
 * This example demonstrates a parallel research workflow where:
 * 1. Multiple research agents work in parallel on different aspects
 * 2. Analysis agents process the research results
 * 3. A planning agent creates a content plan
 * 4. A writing agent generates content
 * 5. Review agents check the content
 * 6. A final review agent performs the final check
 */
async function runParallelResearchWorkflow() {
    console.log('Starting Parallel Research Workflow Example');
    // Initialize shared components
    const sharedState = SharedStateManager_1.SharedStateManager.getInstance();
    const taskManager = new TaskManager_1.TaskManager();
    const agentRegistry = new AgentRegistry_1.AgentRegistry();
    const openAIClient = new OpenAIClient_1.OpenAIClient();
    const promptManager = new PromptManager_1.PromptManager('src/prompts');
    // Create the coordinator
    const coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator("Parallel Research Workflow Coordinator", {
        sharedStateManager: sharedState,
        taskManager: taskManager,
        agentRegistry: agentRegistry,
        openAIClient: openAIClient,
        promptManager: promptManager
    });
    // Initialize the coordinator
    await coordinator.initialize();
    console.log('Coordinator initialized');
    // Define research paths
    const researchPaths = [
        {
            id: 'technical',
            name: 'Technical Research',
            aspects: ['current state', 'challenges', 'opportunities']
        },
        {
            id: 'market',
            name: 'Market Research',
            aspects: ['market size', 'competition', 'trends']
        },
        {
            id: 'user',
            name: 'User Research',
            aspects: ['needs', 'pain points', 'preferences']
        }
    ];
    // Create research agents
    const researchAgents = researchPaths.map(path => new ResearchAgent_1.ResearchAgent(path.name, {
        name: path.name,
        description: `Specializes in ${path.name.toLowerCase()}`,
        capabilities: ['research', 'extraction', 'summarization', 'fact-checking'],
        preferredModel: 'o3-mini'
    }));
    // Create analysis agents
    const analysisAgents = researchPaths.map(path => new AnalysisAgent_1.AnalysisAgent(path.name, {
        name: path.name,
        description: `Specializes in analyzing ${path.name.toLowerCase()}`,
        capabilities: ['analysis', 'reporting'],
        preferredModel: 'o3-mini'
    }));
    // Create planning agent
    const planningAgent = new PlanningAgent_1.PlanningAgent('Content Planner', {
        name: 'Content Planner',
        description: 'Specializes in creating content plans',
        capabilities: ['planning', 'organization'],
        preferredModel: 'o3-mini'
    });
    // Create writing agent
    const writingAgent = new WritingAgent_1.WritingAgent('Content Writer', {
        name: 'Content Writer',
        description: 'Specializes in creating content',
        capabilities: ['writing', 'editing'],
        preferredModel: 'o3-mini'
    });
    // Create review agent
    const reviewAgent = new ReviewAgent_1.ReviewAgent('Content Reviewer', {
        name: 'Content Reviewer',
        description: 'Specializes in reviewing content',
        capabilities: ['review', 'validation'],
        preferredModel: 'o3-mini'
    });
    // Create final review agent
    const finalReviewAgent = new FinalReviewAgent_1.FinalReviewAgent('Final Reviewer', {
        name: 'Final Reviewer',
        description: 'Specializes in final content review',
        capabilities: ['review', 'validation', 'final-check'],
        preferredModel: 'o3-mini'
    });
    // Initialize all agents
    await Promise.all([
        ...researchAgents.map(agent => agent.initialize()),
        ...analysisAgents.map(agent => agent.initialize()),
        planningAgent.initialize(),
        writingAgent.initialize(),
        reviewAgent.initialize(),
        finalReviewAgent.initialize()
    ]);
    console.log('All agents initialized');
    // Register agents with the coordinator
    await Promise.all([
        ...researchAgents.map(agent => coordinator.registerAgent({
            name: agent.getAgentInfo().name,
            type: agent.getAgentInfo().type,
            description: agent.getAgentInfo().name,
            capabilities: ['research', 'extraction', 'summarization', 'fact-checking'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        })),
        ...analysisAgents.map(agent => coordinator.registerAgent({
            name: agent.getAgentInfo().name,
            type: agent.getAgentInfo().type,
            description: agent.getAgentInfo().name,
            capabilities: ['analysis', 'reporting'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        })),
        coordinator.registerAgent({
            name: planningAgent.getAgentInfo().name,
            type: planningAgent.getAgentInfo().type,
            description: planningAgent.getAgentInfo().name,
            capabilities: ['planning', 'organization'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        }),
        coordinator.registerAgent({
            name: writingAgent.getAgentInfo().name,
            type: writingAgent.getAgentInfo().type,
            description: writingAgent.getAgentInfo().name,
            capabilities: ['writing', 'editing'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        }),
        coordinator.registerAgent({
            name: reviewAgent.getAgentInfo().name,
            type: reviewAgent.getAgentInfo().type,
            description: reviewAgent.getAgentInfo().name,
            capabilities: ['review', 'validation'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        }),
        coordinator.registerAgent({
            name: finalReviewAgent.getAgentInfo().name,
            type: finalReviewAgent.getAgentInfo().type,
            description: finalReviewAgent.getAgentInfo().name,
            capabilities: ['review', 'validation', 'final-check'],
            status: 'available',
            metadata: {},
            preferredModel: 'o3-mini',
            createdAt: Date.now(),
            lastActive: Date.now()
        })
    ]);
    console.log('All agents registered');
    // Define workflow stages
    const stages = [
        // Research stages
        ...researchPaths.map(path => ({
            id: `${path.id}_research`,
            type: 'research',
            title: path.name,
            description: `Research ${path.name.toLowerCase()}`,
            agent: researchAgents[researchPaths.indexOf(path)],
            next: [`${path.id}_analysis`]
        })),
        // Analysis stages
        ...researchPaths.map(path => ({
            id: `${path.id}_analysis`,
            type: 'analysis',
            title: `${path.name} Analysis`,
            description: `Analyze ${path.name.toLowerCase()}`,
            agent: analysisAgents[researchPaths.indexOf(path)],
            dependsOn: [`${path.id}_research`],
            next: ['content_planning']
        })),
        // Planning stage
        {
            id: 'content_planning',
            type: 'planning',
            title: 'Content Planning',
            description: 'Create content plan based on research and analysis',
            agent: planningAgent,
            dependsOn: researchPaths.map(path => `${path.id}_analysis`),
            next: ['content_writing']
        },
        // Writing stage
        {
            id: 'content_writing',
            type: 'writing',
            title: 'Content Writing',
            description: 'Generate content based on the plan',
            agent: writingAgent,
            dependsOn: ['content_planning'],
            next: ['content_review']
        },
        // Review stage
        {
            id: 'content_review',
            type: 'review',
            title: 'Content Review',
            description: 'Review the generated content',
            agent: reviewAgent,
            dependsOn: ['content_writing'],
            next: ['final_review']
        },
        // Final review stage
        {
            id: 'final_review',
            type: 'final_review',
            title: 'Final Review',
            description: 'Perform final review of the content',
            agent: finalReviewAgent,
            dependsOn: ['content_review'],
            next: []
        }
    ];
    // Generate and save workflow diagram
    const diagram = generateMermaidDiagram(stages, researchPaths);
    const diagramPath = path.join(outputDir, 'workflow_diagram.md');
    fs.writeFileSync(diagramPath, diagram);
    console.log(`Workflow diagram saved to: ${diagramPath}`);
    // Define the research topic
    const topic = 'The impact of quantum computing on cybersecurity';
    // Execute workflow stages
    for (const stage of stages) {
        console.log(`\nExecuting stage: ${stage.title}`);
        // Create task for the stage
        const taskId = (0, uuid_1.v4)();
        await taskManager.createTask({
            id: taskId,
            type: stage.type,
            title: stage.title,
            description: stage.description,
            status: 'pending',
            priority: 'high',
            metadata: {
                stageId: stage.id,
                dependencies: stage.dependsOn || []
            }
        });
        // Assign task to the agent
        await taskManager.assignTask(taskId, stage.agent.getAgentInfo().name);
        // Start the task
        await taskManager.startTask(taskId);
        try {
            let results;
            // Execute stage-specific logic
            switch (stage.type) {
                case 'research':
                    results = await stage.agent.researchTopic(topic, {
                        aspects: researchPaths.find(p => stage.id.startsWith(p.id))?.aspects || [],
                        depth: 'comprehensive'
                    });
                    break;
                case 'analysis':
                    const researchData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
                    results = await stage.agent.analyzeData(researchData);
                    break;
                case 'planning':
                    const analysisResults = await Promise.all((stage.dependsOn || []).map(async (depId) => {
                        const task = await taskManager.getTask(depId);
                        return task?.results;
                    }));
                    results = await stage.agent.createPlan(topic, analysisResults);
                    break;
                case 'writing':
                    const planData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
                    results = await stage.agent.generateContent(topic, [
                        'professional tone',
                        'comprehensive coverage',
                        'clear structure',
                        'engaging narrative'
                    ]);
                    break;
                case 'review':
                    const contentData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
                    results = await stage.agent.reviewContent(contentData, [
                        'clarity',
                        'accuracy',
                        'completeness',
                        'organization'
                    ]);
                    break;
                case 'final_review':
                    const reviewData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
                    results = await stage.agent.performFinalCheck(reviewData);
                    break;
            }
            // Store results in shared state
            await sharedState.setState(`tasks.${taskId}.results`, results);
            // Save results to file
            const outputPath = path.join(outputDir, `${stage.id}_results.json`);
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
            console.log(`Results saved to: ${outputPath}`);
            // Mark task as complete
            await taskManager.completeTask(taskId, {
                success: true,
                data: {
                    outputLocation: outputPath
                }
            });
            console.log(`Stage completed: ${stage.title}`);
        }
        catch (error) {
            console.error(`Error in stage ${stage.title}:`, error);
            await taskManager.failTask(taskId, error);
            throw error;
        }
    }
    // Calculate and display metrics
    const tasks = await Promise.all(stages.map(stage => taskManager.getTask(stage.id)));
    const totalProcessingTime = tasks.reduce((acc, task) => {
        return acc + (task?.processingTime || 0);
    }, 0);
    console.log('\nWorkflow Metrics:');
    console.log(`Total processing time: ${totalProcessingTime}ms`);
    console.log(`Total stages: ${stages.length}`);
    console.log(`Output files:`);
    stages.forEach(stage => {
        console.log(`- ${stage.id}: ${path.join(outputDir, `${stage.id}_results.json`)}`);
    });
    // Clean up
    console.log('\nShutting down agents...');
    await Promise.all([
        ...researchAgents.map(agent => agent.shutdown()),
        ...analysisAgents.map(agent => agent.shutdown()),
        planningAgent.shutdown(),
        writingAgent.shutdown(),
        reviewAgent.shutdown(),
        finalReviewAgent.shutdown()
    ]);
    console.log('Workflow complete');
}
/**
 * Generate a Mermaid diagram showing the workflow structure
 */
function generateMermaidDiagram(stages, researchPaths) {
    let diagram = 'graph TD\n';
    // Add nodes
    stages.forEach(stage => {
        diagram += `  ${stage.id}["${stage.title}"]\n`;
    });
    // Add edges
    stages.forEach(stage => {
        if (stage.next) {
            stage.next.forEach(nextId => {
                diagram += `  ${stage.id} --> ${nextId}\n`;
            });
        }
    });
    return diagram;
}
// Run the example
runParallelResearchWorkflow().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
});
//# sourceMappingURL=parallel_research_workflow.js.map