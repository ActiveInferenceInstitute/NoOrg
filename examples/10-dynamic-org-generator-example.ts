/**
 * Example 10: Dynamic Organization Generator
 * 
 * This example demonstrates:
 * - Converting natural language descriptions into organizational structures
 * - Dynamically generating organization charts and workflows
 * - Using LLM to interpret organizational needs and create structures
 * - Executing tasks through the dynamic organization
 */

import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../src/core/multiagent/LLMClientInterface';
import { WorkflowEngine, ILogger } from '../src/core/units/workflow/WorkflowEngine';
import { EventSystem } from '../src/core/events/EventSystem';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import axios from 'axios';

// User configuration for organization and task (moved back to global scope)
const USER_CONFIG = {
  // Natural language description of the desired organizational structure
  ORGANIZATION_DESCRIPTION: "Design an organization literally shaped like a lollipop. It should feature a 'stick' composed of several vertically nested hierarchical layers for core production and support functions (e.g., supply chain, HR, finance). The 'candy' top layer should be a hub-and-spoke structure with a central coordination unit connected to 6 distinct operational spokes responsible for different aspects of lollipop creation (e.g., flavor R&D, candy making, stick production, wrapping & packaging, quality assurance, marketing & sales).",
  
  // Task for the organization to execute
  ORGANIZATION_TASK: "Design, produce, and package a new line of gourmet lollipops, focusing on unique flavor combinations and high-quality ingredients.",
  // Additional configuration parameters
  LLM_CONFIG: {
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4o',
    FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
    TOKEN_LIMIT_THRESHOLD: 8000,
    DEFAULT_MAX_TOKENS: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000
  }
};

// IMPORTANT: Initialization function to avoid global variable issues
function initializeDynamicOrgGenerator() {
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  // Verify API key loading
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  } else {
    // Hide full key in logs but show enough to verify it's loading
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`OPENAI_API_KEY loaded: ${maskedKey}`);
  }

  // Create run-specific output folder with unique prefix
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const runId = `dynamic-org-generator-${timestamp}`;
  // Use absolute path to ensure correct location
  const outputDir = path.resolve(__dirname, '../output', runId);
  
  console.log(`Output will be saved to: ${outputDir}`);

  return { outputDir, apiKey };
}

// Use the existing FileLogger class for compatibility
class FileLogger implements ILogger {
  private logFile: string;
  
  constructor(filename: string) {
    this.logFile = filename;
    // Create log directory if it doesn't exist
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Initialize log file
    fs.writeFileSync(this.logFile, `=== Dynamic Organization Generator - ${new Date().toISOString()} ===\n\n`);
  }
  
  log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.log(message);
    fs.appendFileSync(this.logFile, `[LOG] ${message}\n`);
  }
  
  error(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.error(`ERROR: ${message}`);
    fs.appendFileSync(this.logFile, `[ERROR] ${message}\n`);
  }
  
  info(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.info(`INFO: ${message}`);
    fs.appendFileSync(this.logFile, `[INFO] ${message}\n`);
  }
  
  warn(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.warn(`WARN: ${message}`);
    fs.appendFileSync(this.logFile, `[WARN] ${message}\n`);
  }
}

// Simple logger factory function
function createLogger(name: string, level: string, options: { console: boolean, file: string }) {
  return new FileLogger(options.file);
}

// Define interfaces
interface Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  process: (input: any, context: WorkflowContext) => Promise<any>;
}

interface WorkflowContext {
  config: typeof USER_CONFIG & {
    OUTPUT_DIR?: string;
    OPENAI_API_KEY?: string;
    PROJECT_ID?: string;
    VERSION?: string;
    ORGANIZATION?: string;
  };
  outputs: Record<string, any>;
  currentStage?: string;
  logger: FileLogger;
  eventSystem: EventSystem;
  startTime: number;
  metrics: {
    stageMetrics: Record<string, {
      startTime: number;
      endTime?: number;
      duration?: number;
      agentType: string;
    }>;
  };
}

interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  unit: OrganizationalUnit;
  agent: Agent;
  prepareInput: (context: WorkflowContext) => any;
  dependencies: string[];
  outputKey: string;
}

// Define the structure for the organization schema that the LLM will generate
interface OrganizationSchema {
  name: string;
  description: string;
  units: {
    id: string;
    name: string;
    description: string;
    roles: {
      id: string;
      name: string;
      description: string;
      responsibilities: string[];
    }[];
  }[];
  workflows: {
    id: string;
    name: string;
    description: string;
    stages: {
      id: string;
      name: string;
      description: string;
      unitId: string;
      roleId: string;
      dependencies: string[];
    }[];
  }[];
}

// LLM-based agent
class LLMAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  systemPrompt: string;
  private llm: OpenAIClient;
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    systemPrompt: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt;
    
    // Ensure API key is set correctly
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    // Initialize the OpenAI client with the API key from environment variables
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`LLMAgent ${this.name} processing input`);
    
    // Process the input to ensure it's not too large
    let processedInput = input;
    if (typeof input !== 'string') {
      processedInput = JSON.stringify(processedInput, null, 2);
    }
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt
      },
      {
        role: 'user',
        content: processedInput
      }
    ];
    
    // Check if the input exceeds token limits (approximate calculation)
    const estimatedTokens = JSON.stringify(messages).length / 4; // Rough estimate: 4 chars ~= 1 token
    const config = context.config.LLM_CONFIG || {
      DEFAULT_MODEL: 'gpt-4o',
      FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
      TOKEN_LIMIT_THRESHOLD: 7000
    };
    
    const useDefaultModel = estimatedTokens < config.TOKEN_LIMIT_THRESHOLD;
    const modelToUse = useDefaultModel ? config.DEFAULT_MODEL : config.FALLBACK_MODEL;
    
    logger.info(`Using model ${modelToUse} for request with estimated ${estimatedTokens} tokens`);
    
    // Create the intermediates directory if it doesn't exist
    const intermediatesDir = path.join(context.config.OUTPUT_DIR || '', 'intermediates');
    fs.ensureDirSync(intermediatesDir);
    
    // Save the raw input to a file
    const inputFilename = `${this.id}_${Date.now()}_input.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, inputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        input: processedInput
      }, null, 2)
    );
    
    try {
      // Request completion from OpenAI
      const responseStartTime = Date.now();
      logger.info(`Sending request to ${modelToUse}`);
      
      // Fix the parameters for OpenAI client - pass messages array first, then options object
      const completion = await this.llm.createChatCompletion(messages, {
        model: modelToUse,
        temperature: 0.7,
        max_tokens: config.DEFAULT_MAX_TOKENS || 2000,
      });
      
      const responseTime = Date.now() - responseStartTime;
      logger.info(`Response received in ${responseTime}ms`);
      
      // Save the raw output to a file
      const outputFilename = `${this.id}_${Date.now()}_output.json`;
      fs.writeFileSync(
        path.join(intermediatesDir, outputFilename),
        JSON.stringify({
          agent: this.name,
          timestamp: new Date().toISOString(),
          model: modelToUse,
          response_time_ms: responseTime,
          completion: completion
        }, null, 2)
      );
      
      // Parse JSON if the response contains JSON
      let result = completion.choices[0].message.content || '';
      
      // Try to extract JSON if it's wrapped in markdown code blocks
      if (result.includes('```json')) {
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            result = JSON.parse(jsonMatch[1]);
            logger.info('Successfully extracted and parsed JSON from markdown code block');
          } catch (e) {
            logger.warn('Failed to parse JSON from markdown block, returning raw text');
          }
        }
      } else if (result.startsWith('{') || result.startsWith('[')) {
        // If it looks like plain JSON, try to parse it directly
        try {
          result = JSON.parse(result);
          logger.info('Successfully parsed JSON response');
        } catch (e) {
          logger.warn('Response looks like JSON but failed to parse, returning raw text');
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Error in LLM processing: ${error}`);
      throw error;
    }
  }
}

// Visualization agent for organization charts
class VisualizationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  visualizationType: 'org-chart' | 'workflow-diagram';
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    visualizationType: 'org-chart' | 'workflow-diagram';
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.visualizationType = config.visualizationType;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`VisualizationAgent ${this.name} processing input`);
    
    // Create visualization directories
    const visualizationsDir = path.join(context.config.OUTPUT_DIR || '', 'visualizations');
    fs.ensureDirSync(visualizationsDir);
    
    try {
      if (this.visualizationType === 'org-chart') {
        return this.generateOrgChart(input, context);
      } else if (this.visualizationType === 'workflow-diagram') {
        return this.generateWorkflowDiagram(input, context);
      } else {
        throw new Error(`Unsupported visualization type: ${this.visualizationType}`);
      }
    } catch (error) {
      logger.error(`Error in visualization generation: ${error}`);
      throw error;
    }
  }
  
  private generateOrgChart(orgStructure: OrganizationSchema, context: WorkflowContext): any {
    const logger = context.logger;
    logger.info('Generating organization chart');
    
    // Create mermaid org chart
    let mermaidDiagram = 'graph TD;\n';
    
    // Add organization node
    mermaidDiagram += `    org["${orgStructure.name}"]\n`;
    mermaidDiagram += `    style org fill:#f9f9f9,stroke:#333,stroke-width:2px\n`;
    
    // Add units
    for (const unit of orgStructure.units) {
      mermaidDiagram += `    ${unit.id}["${unit.name}"]\n`;
      mermaidDiagram += `    style ${unit.id} fill:#e3f2fd,stroke:#1565c0,stroke-width:1px\n`;
      mermaidDiagram += `    org --> ${unit.id}\n`;
      
      // Add roles within each unit
      for (const role of unit.roles) {
        mermaidDiagram += `    ${role.id}["${role.name}"]\n`;
        mermaidDiagram += `    style ${role.id} fill:#f5f5f5,stroke:#666,stroke-width:1px\n`;
        mermaidDiagram += `    ${unit.id} --> ${role.id}\n`;
      }
    }
    
    // Write to file
    const mermaidFilePath = path.join(context.config.OUTPUT_DIR || '', 'visualizations', 'org_chart.mmd');
    fs.writeFileSync(mermaidFilePath, mermaidDiagram);
    
    // Generate HTML with embedded mermaid
    const htmlContent = this.createOrgChartHtml(orgStructure, mermaidDiagram);
    const htmlFilePath = path.join(context.config.OUTPUT_DIR || '', 'visualizations', 'org_chart.html');
    fs.writeFileSync(htmlFilePath, htmlContent);
    
    return {
      organization: orgStructure.name,
      units: orgStructure.units.length,
      roles: orgStructure.units.reduce((count, unit) => count + unit.roles.length, 0),
      mermaid_file: mermaidFilePath,
      html_file: htmlFilePath
    };
  }
  
  private generateWorkflowDiagram(workflow: any, context: WorkflowContext): any {
    const logger = context.logger;
    logger.info('Generating workflow diagram');
    
    // Create mermaid workflow diagram
    let mermaidDiagram = 'graph TD;\n';
    
    // Add nodes for each stage
    for (const stage of workflow.stages) {
      const unitInfo = workflow.units.find((u: any) => u.id === stage.unitId);
      const unitName = unitInfo ? unitInfo.name : 'Unknown Unit';
      
      mermaidDiagram += `    ${stage.id}["${stage.name}<br/>(${unitName})"]\n`;
      mermaidDiagram += `    style ${stage.id} fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px\n`;
    }
    
    // Add edges for dependencies
    for (const stage of workflow.stages) {
      for (const depId of stage.dependencies) {
        mermaidDiagram += `    ${depId} --> ${stage.id}\n`;
      }
    }
    
    // Write to file
    const mermaidFilePath = path.join(context.config.OUTPUT_DIR || '', 'visualizations', 'workflow_diagram.mmd');
    fs.writeFileSync(mermaidFilePath, mermaidDiagram);
    
    // Generate HTML with embedded mermaid
    const htmlContent = this.createWorkflowHtml(workflow, mermaidDiagram);
    const htmlFilePath = path.join(context.config.OUTPUT_DIR || '', 'visualizations', 'workflow_diagram.html');
    fs.writeFileSync(htmlFilePath, htmlContent);
    
    return {
      workflow: workflow.name,
      stages: workflow.stages.length,
      mermaid_file: mermaidFilePath,
      html_file: htmlFilePath
    };
  }
  
  private createOrgChartHtml(orgStructure: OrganizationSchema, mermaidDiagram: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${orgStructure.name} - Organization Chart</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
    .container { max-width: 1200px; margin: 0 auto; }
    .diagram-container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .org-info { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .units-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .unit-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: white; }
    .unit-header { background: #e3f2fd; padding: 10px; border-radius: 5px 5px 0 0; margin: -15px -15px 15px -15px; }
    .role-card { border: 1px solid #eee; border-radius: 5px; padding: 10px; margin-top: 10px; background: #f5f5f5; }
    h1, h2, h3 { color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${orgStructure.name}</h1>
      <p>${orgStructure.description}</p>
    </div>
    
    <div class="diagram-container">
      <h2>Organization Chart</h2>
      <div class="mermaid">
${mermaidDiagram}
      </div>
    </div>
    
    <div class="org-info">
      <h2>Organization Details</h2>
      <p><strong>Organization:</strong> ${orgStructure.name}</p>
      <p><strong>Description:</strong> ${orgStructure.description}</p>
      <p><strong>Units:</strong> ${orgStructure.units.length}</p>
      <p><strong>Total Roles:</strong> ${orgStructure.units.reduce((count, unit) => count + unit.roles.length, 0)}</p>
    </div>
    
    <h2>Units & Roles</h2>
    <div class="units-container">
      ${orgStructure.units.map(unit => `
        <div class="unit-card">
          <div class="unit-header">
            <h3>${unit.name}</h3>
          </div>
          <p>${unit.description}</p>
          <h4>Roles:</h4>
          ${unit.roles.map(role => `
            <div class="role-card">
              <h5>${role.name}</h5>
              <p>${role.description}</p>
              <p><strong>Responsibilities:</strong></p>
              <ul>
                ${role.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>`;
  }
  
  private createWorkflowHtml(workflow: any, mermaidDiagram: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${workflow.name} - Workflow Diagram</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
    .container { max-width: 1200px; margin: 0 auto; }
    .diagram-container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .workflow-info { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .stages-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .stage-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: white; }
    .stage-header { background: #e8f5e9; padding: 10px; border-radius: 5px 5px 0 0; margin: -15px -15px 15px -15px; }
    h1, h2, h3 { color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${workflow.name}</h1>
      <p>${workflow.description}</p>
    </div>
    
    <div class="diagram-container">
      <h2>Workflow Diagram</h2>
      <div class="mermaid">
${mermaidDiagram}
      </div>
    </div>
    
    <div class="workflow-info">
      <h2>Workflow Details</h2>
      <p><strong>Name:</strong> ${workflow.name}</p>
      <p><strong>Description:</strong> ${workflow.description}</p>
      <p><strong>Stages:</strong> ${workflow.stages.length}</p>
    </div>
    
    <h2>Workflow Stages</h2>
    <div class="stages-container">
      ${workflow.stages.map((stage: any) => {
        const unitInfo = workflow.units.find((u: any) => u.id === stage.unitId);
        return `
          <div class="stage-card">
            <div class="stage-header">
              <h3>${stage.name}</h3>
            </div>
            <p>${stage.description}</p>
            <p><strong>Unit:</strong> ${unitInfo ? unitInfo.name : 'Unknown'}</p>
            <p><strong>Dependencies:</strong> ${stage.dependencies.length ? stage.dependencies.join(', ') : 'None'}</p>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>`;
  }
}

/**
 * Main function to run the dynamic organization generator workflow
 */
async function runDynamicOrgGenerator() {
  // Use the initialized config to avoid global variable issues
  const { outputDir, apiKey } = initializeDynamicOrgGenerator();
  
  console.log(`Attempting to run workflow with outputDir: ${outputDir}`);

  try {
    // Ensure output directory exists with more robust logging
    console.log(`Checking if output directory exists: ${outputDir}`);
    if (!fs.existsSync(outputDir)) {
      console.log(`Output directory does not exist. Creating...`);
      try {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Successfully created output directory: ${outputDir}`);
      } catch (mkdirError) {
        console.error(`❌ Failed to create output directory: ${outputDir}`, mkdirError);
        throw mkdirError; // Rethrow the error to stop execution
      }
    } else {
      console.log(`Output directory already exists: ${outputDir}`);
    }
    
    // Create subdirectories explicitly after main directory creation
    try {
      fs.ensureDirSync(path.join(outputDir, 'visualizations'));
      fs.ensureDirSync(path.join(outputDir, 'data'));
      fs.ensureDirSync(path.join(outputDir, 'intermediates'));
      console.log('Successfully created subdirectories (visualizations, data, intermediates)');
    } catch (subDirError) {
      console.error(`❌ Failed to create subdirectories in ${outputDir}`, subDirError);
      throw subDirError; // Rethrow the error
    }

    // Ensure OpenAI API key is set
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY environment variable not set. This example requires a valid API key.");
      throw new Error("Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable.");
    }

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
  
    // Create subdirectories
    fs.ensureDirSync(path.join(outputDir, 'visualizations'));
    fs.ensureDirSync(path.join(outputDir, 'data'));
    fs.ensureDirSync(path.join(outputDir, 'intermediates'));
  
    const workflowConfig = {
      PROJECT_ID: 'dynamic-org-generator',
      VERSION: '1.0.0',
      ORGANIZATION_DESCRIPTION: USER_CONFIG.ORGANIZATION_DESCRIPTION,
      ORGANIZATION_TASK: USER_CONFIG.ORGANIZATION_TASK,
      OUTPUT_DIR: outputDir,
      OPENAI_API_KEY: apiKey,
      LLM_CONFIG: USER_CONFIG.LLM_CONFIG
    };
  
    try {
      // Create logger for this workflow run
      const logger = new FileLogger(path.join(outputDir, 'workflow.log'));
      logger.info('Initializing dynamic organization generator workflow');
      logger.info(`Organization Description: ${USER_CONFIG.ORGANIZATION_DESCRIPTION}`);
      logger.info(`Organization Task: ${USER_CONFIG.ORGANIZATION_TASK}`);
      
      // Initialize the event system
      const eventSystem = EventSystem.getInstance();
      
      // Initialize workflow context
      const context: WorkflowContext = {
        config: workflowConfig,
        outputs: {},
        logger,
        eventSystem,
        startTime: Date.now(),
        metrics: {
          stageMetrics: {}
        }
      };
      
      // STEP 1: Create the organization analyzer agent
      logger.info('Creating organization analyzer agent');
      const orgAnalyzerPrompt = `
You are an expert organizational designer who specializes in creating effective organizational structures.
Your task is to create a detailed organizational structure based on the natural language description provided.

The output should be a JSON object that conforms to the following TypeScript interface:

interface OrganizationSchema {
  name: string;
  description: string;
  units: {
    id: string;
    name: string;
    description: string;
    roles: {
      id: string;
      name: string;
      description: string;
      responsibilities: string[];
    }[];
  }[];
  workflows: {
    id: string;
    name: string;
    description: string;
    stages: {
      id: string;
      name: string;
      description: string;
      unitId: string;
      roleId: string;
      dependencies: string[];
    }[];
  }[];
}

Guidelines:
1. Create a clear organizational structure with logical units and roles
2. Ensure IDs are unique and descriptive (no spaces, use snake_case)
3. Create at least one workflow that shows how the organization operates
4. Ensure that workflows have well-defined stages with clear dependencies
5. Be comprehensive and detailed in your descriptions

Respond ONLY with the valid JSON object and nothing else.
`;
      
      const orgAnalyzerAgent = new LLMAgent({
        id: 'org_analyzer',
        name: 'Organization Analyzer',
        unitId: 'meta_unit',
        unitName: 'Meta Unit',
        description: 'Analyzes natural language descriptions and converts them to structured organizational schemas',
        systemPrompt: orgAnalyzerPrompt
      });
      
      // STEP 2: Generate the organizational structure from the natural language description
      logger.info('Generating organizational structure from description');
      const stageStartTime = Date.now();
      
      let organizationSchema: OrganizationSchema;
      try {
        organizationSchema = await orgAnalyzerAgent.process(
          USER_CONFIG.ORGANIZATION_DESCRIPTION,
          context
        ) as OrganizationSchema;
        
        // Record metrics
        context.metrics.stageMetrics['org_analysis'] = {
          startTime: stageStartTime,
          endTime: Date.now(),
          duration: Date.now() - stageStartTime,
          agentType: 'LLMAgent'
        };
        
        // Save the organization schema
        context.outputs.organization_schema = organizationSchema;
        fs.writeJsonSync(path.join(outputDir, 'data', 'organization_schema.json'), organizationSchema, { spaces: 2 });
        
        logger.info(`Generated organization schema with ${organizationSchema.units.length} units and ${organizationSchema.workflows.length} workflows`);
      } catch (error) {
        logger.error(`Failed to generate organization schema: ${error}`);
        throw error;
      }
      
      // STEP 3: Visualize the organizational structure
      logger.info('Generating organization chart visualization');
      const visualizationStartTime = Date.now();
      
      try {
        const visualizationAgent = new VisualizationAgent({
          id: 'org_visualizer',
          name: 'Organization Visualizer',
          unitId: 'meta_unit',
          unitName: 'Meta Unit',
          description: 'Creates visual representations of organizational structures',
          visualizationType: 'org-chart'
        });
        
        const visualizationResult = await visualizationAgent.process(
          organizationSchema,
          context
        );
        
        // Record metrics
        context.metrics.stageMetrics['org_visualization'] = {
          startTime: visualizationStartTime,
          endTime: Date.now(),
          duration: Date.now() - visualizationStartTime,
          agentType: 'VisualizationAgent'
        };
        
        // Save the visualization result
        context.outputs.organization_visualization = visualizationResult;
        logger.info(`Generated organization chart visualization`);
      } catch (error) {
        logger.error(`Failed to generate organization chart: ${error}`);
        // Continue execution even if visualization fails
      }
      
      // STEP 4: Create a task execution agent that will use the organization to perform the task
      logger.info('Creating task execution agent');
      const taskExecutorPrompt = `
You are acting as the entire organization described below. Your task is to solve the given problem
by using the organizational structure and workflow provided.

ORGANIZATION STRUCTURE:
${JSON.stringify(organizationSchema, null, 2)}

Your task is to address the following problem by executing the workflow and having each organizational
unit contribute according to their responsibilities:

TASK:
${USER_CONFIG.ORGANIZATION_TASK}

For each stage of the workflow:
1. Identify which unit and role is responsible
2. Perform the work as that unit/role based on their expertise and responsibilities
3. Pass the output to the next stage according to the workflow dependencies

Your response should be a JSON object with the following structure:
{
  "task_summary": "Brief summary of the task",
  "execution_plan": "How the organization will approach this task",
  "stage_outputs": [
    {
      "stage_id": "id of the workflow stage",
      "unit_id": "id of the unit performing the work",
      "role_id": "id of the specific role",
      "input": "what this stage received as input",
      "output": "the work produced by this stage",
      "next_stages": ["ids of the next stages in the workflow"]
    }
  ],
  "final_deliverable": {
    "title": "Title of the final deliverable",
    "description": "Description of what was produced",
    "key_components": ["List of key components"],
    "summary": "Detailed summary of the results"
  }
}

Respond ONLY with the valid JSON object and nothing else.
`;
      
      const taskExecutionAgent = new LLMAgent({
        id: 'task_executor',
        name: 'Task Execution Agent',
        unitId: 'meta_unit',
        unitName: 'Meta Unit',
        description: 'Executes tasks by coordinating across the organizational structure',
        systemPrompt: taskExecutorPrompt
      });
      
      // STEP 5: Execute the task using the organizational structure
      logger.info('Executing task through the organization');
      const taskStartTime = Date.now();
      
      try {
        const taskResult = await taskExecutionAgent.process(
          USER_CONFIG.ORGANIZATION_TASK,
          context
        );
        
        // Record metrics
        context.metrics.stageMetrics['task_execution'] = {
          startTime: taskStartTime,
          endTime: Date.now(),
          duration: Date.now() - taskStartTime,
          agentType: 'LLMAgent'
        };
        
        // Save the task result
        context.outputs.task_execution = taskResult;
        fs.writeJsonSync(path.join(outputDir, 'data', 'task_execution_result.json'), taskResult, { spaces: 2 });
        
        logger.info(`Task execution completed`);
      } catch (error) {
        logger.error(`Failed to execute task: ${error}`);
        throw error;
      }
      
      // STEP 6: Generate workflow visualization for the task execution
      logger.info('Generating workflow visualization');
      const workflowVisStartTime = Date.now();
      
      try {
        // Create a workflow visualization structure that includes units for visualization
        const workflowVisStructure = {
          name: `${organizationSchema.name} - Task Workflow`,
          description: `Workflow for executing: ${USER_CONFIG.ORGANIZATION_TASK}`,
          units: organizationSchema.units,
          stages: context.outputs.task_execution.stage_outputs.map((stage: any) => ({
            id: stage.stage_id,
            name: stage.stage_id.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase()),
            description: stage.output.substring(0, 100) + (stage.output.length > 100 ? '...' : ''),
            unitId: stage.unit_id,
            dependencies: context.outputs.task_execution.stage_outputs
              .filter((s: any) => stage.input && stage.input.includes(s.stage_id))
              .map((s: any) => s.stage_id)
          }))
        };
        
        const workflowVisualizationAgent = new VisualizationAgent({
          id: 'workflow_visualizer',
          name: 'Workflow Visualizer',
          unitId: 'meta_unit',
          unitName: 'Meta Unit',
          description: 'Creates visual representations of workflows',
          visualizationType: 'workflow-diagram'
        });
        
        const workflowVisResult = await workflowVisualizationAgent.process(
          workflowVisStructure,
          context
        );
        
        // Record metrics
        context.metrics.stageMetrics['workflow_visualization'] = {
          startTime: workflowVisStartTime,
          endTime: Date.now(),
          duration: Date.now() - workflowVisStartTime,
          agentType: 'VisualizationAgent'
        };
        
        // Save the visualization result
        context.outputs.workflow_visualization = workflowVisResult;
        logger.info(`Generated workflow visualization`);
      } catch (error) {
        logger.error(`Failed to generate workflow visualization: ${error}`);
        // Continue execution even if visualization fails
      }
      
      // STEP 7: Generate summary HTML report
      logger.info('Generating summary report');
      
      try {
        const summaryHtml = generateSummaryHtml(context);
        fs.writeFileSync(path.join(outputDir, 'index.html'), summaryHtml);
        logger.info(`Generated summary report at ${path.join(outputDir, 'index.html')}`);
      } catch (error) {
        logger.error(`Failed to generate summary report: ${error}`);
      }
      
      // Return the output directory for the caller
      return outputDir;
    } catch (error) {
      console.error('Workflow failed inside runDynamicOrgGenerator:', error);
      throw error;
    }
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}

/**
 * Generate a summary HTML with links to all generated artifacts
 */
function generateSummaryHtml(context: WorkflowContext): string {
  const org = context.outputs.organization_schema;
  const taskResult = context.outputs.task_execution;
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Dynamic Organization Generator - Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
    .container { max-width: 1200px; margin: 0 auto; }
    .section { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .metrics-section { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .metric-card { border: 1px solid #eee; border-radius: 5px; padding: 15px; background: #f5f5f5; }
    .links-section { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .link-card { border: 1px solid #eee; border-radius: 5px; padding: 15px; background: #f5f5f5; }
    h1, h2, h3 { color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    a { color: #1565c0; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .final-deliverable { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dynamic Organization Generator</h1>
      <p>Summary of generated organization and task execution</p>
    </div>
    
    <div class="section">
      <h2>Configuration</h2>
      <p><strong>Organization Description:</strong> ${context.config.ORGANIZATION_DESCRIPTION}</p>
      <p><strong>Task:</strong> ${context.config.ORGANIZATION_TASK}</p>
    </div>
    
    <div class="section">
      <h2>Organization Summary</h2>
      <p><strong>Name:</strong> ${org.name}</p>
      <p><strong>Description:</strong> ${org.description}</p>
      <p><strong>Units:</strong> ${org.units.length}</p>
      <p><strong>Total Roles:</strong> ${org.units.reduce((count: number, unit: any) => count + unit.roles.length, 0)}</p>
      <p><strong>Workflows:</strong> ${org.workflows.length}</p>
    </div>
    
    <div class="section">
      <h2>Task Execution Summary</h2>
      <p><strong>Task Summary:</strong> ${taskResult.task_summary}</p>
      <p><strong>Execution Plan:</strong> ${taskResult.execution_plan}</p>
      <p><strong>Stages Executed:</strong> ${taskResult.stage_outputs.length}</p>
      <h3>Final Deliverable</h3>
      <p><strong>Title:</strong> ${taskResult.final_deliverable.title}</p>
      <div class="final-deliverable">
${taskResult.final_deliverable.summary}
      </div>
    </div>
    
    <div class="section">
      <h2>Performance Metrics</h2>
      <div class="metrics-section">
        ${Object.entries(context.metrics.stageMetrics).map(([id, metrics]) => `
          <div class="metric-card">
            <h3>${id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p><strong>Duration:</strong> ${((metrics.duration || 0) / 1000).toFixed(2)}s</p>
            <p><strong>Agent Type:</strong> ${metrics.agentType}</p>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="section">
      <h2>Generated Artifacts</h2>
      <div class="links-section">
        <div class="link-card">
          <h3>Organization</h3>
          <p><a href="visualizations/org_chart.html" target="_blank">Organization Chart</a></p>
          <p><a href="data/organization_schema.json" target="_blank">Organization Schema (JSON)</a></p>
        </div>
        <div class="link-card">
          <h3>Task Execution</h3>
          <p><a href="visualizations/workflow_diagram.html" target="_blank">Workflow Diagram</a></p>
          <p><a href="data/task_execution_result.json" target="_blank">Task Execution Result (JSON)</a></p>
        </div>
        <div class="link-card">
          <h3>Raw Data</h3>
          <p><a href="intermediates/" target="_blank">Intermediate Files</a></p>
          <p><a href="workflow.log" target="_blank">Workflow Log</a></p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Ensure the main function is called when the script is executed directly
if (require.main === module) {
  console.log("Executing runDynamicOrgGenerator directly...");
  runDynamicOrgGenerator()
    .then(finalOutputDir => {
      console.log(`✅ Workflow finished successfully. Output: ${finalOutputDir}`);
    })
    .catch(error => {
      console.error("❌ Workflow run failed:", error);
      process.exit(1);
    });
}

// Export the main function for the runner script
export { runDynamicOrgGenerator }; 