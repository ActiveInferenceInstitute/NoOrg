/**
 * Organizational Units Demo Implementation
 * 
 * This module implements the functionality for demonstrating
 * organizational units, their relationships, and specialized agents
 * with LLM integration by dynamically scanning a directory structure.
 * It uses a multi-agent simulation approach inspired by phd-qualifier-prep-test.js.
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { exec } = require('child_process'); // For potential diagram generation

// Load local modules
const Logger = require('../utils/Logger');
const OpenAIClient = require('../utils/OpenAIClient'); // Keep for compatibility

// Load environment variables
dotenv.config();

// Constants
const DEFAULT_OUTPUT_DIR = './output';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Use a capable default
const OBSIDIAN_LINK_REGEX = /\[\[(.*?)\]\]/g;

// --- Utility Functions ---

/**
 * Generates a unique run ID based on current timestamp
 * @returns {string} Formatted run ID
 */
function generateRunId() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Prepares the output directory for a run
 * @param {string} baseDir Base output directory
 * @param {string} runId Run identifier
 * @returns {string} Full path to run directory
 */
function prepareRunDirectory(baseDir = DEFAULT_OUTPUT_DIR, runId) {
  const runDir = path.join(baseDir, `run-${runId}`);
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
  }
  return runDir;
}

// Utility to count words for logging
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Function to run shell commands (for diagram generation)
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

// Function to send a prompt to OpenAI via OpenAIClient
async function sendPrompt(openaiClient, prompt, options = {}) {
  if (!openaiClient) {
    console.warn("⚠️ OpenAI client not initialized (likely missing API key). Skipping LLM call.");
    return {
        content: `[LLM Skipped - No API Key]`,
        usage: null,
        requestMessages: [{ role: 'system', content: options.systemPrompt || '' }, { role: 'user', content: prompt }],
        fullResponse: { error: 'OpenAI client not initialized' }
    };
  }

  console.log(`\n📤 Sending prompt (${countWords(prompt)} words) to ${options.model || DEFAULT_MODEL}`);

  const model = options.model || DEFAULT_MODEL;
  const maxTokens = options.maxTokens || 1500;
  const temperature = options.temperature || 0.5;

  try {
    const response = await openaiClient.sendPrompt(prompt, {
      systemPrompt: options.systemPrompt || 'You are a helpful organizational unit AI agent.',
      maxTokens: maxTokens,
      temperature: temperature,
      model: model
    });

    const result = response.content || '[No Content Received]';
    const usage = response.usage;

    console.log(`\n📥 Received response (${countWords(result)} words)`);
    console.log('----------------------------------');
    console.log(result.substring(0, 200) + (result.length > 200 ? '...' : ''));
    console.log('----------------------------------');
    console.log(`📊 Usage: ${usage?.total_tokens ?? 'N/A'} tokens`);

    return {
      content: result,
      usage: usage,
      requestMessages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful organizational unit AI agent.' },
        { role: 'user', content: prompt }
      ],
      fullResponse: response
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI:', error);
    return {
        content: `[API Error: ${error.message}]`,
        usage: null,
        requestMessages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful organizational unit AI agent.' },
          { role: 'user', content: prompt }
        ],
        fullResponse: { error: error.message }
    };
  }
}

/**
 * Recursively scans directories to load organizational units.
 * @param {string} dirPath Current directory path.
 * @param {string|null} parentId ID of the parent unit, if any.
 * @param {Map<string, object>} unitsMap Map to store unit objects keyed by path.
 * @param {Array<object>} relationships Array to store relationship objects.
 * @param {Logger} logger Logger instance.
 */
function loadUnitsRecursive(dirPath, parentId, unitsMap, relationships, logger) {
  try {
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

    dirents.forEach(dirent => {
      if (dirent.isDirectory()) {
        const unitNameRaw = dirent.name;
        const unitName = unitNameRaw.replace(/_/g, ' '); // Sanitize name
        const unitPath = path.join(dirPath, unitNameRaw);
        const unitId = uuidv4();
        
        let description = `Organizational unit for ${unitName}`;
        let capabilities = []; // Placeholder
        let primaryMdPath = null;

        // Try to find a primary markdown file (e.g., README.md, <unit_name>.md)
        const potentialMdFiles = fs.readdirSync(unitPath)
          .filter(f => f.toLowerCase().endsWith('.md') && (f.toLowerCase() === 'readme.md' || f.toLowerCase().startsWith(unitNameRaw.toLowerCase())));
        
        if (potentialMdFiles.length > 0) {
           primaryMdPath = path.join(unitPath, potentialMdFiles[0]); // Use the first match
           try {
             const mdContent = fs.readFileSync(primaryMdPath, 'utf8');
             // Simple description extraction (first non-empty line after potential title)
             const lines = mdContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
             if (lines.length > 1 && lines[0].startsWith('#')) {
                 description = lines[1]; // Assume first line after heading is description
             } else if (lines.length > 0) {
                 description = lines[0]; 
             }
             // Extract capabilities from content (simplified approach)
             if (mdContent.includes('Capabilities') || mdContent.includes('capabilities')) {
                capabilities = ['strategic_planning', 'analysis', 'reporting']; // Default set
                // A more sophisticated approach would parse the document structure
             }
           } catch (mdErr) {
             logger.warn(`Could not read or parse MD file ${primaryMdPath}: ${mdErr.message}`);
           }
        }

        const unit = {
          id: unitId,
          name: unitName,
          description: description.substring(0, 250) + (description.length > 250 ? '...' : ''), // Truncate long descriptions
          capabilities: capabilities,
          path: unitPath,
          primaryMdPath: primaryMdPath, // Store path for link parsing
          parentId: parentId
        };
        unitsMap.set(unitPath, unit);
        logger.log(`Discovered Unit: ${unit.name} (ID: ${unit.id})`);

        // Add hierarchical relationship if it has a parent
        if (parentId) {
          const parentUnit = Array.from(unitsMap.values()).find(u => u.id === parentId);
          if (parentUnit) {
            relationships.push({
              id: uuidv4(),
              sourceUnitId: parentId,
              targetUnitId: unitId, // Will resolve names to IDs later if needed
              type: 'hierarchy',
              description: `${parentUnit.name} contains ${unit.name}`
            });
          }
        }

        // Recurse into subdirectory
        loadUnitsRecursive(unitPath, unitId, unitsMap, relationships, logger);
      }
    });
  } catch (error) {
    logger.warn(`Error scanning directory ${dirPath}: ${error.message}`);
    // Decide whether to throw or just log and continue
  }
}

/**
 * Parses a Markdown file for Obsidian-style links.
 * @param {string} filePath Path to the Markdown file.
 * @param {string} sourceUnitId ID of the unit containing the file.
 * @param {Array<object>} relationships Array to add discovered links to.
 * @param {Logger} logger Logger instance.
 */
function parseObsidianLinks(filePath, sourceUnitId, relationships, logger) {
    if (!filePath) return; // No file to parse
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        while ((match = OBSIDIAN_LINK_REGEX.exec(content)) !== null) {
            const targetName = match[1].trim();
            // We store the target name for now; resolve to ID later
            relationships.push({
                id: uuidv4(),
                sourceUnitId: sourceUnitId, 
                targetUnitName: targetName, // Store name initially
                type: 'link',
                description: `Link found in ${path.basename(filePath)} to ${targetName}`
            });
            logger.log(`Found link from Unit ID ${sourceUnitId} -> ${targetName}`);
        }
    } catch (error) {
        logger.warn(`Could not read or parse links in ${filePath}: ${error.message}`);
    }
}

/**
 * Resolves target unit names in relationships to unit IDs.
 * @param {Array<object>} relationships The relationships array.
 * @param {Array<object>} units The units array.
 * @param {Logger} logger Logger instance.
 */
function resolveRelationshipLinks(relationships, units, logger) {
    const unitNameMap = new Map(units.map(u => [u.name.toLowerCase(), u.id]));

    relationships.forEach(rel => {
        if (rel.type === 'link' && rel.targetUnitName) {
            const targetId = unitNameMap.get(rel.targetUnitName.toLowerCase());
            if (targetId) {
                rel.targetUnitId = targetId;
                delete rel.targetUnitName; // Remove temporary name
                logger.log(`Resolved link: ${rel.sourceUnitId} -> ${rel.targetUnitId} (${rel.targetUnitName})`);
            } else {
                logger.warn(`Could not resolve link target name "${rel.targetUnitName}" to a unit ID.`);
                // Decide whether to keep the relationship with unresolved name or remove it
                rel.targetUnitId = null; // Mark as unresolved
            }
        }
    });
}

// --- Core Classes (Adapted from phd-qualifier-prep-test.js) ---

/**
 * Represents an agent associated with an Organizational Unit.
 */
class OrgUnitAgent {
  constructor(unitData) { // Takes the unit object discovered earlier
    this.id = uuidv4();
    this.unitId = unitData.id; // Link back to the organizational unit
    this.name = `${unitData.name} Agent`;
    this.role = unitData.name; // Use unit name as the primary role
    this.capabilities = unitData.capabilities.length > 0 ? unitData.capabilities : ['general_processing']; // Use discovered or default
    this.memory = {
      conversations: [], // Stores { taskId, prompt, response, timestamp, usage, error }
      knowledge: {} // Can store structured knowledge derived from tasks
    };
    this.unitInfo = { ...unitData }; // Store a copy of the unit's info
  }

  /**
   * Process a task using LLM, tailored to the organizational unit context.
   * @param {object} task - The task object from TaskManager.
   * @param {SharedStateManager} sharedState - Access to shared workflow state.
   * @param {object} openaiClient - The OpenAI client instance.
   * @returns {Promise<object>} - Details of the LLM call and result.
   */
  async processTask(task, sharedState, openaiClient) {
    console.log(`\n🤖 ${this.name} (Unit: ${this.unitInfo.name}) processing task: ${task.title}`);

    // Build system prompt based on agent's unit role and capabilities
    const systemPrompt = `You are an AI agent representing the ${this.unitInfo.name} organizational unit.
Your unit's primary description is: ${this.unitInfo.description}
Your specific capabilities relevant to this task are: ${this.capabilities.join(', ')}.
Focus your response entirely on fulfilling the task based on your unit's role and capabilities, using the provided context and input.
Provide a detailed, professional, and well-structured response appropriate for inter-unit communication or action.`;

    // Build user prompt based on task details and workflow context
    const workflowTopic = sharedState.getState('workflow.topic') || 'General Organizational Task';
    const userPrompt = `
ORGANIZATIONAL CONTEXT: ${workflowTopic}
CURRENT UNIT: ${this.unitInfo.name} (ID: ${this.unitInfo.id})

TASK ID: ${task.id}
TASK TITLE: ${task.title}
TASK DESCRIPTION: ${task.description}

${task.context ? `AVAILABLE CONTEXT FROM PREVIOUS STEPS/UNITS:\n---\n${task.context}\n---\n` : 'CONTEXT: No specific context provided.'}
${task.input ? `SPECIFIC INPUT FOR THIS TASK:\n---\n${task.input}\n---\n` : ''}

Please execute this task according to the role and capabilities of the ${this.unitInfo.name} unit.
Deliver the output required by the task description. Ensure your response is actionable and relevant to the organizational context.
`;

    // Send prompt to LLM
    const response = await sendPrompt(openaiClient, userPrompt, {
      systemPrompt: systemPrompt,
      maxTokens: task.maxTokens || 1500,
      temperature: task.temperature || 0.5,
      model: task.model || DEFAULT_MODEL
    });

    // Update task status and store results (will be done by TaskManager via coordinator)
    task.status = response.content.startsWith('[API Error:') || response.content.startsWith('[LLM Skipped') ? 'failed' : 'completed';
    task.result = response.content;
    task.usage = response.usage;
    task.error = task.status === 'failed' ? response.content : null;

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

/**
 * Manages the lifecycle of tasks within the simulation.
 */
class TaskManager {
  constructor() {
    this.tasks = new Map(); // Stores task objects by ID
    this.taskHistory = []; // Log of task actions
  }

  createTask(taskData) {
    const task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: 'pending', // pending, assigned, processing, completed, failed
      priority: taskData.priority || 'medium',
      assignedToAgentId: taskData.assignedToAgentId || null,
      assignedToUnitId: taskData.assignedToUnitId || null, // Track unit assignment too
      dependsOn: taskData.dependsOn || [], // Array of task IDs
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: null,
      completedAt: null,
      context: taskData.context || '',
      input: taskData.input || '',
      result: null,
      usage: null,
      error: null,
      maxTokens: taskData.maxTokens || 1500,
      temperature: taskData.temperature || 0.5,
      model: taskData.model || DEFAULT_MODEL,
      originatingUnitId: taskData.originatingUnitId || null, // Which unit created/requested the task
      targetUnitId: taskData.targetUnitId || null // Which unit is the target (if applicable)
    };

    this.tasks.set(task.id, task);
    this._logHistory('created', task.id);
    console.log(`📝 Task created: ${task.title} (ID: ${task.id})`);
    return task;
  }

  assignTask(taskId, agentId, unitId) {
    const task = this._getTaskOrFail(taskId);
    task.assignedToAgentId = agentId;
    task.assignedToUnitId = unitId; // Assign unit ID as well
    task.status = 'assigned';
    task.updatedAt = Date.now();
    this._logHistory('assigned', taskId, { agentId, unitId });
    console.log(`🔗 Task "${task.title}" assigned to Agent ID: ${agentId} (Unit ID: ${unitId})`);
    return task;
  }

  updateTask(taskId, updates) {
    const task = this._getTaskOrFail(taskId);
    if (updates.status === 'processing' && !task.startedAt) {
      updates.startedAt = Date.now();
    }
    if ((updates.status === 'completed' || updates.status === 'failed') && !task.completedAt) {
      updates.completedAt = Date.now();
    }
    Object.assign(task, updates, { updatedAt: Date.now() });
    this._logHistory('updated', taskId, { updates: Object.keys(updates) }); // Log updated keys
    return task;
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  _getTaskOrFail(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    return task;
  }

  getTasks(filter = {}) {
    let tasks = Array.from(this.tasks.values());
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined) {
        tasks = tasks.filter(task => task[key] === filter[key]);
      }
    });
    return tasks;
  }

  // Check if dependencies for a task are met
  areDependenciesMet(taskId) {
    const task = this._getTaskOrFail(taskId);
    if (task.dependsOn.length === 0) return true;
    return task.dependsOn.every(depId => {
        const depTask = this.tasks.get(depId);
        return depTask && depTask.status === 'completed';
    });
  }

  _logHistory(action, taskId, details = {}) {
    this.taskHistory.push({
      action, taskId, timestamp: Date.now(), ...details
    });
  }
}

/**
 * Manages shared state accessible by the coordinator and agents.
 */
class SharedStateManager {
  constructor() {
    this.state = {};
  }

  setState(key, value) {
    const keys = key.split('.');
    let current = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    const oldValue = current[keys[keys.length - 1]];
    current[keys[keys.length - 1]] = value;
    // Avoid overly verbose logging for large objects/strings
    const valuePreview = (typeof value === 'string' && value.length > 100) ? value.substring(0, 100) + '...' : (typeof value === 'object' ? '[Object]' : value);
    console.log(`💾 Shared State updated: ${key} = ${valuePreview}`);
    return oldValue; // Return previous value if needed
  }

  getState(key, defaultValue = undefined) {
    const keys = key.split('.');
    let current = this.state;
    for (const k of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(k)) {
        return defaultValue;
      }
      current = current[k];
    }
    return current;
  }

  // Append to an array in the state
  appendState(key, value) {
     const keys = key.split('.');
     let current = this.state;
     for (let i = 0; i < keys.length - 1; i++) {
         current[keys[i]] = current[keys[i]] || {};
         current = current[keys[i]];
     }
     const arrKey = keys[keys.length - 1];
     if (!Array.isArray(current[arrKey])) {
         current[arrKey] = [];
     }
     current[arrKey].push(value);
     console.log(`💾 Shared State appended to: ${key}`);
  }

  getAllState() {
    return this.state;
  }
}

/**
 * Orchestrates the simulation based on discovered organizational structure.
 */
class OrgCoordinator {
  constructor(units, relationships, openaiClient, model) {
    this.units = new Map(units.map(u => [u.id, u]));
    this.relationships = relationships; // Store the resolved relationships
    this.agents = new Map(); // Map agent ID to agent instance
    this.unitAgentMap = new Map(); // Map unit ID to agent ID
    this.taskManager = new TaskManager();
    this.sharedState = new SharedStateManager();
    this.openaiClient = openaiClient;
    this.model = model || DEFAULT_MODEL;
    this.simulationLog = []; // Stores events during the simulation
    this.llmCalls = 0;
    this.totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  }

  // Create and register agents based on units
  initializeAgents() {
    console.log(`\n🔄 Initializing agents for ${this.units.size} units...`);
    this.units.forEach(unit => {
      const agent = new OrgUnitAgent(unit);
      this.agents.set(agent.id, agent);
      this.unitAgentMap.set(unit.id, agent.id);
      console.log(`  ✅ Created & Registered agent: ${agent.name} (Unit ID: ${unit.id}, Agent ID: ${agent.id})`);
    });
  }

  getAgentById(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found.`);
    return agent;
  }

  getAgentForUnit(unitId) {
    const agentId = this.unitAgentMap.get(unitId);
    if (!agentId) return null; // No agent registered for this unit
    return this.getAgentById(agentId);
  }

  getUnitById(unitId) {
      const unit = this.units.get(unitId);
      if (!unit) throw new Error(`Unit ${unitId} not found.`);
      return unit;
  }

  // Log simulation events
  logSimulationEvent(type, message, details = {}) {
    const event = { type, message, timestamp: Date.now(), ...details };
    this.simulationLog.push(event);
    console.log(`[SIM] ${type}: ${message}`);
  }

  /**
   * Executes a task, assigning it to the correct agent and handling results.
   * @param {object} taskData - Data to create the task.
   * @param {string} [assignedUnitId] - Optionally force assignment to a specific unit.
   * @returns {Promise<object>} - The completed task object.
   */
  async dispatchTask(taskData, assignedUnitId = null) {
      const targetUnitId = assignedUnitId || taskData.targetUnitId;
      if (!targetUnitId) {
          throw new Error(`Task "${taskData.title}" has no target unit specified.`);
      }
      
      const agent = this.getAgentForUnit(targetUnitId);
      if (!agent) {
          this.logSimulationEvent('error', `No agent found for target unit ${targetUnitId} for task "${taskData.title}".`);
          // Create a failed task record
          const failedTask = this.taskManager.createTask({...taskData, targetUnitId});
          this.taskManager.updateTask(failedTask.id, { status: 'failed', error: `No agent found for unit ${targetUnitId}` });
          return failedTask;
      }

      const task = this.taskManager.createTask({...taskData, targetUnitId});
      this.taskManager.assignTask(task.id, agent.id, targetUnitId);

      // Check dependencies immediately before processing
      if (!this.taskManager.areDependenciesMet(task.id)) {
          this.logSimulationEvent('info', `Task "${task.title}" deferred, waiting for dependencies.`);
          this.taskManager.updateTask(task.id, { status: 'pending_dependency' }); // Add a specific status?
          // We need a mechanism to re-evaluate pending tasks later
          return task; 
      }

      this.logSimulationEvent('task_start', `Agent ${agent.name} starting task "${task.title}"`);
      this.taskManager.updateTask(task.id, { status: 'processing' });

      // Process the task using the agent
      const resultDetails = await agent.processTask(task, this.sharedState, this.openaiClient);
      this.llmCalls += 1;
      if (resultDetails.usage) {
          this.totalUsage.prompt_tokens += resultDetails.usage.prompt_tokens || 0;
          this.totalUsage.completion_tokens += resultDetails.usage.completion_tokens || 0;
          this.totalUsage.total_tokens += resultDetails.usage.total_tokens || 0;
      }

      // Update task with results (status is set within processTask)
      this.taskManager.updateTask(task.id, {
          status: task.status, // Status was updated by agent.processTask
          result: resultDetails.content,
          usage: resultDetails.usage,
          error: resultDetails.error,
          completedAt: Date.now() // Ensure completion time
      });

      this.logSimulationEvent('task_complete', `Task "${task.title}" ${task.status} by ${agent.name}.`);

       // Append result to shared state
       this.sharedState.setState(`workflow.results.${task.id}`, {
            title: task.title,
            status: task.status,
            result: task.result,
            error: task.error
       });

      return task; // Return the completed/failed task object
  }

   /**
    * Finds units related to a given unit based on stored relationships.
    * @param {string} unitId - The ID of the source unit.
    * @param {string|string[]} [relationshipTypes] - Optional filter by type ('hierarchy', 'link', etc.).
    * @returns {Array<object>} - Array of related unit objects.
    */
   getRelatedUnits(unitId, relationshipTypes = null) {
       const types = relationshipTypes ? (Array.isArray(relationshipTypes) ? relationshipTypes : [relationshipTypes]) : null;
       const relatedUnitIds = new Set();

       this.relationships.forEach(rel => {
           let relatedId = null;
           if (rel.sourceUnitId === unitId) {
               relatedId = rel.targetUnitId;
           } else if (rel.targetUnitId === unitId && rel.type === 'hierarchy') {
               // Include parent in hierarchy relationship
               relatedId = rel.sourceUnitId;
           }

           if (relatedId && this.units.has(relatedId)) {
               if (!types || types.includes(rel.type)) {
                   relatedUnitIds.add(relatedId);
               }
           }
       });

       return Array.from(relatedUnitIds).map(id => this.units.get(id));
   }


  /**
   * Runs the main simulation loop.
   * @param {string} simulationTopic - A description for the simulation run.
   * @param {string} startUnitName - Name of the unit to initiate the simulation.
   * @param {object} initialTaskData - Data for the first task.
   * @returns {Promise<object>} - Final state and results of the simulation.
   */
  async runSimulation(simulationTopic, startUnitName, initialTaskData) {
    this.logSimulationEvent('start', `Starting simulation: "${simulationTopic}"`);
    const startTime = Date.now();
    this.sharedState.setState('workflow.topic', simulationTopic);
    this.sharedState.setState('workflow.startTime', startTime);
    this.sharedState.setState('workflow.status', 'running');

    // Find the starting unit
    const startUnit = Array.from(this.units.values()).find(u => u.name.toLowerCase() === startUnitName.toLowerCase());
    if (!startUnit) {
        this.logSimulationEvent('error', `Cannot find starting unit "${startUnitName}". Aborting.`);
        this.sharedState.setState('workflow.status', 'failed');
        this.sharedState.setState('workflow.error', `Starting unit "${startUnitName}" not found.`);
        return this.getFinalResults();
    }

    this.logSimulationEvent('info', `Initiating simulation from unit: ${startUnit.name}`);

    // --- Simulation Loop ---
    // This is a basic example. A real simulation might use an event queue,
    // handle parallel tasks, dependencies more robustly, etc.

    let currentTasks = []; // Tasks generated in this iteration
    let pendingTasks = []; // Tasks waiting for dependencies
    let processedTaskIds = new Set(); 
    let context = initialTaskData.context || `Simulation Topic: ${simulationTopic}`;

    // 1. Dispatch the initial task
    const initialTask = await this.dispatchTask({
        ...initialTaskData,
        title: initialTaskData.title || `Initial Task for ${simulationTopic}`,
        description: initialTaskData.description || `Start the process for ${simulationTopic}`,
        originatingUnitId: null, // Originated by the simulation itself
        targetUnitId: startUnit.id, // Target the starting unit
        context: context,
    });
    currentTasks.push(initialTask);
    processedTaskIds.add(initialTask.id);

    // 2. Process loop (simple sequential example based on relationships)
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Prevent infinite loops

    while (iterations < MAX_ITERATIONS) {
        iterations++;
        this.logSimulationEvent('info', `Simulation Iteration ${iterations}`);
        let newTasksGenerated = [];

        for (const completedTask of currentTasks) {
            if (completedTask.status !== 'completed') {
                this.logSimulationEvent('warning', `Task ${completedTask.id} (${completedTask.title}) did not complete successfully. Skipping.`);
                continue; // Don't trigger follow-up tasks if the current one failed
            }

            // Update context with the result of the completed task
            context += `\n\n--- Output from Task ${completedTask.id} (${completedTask.title}) ---\n${completedTask.result}\n---`;

            // Find units related to the unit that completed the task
            const originatingUnitId = completedTask.assignedToUnitId;
            const relatedUnits = this.getRelatedUnits(originatingUnitId); // Get all related units

            this.logSimulationEvent('info', `Unit ${this.getUnitById(originatingUnitId).name} completed task. Related units: ${relatedUnits.map(u => u.name).join(', ') || 'None'}`);

            // Generate follow-up tasks for related units
            for (const relatedUnit of relatedUnits) {
                // Define the follow-up task based on relationship type, unit capabilities, etc.
                const followUpTaskData = {
                    title: `Follow-up Task for ${relatedUnit.name} based on ${this.getUnitById(originatingUnitId).name}'s work`,
                    description: `Review the output from ${this.getUnitById(originatingUnitId).name} (Task ID: ${completedTask.id}) and perform relevant actions based on your unit's role (${relatedUnit.name}). Determine next steps or provide feedback.`,
                    dependsOn: [completedTask.id], // Depends on the task just completed
                    originatingUnitId: originatingUnitId,
                    targetUnitId: relatedUnit.id, // Target the related unit
                    context: context // Pass the accumulated context
                };

                // Dispatch the follow-up task
                const newTask = await this.dispatchTask(followUpTaskData);
                if (!processedTaskIds.has(newTask.id)) {
                   newTasksGenerated.push(newTask);
                   processedTaskIds.add(newTask.id);
                }
            }
        }

        if (newTasksGenerated.length === 0) {
            this.logSimulationEvent('info', `Iteration ${iterations}: No new tasks generated. Ending simulation loop.`);
            break; // Exit loop if no new tasks were processed
        }

        // Check for pending tasks that might now be ready
        // TODO: Implement logic to check tasks in `pendingTasks` and move them to `currentTasks` 
        // if dependencies are met
        
        currentTasks = newTasksGenerated.filter(t => t.status !== 'pending_dependency');
        pendingTasks.push(...newTasksGenerated.filter(t => t.status === 'pending_dependency'));

        if (currentTasks.length === 0 && pendingTasks.length === 0) {
            this.logSimulationEvent('info', `Iteration ${iterations}: No active tasks remain.`);
            break;
        }
    } // End while loop

    if (iterations >= MAX_ITERATIONS) {
         this.logSimulationEvent('warning', `Simulation reached maximum iterations (${MAX_ITERATIONS}). Halting.`);
         this.sharedState.setState('workflow.status', 'halted_max_iterations');
    } else {
        this.sharedState.setState('workflow.status', 'completed');
    }
    
    const endTime = Date.now();
    this.sharedState.setState('workflow.endTime', endTime);
    this.sharedState.setState('workflow.durationMs', endTime - startTime);
    this.sharedState.setState('workflow.llmCalls', this.llmCalls);
    this.sharedState.setState('workflow.totalUsage', this.totalUsage);
    
    this.logSimulationEvent('end', `Simulation finished with status: ${this.sharedState.getState('workflow.status')}. Duration: ${(endTime - startTime) / 1000}s`);

    return this.getFinalResults();
  }

  // Compile final results
  getFinalResults() {
      const allTasks = this.taskManager.getTasks();
      return {
          finalState: this.sharedState.getAllState(),
          tasks: allTasks.map(t => ({ // Summarize tasks for report
             id: t.id, title: t.title, status: t.status, 
             assignedAgentId: t.assignedToAgentId, assignedUnitId: t.assignedToUnitId,
             durationMs: t.completedAt && t.startedAt ? t.completedAt - t.startedAt : null,
             usage: t.usage, error: t.error, dependsOn: t.dependsOn
          })),
          simulationLog: this.simulationLog,
          agents: Array.from(this.agents.values()).map(a => ({ // Agent summary
              id: a.id, name: a.name, unitId: a.unitId, conversations: a.memory.conversations.length 
          }))
      };
  }

  /**
   * Helper function to run the planning phase of the simulation.
   * @private
   */
  async _runPlanningPhase(simulationState, taskManager, sharedState, workflow, unitsArray, initialTask) {
    if (!workflow.planningPhase) return; // Skip if no planning phase defined

    simulationState.workflow.planningPhase.status = "in_progress";
    this.logSimulationEvent("planning_phase_start", "Starting planning phase", {
      lead: workflow.planningPhase.lead,
      collaborator: workflow.planningPhase.collaborator
    });

    // Find planning units
    const leadUnit = unitsArray.find(u => u.name.toLowerCase() === workflow.planningPhase.lead.toLowerCase());
    const collaboratorUnit = unitsArray.find(u => u.name.toLowerCase() === workflow.planningPhase.collaborator.toLowerCase());

    if (!leadUnit || !collaboratorUnit) {
      throw new Error(`Planning phase units not found: ${workflow.planningPhase.lead} or ${workflow.planningPhase.collaborator}`);
    }

    // Create and process planning task
    const planningTask = taskManager.createTask({
      id: uuidv4(),
      title: "Create Implementation Plan",
      description: `Create an implementation plan for "${simulationState.topic}" with ${collaboratorUnit.name} unit. This plan will be the foundation for execution by other units.`,
      status: "pending",
      priority: "high",
      dependencies: [initialTask.id],
      created: new Date().toISOString(),
      assignedUnitId: leadUnit.id,
      metadata: { phase: "planning", collaboratorUnitId: collaboratorUnit.id }
    });
    taskManager.assignTask(planningTask.id, this.getAgentForUnit(leadUnit.id).id, leadUnit.id);
    simulationState.tasks.push(planningTask);
    
    const leadAgent = this.getAgentForUnit(leadUnit.id);
    const planningResult = await leadAgent.processTask(planningTask, sharedState, this.openaiClient);
    simulationState.llmCalls += 1;
    taskManager.updateTask(planningTask.id, { status: "completed", output: planningResult.output });

    // Create and process collaboration task
    const collaborationTask = taskManager.createTask({
      id: uuidv4(),
      title: "Review and Enhance Implementation Plan",
      description: `Review and provide operational enhancements to the implementation plan for "${simulationState.topic}" created by ${leadUnit.name}.`,
      status: "pending",
      priority: "high",
      dependencies: [planningTask.id],
      created: new Date().toISOString(),
      assignedUnitId: collaboratorUnit.id,
      metadata: { phase: "planning", collaborationType: "review", referencedTaskId: planningTask.id }
    });
    taskManager.assignTask(collaborationTask.id, this.getAgentForUnit(collaboratorUnit.id).id, collaboratorUnit.id);
    simulationState.tasks.push(collaborationTask);

    const collaboratorAgent = this.getAgentForUnit(collaboratorUnit.id);
    const collaborationResult = await collaboratorAgent.processTask(collaborationTask, sharedState, this.openaiClient);
    simulationState.llmCalls += 1;
    taskManager.updateTask(collaborationTask.id, { status: "completed", output: collaborationResult.output });

    // Finalize plan
    const finalPlan = {
      title: `Implementation Plan for ${simulationState.topic}`,
      leadContribution: planningResult.output,
      collaboratorContribution: collaborationResult.output,
      finalVersion: `FINAL IMPLEMENTATION PLAN FOR ${simulationState.topic.toUpperCase()}

` +
                     `Created by: ${leadUnit.name} with input from ${collaboratorUnit.name}

` +
                     `${planningResult.output}

` +
                     `OPERATIONAL ENHANCEMENTS:
${collaborationResult.output}`
    };
    sharedState.setState("implementation_plan", finalPlan);
    simulationState.outputs.push({ type: "implementation_plan", content: finalPlan, created: new Date().toISOString() });

    // Log collaboration
    simulationState.workflow.collaborations.push({
      phase: "planning",
      units: [leadUnit.name, collaboratorUnit.name],
      outputType: workflow.planningPhase.outputType || "implementation_plan",
      status: "completed"
    });

    simulationState.workflow.planningPhase.status = "completed";
    this.logSimulationEvent("planning_phase_complete", "Planning phase completed", {
      lead: leadUnit.name,
      collaborator: collaboratorUnit.name
    });
  }

  /**
   * Helper function to run the execution phase of the simulation.
   * @private
   */
  async _runExecutionPhase(simulationState, taskManager, sharedState, workflow, unitsArray, targetUnitsList) {
      if (!workflow.executionPhase) return; // Skip if no execution phase defined

      simulationState.workflow.executionPhase.status = "in_progress";
      this.logSimulationEvent("execution_phase_start", "Starting execution phase", {
          coordinator: workflow.executionPhase.coordinationUnit,
          targetUnits: targetUnitsList
      });

      // Find coordination unit
      const coordinationUnitName = workflow.executionPhase.coordinationUnit;
      const coordinationUnit = unitsArray.find(u => u.name.toLowerCase() === coordinationUnitName.toLowerCase());
      if (!coordinationUnit) {
          throw new Error(`Coordination unit not found: ${coordinationUnitName}`);
      }

      const executionTasks = [];
      const executionResults = [];

      // Process tasks for each target unit
      for (const [role, unitName] of Object.entries(workflow.executionPhase)) {
          if (role === 'coordinationUnit') continue; // Skip the coordinator

          const targetUnit = unitsArray.find(u => u.name.toLowerCase() === unitName.toLowerCase());
          if (!targetUnit) {
              this.logSimulationEvent("unit_not_found", `Target unit not found: ${unitName}`, { role });
              continue;
          }

          // Create and process execution task
          const executionTask = taskManager.createTask({
              id: uuidv4(),
              title: `${role} Task for ${simulationState.topic}`,
              description: `As the ${role} unit, implement your part of the plan for "${simulationState.topic}" according to the implementation plan. Focus on ${targetUnit.name}-specific responsibilities.`,
              status: "pending",
              priority: "high",
              dependencies: [], // Depends on planning phase completion (handled implicitly by phase order)
              created: new Date().toISOString(),
              assignedUnitId: targetUnit.id,
              metadata: { phase: "execution", role: role, implementationPlanReference: "implementation_plan" }
          });
          taskManager.assignTask(executionTask.id, this.getAgentForUnit(targetUnit.id).id, targetUnit.id);
          simulationState.tasks.push(executionTask);
          executionTasks.push(executionTask);

          const targetAgent = this.getAgentForUnit(targetUnit.id);
          const executionResult = await targetAgent.processTask(executionTask, sharedState, this.openaiClient);
          simulationState.llmCalls += 1;
          taskManager.updateTask(executionTask.id, { status: "completed", output: executionResult.output });

          executionResults.push({ role, unitName: targetUnit.name, output: executionResult.output });
          simulationState.workflow.collaborations.push({ phase: "execution", role: role, unit: targetUnit.name, status: "completed" });
      }

      // Create and process final coordination task
      const coordinationTask = taskManager.createTask({
          id: uuidv4(),
          title: "Coordinate Implementation Results",
          description: `Review and coordinate the implementation results from all units for "${simulationState.topic}". Create a consolidated implementation report.`,
          status: "pending",
          priority: "high",
          dependencies: executionTasks.map(t => t.id), // Depends on all execution tasks
          created: new Date().toISOString(),
          assignedUnitId: coordinationUnit.id,
          metadata: { phase: "execution", role: "coordinator", implementationResults: executionResults }
      });
      taskManager.assignTask(coordinationTask.id, this.getAgentForUnit(coordinationUnit.id).id, coordinationUnit.id);
      simulationState.tasks.push(coordinationTask);

      const coordinationAgent = this.getAgentForUnit(coordinationUnit.id);
      const coordinationResult = await coordinationAgent.processTask(coordinationTask, sharedState, this.openaiClient);
      simulationState.llmCalls += 1;
      taskManager.updateTask(coordinationTask.id, { status: "completed", output: coordinationResult.output });

      // Add final report
      const finalReport = {
          title: `Final Implementation Report for ${simulationState.topic}`,
          coordinator: coordinationUnit.name,
          unitContributions: executionResults,
          consolidatedReport: coordinationResult.output
      };
      simulationState.outputs.push({ type: "implementation_report", content: finalReport, created: new Date().toISOString() });

      simulationState.workflow.executionPhase.status = "completed";
      this.logSimulationEvent("execution_phase_complete", "Execution phase completed", {
          coordinator: coordinationUnit.name,
          targetUnits: targetUnitsList
      });
  }

  /**
   * Runs an enhanced simulation with support for multiple starting units and workflow phases.
   * @param {Object} options Simulation options
   * @param {string} options.simulationTopic The topic of simulation
   * @param {Array<string>} options.startUnits Array of unit names to start with
   * @param {Array<string>} options.targetUnits Array of unit names to involve
   * @param {Object} options.workflow Workflow configuration
   * @param {Object} options.initialTaskData Initial task data
   * @returns {Object} Simulation results
   */
  async runEnhancedSimulation(options = {}) {
    const { 
      simulationTopic, 
      startUnits = ["Strategy"], 
      targetUnits = [], 
      workflow = {},
      initialTaskData 
    } = options;
    
    // Initialize simulation state
    const simulationState = {
      topic: simulationTopic,
      startTime: new Date(),
      tasks: [],
      outputs: [],
      events: [],
      llmCalls: 0,
      status: "running",
      workflow: {
        planningPhase: { status: "pending" },
        executionPhase: { status: "pending" },
        collaborations: []
      }
    };
    
    this.logSimulationEvent("simulation_start", `Starting enhanced simulation: ${simulationTopic}`, {
      startUnits,
      targetUnits,
      hasWorkflow: Object.keys(workflow).length > 0
    });
    
    try {
      // Find units by name - convert units Map to Array first to use find()
      const unitsArray = Array.from(this.units.values());
      const startingUnitIds = startUnits.map(name => {
        const unit = unitsArray.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (!unit) {
          throw new Error(`Start unit not found: ${name}`);
        }
        return unit.id;
      });
      
      // Create Task Manager
      const taskManager = new TaskManager();
      
      // Create Shared State Manager
      const sharedState = new SharedStateManager();
      sharedState.setState("simulation_topic", simulationTopic);
      sharedState.setState("workflow_config", workflow);
      
      // Ensure initialTaskData has a title
      const initialTaskDataWithTitle = {
          ...initialTaskData,
          title: initialTaskData.name || initialTaskData.description || "Initial Simulation Task", // Add title, fallback to name/desc
          id: uuidv4(), // Ensure ID exists if not provided
          status: 'pending', // Ensure status exists
          created: new Date().toISOString() // Ensure created date exists
      };
      
      // Create initial task
      const initialTask = taskManager.createTask(initialTaskDataWithTitle);
      simulationState.tasks.push(initialTask);
      
      // PLANNING PHASE - Call helper function
      await this._runPlanningPhase(simulationState, taskManager, sharedState, workflow, unitsArray, initialTask);
      
      // EXECUTION PHASE - Call helper function
      await this._runExecutionPhase(simulationState, taskManager, sharedState, workflow, unitsArray, targetUnits);
      
      // Finalize simulation
      simulationState.status = "completed";
      simulationState.endTime = new Date();
      simulationState.durationMs = simulationState.endTime.getTime() - simulationState.startTime.getTime();
      
      this.logSimulationEvent("simulation_complete", `Simulation completed in ${simulationState.durationMs}ms`, {
        llmCalls: simulationState.llmCalls,
        tasks: simulationState.tasks.length,
        status: simulationState.status
      });
      
      // Return simulation results
      return {
        summary: {
          status: simulationState.status,
          durationMs: simulationState.durationMs,
          llmCalls: simulationState.llmCalls,
          startTime: simulationState.startTime.toISOString(),
          endTime: simulationState.endTime.toISOString()
        },
        tasks: simulationState.tasks,
        outputs: simulationState.outputs,
        events: simulationState.events,
        workflow: simulationState.workflow
      };
    } catch (error) {
      this.logSimulationEvent("simulation_error", `Error in simulation: ${error.message}`, { error: error.stack });
      
      // Update simulation state
      simulationState.status = "error";
      simulationState.error = error.message;
      simulationState.endTime = new Date();
      simulationState.durationMs = simulationState.endTime.getTime() - simulationState.startTime.getTime();
      
      // Return error result
      return {
        summary: {
          status: simulationState.status,
          error: simulationState.error,
          durationMs: simulationState.durationMs,
          llmCalls: simulationState.llmCalls,
          startTime: simulationState.startTime.toISOString(),
          endTime: simulationState.endTime.toISOString()
        },
        tasks: simulationState.tasks,
        outputs: simulationState.outputs,
        events: simulationState.events,
        workflow: simulationState.workflow
      };
    }
  }
}

/**
 * Execute the organizational units demo using the coordinator and simulation.
 * @param {Object} options Configuration options
 * @returns {Promise<Object>} Result of the demo execution
 */
async function demonstrateOrganizationalUnits(options = {}) {
  // Setup options with defaults
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const baseOutputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const simulationTopic = options.simulationTopic || "AI Integration Strategy";
  const model = options.model || DEFAULT_MODEL;
  const runId = options.runId || generateRunId();
  const outputDir = prepareRunDirectory(baseOutputDir, runId);
  
  // Initialize the log
  const logFile = path.join(outputDir, 'simulation.log');
  const logger = new Logger(logFile, { console: true, timestamp: true });

  logger.log(`Starting Organizational Units Demo (Run ID: ${runId})`);
  logger.log(`Simulation Topic: ${simulationTopic}`);
  logger.log(`Using Model: ${model}`);
  
  // Initialize OpenAI client if API key is provided
  let openaiClient = null;
  if (apiKey) {
    try {
      openaiClient = new OpenAIClient(apiKey);
      logger.log("OpenAI client initialized successfully.");
    } catch (error) {
      logger.warn(`Failed to initialize OpenAI client: ${error.message}. Continuing without LLM capabilities.`);
    }
  } else {
    logger.warn("No OpenAI API key provided. Continuing without LLM capabilities.");
  }

  // Track all discovered units
  const unitsMap = new Map();
  const relationships = [];

  // Load organizational units from the directory structure
  try {
    // Find the "units" directory (navigate from current file location)
    const currentDir = path.dirname(path.dirname(path.dirname(__filename))); // src/examples -> src -> operations
    const rootDir = path.resolve(currentDir, '..');
    const unitsDir = path.join(rootDir, 'units');
    
    // Try alternative paths if the first one doesn't exist
    let unitsDirToUse = unitsDir;
    if (!fs.existsSync(unitsDir)) {
      const altPath = path.resolve(__dirname, '../../units');
      if (fs.existsSync(altPath)) {
        unitsDirToUse = altPath;
        logger.log(`Using alternative units path: ${unitsDirToUse}`);
      } else {
        // Try one more path option
        const altPath2 = path.resolve(process.cwd(), 'units');
        if (fs.existsSync(altPath2)) {
          unitsDirToUse = altPath2;
          logger.log(`Using current working directory units path: ${unitsDirToUse}`);
        } else {
          logger.warn(`Units directory not found at ${unitsDir}. Please check your file structure.`);
          return {
            success: false,
            error: "Units directory not found",
            outputDir
          };
        }
      }
    }
    
    if (fs.existsSync(unitsDirToUse)) {
      logger.log(`Found units directory at: ${unitsDirToUse}`);
      logger.log("Loading organizational units from directory structure...");
      // Start recursive scan with parent ID null (top-level units)
      loadUnitsRecursive(unitsDirToUse, null, unitsMap, relationships, logger);
    } else {
      logger.warn(`Units directory not found at ${unitsDirToUse}. Please check your file structure.`);
      return {
        success: false,
        error: "Units directory not found",
        outputDir
      };
    }
  } catch (error) {
    logger.warn(`Error loading units: ${error.message}`);
    return {
      success: false,
      error: `Error loading units: ${error.message}`,
      outputDir
    };
  }
  
  // Convert Map to Array for easier handling
  const units = Array.from(unitsMap.values());

  // Parse Obsidian-style links from Markdown files to discover relationships
  units.forEach(unit => {
    if (unit.primaryMdPath) {
      parseObsidianLinks(unit.primaryMdPath, unit.id, relationships, logger);
    }
  });
  
  // Resolve relationship links (convert names to IDs)
  resolveRelationshipLinks(relationships, units, logger);
  
  // Save discovered structure to file
  const discoveredStructureFile = path.join(outputDir, 'discovered_structure.json');
  const discoveredStructure = {
    units,
    relationships,
    metadata: {
      timestamp: new Date().toISOString(),
      runId
    }
  };
  
  fs.writeFileSync(discoveredStructureFile, JSON.stringify(discoveredStructure, null, 2));
  logger.log(`Discovered organizational structure saved to: ${discoveredStructureFile}`);
  logger.log(`Discovered ${units.length} units and ${relationships.length} relationships.`);

  // Create a coordinator to handle the simulation
  const coordinator = new OrgCoordinator(units, relationships, openaiClient, model);
  
  // Initialize agents for each discovered unit
  coordinator.initializeAgents();

  // Initialize any simulation state
  const simulationResults = {
    runId,
    timestamp: new Date().toISOString(),
    topic: simulationTopic,
    summary: {
      status: "initialized",
      startTime: new Date().toISOString(),
      endTime: null,
      durationMs: null,
      llmCalls: 0
    }
  };
  
  // Set up workflow for units
  let startUnits = [];
  let targetUnitsList = [];
  let workflow = {};
  
  // Support new startWithUnits and workflow options
  if (options.startWithUnits && Array.isArray(options.startWithUnits)) {
    startUnits = options.startWithUnits;
    logger.log(`Starting with multiple units: ${startUnits.join(', ')}`);
  } else if (options.startUnitName) {
    // For backward compatibility
    startUnits = [options.startUnitName];
    logger.log(`Starting with single unit: ${options.startUnitName}`);
  } else {
    // Default to Strategy if nothing specified
    startUnits = ["Strategy"];
    logger.log(`No start unit specified, defaulting to Strategy`);
  }
  
  // Handle target units to include in simulation
  if (options.targetUnits && Array.isArray(options.targetUnits)) {
    targetUnitsList = options.targetUnits;
    logger.log(`Target units for simulation: ${targetUnitsList.join(', ')}`);
  }
  
  // Handle workflow configuration
  if (options.workflow) {
    workflow = options.workflow;
    logger.log(`Custom workflow configuration provided with ${Object.keys(workflow).length} phases`);
  }
  
  // Save initial configuration
  const configFile = path.join(outputDir, 'simulation_config.json');
  fs.writeFileSync(configFile, JSON.stringify({
    simulationTopic,
    startUnits,
    targetUnits: targetUnitsList,
    workflow,
    model,
    initialTaskDescription: options.initialTaskDescription,
    runId,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  // Run the simulation based on provided options and discovery
  try {
    // Create the initial task data
    const initialTaskData = {
      id: uuidv4(),
      title: "Initial Task",
      description: options.initialTaskDescription || `Analyze and respond to: ${simulationTopic}`,
      status: "pending",
      priority: "high",
      dependencies: [],
      created: new Date().toISOString(),
      metadata: {
        topic: simulationTopic,
        isRoot: true
      }
    };
    
    logger.log("Running multi-agent simulation with discovered organizational structure...");
  
    // Start simulation with new multi-unit and workflow support
    const simulationResult = await coordinator.runEnhancedSimulation({
      simulationTopic,
      startUnits,
      targetUnits: targetUnitsList, 
      workflow,
      initialTaskData
    });
    
    // Update simulation results with data from coordinator
    simulationResults.summary = {
      ...simulationResults.summary,
      ...simulationResult.summary,
      endTime: new Date().toISOString(),
      durationMs: new Date().getTime() - new Date(simulationResults.summary.startTime).getTime()
    };
    
    simulationResults.tasks = simulationResult.tasks || [];
    simulationResults.outputs = simulationResult.outputs || [];
    simulationResults.events = simulationResult.events || [];
    simulationResults.workflow = simulationResult.workflow || {};
    
    // Save final results
    const resultsFile = path.join(outputDir, 'simulation_results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(simulationResults, null, 2));
    logger.log(`Simulation completed. Results saved to: ${resultsFile}`);

    // Generate visualization if time permits (simplified for demo)
    try {
      const visualizationFile = path.join(outputDir, 'org_structure.html');
      const visualizationContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Organizational Structure Visualization</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .unit { border: 1px solid #ccc; padding: 10px; margin: 5px; }
            .relationship { margin: 5px; color: #666; }
            h1, h2 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Organizational Structure - ${simulationTopic}</h1>
          <h2>Units (${units.length})</h2>
          <div id="units">
            ${units.map(u => `
              <div class="unit">
                <strong>${u.name}</strong>
                <p>${u.description}</p>
              </div>
            `).join('')}
          </div>
          <h2>Relationships (${relationships.length})</h2>
          <div id="relationships">
            ${relationships.map(r => `
              <div class="relationship">
                <span>${units.find(u => u.id === r.sourceUnitId)?.name || 'Unknown'}</span>
                → 
                <span>${units.find(u => u.id === r.targetUnitId)?.name || r.targetUnitName || 'Unknown'}</span>
                (${r.type}): ${r.description}
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;
      fs.writeFileSync(visualizationFile, visualizationContent);
      logger.log(`Simulation visualization saved to: ${visualizationFile}`);
    } catch (error) {
      logger.warn(`Error generating visualization: ${error.message}`);
    }

    return {
      success: true,
      results: simulationResults,
      discoveredStructure: discoveredStructure,
      outputDir
    };
  } catch (error) {
    logger.error(`Error running simulation: ${error.message}`);
    return {
      success: false,
      error: error.message,
      discoveredStructure: discoveredStructure,
      outputDir
    };
  }
}

// Export the main function and potentially helpers
module.exports = {
  demonstrateOrganizationalUnits,
  generateRunId, // Keep utility functions if needed elsewhere
  prepareRunDirectory
};