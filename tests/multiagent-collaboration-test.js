#!/usr/bin/env node

/**
 * Multiagent Collaboration Test
 * This script demonstrates how multiple agents can collaborate on a complex task
 * using real LLM integration
 */

// Load environment variables
require('dotenv').config();

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables or .env file');
  console.error('Please set your OpenAI API key in the .env file or as an environment variable');
  process.exit(1);
}

console.log('✅ Found OpenAI API key');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Imports
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process'); // For running mermaid-cli
const { OpenAI } = require('openai');

// Create output directory if it doesn't exist
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Instantiate OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Utility to count words
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Function to send a prompt to OpenAI
async function sendPrompt(prompt, options = {}) {
  console.log(`\n📤 Sending prompt (${countWords(prompt)} words)`);
  
  const model = options.model || OPENAI_MODEL;
  const maxTokens = options.maxTokens || 1000;
  const temperature = options.temperature || 0.7;
  
  console.log(`Model: ${model}, Max Tokens: ${maxTokens}, Temperature: ${temperature}`);
  
  // Prepare messages array
  const messages = [
    { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
    { role: 'user', content: prompt }
  ];
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    });
    
    // Adjust response and usage access based on the openai library structure
    const result = response.choices[0].message.content;
    const usage = response.usage;
    
    console.log(`\n📥 Received response (${countWords(result)} words)`);
    console.log('----------------------------------');
    console.log(result.substring(0, 200) + (result.length > 200 ? '...' : ''));
    console.log('----------------------------------');
    
    console.log('\n📊 Usage statistics:');
    console.log(`- Prompt tokens: ${usage?.prompt_tokens ?? 'N/A'}`);
    console.log(`- Completion tokens: ${usage?.completion_tokens ?? 'N/A'}`);
    console.log(`- Total tokens: ${usage?.total_tokens ?? 'N/A'}`);
    
    return {
      content: result,
      usage: usage,
      // Return the full request/response for detailed logging
      requestMessages: messages,
      fullResponse: response 
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error.message);
    throw error;
  }
}

// Utility function to run shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, stderr);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Agent class
class Agent {
  constructor(name, role, capabilities) {
    this.id = uuidv4();
    this.name = name;
    this.role = role;
    this.capabilities = capabilities || [];
    this.tasks = [];
    this.memory = {
      conversations: [],
      knowledge: {}
    };
  }
  
  async processTask(task, sharedState) {
    console.log(`\n🤖 ${this.name} (${this.role}) processing task: ${task.title}`);
    
    // Build system prompt based on agent role
    const systemPrompt = `You are ${this.name}, a specialized AI agent with the role of ${this.role}. 
Your capabilities include: ${this.capabilities.join(', ')}.
You should provide responses that are specifically focused on your role and capabilities.`;
    
    // Build user prompt based on task
    const userPrompt = `
TASK: ${task.title}
DESCRIPTION: ${task.description}

${task.context ? `CONTEXT: ${task.context}` : ''}
${task.input ? `INPUT: ${task.input}` : ''}

Please complete this task based on your role as ${this.role} with your specific capabilities.
Provide a detailed and well-structured response.
`;
    
    // Get response from LLM
    const response = await sendPrompt(userPrompt, {
      systemPrompt: systemPrompt,
      maxTokens: task.maxTokens || 1000,
      temperature: task.temperature || 0.7
    });
    
    // Update task status
    task.status = 'completed';
    task.result = response.content;
    task.completedAt = Date.now();
    task.usage = response.usage;
    
    // Store in memory
    this.memory.conversations.push({
      taskId: task.id,
      prompt: userPrompt,
      response: response.content,
      timestamp: Date.now()
    });
    
    // Return the full details needed for logging intermediates
    return {
      content: response.content,
      requestMessages: response.requestMessages, // Pass through from sendPrompt
      fullResponse: response.fullResponse,       // Pass through from sendPrompt
      usage: response.usage
    };
  }

  // Generate Mermaid flowchart definition for the workflow
  generateWorkflowDiagram(agentSequence) {
    let diagram = 'graph TD;\n';
    for (let i = 0; i < agentSequence.length; i++) { 
      const agentName = agentSequence[i].name.replace(/ /g, '_'); // Sanitize name for ID
      diagram += `  Agent${i}[${agentSequence[i].name}];\n`;
      if (i > 0) {
        const prevAgentName = agentSequence[i - 1].name.replace(/ /g, '_');
        diagram += `  Agent${i - 1} --> Agent${i};\n`;
      }
    }
    return diagram;
  }
}

// Task Manager
class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.taskHistory = [];
  }
  
  createTask(taskData) {
    const task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: 'pending',
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo || null,
      dependsOn: taskData.dependsOn || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      context: taskData.context || '',
      input: taskData.input || '',
      maxTokens: taskData.maxTokens || 1000,
      temperature: taskData.temperature || 0.7
    };
    
    this.tasks.set(task.id, task);
    this.taskHistory.push({
      action: 'created',
      taskId: task.id,
      timestamp: Date.now()
    });
    
    return task;
  }
  
  assignTask(taskId, agentId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    task.assignedTo = agentId;
    task.status = 'assigned';
    task.updatedAt = Date.now();
    
    this.taskHistory.push({
      action: 'assigned',
      taskId: task.id,
      agentId: agentId,
      timestamp: Date.now()
    });
    
    return task;
  }
  
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    Object.assign(task, updates, { updatedAt: Date.now() });
    
    this.taskHistory.push({
      action: 'updated',
      taskId: task.id,
      updates: updates,
      timestamp: Date.now()
    });
    
    return task;
  }
  
  getTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    return task;
  }
  
  getTasks(filter = {}) {
    let tasks = Array.from(this.tasks.values());
    
    if (filter.status) {
      tasks = tasks.filter(task => task.status === filter.status);
    }
    
    if (filter.assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === filter.assignedTo);
    }
    
    if (filter.priority) {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    
    return tasks;
  }
}

// Shared State Manager
class SharedStateManager {
  constructor() {
    this.state = {};
  }
  
  setState(key, value) {
    // Support dot notation for nested state
    const keys = key.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  getState(key) {
    // Support dot notation for nested state
    const keys = key.split('.');
    let current = this.state;
    
    for (const k of keys) {
      if (!current[k]) {
        return undefined;
      }
      current = current[k];
    }
    
    return current;
  }
  
  getAllState() {
    return this.state;
  }
}

// Coordinator
class Coordinator {
  constructor() {
    this.agents = new Map();
    this.taskManager = new TaskManager();
    this.sharedState = new SharedStateManager();
  }
  
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    console.log(`✅ Registered agent: ${agent.name} (${agent.role})`);
    return agent.id;
  }
  
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  
  async runWorkflow(topic, outputPath) {
    console.log(`\n🚀 Starting workflow for topic: ${topic}`);
    
    // Define the agent sequence for visualization and processing
    const agentSequence = [
      { name: 'Researcher', capability: 'research' },
      { name: 'Analyst', capability: 'analysis' },
      { name: 'Writer', capability: 'writing' },
      { name: 'Editor', capability: 'editing' }, // New: Editor
      { name: 'Summarizer', capability: 'summarization' },
      { name: 'Formatter', capability: 'formatting' } // New: Formatter
    ];

    let currentContext = {}; // Store context passed between agents
    let llmCalls = 0;

    // Set shared state
    this.sharedState.setState('workflow.topic', topic);
    this.sharedState.setState('workflow.startTime', Date.now());
    this.sharedState.setState('workflow.status', 'running');
    
    // --- Run Agent Sequence --- 
    const taskResults = {}; // Stores final text result per capability
    const taskObjects = {}; // Stores the task definition object per capability
    const stepDetails = []; // Stores details of each step (prompt, response)

    for (const agentInfo of agentSequence) {
      console.log(`\n--- Starting Step: ${agentInfo.name} ---`);

      // Find the agent
      const agent = Array.from(this.agents.values())
        .find(a => a.capabilities.includes(agentInfo.capability));

      if (!agent) {
        throw new Error(`No agent found with capability: ${agentInfo.capability}`);
      }

      // Define task based on agent role
      let taskData = {
        title: `Perform ${agentInfo.capability} on ${topic}`,
        description: `As the ${agent.role}, perform your ${agentInfo.capability} task regarding the topic: ${topic}. Use the provided context.`, 
        priority: 'high',
        context: JSON.stringify(currentContext, null, 2), // Pass context from previous steps
        maxTokens: 1000, // Default, adjust per agent if needed
        temperature: 0.4 // Default, adjust per agent if needed
      };

      // Customize task descriptions/needs based on role
      if (agentInfo.capability === 'research') {
        taskData.description = `Conduct comprehensive research on ${topic}, including key facts, recent developments, and important stakeholders.`;
        taskData.temperature = 0.3;
      } else if (agentInfo.capability === 'analysis') {
        taskData.description = `Analyze the research findings provided in the context and identify key insights, patterns, and implications regarding ${topic}.`;
      } else if (agentInfo.capability === 'writing') {
        taskData.title = `Write Report on ${topic}`;
        taskData.description = `Write a comprehensive report on ${topic} based on the research and analysis provided in the context.`;
        taskData.maxTokens = 1500;
        taskData.temperature = 0.5;
      } else if (agentInfo.capability === 'editing') {
        taskData.title = `Edit Report on ${topic}`;
        taskData.description = `Review and edit the report provided in the context for clarity, grammar, style, and coherence regarding ${topic}. Provide the edited report as the result.`;
        taskData.maxTokens = 1500; // Allow space for edits
        taskData.temperature = 0.3;
      } else if (agentInfo.capability === 'summarization') {
        taskData.title = `Summarize Report on ${topic}`;
        taskData.description = `Create a concise executive summary of the edited report provided in the context regarding ${topic}.`;
        taskData.maxTokens = 500;
      } else if (agentInfo.capability === 'formatting') {
        taskData.title = `Format Final Document on ${topic}`;
        taskData.description = `Combine the executive summary and the edited report from the context into a single, well-formatted Markdown document. Use appropriate headers and styling.`;
        taskData.maxTokens = 2000; // Allow space for combined content
      }

      const task = this.taskManager.createTask(taskData);
      taskObjects[agentInfo.capability] = task; // Store task object

      // Assign and process the task
      this.taskManager.assignTask(task.id, agent.id);
      const result = await agent.processTask(task, this.sharedState);
      llmCalls++; // Increment LLM call count
      
      // Store result for the next agent and final output
      taskResults[agentInfo.capability] = result.content;
      currentContext[agentInfo.capability] = result.content; // Add result to context for next step

      // Capture intermediate data (requires modification in processTask or here)
      // Assuming sendPrompt's full return is available here or within processTask
      // We need to get requestMessages and fullResponse back from the processTask call
      // For simplicity, let's assume processTask now returns an object:
      // { content: string, requestMessages: any, fullResponse: any, usage: any }
      // *** This requires modifying Agent.processTask return value ***
      stepDetails.push({ 
        step: llmCalls, 
        agentName: agentInfo.name,
        capability: agentInfo.capability,
        requestMessages: result.requestMessages, // Hypothetical return structure
        fullResponse: result.fullResponse       // Hypothetical return structure
      });

      // Store result in shared state (optional, could use taskResults directly)
      this.sharedState.setState(`workflow.results.${agentInfo.capability}`, result.content);
      console.log(`\n✅ ${agentInfo.name} task completed`);
    }

    // --- Workflow Completion --- 
    this.sharedState.setState('workflow.endTime', Date.now());
    this.sharedState.setState('workflow.status', 'completed');

    // Calculate total usage stats
    const totalUsage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };
    Object.values(taskObjects).forEach(task => {
      if (task.usage) {
        totalUsage.prompt_tokens += task.usage.prompt_tokens;
        totalUsage.completion_tokens += task.usage.completion_tokens;
        totalUsage.total_tokens += task.usage.total_tokens;
      }
    });
    
    this.sharedState.setState('workflow.usage', totalUsage);
    this.sharedState.setState('workflow.llmCalls', llmCalls); // Store call count
    
    // Write output to file
    if (outputPath) {
      // outputPath is now the base path for the run subfolder
      const runDirPath = outputPath; // Rename for clarity

      const output = {
        topic,
        results: taskResults, // Contains output from all agents
        stats: {
          startTime: this.sharedState.getState('workflow.startTime'),
          endTime: this.sharedState.getState('workflow.endTime'),
          duration: this.sharedState.getState('workflow.endTime') - this.sharedState.getState('workflow.startTime'),
          usage: totalUsage,
          llmCalls: llmCalls
        }
      };
      
      // Use the correct file path for the main report JSON
      const reportJsonPath = path.join(runDirPath, '_report.json');
      fs.writeFileSync(reportJsonPath, JSON.stringify(output, null, 2));
      console.log(`💾 Output saved to ${outputPath}`);
      
      // Save intermediate steps
      stepDetails.forEach(step => {
        const stepFileNameBase = path.join(runDirPath, `step_${step.step}_${step.agentName.replace(/ /g, '_')}`);
        fs.writeFileSync(`${stepFileNameBase}_prompt.json`, JSON.stringify(step.requestMessages, null, 2));
        fs.writeFileSync(`${stepFileNameBase}_response.json`, JSON.stringify(step.fullResponse, null, 2));
      });
      if (stepDetails.length > 0) {
         console.log(`💾 Intermediate prompts/responses saved to ${runDirPath}`);
      }
      
      // Also write a nicely formatted markdown report (using Formatter output)
      const markdownPath = path.join(runDirPath, '_report.md');
      // Use the output from the Formatter agent if available
      const finalDocument = taskResults.formatting || '# Final Document Not Generated'; 
      const markdownHeader = `# Final Report: ${topic}\n\n`;
      const markdownFooter = `\n\n---\n*Generated using a ${llmCalls}-step multi-agent workflow with OpenAI's ${OPENAI_MODEL} model*\n*Total tokens used: ${totalUsage.total_tokens} (${totalUsage.prompt_tokens} prompt + ${totalUsage.completion_tokens} completion)*`;
      fs.writeFileSync(markdownPath, markdownHeader + finalDocument + markdownFooter);
      console.log(`💾 Markdown report saved to ${markdownPath}`);

      // Generate and save workflow visualization
      try {
        // Need an agent instance to call generateWorkflowDiagram, grab the last one used
        const lastAgent = Array.from(this.agents.values()).pop(); 
        const diagramDefinition = lastAgent.generateWorkflowDiagram(agentSequence);
        const diagramPathBase = path.join(runDirPath, '_workflow'); // Base path inside run folder
        const diagramPathDef = diagramPathBase + '.mmd';
        const diagramPathImg = diagramPathBase + '.png';
        fs.writeFileSync(diagramPathDef, diagramDefinition);
        console.log(`📊 Generating workflow diagram...`);
        await runCommand(`mmdc -i "${diagramPathDef}" -o "${diagramPathImg}" -w 800`); 
        console.log(`💾 Workflow diagram saved to ${diagramPathImg}`);
        // Optionally remove the definition file
        // fs.unlinkSync(diagramPathDef);
      } catch (visError) {
        console.error('❌ Error generating visualization:', visError.message);
        console.error('Please ensure mermaid-cli (mmdc) is installed globally or locally (npm install -g @mermaid-js/mermaid-cli)');
      }
    }
    
    console.log(`\n🏁 Workflow completed in ${(this.sharedState.getState('workflow.endTime') - this.sharedState.getState('workflow.startTime')) / 1000} seconds`);
    console.log(`📊 Total LLM Calls: ${llmCalls}`);
    console.log(`📊 Total Tokens Used: ${totalUsage.total_tokens} (${totalUsage.prompt_tokens} prompt + ${totalUsage.completion_tokens} completion)`);
    
    return {
      results: taskResults,
      stats: {
        usage: totalUsage,
        llmCalls: llmCalls
      }
    };
  }
}

// Main function
async function run() {
  try {
    // Create unique run directory
    const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
    const runSubDir = `run-${timestamp}`;
    const runDirPath = path.join(OUTPUT_DIR, runSubDir);
    if (!fs.existsSync(runDirPath)) {
      fs.mkdirSync(runDirPath, { recursive: true });
      console.log(`📂 Created output directory: ${runDirPath}`);
    }

    // Create coordinator
    const coordinator = new Coordinator();
    
    // Create agents
    const researchAgent = new Agent(
      'Researcher',
      'Research Specialist',
      ['research', 'information-gathering', 'fact-checking']
    );
    
    const analysisAgent = new Agent(
      'Analyst',
      'Data Analyst',
      ['analysis', 'critical-thinking', 'pattern-recognition']
    );
    
    const writingAgent = new Agent(
      'Writer',
      'Content Writer',
      ['writing', 'content-creation', 'report-generation']
    );
    
    const editorAgent = new Agent(
      'Editor',
      'Content Editor',
      ['editing', 'proofreading', 'style-improvement']
    );
    
    const summaryAgent = new Agent(
      'Summarizer',
      'Content Summarization Expert',
      ['summarization', 'condensing', 'key-point-extraction']
    );
    
    const formatAgent = new Agent(
      'Formatter',
      'Document Formatting Specialist',
      ['formatting', 'markdown', 'presentation']
    );
    
    // Register agents
    coordinator.registerAgent(researchAgent);
    coordinator.registerAgent(analysisAgent);
    coordinator.registerAgent(writingAgent);
    coordinator.registerAgent(editorAgent);
    coordinator.registerAgent(summaryAgent);
    coordinator.registerAgent(formatAgent);
    
    // Get topic from command line or use default
    const topic = process.argv[2] || 'The benefits and risks of artificial general intelligence';
    console.log(`\n📝 Topic: ${topic}`);
    
    // Run workflow
    await coordinator.runWorkflow(topic, runDirPath);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
run(); 