import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';

// System components
import { MultiAgentCoordinator } from '../../../src/core/multiagent/MultiAgentCoordinator';
import { AgentRegistry } from '../../../src/core/multiagent/AgentRegistry';
import { TaskManager } from '../../../src/core/multiagent/TaskManager';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';
import { PromptManager } from '../../../src/core/multiagent/PromptManager';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';

// Agent implementations
import { ResearchAgent } from '../../../src/agents/ResearchAgent';
import { CreativeWritingAgent } from '../../../src/agents/CreativeWritingAgent';

describe('MultiAgent System End-to-End Tests', function() {
  // These tests might take longer to run
  this.timeout(10000);
  
  // System components
  let coordinator: MultiAgentCoordinator;
  let agentRegistry: AgentRegistry;
  let taskManager: TaskManager;
  let sharedState: SharedStateManager;
  let promptManager: PromptManager;
  let openAIClient: OpenAIClient;
  
  // Agent instances
  let researchAgent: ResearchAgent;
  let writingAgent: CreativeWritingAgent;
  
  // Test data
  const testTopic = 'Quantum computing applications';
  const testOutputDir = path.join(__dirname, 'test_output');
  let researchTaskId: string;
  let writingTaskId: string;
  
  before(async function() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
    
    // Initialize system components
    agentRegistry = new AgentRegistry();
    taskManager = new TaskManager();
    sharedState = new SharedStateManager();
    
    // Create prompt directory and templates
    const promptsDir = path.join(testOutputDir, 'prompts');
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }
    
    // Create system role prompt template
    fs.writeFileSync(
      path.join(promptsDir, 'system_role.prompt'),
      'You are {{agent_name}}, an AI assistant with capabilities: {{capabilities}}. Your goal is to {{goal}}.'
    );
    
    // Create agent coordination prompt template
    fs.writeFileSync(
      path.join(promptsDir, 'agent_coordination.prompt'),
      'Task: {{task_description}}\nAvailable agents: {{agents}}\nShared state: {{shared_state}}'
    );
    
    promptManager = new PromptManager(promptsDir);
    
    // Stub OpenAI client to prevent actual API calls
    openAIClient = new OpenAIClient({
      apiKey: 'test-api-key',
      defaultModel: 'o3-mini'
    });
    
    // Stub sendPrompt method to return test responses
    const sendPromptStub = sinon.stub(openAIClient, 'sendPrompt');
    
    // Configure different responses based on prompts
    sendPromptStub.callsFake((prompt) => {
      const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
      
      let content = 'Default test response';
      
      if (promptStr.includes('quantum computing')) {
        content = JSON.stringify({
          findings: [
            'Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously',
            'Major applications include cryptography, optimization problems, and simulating quantum systems',
            'Companies like IBM, Google, and Microsoft are investing heavily in quantum computing research'
          ],
          sources: [
            'https://example.com/quantum-computing-basics',
            'https://example.com/quantum-applications'
          ]
        });
      } else if (promptStr.includes('Create a blog post')) {
        content = `# The Future of Quantum Computing
        
## Introduction
Quantum computing represents a paradigm shift in computational capabilities, leveraging the principles of quantum mechanics to process information in ways classical computers cannot.

## Key Applications
Quantum computers excel at solving optimization problems, breaking cryptographic systems, and simulating molecular structures for drug development.

## Current Challenges
Despite recent breakthroughs, quantum computing faces significant challenges including qubit stability, error correction, and scaling systems to practical sizes.

## Conclusion
While still in its early stages, quantum computing promises to revolutionize fields from medicine to finance in the coming decades.`;
      }
      
      // Return a standardized response
      return Promise.resolve({
        id: 'test-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'o3-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250
        }
      });
    });
    
    // Create MultiAgentCoordinator
    coordinator = new MultiAgentCoordinator('End-to-End Test Coordinator', {
      agentRegistry,
      taskManager,
      sharedStateManager: sharedState,
      promptManager,
      openAIClient
    });
    
    // Initialize coordinator
    await coordinator.initialize();
    
    // Create agent instances
    researchAgent = new ResearchAgent('Research Assistant', {
      sharedState,
      openAIClient,
      description: 'Specialized in gathering and analyzing information from various sources'
    });
    
    writingAgent = new CreativeWritingAgent('Content Creator', {
      sharedState,
      openAIClient,
      description: 'Expert in creating engaging and informative content'
    });
    
    // Initialize agents
    await researchAgent.initialize();
    await writingAgent.initialize();
    
    // Register agents with coordinator
    await coordinator.registerAgent(researchAgent.getAgentInfo());
    await coordinator.registerAgent(writingAgent.getAgentInfo());
    
    console.log('System initialization complete');
  });
  
  after(function() {
    // Clean up test output
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    
    // Restore stubs
    sinon.restore();
  });
  
  describe('End-to-End Research and Content Creation Workflow', function() {
    it('should successfully complete a full workflow from research to content creation', async function() {
      // Create log files for tests
      const logFilePath = path.join(testOutputDir, 'workflow_test.log');
      const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });
      
      // Log test start
      logStream.write(`Test started at ${new Date().toISOString()}\n`);
      logStream.write(`Test topic: ${testTopic}\n\n`);
      
      // Step 1: Create research task
      logStream.write('Step 1: Creating research task\n');
      researchTaskId = await taskManager.createTask({
        type: 'research',
        description: `Research information about ${testTopic}`,
        priority: 'high',
        metadata: {
          topic: testTopic,
          depth: 'comprehensive'
        }
      });
      
      // Step 2: Create content task (dependent on research)
      logStream.write('Step 2: Creating content creation task\n');
      writingTaskId = await taskManager.createTask({
        type: 'content_creation',
        description: `Create a blog post about ${testTopic} based on research findings`,
        priority: 'high',
        dependsOn: [researchTaskId],
        metadata: {
          format: 'blog-post',
          tone: 'professional',
          length: 'medium'
        }
      });
      
      // Verify tasks were created
      const researchTask = await taskManager.getTask(researchTaskId);
      const writingTask = await taskManager.getTask(writingTaskId);
      
      expect(researchTask).to.not.be.undefined;
      expect(writingTask).to.not.be.undefined;
      expect(researchTask?.status).to.equal('pending');
      expect(writingTask?.status).to.equal('pending');
      
      logStream.write(`Research task created with ID: ${researchTaskId}\n`);
      logStream.write(`Content task created with ID: ${writingTaskId}\n\n`);
      
      // Step 3: Assign research task to research agent
      logStream.write('Step 3: Assigning research task\n');
      const researchAgentId = researchAgent.getAgentInfo().id;
      await taskManager.assignTask(researchTaskId, researchAgentId);
      
      // Step 4: Execute research task
      logStream.write('Step 4: Executing research task\n');
      await taskManager.startTask(researchTaskId);
      
      // Simulate research agent performing research
      logStream.write('Simulating research process...\n');
      const researchResults = await researchAgent.researchTopic(testTopic, {
        depth: 'comprehensive'
      });
      
      // Store research results in shared state
      await sharedState.setState(`tasks.${researchTaskId}.results`, researchResults);
      
      // Complete research task
      await taskManager.completeTask(researchTaskId, {
        outcome: 'Research completed successfully',
        data: researchResults
      });
      
      logStream.write(`Research task completed with ${(researchResults as any).findings?.length || 0} findings\n\n`);
      
      // Verify research task is completed
      const updatedResearchTask = await taskManager.getTask(researchTaskId);
      expect(updatedResearchTask?.status).to.equal('completed');
      
      // Step 5: Verify content task is ready (dependencies satisfied)
      logStream.write('Step 5: Checking if content task is ready\n');
      const dependenciesSatisfied = await taskManager.areDependenciesSatisfied(writingTaskId);
      expect(dependenciesSatisfied).to.be.true;
      
      // Step 6: Assign content task to writing agent
      logStream.write('Step 6: Assigning content task\n');
      const writingAgentId = writingAgent.getAgentInfo().id;
      await taskManager.assignTask(writingTaskId, writingAgentId);
      
      // Step 7: Execute content creation task
      logStream.write('Step 7: Executing content creation task\n');
      await taskManager.startTask(writingTaskId);
      
      // Simulate writing agent creating content
      logStream.write('Simulating content creation process...\n');
      const content = await writingAgent.generateContent(testTopic, {
        format: 'blog-post',
        tone: 'professional',
        length: 'medium'
      });
      
      // Store content in shared state
      await sharedState.setState(`tasks.${writingTaskId}.results`, content);
      
      // Complete content task
      await taskManager.completeTask(writingTaskId, {
        outcome: 'Content created successfully',
        data: content
      });
      
      logStream.write(`Content task completed with ${content.wordCount} words\n\n`);
      
      // Verify content task is completed
      const updatedContentTask = await taskManager.getTask(writingTaskId);
      expect(updatedContentTask?.status).to.equal('completed');
      
      // Step 8: Save generated content to output file
      const contentFilePath = path.join(testOutputDir, 'generated_content.md');
      fs.writeFileSync(contentFilePath, content.content);
      
      logStream.write(`Content saved to file: ${contentFilePath}\n`);
      
      // Step 9: Create final report
      logStream.write('Step 9: Creating test report\n');
      const reportFilePath = path.join(testOutputDir, 'workflow_report.json');
      
      const report = {
        testTopic,
        researchTaskId,
        writingTaskId,
        timeCompleted: new Date().toISOString(),
        metrics: {
          researchFindings: (researchResults as any).findings?.length || 0,
          contentWordCount: content.wordCount,
          totalTokensUsed: 500, // From our stubbed responses
          processingTime: {
            research: researchResults.processingTime,
            writing: content.processingTime
          }
        },
        status: 'success'
      };
      
      fs.writeFileSync(reportFilePath, JSON.stringify(report, null, 2));
      logStream.write(`Report saved to file: ${reportFilePath}\n`);
      
      // Finish logging
      logStream.write(`\nTest completed successfully at ${new Date().toISOString()}\n`);
      logStream.end();
      
      // Final verification that output files exist
      expect(fs.existsSync(contentFilePath)).to.be.true;
      expect(fs.existsSync(reportFilePath)).to.be.true;
      expect(fs.existsSync(logFilePath)).to.be.true;
    });
  });
}); 