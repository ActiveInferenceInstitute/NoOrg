/**
 * Logger for capturing and organizing application outputs
 * 
 * Handles:
 * - Log message writing to files and console
 * - JSON and Markdown file saving
 * - LLM call tracking and visualization
 * - Mermaid diagram generation
 */

const fs = require('fs');
const path = require('path');

/**
 * Logger for capturing all outputs in a structured way
 */
class Logger {
  /**
   * Create a new Logger
   * @param {string} runDir - Directory to save all outputs
   * @param {Object} options - Configuration options
   */
  constructor(runDir, options = {}) {
    this.runDir = runDir;
    this.logFile = path.join(runDir, options.logFile || 'execution.log');
    this.ensureDirectoryExists(runDir);
    this.llmCalls = []; // To store LLM call info for diagram
    this.currentStepName = options.initialStep || 'Initialization'; // Track current step for LLM calls
    
    // Initialize log file
    const timestamp = new Date().toISOString();
    const header = options.header || `=== Operation Log - ${timestamp} ===`;
    fs.writeFileSync(this.logFile, `${header}\n\n`);
    
    // Keep track of token usage
    this.tokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    };
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   * @param {string} dir - Directory path
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
  
  /**
   * Log a message to the log file and console
   * @param {string} message - Message to log
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
    console.log(message);
    
    return this; // For method chaining
  }
  
  /**
   * Log a warning message to the log file and console
   * @param {string} message - Warning message to log
   */
  warn(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ⚠️ WARNING: ${message}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
    console.warn(`⚠️ WARNING: ${message}`);
    
    return this; // For method chaining
  }
  
  /**
   * Log the start of a workflow step
   * @param {string} stepName - Name of the step
   * @param {string} details - Optional step details
   */
  logStep(stepName, details) {
    this.currentStepName = stepName; // Update current step name
    this.log(`\n=== STEP: ${stepName} ===`);
    if (details) {
      this.log(details);
    }
    
    return this; // For method chaining
  }
  
  /**
   * Log an LLM API call with prompt and response details
   * @param {string} prompt - The prompt sent to the LLM
   * @param {Object} response - The response from the LLM
   * @param {Object} options - Additional logging options
   */
  logLLMCall(prompt, response, options = {}) {
    this.log(`\n--- LLM Call ---`);
    this.log(`Step: ${this.currentStepName}`);
    this.log(`Prompt Length: ${prompt.length} chars`);
    this.log(`Response Length: ${response.content.length} chars`);
    this.log(`Usage: ${JSON.stringify(response.usage)}`);
    
    // Store call details for diagram
    this.llmCalls.push({
      step: this.currentStepName,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      model: response.model,
      timestamp: Date.now()
    });
    
    // Update token usage
    this.tokenUsage.promptTokens += response.usage.prompt_tokens;
    this.tokenUsage.completionTokens += response.usage.completion_tokens;
    this.tokenUsage.totalTokens += response.usage.total_tokens;
    
    // Save full prompt and response
    const callTimestamp = Date.now();
    const fileName = options.fileName || 
                     `llm_call_${this.currentStepName.replace(/\s+/g, '_')}_${callTimestamp}`;
    
    this.saveJSON(fileName, {
      step: this.currentStepName,
      prompt,
      response: response.content,
      model: response.model,
      usage: response.usage
    });
    
    return this; // For method chaining
  }
  
  /**
   * Log an operation result and save its data
   * @param {string} name - Name of the result
   * @param {Object} data - Result data
   */
  logResult(name, data) {
    this.log(`\n--- Result: ${name} ---`);
    this.saveJSON(name, data);
    
    // If data has fullContent, save it as markdown
    if (data.fullContent && typeof data.fullContent === 'string') {
      this.saveMarkdown(`${name}_content`, data.fullContent);
    }
    
    return this; // For method chaining
  }
  
  /**
   * Save data as a JSON file
   * @param {string} filename - Base filename (without extension)
   * @param {Object} data - Data to save
   */
  saveJSON(filename, data) {
    const filePath = path.join(this.runDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    this.log(`Saved JSON to ${filePath}`);
    return filePath;
  }
  
  /**
   * Save text as a Markdown file
   * @param {string} filename - Base filename (without extension)
   * @param {string} text - Content to save
   */
  saveMarkdown(filename, text) {
    const filePath = path.join(this.runDir, `${filename}.md`);
    fs.writeFileSync(filePath, text);
    this.log(`Saved Markdown to ${filePath}`);
    return filePath;
  }

  /**
   * Save Mermaid diagram as a Markdown file
   * @param {string} filename - Base filename (without extension)
   * @param {string} title - Diagram title
   * @param {string} mermaidSyntax - Mermaid diagram syntax
   */
  saveMermaid(filename, title, mermaidSyntax) {
    const mdContent = `# ${title}\n\n\`\`\`mermaid\n${mermaidSyntax}\n\`\`\`\n`;
    return this.saveMarkdown(filename, mdContent);
  }
  
  /**
   * Generate and save a summary of token usage
   */
  summarizeTokenUsage() {
    this.log(`\n=== Token Usage Summary ===`);
    this.log(`Prompt Tokens: ${this.tokenUsage.promptTokens}`);
    this.log(`Completion Tokens: ${this.tokenUsage.completionTokens}`);
    this.log(`Total Tokens: ${this.tokenUsage.totalTokens}`);
    
    this.saveJSON('token_usage_summary', this.tokenUsage);
    return this.tokenUsage;
  }

  /**
   * Generate a Mermaid diagram for organizational structure
   * @param {Array} units - Array of organizational units
   * @param {Array} relationships - Array of relationships between units
   */
  generateOrgStructureDiagram(units, relationships) {
    let mermaid = 'graph TD\n';
    units.forEach(unit => {
      mermaid += `  ${unit.id}["${unit.name}\n(${unit.description.substring(0, 30)}...)"]`;
      mermaid += '\n';
    });
    
    relationships.forEach(rel => {
      const source = units.find(u => u.name === rel.sourceUnit);
      const target = units.find(u => u.name === rel.targetUnit);
      if (source && target) {
        mermaid += `  ${source.id} --"${rel.type}: ${rel.description.substring(0, 20)}..."--> ${target.id}`;
        mermaid += '\n';
      }
    });
    
    return this.saveMermaid('organization_structure_diagram', 'Organizational Structure', mermaid);
  }

  /**
   * Generate a Mermaid sequence diagram of LLM calls
   */
  generateLLMCallsDiagram() {
    let mermaid = 'sequenceDiagram\n';
    mermaid += '  participant Script\n';
    mermaid += '  participant OpenAI_API\n';
    
    this.llmCalls.forEach((call, index) => {
      mermaid += `  Script->>+OpenAI_API: Request ${index + 1} (${call.step}) P:${call.promptTokens} T\n`;
      mermaid += `  OpenAI_API-->>-Script: Response ${index + 1} (${call.model}) C:${call.completionTokens} T\n`;
    });
    
    return this.saveMermaid('llm_calls_diagram', 'LLM Call Sequence', mermaid);
  }

  /**
   * Generate a Mermaid workflow diagram
   * @param {Array} workflowSteps - Array of workflow steps
   */
  generateWorkflowDiagram(workflowSteps) {
    let mermaid = 'graph TD\n';
    const stepMap = new Map();
    
    workflowSteps.forEach((step, index) => {
      stepMap.set(index, step.id);
      mermaid += `  ${step.id}["${step.name}\n(${step.status})"]`;
      mermaid += '\n';
    });
    
    workflowSteps.forEach((step, index) => {
      step.dependsOn.forEach(depIndex => {
        const sourceId = stepMap.get(depIndex);
        if (sourceId) {
          mermaid += `  ${sourceId} --> ${step.id}`;
          mermaid += '\n';
        }
      });
    });
    
    return this.saveMermaid('workflow_diagram', 'Workflow Steps', mermaid);
  }
}

module.exports = Logger; 