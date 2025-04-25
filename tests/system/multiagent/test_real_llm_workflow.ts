import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

// Import core components
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { MultiAgentCoordinator } from '../../../src/core/multiagent/MultiAgentCoordinator';
import { AgentRegistry } from '../../../src/core/multiagent/AgentRegistry';
import { TaskManager } from '../../../src/core/multiagent/TaskManager';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';
import { 
  Agent, 
  AgentCapability, 
  Task,
  AgentConfig 
} from '../../../src/core/multiagent/types';

// Import test utilities
import { 
  createTestFixture, 
  createRealLLMClient 
} from '../../utils/test-helpers';

// Constants
const TEST_TIMEOUT = 120000; // 2 minutes
const mkdtemp = promisify(fs.mkdtemp);
const rmdir = promisify(fs.rm);
const writeFile = promisify(fs.writeFile);

// Utility to count words
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Utility to log LLM interactions
function logLLMInteraction(prompt: string, response: string, usageStats?: any): void {
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

describe('Real LLM Multiagent Workflow', function() {
  this.timeout(TEST_TIMEOUT);
  
  // Test directories
  let tempDir: string;
  let promptsDir: string;
  let outputsDir: string;
  
  // System components
  let llmClient: OpenAIClient;
  let taskManager: TaskManager;
  let sharedStateManager: SharedStateManager;
  let agentRegistry: AgentRegistry;
  let coordinator: MultiAgentCoordinator;
  
  // Agent IDs
  let researchAgentId: string;
  let analysisAgentId: string;
  let writingAgentId: string;
  
  before(async function() {
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
    llmClient = createRealLLMClient();
    
    // Initialize system components
    taskManager = new TaskManager();
    sharedStateManager = new SharedStateManager();
    agentRegistry = new AgentRegistry(taskManager);
    
    // Create coordinator
    coordinator = new MultiAgentCoordinator({
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
  
  after(async function() {
    // Clean up temp directories
    if (tempDir && fs.existsSync(tempDir)) {
      await rmdir(tempDir, { recursive: true });
      console.log(`Cleaned up test directories`);
    }
  });
  
  it('should complete a multi-step task with agent collaboration', async function() {
    // Define a multi-step task
    const topic = 'The impact of artificial intelligence on healthcare';
    
    // Create shared state for the task
    const sessionId = uuidv4();
    
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
    expect(researchTask.status).to.equal('completed');
    
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
    expect(analysisTask.status).to.equal('completed');
    
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
    expect(writingTask.status).to.equal('completed');
    
    // Check that the output file was created
    const outputPath = path.join(outputsDir, 'final-report.md');
    expect(fs.existsSync(outputPath)).to.be.true;
    
    // Verify final report content
    const reportContent = fs.readFileSync(outputPath, 'utf8');
    expect(reportContent).to.include(topic);
    expect(countWords(reportContent)).to.be.greaterThan(300);
    
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
async function waitForTask(taskManager: TaskManager, taskId: string, timeout = 60000) {
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
function createResearchAgent(llmClient: OpenAIClient): Agent {
  const agent: Agent = {
    name: 'Research Agent',
    description: 'Specializes in gathering information and facts on various topics',
    capabilities: ['research', 'information-gathering', 'fact-checking'],
    
    async processTask(task: Task): Promise<any> {
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

function createAnalysisAgent(llmClient: OpenAIClient): Agent {
  const agent: Agent = {
    name: 'Analysis Agent',
    description: 'Specializes in analyzing information and extracting insights',
    capabilities: ['analysis', 'insight-generation', 'critical-thinking'],
    
    async processTask(task: Task): Promise<any> {
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

function createWritingAgent(llmClient: OpenAIClient): Agent {
  const agent: Agent = {
    name: 'Writing Agent',
    description: 'Specializes in creating well-written reports and documents',
    capabilities: ['writing', 'report-generation', 'content-creation'],
    
    async processTask(task: Task): Promise<any> {
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
      const tasks = await Promise.all(
        dependencyIds.map(id => this.taskManager?.getTask(id))
      );
      
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
      const outputPath = task.metadata?.outputPath as string;
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