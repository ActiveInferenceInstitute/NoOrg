import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { Agent } from '../agents/types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function runBasicCoordinationExample() {
  console.log('Starting basic multiagent coordination example...');
  
  // Create a new coordinator
  const coordinator = new MultiAgentCoordinator('ExampleCoordinator');
  
  // Initialize coordinator
  await coordinator.initialize();
  console.log('Coordinator initialized');
  
  // Register example agents
  const researchAgent: Omit<Agent, 'id'> = {
    name: 'ResearchAgent',
    type: 'research',
    description: 'Specializes in gathering and analyzing information',
    capabilities: ['research', 'web-search', 'summarization'],
    status: 'available',
    metadata: {
      specialty: 'information gathering',
      reliability: 0.95
    },
    preferredModel: 'o3-mini'
  };
  
  const plannerAgent: Omit<Agent, 'id'> = {
    name: 'PlannerAgent',
    type: 'planner',
    description: 'Specializes in task decomposition and planning',
    capabilities: ['planning', 'reasoning', 'problem-solving'],
    status: 'available',
    metadata: {
      specialty: 'task planning',
      reliability: 0.9
    },
    preferredModel: 'o3-mini'
  };
  
  const writerAgent: Omit<Agent, 'id'> = {
    name: 'WriterAgent',
    type: 'writer',
    description: 'Specializes in content generation and refinement',
    capabilities: ['text-generation', 'creativity', 'summarization'],
    status: 'available',
    metadata: {
      specialty: 'content creation',
      reliability: 0.85
    },
    preferredModel: 'o3-mini'
  };
  
  // Register agents with the coordinator
  const researchAgentId = await coordinator.registerAgent(researchAgent);
  const plannerAgentId = await coordinator.registerAgent(plannerAgent);
  const writerAgentId = await coordinator.registerAgent(writerAgent);
  
  console.log('Registered agents:');
  console.log(`- Research Agent: ${researchAgentId}`);
  console.log(`- Planner Agent: ${plannerAgentId}`);
  console.log(`- Writer Agent: ${writerAgentId}`);
  
  // Create a complex task that requires multiple agents
  const taskId = await coordinator.createTask({
    type: 'research_and_report',
    title: 'Research emerging AI trends and create a summary report',
    description: `
      1. Research the latest trends in artificial intelligence
      2. Identify key innovations and developments
      3. Analyze potential impacts on various industries
      4. Create a structured report summarizing findings
    `,
    priority: 'high',
    metadata: {
      requiredCapabilities: ['research', 'summarization', 'text-generation'],
      domain: 'artificial intelligence',
      expectedLength: 'medium'
    }
  });
  
  console.log(`Created task: ${taskId}`);
  
  // Start the coordinator to begin processing tasks
  await coordinator.start();
  console.log('Coordinator started, processing tasks...');
  
  // In a real application, we would wait for tasks to complete
  // For this example, we'll simulate waiting with a timeout
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Check task status
  const task = await coordinator.getTask(taskId);
  console.log(`Task status: ${task?.status}`);
  
  if (task?.result) {
    console.log('Task result:');
    console.log('-'.repeat(50));
    console.log(task.result.data);
    console.log('-'.repeat(50));
    
    if (task.result.metrics) {
      console.log('Task metrics:');
      console.log(`- Duration: ${task.result.metrics.duration}ms`);
      console.log(`- Token usage: ${task.result.metrics.tokenUsage?.total || 'N/A'}`);
    }
  }
  
  // Stop the coordinator
  await coordinator.stop();
  console.log('Coordinator stopped');
}

// Run the example
runBasicCoordinationExample().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
}); 