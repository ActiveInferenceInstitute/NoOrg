#!/usr/bin/env node

/**
 * PhD Qualifier Preparation Test
 * This script demonstrates a more complex multi-agent collaboration with splitting and merging,
 * simulating preparation for a PhD qualifying exam on a given topic using real LLM integration.
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
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'; // Use a more capable model if available

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
  if (!text || typeof text !== 'string') return 0;
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Function to send a prompt to OpenAI
async function sendPrompt(prompt, options = {}) {
  console.log(`\n📤 Sending prompt (${countWords(prompt)} words)`);

  const model = options.model || OPENAI_MODEL;
  const maxTokens = options.maxTokens || 1500; // Default increased for complex tasks
  const temperature = options.temperature || 0.5; // Slightly lower temp for more factual tasks

  console.log(`Model: ${model}, Max Tokens: ${maxTokens}, Temperature: ${temperature}`);

  // Prepare messages array
  const messages = [
    { role: 'system', content: options.systemPrompt || 'You are a highly knowledgeable and helpful AI assistant.' },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    });

    const result = response.choices[0]?.message?.content || '[No Content Received]';
    const usage = response.usage;

    console.log(`\n📥 Received response (${countWords(result)} words)`);
    console.log('----------------------------------');
    console.log(result.substring(0, 300) + (result.length > 300 ? '...' : ''));
    console.log('----------------------------------');

    console.log('\n📊 Usage statistics:');
    console.log(`- Prompt tokens: ${usage?.prompt_tokens ?? 'N/A'}`);
    console.log(`- Completion tokens: ${usage?.completion_tokens ?? 'N/A'}`);
    console.log(`- Total tokens: ${usage?.total_tokens ?? 'N/A'}`);

    return {
      content: result,
      usage: usage,
      requestMessages: messages,
      fullResponse: response
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    // Attempt to return error details within the expected structure
    return {
        content: `[API Error: ${error.message}]`,
        usage: null,
        requestMessages: messages,
        fullResponse: { error: error.message, status: error.status } // Include error status if available
    };
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
    this.tasks = []; // Tracks tasks assigned to this agent
    this.memory = {
      conversations: [], // Stores { taskId, prompt, response, timestamp }
      knowledge: {} // Can store structured knowledge
    };
  }

  // Process a single task using LLM
  async processTask(task, sharedState) {
    console.log(`\n🤖 ${this.name} (${this.role}) processing task: ${task.title}`);

    // Build system prompt based on agent role
    const systemPrompt = `You are ${this.name}, a specialized AI agent expert in ${this.role}.
Your specific capabilities for this task are: ${this.capabilities.join(', ')}.
Focus your response entirely on fulfilling the task based on your role and capabilities, using the provided context and input.
Provide detailed, accurate, and well-structured information. Assume a PhD-level academic context.`;

    // Build user prompt based on task details
    const userPrompt = `
ACADEMIC CONTEXT: Preparing for a PhD Qualifying Exam
OVERALL TOPIC: ${sharedState.getState('workflow.topic') || 'Not Specified'}

TASK ID: ${task.id}
TASK TITLE: ${task.title}
TASK DESCRIPTION: ${task.description}

${task.context ? `AVAILABLE CONTEXT FROM PREVIOUS STEPS:\n---\n${task.context}\n---\n` : 'CONTEXT: No context provided for this specific task.'}
${task.input ? `SPECIFIC INPUT FOR THIS TASK:\n---\n${task.input}\n---\n` : ''}

Please execute this task according to your role (${this.role}) and capabilities.
Deliver the output required by the task description. Ensure your response is comprehensive and directly addresses the task.
`;

    // Send prompt to LLM
    const response = await sendPrompt(userPrompt, {
      systemPrompt: systemPrompt,
      maxTokens: task.maxTokens || 1500,
      temperature: task.temperature || 0.5,
      model: task.model || OPENAI_MODEL
    });

    // Update task status and store results
    task.status = response.content.startsWith('[API Error:') ? 'failed' : 'completed';
    task.result = response.content;
    task.completedAt = Date.now();
    task.usage = response.usage;
    task.error = response.content.startsWith('[API Error:') ? response.content : null; // Store error message if API call failed

    // Store conversation in agent's memory
    this.memory.conversations.push({
      taskId: task.id,
      prompt: userPrompt, // Storing the constructed prompt
      response: response.content,
      timestamp: Date.now(),
      usage: response.usage,
      error: task.error
    });

    // Return detailed results for logging and workflow progression
    return {
      content: response.content,
      requestMessages: response.requestMessages,
      fullResponse: response.fullResponse,
      usage: response.usage,
      error: task.error
    };
  }
}

// Task Manager Class (Handles task lifecycle)
class TaskManager {
  constructor() {
    this.tasks = new Map(); // Stores task objects by ID
    this.taskHistory = []; // Log of task actions (created, assigned, updated)
  }

  // Create a new task object
  createTask(taskData) {
    const task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: 'pending', // pending, assigned, processing, completed, failed
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo || null, // Agent ID
      dependsOn: taskData.dependsOn || [], // Array of task IDs this task depends on
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: null,
      completedAt: null,
      context: taskData.context || '', // Data from previous steps needed for this task
      input: taskData.input || '', // Specific input for this task (e.g., a sub-topic)
      result: null, // Stores the output/content generated by the agent
      usage: null, // Stores LLM token usage for the task
      error: null, // Stores error message if task failed
      maxTokens: taskData.maxTokens || 1500,
      temperature: taskData.temperature || 0.5,
      model: taskData.model || OPENAI_MODEL
    };

    this.tasks.set(task.id, task);
    this._logHistory('created', task.id);
    console.log(`📝 Task created: ${task.title} (ID: ${task.id})`);
    return task;
  }

  // Assign a task to an agent
  assignTask(taskId, agentId) {
    const task = this._getTaskOrFail(taskId);
    task.assignedTo = agentId;
    task.status = 'assigned';
    task.updatedAt = Date.now();
    this._logHistory('assigned', taskId, { agentId });
    console.log(`🔗 Task "${task.title}" assigned to Agent ID: ${agentId}`);
    return task;
  }

  // Update task properties (e.g., status, result)
  updateTask(taskId, updates) {
    const task = this._getTaskOrFail(taskId);
    // Ensure timestamps are updated correctly based on status changes
    if (updates.status === 'processing' && !task.startedAt) {
      updates.startedAt = Date.now();
    }
    if ((updates.status === 'completed' || updates.status === 'failed') && !task.completedAt) {
      updates.completedAt = Date.now();
    }
    Object.assign(task, updates, { updatedAt: Date.now() });
    this._logHistory('updated', taskId, { updates });
    return task;
  }

  // Get a task by ID
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  // Get a task or throw error if not found
  _getTaskOrFail(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    return task;
  }

  // Get tasks based on filter criteria
  getTasks(filter = {}) {
    let tasks = Array.from(this.tasks.values());
    // Apply filters... (status, assignedTo, etc.)
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined) {
        tasks = tasks.filter(task => task[key] === filter[key]);
      }
    });
    return tasks;
  }

  // Log task history
  _logHistory(action, taskId, details = {}) {
    this.taskHistory.push({
      action,
      taskId,
      timestamp: Date.now(),
      ...details
    });
  }
}

// Shared State Manager Class (Simple key-value store)
class SharedStateManager {
  constructor() {
    this.state = {};
  }

  // Set a value (supports dot notation)
  setState(key, value) {
    const keys = key.split('.');
    let current = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    console.log(`💾 Shared State updated: ${key} = ${typeof value === 'string' ? value.substring(0, 50) + '...' : '[non-string value]'}`);
  }

  // Get a value (supports dot notation)
  getState(key) {
    const keys = key.split('.');
    let current = this.state;
    for (const k of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(k)) {
        return undefined;
      }
      current = current[k];
    }
    return current;
  }

  // Get the entire state object
  getAllState() {
    return this.state;
  }
}

// Coordinator Class (Orchestrates the workflow)
class Coordinator {
  constructor() {
    this.agents = new Map(); // Stores agent instances by ID
    this.taskManager = new TaskManager();
    this.sharedState = new SharedStateManager();
    this.workflowSteps = []; // Stores definition of each step in the workflow for visualization
  }

  // Register an agent instance
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    console.log(`✅ Registered agent: ${agent.name} (Role: ${agent.role}, ID: ${agent.id})`);
    return agent.id;
  }

  // Get an agent instance by ID
  getAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found.`);
    return agent;
  }

  // Find the first available agent with a specific capability
  findAgentByCapability(capability) {
    for (const agent of this.agents.values()) {
      if (agent.capabilities.includes(capability)) {
        return agent;
      }
    }
    return null; // Return null if no suitable agent is found
  }

  // Execute a single task by finding an agent and processing
  async executeTask(taskData, context = "") {
    const capability = taskData.capability; // Assumes taskData includes required capability
    const agent = this.findAgentByCapability(capability);
    if (!agent) {
      throw new Error(`No agent found with capability: ${capability}`);
    }

    // Add context to task data
    taskData.context = context;

    const task = this.taskManager.createTask(taskData);
    this.taskManager.assignTask(task.id, agent.id);

    // Update task status to processing
    this.taskManager.updateTask(task.id, { status: 'processing' });

    // Process the task
    const resultDetails = await agent.processTask(task, this.sharedState);

    // Update task with result and final status (handled within processTask)
    this.taskManager.updateTask(task.id, {
      status: task.status, // Status is set within processTask
      result: resultDetails.content,
      usage: resultDetails.usage,
      error: resultDetails.error,
      completedAt: Date.now() // Ensure completion time is set
    });

    // Store intermediate results for logging
    const stepDetail = {
      step: this.workflowSteps.length + 1, // Sequential step number
      taskId: task.id,
      agentName: agent.name,
      capability: capability,
      requestMessages: resultDetails.requestMessages,
      fullResponse: resultDetails.fullResponse,
      status: task.status,
      error: task.error
    };

    return { task, stepDetail };
  }

  // Generate Mermaid flowchart definition for the complex workflow
  generateWorkflowDiagram() {
    let diagram = 'graph TD;\n';
    const nodeStyles = {}; // To define styles if needed
    const edges = []; // To store edge definitions

    // Add nodes for each defined step
    this.workflowSteps.forEach((step, index) => {
      const stepId = `Step${index}_${step.name.replace(/[^a-zA-Z0-9]/g, '_')}`; // Sanitize name for ID
      diagram += `  ${stepId}("${step.name}<br/>(${step.capability})");\n`;
      step.nodeId = stepId; // Store nodeId back into the step for edge creation
    });

    // Define edges based on dependencies
    this.workflowSteps.forEach((step, index) => {
      if (step.dependsOn && step.dependsOn.length > 0) {
        step.dependsOn.forEach(depName => {
          // Find the step object that matches the dependency name
          const sourceStep = this.workflowSteps.find(s => s.name === depName);
          if (sourceStep) {
            edges.push(`  ${sourceStep.nodeId} --> ${step.nodeId};`);
          } else {
             console.warn(`Warning: Dependency "${depName}" not found for step "${step.name}"`);
          }
        });
      } else if (index > 0 && !step.isParallelStart) {
        // Default sequential connection if no explicit dependency and not starting parallel work
        // Find the *last* step that isn't part of the same parallel block (if applicable)
        let prevStep = this.workflowSteps[index - 1];
        // This logic might need refinement for complex parallel scenarios
         edges.push(`  ${prevStep.nodeId} --> ${step.nodeId};`);
      }
    });

    // Add unique edges to the diagram string
    diagram += [...new Set(edges)].join('\n'); // Ensure no duplicate edges

    return diagram;
  }


  // Main workflow execution logic
  async runWorkflow(topic, outputPath) {
    console.log(`\n🚀 Starting PhD Qualifier Prep Workflow for topic: "${topic}"`);
    const startTime = Date.now();
    this.sharedState.setState('workflow.topic', topic);
    this.sharedState.setState('workflow.startTime', startTime);
    this.sharedState.setState('workflow.status', 'running');

    let currentContext = `Initial Topic: ${topic}`; // Context string passed between steps
    let llmCalls = 0;
    const stepDetails = []; // Stores detailed log of each step { step, agentName, capability, requestMessages, fullResponse, status, error }
    const taskResults = {}; // Stores final text result per task { taskId: content }
    const completedTasks = {}; // Stores completed task objects { taskId: task }

    try {
        // --- 1. Planning Phase ---
        console.log('\n--- Phase 1: Planning ---');
        this.workflowSteps.push({ name: 'PlanResearch', capability: 'planning', dependsOn: [] });
        const planTaskData = {
            title: `Develop Research Plan for "${topic}"`,
            description: `Create a detailed plan for researching the topic "${topic}" for a PhD qualifying exam. Identify 3-5 key sub-topics or research areas. Define specific research questions for each sub-topic. Output the plan as a structured list or JSON.`,
            capability: 'planning',
            maxTokens: 800,
            temperature: 0.4
        };
        const { task: planTask, stepDetail: planStepDetail } = await this.executeTask(planTaskData, currentContext);
        llmCalls++;
        stepDetails.push(planStepDetail);
        completedTasks[planTask.id] = planTask;
        taskResults[planTask.id] = planTask.result;
        if (planTask.status === 'failed') throw new Error(`Planning failed: ${planTask.error}`);
        currentContext += `\n\nResearch Plan:\n${planTask.result}`;
        this.sharedState.setState(`workflow.results.planning`, planTask.result);

        // --- Parse Plan (Simple Example: Assume subtopics are listed) ---
        // In a real scenario, use NLP or structured output (JSON) from the planner
        const researchPlanText = planTask.result;
        // Simple regex to find lines starting with a number/bullet, adjust as needed based on planner output format
        const subTopicLines = researchPlanText.match(/^[ \t]*[\*\-\d]+\.?\s*(.*)/gm) || [];
        let subTopics = subTopicLines.map(line => line.replace(/^[ \t]*[\*\-\d]+\.?\s*/, '').trim()).filter(Boolean);

        if (subTopics.length === 0) {
            console.warn("⚠️ Could not parse sub-topics from plan, using default research task.");
            subTopics = [topic]; // Fallback to researching the main topic
        } else {
             console.log(`📊 Identified Sub-topics: ${subTopics.join(', ')}`);
        }


        // --- 2. Parallel Research Phase ---
        console.log('\n--- Phase 2: Parallel Research ---');
        const researchTasksPromises = [];
        const researchStepNames = []; // Store names for dependency tracking

        subTopics.forEach((subTopic, index) => {
            const researchStepName = `ResearchSubTopic_${index + 1}`;
            researchStepNames.push(researchStepName);
            this.workflowSteps.push({
                name: researchStepName,
                capability: 'research',
                dependsOn: ['PlanResearch'],
                isParallelStart: true // Mark as starting parallel work
            });

            const researchTaskData = {
                title: `Research Sub-Topic: ${subTopic}`,
                description: `Conduct in-depth research on the sub-topic "${subTopic}" within the broader context of "${topic}". Focus on key theories, methodologies, findings, and open questions relevant to a PhD qualifier. Synthesize information from multiple reputable sources.`,
                capability: 'research',
                input: `Sub-topic: ${subTopic}`, // Specific input for this researcher
                maxTokens: 2000,
                temperature: 0.3,
                model: 'gpt-4o' // Use a powerful model for research
            };
            // Execute task, but don't await yet, store the promise
            researchTasksPromises.push(
                this.executeTask(researchTaskData, `Research Plan:\n${researchPlanText}`)
                    .then(({ task, stepDetail }) => { // Add stepDetail to the main log when promise resolves
                        llmCalls++;
                        stepDetails.push(stepDetail);
                        return task; // Return the completed task object
                    })
            );
        });

        // Wait for all research tasks to complete
        const researchTasks = await Promise.all(researchTasksPromises);

        // Process results of parallel tasks
        let combinedResearch = "";
        researchTasks.forEach((task, index) => {
             completedTasks[task.id] = task;
             taskResults[task.id] = task.result;
             if (task.status === 'failed') {
                console.error(`❌ Research task for sub-topic "${subTopics[index]}" failed: ${task.error}`);
                combinedResearch += `\n\n--- Research Findings for Sub-topic: ${subTopics[index]} ---\n[Research Failed: ${task.error}]\n---`;
             } else {
                combinedResearch += `\n\n--- Research Findings for Sub-topic: ${subTopics[index]} ---\n${task.result}\n---`;
                this.sharedState.setState(`workflow.results.research.${subTopics[index].replace(/ /g, '_')}`, task.result); // Store individual results
             }
        });
        currentContext += `\n\nCombined Research Findings:\n${combinedResearch}`;


        // --- 3. Synthesis Phase ---
        console.log('\n--- Phase 3: Synthesis ---');
        this.workflowSteps.push({ name: 'SynthesizeResearch', capability: 'synthesis', dependsOn: researchStepNames }); // Depends on all research steps
        const synthesisTaskData = {
            title: `Synthesize Research Findings for "${topic}"`,
            description: `Synthesize the research findings from the different sub-topics provided in the context. Identify overarching themes, connections, discrepancies, and potential areas for novel contribution related to "${topic}". Produce a coherent synthesis.`,
            capability: 'synthesis',
            maxTokens: 1800,
            temperature: 0.5
        };
        const { task: synthesisTask, stepDetail: synthStepDetail } = await this.executeTask(synthesisTaskData, currentContext);
        llmCalls++;
        stepDetails.push(synthStepDetail);
        completedTasks[synthesisTask.id] = synthesisTask;
        taskResults[synthesisTask.id] = synthesisTask.result;
         if (synthesisTask.status === 'failed') throw new Error(`Synthesis failed: ${synthesisTask.error}`);
        currentContext += `\n\nSynthesized Findings:\n${synthesisTask.result}`;
        this.sharedState.setState(`workflow.results.synthesis`, synthesisTask.result);

        // --- 4. Outlining Phase ---
        console.log('\n--- Phase 4: Outlining ---');
        this.workflowSteps.push({ name: 'CreateOutline', capability: 'outlining', dependsOn: ['SynthesizeResearch'] });
        const outlineTaskData = {
            title: `Create Document Outline for "${topic}"`,
            description: `Based on the synthesized research findings, create a detailed hierarchical outline for two key PhD qualifying exam documents: a Literature Review and a Research Proposal on "${topic}". The outline should structure the main arguments, sections, and sub-points for each document.`,
            capability: 'outlining',
            maxTokens: 1200,
            temperature: 0.4
        };
        const { task: outlineTask, stepDetail: outlineStepDetail } = await this.executeTask(outlineTaskData, currentContext);
        llmCalls++;
        stepDetails.push(outlineStepDetail);
        completedTasks[outlineTask.id] = outlineTask;
        taskResults[outlineTask.id] = outlineTask.result;
        if (outlineTask.status === 'failed') throw new Error(`Outlining failed: ${outlineTask.error}`);
        currentContext += `\n\nDocument Outlines:\n${outlineTask.result}`;
        this.sharedState.setState(`workflow.results.outline`, outlineTask.result);

        // --- 5. Writing Phase ---
        console.log('\n--- Phase 5: Writing ---');
        this.workflowSteps.push({ name: 'WriteDocuments', capability: 'writing', dependsOn: ['CreateOutline'] });
        const writingTaskData = {
            title: `Write Qualifying Exam Documents for "${topic}"`,
            description: `Using the provided synthesis and detailed outlines, write the full text for the Literature Review and Research Proposal documents on "${topic}". Ensure academic rigor, clear prose, proper citation placeholders (e.g., [Citation Needed]), and adherence to the outline structure. Combine both documents into a single response, clearly marking the start of each.`,
            capability: 'writing',
            maxTokens: 4000, // Allow ample space for long documents
            temperature: 0.6, // Slightly higher temp for more generative writing
            model: 'gpt-4o' // Use best model for writing quality
        };
        const { task: writingTask, stepDetail: writingStepDetail } = await this.executeTask(writingTaskData, currentContext);
        llmCalls++;
        stepDetails.push(writingStepDetail);
        completedTasks[writingTask.id] = writingTask;
        taskResults[writingTask.id] = writingTask.result;
         if (writingTask.status === 'failed') throw new Error(`Writing failed: ${writingTask.error}`);
        currentContext += `\n\nDraft Documents:\n${writingTask.result}`;
        this.sharedState.setState(`workflow.results.writing`, writingTask.result);

        // --- 6. Editing Phase ---
        console.log('\n--- Phase 6: Editing ---');
        this.workflowSteps.push({ name: 'EditDocuments', capability: 'editing', dependsOn: ['WriteDocuments'] });
        const editingTaskData = {
            title: `Edit Qualifying Exam Documents for "${topic}"`,
            description: `Review and edit the draft Literature Review and Research Proposal provided in the context. Focus on clarity, coherence, grammatical correctness, academic tone, and consistency. Improve sentence structure and flow. Provide the fully edited versions of both documents.`,
            capability: 'editing',
            maxTokens: 4000, // Match writing token limit
            temperature: 0.3 // Lower temp for precise editing
        };
        const { task: editingTask, stepDetail: editingStepDetail } = await this.executeTask(editingTaskData, currentContext);
        llmCalls++;
        stepDetails.push(editingStepDetail);
        completedTasks[editingTask.id] = editingTask;
        taskResults[editingTask.id] = editingTask.result;
         if (editingTask.status === 'failed') throw new Error(`Editing failed: ${editingTask.error}`);
        currentContext += `\n\nEdited Documents:\n${editingTask.result}`; // Update context with edited version
        this.sharedState.setState(`workflow.results.editing`, editingTask.result);


        // --- 7. Formatting Phase ---
        console.log('\n--- Phase 7: Formatting ---');
        this.workflowSteps.push({ name: 'FormatFinalOutput', capability: 'formatting', dependsOn: ['EditDocuments'] });
        const formattingTaskData = {
            title: `Format Final Documents for "${topic}"`,
            description: `Take the edited Literature Review and Research Proposal from the context and format them into a single, clean Markdown document. Use appropriate headings (#, ##, ###), lists, and text formatting (bold, italics) for readability. Include a title page/section at the beginning.`,
            capability: 'formatting',
            maxTokens: 4000,
            temperature: 0.2
        };
        const { task: formattingTask, stepDetail: formattingStepDetail } = await this.executeTask(formattingTaskData, currentContext);
        llmCalls++;
        stepDetails.push(formattingStepDetail);
        completedTasks[formattingTask.id] = formattingTask;
        taskResults[formattingTask.id] = formattingTask.result;
         if (formattingTask.status === 'failed') throw new Error(`Formatting failed: ${formattingTask.error}`);
        this.sharedState.setState(`workflow.results.final_formatted_document`, formattingTask.result);


        // --- Workflow Completion ---
        const endTime = Date.now();
        this.sharedState.setState('workflow.endTime', endTime);
        this.sharedState.setState('workflow.status', 'completed');
        this.sharedState.setState('workflow.llmCalls', llmCalls);

        // Calculate total usage stats
        const totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        Object.values(completedTasks).forEach(task => {
            if (task.usage) {
                totalUsage.prompt_tokens += task.usage.prompt_tokens || 0;
                totalUsage.completion_tokens += task.usage.completion_tokens || 0;
                totalUsage.total_tokens += task.usage.total_tokens || 0;
            }
        });
        this.sharedState.setState('workflow.usage', totalUsage);

        // --- Output Generation ---
        if (outputPath) {
            const runDirPath = outputPath; // outputPath is the run-specific directory

            // Save Final Report JSON
            const finalReport = {
                topic: topic,
                status: this.sharedState.getState('workflow.status'),
                startTime: startTime,
                endTime: endTime,
                durationMs: endTime - startTime,
                llmCalls: llmCalls,
                totalUsage: totalUsage,
                results: { // Include key results for overview
                    plan: taskResults[planTask.id]?.substring(0, 500) + '...',
                    synthesis: taskResults[synthesisTask.id]?.substring(0, 500) + '...',
                    finalDocumentSummary: taskResults[formattingTask.id]?.substring(0, 500) + '...',
                },
                tasks: Object.values(completedTasks).map(t => ({ // Summary of all tasks
                     id: t.id, title: t.title, status: t.status, agentId: t.assignedTo,
                     durationMs: t.completedAt ? t.completedAt - (t.startedAt || t.createdAt) : null,
                     usage: t.usage, error: t.error
                }))
            };
            const reportJsonPath = path.join(runDirPath, '_workflow_report.json');
            fs.writeFileSync(reportJsonPath, JSON.stringify(finalReport, null, 2));
            console.log(`\n💾 Workflow report saved to ${reportJsonPath}`);

            // Save Final Formatted Markdown Document
            const finalDocPath = path.join(runDirPath, 'final_qualifier_document.md');
            const finalDocumentContent = taskResults[formattingTask.id] || "[Formatting Failed]";
            fs.writeFileSync(finalDocPath, `# PhD Qualifier Documents: ${topic}\n\n${finalDocumentContent}`);
            console.log(`💾 Final formatted document saved to ${finalDocPath}`);

            // Save Intermediate Step Details
            const stepsDir = path.join(runDirPath, 'intermediate_steps');
            if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir);

            stepDetails.forEach(step => {
                const stepFileNameBase = path.join(stepsDir, `step_${String(step.step).padStart(2, '0')}_${step.agentName.replace(/[^a-zA-Z0-9]/g, '_')}_${step.capability}`);
                // Save prompt messages
                fs.writeFileSync(`${stepFileNameBase}_prompt.json`, JSON.stringify(step.requestMessages, null, 2));
                // Save full response object (includes content, usage, etc.)
                fs.writeFileSync(`${stepFileNameBase}_response.json`, JSON.stringify(step.fullResponse, null, 2));
                 // Save just the result content for easier reading
                const task = completedTasks[step.taskId];
                if (task && task.result) {
                   fs.writeFileSync(`${stepFileNameBase}_result.txt`, task.result);
                }
            });
             console.log(`💾 Intermediate prompts/responses saved to ${stepsDir}`);

            // Generate and save workflow visualization using the defined steps
            try {
                const diagramDefinition = this.generateWorkflowDiagram();
                const diagramPathBase = path.join(runDirPath, '_workflow_visualization');
                const diagramPathDef = diagramPathBase + '.mmd';
                const diagramPathImg = diagramPathBase + '.png';
                fs.writeFileSync(diagramPathDef, diagramDefinition);
                console.log(`📊 Generating workflow diagram...`);
                // Ensure mmdc command handles paths with spaces correctly
                await runCommand(`mmdc -i "${diagramPathDef}" -o "${diagramPathImg}" -w 1000`);
                console.log(`💾 Workflow diagram saved to ${diagramPathImg}`);
                // Optionally remove the definition file
                // fs.unlinkSync(diagramPathDef);
            } catch (visError) {
                console.error('❌ Error generating visualization:', visError.message);
                console.error('Ensure mermaid-cli (mmdc) is installed: npm install -g @mermaid-js/mermaid-cli');
            }
        }

        console.log(`\n🏁 Workflow completed in ${(endTime - startTime) / 1000} seconds`);
        console.log(`📊 Total LLM Calls: ${llmCalls}`);
        console.log(`📊 Total Tokens Used: ${totalUsage.total_tokens} (Prompt: ${totalUsage.prompt_tokens}, Completion: ${totalUsage.completion_tokens})`);

        return {
            results: taskResults, // Contains all task results keyed by taskId
            stats: {
                usage: totalUsage,
                llmCalls: llmCalls,
                durationMs: endTime - startTime
            }
        };

    } catch (error) {
        console.error('\n❌ Workflow failed:', error.message);
        const endTime = Date.now();
        this.sharedState.setState('workflow.endTime', endTime);
        this.sharedState.setState('workflow.status', 'failed');
        this.sharedState.setState('workflow.error', error.message);

        // Save partial report if outputPath is provided
         if (outputPath) {
             const partialReport = {
                 topic: topic,
                 status: 'failed',
                 error: error.message,
                 startTime: startTime,
                 endTime: endTime,
                 durationMs: endTime - startTime,
                 llmCalls: llmCalls,
                 completedTasks: Object.values(completedTasks).map(t => ({ id: t.id, title: t.title, status: t.status, error: t.error })),
                 stepDetails: stepDetails // Include logged steps up to failure
             };
             const reportJsonPath = path.join(outputPath, '_workflow_report_FAILED.json');
             fs.writeFileSync(reportJsonPath, JSON.stringify(partialReport, null, 2));
             console.log(`💾 Partial failure report saved to ${reportJsonPath}`);
         }
        throw error; // Re-throw error to signal failure
    }
  }
}

// Main execution function
async function main() {
  try {
    // Create unique run directory based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runSubDir = `qualifier-prep-${timestamp}`;
    const runDirPath = path.join(OUTPUT_DIR, runSubDir);
    if (!fs.existsSync(runDirPath)) {
      fs.mkdirSync(runDirPath, { recursive: true });
      console.log(`📂 Created output directory: ${runDirPath}`);
    }

    // Instantiate Coordinator
    const coordinator = new Coordinator();

    // --- Create Agent Instances ---
    const plannerAgent = new Agent('Planner Pro', 'PhD Research Planning', ['planning', 'structuring']);
    // Create multiple researcher agents (or reuse one if state is managed carefully)
    const researcherAgent1 = new Agent('Researcher Alpha', 'Scientific Literature Review', ['research', 'information-gathering']);
    const researcherAgent2 = new Agent('Researcher Beta', 'Methodology Analysis', ['research', 'critical-analysis']);
    // For simplicity here, we'll use one agent instance multiple times for research tasks,
    // relying on the task context to guide it. A pool of agents could also be used.
    const synthesizerAgent = new Agent('Synthesizer Supreme', 'Knowledge Integration', ['synthesis', 'theme-identification']);
    const outlinerAgent = new Agent('Outline Architect', 'Document Structuring', ['outlining', 'logical-flow']);
    const writerAgent = new Agent('Academic Writer', 'Long-Form Academic Writing', ['writing', 'report-generation', 'academic-style']);
    const editorAgent = new Agent('Editor Extraordinaire', 'Academic Editing & Proofreading', ['editing', 'proofreading', 'style-improvement', 'clarity']);
    const formatterAgent = new Agent('Markdown Master', 'Document Formatting', ['formatting', 'markdown', 'presentation']);

    // --- Register Agents with Coordinator ---
    coordinator.registerAgent(plannerAgent);
    coordinator.registerAgent(researcherAgent1); // Register at least one researcher
    // coordinator.registerAgent(researcherAgent2); // Can register more if needed for specific sub-tasks
    coordinator.registerAgent(synthesizerAgent);
    coordinator.registerAgent(outlinerAgent);
    coordinator.registerAgent(writerAgent);
    coordinator.registerAgent(editorAgent);
    coordinator.registerAgent(formatterAgent);


    // --- Define Topic and Run Workflow ---
    const topic = process.argv[2] || 'Ant colony foraging behavior and optimization algorithms';
    console.log(`\n📝 Workflow Topic: ${topic}`);

    await coordinator.runWorkflow(topic, runDirPath);

  } catch (error) {
    console.error('\n❌ Critical Error in main execution:', error);
    process.exit(1);
  }
}

// --- Start the script ---
main(); 