import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../src/core/multiagent/LLMClientInterface';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';

// Load environment variables
dotenv.config();

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `openai-agent-${timestamp}`;
const outputDir = path.join('output', runId);
fs.ensureDirSync(outputDir);

// Define a simple agent interface
interface SimpleAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  capabilities: string[];
}

// Create a simple task interface
interface SimpleTask {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

/**
 * A simple agent executor that processes tasks using OpenAI
 */
class SimpleAgentExecutor {
  private client: OpenAIClient;
  
  constructor() {
    // Initialize the OpenAI client (reads API key from .env)
    this.client = new OpenAIClient();
  }
  
  /**
   * Execute a task with a specific agent
   */
  async executeTask(agent: SimpleAgent, task: SimpleTask): Promise<{
    result: string;
    reasoning: string;
    tokensUsed: number;
    cost: number;
  }> {
    console.log(`Agent "${agent.name}" (${agent.id}) is processing task "${task.title}" (${task.id})`);
    
    // Create the prompt with agent context and task details
    const messages: LLMMessage[] = [
      {
        role: 'system', 
        content: `${agent.systemPrompt}\n\nYou are acting as ${agent.name}, a ${agent.role}.`
      },
      {
        role: 'user',
        content: `
Task: ${task.title}

Description: ${task.description}

Requirements:
${task.requirements.map(req => `- ${req}`).join('\n')}

Please provide your response in the following JSON format:
{
  "reasoning": "Your step-by-step thinking process",
  "result": "Your final answer or solution to the task"
}
        `
      }
    ];
    
    // Record start time for performance tracking
    const startTime = Date.now();
    
    try {
      // Send the prompt to OpenAI using the public method
      const response = await this.client.createChatCompletion(
        messages, 
        { 
          // Pass options if needed, like temperature or max_tokens from the example
          temperature: 0.5, 
          max_tokens: 2000 
        }
      );
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Extract the result from the correct response structure
      const content = response.choices[0]?.message?.content;
      
      // Check if content exists
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      let parsedResponse: { reasoning: string; result: string };
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        // Handle case where response isn't valid JSON
        console.warn('Response was not valid JSON, using raw content');
        parsedResponse = {
          reasoning: 'Could not extract structured reasoning.',
          result: content
        };
      }
      
      // Calculate cost using usage data from the response
      const usage = response.usage;
      if (!usage) {
          throw new Error('Usage data not available in response');
      }
      const promptTokens = usage.prompt_tokens;
      const completionTokens = usage.completion_tokens;
      const cost = this.client.calculateCost(
        this.client.getDefaultModel(), // Use the actual model used
        promptTokens,
        completionTokens
      );
      
      console.log(`Task completed in ${processingTime}ms`);
      console.log(`Tokens used: ${usage.total_tokens} (Cost: $${cost.toFixed(5)})`);
      
      return {
        result: parsedResponse.result,
        reasoning: parsedResponse.reasoning,
        tokensUsed: usage.total_tokens,
        cost
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing task: ${errorMessage}`);
      throw new Error(`Task execution failed: ${errorMessage}`);
    }
  }
}

/**
 * Main function to run the example
 */
async function runExample() {
  // Create an agent
  const researchAgent: SimpleAgent = {
    id: 'agent-1',
    name: 'ResearchBot',
    role: 'research specialist',
    systemPrompt: 'You are an AI research assistant that provides accurate, factual information. Always think step by step and cite your reasoning.',
    capabilities: ['research', 'summarization', 'analysis']
  };
  
  // Create a task
  const researchTask: SimpleTask = {
    id: 'task-1',
    title: 'Quantum Computing Research',
    description: 'Research and explain the current state of quantum computing and its potential applications.',
    requirements: [
      'Explain the basic principles of quantum computing',
      'List 3 potential applications',
      'Describe current limitations',
      'Predict future developments'
    ],
    status: 'pending'
  };
  
  // Create the executor
  const executor = new SimpleAgentExecutor();
  
  console.log('Starting task execution...');
  
  try {
    // Update task status
    researchTask.status = 'in-progress';
    
    // Execute the task
    const result = await executor.executeTask(researchAgent, researchTask);
    
    // Update task status
    researchTask.status = 'completed';
    
    // Display the results
    console.log('\n=== TASK RESULT ===\n');
    console.log(result.result);
    
    console.log('\n=== AGENT REASONING ===\n');
    console.log(result.reasoning);
    
    console.log('\n=== EXECUTION STATS ===\n');
    console.log(`Tokens used: ${result.tokensUsed}`);
    console.log(`Execution cost: $${result.cost.toFixed(5)}`);
    
    // Save results to output directory
    fs.writeJsonSync(path.join(outputDir, 'agent-results.json'), {
      agent: researchAgent,
      task: researchTask,
      result: result.result,
      reasoning: result.reasoning,
      stats: {
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        completedAt: new Date().toISOString()
      }
    }, { spaces: 2 });
    
    // Create a simple markdown report
    const markdownReport = `# OpenAI Agent Example Report

## Agent: ${researchAgent.name}
- **Role**: ${researchAgent.role}
- **Capabilities**: ${researchAgent.capabilities.join(', ')}

## Task: ${researchTask.title}
- **Description**: ${researchTask.description}
- **Status**: ${researchTask.status}

## Results
\`\`\`json
${JSON.stringify(result.result, null, 2)}
\`\`\`

## Agent Reasoning
${result.reasoning}

## Execution Statistics
- **Tokens Used**: ${result.tokensUsed}
- **Execution Cost**: $${result.cost.toFixed(5)}
- **Completed**: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(path.join(outputDir, 'agent-report.md'), markdownReport);
    
    console.log(`\nResults saved to: ${outputDir}`);
    
  } catch (error) {
    // Update task status
    researchTask.status = 'failed';
    console.error('Task execution failed:', error instanceof Error ? error.message : String(error));
  }
}

// Run the example
if (require.main === module) {
  runExample().catch(error => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

export { SimpleAgent, SimpleTask, SimpleAgentExecutor }; 