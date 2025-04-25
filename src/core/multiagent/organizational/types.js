const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Represents an organizational unit discovered from the filesystem.
 */
class OrganizationalUnit {
  constructor({
    id = uuidv4(),
    name,
    description = '',
    capabilities = [],
    documents = [],
    relationships = [],
    path,
    parentId = null,
    primaryMdPath = null,
  }) {
    if (!name || !path) {
      throw new Error('OrganizationalUnit requires at least a name and path.');
    }
    this.id = id;
    this.name = name;
    this.description = description;
    this.capabilities = capabilities; // e.g., ['budgeting', 'risk_assessment']
    this.documents = documents; // Array of paths to relevant unit documents
    this.relationships = relationships; // Array of { targetUnitId, type } objects
    this.path = path; // Filesystem path
    this.parentId = parentId; // ID of parent unit in hierarchy
    this.primaryMdPath = primaryMdPath; // Path to primary markdown file (e.g., README.md)
  }
}

/**
 * Represents an LLM-powered agent acting on behalf of an OrganizationalUnit.
 */
class UnitAgent {
  constructor({
    id = uuidv4(),
    unit, // The OrganizationalUnit instance this agent represents
    memory = { conversations: [], knowledge: {} },
    llmClient = null, // Inject LLM Client dependency
  }) {
    if (!unit || !(unit instanceof OrganizationalUnit)) {
      throw new Error('UnitAgent requires a valid OrganizationalUnit instance.');
    }
    this.id = id;
    this.unitId = unit.id;
    this.name = `${unit.name} Agent`;
    this.unitInfo = unit; // Keep a reference to the unit's data
    this.capabilities = unit.capabilities;
    this.memory = memory; 
    this.llmClient = llmClient; // Store the LLM client instance
  }

  /**
   * Process a task using LLM, tailored to the organizational unit context.
   * @param {Task} task - The task object.
   * @param {SharedStateManager} sharedState - Access to shared workflow state.
   * @returns {Promise<object>} - Details of the LLM call and result: { content, usage, error, requestMessages }
   */
  async processTask(task, sharedState) { // Removed llmClient from args, use this.llmClient
    if (!this.llmClient) {
      this.log('warn', `LLM Client not available for agent ${this.name}. Returning placeholder.`);
      return {
        content: `[LLM SKIPPED - No Client] Placeholder output from ${this.name} for task ${task.id}`,
        usage: null,
        error: 'LLM Client not configured',
        requestMessages: [],
      };
    }

    this.log('info', `Processing task: ${task.title}`);

    // --- Prompt Construction --- 
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(task, sharedState);
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    // --- LLM Call --- 
    let response = { content: '[Error during LLM call]', usage: null, error: 'Unknown LLM error', requestMessages: messages, fullResponse: null };
    try {
        // Use the injected LLM client
        // Adapt parameters based on task or agent config if needed
        const llmResponse = await this.llmClient.sendMessages(messages, {
             model: task.model, // Or use a default from agent/system config
             max_tokens: task.maxTokens || 2000, 
             temperature: task.temperature || 0.6, 
        }); 
        
        response = {
            content: llmResponse.content,
            usage: llmResponse.usage,
            error: llmResponse.error,
            requestMessages: messages, // Record what was actually sent
            fullResponse: llmResponse.fullResponse, // Store the raw response if needed
        };
        this.log('info', `Received LLM response (${response.usage?.total_tokens || 'N/A'} tokens).`);

    } catch (error) {
        this.log('error', `LLM call failed for task ${task.id}: ${error.message}`);
        response.error = error.message;
        response.content = `[LLM Call Failed: ${error.message}]`;
    }
    
    // --- Memory Update (Optional) ---
    this.memory.conversations.push({
        taskId: task.id,
        request: messages,
        response: response.content,
        usage: response.usage,
        error: response.error,
        timestamp: new Date().toISOString(),
    });

    return response; // Return the structured result
  }

  // Helper to build the system prompt
  _buildSystemPrompt() {
    // Include key unit information
    return `You are an AI agent representing the ${this.unitInfo.name} organizational unit.
Unit Description: ${this.unitInfo.description}
Unit Capabilities: ${this.capabilities?.join(', ') || 'N/A'}.
Focus your response entirely on fulfilling the task based on your unit's role and capabilities, using the provided context and input.
Provide a detailed, professional, and well-structured response appropriate for inter-unit communication or action. Output only the required content for the task.`;
  }

  // Helper to build the user prompt
  _buildUserPrompt(task, sharedState) {
    // Access shared state if needed (e.g., overall goal)
    const overallGoal = sharedState.getState('workflow.goal', 'an organizational objective');
    const currentPlanSnapshot = task.input?.currentPlanSnapshot || "(No current plan snapshot provided)";
    const previousTaskOutput = task.input?.previousTaskOutput || "(No output from previous step provided)";

    // TODO: Add retrieval of relevant unit document summaries/snippets here if implementing RAG
    const unitContext = `Key documents for ${this.unitInfo.name} unit include: ${this.unitInfo.documents?.slice(0, 5).map(p => path.basename(p)).join(', ') || 'N/A'}.`; // Basic context

    return `WORKFLOW GOAL: ${overallGoal}
UNIT CONTEXT (${this.unitInfo.name}): ${unitContext}

TASK ID: ${task.id}
TASK DESCRIPTION: ${task.description}

INPUT FROM PREVIOUS STEP:
---
${previousTaskOutput}
---

CURRENT PLAN SNAPSHOT:
---
${currentPlanSnapshot}
---

Please execute this task based on the role and capabilities of the ${this.unitInfo.name} unit. Update or add the relevant section(s) to the plan based on the task description and the provided input/context.`;
  }
  
  // Simple internal logging helper
  log(level, message) {
      const prefix = `[Agent: ${this.name}]`;
      if (level === 'error') console.error(`${prefix} ERROR: ${message}`);
      else if (level === 'warn') console.warn(`${prefix} WARN: ${message}`);
      else console.log(`${prefix} INFO: ${message}`);
  }
}

/**
 * Represents a task within a workflow.
 */
class Task {
  constructor({
    id = uuidv4(),
    title,
    description,
    status = 'pending', // pending, assigned, processing, completed, failed, deferred
    priority = 'medium',
    assignedToUnitId = null,
    assignedToAgentId = null,
    dependsOn = [], // Array of task IDs
    input = {}, // Data/context needed to perform the task
    output = null, // Result produced by the agent
    metadata = {}, // Workflow phase, role, etc.
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    startedAt = null,
    completedAt = null,
    error = null,
    usage = null, // LLM token usage
  }) {
    if (!title || !description) {
      throw new Error('Task requires a title and description.');
    }
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.assignedToUnitId = assignedToUnitId;
    this.assignedToAgentId = assignedToAgentId;
    this.dependsOn = dependsOn;
    this.input = input;
    this.output = output;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.error = error;
    this.usage = usage;
  }
}

/**
 * Represents the evolving plan document.
 */
class PlanDocument {
    constructor({
        id = uuidv4(),
        title,
        version = 1,
        sections = [], // Array of { title, content, createdByUnitId, lastUpdated }
        status = 'draft', // draft, in_review, final
        createdAt = new Date().toISOString(),
        lastUpdatedAt = new Date().toISOString(),
    }) {
        if (!title) {
            throw new Error('PlanDocument requires a title.');
        }
        this.id = id;
        this.title = title;
        this.version = version;
        this.sections = sections;
        this.status = status;
        this.createdAt = createdAt;
        this.lastUpdatedAt = lastUpdatedAt;
    }

    addOrUpdateSection({ sectionTitle, content, unitId }) {
        const existingIndex = this.sections.findIndex(s => s.title === sectionTitle);
        const timestamp = new Date().toISOString();
        if (existingIndex > -1) {
            this.sections[existingIndex].content = content;
            this.sections[existingIndex].lastUpdated = timestamp;
            this.sections[existingIndex].updatedByUnitId = unitId; // Track who updated it last
        } else {
            this.sections.push({
                title: sectionTitle,
                content: content,
                createdByUnitId: unitId,
                lastUpdated: timestamp,
            });
        }
        this.version += 1; // Increment version on change
        this.lastUpdatedAt = timestamp;
        console.log(`📄 PlanDocument section "${sectionTitle}" added/updated by Unit ${unitId}. New version: ${this.version}`);
    }

    getSection(sectionTitle) {
        return this.sections.find(s => s.title === sectionTitle);
    }

    getFullContent() {
        // Simple concatenation for now, could be more structured
        return this.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    }
}


module.exports = {
  OrganizationalUnit,
  UnitAgent,
  Task,
  PlanDocument,
}; 