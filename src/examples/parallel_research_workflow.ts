import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { ResearchAgent } from '../agents/ResearchAgent';
import { AnalysisAgent } from '../agents/AnalysisAgent';
import { PlanningAgent } from '../agents/PlanningAgent';
import { WritingAgent } from '../agents/WritingAgent';
import { ReviewAgent } from '../agents/ReviewAgent';
import { FinalReviewAgent } from '../agents/FinalReviewAgent';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { TaskManager } from '../core/multiagent/TaskManager';
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { PromptManager } from '../core/multiagent/PromptManager';
import { ResearchAgentInterface, AnalysisAgentInterface, PlanningAgentInterface, WritingAgentInterface, ReviewAgentInterface, FinalReviewAgentInterface, WorkflowStage, ResearchPath } from '../core/multiagent/workflow_types';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

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
  const sharedState = SharedStateManager.getInstance();
  const taskManager = new TaskManager();
  const agentRegistry = new AgentRegistry();
  const openAIClient = new OpenAIClient();
  const promptManager = new PromptManager('src/prompts');
  
  // Create the coordinator
  const coordinator = new MultiAgentCoordinator(
    "Parallel Research Workflow Coordinator", 
    {
      sharedStateManager: sharedState,
      taskManager: taskManager,
      agentRegistry: agentRegistry,
      openAIClient: openAIClient,
      promptManager: promptManager
    }
  );
  
  // Initialize the coordinator
  await coordinator.initialize();
  console.log('Coordinator initialized');
  
  // Define research paths
  const researchPaths: ResearchPath[] = [
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
  const researchAgents: ResearchAgentInterface[] = researchPaths.map(path => 
    new ResearchAgent(path.name, {
      name: path.name,
      description: `Specializes in ${path.name.toLowerCase()}`,
      capabilities: ['research', 'extraction', 'summarization', 'fact-checking'],
      preferredModel: 'o3-mini'
    })
  );
  
  // Create analysis agents
  const analysisAgents: AnalysisAgentInterface[] = researchPaths.map(path =>
    new AnalysisAgent(path.name, {
      name: path.name,
      description: `Specializes in analyzing ${path.name.toLowerCase()}`,
      capabilities: ['analysis', 'reporting'],
      preferredModel: 'o3-mini'
    })
  );
  
  // Create planning agent
  const planningAgent: PlanningAgentInterface = new PlanningAgent('Content Planner', {
    name: 'Content Planner',
    description: 'Specializes in creating content plans',
    capabilities: ['planning', 'organization'],
    preferredModel: 'o3-mini'
  });
  
  // Create writing agent
  const writingAgent: WritingAgentInterface = new WritingAgent('Content Writer', {
    name: 'Content Writer',
    description: 'Specializes in creating content',
    capabilities: ['writing', 'editing'],
    preferredModel: 'o3-mini'
  });
  
  // Create review agent
  const reviewAgent: ReviewAgentInterface = new ReviewAgent('Content Reviewer', {
    name: 'Content Reviewer',
    description: 'Specializes in reviewing content',
    capabilities: ['review', 'validation'],
    preferredModel: 'o3-mini'
  });
  
  // Create final review agent
  const finalReviewAgent: FinalReviewAgentInterface = new FinalReviewAgent('Final Reviewer', {
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
      status: 'available' as const,
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
      status: 'available' as const,
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
      status: 'available' as const,
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
      status: 'available' as const,
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
      status: 'available' as const,
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
      status: 'available' as const,
      metadata: {},
      preferredModel: 'o3-mini',
      createdAt: Date.now(),
      lastActive: Date.now()
    })
  ]);
  
  console.log('All agents registered');
  
  // Define workflow stages
  const stages: WorkflowStage[] = [
    // Research stages
    ...researchPaths.map(path => ({
      id: `${path.id}_research`,
      type: 'research',
      title: path.name,
      description: `Research ${path.name.toLowerCase()}`,
      agent: researchAgents[researchPaths.indexOf(path)] as any,
      next: [`${path.id}_analysis`]
    })),
    
    // Analysis stages
    ...researchPaths.map(path => ({
      id: `${path.id}_analysis`,
      type: 'analysis',
      title: `${path.name} Analysis`,
      description: `Analyze ${path.name.toLowerCase()}`,
      agent: analysisAgents[researchPaths.indexOf(path)] as any,
      dependsOn: [`${path.id}_research`],
      next: ['content_planning']
    })),
    
    // Planning stage
    {
      id: 'content_planning',
      type: 'planning',
      title: 'Content Planning',
      description: 'Create content plan based on research and analysis',
      agent: planningAgent as any,
      dependsOn: researchPaths.map(path => `${path.id}_analysis`),
      next: ['content_writing']
    },
    
    // Writing stage
    {
      id: 'content_writing',
      type: 'writing',
      title: 'Content Writing',
      description: 'Generate content based on the plan',
      agent: writingAgent as any,
      dependsOn: ['content_planning'],
      next: ['content_review']
    },
    
    // Review stage
    {
      id: 'content_review',
      type: 'review',
      title: 'Content Review',
      description: 'Review the generated content',
      agent: reviewAgent as any,
      dependsOn: ['content_writing'],
      next: ['final_review']
    },
    
    // Final review stage
    {
      id: 'final_review',
      type: 'final_review',
      title: 'Final Review',
      description: 'Perform final review of the content',
      agent: finalReviewAgent as any,
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
    const taskId = uuidv4();
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
          results = await (stage.agent as unknown as ResearchAgentInterface).researchTopic(topic, {
            aspects: researchPaths.find(p => stage.id.startsWith(p.id))?.aspects || [],
            depth: 'comprehensive'
          });
          break;
          
        case 'analysis':
          const researchData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
          results = await (stage.agent as unknown as AnalysisAgentInterface).analyzeData(researchData);
          break;
          
        case 'planning':
          const analysisResults = await Promise.all(
            (stage.dependsOn || []).map(async (depId) => {
              const task = await taskManager.getTask(depId);
              return task?.results;
            })
          );
          results = await (stage.agent as unknown as PlanningAgentInterface).createPlan(topic, analysisResults);
          break;
          
        case 'writing':
          const planData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
          results = await (stage.agent as unknown as WritingAgentInterface).generateContent(topic, [
            'professional tone',
            'comprehensive coverage',
            'clear structure',
            'engaging narrative'
          ]);
          break;
          
        case 'review':
          const contentData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
          results = await (stage.agent as unknown as ReviewAgentInterface).reviewContent(contentData, [
            'clarity',
            'accuracy',
            'completeness',
            'organization'
          ]);
          break;
          
        case 'final_review':
          const reviewData = await sharedState.getState(`tasks.${stage.dependsOn?.[0]}.results`);
          results = await (stage.agent as unknown as FinalReviewAgentInterface).performFinalCheck(reviewData);
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
      
    } catch (error: any) {
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
function generateMermaidDiagram(stages: WorkflowStage[], researchPaths: ResearchPath[]): string {
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