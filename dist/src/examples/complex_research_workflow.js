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
 * This example demonstrates a complex multi-stage research and content generation workflow:
 * 1. Research Agent: Gathers comprehensive information from multiple sources
 * 2. Analysis Agent: Analyzes and synthesizes research findings
 * 3. Content Planning Agent: Creates detailed content outline
 * 4. Writing Agent: Generates initial content
 * 5. Review Agent: Reviews and suggests improvements
 * 6. Revision Agent: Implements suggested improvements
 * 7. Final Review Agent: Performs final quality check
 */
async function runComplexResearchWorkflow() {
    console.log('Starting Complex Research Workflow');
    // Initialize shared components
    const sharedState = SharedStateManager_1.SharedStateManager.getInstance();
    const taskManager = new TaskManager_1.TaskManager();
    const agentRegistry = new AgentRegistry_1.AgentRegistry();
    const openAIClient = new OpenAIClient_1.OpenAIClient();
    const promptManager = new PromptManager_1.PromptManager('src/prompts');
    // Create the coordinator
    const coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator("Complex Research Workflow Coordinator", {
        sharedStateManager: sharedState,
        taskManager: taskManager,
        agentRegistry: agentRegistry,
        openAIClient: openAIClient,
        promptManager: promptManager
    });
    // Initialize the coordinator
    await coordinator.initialize();
    console.log('Coordinator initialized');
    // Create specialized agents
    const researchAgent = new ResearchAgent('Research Specialist', {
        sharedState,
        openAIClient,
        description: 'Expert in gathering and analyzing information from various sources',
        capabilities: ['research', 'source-verification', 'fact-checking'],
        preferredModel: 'o3-mini'
    });
    const analysisAgent = new AnalysisAgent('Data Analyst', {
        sharedState,
        openAIClient,
        description: 'Specialized in analyzing and synthesizing complex information',
        capabilities: ['data-analysis', 'pattern-recognition', 'insight-generation'],
        preferredModel: 'o3-mini'
    });
    const planningAgent = new PlanningAgent('Content Planner', {
        sharedState,
        openAIClient,
        description: 'Expert in creating detailed content outlines and structure',
        capabilities: ['outline-creation', 'structure-planning', 'content-organization'],
        preferredModel: 'o3-mini'
    });
    const writingAgent = new WritingAgent('Content Writer', {
        sharedState,
        openAIClient,
        description: 'Professional content writer with expertise in various formats',
        capabilities: ['content-creation', 'storytelling', 'technical-writing'],
        preferredModel: 'o3-mini'
    });
    const reviewAgent = new ReviewAgent('Content Reviewer', {
        sharedState,
        openAIClient,
        description: 'Expert in content review and quality assurance',
        capabilities: ['content-review', 'quality-check', 'improvement-suggestions'],
        preferredModel: 'o3-mini'
    });
    const revisionAgent = new RevisionAgent('Content Revisor', {
        sharedState,
        openAIClient,
        description: 'Specialized in implementing content improvements',
        capabilities: ['content-revision', 'improvement-implementation', 'style-consistency'],
        preferredModel: 'o3-mini'
    });
    const finalReviewAgent = new FinalReviewAgent('Final Reviewer', {
        sharedState,
        openAIClient,
        description: 'Expert in final quality checks and polish',
        capabilities: ['final-review', 'polish', 'completeness-check'],
        preferredModel: 'o3-mini'
    });
    // Initialize all agents
    await Promise.all([
        researchAgent.initialize(),
        analysisAgent.initialize(),
        planningAgent.initialize(),
        writingAgent.initialize(),
        reviewAgent.initialize(),
        revisionAgent.initialize(),
        finalReviewAgent.initialize()
    ]);
    // Register all agents
    await Promise.all([
        coordinator.registerAgent(researchAgent.getAgentInfo()),
        coordinator.registerAgent(analysisAgent.getAgentInfo()),
        coordinator.registerAgent(planningAgent.getAgentInfo()),
        coordinator.registerAgent(writingAgent.getAgentInfo()),
        coordinator.registerAgent(reviewAgent.getAgentInfo()),
        coordinator.registerAgent(revisionAgent.getAgentInfo()),
        coordinator.registerAgent(finalReviewAgent.getAgentInfo())
    ]);
    console.log('All agents registered and initialized');
    // Define the research topic and scope
    const topic = 'The Future of Artificial Intelligence in Healthcare';
    const scope = {
        aspects: [
            'Diagnostic Applications',
            'Treatment Planning',
            'Drug Discovery',
            'Patient Care',
            'Healthcare Administration'
        ],
        depth: 'comprehensive',
        targetLength: 'long-form',
        format: 'technical-report'
    };
    // Create workflow stages
    const stages = [
        {
            id: 'initial_research',
            type: 'research',
            name: 'Comprehensive Research',
            description: `Gather detailed information about ${topic}, focusing on all specified aspects.`,
            agent: researchAgent,
            next: ['analysis']
        },
        {
            id: 'analysis',
            type: 'analysis',
            name: 'Research Analysis',
            description: 'Analyze and synthesize research findings, identifying key patterns and insights.',
            agent: analysisAgent,
            dependsOn: ['initial_research'],
            next: ['planning']
        },
        {
            id: 'planning',
            type: 'planning',
            name: 'Content Planning',
            description: 'Create detailed content outline and structure based on analysis.',
            agent: planningAgent,
            dependsOn: ['analysis'],
            next: ['writing']
        },
        {
            id: 'writing',
            type: 'writing',
            name: 'Initial Content Creation',
            description: 'Generate comprehensive content based on the outline.',
            agent: writingAgent,
            dependsOn: ['planning'],
            next: ['review']
        },
        {
            id: 'review',
            type: 'review',
            name: 'Content Review',
            description: 'Review content and suggest improvements.',
            agent: reviewAgent,
            dependsOn: ['writing'],
            next: ['revision']
        },
        {
            id: 'revision',
            type: 'revision',
            name: 'Content Revision',
            description: 'Implement suggested improvements and refinements.',
            agent: revisionAgent,
            dependsOn: ['review'],
            next: ['final_review']
        },
        {
            id: 'final_review',
            type: 'final_review',
            name: 'Final Review',
            description: 'Perform final quality check and polish.',
            agent: finalReviewAgent,
            dependsOn: ['revision'],
            next: []
        }
    ];
    // Execute workflow stages
    for (const stage of stages) {
        console.log(`\nStarting stage: ${stage.title}`);
        // Check dependencies
        if (stage.dependsOn && stage.dependsOn.length > 0) {
            const dependenciesSatisfied = await Promise.all(stage.dependsOn.map(depId => taskManager.areDependenciesSatisfied(depId)));
            if (!dependenciesSatisfied.every(satisfied => satisfied)) {
                console.log(`Dependencies not satisfied for stage: ${stage.title}`);
                continue;
            }
        }
        // Create and assign task
        const taskId = (0, uuid_1.v4)();
        await taskManager.createTask({
            id: taskId,
            type: stage.type,
            name: stage.title,
            description: stage.description,
            status: 'pending',
            priority: 'high',
            metadata: {
                stage: stage.id,
                topic,
                scope
            }
        });
        await taskManager.assignTask(taskId, stage.agent.getAgentInfo().id);
        await taskManager.startTask(taskId);
        try {
            // Execute stage-specific logic
            let results;
            switch (stage.id) {
                case 'initial_research':
                    results = await researchAgent.researchTopic(topic, scope);
                    break;
                case 'analysis':
                    const researchData = sharedState.getState('tasks.initial_research.results');
                    results = await analysisAgent.analyzeResearch(researchData);
                    break;
                case 'planning':
                    const analysisData = sharedState.getState('tasks.analysis.results');
                    results = await planningAgent.createContentPlan(analysisData, scope);
                    break;
                case 'writing':
                    const planData = sharedState.getState('tasks.planning.results');
                    results = await writingAgent.generateContent(planData, scope);
                    break;
                case 'review':
                    const contentData = sharedState.getState('tasks.writing.results');
                    results = await reviewAgent.reviewContent(contentData);
                    break;
                case 'revision':
                    const reviewData = sharedState.getState('tasks.review.results');
                    results = await revisionAgent.reviseContent(reviewData);
                    break;
                case 'final_review':
                    const revisionData = sharedState.getState('tasks.revision.results');
                    results = await finalReviewAgent.performFinalReview(revisionData);
                    break;
            }
            // Store results in shared state
            sharedState.setState(`tasks.${taskId}.results`, results);
            // Save results to file
            const outputPath = path.join(outputDir, `${stage.id}_${taskId}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
            console.log(`Results saved to: ${outputPath}`);
            // Mark task as complete
            await taskManager.completeTask(taskId, {
                success: true,
                data: {
                    outputLocation: `tasks.${taskId}.results`
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
    // Generate final report
    const finalContent = sharedState.getState('tasks.final_review.results');
    const reportPath = path.join(outputDir, 'final_report.md');
    fs.writeFileSync(reportPath, `# ${topic}\n\n${finalContent.content}`);
    console.log(`\nFinal report saved to: ${reportPath}`);
    // Display workflow metrics
    console.log('\nWorkflow Metrics:');
    const metrics = {
        totalStages: stages.length,
        totalProcessingTime: stages.reduce((acc, stage) => {
            const task = taskManager.getTask(stage.id);
            return acc + (task?.processingTime || 0);
        }, 0),
        outputFiles: stages.map(stage => path.join(outputDir, `${stage.id}_${stage.id}.json`))
    };
    console.log(JSON.stringify(metrics, null, 2));
    // Cleanup
    console.log('\nShutting down agents...');
    await Promise.all([
        researchAgent.shutdown(),
        analysisAgent.shutdown(),
        planningAgent.shutdown(),
        writingAgent.shutdown(),
        reviewAgent.shutdown(),
        revisionAgent.shutdown(),
        finalReviewAgent.shutdown()
    ]);
    console.log('Workflow complete');
}
// Run the example
runComplexResearchWorkflow().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
});
//# sourceMappingURL=complex_research_workflow.js.map