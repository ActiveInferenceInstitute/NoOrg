/**
 * Example 8: Hybrid Agent Workflow
 * 
 * This example demonstrates:
 * - Combining multiple agent types in a single workflow
 * - Different agent architectures working together
 * - Unit-to-unit coordination
 * - Complex workflow with diverse agent capabilities
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
// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `stealth-kids-crypto-wallet-${timestamp}`;
// Initialize outputDir with a default value
let outputDir: string = path.join('output', runId);
// Configure the project parameters
const PROJECT_CONFIG = {
  DOMAIN: "Child-friendly secure cryptocurrency solutions",
  OBJECTIVE: "Design an invisible, waterproof cryptocurrency hardware wallet specifically for children",
  CONSTRAINTS: "Must be undetectable as a tech device, fully waterproof (IPX8 rating), use non-toxic materials, withstand rough handling/play, maintain crypto security while being child-accessible, and integrate military-grade encryption",
  TARGET_USERS: "Children aged 6-12, parents seeking financial education tools, school cryptocurrency literacy programs, toy manufacturers, and child safety organizations",
  // AI configuration
  LLM_CONFIG: {
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4o',
    FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
    TOKEN_LIMIT_THRESHOLD: 8000,
    DEFAULT_MAX_TOKENS: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000
  }
};

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
    fs.writeFileSync(this.logFile, `=== Hybrid Agent Workflow Example - ${new Date().toISOString()} ===\n\n`);
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

// Define the agent interfaces
interface Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  process: (input: any, context: WorkflowContext) => Promise<any>;
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
      // Try to simplify the input if it's a complex object
      if (input && typeof input === 'object') {
        // Create a simplified version that focuses on key information
        processedInput = this.simplifyInput(input);
      }
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
      DEFAULT_MODEL: 'gpt-4',
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
        model: modelToUse,
        system_prompt: this.systemPrompt,
        user_prompt: processedInput
      }, null, 2)
    );
    logger.info(`Saved LLM input to ${inputFilename}`);
    
    const response = await this.llm.createChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: config.DEFAULT_MAX_TOKENS || 2000,
      model: modelToUse
    });
    
    const content = response.choices[0]?.message?.content || '';
    
    // Save the raw output to a file
    const outputFilename = `${this.id}_${Date.now()}_output.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, outputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        model: modelToUse,
        raw_response: content
      }, null, 2)
    );
    logger.info(`Saved LLM output to ${outputFilename}`);
    
    // Try to parse as JSON if possible
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```([\s\S]*?)```/) ||
                        [null, content];
      const jsonContent = jsonMatch[1] || content;
      
      // Create result with metadata
      const result = {
        ...JSON.parse(jsonContent),
        __metadata: {
          model: modelToUse,
          tokens: estimatedTokens,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
      
      return result;
    } catch (error) {
      return { 
        raw_content: content,
        __metadata: {
          model: modelToUse,
          tokens: estimatedTokens,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  private simplifyInput(input: any): any {
    // A helper method to simplify complex objects by keeping only essential data
    if (!input || typeof input !== 'object') return input;
    
    // For arrays, simplify each element and limit length
    if (Array.isArray(input)) {
      return input.slice(0, 5).map(item => this.simplifyInput(item));
    }
    
    // For objects, keep only essential properties
    const simplified: Record<string, any> = {};
    const keysToKeep = Object.keys(input).slice(0, 10); // Limit to 10 top-level keys
    
    for (const key of keysToKeep) {
      const value = input[key];
      
      // Truncate long strings
      if (typeof value === 'string' && value.length > 500) {
        simplified[key] = value.substring(0, 500) + '...';
      } 
      // Recursively simplify nested objects, but with a depth limit
      else if (value && typeof value === 'object') {
        simplified[key] = Object.keys(value).length > 5 
          ? { __summary: `Complex object with ${Object.keys(value).length} properties` }
          : this.simplifyInput(value);
      } else {
        simplified[key] = value;
      }
    }
    
    // If there were more keys than we kept, add a note
    if (Object.keys(input).length > keysToKeep.length) {
      simplified.__note = `Simplified from ${Object.keys(input).length} properties`;
    }
    
    return simplified;
  }
}

// Data processing agent
class DataProcessingAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  processingFunction: (data: any) => any;
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    processingFunction: (data: any) => any;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.processingFunction = config.processingFunction;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`DataProcessingAgent ${this.name} processing input`);
    return this.processingFunction(input);
  }
}

// API integration agent
class APIAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  transformRequest?: (input: any) => any;
  transformResponse?: (response: any) => any;
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    transformRequest?: (input: any) => any;
    transformResponse?: (response: any) => any;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.endpoint = config.endpoint;
    this.method = config.method;
    this.transformRequest = config.transformRequest;
    this.transformResponse = config.transformResponse;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`APIAgent ${this.name} processing with endpoint ${this.endpoint}`);
    
    try {
      // Process the input if transformRequest is provided
      let requestData = input;
      try {
        if (typeof this.transformRequest === 'function') {
          requestData = this.transformRequest(input);
          context.logger.info(`APIAgent ${this.name} transformed request data`);
        }
      } catch (error) {
        context.logger.error(`Error in transformRequest for ${this.name}: ${error}`);
        // Continue with original input if transform fails
        requestData = input;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Instead of making a real API call, simulate the response
      const mockResponse = this.generateMockResponse(requestData);
      
      // Transform the response if transformResponse is provided
      let result = mockResponse;
      try {
        if (typeof this.transformResponse === 'function') {
          result = this.transformResponse(mockResponse);
          context.logger.info(`APIAgent ${this.name} transformed response data`);
        }
      } catch (error) {
        context.logger.error(`Error in transformResponse for ${this.name}: ${error}`);
        // Continue with mock response if transform fails
        result = mockResponse;
      }
      
      context.logger.info(`APIAgent ${this.name} completed processing`);
      return result;
    } catch (error) {
      context.logger.error(`Error in APIAgent ${this.name}: ${error}`);
      return { 
        error: String(error),
        endpoint: this.endpoint,
        method: this.method
      };
    }
  }
  
  private generateMockResponse(requestData: any): any {
    // Generate a deterministic mock response based on the endpoint and request data
    if (this.endpoint.includes('hardware-catalog')) {
      // Mock hardware catalog response
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          hardware_options: [
            {
              id: 'sen-tr1000',
              name: 'Basic Ergonomic Handle',
              price: 35.99,
              power: 'No power required',
              connectivity: 'N/A',
              features: ['Ergonomic grip', 'Slip-resistant coating'],
              suitable_for: 'Basic travel comfort for elderly users'
            },
            {
              id: 'sen-tr2000',
              name: 'Smart Handle System',
              price: 149.99,
              power: 'Battery (6 months)',
              connectivity: 'Bluetooth',
              features: ['Ergonomic grip', 'Fall detection', 'Location tracking', 'Emergency alert'],
              suitable_for: 'Enhanced safety and tracking features for elderly travelers'
            },
            {
              id: 'sen-tr3000',
              name: 'Premium Travel Assistant',
              price: 299.99,
              power: 'Rechargeable battery with 2-week life',
              connectivity: 'Bluetooth, WiFi, Cellular',
              features: ['Voice control', 'GPS tracking', 'Fall prevention', 'Health monitoring', 'Emergency services connection'],
              suitable_for: 'Complete travel assistance system for elderly with mobility or health concerns'
            }
          ],
          compatible_platforms: ['iOS', 'Android', 'Custom embedded systems']
        }
      };
    } else if (this.endpoint.includes('weather')) {
      // Mock weather data
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          temperature: 22.5,
          humidity: 65,
          conditions: 'Partly Cloudy',
          wind_speed: 5.2,
          forecast: [
            { day: 'Today', temp_high: 23, temp_low: 18, conditions: 'Partly Cloudy' },
            { day: 'Tomorrow', temp_high: 25, temp_low: 19, conditions: 'Sunny' }
          ]
        }
      };
    } else {
      // Generic mock response
      return {
        success: true,
        timestamp: new Date().toISOString(),
        endpoint: this.endpoint,
        method: this.method,
        request: requestData,
        mock_data: "This is a simulated API response"
      };
    }
  }
}

// Rule-based decision agent
class RuleBasedAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  rules: Array<{
    condition: (input: any) => boolean;
    action: (input: any, context: WorkflowContext) => any;
  }>;
  defaultAction?: (input: any, context: WorkflowContext) => any;
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    rules: Array<{
      condition: (input: any) => boolean;
      action: (input: any, context: WorkflowContext) => any;
    }>;
    defaultAction?: (input: any, context: WorkflowContext) => any;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.rules = config.rules;
    this.defaultAction = config.defaultAction;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`RuleBasedAgent ${this.name} evaluating rules`);
    
    for (const rule of this.rules) {
      if (rule.condition(input)) {
        context.logger.info(`Rule triggered in ${this.name}`);
        return rule.action(input, context);
      }
    }
    
    if (this.defaultAction) {
      context.logger.info(`No rules matched, using default action in ${this.name}`);
      return this.defaultAction(input, context);
    }
    
    context.logger.info(`No rules matched and no default action in ${this.name}`);
    return input; // Pass through if no rules match and no default action
  }
}

// Visualization agent
class VisualizationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  visualizationType: 'chart' | 'diagram' | 'table' | 'map';
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    visualizationType: 'chart' | 'diagram' | 'table' | 'map';
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.visualizationType = config.visualizationType;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`VisualizationAgent ${this.name} generating ${this.visualizationType}`);
    
    const visualizationId = `${this.id}_${Date.now()}`;
    
    // Get the output directory from the context's config
    const runOutputDir = context.config.OUTPUT_DIR || outputDir;
    const visualizationsDir = path.join(runOutputDir, 'visualizations');
    
    // Ensure the visualizations directory exists
    fs.ensureDirSync(visualizationsDir);
    
    const outputFile = path.join(visualizationsDir, `${visualizationId}.html`);
    
    // Generate a simple visualization based on the type
    let htmlContent = '';
    
    switch (this.visualizationType) {
      case 'chart':
        htmlContent = this.generateChart(input, visualizationId);
        break;
      case 'diagram':
        htmlContent = this.generateDiagram(input, visualizationId);
        break;
      case 'table':
        htmlContent = this.generateTable(input, visualizationId);
        break;
      case 'map':
        htmlContent = this.generateMap(input, visualizationId);
        break;
    }
    
    // Write the visualization to the file
    try {
      fs.writeFileSync(outputFile, htmlContent);
      context.logger.info(`Created visualization file: ${outputFile}`);
    } catch (error) {
      context.logger.error(`Failed to write visualization file: ${error}`);
    }
    
    return {
      visualization_id: visualizationId,
      visualization_type: this.visualizationType,
      visualization_path: outputFile,
      html_content: htmlContent,
      input_data_summary: this.summarizeData(input)
    };
  }
  
  private summarizeData(data: any): any {
    // Create a simple summary of the input data
    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        sample: data.slice(0, 3)
      };
    } else if (typeof data === 'object' && data !== null) {
      return {
        type: 'object',
        keys: Object.keys(data),
        sample: Object.keys(data).slice(0, 3).reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {} as any)
      };
    } else {
      return {
        type: typeof data,
        value: data
      };
    }
  }
  
  private generateChart(data: any, id: string): string {
    // Generate a simple chart using Chart.js
    let datasets: any[] = [];
    let labels: string[] = [];
    
    if (Array.isArray(data)) {
      // Assume array of data points
      labels = data.map((d, i) => `Point ${i+1}`);
      datasets = [{
        label: 'Values',
        data: data.map(d => typeof d === 'number' ? d : (d.value || d.reading || 0)),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }];
    } else if (data.data && Array.isArray(data.data.readings)) {
      // Handle the mock API response structure
      const readings = data.data.readings;
      labels = readings.map((r: any) => r.sensor_id || `Sensor ${Math.random().toString(36).substring(7)}`);
      datasets = [{
        label: 'Sensor Readings',
        data: readings.map((r: any) => r.value || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }];
    } else {
      // Default fallback for unknown structures
      const keys = Object.keys(data).filter(k => typeof data[k] === 'number');
      labels = keys;
      datasets = [{
        label: 'Values',
        data: keys.map(k => data[k]),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }];
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Chart Visualization</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .chart-container { width: 800px; height: 400px; }
  </style>
</head>
<body>
  <h1>Data Visualization</h1>
  <div class="chart-container">
    <canvas id="chart_${id}"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('chart_${id}').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: ${JSON.stringify(datasets)}
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  </script>
</body>
</html>`;
  }
  
  private generateDiagram(data: any, id: string): string {
    // Generate a simple mermaid diagram
    let diagram = 'graph TD;\n';
    
    if (data.nodes && data.links) {
      // Handle node-link structure
      for (const node of data.nodes) {
        diagram += `    ${node.id}["${node.label}"];\n`;
      }
      
      for (const link of data.links) {
        diagram += `    ${link.source} --> ${link.target};\n`;
      }
    } else if (data.workflow || data.process) {
      // Handle workflow-like data
      const steps = data.workflow || data.process || [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        diagram += `    step${i}["${step.name || step.id || `Step ${i+1}`}"];\n`;
        
        if (i > 0) {
          diagram += `    step${i-1} --> step${i};\n`;
        }
      }
    } else {
      // Default fallback
      diagram += '    A["Start"] --> B["Process"];\n';
      diagram += '    B --> C["End"];\n';
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Diagram Visualization</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .diagram { max-width: 800px; }
  </style>
</head>
<body>
  <h1>Workflow Diagram</h1>
  <div class="diagram">
    <pre class="mermaid">
${diagram}
    </pre>
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`;
  }
  
  private generateTable(data: any, id: string): string {
    // Generate a simple HTML table
    let tableHeaders = '';
    let tableRows = '';
    
    if (Array.isArray(data)) {
      // Array of objects
      if (data.length > 0 && typeof data[0] === 'object') {
        const headers = Object.keys(data[0]);
        tableHeaders = headers.map(h => `<th>${h}</th>`).join('');
        
        tableRows = data.map(row => {
          const cells = headers.map(h => `<td>${row[h]}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
      } else {
        // Array of primitives
        tableHeaders = '<th>Index</th><th>Value</th>';
        tableRows = data.map((val, idx) => `<tr><td>${idx}</td><td>${val}</td></tr>`).join('');
      }
    } else if (data.data && Array.isArray(data.data.readings)) {
      // Handle the mock API response structure
      const readings = data.data.readings;
      const headers = readings.length > 0 ? Object.keys(readings[0]) : [];
      tableHeaders = headers.map(h => `<th>${h}</th>`).join('');
      
      tableRows = readings.map((row: any) => {
        const cells = headers.map(h => `<td>${row[h]}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    } else {
      // Object structure
      tableHeaders = '<th>Key</th><th>Value</th>';
      tableRows = Object.entries(data).map(([key, value]) => 
        `<tr><td>${key}</td><td>${typeof value === 'object' ? JSON.stringify(value) : value}</td></tr>`
      ).join('');
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Table Visualization</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Data Table</h1>
  <table>
    <thead>
      <tr>${tableHeaders}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;
  }
  
  private generateMap(data: any, id: string): string {
    // Generate a simple map using Leaflet
    let markers = '';
    
    if (data.locations) {
      markers = data.locations.map((loc: any, idx: number) => 
        `L.marker([${loc.lat}, ${loc.lng}]).addTo(map).bindPopup("${loc.name || 'Location ' + (idx+1)}")`
      ).join(';\n      ');
    } else if (data.data && data.data.readings) {
      // Simulate locations for our mock data
      markers = data.data.readings.map((r: any, idx: number) => {
        // Generate stable but random-looking coordinates centered around NYC
        const lat = 40.7128 + (parseInt(crypto.createHash('md5').update(r.sensor_id + 'lat').digest('hex').substring(0, 8), 16) % 1000) / 10000;
        const lng = -74.0060 + (parseInt(crypto.createHash('md5').update(r.sensor_id + 'lng').digest('hex').substring(0, 8), 16) % 1000) / 10000;
        return `L.marker([${lat}, ${lng}]).addTo(map).bindPopup("Sensor: ${r.sensor_id}<br>Reading: ${r.value.toFixed(2)}")`;
      }).join(';\n      ');
    } else {
      // Default fallback
      markers = `L.marker([40.7128, -74.0060]).addTo(map).bindPopup("New York City")`;
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Map Visualization</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    #map_${id} { height: 500px; width: 100%; }
    .header { padding: 10px 20px; background: #f2f2f2; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Location Map</h1>
  </div>
  <div id="map_${id}"></div>
  <script>
    const map = L.map('map_${id}').setView([40.7128, -74.0060], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers
    ${markers};
  </script>
</body>
</html>`;
  }
}

/**
 * Image Generation Agent that creates visual summaries of the project
 */
class ImageGenerationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  openaiClient: OpenAIClient;
  outputDir: string;
  state: Record<string, any>;
  
  constructor(id: string, name: string, unitId: string, unitName: string, description: string, openaiClient: OpenAIClient, outputDir: string) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
    this.openaiClient = openaiClient;
    this.outputDir = outputDir;
    this.state = {};
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    // Get output directory from context if available, otherwise use the agent's outputDir
    const runOutputDir = context.config.OUTPUT_DIR || this.outputDir;
    const imagesDir = path.join(runOutputDir, 'images');
    
    // Ensure output directory exists
    fs.ensureDirSync(imagesDir);
    
    // Check if input contains multiple prompts
    if (input.prompts && Array.isArray(input.prompts)) {
      context.logger.info(`Processing ${input.prompts.length} image generation prompts`);
      
      // Define the interface for image result
      interface ImageResult {
        success: boolean;
        prompt?: string;
        imagePath?: string;
        imageType?: string;
        timestamp?: string;
        error?: string;
      }
      
      const results: ImageResult[] = [];
      
      // Process each prompt in the array
      for (const promptConfig of input.prompts) {
        const prompt = promptConfig.prompt;
        const filename = promptConfig.filename || `image_${Date.now()}_${results.length}.png`;
        
        if (!prompt) {
          results.push({ success: false, error: 'No prompt provided for image generation' });
          continue;
        }
        
        // Build output path
        const outputPath = path.join(imagesDir, filename);
        
        try {
          context.logger.info(`Generating image for prompt: "${prompt}"`);
          
          // Check if OPENAI_API_KEY is set
          if (!process.env.OPENAI_API_KEY) {
            context.logger.warn("No OpenAI API key found. Using fallback image generation.");
            await this.generateSimulatedImage(prompt, outputPath);
          } else {
            // Use actual OpenAI API for image generation
            await this.generateRealImage(prompt, outputPath);
          }
          
          results.push({
            success: true,
            prompt: prompt,
            imagePath: outputPath,
            imageType: promptConfig.type || 'general',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          context.logger.error(`Error generating image: ${error}`);
          results.push({
            success: false,
            prompt: prompt,
            error: String(error)
          });
        }
      }
      
      return {
        success: true,
        images: results,
        count: results.length,
        timestamp: new Date().toISOString()
      };
    }
    
    // Handle single prompt (original implementation for backward compatibility)
    let prompt = '';
    let outputFilename = '';
    
    if (typeof input === 'string') {
      prompt = input;
      outputFilename = `image_${Date.now()}.png`;
    } else if (typeof input === 'object' && input !== null) {
      prompt = input.prompt || '';
      outputFilename = input.filename || `image_${Date.now()}.png`;
    }
    
    if (!prompt) {
      return { error: 'No prompt provided for image generation' };
    }
    
    // Build output path
    const outputPath = path.join(imagesDir, outputFilename);
    
    try {
      context.logger.info(`Generating image for prompt: "${prompt}"`);
      
      // Check if OPENAI_API_KEY is set
      if (!process.env.OPENAI_API_KEY) {
        context.logger.warn("No OpenAI API key found. Using fallback image generation.");
        await this.generateSimulatedImage(prompt, outputPath);
      } else {
        // Use actual OpenAI API for image generation
        await this.generateRealImage(prompt, outputPath);
      }
      
      return {
        success: true,
        prompt: prompt,
        imagePath: outputPath,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      context.logger.error(`Error generating image: ${error}`);
      return {
        success: false,
        error: String(error)
      };
    }
  }
  
  private async generateRealImage(prompt: string, outputPath: string): Promise<void> {
    try {
      // Call OpenAI's image generation API using axios directly
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is required but not found in environment variables");
      }
      
      console.log(`Calling OpenAI API for image generation with prompt: "${prompt.substring(0, 30)}..."`);
      
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url"
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Get the image URL from the response
      const imageUrl = response.data?.data?.[0]?.url;
      
      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI API");
      }
      
      console.log(`Successfully received image URL from OpenAI: ${imageUrl.substring(0, 50)}...`);
      
      // Download the image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      
      // Save the image to disk
      fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
      console.log(`Image saved to ${outputPath}`);
      
      // Also save the prompt for reference
      fs.writeFileSync(
        outputPath.replace('.png', '_prompt.txt'), 
        `Prompt: ${prompt}\nGenerated: ${new Date().toISOString()}`
      );
    } catch (error) {
      console.error("Error generating image with OpenAI:", error);
      throw error;
    }
  }
  
  private async generateSimulatedImage(prompt: string, outputPath: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a simple placeholder file with the prompt as text
    const placeholderContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Simulated Image Generation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .container { width: 512px; height: 512px; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border: 1px solid #ddd; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
    .prompt { font-size: 16px; color: #333; text-align: center; margin-bottom: 20px; }
    .placeholder { width: 80%; height: 60%; background: linear-gradient(to right, #74ebd5, #acb6e5); display: flex; justify-content: center; align-items: center; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="prompt">${prompt}</div>
    <div class="placeholder">Simulated Image (OpenAI API key not provided)</div>
  </div>
</body>
</html>
`;
    
    fs.writeFileSync(outputPath.replace('.png', '.html'), placeholderContent);
    
    // Just log that we would normally generate an image
    console.log(`[Simulated] Generated image for prompt: "${prompt}"`);
  }
}

// Add a new DocumentProcessingAgent class after the ImageGenerationAgent class
class DocumentProcessingAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  maxChunkSize: number;
  maxTokenEstimate: number;
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    maxChunkSize?: number;
    maxTokenEstimate?: number;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.maxChunkSize = config.maxChunkSize || 5000; // Default to 5000 characters per chunk
    this.maxTokenEstimate = config.maxTokenEstimate || 7000; // Default token limit estimate
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`DocumentProcessingAgent ${this.name} processing document`);
    
    try {
      // Check if input is a string or a complex document object
      let documentContent: string;
      let documentMeta: Record<string, any> = {};
      
      if (typeof input === 'string') {
        documentContent = input;
      } else if (input && typeof input === 'object') {
        // Handle cases where input is an object with enhanced documentation
        if (input.enhanced_documentation) {
          documentMeta = {
            title: input.enhanced_documentation.title || 'Untitled Document',
            version: input.enhanced_documentation.version || '1.0',
            sections: input.enhanced_documentation.new_sections?.length || 0
          };
          // Convert to string representation
          documentContent = JSON.stringify(input.enhanced_documentation, null, 2);
        } else {
          // Use the entire object as content
          documentContent = JSON.stringify(input, null, 2);
          documentMeta = {
            contentType: 'application/json',
            size: documentContent.length
          };
        }
      } else {
        return { error: 'Invalid document format for processing' };
      }
      
      // Process the document in chunks to avoid token limits
      const chunks = this.chunkDocument(documentContent);
      context.logger.info(`Split document into ${chunks.length} chunks for processing`);
      
      // Process each chunk to extract key information
      const processedChunks = chunks.map((chunk, index) => {
        return this.processChunk(chunk, index, chunks.length);
      });
      
      // Merge the processed chunks into a coherent summary
      const summary = this.mergeProcessedChunks(processedChunks, documentMeta);
      
      return {
        summary: summary,
        original_size: documentContent.length,
        chunks_processed: chunks.length,
        compression_ratio: (summary.length / documentContent.length).toFixed(2),
        meta: documentMeta,
        processed_at: new Date().toISOString()
      };
    } catch (error) {
      context.logger.error(`Error in document processing: ${error}`);
      return { error: String(error) };
    }
  }
  
  private chunkDocument(content: string): string[] {
    // Simple chunking by character count (in a real implementation, we would use smarter chunking)
    const chunks: string[] = [];
    let current = '';
    
    // Split by paragraphs first
    const paragraphs = content.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph exceeds the chunk size, save current chunk and start a new one
      if (current.length + paragraph.length > this.maxChunkSize && current.length > 0) {
        chunks.push(current);
        current = paragraph;
      } else {
        current += (current ? '\n\n' : '') + paragraph;
      }
    }
    
    // Add the last chunk if not empty
    if (current) {
      chunks.push(current);
    }
    
    return chunks;
  }
  
  private processChunk(chunk: string, index: number, totalChunks: number): any {
    // Here we would normally use an LLM to process each chunk
    // For demonstration, we'll just do simple extractive summarization
    
    // Extract the top 5 most important sentences (based on length as a simple heuristic)
    const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const importantSentences = sentences
      .map(s => ({ text: s.trim(), score: s.length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.text);
    
    // Extract key phrases (simple implementation - just nouns and noun phrases)
    const words = chunk.split(/\s+/);
    const keyPhrases = new Set<string>();
    
    // Naive key phrase extraction (in real implementation, use NLP techniques)
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].length > 4 && words[i][0] === words[i][0].toUpperCase()) {
        keyPhrases.add(words[i]);
        // Check for noun phrases (two consecutive capitalized words)
        if (i < words.length - 1 && 
            words[i+1].length > 3 && 
            words[i+1][0] === words[i+1][0].toUpperCase()) {
          keyPhrases.add(`${words[i]} ${words[i+1]}`);
        }
      }
    }
    
    return {
      chunk_index: index,
      total_chunks: totalChunks,
      important_points: importantSentences,
      key_phrases: Array.from(keyPhrases).slice(0, 10),
      character_count: chunk.length
    };
  }
  
  private mergeProcessedChunks(processedChunks: any[], meta: Record<string, any>): string {
    // Combine the important points from all chunks
    const allImportantPoints = processedChunks.flatMap(chunk => chunk.important_points);
    
    // Deduplicate and take top 10
    const uniquePoints = Array.from(new Set(allImportantPoints)).slice(0, 10);
    
    // Combine key phrases from all chunks
    const allKeyPhrases = processedChunks.flatMap(chunk => chunk.key_phrases);
    const uniqueKeyPhrases = Array.from(new Set(allKeyPhrases)).slice(0, 15);
    
    // Create an executive summary
    return `
# Executive Summary: ${meta.title || 'Document Analysis'}

## Overview
This is a condensed analysis of the ${meta.contentType || 'project documentation'} (version ${meta.version || '1.0'}).

## Key Points
${uniquePoints.map(point => `- ${point}`).join('\n')}

## Key Concepts and Terminology
${uniqueKeyPhrases.map(phrase => `- ${phrase}`).join('\n')}

## Summary
This document was processed using advanced document summarization techniques, reducing the original content by approximately ${processedChunks.reduce((total, chunk) => total + chunk.character_count, 0)} characters to this concise executive summary. The document was processed in ${processedChunks.length} chunks to manage token limits effectively.
`;
  }
}

// Workflow context to track state throughout the process
interface WorkflowContext {
  config: typeof PROJECT_CONFIG & {
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

// Define the organizational units
interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

// Create the organizational units with their agents
const UNITS: Record<string, OrganizationalUnit> = {
  RESEARCH: {
    id: 'research_unit',
    name: 'Research Unit',
    description: 'Responsible for data analysis, market research, and user needs assessment',
    agents: [
      new LLMAgent({
        id: 'requirements_analyzer',
        name: 'Requirements Analyzer',
        unitId: 'research_unit',
        unitName: 'Research Unit',
        description: 'Analyzes project requirements and stakeholder needs',
        systemPrompt: 'You are a requirements analyst specializing in technical systems. Your job is to analyze project requirements, identify key stakeholders, and determine essential functionality based on user needs.'
      }),
      new DataProcessingAgent({
        id: 'data_preprocessor',
        name: 'Data Preprocessor',
        unitId: 'research_unit',
        unitName: 'Research Unit',
        description: 'Cleans and formats data for analysis',
        processingFunction: (data) => {
          // Simple data preprocessing
          if (Array.isArray(data)) {
            return {
              processed_data: data.filter(item => item !== null && item !== undefined),
              stats: {
                count: data.length,
                null_count: data.filter(item => item === null || item === undefined).length
              }
            };
          } else if (typeof data === 'object' && data !== null) {
            // Process objects by extracting and formatting values
            const processed: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
              if (value !== null && value !== undefined) {
                if (typeof value === 'string') {
                  processed[key] = value.trim();
                } else {
                  processed[key] = value;
                }
              }
            }
            return {
              original: data,
              processed: processed
            };
          }
          return data;
        }
      }),
      new DocumentProcessingAgent({
        id: 'document_processor',
        name: 'Advanced Document Processor',
        unitId: 'research_unit',
        unitName: 'Research Unit',
        description: 'Processes large documents by breaking them into manageable chunks and creating concise summaries',
        maxChunkSize: 3000,
        maxTokenEstimate: 6000
      })
    ]
  },
  DEVELOPMENT: {
    id: 'development_unit',
    name: 'Development Unit',
    description: 'Responsible for technical implementation and architecture',
    agents: [
      new LLMAgent({
        id: 'architecture_designer',
        name: 'Architecture Designer',
        unitId: 'development_unit',
        unitName: 'Development Unit',
        description: 'Designs system architecture and technical specifications',
        systemPrompt: 'You are a system architect specializing in designing scalable, resilient, and cost-effective system architectures. Your job is to create technical designs that account for security, privacy, and resource constraints.'
      }),
      new APIAgent({
        id: 'hardware_catalog',
        name: 'Hardware Catalog Service',
        unitId: 'development_unit',
        unitName: 'Development Unit',
        description: 'Provides information about available sensors and hardware components',
        endpoint: 'https://api.example.com/hardware-catalog',
        method: 'GET',
        transformRequest: (input) => {
          return {
            requirements: input.requirements || {},
            budget_per_unit: input.budget_per_unit || 100,
            categories: ['travel', 'mobility']
          };
        },
        transformResponse: (response) => {
          if (!response || !response.data) return { error: 'Invalid response' };
          
          // Simulate a hardware catalog with travel accessories
          return {
            hardware_options: [
              {
                id: 'sen-tr1000',
                name: 'Basic Ergonomic Handle',
                price: 35.99,
                power: 'No power required',
                connectivity: 'N/A',
                features: ['Ergonomic grip', 'Slip-resistant coating'],
                suitable_for: 'Basic travel comfort for elderly users'
              },
              {
                id: 'sen-tr2000',
                name: 'Smart Handle System',
                price: 149.99,
                power: 'Battery (6 months)',
                connectivity: 'Bluetooth',
                features: ['Ergonomic grip', 'Fall detection', 'Location tracking', 'Emergency alert'],
                suitable_for: 'Enhanced safety and tracking features for elderly travelers'
              },
              {
                id: 'sen-tr3000',
                name: 'Premium Travel Assistant',
                price: 299.99,
                power: 'Rechargeable battery with 2-week life',
                connectivity: 'Bluetooth, WiFi, Cellular',
                features: ['Voice control', 'GPS tracking', 'Fall prevention', 'Health monitoring', 'Emergency services connection'],
                suitable_for: 'Complete travel assistance system for elderly with mobility or health concerns'
              }
            ],
            compatible_platforms: ['iOS', 'Android', 'Custom embedded systems']
          };
        }
      })
    ]
  },
  COMMUNITY: {
    id: 'community_unit',
    name: 'Community Engagement Unit',
    description: 'Responsible for volunteer coordination and community outreach',
    agents: [
      new LLMAgent({
        id: 'engagement_strategist',
        name: 'Community Engagement Strategist',
        unitId: 'community_unit',
        unitName: 'Community Engagement Unit',
        description: 'Develops strategies for community involvement and volunteer participation',
        systemPrompt: 'You are a community engagement specialist experienced in developing strategies that encourage participation, volunteer recruitment, and long-term engagement in collaborative projects. Your role is to create plans that connect stakeholders and build sustainable communities around initiatives.'
      }),
      new DataProcessingAgent({
        id: 'location_optimizer',
        name: 'Deployment Location Optimizer',
        unitId: 'community_unit',
        unitName: 'Community Engagement Unit',
        description: 'Analyzes community demographics and environmental factors to suggest optimal sensor deployment locations',
        processingFunction: (data) => {
          // Generate simulated optimal locations for sensor deployment
          const generateLocations = (count: number) => {
            // Centered around NYC with some variation
            return Array(count).fill(0).map((_, i) => {
              // Generate stable but seemingly random coordinates
              const hash = crypto.createHash('md5').update(`location-${i}`).digest('hex');
              const lat = 40.7128 + (parseInt(hash.substring(0, 8), 16) % 1000 - 500) / 10000;
              const lng = -74.0060 + (parseInt(hash.substring(8, 16), 16) % 1000 - 500) / 10000;
              
              const locationTypes = ['School', 'Park', 'Community Center', 'Library', 'Government Building'];
              const type = locationTypes[parseInt(hash.substring(16, 18), 16) % locationTypes.length];
              
              return {
                id: `loc-${i+1}`,
                name: `${type} ${i+1}`,
                lat,
                lng,
                type,
                priority: parseInt(hash.substring(18, 20), 16) % 10 + 1, // 1-10 priority
                recommended_sensor: parseInt(hash.substring(20, 22), 16) % 3 === 0 ? 'sen-tr3000' : 
                                   parseInt(hash.substring(20, 22), 16) % 3 === 1 ? 'sen-tr2000' : 'sen-tr1000'
              };
            });
          };
          
          // Determine how many locations to generate based on input data
          const count = data.coverage === 'high' ? 20 : 
                        data.coverage === 'medium' ? 12 : 
                        data.coverage === 'low' ? 5 : 10;
          
          return {
            recommended_locations: generateLocations(count),
            coverage_analysis: {
              total_locations: count,
              estimated_coverage_area: `${count * 0.5} square miles`,
              population_reached_estimate: count * 5000,
              priority_areas_covered: count > 15 ? 'High' : count > 8 ? 'Medium' : 'Low'
            }
          };
        }
      })
    ]
  },
  DATA: {
    id: 'data_unit',
    name: 'Data Management Unit',
    description: 'Responsible for data storage, processing, and visualization',
    agents: [
      new LLMAgent({
        id: 'data_architect',
        name: 'Data Architect',
        unitId: 'data_unit',
        unitName: 'Data Management Unit',
        description: 'Designs data management architecture and policies',
        systemPrompt: 'You are a data architect specializing in designing data storage solutions, access protocols, and data governance policies. Your role is to ensure data integrity, privacy, and accessibility across technical systems.'
      }),
      new VisualizationAgent({
        id: 'chart_generator',
        name: 'Chart Generator',
        unitId: 'data_unit',
        unitName: 'Data Management Unit',
        description: 'Creates visual charts from sensor data',
        visualizationType: 'chart'
      }),
      new VisualizationAgent({
        id: 'map_generator',
        name: 'Map Generator',
        unitId: 'data_unit',
        unitName: 'Data Management Unit',
        description: 'Creates maps showing sensor deployment and readings',
        visualizationType: 'map'
      })
    ]
  },
  OPERATIONS: {
    id: 'operations_unit',
    name: 'Operations Unit',
    description: 'Responsible for project management and operational decisions',
    agents: [
      new LLMAgent({
        id: 'project_manager',
        name: 'Project Manager',
        unitId: 'operations_unit',
        unitName: 'Operations Unit',
        description: 'Oversees project timeline, resources, and coordination',
        systemPrompt: 'You are a project manager specializing in technical initiatives. Your role is to create implementation plans, coordinate resources, and ensure project milestones are met on time and within budget.'
      }),
      new RuleBasedAgent({
        id: 'budget_optimizer',
        name: 'Budget Optimizer',
        unitId: 'operations_unit',
        unitName: 'Operations Unit',
        description: 'Applies budgeting rules to optimize resource allocation',
        rules: [
          {
            condition: (input) => input.total_budget && input.total_budget < 5000,
            action: (input, context) => {
              return {
                budget_category: 'low',
                recommended_approach: 'community-driven',
                sensor_recommendation: 'primarily basic sensors with strategic deployment of pro sensors',
                sensor_allocation: {
                  'sen-tr1000': Math.floor(input.total_budget * 0.7 / 35.99),
                  'sen-tr2000': Math.floor(input.total_budget * 0.3 / 149.99)
                },
                estimated_coverage: 'limited',
                cost_breakdown: {
                  hardware: input.total_budget * 0.8,
                  training: input.total_budget * 0.1,
                  maintenance: input.total_budget * 0.1
                }
              };
            }
          },
          {
            condition: (input) => input.total_budget && input.total_budget >= 5000 && input.total_budget < 15000,
            action: (input, context) => {
              return {
                budget_category: 'medium',
                recommended_approach: 'hybrid professional/community',
                sensor_recommendation: 'balanced mix of basic, pro and advanced sensors',
                sensor_allocation: {
                  'sen-tr1000': Math.floor(input.total_budget * 0.4 / 35.99),
                  'sen-tr2000': Math.floor(input.total_budget * 0.4 / 149.99),
                  'sen-tr3000': Math.floor(input.total_budget * 0.2 / 299.99)
                },
                estimated_coverage: 'moderate',
                cost_breakdown: {
                  hardware: input.total_budget * 0.7,
                  software: input.total_budget * 0.1,
                  training: input.total_budget * 0.1,
                  maintenance: input.total_budget * 0.1
                }
              };
            }
          },
          {
            condition: (input) => input.total_budget && input.total_budget >= 15000,
            action: (input, context) => {
              return {
                budget_category: 'high',
                recommended_approach: 'professional-grade with community support',
                sensor_recommendation: 'strategic deployment of advanced stations with pro and basic sensors for comprehensive coverage',
                sensor_allocation: {
                  'sen-tr1000': Math.floor(input.total_budget * 0.2 / 35.99),
                  'sen-tr2000': Math.floor(input.total_budget * 0.3 / 149.99),
                  'sen-tr3000': Math.floor(input.total_budget * 0.5 / 299.99)
                },
                estimated_coverage: 'comprehensive',
                cost_breakdown: {
                  hardware: input.total_budget * 0.6,
                  software: input.total_budget * 0.15,
                  training: input.total_budget * 0.1,
                  maintenance: input.total_budget * 0.1,
                  research: input.total_budget * 0.05
                }
              };
            }
          }
        ],
        defaultAction: (input, context) => {
          // Default budget if none specified
          const defaultBudget = 10000;
          return {
            budget_category: 'default',
            warning: 'No budget specified, using default allocation',
            recommended_approach: 'balanced approach',
            sensor_allocation: {
              'sen-tr1000': Math.floor(defaultBudget * 0.4 / 35.99),
              'sen-tr2000': Math.floor(defaultBudget * 0.4 / 149.99),
              'sen-tr3000': Math.floor(defaultBudget * 0.2 / 299.99)
            },
            estimated_coverage: 'moderate',
            cost_breakdown: {
              hardware: defaultBudget * 0.7,
              software: defaultBudget * 0.1,
              training: defaultBudget * 0.1,
              maintenance: defaultBudget * 0.1
            }
          };
        }
      })
    ]
  }
}; 

// Define the workflow stages
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

// Define the workflow stages
const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'requirements_analysis',
    name: 'Requirements Analysis',
    description: 'Analyze project requirements and stakeholder needs',
    unit: UNITS.RESEARCH,
    agent: UNITS.RESEARCH.agents.find(a => a.id === 'requirements_analyzer') as Agent,
    prepareInput: (context) => `
Please analyze the requirements for our environmental monitoring project.

PROJECT INFORMATION:
Domain: ${context.config.DOMAIN}
Objective: ${context.config.OBJECTIVE}
Constraints: ${context.config.CONSTRAINTS}
Target Users: ${context.config.TARGET_USERS}

Generate a comprehensive analysis of the requirements for this project. Include:
1. Key stakeholders and their needs
2. Primary and secondary objectives
3. Critical constraints and limitations
4. Core functional requirements
5. Minimum viable product definition
6. Success criteria

Format your response as JSON with the following keys:
- stakeholders (array of objects with role and needs)
- objectives (object with primary and secondary arrays)
- constraints (array)
- functional_requirements (array)
- mvp_definition (object)
- success_criteria (array)
    `,
    dependencies: [],
    outputKey: 'requirements_analysis'
  },
  {
    id: 'hardware_catalog_search',
    name: 'Hardware Catalog Search',
    description: 'Retrieve available sensor options from hardware catalog',
    unit: UNITS.DEVELOPMENT,
    agent: UNITS.DEVELOPMENT.agents.find(a => a.id === 'hardware_catalog') as Agent,
    prepareInput: (context) => {
      console.log('Hardware catalog prepareInput called with requirements:', !!context.outputs.requirements_analysis);
      
      // Safety check - ensure requirements_analysis exists
      const requirements = context.outputs?.requirements_analysis || {
        stakeholders: [],
        objectives: { primary: [], secondary: [] },
        constraints: []
      };
      
      return {
        requirements: requirements,
        budget_per_unit: 100
      };
    },
    dependencies: ['requirements_analysis'],
    outputKey: 'hardware_catalog'
  },
  {
    id: 'community_strategy',
    name: 'Community Engagement Strategy',
    description: 'Develop strategy for community involvement',
    unit: UNITS.COMMUNITY,
    agent: UNITS.COMMUNITY.agents.find(a => a.id === 'engagement_strategist') as Agent,
    prepareInput: (context) => {
      // Safely extract requirements data, providing defaults if not available
      const requirementsAnalysis = context.outputs?.requirements_analysis || {
        stakeholders: [{ role: 'community members', needs: 'easy participation' }],
        objectives: { primary: ['improve air quality awareness'], secondary: ['educate public'] },
        constraints: ['limited budget', 'volunteer-based'],
        functional_requirements: ['simple data collection', 'accessible results']
      };
      
      return `
Develop a comprehensive community engagement strategy for our environmental monitoring project.

PROJECT INFORMATION:
Domain: ${context.config.DOMAIN}
Objective: ${context.config.OBJECTIVE}
Constraints: ${context.config.CONSTRAINTS}
Target Users: ${context.config.TARGET_USERS}

REQUIREMENTS ANALYSIS:
${JSON.stringify(requirementsAnalysis, null, 2)}

Please create a community engagement strategy that includes:
1. Stakeholder engagement approach
2. Volunteer recruitment and retention methods
3. Training and education program
4. Communication channels and messaging
5. Incentives for participation
6. Long-term sustainability plan

Format your response as JSON with the following keys:
- engagement_approach (object)
- recruitment_methods (array)
- training_program (object)
- communication_strategy (object)
- incentives (array)
- sustainability_plan (object)
    `;
    },
    dependencies: ['requirements_analysis'],
    outputKey: 'community_strategy'
  },
  {
    id: 'budget_allocation',
    name: 'Budget Allocation',
    description: 'Optimize budget allocation based on requirements and hardware options',
    unit: UNITS.OPERATIONS,
    agent: UNITS.OPERATIONS.agents.find(a => a.id === 'budget_optimizer') as Agent,
    prepareInput: (context) => {
      // Extract requirements and determine an appropriate budget
      const requirements = context.outputs?.requirements_analysis || {
        functional_requirements: ['measure air quality', 'monitor pollution levels'],
        constraints: ['low cost', 'easy to deploy']
      };
      
      // Use the correct output key that matches the previous stage's outputKey
      const hardwareOptions = context.outputs?.hardware_options || {
        sensors: [
          { id: 'sen-tr1000', name: 'Basic Ergonomic Handle', price: 35.99 },
          { id: 'sen-tr2000', name: 'Smart Handle System', price: 149.99 },
          { id: 'sen-tr3000', name: 'Premium Travel Assistant', price: 299.99 }
        ]
      };
      
      // Determine a total budget based on requirements complexity
      let totalBudget = 10000; // Default moderate budget
      
      if (requirements && requirements.functional_requirements) {
        const reqCount = requirements.functional_requirements.length;
        totalBudget = reqCount <= 3 ? 5000 : reqCount >= 8 ? 20000 : 10000;
      }
      
      return {
        total_budget: totalBudget,
        requirements: requirements,
        available_hardware: hardwareOptions,
        project_duration_months: 12
      };
    },
    dependencies: ['requirements_analysis', 'hardware_catalog_search'],
    outputKey: 'budget_allocation'
  },
  {
    id: 'location_optimization',
    name: 'Deployment Location Optimization',
    description: 'Analyze and recommend optimal sensor deployment locations',
    unit: UNITS.COMMUNITY,
    agent: UNITS.COMMUNITY.agents.find(a => a.id === 'location_optimizer') as Agent,
    prepareInput: (context) => {
      const budgetAllocation = context.outputs.budget_allocation;
      let coverage = 'medium'; // Default coverage
      
      if (budgetAllocation && budgetAllocation.budget_category) {
        coverage = budgetAllocation.budget_category === 'high' ? 'high' : 
                   budgetAllocation.budget_category === 'medium' ? 'medium' : 'low';
      }
      
      return {
        coverage: coverage,
        budget_allocation: budgetAllocation,
        community_strategy: context.outputs.community_strategy
      };
    },
    dependencies: ['budget_allocation', 'community_strategy'],
    outputKey: 'deployment_locations'
  },
  {
    id: 'system_architecture',
    name: 'System Architecture Design',
    description: 'Design the system architecture for the project',
    unit: UNITS.DEVELOPMENT,
    agent: UNITS.DEVELOPMENT.agents.find(a => a.id === 'architecture_designer') as Agent,
    prepareInput: (context) => `
Design a system architecture for our project.

PROJECT INFORMATION:
Objective: ${context.config.OBJECTIVE}
Constraints: ${context.config.CONSTRAINTS}

REQUIREMENTS:
${JSON.stringify(context.outputs.requirements_analysis, null, 2)}

SELECTED HARDWARE:
${JSON.stringify(context.outputs.hardware_catalog, null, 2)}

BUDGET ALLOCATION:
${JSON.stringify(context.outputs.budget_allocation, null, 2)}

DEPLOYMENT LOCATIONS:
${JSON.stringify(context.outputs.location_optimization?.recommended_locations?.slice(0, 3) || [], null, 2)}
(${context.outputs.location_optimization?.recommended_locations?.length || 0} total locations)

Please design a comprehensive system architecture that includes:
1. Overall architecture diagram (textual description)
2. Data collection and transmission approach
3. Server infrastructure and data storage
4. Security and privacy considerations
5. Scalability and maintenance strategy
6. Technical components and their interactions
7. Required software and services

Format your response as JSON with the following keys:
- architecture_overview
- data_flow (object)
- infrastructure (object)
- security_approach (object)
- scalability_strategy (object)
- components (array of component objects)
- software_services (array)
- implementation_phases (array)
    `,
    dependencies: ['requirements_analysis', 'hardware_catalog_search', 'budget_allocation', 'location_optimization'],
    outputKey: 'system_architecture'
  },
  {
    id: 'data_management_plan',
    name: 'Data Management Plan',
    description: 'Develop a comprehensive data management plan for the project',
    unit: UNITS.DATA,
    agent: UNITS.DATA.agents.find(a => a.id === 'data_architect') as Agent,
    prepareInput: (context) => `
Create a comprehensive data management plan for our project.

PROJECT INFORMATION:
Objective: ${context.config.OBJECTIVE}
Target Users: ${context.config.TARGET_USERS}

REQUIREMENTS:
${JSON.stringify(context.outputs.requirements_analysis, null, 2)}

SYSTEM ARCHITECTURE:
${JSON.stringify(context.outputs.system_architecture, null, 2)}

Please develop a data management plan that includes:
1. Data collection protocols and frequency
2. Data storage architecture
3. Data processing and analysis pipelines
4. Data access and sharing policies
5. Privacy and security measures
6. Data retention and archiving policies
7. Quality control and validation processes

Format your response as JSON with the following keys:
- collection_protocols (object)
- storage_architecture (object)
- processing_pipelines (array)
- access_policies (object)
- privacy_security (object)
- retention_policies (object)
- quality_control (object)
    `,
    dependencies: ['requirements_analysis', 'system_architecture'],
    outputKey: 'data_management_plan'
  },
  {
    id: 'deployment_map',
    name: 'Deployment Map Generation',
    description: 'Generate a map visualization of sensor deployment locations',
    unit: UNITS.DATA,
    agent: UNITS.DATA.agents.find(a => a.id === 'map_generator') as Agent,
    prepareInput: (context) => {
      return {
        locations: context.outputs.deployment_locations?.recommended_locations || [],
        project_name: context.config.OBJECTIVE || 'Project',
        architecture: context.outputs.system_architecture
      };
    },
    dependencies: ['location_optimization', 'system_architecture'],
    outputKey: 'deployment_map'
  },
  {
    id: 'sensor_allocation_analysis',
    name: 'Sensor Allocation Analysis',
    description: 'Process and visualize the sensor allocation data',
    unit: UNITS.DATA,
    agent: UNITS.DATA.agents.find(a => a.id === 'chart_generator') as Agent,
    prepareInput: (context) => {
      const budgetAllocation = context.outputs.budget_allocation;
      if (!budgetAllocation || !budgetAllocation.sensor_allocation) {
        return {
          title: 'Sensor Allocation (Default)',
          data: [
            { sensor: 'Basic', quantity: 20 },
            { sensor: 'Pro', quantity: 12 },
            { sensor: 'Advanced', quantity: 5 }
          ]
        };
      }
      
      const sensorAllocation = budgetAllocation.sensor_allocation;
      return [
        { sensor: 'Basic (TR1000)', quantity: sensorAllocation['sen-tr1000'] || 0 },
        { sensor: 'Pro (TR2000)', quantity: sensorAllocation['sen-tr2000'] || 0 },
        { sensor: 'Advanced (TR3000)', quantity: sensorAllocation['sen-tr3000'] || 0 }
      ];
    },
    dependencies: ['budget_allocation'],
    outputKey: 'sensor_allocation_chart'
  },
  {
    id: 'implementation_plan',
    name: 'Implementation Plan',
    description: 'Develop project implementation plan with timeline and resources',
    unit: UNITS.OPERATIONS,
    agent: UNITS.OPERATIONS.agents.find(a => a.id === 'project_manager') as Agent,
    prepareInput: (context) => `
Create a comprehensive implementation plan for our project.

PROJECT INFORMATION:
Domain: ${context.config.DOMAIN}
Objective: ${context.config.OBJECTIVE}
Constraints: ${context.config.CONSTRAINTS}
Target Users: ${context.config.TARGET_USERS}

You have access to all previous outputs from the workflow. Create a detailed implementation plan that includes:

1. Project phases and timeline
2. Major milestones and deliverables
3. Resource allocation plan
4. Roles and responsibilities
5. Risk management approach
6. Success metrics and evaluation
7. Sustainability and maintenance strategy

Format your response as JSON with the following structure:
- executive_summary
- project_phases (array of phase objects)
- timeline (object with key dates)
- milestones (array)
- resources (object)
- roles_responsibilities (object)
- risk_management (object)
- success_metrics (array)
- sustainability_strategy (object)
    `,
    dependencies: [
      'requirements_analysis',
      'hardware_catalog_search',
      'community_strategy',
      'budget_allocation',
      'location_optimization',
      'system_architecture',
      'data_management_plan',
      'deployment_map',
      'sensor_allocation_analysis'
    ],
    outputKey: 'implementation_plan'
  },
  {
    id: 'final_deliverable',
    name: 'Final Project Documentation',
    description: 'Compile comprehensive project documentation',
    unit: UNITS.RESEARCH,
    agent: UNITS.RESEARCH.agents.find(a => a.id === 'data_preprocessor') as Agent,
    prepareInput: (context) => {
      // Compile and format all the outputs into a structured project document
      const finalDeliverable = {
        project_title: context.config.OBJECTIVE,
        project_summary: context.outputs.requirements_analysis?.mvp_definition?.summary || "Project summary not available",
        version: "1.0 - Initial Project Documentation",
        
        sections: [
          {
            title: "Project Requirements",
            content: context.outputs.requirements_analysis
          },
          {
            title: "Hardware Selection",
            content: context.outputs.hardware_options
          },
          {
            title: "Research Community Engagement Strategy",
            content: context.outputs.community_strategy
          },
          {
            title: "Budget Allocation",
            content: context.outputs.budget_allocation
          },
          {
            title: "Laboratory Deployment Strategy",
            content: {
              locations: context.outputs.deployment_locations,
              map: context.outputs.deployment_map
            }
          },
          {
            title: "Technical Architecture",
            content: context.outputs.system_architecture
          },
          {
            title: "Data Management",
            content: context.outputs.data_management_plan
          },
          {
            title: "Implementation Plan",
            content: context.outputs.implementation_plan
          }
        ],
        
        visualizations: [
          context.outputs.deployment_map,
          context.outputs.sensor_allocation_chart
        ],
        
        generated_timestamp: new Date().toISOString(),
        workflow_id: runId
      };
      
      return finalDeliverable;
    },
    dependencies: ['implementation_plan'],
    outputKey: 'final_project_documentation'
  },
  {
    id: 'realtime_air_quality_integration',
    name: 'Real-time Neural Data Integration',
    description: 'Retrieve sample neural data and integrate it into the project',
    unit: UNITS.DATA,
    agent: new APIAgent({
      id: 'neural_data_integrator',
      name: 'Neural Data Integrator',
      unitId: 'data_unit',
      unitName: 'Data Management Unit',
      description: 'Retrieves neural imaging data from example sources and integrates it into the system',
      endpoint: 'https://api.example.com/air-quality', // Reusing the mock endpoint
      method: 'GET',
      transformRequest: (input) => {
        // Extract deployment locations from project context
        const locations = input.deployment_locations?.recommended_locations || [];
        // Pick 3 representative locations for the demo
        const sampleLocations = locations.slice(0, 3);
        
        return {
          locations: sampleLocations.map((loc: {lat: number; lng: number; name: string}) => ({
            lat: loc.lat, 
            lng: loc.lng,
            name: loc.name
          })),
          parameters: ['neuronal_activity', 'synapse_density', 'neural_integrity', 'cellular_viability', 'imaging_quality'],
          timeframe: 'current'
        };
      },
      transformResponse: (response) => {
        // Simulate a real-time neural data API response
        if (!response || !response.data) return { error: 'Invalid response' };
        
        // Generate semi-realistic neural data based on timestamp for determinism
        const generateNeuralData = (locationName: string, timestamp: string) => {
          const seed = crypto.createHash('md5').update(locationName + timestamp).digest('hex');
          const seedNum = parseInt(seed.substring(0, 8), 16);
          
          return {
            neuronal_activity: (75 + (seedNum % 25)) * (1 + Math.sin(seedNum % 10) * 0.2),
            synapse_density: (450 + (seedNum % 150)) * (1 + Math.cos(seedNum % 10) * 0.15),
            neural_integrity: (85 + (seedNum % 15)) * 0.01 * (1 + Math.sin(seedNum % 7) * 0.1),
            cellular_viability: (90 + (seedNum % 10)) * 0.01 * (1 + Math.cos(seedNum % 8) * 0.05),
            imaging_quality: (0.8 + (seedNum % 2) * 0.1) * (1 + Math.sin(seedNum % 5) * 0.1),
            quality_index: 85 + (seedNum % 15),
            category: ['Excellent', 'Good', 'Acceptable'][seedNum % 3],
            timestamp: new Date().toISOString()
          };
        };
        
        const timestamp = new Date().toISOString().split('T')[0];
        const requestedLocations = response.data.locations || [];
        
        return {
          data_source: 'Simulated Neural Imaging Data',
          retrieved_at: new Date().toISOString(),
          locations: requestedLocations.map((loc: any) => ({
            name: loc.name,
            coordinates: {
              lat: loc.lat,
              lng: loc.lng
            },
            readings: generateNeuralData(loc.name, timestamp)
          })),
          metadata: {
            data_quality: 'high',
            units: {
              neuronal_activity: 'Hz',
              synapse_density: 'count/μm³',
              neural_integrity: 'percent',
              cellular_viability: 'percent',
              imaging_quality: 'resolution index',
              quality_index: 'QI (0-100)'
            }
          },
          analysis_summary: "Neural sample data demonstrates high viability and integrity across samples. Imaging quality is suitable for detailed analysis."
        };
      }
    }),
    prepareInput: (context) => {
      return {
        project_info: {
          title: "Smart Carry-on Suitcase for Elderly Travelers",
          objective: context.config.OBJECTIVE
        },
        deployment_locations: context.outputs.deployment_locations,
        system_architecture: context.outputs.system_architecture
      };
    },
    dependencies: ['location_optimization', 'system_architecture', 'final_deliverable'],
    outputKey: 'realtime_neural_data'
  },
  {
    id: 'enhanced_project_documentation',
    name: 'Enhanced Project Documentation with Real-time Data',
    description: 'Update project documentation with real-time air quality data and insights',
    unit: UNITS.RESEARCH,
    agent: UNITS.RESEARCH.agents.find(a => a.id === 'requirements_analyzer') as Agent,
    prepareInput: (context) => {
      // Extract only essential information to reduce token usage
      const neuralData = context.outputs?.realtime_neural_data || {};
      const projectDoc = context.outputs?.final_project_documentation || {};
      
      // Further simplified summary of the project documentation
      const docSummary = {
        title: projectDoc?.project_title || context.config.OBJECTIVE || "Organic Fertilizer Project",
        summary: projectDoc?.project_summary ? 
          (projectDoc.project_summary.substring(0, 250) + "...") : 
          "Project summary not available",
        version: projectDoc?.version || "1.0",
        key_sections: (projectDoc?.sections || []).slice(0, 3).map((s: any) => s?.title || "Unnamed Section")
      };
      
      // Further simplified summary of the real-time data
      const dataSummary = {
        source: neuralData?.data_source || "Local Sensors",
        retrieved_at: neuralData?.retrieved_at || new Date().toISOString(),
        sample_location: neuralData?.locations?.[0] ? {
          name: neuralData.locations[0]?.name || "Unknown Location",
          readings: neuralData.locations[0]?.readings || {}
        } : { name: "No location data available", readings: {} }
      };
      
      return `
Enhance project documentation with real-time neural data insights.

PROJECT: ${context.config.DOMAIN} - ${docSummary.title}
OBJECTIVE: ${context.config.OBJECTIVE}

KEY DATA POINTS:
- Data source: ${dataSummary.source}
- Retrieved: ${dataSummary.retrieved_at}
- Sample location: ${dataSummary.sample_location.name}

PROJECT SUMMARY: ${docSummary.summary}

Add a "Real-time Monitoring" section with these insights:
1. Current neural data conditions based on sample data
2. How stakeholders can use this real-time data
3. Future enhancement recommendations

Format as JSON:
{
  "enhanced_documentation": {
    "title": "${docSummary.title}",
    "version": "2.0",
    "new_sections": [
      {
        "title": "Real-time Monitoring Capabilities",
        "content": { "key_points": [...], "benefits": [...] }
      }
    ],
    "recommendations": [...]
  }
}
`;
    },
    dependencies: ['final_deliverable', 'realtime_air_quality_integration'],
    outputKey: 'enhanced_project_documentation'
  },
  {
    id: 'advanced_document_summarization',
    name: 'Executive Summary Generation',
    description: 'Advanced summarization of the project documentation to create an executive summary',
    unit: UNITS.RESEARCH,
    agent: new DocumentProcessingAgent({
      id: 'advanced_document_processor',
      name: 'Advanced Document Processor',
      unitId: 'research_unit',
      unitName: 'Research Unit',
      description: 'Processes and summarizes long documents through chunking and advanced extraction',
      maxChunkSize: 6000,
      maxTokenEstimate: 9000
    }),
    prepareInput: (context) => {
      const projectDoc = context.outputs?.enhanced_project_documentation || context.outputs?.final_project_documentation || {};
      const projectName = "Smart Carry-on Suitcase for Elderly Travelers";
      
      // Create a combined document from various outputs
      let document = `# ${projectName}
## Version: 2.0
      
${projectDoc?.sections?.map((section: {title: string; content: any}) => 
  `### ${section.title}\n${JSON.stringify(section.content, null, 2)}\n`
).join('\n') || 'No sections available'}

## Real-time Usage Data
${JSON.stringify(context.outputs?.realtime_usage_data || {}, null, 2)}
`;
      
      return {
        document,
        instructions: `
Generate a concise executive summary of this project documentation for the ${projectName}. 
Focus on key design elements, ergonomic features, and smart technology integration.
Highlight the elderly-friendly design, safety features, and travel accessibility improvements.
The summary should be suitable for travel industry stakeholders and elderly care specialists.
`,
        title: projectName,
        version: "2.0"
      };
    },
    dependencies: ['enhanced_project_documentation'],
    outputKey: 'executive_summary'
  },
  {
    id: 'project_visualization',
    name: 'Project Visualization',
    description: 'Creates visual representations of the project plan and deployment map',
    unit: UNITS.OPERATIONS,
    agent: new ImageGenerationAgent(
      'project_visualizer',
      'Project Visualization Generator',
      'operations_unit',
      'Operations Unit',
      'Generates visual representations of the project',
      new OpenAIClient(),
      path.join(outputDir, 'images')
    ),
    dependencies: ['implementation_plan', 'deployment_map'],
    outputKey: 'project_visualizations',
    prepareInput: (context: WorkflowContext) => {
      const deploymentMap = context.outputs.deployment_map || {};
      const implementationPlan = context.outputs.implementation_plan || {};
      const projectId = context.config.PROJECT_ID || 'smart-elderly-suitcase';
      
      return {
        project_name: projectId,
        deployment_locations: deploymentMap.recommended_locations || [],
        project_phases: implementationPlan.phases || [],
        prompts: [
          {
            type: 'logo',
            prompt: `Create a modern, minimalist logo for a product related to "${context.config.DOMAIN}". The logo should be professional and incorporate elements relevant to the objective: "${context.config.OBJECTIVE}".`,
            filename: `logo.png`
          },
          {
            type: 'product',
            prompt: `A realistic product visualization related to: "${context.config.OBJECTIVE}". Show key features that address the constraints: "${context.config.CONSTRAINTS}".`,
            filename: `system.png`
          },
          {
            type: 'abstract',
            prompt: `A graphical abstract showing the features and benefits of a solution for: "${context.config.OBJECTIVE}". Include illustrations of key design elements and how it helps the target users: "${context.config.TARGET_USERS}".`,
            filename: `abstract.png`
          }
        ]
      };
    }
  },
  {
    id: 'realtime_usage_data_integration',
    name: 'Real-time Usage Data Integration',
    description: 'Integrates real-time usage data from prototype testing',
    unit: UNITS.DATA,
    agent: new APIAgent({
      id: 'usage_data_integrator',
      name: 'Usage Data Integrator',
      unitId: 'data_unit',
      unitName: 'Data Management Unit',
      description: 'Integrates real-time usage data from prototype testing into the system',
      endpoint: 'https://api.example.com/usage-data',
      method: 'GET',
      transformRequest: (input) => {
        // Cannot access workflow context here directly, so we use input or defaults
        return {
          project_id: input.project_id || input.project_info?.title || 'project',
          location: input.location || 'testing_facility',
          prototype_id: input.prototype_id || 'prototype_v1',
          user_demographic: input.project_info?.target_users?.split(',')[0] || 'users',
          data_points: ['feature1', 'feature2', 'feature3', 'feature4']
        };
      },
      transformResponse: (response) => {
        // Simulate a real-time usage data API response
        if (!response || !response.data) return { error: 'Invalid response' };
        
        // Generate semi-realistic usage data based on timestamp for determinism
        const generateUsageData = (locationName: string, timestamp: string) => {
          // Use locationName to create deterministic but seemingly random values
          const hash = crypto.createHash('md5').update(locationName + timestamp).digest('hex');
          const seedNum = parseInt(hash.substring(0, 8), 16);
          
          // Effectiveness metrics
          const nutrientReleaseRate = Math.floor(seedNum % 10) + 70; // 70-79% release rate
          const soilRetention = Math.floor((seedNum % 15) + 75); // 75-89% retention
          
          // Composition metrics
          const organicContent = Math.floor((seedNum % 20) + 75); // 75-94% organic
          const nutrientBalance = Math.floor((seedNum % 15) + 80); // 80-94% balance
          
          // Application metrics
          const easeOfApplication = Math.floor((seedNum % 25) + 70); // 70-94% ease of use
          const dissolveRate = Math.floor((seedNum % 20) + 75); // 75-94% dissolve rate
          
          // Environmental impact metrics
          const leachingPrevention = Math.floor((seedNum % 30) + 60); // 60-89% prevention
          const biodegradability = Math.floor((seedNum % 15) + 80); // 80-94% biodegradable
          
          return {
            effectiveness: {
              nutrient_release_rate: nutrientReleaseRate,
              soil_retention: soilRetention,
              overall_effectiveness: Math.floor((nutrientReleaseRate + soilRetention) / 2)
            },
            composition: {
              organic_content: organicContent,
              nutrient_balance: nutrientBalance,
              overall_composition: Math.floor((organicContent + nutrientBalance) / 2)
            },
            application: {
              ease_of_application: easeOfApplication,
              dissolve_rate: dissolveRate,
              overall_application: Math.floor((easeOfApplication + dissolveRate) / 2)
            },
            environmental_impact: {
              leaching_prevention: leachingPrevention,
              biodegradability: biodegradability,
              overall_impact: Math.floor((leachingPrevention + biodegradability) / 2)
            },
            quality_index: 85 + (seedNum % 15),
            category: ['Excellent', 'Good', 'Acceptable'][seedNum % 3],
            timestamp: new Date().toISOString()
          };
        };
        
        const timestamp = new Date().toISOString().split('T')[0];
        const requestedLocations = response.data.locations || [];
        
        return {
          data_source: 'Prototype Testing Data',
          retrieved_at: new Date().toISOString(),
          locations: requestedLocations.map((loc: any) => ({
            name: loc.name,
            coordinates: {
              lat: loc.lat,
              lng: loc.lng
            },
            metrics: generateUsageData(loc.name, timestamp)
          })),
          metadata: {
            data_quality: 'high',
            units: {
              effectiveness: 'percent efficiency',
              composition: 'percent organic content',
              application: 'percent ease of use',
              environmental_impact: 'percent sustainability',
              quality_index: 'QI (0-100)'
            }
          },
          analysis_summary: "Prototype testing demonstrates high effectiveness in nutrient release and soil retention. Environmental impact metrics show strong performance in preventing nutrient leaching in waterlogged conditions."
        };
      }
    }),
    prepareInput: (context) => {
      return {
        project_info: {
          title: context.config.OBJECTIVE,
          objective: context.config.OBJECTIVE,
          target_users: context.config.TARGET_USERS
        },
        deployment_locations: context.outputs.deployment_locations,
        system_architecture: context.outputs.system_architecture
      };
    },
    dependencies: ['location_optimization', 'system_architecture', 'final_deliverable'],
    outputKey: 'realtime_usage_data'
  },
  {
    id: 'enhanced_project_documentation',
    name: 'Enhanced Project Documentation with Real-time Data',
    description: 'Update project documentation with real-time usage data and insights',
    unit: UNITS.RESEARCH,
    agent: UNITS.RESEARCH.agents.find(a => a.id === 'requirements_analyzer') as Agent,
    prepareInput: (context) => {
      // Extract only essential information to reduce token usage
      const usageData = context.outputs?.realtime_usage_data || {};
      const projectDoc = context.outputs?.final_project_documentation || {};
      
      // Further simplified summary of the project documentation
      const docSummary = {
        title: projectDoc?.project_title || "Organic Fertilizer Project",
        summary: projectDoc?.project_summary ? 
          (projectDoc.project_summary.substring(0, 250) + "...") : 
          "Project summary not available",
        version: projectDoc?.version || "1.0",
        key_sections: (projectDoc?.sections || []).slice(0, 3).map((s: any) => s?.title || "Unnamed Section")
      };
      
      // Further simplified summary of the real-time data
      const dataSummary = {
        source: usageData?.data_source || "Prototype Testing",
        retrieved_at: usageData?.retrieved_at || new Date().toISOString(),
        sample_location: usageData?.locations?.[0] ? {
          name: usageData.locations[0]?.name || "Unknown Location",
          metrics: usageData.locations[0]?.metrics || {}
        } : { name: "No location data available", metrics: {} }
      };
      
      return `
Enhance project documentation with real-time usage data insights.

PROJECT: ${context.config.DOMAIN} - ${docSummary.title}
OBJECTIVE: ${context.config.OBJECTIVE}

KEY DATA POINTS:
- Data source: ${dataSummary.source}
- Retrieved: ${dataSummary.retrieved_at}
- Sample location: ${dataSummary.sample_location.name}

PROJECT SUMMARY: ${docSummary.summary}

Add a "Real-time Monitoring" section with these insights:
1. Current usage data metrics based on prototype testing
2. How stakeholders can use this real-time data
3. Future enhancement recommendations

Format as JSON:
{
  "enhanced_documentation": {
    "title": "${docSummary.title}",
    "version": "2.0",
    "new_sections": [
      {
        "title": "Real-time Monitoring Capabilities",
        "content": { "key_points": [...], "benefits": [...] }
      }
    ],
    "recommendations": [...]
  }
}
`;
    },
    dependencies: ['final_deliverable', 'realtime_usage_data_integration'],
    outputKey: 'enhanced_project_documentation'
  }
]; 

/**
 * Generate visual representation of the workflow
 */
function generateWorkflowVisualizations(context: WorkflowContext, outputDir: string): void {
  const logger = new FileLogger('workflow_visualization.log');
  
  // Create mermaid workflow diagram
  let mermaidDiagram = 'graph TD;\n';
  
  // Unique colors for each unit
  const unitColors: Record<string, string> = {
    'research_unit': '#90CAF9',
    'development_unit': '#A5D6A7',
    'community_unit': '#FFCC80',
    'data_unit': '#CE93D8',
    'operations_unit': '#EF9A9A'
  };
  
  // Add nodes for each stage
  for (const stage of WORKFLOW_STAGES) {
    const nodeId = stage.id;
    const unitId = stage.unit.id;
    const agentType = stage.agent.constructor.name.replace('Agent', '');
    const isCompleted = !!context.outputs[stage.outputKey];
    
    const borderColor = isCompleted ? '#228B22' : '#808080';
    const fillColor = unitColors[unitId] || '#D3D3D3';
    
    mermaidDiagram += `    ${nodeId}["${stage.name}<br/>(${agentType})<br/>${stage.unit.name}"];\n`;
    mermaidDiagram += `    style ${nodeId} fill:${fillColor},stroke:${borderColor},stroke-width:${isCompleted ? '2px' : '1px'};\n`;
  }
  
  // Add edges for dependencies
  for (const stage of WORKFLOW_STAGES) {
    for (const depId of stage.dependencies) {
      mermaidDiagram += `    ${depId} --> ${stage.id};\n`;
    }
  }
  
  // Write to file
  fs.writeFileSync(path.join(outputDir, 'visualizations', 'workflow_diagram.mmd'), mermaidDiagram);
  
  // Create metrics visualization
  const metricsData = Object.entries(context.metrics.stageMetrics).map(([stageId, metrics]) => {
    const stage = WORKFLOW_STAGES.find(s => s.id === stageId);
    return {
      id: stageId,
      name: stage?.name || stageId,
      unit: stage?.unit.name || 'Unknown',
      agent_type: metrics.agentType,
      duration_ms: metrics.duration || 0,
      duration_formatted: `${((metrics.duration || 0) / 1000).toFixed(2)}s`
    };
  });
  
  // Create HTML visualization
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Hybrid Agent Workflow</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
    .container { max-width: 1200px; margin: 0 auto; }
    .workflow-diagram { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .metrics-section { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .agent-types { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
    .agent-card { flex: 1; min-width: 200px; border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: #f5f5f5; }
    .chart-container { height: 300px; margin-bottom: 20px; }
    h1, h2, h3 { color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .stage-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .stage-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: white; }
    .completed { border-left: 5px solid #4CAF50; }
    .stage-header { display: flex; justify-content: space-between; align-items: center; }
    .agent-type { font-size: 12px; padding: 3px 8px; border-radius: 10px; background: #eee; }
    .LLM { background: #E3F2FD; color: #1565C0; }
    .Data { background: #E8F5E9; color: #2E7D32; }
    .API { background: #FFF3E0; color: #E65100; }
    .Rule { background: #F3E5F5; color: #6A1B9A; }
    .Visualization { background: #FFEBEE; color: #B71C1C; }
    .real-time-data-section { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .data-card { background: #f9f9f9; border-radius: 5px; padding: 15px; }
    .data-overview { margin-bottom: 15px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .data-table th, .data-table td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
    .status-good { background-color: rgba(76, 175, 80, 0.2); color: #2E7D32; }
    .status-moderate { background-color: rgba(255, 193, 7, 0.2); color: #F57F17; }
    .status-unhealthy-for-sensitive-groups { background-color: rgba(255, 152, 0, 0.2); color: #E65100; }
    .data-pending { text-align: center; padding: 20px; color: #777; }
    .executive-summary-section { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .summary-card { background: #f9f9f9; border-radius: 5px; padding: 15px; }
    .summary-content { white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.5; background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px; max-height: 400px; overflow-y: auto; }
    .summary-meta { display: flex; justify-content: space-between; background: #e9e9e9; padding: 10px; border-radius: 5px; }
    .summary-pending { text-align: center; padding: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hybrid Agent Workflow</h1>
      <p>Project: ${context.config.OBJECTIVE || "Project"}</p>
    </div>
    
    <div class="agent-types">
      <div class="agent-card">
        <h3>LLM Agents</h3>
        <p>AI-powered agents that use large language models for complex reasoning and content generation.</p>
      </div>
      <div class="agent-card">
        <h3>Data Processing Agents</h3>
        <p>Specialized agents that transform, analyze, and extract insights from structured data.</p>
      </div>
      <div class="agent-card">
        <h3>API Agents</h3>
        <p>Interface agents that connect to external services and databases to retrieve or submit information.</p>
      </div>
      <div class="agent-card">
        <h3>Rule-based Agents</h3>
        <p>Logic-driven agents that make decisions based on predefined rules and conditions.</p>
      </div>
      <div class="agent-card">
        <h3>Visualization Agents</h3>
        <p>Specialized agents that transform data into visual representations like charts, maps, and diagrams.</p>
      </div>
    </div>
    
    <div class="workflow-diagram">
      <h2>Workflow Diagram</h2>
      <div class="mermaid">
${mermaidDiagram}
      </div>
    </div>
    
    <div class="metrics-section">
      <h2>Processing Metrics</h2>
      <div class="chart-container">
        <canvas id="durationChart"></canvas>
      </div>
    </div>
    
    <h2>Workflow Stages</h2>
    <div class="stage-list">
      ${WORKFLOW_STAGES.map(stage => {
        const isCompleted = !!context.outputs[stage.outputKey];
        const agentType = stage.agent.constructor.name.replace('Agent', '');
        const metrics = context.metrics.stageMetrics[stage.id];
        return `
          <div class="stage-card ${isCompleted ? 'completed' : ''}">
            <div class="stage-header">
              <h3>${stage.name}</h3>
              <span class="agent-type ${agentType}">${agentType}</span>
            </div>
            <p><strong>Unit:</strong> ${stage.unit.name}</p>
            <p><strong>Agent:</strong> ${stage.agent.name}</p>
            <p><strong>Dependencies:</strong> ${stage.dependencies.length ? stage.dependencies.join(', ') : 'None'}</p>
            <p><strong>Status:</strong> ${isCompleted ? 'Completed' : 'Pending'}</p>
            ${metrics ? `<p><strong>Duration:</strong> ${((metrics.duration || 0) / 1000).toFixed(2)}s</p>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="real-time-data-section">
      <h2>Real-time Usage Data</h2>
      <div class="data-card">
        ${context.outputs.realtime_usage_data ? `
          <div class="data-overview">
            <h3>Prototype Testing Data</h3>
            <p>Real-time data retrieved at: ${context.outputs.realtime_usage_data.retrieved_at}</p>
            <p>Monitoring ${context.outputs.realtime_usage_data.locations?.length || 0} location(s)</p>
          </div>
          <div class="data-details">
            <h4>Latest Readings</h4>
            <table class="data-table">
              <tr>
                <th>Location</th>
                <th>Effectiveness</th>
                <th>Composition</th>
                <th>Application</th>
                <th>Environmental Impact</th>
              </tr>
              ${(context.outputs.realtime_usage_data.locations || []).map((loc: {location: string; metrics: {effectiveness: {overall_effectiveness: number}, composition: {overall_composition: number}, application: {overall_application: number}, environmental_impact: {overall_impact: number}}}) => `
                <tr>
                  <td>${loc.location || 'Unknown'}</td>
                  <td>${loc.metrics?.effectiveness?.overall_effectiveness || 0}%</td>
                  <td>${loc.metrics?.composition?.overall_composition || 0}%</td>
                  <td>${loc.metrics?.application?.overall_application || 0}%</td>
                  <td>${loc.metrics?.environmental_impact?.overall_impact || 0}%</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : `
          <div class="data-pending">
            <h3>Real-time Data Integration</h3>
            <p>The real-time data integration hasn't been completed yet.</p>
          </div>
        `}
      </div>
    </div>
    <div class="executive-summary-section">
      <h2>Executive Summary</h2>
      <div class="summary-card">
        ${context.outputs.executive_summary ? `
          <div class="summary-content">
            <pre>${(context.outputs.executive_summary.summary || 'No summary available').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>
          <div class="summary-meta">
            <p><strong>Original Size:</strong> ${context.outputs.executive_summary.original_size || 0} characters</p>
            <p><strong>Compression Ratio:</strong> ${context.outputs.executive_summary.compression_ratio || '1:1'}</p>
            <p><strong>Processed:</strong> ${new Date(context.outputs.executive_summary.processed_at || Date.now()).toLocaleString()}</p>
          </div>
        ` : `
          <div class="summary-pending">
            <p>The executive summary generation hasn't been completed yet.</p>
          </div>
        `}
      </div>
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true });
    
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    new Chart(durationCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(metricsData.map(d => d.name))},
        datasets: [{
          label: 'Processing Time (seconds)',
          data: ${JSON.stringify(metricsData.map(d => (d.duration_ms / 1000).toFixed(2)))},
          backgroundColor: ${JSON.stringify(metricsData.map(d => {
            const unitId = WORKFLOW_STAGES.find(s => s.id === d.id)?.unit.id || '';
            return unitColors[unitId] || '#D3D3D3';
          }))},
          borderColor: ${JSON.stringify(metricsData.map(d => {
            const unitId = WORKFLOW_STAGES.find(s => s.id === d.id)?.unit.id || '';
            return unitColors[unitId]?.replace('9', '6') || '#A9A9A9';
          }))},
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (seconds)'
            }
          },
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'visualizations', 'workflow_dashboard.html'), htmlContent);
  
  // Create JSON file with all outputs
  fs.writeJsonSync(path.join(outputDir, 'workflow_outputs.json'), context.outputs, { spaces: 2 });
  
  logger.info('Generated workflow visualizations');
}

/**
 * Main function to run the hybrid agent workflow
 */
async function runHybridAgentWorkflow() {
  console.log('Starting Hybrid Agent Workflow...');
  
  // Set the global outputDir
  outputDir = path.join(__dirname, '../output/' + runId);
  
  // Ensure OpenAI API key is set
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
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
  fs.ensureDirSync(path.join(outputDir, 'images'));
  fs.ensureDirSync(path.join(outputDir, 'intermediates'));
  fs.ensureDirSync(path.join(outputDir, 'templates'));
  
  const workflowConfig = {
    PROJECT_ID: PROJECT_CONFIG.OBJECTIVE ? PROJECT_CONFIG.OBJECTIVE.toLowerCase().split(' ').slice(0, 3).join('-') : 'project',
    VERSION: '1.0.0',
    DOMAIN: PROJECT_CONFIG.DOMAIN,
    OBJECTIVE: PROJECT_CONFIG.OBJECTIVE,
    ORGANIZATION: 'Research Initiative',
    OUTPUT_DIR: outputDir,
    OPENAI_API_KEY: openaiApiKey,
    // Required properties from PROJECT_CONFIG
    CONSTRAINTS: PROJECT_CONFIG.CONSTRAINTS,
    TARGET_USERS: PROJECT_CONFIG.TARGET_USERS,
    // Set model configurations based on available API key
    LLM_CONFIG: PROJECT_CONFIG.LLM_CONFIG
  };
  
  try {
    // Create logger for this workflow run
    const logger = new FileLogger(path.join(outputDir, 'workflow.log'));
    
    // Get workflow engine instance
    const workflowEngine = WorkflowEngine.getInstance({
      logger,
      templateDirectory: path.join(outputDir, 'templates')
    });
    
    // Register a task executor for our agent tasks
    workflowEngine.registerTaskExecutor('execute', async (task, context) => {
      try {
        logger.info(`Executing task: ${task.name}`);
        
        // Extract parameters
        const agent = task.parameters?.agent;
        const prepareInput = task.parameters?.prepareInput;
        const outputKey = task.parameters?.outputKey;
        
        if (!agent || !prepareInput || !outputKey) {
          throw new Error(`Missing required parameters for task ${task.id}`);
        }
        
        // Prepare input using the prepareInput function
        const input = prepareInput(context);
        
        // Process with the agent
        const output = await agent.process(input, {
          ...context,
          logger: logger,
          currentStage: task.id
        });
        
        // Store the output in the context
        if (!context.outputs) {
          context.outputs = {};
        }
        
        // Save the result with the specified outputKey
        context.outputs[outputKey] = output;
        
        // Return success with the output
        return {
          success: true,
          result: output
        };
      } catch (error) {
        logger.error(`Error executing task ${task.id}: ${error}`);
        return {
          success: false,
          error: String(error)
        };
      }
    });
    
    // Create workflow from our stages
    const workflow = workflowEngine.createWorkflow({
      name: PROJECT_CONFIG.OBJECTIVE,
      version: '1.0.0',
      tasks: WORKFLOW_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        unitId: stage.unit.id,
        action: 'execute',
        parameters: {
          agent: stage.agent,
          prepareInput: stage.prepareInput,
          outputKey: stage.outputKey
        },
        dependencies: stage.dependencies,
        metadata: {
          agent_type: stage.agent.constructor.name
        }
      }))
    }, {
      context: {
        config: workflowConfig,
        units: UNITS,
        outputs: {} // Initialize with an empty outputs object
      },
      autoStart: false
    });
    
    // Start and await workflow completion
    workflowEngine.startWorkflow(workflow.id);
    
    // Wait for workflow to complete
    let workflowCompleted = false;
    while (!workflowCompleted) {
      const currentWorkflow = workflowEngine.getWorkflow(workflow.id);
      if (currentWorkflow) {
        if (currentWorkflow.status === 'completed' || currentWorkflow.status === 'failed') {
          workflowCompleted = true;
          logger.info(`Workflow ${currentWorkflow.status} with ID: ${workflow.id}`);
        } else {
          // Wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        throw new Error(`Workflow with ID ${workflow.id} not found`);
      }
    }
    
    // Get the final workflow state
    const finalWorkflow = workflowEngine.getWorkflow(workflow.id);
    if (!finalWorkflow) {
      throw new Error(`Workflow with ID ${workflow.id} not found`);
    }
    
    // Save all task results to a comprehensive output file
    const results = Object.fromEntries(
      finalWorkflow.tasks
        .filter(task => task.result && task.status === 'completed')
        .map(task => [task.parameters?.outputKey || task.id, task.result])
    );
    
    fs.writeJsonSync(path.join(outputDir, 'workflow_outputs.json'), results, { spaces: 2 });
    
    // Generate visualizations with the results
    generateWorkflowVisualizations({
      config: workflowConfig,
      outputs: results,
      logger,
      eventSystem: EventSystem.getInstance(),
      startTime: Date.now(),
      metrics: {
        stageMetrics: Object.fromEntries(
          finalWorkflow.tasks.map(task => [
            task.id, 
            {
              startTime: task.startTime || 0,
              endTime: task.endTime || 0,
              duration: task.startTime && task.endTime ? task.endTime - task.startTime : 0,
              agentType: task.metadata?.agent_type || 'Unknown'
            }
          ])
        )
      }
    }, outputDir);
    
    return outputDir;
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}

// Run the workflow and handle any errors
runHybridAgentWorkflow()
  .then(outputDir => {
    console.log(`✅ Hybrid agent workflow completed successfully. Results saved to: ${outputDir}`);
    // Force the process to exit cleanly
    setTimeout(() => process.exit(0), 500);
  })
  .catch(error => {
    console.error('❌ Workflow failed with error:', error);
    // Force the process to exit with error code
    setTimeout(() => process.exit(1), 500);
  });

// ... existing code ...
  // Create a simple SVG visualization of the workflow
  function createWorkflowHtml(context: WorkflowContext): string {
    const projectName = context.config.OBJECTIVE || "Project";
    const units = Object.entries(context.metrics.stageMetrics || {}).reduce<Record<string, string[]>>((acc, [stageId, _]) => {
      const stage = WORKFLOW_STAGES.find(s => s.id === stageId);
      if (stage) {
        const unitId = stage.unit.id;
        if (!acc[unitId]) {
          acc[unitId] = [];
        }
        acc[unitId].push(stageId);
      }
      return acc;
    }, {});
    
    // Create a simple HTML page with the visualization
    return `<!DOCTYPE html>
<html>
<head>
  <title>${projectName} - Workflow Visualization</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .workflow { display: flex; flex-direction: column; gap: 20px; }
    .unit { border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
    .unit-title { margin-top: 0; }
    .stages { display: flex; flex-wrap: wrap; gap: 10px; }
    .stage { border: 1px solid #ddd; padding: 10px; border-radius: 3px; background: #f5f5f5; }
    .complete { border-left: 5px solid green; }
  </style>
</head>
<body>
  <h1>${projectName}</h1>
  <p>This is an automated visualization of the workflow execution.</p>
  
  <div class="workflow">
    ${Object.entries(units).map(([unitId, stageIds]) => {
      const unit = UNITS[unitId as keyof typeof UNITS];
      return `
        <div class="unit">
          <h2 class="unit-title">${unit.name}</h2>
          <div class="stages">
            ${stageIds.map(stageId => {
              const stage = WORKFLOW_STAGES.find(s => s.id === stageId);
              const isComplete = stage && context.outputs[stage.outputKey];
              return `
                <div class="stage ${isComplete ? 'complete' : ''}">
                  <div>${stage?.name || stageId}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;
  }