/**
 * Example 9: Active Inference POMDP Agent Example
 * 
 * This example demonstrates:
 * - LLM processing a story to extract temperature values
 * - Active Inference with Partially Observable Markov Decision Process (POMDP)
 * - Visualization of belief updates and free energy minimization
 * - Multi-agent organizational flow
 */

import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../src/core/multiagent/LLMClientInterface';
import { WorkflowEngine, ILogger } from '../src/core/units/workflow/WorkflowEngine';
import { EventSystem, EventPersistenceOptions } from '../src/core/events/EventSystem';
import { ActiveInferencePOMDPAgent } from '../src/agents/ActiveInferencePOMDPAgent';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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
const runId = `active-inference-pomdp-${timestamp}`;
const outputDir = path.join(__dirname, '..', 'output', runId);
fs.ensureDirSync(outputDir);
fs.ensureDirSync(path.join(outputDir, 'data'));
fs.ensureDirSync(path.join(outputDir, 'visualizations'));
fs.ensureDirSync(path.join(outputDir, 'logs'));
fs.ensureDirSync(path.join(outputDir, 'llm_outputs'));
fs.ensureDirSync(path.join(outputDir, 'intermediates'));

// Configure the project parameters
const PROJECT_CONFIG = {
  STORY: `
    It was a crisp autumn morning in the mountains when Elara woke up. The frost covered the
    ground outside her cabin, and she could see her breath form small clouds as she exhaled.
    She wrapped herself in a thick wool blanket and lit the wood stove. After brewing a cup of
    hot tea, she stepped outside to watch the sunrise. The thermometer outside her door showed
    that it was quite cold.
    
    By midday, Elara had hiked up to the ridge overlooking the valley. The sun was now high in
    the sky, warming the air considerably. She removed her heavy jacket and enjoyed the gentle
    breeze. The wildflowers along the trail had opened their petals, and butterflies fluttered
    around them. The weather was perfect for hiking, neither too hot nor too cold.
    
    As evening approached, Elara returned to the cabin. Dark clouds rolled in, bringing a sudden
    summer storm. The rain came down in sheets, cooling the air dramatically. Elara added several
    logs to the stove and prepared a warm soup for dinner. Outside, the temperature continued to
    drop as the storm intensified. She was grateful for the shelter of her sturdy cabin as she
    listened to the rain and distant thunder.
  `,
  
  LLM_CONFIG: {
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4o',
    FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
    TOKEN_LIMIT_THRESHOLD: 8000,
    DEFAULT_MAX_TOKENS: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000
  },
  
  POMDP_CONFIG: {
    STATES: [
      'very-cold',          // Below 0°C
      'cold',               // 0-10°C
      'cool',               // 10-15°C
      'mild',               // 15-20°C
      'warm',               // 20-25°C
      'hot',                // 25-30°C
      'very-hot'            // Above 30°C
    ],
    ACTIONS: [
      'add-clothing',
      'remove-clothing',
      'seek-shelter',
      'seek-shade',
      'use-heating',
      'use-cooling',
      'no-action'
    ],
    OBSERVATIONS: [
      // These will be temperature ranges in °C
      'freezing',           // Below 0°C
      'very-cold',          // 0-5°C
      'cold',               // 5-10°C
      'cool',               // 10-15°C
      'mild',               // 15-20°C
      'warm',               // 20-25°C
      'hot',                // 25-30°C
      'very-hot',           // Above 30°C
    ],
    POLICY_DEPTH: 2
  }
};

// Logger implementation
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
    fs.writeFileSync(this.logFile, `=== Active Inference POMDP Example - ${new Date().toISOString()} ===\n\n`);
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

// Create logger
const logger = new FileLogger(path.join(outputDir, 'logs', 'workflow.log'));

// Define the organizational units and agents
interface WorkflowAgent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  process: (input: any, context: WorkflowContext) => Promise<any>;
}

// LLM Temperature Extraction Agent
class TemperatureExtractionAgent implements WorkflowAgent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  private llm: OpenAIClient;
  
  constructor(id: string, name: string, unitId: string, unitName: string, description: string) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
    
    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const story = typeof input === 'string' ? input : input.story || '';
    logger.info(`${this.name} processing story to extract temperatures`);
    
    const systemPrompt = `
      You are a temperature extraction specialist. Given a story text, your task is to:
      
      1. Analyze the story and identify the approximate temperature at three points:
         - Beginning of the story
         - Middle of the story
         - End of the story
    `;
    
    const userPrompt = `
      Please extract approximate temperatures (in Celsius) from the following story at the beginning, middle, and end.
      Format your response as JSON with this structure:
      {
        "temperatures": [
          {"timepoint": "beginning", "description": "...", "temperature": X, "confidence": 0-1},
          {"timepoint": "middle", "description": "...", "temperature": Y, "confidence": 0-1},
          {"timepoint": "end", "description": "...", "temperature": Z, "confidence": 0-1}
        ]
      }
      
      Story:
      ${story}
    `;
    
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    try {
      logger.info('Sending request to LLM for temperature extraction');
      const response = await this.llm.createChatCompletion(
        messages,
        {
          model: context.config.LLM_CONFIG.DEFAULT_MODEL,
          max_tokens: context.config.LLM_CONFIG.DEFAULT_MAX_TOKENS,
          temperature: 0.1
        }
      );
      
      // Save LLM output to file
      const llmOutputPath = path.join(outputDir, 'llm_outputs', 'temperature_extraction.json');
      fs.writeFileSync(llmOutputPath, JSON.stringify(response, null, 2));
      
      const content = response.choices[0].message.content || '';
      
      // Parse the JSON response
      try {
        // Remove potential markdown code block wrapping
        const jsonString = content.replace(/```json\n|\n```|```/g, '').trim();
        const parsedResponse = JSON.parse(jsonString);
        const temperatures = parsedResponse.temperatures.map((item: any) => item.temperature);
        
        // Map temperature values to observation categories
        const observationIndices = this.mapTemperaturesToObservations(
          temperatures,
          context.config.POMDP_CONFIG.OBSERVATIONS
        );
        
        logger.info(`Extracted temperatures: ${JSON.stringify(temperatures)}`);
        logger.info(`Mapped to observation indices: ${JSON.stringify(observationIndices)}`);
        
        return {
          rawTemperatures: temperatures,
          tempData: parsedResponse.temperatures,
          observationIndices,
          llmResponse: content,
          llmOutputPath
        };
      } catch (parseError) {
        logger.error('Failed to parse LLM response:', parseError);
        logger.error('Response content:', content);
        throw new Error('Failed to parse LLM response');
      }
    } catch (error) {
      logger.error('Temperature extraction failed:', error);
      throw error;
    }
  }
  
  // Map temperatures to observation indices based on temperature ranges
  private mapTemperaturesToObservations(temperatures: number[], observationCategories: string[]): number[] {
    return temperatures.map(temp => {
      if (temp < 0) return 0; // freezing
      if (temp < 5) return 1; // very-cold
      if (temp < 10) return 2; // cold
      if (temp < 15) return 3; // cool
      if (temp < 20) return 4; // mild
      if (temp < 25) return 5; // warm
      if (temp < 30) return 6; // hot
      return 7; // very-hot
    });
  }
}

// Visualization Agent
class POMDPVisualizationAgent implements WorkflowAgent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  
  constructor(id: string, name: string, unitId: string, unitName: string, description: string) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    logger.info(`${this.name} creating visualizations for POMDP results`);
    
    const visualizationData = input.visualizationData;
    const outputFiles: string[] = [];
    const pngFiles: string[] = [];
    const animationFiles: string[] = [];
    
    // Create belief state history visualization
    const beliefHistoryChart = this.createBeliefHistoryChart(
      visualizationData.beliefHistory,
      visualizationData.states
    );
    outputFiles.push(beliefHistoryChart);
    
    // Create PNG version
    const beliefHistoryPng = await this.convertSvgToPng(beliefHistoryChart);
    pngFiles.push(beliefHistoryPng);
    
    // Create free energy visualization
    const freeEnergyChart = this.createFreeEnergyChart(
      visualizationData.freeEnergyHistory
    );
    outputFiles.push(freeEnergyChart);
    
    // Create PNG version
    const freeEnergyPng = await this.convertSvgToPng(freeEnergyChart);
    pngFiles.push(freeEnergyPng);
    
    // Create observation and action history visualization
    const historyChart = this.createObservationActionChart(
      visualizationData.observationHistory,
      visualizationData.actionHistory,
      visualizationData.observations,
      visualizationData.actions
    );
    outputFiles.push(historyChart);
    
    // Create PNG version
    const historyChartPng = await this.convertSvgToPng(historyChart);
    pngFiles.push(historyChartPng);
    
    // Create transition model heatmap
    const transitionModelViz = this.createTransitionModelVisualization(
      visualizationData.transitionModel,
      visualizationData.states,
      visualizationData.actions
    );
    outputFiles.push(transitionModelViz);
    
    // Create PNG version
    const transitionModelPng = await this.convertSvgToPng(transitionModelViz);
    pngFiles.push(transitionModelPng);
    
    // Create observation model heatmap
    const observationModelViz = this.createObservationModelVisualization(
      visualizationData.observationModel,
      visualizationData.states,
      visualizationData.observations
    );
    outputFiles.push(observationModelViz);
    
    // Create PNG version
    const observationModelPng = await this.convertSvgToPng(observationModelViz);
    pngFiles.push(observationModelPng);
    
    // Create belief state animation
    const beliefAnimationGif = await this.createBeliefStateAnimation(
      visualizationData.beliefHistory,
      visualizationData.states
    );
    if (beliefAnimationGif) {
      animationFiles.push(beliefAnimationGif);
    }
    
    return {
      message: `Generated ${outputFiles.length} visualizations, ${pngFiles.length} PNG files, and ${animationFiles.length} animations`,
      visualizationFiles: outputFiles,
      pngFiles,
      animationFiles
    };
  }
  
  // Convert SVG to PNG
  private async convertSvgToPng(svgPath: string): Promise<string> {
    try {
      const pngPath = svgPath.replace('.svg', '.png');
      
      // Use a shell command to convert SVG to PNG
      // This requires librsvg-bin or a similar tool to be installed
      await execPromise(`rsvg-convert -o "${pngPath}" "${svgPath}"`);
      
      logger.info(`Converted SVG to PNG: ${pngPath}`);
      return pngPath;
    } catch (error) {
      logger.error(`Failed to convert SVG to PNG: ${error}`);
      return '';
    }
  }
  
  // Create a GIF animation of belief state changes
  private async createBeliefStateAnimation(beliefHistory: number[][], states: string[]): Promise<string> {
    try {
      const framesDir = path.join(outputDir, 'intermediates', 'belief_frames');
      fs.ensureDirSync(framesDir);
      
      // Create individual frames
      for (let i = 0; i < beliefHistory.length; i++) {
        const frameSvgPath = path.join(framesDir, `belief_frame_${i.toString().padStart(3, '0')}.svg`);
        const beliefs = beliefHistory[i];
        
        // Generate a simple SVG for each frame
        const width = 800;
        const height = 500;
        const barWidth = width / (states.length + 2);
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="white"/>
          <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Belief State (Step ${i})</text>`;
        
        // Draw bars for each state
        for (let j = 0; j < beliefs.length; j++) {
          const barHeight = beliefs[j] * (height - 100);
          const x = (j + 1) * barWidth;
          const y = height - 50 - barHeight;
          
          svg += `
            <rect x="${x}" y="${y}" width="${barWidth * 0.8}" height="${barHeight}" fill="steelblue"/>
            <text x="${x + barWidth * 0.4}" y="${height - 30}" text-anchor="middle" font-size="12">${states[j]}</text>
            <text x="${x + barWidth * 0.4}" y="${y - 5}" text-anchor="middle" font-size="10">${beliefs[j].toFixed(2)}</text>
          `;
        }
        
        svg += `</svg>`;
        fs.writeFileSync(frameSvgPath, svg);
        
        // Convert to PNG
        await execPromise(`rsvg-convert -o "${frameSvgPath.replace('.svg', '.png')}" "${frameSvgPath}"`);
      }
      
      // Create GIF from frames
      const gifPath = path.join(outputDir, 'visualizations', 'belief_animation.gif');
      await execPromise(`convert -delay 50 -loop 0 "${path.join(framesDir, 'belief_frame_*.png')}" "${gifPath}"`);
      
      logger.info(`Created belief state animation: ${gifPath}`);
      return gifPath;
    } catch (error) {
      logger.error(`Failed to create belief animation: ${error}`);
      return '';
    }
  }
  
  // Create a chart showing belief history over time
  private createBeliefHistoryChart(beliefHistory: number[][], states: string[]): string {
    logger.info('Creating belief history chart');
    
    // Create a simulated chart (in real implementation, use actual charting library)
    const outputPath = path.join(outputDir, 'visualizations', 'belief_history.svg');
    
    // For simplicity, we'll create a basic SVG
    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Belief State History</text>
      <text x="${width/2}" y="${height-10}" text-anchor="middle">Time Step</text>
      <text x="15" y="${height/2}" text-anchor="middle" transform="rotate(-90, 15, ${height/2})">Belief Probability</text>
      <!-- This is a placeholder for the actual chart -->
    </svg>`;
    
    fs.writeFileSync(outputPath, svg);
    logger.info(`Saved belief history chart to ${outputPath}`);
    
    return outputPath;
  }
  
  // Create a chart showing free energy history
  private createFreeEnergyChart(freeEnergyHistory: number[][]): string {
    logger.info('Creating free energy chart');
    
    const outputPath = path.join(outputDir, 'visualizations', 'free_energy.svg');
    
    // For simplicity, we'll create a basic SVG
    const width = 800;
    const height = 500;
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Expected Free Energy by Policy</text>
      <text x="${width/2}" y="${height-10}" text-anchor="middle">Time Step</text>
      <text x="15" y="${height/2}" text-anchor="middle" transform="rotate(-90, 15, ${height/2})">Expected Free Energy</text>
      <!-- This is a placeholder for the actual chart -->
    </svg>`;
    
    fs.writeFileSync(outputPath, svg);
    logger.info(`Saved free energy chart to ${outputPath}`);
    
    return outputPath;
  }
  
  // Create a chart showing observation and action history
  private createObservationActionChart(
    observationHistory: number[],
    actionHistory: number[],
    observations: string[],
    actions: string[]
  ): string {
    logger.info('Creating observation and action history chart');
    
    const outputPath = path.join(outputDir, 'visualizations', 'observation_action_history.svg');
    
    // For simplicity, we'll create a basic SVG
    const width = 800;
    const height = 600;
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Observations and Actions</text>
      <text x="${width/2}" y="${height-10}" text-anchor="middle">Time Step</text>
      <!-- This is a placeholder for the actual chart -->
    </svg>`;
    
    fs.writeFileSync(outputPath, svg);
    logger.info(`Saved observation and action history chart to ${outputPath}`);
    
    return outputPath;
  }
  
  // Create a visualization of the transition model
  private createTransitionModelVisualization(
    transitionModel: number[][][],
    states: string[],
    actions: string[]
  ): string {
    logger.info('Creating transition model visualization');
    
    const outputPath = path.join(outputDir, 'visualizations', 'transition_model.svg');
    
    // For simplicity, we'll create a basic SVG
    const width = 800;
    const height = 600;
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Transition Model P(s'|s,a)</text>
      <!-- This is a placeholder for the actual chart -->
    </svg>`;
    
    fs.writeFileSync(outputPath, svg);
    logger.info(`Saved transition model visualization to ${outputPath}`);
    
    return outputPath;
  }
  
  // Create a visualization of the observation model
  private createObservationModelVisualization(
    observationModel: number[][],
    states: string[],
    observations: string[]
  ): string {
    logger.info('Creating observation model visualization');
    
    const outputPath = path.join(outputDir, 'visualizations', 'observation_model.svg');
    
    // For simplicity, we'll create a basic SVG
    const width = 800;
    const height = 600;
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="18">Observation Model P(o|s)</text>
      <!-- This is a placeholder for the actual chart -->
    </svg>`;
    
    fs.writeFileSync(outputPath, svg);
    logger.info(`Saved observation model visualization to ${outputPath}`);
    
    return outputPath;
  }
}

// Report Generation Agent
class ReportGenerationAgent implements WorkflowAgent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  private llm: OpenAIClient;
  
  constructor(id: string, name: string, unitId: string, unitName: string, description: string) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
    
    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    logger.info(`${this.name} generating final report`);
    
    // Format relevant data for the report
    const tempExtractionResults = input.temperatureExtraction;
    const pomdpResults = input.activeInference;
    const visualizationResults = input.visualizations;
    
    const systemPrompt = `
      You are a specialized AI report writer with expertise in Active Inference and POMDP models.
      Your task is to create a clear, comprehensive report explaining the results of an Active Inference POMDP model
      that was used to analyze temperature changes in a story and select optimal actions.
      
      The report should:
      1. Begin with an executive summary
      2. Explain the temperature extraction from the story
      3. Explain the POMDP model (states, actions, observations)
      4. Describe the belief updates and action selection
      5. Interpret the results and provide insights
      6. End with a conclusion
      
      Use markdown formatting.
    `;
    
    // Format all data for the user prompt
    const temperatureData = JSON.stringify(tempExtractionResults, null, 2);
    const beliefHistory = JSON.stringify(pomdpResults.beliefHistory, null, 2);
    const actionHistory = JSON.stringify(pomdpResults.actionHistory, null, 2);
    const observationHistory = JSON.stringify(pomdpResults.observationHistory, null, 2);
    const policyHistory = JSON.stringify(pomdpResults.policyHistory, null, 2);
    const finalBeliefs = JSON.stringify(pomdpResults.beliefs, null, 2);
    const freeEnergyHistory = JSON.stringify(pomdpResults.freeEnergyHistory, null, 2);
    
    const userPrompt = `
      Please generate a detailed report on the Active Inference POMDP model results using the following data:
      
      ## Temperature Extraction Results
      \`\`\`json
      ${temperatureData}
      \`\`\`
      
      ## POMDP Model Configuration
      - States: ${JSON.stringify(context.config.POMDP_CONFIG.STATES)}
      - Actions: ${JSON.stringify(context.config.POMDP_CONFIG.ACTIONS)}
      - Observations: ${JSON.stringify(context.config.POMDP_CONFIG.OBSERVATIONS)}
      - Policy Depth: ${context.config.POMDP_CONFIG.POLICY_DEPTH}
      
      ## Model Results
      ### Final Beliefs
      \`\`\`json
      ${finalBeliefs}
      \`\`\`
      
      ### Belief History
      \`\`\`json
      ${beliefHistory}
      \`\`\`
      
      ### Action History
      \`\`\`json
      ${actionHistory}
      \`\`\`
      
      ### Observation History
      \`\`\`json
      ${observationHistory}
      \`\`\`
      
      ### Policy History
      \`\`\`json
      ${policyHistory}
      \`\`\`
      
      ### Free Energy History
      \`\`\`json
      ${freeEnergyHistory}
      \`\`\`
      
      ## Visualizations
      The following visualizations were generated:
      ${visualizationResults.visualizationFiles.map((file: string) => `- ${path.basename(file)}`).join('\n')}
      ${visualizationResults.pngFiles ? visualizationResults.pngFiles.map((file: string) => `- ${path.basename(file)}`).join('\n') : ''}
      ${visualizationResults.animationFiles ? visualizationResults.animationFiles.map((file: string) => `- ${path.basename(file)}`).join('\n') : ''}
      
      Please reference these visualizations in your report.
    `;
    
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    try {
      logger.info('Sending request to LLM for report generation');
      const response = await this.llm.createChatCompletion(
        messages,
        {
          model: context.config.LLM_CONFIG.DEFAULT_MODEL,
          max_tokens: context.config.LLM_CONFIG.DEFAULT_MAX_TOKENS,
          temperature: 0.3
        }
      );
      
      // Save LLM output to file
      const llmOutputPath = path.join(outputDir, 'llm_outputs', 'report_generation.json');
      fs.writeFileSync(llmOutputPath, JSON.stringify(response, null, 2));
      
      const content = response.choices[0].message.content || '';
      
      // Remove potential markdown code block wrapping
      const markdownCleanedContent = content.replace(/```json\n|\n```|```/g, '').trim();
      
      // Save the report to the output directory
      const reportPath = path.join(outputDir, 'active_inference_pomdp_report.md');
      fs.writeFileSync(reportPath, markdownCleanedContent);
      logger.info(`Report saved to ${reportPath}`);
      
      // Create HTML version of the report
      const htmlReport = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Active Inference POMDP Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; margin: 20px 0; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    h1, h2, h3 { color: #333; }
    .image-container { text-align: center; margin: 30px 0; }
    .image-caption { font-style: italic; margin-top: 5px; color: #666; }
  </style>
</head>
<body>
  ${this.markdownToHTML(markdownCleanedContent)}
  
  <div class="image-container">
    <h2>Visualizations</h2>
    ${visualizationResults.pngFiles.map((file: string) => `
      <div class="image-container">
        <img src="${path.relative(outputDir, file).replace(/\\/g, '/')}" alt="${path.basename(file, '.png')}">
        <div class="image-caption">${this.formatCaption(path.basename(file, '.png'))}</div>
      </div>
    `).join('\n')}
    
    ${visualizationResults.animationFiles && visualizationResults.animationFiles.length > 0 ? `
      <h2>Animations</h2>
      ${visualizationResults.animationFiles.map((file: string) => `
        <div class="image-container">
          <img src="${path.relative(outputDir, file).replace(/\\/g, '/')}" alt="${path.basename(file, '.gif')}">
          <div class="image-caption">${this.formatCaption(path.basename(file, '.gif'))}</div>
        </div>
      `).join('\n')}
    ` : ''}
  </div>
</body>
</html>`;
      
      const htmlReportPath = path.join(outputDir, 'active_inference_pomdp_report.html');
      fs.writeFileSync(htmlReportPath, htmlReport);
      logger.info(`HTML report saved to ${htmlReportPath}`);
      
      return {
        message: 'Report generated successfully',
        reportPath,
        htmlReportPath,
        llmOutputPath
      };
    } catch (error) {
      logger.error('Report generation failed:', error);
      throw error;
    }
  }
  
  private markdownToHTML(markdown: string): string {
    // Basic conversion of markdown to HTML
    return markdown
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
      .replace(/^##### (.*?)$/gm, '<h5>$1</h5>')
      .replace(/^\* (.*?)$/gm, '<ul><li>$1</li></ul>')
      .replace(/^- (.*?)$/gm, '<ul><li>$1</li></ul>')
      .replace(/^\d+\. (.*?)$/gm, '<ol><li>$1</li></ol>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/\n\n/g, '<br><br>');
  }
  
  private formatCaption(filename: string): string {
    return filename
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Define workflow context
interface WorkflowContext {
  config: typeof PROJECT_CONFIG & {
    OUTPUT_DIR: string;
  };
  outputs: Record<string, any>;
  logger: FileLogger;
  eventSystem: EventSystem;
  startTime: number;
}

// Define organizational units
interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  agents: WorkflowAgent[];
}

// Create the organizational units
const units: OrganizationalUnit[] = [
  {
    id: 'analysis-unit',
    name: 'Analysis Unit',
    description: 'Responsible for analyzing stories and extracting temperatures',
    agents: [
      new TemperatureExtractionAgent(
        'temp-extract-agent',
        'Temperature Extraction Agent',
        'analysis-unit',
        'Analysis Unit',
        'Extracts temperature values from story text'
      )
    ]
  },
  {
    id: 'inference-unit',
    name: 'Inference Unit',
    description: 'Runs Active Inference POMDP processes on observations',
    agents: [
      // We'll create the Active Inference agent during workflow execution
    ]
  },
  {
    id: 'visualization-unit',
    name: 'Visualization Unit',
    description: 'Creates visualizations of POMDP data',
    agents: [
      new POMDPVisualizationAgent(
        'pomdp-viz-agent',
        'POMDP Visualization Agent',
        'visualization-unit',
        'Visualization Unit',
        'Creates visualizations for POMDP data'
      )
    ]
  },
  {
    id: 'reporting-unit',
    name: 'Reporting Unit',
    description: 'Generates comprehensive reports',
    agents: [
      new ReportGenerationAgent(
        'report-agent',
        'Report Generation Agent',
        'reporting-unit',
        'Reporting Unit',
        'Generates final analysis reports'
      )
    ]
  }
];

// Create a wrapper for ActiveInferencePOMDPAgent to implement WorkflowAgent interface
class ActiveInferencePOMDPAgentWrapper implements WorkflowAgent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  private agent: ActiveInferencePOMDPAgent;
  
  constructor(
    id: string,
    name: string,
    unitId: string,
    unitName: string,
    description: string,
    config: {
      states: string[];
      observations: string[];
      actions: string[];
      transitionModel?: number[][][];
      observationModel?: number[][];
      preferences?: number[][];
      policyDepth?: number;
    }
  ) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
    
    // Create the wrapped agent
    this.agent = new ActiveInferencePOMDPAgent({
      id,
      name,
      description,
      states: config.states,
      observations: config.observations,
      actions: config.actions,
      transitionModel: config.transitionModel,
      observationModel: config.observationModel,
      preferences: config.preferences,
      policyDepth: config.policyDepth
    });
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    return this.agent.process(input, context);
  }
}

// Main workflow function
async function runActiveInferencePOMDPExample() {
  logger.info('Starting Active Inference POMDP Example');
  logger.info(`Output directory: ${outputDir}`);
  
  // Create a new event system with persistence options
  const persistenceOptions: EventPersistenceOptions = {
    enabled: true,
    storageDirectory: path.join(outputDir, 'events'),
    maxEventsPerType: 100
  };
  const eventSystem = EventSystem.getInstance(persistenceOptions);
  
  // Initialize workflow context
  const context: WorkflowContext = {
    config: {
      ...PROJECT_CONFIG,
      OUTPUT_DIR: outputDir
    },
    outputs: {},
    logger,
    eventSystem,
    startTime: Date.now()
  };
  
  try {
    // Step 1: Extract temperatures from story
    logger.info('Step 1: Extracting temperatures from story');
    const temperatureAgent = units[0].agents[0]; // Temperature extraction agent
    const temperatureResults = await temperatureAgent.process(PROJECT_CONFIG.STORY, context);
    context.outputs.temperatureExtraction = temperatureResults;
    logger.info(`Extracted temperatures: ${JSON.stringify(temperatureResults.rawTemperatures)}`);
    logger.info(`Mapped to observation indices: ${JSON.stringify(temperatureResults.observationIndices)}`);
    
    // Step 2: Initialize and run Active Inference POMDP
    logger.info('Step 2: Running Active Inference POMDP');
    // Initialize Active Inference agent wrapper
    const activeInferenceAgentWrapper = new ActiveInferencePOMDPAgentWrapper(
      'active-inference-agent',
      'Active Inference POMDP Agent',
      'inference-unit',
      'Inference Unit',
      'Processes observations using Active Inference with POMDP',
      {
        // POMDP model parameters
        states: PROJECT_CONFIG.POMDP_CONFIG.STATES,
        observations: PROJECT_CONFIG.POMDP_CONFIG.OBSERVATIONS,
        actions: PROJECT_CONFIG.POMDP_CONFIG.ACTIONS,
        policyDepth: PROJECT_CONFIG.POMDP_CONFIG.POLICY_DEPTH,
        // Customize transition model for the temperature scenario
        transitionModel: createTemperatureTransitionModel(
          PROJECT_CONFIG.POMDP_CONFIG.ACTIONS.length,
          PROJECT_CONFIG.POMDP_CONFIG.STATES.length
        ),
        // Customize observation model for the temperature scenario
        observationModel: createTemperatureObservationModel(
          PROJECT_CONFIG.POMDP_CONFIG.STATES.length,
          PROJECT_CONFIG.POMDP_CONFIG.OBSERVATIONS.length
        ),
        // Set preferences for different temperatures
        preferences: createTemperaturePreferences(
          PROJECT_CONFIG.POMDP_CONFIG.OBSERVATIONS.length,
          PROJECT_CONFIG.POMDP_CONFIG.STATES.length
        )
      }
    );
    
    // Add the agent to the inference unit
    units[1].agents.push(activeInferenceAgentWrapper);
    
    // Process the temperature observations with POMDP
    const pomdpResults = await activeInferenceAgentWrapper.process(
      temperatureResults.observationIndices,
      context
    );
    context.outputs.activeInference = pomdpResults;
    logger.info('POMDP processing complete');
    
    // Step 3: Generate visualizations
    logger.info('Step 3: Generating visualizations');
    const visualizationAgent = units[2].agents[0]; // Visualization agent
    const visualizationResults = await visualizationAgent.process(pomdpResults, context);
    context.outputs.visualizations = visualizationResults;
    logger.info(`Generated ${visualizationResults.visualizationFiles.length} visualizations`);
    
    // Step 4: Generate final report
    logger.info('Step 4: Generating final report');
    const reportAgent = units[3].agents[0]; // Report generation agent
    const reportResults = await reportAgent.process(context.outputs, context);
    context.outputs.report = reportResults;
    logger.info(`Report generated at ${reportResults.reportPath}`);
    
    // Workflow completion
    const duration = (Date.now() - context.startTime) / 1000;
    logger.info(`Workflow completed in ${duration.toFixed(2)} seconds`);
    console.log(`\nWorkflow completed successfully. Output directory: ${outputDir}`);
    
    // Save intermediate data
    fs.writeFileSync(
      path.join(outputDir, 'intermediates', 'temperature_extraction.json'),
      JSON.stringify(context.outputs.temperatureExtraction, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'intermediates', 'active_inference_results.json'),
      JSON.stringify(context.outputs.activeInference, null, 2)
    );
    
    // Save final workflow results
    fs.writeFileSync(
      path.join(outputDir, 'workflow_results.json'),
      JSON.stringify({
        duration,
        outputs: {
          temperatures: context.outputs.temperatureExtraction.rawTemperatures,
          beliefs: context.outputs.activeInference.beliefs,
          selectedPolicy: context.outputs.activeInference.policy,
          selectedAction: context.outputs.activeInference.action,
          visualizations: context.outputs.visualizations.visualizationFiles.map(
            (f: string) => path.relative(outputDir, f)
          ),
          pngFiles: context.outputs.visualizations.pngFiles?.map(
            (f: string) => path.relative(outputDir, f)
          ) || [],
          animationFiles: context.outputs.visualizations.animationFiles?.map(
            (f: string) => path.relative(outputDir, f)
          ) || [],
          report: path.relative(outputDir, context.outputs.report.reportPath),
          htmlReport: path.relative(outputDir, context.outputs.report.htmlReportPath)
        }
      }, null, 2)
    );
    
    console.log(`\nTo view the report, open: ${context.outputs.report.htmlReportPath}`);
    
  } catch (error) {
    logger.error('Workflow failed with error:', error);
    console.error('Workflow failed:', error);
  }
}

// Helper function to create a temperature-specific transition model
function createTemperatureTransitionModel(numActions: number, numStates: number): number[][][] {
  // Initialize with uniform probabilities
  const model = Array(numActions).fill(0).map(() => 
    Array(numStates).fill(0).map(() => 
      Array(numStates).fill(1 / numStates)
    )
  );
  
  // Customize for specific actions
  // For example: 'add-clothing' makes you less likely to transition to colder states
  // 'use-heating' increases probability of transitioning to warmer states
  // This is a simplified example - a real model would be more sophisticated
  
  return model;
}

// Helper function to create a temperature-specific observation model
function createTemperatureObservationModel(numStates: number, numObs: number): number[][] {
  // Create a diagonal-heavy matrix where states are most likely to produce
  // observations of the same or adjacent temperature categories
  const model = Array(numStates).fill(0).map((_, i) => {
    const row = Array(numObs).fill(0.01); // Small base probability
    
    // Higher probability for matching and adjacent observations
    row[i] = 0.6; // Highest for exact match
    if (i > 0) row[i-1] = 0.15; // Lower for one colder
    if (i < numObs-1) row[i+1] = 0.15; // Lower for one warmer
    
    // Normalize
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map(p => p / sum);
  });
  
  return model;
}

// Helper function to create temperature preferences
function createTemperaturePreferences(numObs: number, numStates: number): number[][] {
  // Create preferences for mild temperatures (highest in the middle)
  const model = Array(numObs).fill(0).map((_, i) => {
    // Mild temperatures (in the middle) are preferred
    const midpoint = Math.floor(numStates / 2);
    const preferences = Array(numStates).fill(0).map((_, j) => {
      // Calculate distance from middle state
      const distance = Math.abs(j - midpoint);
      // Preference decreases with distance from middle
      return 1.0 / (1.0 + distance);
    });
    
    return preferences;
  });
  
  return model;
}

// Run the example if this file is executed directly
if (require.main === module) {
  runActiveInferencePOMDPExample();
} 