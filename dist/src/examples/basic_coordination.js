"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MultiAgentCoordinator_1 = require("../core/multiagent/MultiAgentCoordinator");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
async function runBasicCoordinationExample() {
    console.log('Starting basic multiagent coordination example...');
    // Create a new coordinator
    const coordinator = new MultiAgentCoordinator_1.MultiAgentCoordinator('ExampleCoordinator');
    // Initialize coordinator
    await coordinator.initialize();
    console.log('Coordinator initialized');
    // Register example agents
    const researchAgent = {
        name: 'ResearchAgent',
        type: 'research',
        description: 'Specializes in gathering and analyzing information',
        capabilities: ['research', 'web-search', 'summarization'],
        status: 'available',
        metadata: {
            specialty: 'information gathering',
            reliability: 0.95
        },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
    };
    const plannerAgent = {
        name: 'PlannerAgent',
        type: 'planner',
        description: 'Specializes in task decomposition and planning',
        capabilities: ['planning', 'reasoning', 'problem-solving'],
        status: 'available',
        metadata: {
            specialty: 'task planning',
            reliability: 0.9
        },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
    };
    const writerAgent = {
        name: 'WriterAgent',
        type: 'writer',
        description: 'Specializes in content generation and refinement',
        capabilities: ['text-generation', 'creativity', 'summarization'],
        status: 'available',
        metadata: {
            specialty: 'content creation',
            reliability: 0.85
        },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
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
        name: 'Research emerging AI trends and create a summary report',
        description: `
      1. Research the latest trends in artificial intelligence
      2. Identify key innovations and developments
      3. Analyze potential impacts on various industries
      4. Create a structured report summarizing findings
    `,
        type: 'research_and_report',
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
    if (task?.results) {
        console.log('Task result:');
        console.log('-'.repeat(50));
        console.log(task.results);
        console.log('-'.repeat(50));
        if (task.processingTime) {
            console.log('Task metrics:');
            console.log(`- Duration: ${task.processingTime}ms`);
            console.log(`- Token usage: N/A`);
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
//# sourceMappingURL=basic_coordination.js.map