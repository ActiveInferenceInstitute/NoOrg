/**
 * Example 9: Calm Technology Organizational Ergonomics Workflow
 *
 * This example demonstrates:
 * - Applying Calm Technology principles to organizational ergonomics.
 * - Designing workplace systems (e.g., communication platforms, workflows) for reduced cognitive load.
 * - Multi-agent assessment of attention demands and notification policies.
 * - Visualizing organizational 'calmness' metrics.
 */

import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../src/core/multiagent/LLMClientInterface';
import { WorkflowEngine, ILogger } from '../src/core/units/workflow/WorkflowEngine';
import { EventSystem } from '../src/core/events/EventSystem';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import axios from 'axios'; // Keep for potential future API integrations

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify API key loading
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
  process.exit(1);
} else {
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`OPENAI_API_KEY loaded: ${maskedKey}`);
}

// Define Calm Tech Principles (for reference in prompts and logic)
const CALM_TECH_PRINCIPLES = [
  "I. Technology should require the smallest possible amount of attention",
  "II. Technology should inform and create calm",
  "III. Technology should make use of the periphery",
  "IV. Technology should amplify the best of technology and the best of humanity",
  "V. Technology can communicate, but doesn't need to speak",
  "VI. Technology should work even when it fails",
  "VII. The right amount of technology is the minimum needed to solve the problem",
  "VIII. Leverage familiar behaviors to introduce new ones"
];

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `calm-tech-org-ergonomics-${timestamp}`;
let outputDir: string = path.join('output', runId);

// Configure the project parameters
const PROJECT_CONFIG = {
  DOMAIN: "Organizational Ergonomics & Calm Technology",
  OBJECTIVE: "Design a Calm Technology-aligned internal communication platform or assess an existing workflow for Calm Tech violations.",
  TARGET_SYSTEM: "Internal Corporate Communication Platform (e.g., Slack, Teams replacement) or a specific department's workflow (e.g., support ticket handling).",
  CONSTRAINTS: "Must adhere to the 8 principles of Calm Technology, reduce unnecessary notifications, minimize context switching, provide information peripherally where possible, ensure robustness, and integrate smoothly with existing user behaviors.",
  TARGET_USERS: "Knowledge workers, managers, IT administrators, HR departments, organizational designers.",
  // AI configuration
  LLM_CONFIG: {
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4o',
    FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
    TOKEN_LIMIT_THRESHOLD: 8000,
    DEFAULT_MAX_TOKENS: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2500 // Increased for potentially more detailed analysis
  }
};

// --- Logger Class (unchanged from Example 8) ---
class FileLogger implements ILogger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = filename;
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(this.logFile, `=== Calm Tech Organizational Ergonomics Example - ${new Date().toISOString()} ===\\n\\n`);
  }

  log(...args: any[]): void {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    console.log(message);
    fs.appendFileSync(this.logFile, `[LOG] ${message}\\n`);
  }

  error(...args: any[]): void {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    console.error(`ERROR: ${message}`);
    fs.appendFileSync(this.logFile, `[ERROR] ${message}\\n`);
  }

  info(...args: any[]): void {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    console.info(`INFO: ${message}`);
    fs.appendFileSync(this.logFile, `[INFO] ${message}\\n`);
  }

  warn(...args: any[]): void {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    console.warn(`WARN: ${message}`);
    fs.appendFileSync(this.logFile, `[WARN] ${message}\\n`);
  }
}

// Simple logger factory function (unchanged)
function createLogger(name: string, level: string, options: { console: boolean, file: string }) {
  return new FileLogger(options.file);
}

// --- Agent Interfaces and Base Classes (structure unchanged, specific implementations adapted) ---
interface Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  process: (input: any, context: WorkflowContext) => Promise<any>;
}

// LLM-based agent (adapted system prompts later)
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

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }

  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`LLMAgent ${this.name} processing input`);

    let processedInput = input;
    if (typeof input !== 'string') {
      processedInput = this.simplifyInput(input); // Simplify complex inputs
      processedInput = JSON.stringify(processedInput, null, 2);
    }

    const messages: LLMMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: processedInput }
    ];

    const estimatedTokens = JSON.stringify(messages).length / 4;
    const config = context.config.LLM_CONFIG || {
      DEFAULT_MODEL: 'gpt-4o',
      FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
      TOKEN_LIMIT_THRESHOLD: 8000,
      DEFAULT_MAX_TOKENS: 2500
    };

    const useDefaultModel = estimatedTokens < config.TOKEN_LIMIT_THRESHOLD;
    const modelToUse = useDefaultModel ? config.DEFAULT_MODEL : config.FALLBACK_MODEL;

    logger.info(`Using model ${modelToUse} for request with estimated ${estimatedTokens} tokens`);

    const intermediatesDir = path.join(context.config.OUTPUT_DIR || '', 'intermediates');
    fs.ensureDirSync(intermediatesDir);

    const inputFilename = `${this.id}_${Date.now()}_input.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, inputFilename),
      JSON.stringify({ agent: this.name, timestamp: new Date().toISOString(), model: modelToUse, system_prompt: this.systemPrompt, user_prompt: processedInput }, null, 2)
    );
    logger.info(`Saved LLM input to ${inputFilename}`);

    const response = await this.llm.createChatCompletion(messages, {
      temperature: 0.5, // Slightly lower temp for more focused analysis
      max_tokens: config.DEFAULT_MAX_TOKENS || 2500,
      model: modelToUse
    });

    const content = response.choices[0]?.message?.content || '';

    const outputFilename = `${this.id}_${Date.now()}_output.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, outputFilename),
      JSON.stringify({ agent: this.name, timestamp: new Date().toISOString(), model: modelToUse, raw_response: content }, null, 2)
    );
    logger.info(`Saved LLM output to ${outputFilename}`);

    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];
      const jsonContent = jsonMatch[1] || content;
      const result = {
        ...JSON.parse(jsonContent),
        __metadata: { model: modelToUse, tokens: estimatedTokens, input_file: inputFilename, output_file: outputFilename, timestamp: new Date().toISOString() }
      };
      return result;
    } catch (error) {
        logger.warn(`LLM Agent ${this.name} output was not valid JSON. Returning raw content.`);
        return {
            raw_content: content,
            __metadata: { model: modelToUse, tokens: estimatedTokens, input_file: inputFilename, output_file: outputFilename, timestamp: new Date().toISOString() }
        };
    }
  }

  // Simplify input function (slightly refined)
  private simplifyInput(input: any, depth = 0, maxDepth = 3): any {
      if (!input || typeof input !== 'object' || depth > maxDepth) {
          return typeof input === 'string' && input.length > 1000 ? input.substring(0, 1000) + '...' : input;
      }

      if (Array.isArray(input)) {
          return input.slice(0, 10).map(item => this.simplifyInput(item, depth + 1, maxDepth)); // Limit array elements
      }

      const simplified: Record<string, any> = {};
      const keys = Object.keys(input);
      const keysToKeep = keys.slice(0, 15); // Limit object properties

      for (const key of keysToKeep) {
          if (key.startsWith('__')) continue; // Skip metadata keys
          const value = input[key];
          simplified[key] = this.simplifyInput(value, depth + 1, maxDepth);
      }

      if (keys.length > keysToKeep.length) {
          simplified.__note = `Simplified from ${keys.length} properties at depth ${depth}`;
      }

      return simplified;
  }
}

// Data processing agent (adapted processing functions later)
class DataProcessingAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  processingFunction: (data: any, context: WorkflowContext) => any; // Add context

  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    processingFunction: (data: any, context: WorkflowContext) => any;
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
    try {
      return this.processingFunction(input, context);
    } catch (error) {
        context.logger.error(`Error in DataProcessingAgent ${this.name}: ${error}`);
        return { error: String(error), agent: this.name, input_summary: JSON.stringify(input).substring(0, 200) + '...' };
    }
  }
}

// API integration agent (adapted for potential organizational data APIs)
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
    endpoint: string; // e.g., '/api/notifications/logs', '/api/employee/feedback'
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
      let requestData = input;
      if (typeof this.transformRequest === 'function') {
        requestData = this.transformRequest(input);
      }

      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      const mockResponse = this.generateMockResponse(requestData);

      let result = mockResponse;
      if (typeof this.transformResponse === 'function') {
        result = this.transformResponse(mockResponse);
      }

      context.logger.info(`APIAgent ${this.name} completed processing`);
      return result;
    } catch (error) {
      context.logger.error(`Error in APIAgent ${this.name}: ${error}`);
      return { error: String(error), endpoint: this.endpoint, method: this.method };
    }
  }

  // Generate mock responses relevant to organizational ergonomics
  private generateMockResponse(requestData: any): any {
    const timestamp = new Date().toISOString();
    const seed = crypto.createHash('md5').update(this.endpoint + JSON.stringify(requestData)).digest('hex');
    const random = (max: number) => parseInt(seed.substring(0, 8), 16) % max;

    if (this.endpoint.includes('notification/logs')) {
      // Mock notification log data
      const numLogs = requestData?.limit || 50 + random(50);
      const logs = Array.from({ length: numLogs }).map((_, i) => {
        const logSeed = crypto.createHash('md5').update(seed + i).digest('hex');
        const logRandom = (max: number) => parseInt(logSeed.substring(0, 8), 16) % max;
        const types = ['mention', 'direct_message', 'channel_alert', 'system_update', 'task_reminder', 'calendar_event'];
        const channels = ['#general', '#project-phoenix', '#design-team', '#support-urgent', 'Direct Message', 'System'];
        const users = ['user_123', 'user_456', 'user_789', 'support_bot', 'admin_01'];
        const priorities = ['high', 'medium', 'low', 'info'];
        const interactionRequired = logRandom(10) > 7;

        return {
          log_id: `notif_${logSeed.substring(0, 12)}`,
          timestamp: new Date(Date.now() - logRandom(86400 * 1000 * 7)).toISOString(), // Within last 7 days
          user_id: users[logRandom(users.length)],
          type: types[logRandom(types.length)],
          channel: channels[logRandom(channels.length)],
          priority: priorities[logRandom(priorities.length)],
          content_length: logRandom(150) + 10,
          interaction_required: interactionRequired,
          read: logRandom(10) > 3,
          acknowledged: interactionRequired && logRandom(10) > 5,
          source_app: ['internal_comms', 'calendar', 'task_manager', 'system'][logRandom(4)]
        };
      });
      return { success: true, timestamp, data: { logs }, count: logs.length };

    } else if (this.endpoint.includes('employee/feedback')) {
      // Mock employee feedback on focus/distraction
      const numFeedback = requestData?.limit || 20 + random(30);
      const feedback = Array.from({ length: numFeedback }).map((_, i) => {
          const fbSeed = crypto.createHash('md5').update(seed + i).digest('hex');
          const fbRandom = (max: number) => parseInt(fbSeed.substring(0, 8), 16) % max;
          const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR'];
          const roles = ['Developer', 'Manager', 'Designer', 'Analyst', 'Specialist'];
          const focusLevels = ['Very High', 'High', 'Moderate', 'Low', 'Very Low'];
          const distractionSources = ['Notifications', 'Meetings', 'Context Switching', 'Noise', 'Emails', 'Lack of Clear Priorities'];

          return {
              feedback_id: `fb_${fbSeed.substring(0,10)}`,
              timestamp: new Date(Date.now() - fbRandom(86400 * 1000 * 30)).toISOString(), // Within last 30 days
              department: departments[fbRandom(departments.length)],
              role: roles[fbRandom(roles.length)],
              reported_focus_level: focusLevels[fbRandom(focusLevels.length)],
              primary_distraction: distractionSources[fbRandom(distractionSources.length)],
              distraction_frequency_score: fbRandom(5) + 1, // 1-5 scale
              notification_overload_score: fbRandom(5) + 1, // 1-5 scale
              comment: `Feedback comment #${i+1} - often related to ${distractionSources[fbRandom(distractionSources.length)]}.`
          };
      });
       return { success: true, timestamp, data: { feedback }, count: feedback.length };

    } else if (this.endpoint.includes('workflow/definition')) {
        // Mock workflow definition
        const steps = ['Receive Request', 'Triage Issue', 'Assign Technician', 'Investigate', 'Propose Solution', 'Implement Fix', 'Verify & Close'];
        return {
            success: true,
            timestamp,
            data: {
                workflow_id: requestData?.workflow_id || 'support-ticket-flow',
                name: 'Standard Support Ticket Workflow',
                description: 'Process for handling incoming customer support tickets.',
                steps: steps.map((name, index) => ({
                    step_id: `step_${index + 1}`,
                    name: name,
                    avg_duration_minutes: [5, 15, 10, 60, 30, 45, 15][index] + random(5) - 2,
                    required_tools: [['Ticketing System', 'Email'], ['Ticketing System'], ['Ticketing System', 'Slack'], ['Knowledge Base', 'Logs', 'Debugging Tools'], ['Ticketing System'], ['Customer System', 'Code Repo'], ['Ticketing System', 'Survey Tool']][index],
                    notification_triggers: [['New Ticket Assigned'], ['High Priority Update'], ['Technician Assigned'], [], ['Solution Proposed'], ['Fix Deployed'], ['Ticket Closed', 'Survey Sent']][index],
                    handoff_points: index < steps.length - 1 ? 1 : 0
                })),
                estimated_total_duration_hours: 3 + random(2),
                complexity_score: 7 + random(3) // Scale 1-10
            }
        };
    } else {
      // Generic mock response
      return { success: true, timestamp, endpoint: this.endpoint, method: this.method, request: requestData, mock_data: "This is a simulated Calm Tech API response" };
    }
  }
}

// Rule-based decision agent (adapted for Calm Tech rules)
class RuleBasedAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  // Re-verified: Define the structure for a rule, including the optional description
  rules: Array<{
    condition: (input: any, context: WorkflowContext) => boolean;
    action: (input: any, context: WorkflowContext) => any;
    principle_violated?: number;
    description?: string; // Ensure this optional field is defined
  }>;
  defaultAction?: (input: any, context: WorkflowContext) => any;

  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    // Re-verified: Update constructor config type to match the internal type
    rules: Array<{
      condition: (input: any, context: WorkflowContext) => boolean;
      action: (input: any, context: WorkflowContext) => any;
      principle_violated?: number;
      description?: string; // Ensure this optional field is defined here too
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
    // Re-verified: Explicitly type the array with a slightly more specific type for action_taken
    const triggeredRulesInfo: Array<{
        rule_description: string;
        principle_violated?: number;
        action_taken: string | object | null; // Changed from any
     }> = [];

    for (const rule of this.rules) {
      if (rule.condition(input, context)) {
        context.logger.info(`Rule triggered in ${this.name}`);
        const actionResult = await rule.action(input, context);
        triggeredRulesInfo.push({
            // Re-verified: Accessing optional description safely
            rule_description: rule.description || 'Unnamed Rule',
            principle_violated: rule.principle_violated,
            // Assign actionResult which could be various types
            action_taken: actionResult?.recommendation || actionResult?.policy_change || actionResult || 'Evaluation'
        });
      }
    }

    if (triggeredRulesInfo.length > 0) {
        // Return the input potentially modified by actions, plus info about triggered rules
        return { ...input, triggered_rules: triggeredRulesInfo };
    } else if (this.defaultAction) {
      context.logger.info(`No rules matched, using default action in ${this.name}`);
      return this.defaultAction(input, context);
    }

    context.logger.info(`No rules matched and no default action in ${this.name}`);
    return input; // Pass through if no rules match
  }
}


// Visualization agent (adapted for Calm Tech metrics)
class VisualizationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  visualizationType: 'attention_demand' | 'notification_flow' | 'calmness_scorecard' | 'workflow_complexity';

  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    visualizationType: 'attention_demand' | 'notification_flow' | 'calmness_scorecard' | 'workflow_complexity';
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
    const runOutputDir = context.config.OUTPUT_DIR || outputDir;
    const visualizationsDir = path.join(runOutputDir, 'visualizations');
    fs.ensureDirSync(visualizationsDir);
    const outputFile = path.join(visualizationsDir, `${visualizationId}.html`);

    let htmlContent = '';
    try {
        switch (this.visualizationType) {
        case 'attention_demand':
            htmlContent = this.generateAttentionDemandChart(input, visualizationId, context);
            break;
        case 'notification_flow':
            htmlContent = this.generateNotificationFlowDiagram(input, visualizationId, context);
            break;
        case 'calmness_scorecard':
            htmlContent = this.generateCalmnessScorecard(input, visualizationId, context);
            break;
        case 'workflow_complexity':
            htmlContent = this.generateWorkflowComplexityDiagram(input, visualizationId, context);
            break;
        default:
             htmlContent = `<html><body>Unsupported visualization type: ${this.visualizationType}</body></html>`;
        }

        fs.writeFileSync(outputFile, htmlContent);
        context.logger.info(`Created visualization file: ${outputFile}`);
    } catch (error) {
        context.logger.error(`Failed to generate or write visualization file ${outputFile}: ${error}`);
        htmlContent = `<html><body>Error generating visualization: ${error}</body></html>`;
        // Attempt to write error file
         try { fs.writeFileSync(outputFile, htmlContent); } catch (writeError) { /* ignore */ }
    }


    return {
      visualization_id: visualizationId,
      visualization_type: this.visualizationType,
      visualization_path: outputFile,
      // html_content: htmlContent, // Avoid sending large HTML back
      input_data_summary: this.summarizeData(input) // Keep summary
    };
  }

  // Summarize data function (unchanged from Example 8)
  private summarizeData(data: any): any {
    if (Array.isArray(data)) {
        return { type: 'array', length: data.length, sample: data.slice(0, 3).map(this.summarizeData) };
    } else if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        return {
            type: 'object',
            keys: keys,
            sample: keys.slice(0, 5).reduce((obj, key) => {
                // Basic check to avoid large nested structures in summary
                const value = data[key];
                obj[key] = (typeof value === 'object' && JSON.stringify(value).length > 200) ? `[Object ${Object.keys(value).length} keys]` : value;
                return obj;
            }, {} as any)
        };
    } else {
        return { type: typeof data, value: String(data).substring(0,100) + (String(data).length > 100 ? '...' : '') };
    }
  }


  // --- New Visualization Generators for Calm Tech ---

  private generateAttentionDemandChart(data: any, id: string, context: WorkflowContext): string {
    // Expects data like: { time_periods: [...], demands: { tool1: [...], tool2: [...] } }
    // Or based on feedback: { roles: [...], avg_distraction_score: [...], avg_focus_level: [...] }
    let labels: string[] = [];
    let datasets: any[] = [];

    if (data?.feedback_analysis?.by_role) {
        labels = Object.keys(data.feedback_analysis.by_role);
        datasets = [
            {
                label: 'Avg Distraction Score (1-5, higher=worse)',
                data: labels.map(role => data.feedback_analysis.by_role[role]?.avg_distraction_score || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.5)', // Reddish
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'yScore'
            },
            {
                label: 'Avg Focus Score (1-5, higher=better)',
                 data: labels.map(role => data.feedback_analysis.by_role[role]?.avg_focus_score || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.5)', // Greenish
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                 yAxisID: 'yScore'
            },
            {
                 label: 'Avg Notification Overload Score (1-5, higher=worse)',
                 data: labels.map(role => data.feedback_analysis.by_role[role]?.avg_notification_overload_score || 0),
                backgroundColor: 'rgba(255, 159, 64, 0.5)', // Orange
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                yAxisID: 'yScore',
                hidden: true // Start hidden
            }
        ];
    } else if (data?.attention_metrics) {
         labels = data.attention_metrics.map((m: any) => m.context || m.tool_name || m.period);
         datasets = [
            {
                label: 'Context Switches / Hour',
                data: data.attention_metrics.map((m: any) => m.context_switches_per_hour || 0),
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1,
                yAxisID: 'yFrequency'
            },
            {
                label: 'Avg Focus Time (min)',
                data: data.attention_metrics.map((m: any) => m.avg_focus_time_minutes || 0),
                 borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                 yAxisID: 'yDuration'
             }
         ];
    } else {
         // Fallback data
         labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
         datasets = [{ label: 'Estimated Attention Demand', data: [6, 7, 5, 8, 6], backgroundColor: 'rgba(255, 159, 64, 0.5)' }];
    }

    return `<!DOCTYPE html><html><head><title>Attention Demand</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script><style>body { font-family: Arial, sans-serif; margin: 20px; } .chart-container { max-width: 900px; height: 450px; margin: auto; }</style></head><body><h1>Attention Demand Analysis</h1><div class="chart-container"><canvas id="chart_${id}"></canvas></div><script>
    const ctx = document.getElementById('chart_${id}').getContext('2d');
    new Chart(ctx, {
      type: 'bar', // Or 'line' if appropriate for the data
      data: { labels: ${JSON.stringify(labels)}, datasets: ${JSON.stringify(datasets)} },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          yScore: { type: 'linear', position: 'left', min: 0, max: 5, title: { display: true, text: 'Score (1-5)' } },
          yFrequency: { type: 'linear', position: 'right', min: 0, title: { display: true, text: 'Frequency / Hour' }, grid: { drawOnChartArea: false } },
          yDuration: { type: 'linear', position: 'right', min: 0, title: { display: true, text: 'Duration (min)' }, grid: { drawOnChartArea: false }, hidden: true } // Example extra axis
        },
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Attention & Distraction Metrics' } }
      }
    });
    </script></body></html>`;
  }

  private generateNotificationFlowDiagram(data: any, id: string, context: WorkflowContext): string {
    // Expects data like: { nodes: [{id, label, type}], links: [{source, target, label}] } representing notification paths
    // Or based on notification analysis: { sources: [...], types: [...], channels: [...], priorities: [...] }
    let diagram = 'graph LR;\n'; // Left-to-right flow
    diagram += '    subgraph "Notification Ecosystem"\n';
    diagram += '        direction LR\n';

    if (data?.notification_analysis?.summary) {
        const summary = data.notification_analysis.summary;
        const sources = Object.keys(summary.by_source || {});
        const types = Object.keys(summary.by_type || {});
        const priorities = Object.keys(summary.by_priority || {});

        // Nodes for Sources, Types, Priorities
        sources.forEach(s => diagram += `        src_${s}[(${s})];\n`);
        types.forEach(t => diagram += `        typ_${t}[${t}];\n`);
        priorities.forEach(p => diagram += `        pri_${p}{${p}};\n`); // Different shape for priority

        // Edges (simplified representation)
        sources.forEach(s => {
            types.forEach(t => {
                 // Only draw edge if this source produces this type (crude check)
                if (data.notification_analysis.raw_logs?.some((l: any) => l.source_app === s && l.type === t)) {
                    diagram += `        src_${s} --> typ_${t};\n`;
                }
            });
        });
        types.forEach(t => {
            priorities.forEach(p => {
                 // Only draw edge if this type can have this priority
                if (data.notification_analysis.raw_logs?.some((l: any) => l.type === t && l.priority === p)) {
                    diagram += `        typ_${t} -.-> pri_${p};\n`; // Dashed link
                }
            });
        });
         diagram += `        pri_high --> UserAttention[User Attention];\n`;
         diagram += `        pri_medium --> UserAttention;\n`;
         diagram += `        pri_low -.-> UserAttention;\n`;
         diagram += `        pri_info -.-> PeripheralAwareness((Peripheral Awareness));\n`;


    } else if (data?.nodes && data?.links) {
        // Use provided node/link structure
        data.nodes.forEach((n: any) => diagram += `        ${n.id}["${n.label} (${n.type})"];\n`);
        data.links.forEach((l: any) => diagram += `        ${l.source} -- "${l.label || ''}" --> ${l.target};\n`);
    } else {
        // Fallback diagram
        diagram += '        App1 -->|High Priority| UserAttention;\n';
        diagram += '        App2 -->|Low Priority| PeripheralAwareness;\n';
        diagram += '        UserAttention --> ContextSwitch;\n';
    }
     diagram += '    end\n'; // End subgraph

    return `<!DOCTYPE html><html><head><title>Notification Flow</title><script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script><style>body { font-family: Arial, sans-serif; margin: 20px; } .diagram { max-width: 900px; margin: auto; }</style></head><body><h1>Notification Flow Diagram</h1><div class="diagram"><pre class="mermaid">${diagram}</pre></div><script>mermaid.initialize({ startOnLoad: true });</script></body></html>`;
  }

  private generateCalmnessScorecard(data: any, id: string, context: WorkflowContext): string {
    // Expects data like: { principle_scores: { 1: score, 2: score, ... }, overall_score: score, violations: [...] }
    let scoresHtml = '';
    let overallScore = data?.calm_evaluation?.overall_score || 0;
    let violationsHtml = '';

    if (data?.calm_evaluation?.principle_scores) {
        const principleScores = data.calm_evaluation.principle_scores;
         scoresHtml = CALM_TECH_PRINCIPLES.map((principleText, index) => {
             const principleNum = index + 1;
             const score = principleScores[principleNum] || 0; // Score out of 10
             const color = score >= 8 ? 'green' : score >= 5 ? 'orange' : 'red';
             const shortText = principleText.substring(principleText.indexOf('.') + 2); // Get text after "I. "
             return `<div class="principle-score">
                        <div class="principle-text" title="${principleText}">${principleNum}. ${shortText}</div>
                        <div class="score-bar-container">
                            <div class="score-bar" style="width: ${score * 10}%; background-color: ${color};"></div>
                        </div>
                        <div class="score-value">${score}/10</div>
                    </div>`;
         }).join('');
    } else {
        scoresHtml = "<p>Principle scores not available.</p>";
    }

    if (data?.calm_evaluation?.violations && data.calm_evaluation.violations.length > 0) {
        violationsHtml = '<ul>' + data.calm_evaluation.violations.map((v: any) =>
             `<li><strong>Principle ${v.principle_violated}:</strong> ${v.description} (Severity: ${v.severity || 'N/A'})</li>`
        ).join('') + '</ul>';
    } else {
         violationsHtml = "<p>No specific violations identified.</p>";
    }

    const overallColor = overallScore >= 8 ? 'green' : overallScore >= 5 ? 'orange' : 'red';

    return `<!DOCTYPE html><html><head><title>Calmness Scorecard</title><style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
        .scorecard { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { text-align: center; color: #333; }
        .overall-score { text-align: center; font-size: 2.5em; font-weight: bold; margin: 20px 0; padding: 10px; border-radius: 5px; background-color: ${overallColor}; color: white; }
        .principle-score { display: flex; align-items: center; margin-bottom: 12px; padding: 8px; border-bottom: 1px solid #eee; }
        .principle-text { flex: 3; font-size: 0.9em; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;}
        .score-bar-container { flex: 5; background-color: #e0e0e0; border-radius: 5px; height: 15px; overflow: hidden; }
        .score-bar { height: 100%; border-radius: 5px; transition: width 0.5s ease-in-out; }
        .score-value { flex: 1; text-align: right; font-weight: bold; font-size: 0.9em; padding-left: 10px;}
        .violations { margin-top: 30px; padding: 15px; background: #fff3f3; border: 1px solid #fcc; border-radius: 5px;}
        .violations h3 { margin-top: 0; color: #c00; }
        .violations ul { padding-left: 20px; margin-bottom: 0;}
        .violations li { margin-bottom: 8px; font-size: 0.9em; }
    </style></head><body><div class="scorecard">
      <h1>Calm Technology Scorecard</h1>
      <h2>${context.config.TARGET_SYSTEM || 'System'}</h2>
      <div class="overall-score" title="Overall score based on adherence to Calm Tech principles">${overallScore.toFixed(1)} / 10</div>
      <h2>Principle Breakdown</h2>
      ${scoresHtml}
      <div class="violations">
        <h3>Identified Violations / Concerns</h3>
        ${violationsHtml}
      </div>
    </div></body></html>`;
  }

   private generateWorkflowComplexityDiagram(data: any, id: string, context: WorkflowContext): string {
    // Expects workflow definition data, e.g., from the APIAgent mock response
    let diagram = 'graph TD;\n'; // Top-down diagram
    let analysisHtml = '';

    if (data?.workflow_definition?.steps) {
        const steps = data.workflow_definition.steps;
        const totalDuration = steps.reduce((sum: number, step: any) => sum + (step.avg_duration_minutes || 0), 0);
        const totalHandoffs = steps.reduce((sum: number, step: any) => sum + (step.handoff_points || 0), 0);
        const totalTools = new Set(steps.flatMap((step: any) => step.required_tools || [])).size;
        const complexityScore = data.workflow_definition.complexity_score || 'N/A';

        diagram += `    subgraph "Workflow: ${data.workflow_definition.name || id}"\n`;
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            diagram += `        ${step.step_id}("${step.name}<br/>(${step.avg_duration_minutes || '?'} min)<br/>Tools: ${step.required_tools?.length || 0}");\n`;
            if (i > 0) {
                const prevStep = steps[i - 1];
                const label = prevStep.notification_triggers?.length > 0 ? `Notifies: ${prevStep.notification_triggers.join(', ')}` : '';
                diagram += `        ${prevStep.step_id} -- "${label}" --> ${step.step_id};\n`;
            }
        }
        diagram += `    end\n`;

        analysisHtml = `<h3>Workflow Analysis</h3>
        <ul>
            <li>Estimated Total Duration: <strong>${(totalDuration / 60).toFixed(1)} hours</strong></li>
            <li>Number of Steps: <strong>${steps.length}</strong></li>
            <li>Number of Handoffs: <strong>${totalHandoffs}</strong></li>
            <li>Unique Tools Required: <strong>${totalTools}</strong></li>
            <li>Reported Complexity Score: <strong>${complexityScore} / 10</strong></li>
        </ul>
        <p><strong>Calm Tech Considerations:</strong> Analyze handoffs for potential friction, tool changes for context switching costs, and notification triggers for attention impact.</p>
        `;

    } else {
        diagram += '    A["Step 1"] --> B["Step 2"];\n';
        diagram += '    B --> C["Step 3"];\n';
        analysisHtml = '<p>Workflow definition data not available.</p>';
    }


    return `<!DOCTYPE html><html><head><title>Workflow Complexity</title><script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script><style>
        body { font-family: Arial, sans-serif; margin: 20px; display: flex; gap: 20px; }
        .diagram-container { flex: 2; border: 1px solid #ccc; padding: 15px; border-radius: 5px; background: #f9f9f9; }
        .analysis-container { flex: 1; border: 1px solid #ccc; padding: 15px; border-radius: 5px; background: #f0f8ff; }
        h1, h3 { margin-top: 0; }
    </style></head><body>
    <div class="diagram-container"><h1>Workflow Diagram</h1><div class="mermaid">${diagram}</div></div>
    <div class="analysis-container">${analysisHtml}</div>
    <script>mermaid.initialize({ startOnLoad: true });</script></body></html>`;
  }

}

// --- Image Generation Agent (Optional - might be adapted for visualizing calm/chaotic interfaces) ---
// Keeping the ImageGenerationAgent class structure, but its usage in this workflow might be less central.
// It could be used to generate mockups of proposed calmer interfaces.
class ImageGenerationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  openaiClient: OpenAIClient;
  outputDir: string;

  constructor(id: string, name: string, unitId: string, unitName: string, description: string, openaiClient: OpenAIClient, outputDir: string) {
    this.id = id;
    this.name = name;
    this.unitId = unitId;
    this.unitName = unitName;
    this.description = description;
    this.openaiClient = openaiClient;
    this.outputDir = outputDir; // Specific to this agent instance
  }

  async process(input: any, context: WorkflowContext): Promise<any> {
    const runOutputDir = context.config.OUTPUT_DIR || this.outputDir;
    const imagesDir = path.join(runOutputDir, 'images');
    fs.ensureDirSync(imagesDir);

    const prompts = (input.prompts && Array.isArray(input.prompts)) ? input.prompts : [{ prompt: typeof input === 'string' ? input : input?.prompt, filename: input?.filename }];

    if (!prompts.some((p: any) => p.prompt)) {
        return { error: 'No valid prompts provided for image generation' };
    }

    context.logger.info(`Processing ${prompts.length} image generation prompt(s)`);
    const results: any[] = [];

    for (const promptConfig of prompts) {
        const prompt = promptConfig.prompt;
        const filename = promptConfig.filename || `image_${Date.now()}_${results.length}.png`;
        if (!prompt) {
            results.push({ success: false, error: 'Empty prompt skipped' });
            continue;
        }

        const outputPath = path.join(imagesDir, filename);
        try {
            context.logger.info(`Generating image for prompt: "${prompt.substring(0, 100)}..."`);
            if (!process.env.OPENAI_API_KEY) {
                context.logger.warn("No OpenAI API key found. Using fallback image generation.");
                await this.generateSimulatedImage(prompt, outputPath); // Assumes generateSimulatedImage exists
            } else {
                await this.generateRealImage(prompt, outputPath); // Assumes generateRealImage exists
            }
            results.push({ success: true, prompt: prompt, imagePath: outputPath, imageType: promptConfig.type || 'general', timestamp: new Date().toISOString() });
        } catch (error) {
            context.logger.error(`Error generating image for prompt "${prompt.substring(0,50)}...": ${error}`);
            results.push({ success: false, prompt: prompt, error: String(error) });
        }
    }
     return { success: true, images: results, count: results.filter(r => r.success).length, timestamp: new Date().toISOString() };
  }

  // generateRealImage and generateSimulatedImage methods would be here (copied/adapted from Example 8 if needed)
  // For brevity, assuming they exist and function as before.
  private async generateRealImage(prompt: string, outputPath: string): Promise<void> {
     // Implementation from Example 8...
     try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API key not found");

        console.log(`Calling DALL-E API for: "${prompt.substring(0, 50)}..."`);
        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            { model: "dall-e-3", prompt: prompt, n: 1, size: "1024x1024", response_format: "url" },
            { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        );
        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL returned");

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
        console.log(`Image saved to ${outputPath}`);
        fs.writeFileSync(outputPath.replace('.png', '_prompt.txt'), `Prompt: ${prompt}`);

     } catch (error: any) {
         console.error("Error generating real image:", error.response?.data || error.message);
         // Fallback to simulation on error
         console.warn("Falling back to simulated image generation due to API error.");
         await this.generateSimulatedImage(prompt, outputPath);
         // Do not re-throw, allow workflow to continue with simulated image
     }
   }

  private async generateSimulatedImage(prompt: string, outputPath: string): Promise<void> {
     // Implementation from Example 8...
     await new Promise(resolve => setTimeout(resolve, 500));
     const placeholderContent = `<html><head><title>Simulated Image</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;background:#eee;font-family:sans-serif}.box{border:1px solid #ccc;padding:20px;background:white;text-align:center}</style></head><body><div class="box"><h2>Simulated Image</h2><p>${prompt}</p><p>(API Key Missing or Error)</p></div></body></html>`;
     // Save as HTML instead of PNG for the simulation
     const htmlOutputPath = outputPath.replace(/\.(png|jpg|jpeg)$/i, '.html');
     fs.writeFileSync(htmlOutputPath, placeholderContent);
     console.log(`[Simulated] Generated placeholder HTML for prompt: "${prompt}" at ${htmlOutputPath}`);
   }
}


// --- Workflow Context (unchanged) ---
interface WorkflowContext {
  config: typeof PROJECT_CONFIG & {
    OUTPUT_DIR?: string;
    OPENAI_API_KEY?: string;
    PROJECT_ID?: string;
    VERSION?: string;
    ORGANIZATION?: string;
    CALM_TECH_PRINCIPLES?: string[]; // Add principles to context
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

// --- Organizational Units (adapted for Calm Tech / Org Ergonomics focus) ---
interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

const UNITS: Record<string, OrganizationalUnit> = {
  ORG_ANALYSIS: {
    id: 'org_analysis_unit',
    name: 'Organizational Analysis Unit',
    description: 'Analyzes existing workflows, communication patterns, and user feedback related to attention and focus.',
    agents: [
      new LLMAgent({
        id: 'workflow_analyzer',
        name: 'Workflow Analyzer',
        unitId: 'org_analysis_unit',
        unitName: 'Organizational Analysis Unit',
        description: 'Analyzes workflow definitions for complexity, handoffs, and potential Calm Tech violations.',
        systemPrompt: `You are an organizational workflow analyst specializing in identifying bottlenecks, context-switching costs, and potential areas for improvement based on Calm Technology principles (${CALM_TECH_PRINCIPLES.join('; ')}). Analyze the provided workflow definition (steps, tools, notifications) and identify:
        1. High-complexity steps.
        2. Frequent handoffs or tool changes (potential context switching).
        3. Steps generating potentially disruptive notifications.
        4. Opportunities to apply Calm Tech principles (e.g., peripheral information, minimizing steps).
        5. A calculated complexity score (1-10) based on factors like steps, handoffs, tools, and notification noise.
        Format output as JSON with keys: 'analysis_summary', 'complexity_score', 'potential_violations' (array of objects with 'principle_ids', 'step_id', 'description'), 'recommendations' (array).`
      }),
      new APIAgent({
        id: 'feedback_collector',
        name: 'Employee Feedback Collector',
        unitId: 'org_analysis_unit',
        unitName: 'Organizational Analysis Unit',
        description: 'Retrieves (mock) employee feedback regarding focus, distractions, and tool usability.',
        endpoint: 'https://api.example.com/employee/feedback', // Mock endpoint
        method: 'GET',
        transformRequest: (input) => ({ limit: input.limit || 100, department: input.department }),
        transformResponse: (response) => response // Use raw mock response
      }),
       new DataProcessingAgent({
        id: 'feedback_analyzer',
        name: 'Feedback Analyzer',
        unitId: 'org_analysis_unit',
        unitName: 'Organizational Analysis Unit',
        description: 'Processes raw feedback data to identify trends in distraction and focus.',
        processingFunction: (data, context) => {
          // Expects data from feedback_collector: { data: { feedback: [...] } }
          const feedbackList = data?.data?.feedback || [];
          if (feedbackList.length === 0) return { summary: "No feedback data to analyze.", trends: {}, by_role: {}, by_department: {} };

          const trends = {
            total_feedback: feedbackList.length,
            avg_focus_score: 0, // 1-5 scale, map 'Very Low' to 1, 'Very High' to 5
            avg_distraction_score: 0,
            avg_notification_overload_score: 0,
            top_distractions: {} as Record<string, number>,
            focus_level_distribution: {} as Record<string, number>
          };
          const byRole: Record<string, any> = {};
          const byDepartment: Record<string, any> = {};

          const focusMapping: Record<string, number> = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 };

          feedbackList.forEach((fb: any) => {
            const focusScore = focusMapping[fb.reported_focus_level] || 3; // Default to moderate
            trends.avg_focus_score += focusScore;
            trends.avg_distraction_score += fb.distraction_frequency_score || 0;
            trends.avg_notification_overload_score += fb.notification_overload_score || 0;

            trends.top_distractions[fb.primary_distraction] = (trends.top_distractions[fb.primary_distraction] || 0) + 1;
            trends.focus_level_distribution[fb.reported_focus_level] = (trends.focus_level_distribution[fb.reported_focus_level] || 0) + 1;

            // Aggregate by role
            if (!byRole[fb.role]) byRole[fb.role] = { count: 0, total_focus: 0, total_distraction: 0, total_notification: 0 };
            byRole[fb.role].count++;
            byRole[fb.role].total_focus += focusScore;
            byRole[fb.role].total_distraction += fb.distraction_frequency_score || 0;
            byRole[fb.role].total_notification += fb.notification_overload_score || 0;

             // Aggregate by department
             if (!byDepartment[fb.department]) byDepartment[fb.department] = { count: 0, total_focus: 0, total_distraction: 0, total_notification: 0 };
             byDepartment[fb.department].count++;
             byDepartment[fb.department].total_focus += focusScore;
             byDepartment[fb.department].total_distraction += fb.distraction_frequency_score || 0;
             byDepartment[fb.department].total_notification += fb.notification_overload_score || 0;

          });

          trends.avg_focus_score /= trends.total_feedback;
          trends.avg_distraction_score /= trends.total_feedback;
          trends.avg_notification_overload_score /= trends.total_feedback;

          // Calculate averages for roles/departments
          Object.values(byRole).forEach(roleData => {
             roleData.avg_focus_score = roleData.total_focus / roleData.count;
             roleData.avg_distraction_score = roleData.total_distraction / roleData.count;
             roleData.avg_notification_overload_score = roleData.total_notification / roleData.count;
          });
           Object.values(byDepartment).forEach(deptData => {
               deptData.avg_focus_score = deptData.total_focus / deptData.count;
               deptData.avg_distraction_score = deptData.total_distraction / deptData.count;
               deptData.avg_notification_overload_score = deptData.total_notification / deptData.count;
           });


          return {
              summary: `Analyzed ${trends.total_feedback} feedback entries. Avg Focus: ${trends.avg_focus_score.toFixed(2)}, Avg Distraction: ${trends.avg_distraction_score.toFixed(2)}, Avg Notification Overload: ${trends.avg_notification_overload_score.toFixed(2)}.`,
              trends: trends,
              by_role: byRole,
              by_department: byDepartment
          };
        }
      }),
      new APIAgent({
          id: 'notification_log_retriever',
          name: 'Notification Log Retriever',
          unitId: 'org_analysis_unit',
          unitName: 'Organizational Analysis Unit',
          description: 'Retrieves (mock) notification logs from communication platforms.',
          endpoint: 'https://api.example.com/notification/logs', // Mock endpoint
          method: 'GET',
          transformRequest: (input) => ({ limit: input.limit || 500, user_id: input.user_id, time_range: input.time_range || '7d' }),
          transformResponse: (response) => response // Use raw mock response
      }),
      new DataProcessingAgent({
          id: 'notification_analyzer',
          name: 'Notification Analyzer',
          unitId: 'org_analysis_unit',
          unitName: 'Organizational Analysis Unit',
          description: 'Analyzes notification logs for volume, frequency, type, and priority.',
          processingFunction: (data, context) => {
              // Expects data from notification_log_retriever: { data: { logs: [...] } }
              const logs = data?.data?.logs || [];
              if (logs.length === 0) return { summary: "No notification logs to analyze.", by_source: {}, by_type: {}, by_priority: {}, by_user: {} };

              const analysis = {
                  total_notifications: logs.length,
                  avg_per_day: 0, // Calculate based on time range if available
                  by_source: {} as Record<string, number>,
                  by_type: {} as Record<string, number>,
                  by_priority: {} as Record<string, number>,
                  by_user: {} as Record<string, { count: number, high_priority: number, interaction_required: number }>,
                  interaction_required_percent: 0,
                  high_priority_percent: 0
              };

              let interactionRequiredCount = 0;
              let highPriorityCount = 0;
              const users = new Set<string>();

              logs.forEach((log: any) => {
                  analysis.by_source[log.source_app] = (analysis.by_source[log.source_app] || 0) + 1;
                  analysis.by_type[log.type] = (analysis.by_type[log.type] || 0) + 1;
                  analysis.by_priority[log.priority] = (analysis.by_priority[log.priority] || 0) + 1;
                  users.add(log.user_id);

                  if (!analysis.by_user[log.user_id]) {
                      analysis.by_user[log.user_id] = { count: 0, high_priority: 0, interaction_required: 0 };
                  }
                  analysis.by_user[log.user_id].count++;

                  if (log.interaction_required) {
                      interactionRequiredCount++;
                      analysis.by_user[log.user_id].interaction_required++;
                  }
                  if (log.priority === 'high') {
                      highPriorityCount++;
                      analysis.by_user[log.user_id].high_priority++;
                  }
              });

              analysis.interaction_required_percent = (interactionRequiredCount / analysis.total_notifications) * 100;
              analysis.high_priority_percent = (highPriorityCount / analysis.total_notifications) * 100;
              // Simple daily average estimate assuming 7 days
              analysis.avg_per_day = analysis.total_notifications / 7 / users.size;


              return {
                  summary: `Analyzed ${analysis.total_notifications} notifications across ${users.size} users. Avg ${analysis.avg_per_day.toFixed(1)}/user/day. ${analysis.high_priority_percent.toFixed(1)}% high priority. ${analysis.interaction_required_percent.toFixed(1)}% required interaction.`,
                  by_source: analysis.by_source,
                  by_type: analysis.by_type,
                  by_priority: analysis.by_priority,
                  by_user: analysis.by_user, // Be cautious with large user counts
                  raw_logs: logs // Include raw logs for downstream use (could be large)
              };
          }
      })
    ]
  },
  CALM_DESIGN: {
    id: 'calm_design_unit',
    name: 'Calm Design Unit',
    description: 'Designs interfaces, notification policies, and workflows adhering to Calm Tech principles.',
    agents: [
      new LLMAgent({
        id: 'interface_designer',
        name: 'Calm Interface Designer',
        unitId: 'calm_design_unit',
        unitName: 'Calm Design Unit',
        description: 'Generates design concepts for user interfaces that minimize attention demands.',
        systemPrompt: `You are a UI/UX designer specializing in Calm Technology (${CALM_TECH_PRINCIPLES.join('; ')}). Based on the analysis of current issues (attention demand, notifications), design key aspects of a calmer communication platform interface. Focus on:
        1.  **Peripheral Information Display:** How can status or non-urgent info be shown without demanding focus (e.g., subtle indicators, ambient displays)?
        2.  **Reduced Notification Intrusion:** How can notifications be presented less disruptively (e.g., batching, summaries, alternative modalities like subtle sound/light)?
        3.  **Minimized Visual Clutter:** Design principles for a clean, focused interface.
        4.  **Graceful Failure Modes:** How does the interface behave if parts are unavailable?
        Provide design concepts, rationale linked to Calm Tech principles, and potential UI mock-up descriptions (for image generation).
        Format as JSON with keys: 'design_concepts' (array of objects with 'feature', 'description', 'calm_principles_applied' [array of principle numbers]), 'mockup_prompts' (array of strings).`
      }),
      new RuleBasedAgent({
        id: 'notification_policy_designer',
        name: 'Notification Policy Designer',
        unitId: 'calm_design_unit',
        unitName: 'Calm Design Unit',
        description: 'Defines rules for notification delivery based on context, priority, and user preferences.',
        rules: [
           { // Rule 1: Batch low-priority informational notifications
             condition: (input) => input.notification_type === 'info' && input.priority === 'low',
             action: (input, context) => ({ recommendation: 'Batch delivery every 30-60 minutes', policy_change: 'Set delivery_mode=batched', principle_applied: [1, 2] }),
             principle_violated: 1, // Requires smallest attention
             description: "Batch low-priority info notifications."
           },
           { // Rule 2: Use peripheral channel for background system updates
             condition: (input) => input.notification_type === 'system_update' && !input.requires_immediate_action,
             action: (input, context) => ({ recommendation: 'Use subtle status indicator or peripheral display', policy_change: 'Set channel=peripheral', principle_applied: [1, 3, 5] }),
             principle_violated: 1, // Requires smallest attention
             description: "Use periphery for non-urgent system updates."
           },
           { // Rule 3: Escalate only truly urgent items via disruptive alerts
             condition: (input) => input.priority === 'high' && input.is_urgent && input.requires_action,
             action: (input, context) => ({ recommendation: 'Allow immediate, distinct alert (non-verbal if possible)', policy_change: 'Set channel=immediate_alert', principle_applied: [1, 5, 7] }),
             principle_violated: 1, // Requires smallest attention (by being rare)
             description: "Reserve disruptive alerts for truly urgent, actionable items."
           },
           { // Rule 4: Provide user control over notification settings per source/type
             condition: (input) => input.feature === 'notification_settings', // Hypothetical input checking feature design
             action: (input, context) => ({ recommendation: 'Allow user overrides for channels, batching, priorities per source/type', policy_change: 'Implement granular user controls', principle_applied: [4, 7] }),
             principle_violated: 4, // Amplifying humanity (control)
             description: "Empower users with granular notification controls."
           },
           { // Rule 5: Default to less intrusive communication methods
               condition: (input) => input.communication_context === 'status_update' && !input.needs_ack,
               action: (input, context) => ({ recommendation: 'Default to asynchronous status update (e.g., team feed) instead of direct message', policy_change: 'Set default_channel=async_feed', principle_applied: [1, 2] }),
               principle_violated: 1,
               description: "Prefer async updates over direct messages for status."
           }
        ],
        defaultAction: (input, context) => ({ recommendation: 'Apply standard notification handling', policy_change: 'No specific policy change', principle_applied: [] })
      }),
      new LLMAgent({
          id: 'workflow_redesigner',
          name: 'Calm Workflow Redesigner',
          unitId: 'calm_design_unit',
          unitName: 'Calm Design Unit',
          description: 'Redesigns workflows to reduce steps, minimize context switching, and align with Calm Tech.',
          systemPrompt: `You are an expert in workflow optimization and Calm Technology (${CALM_TECH_PRINCIPLES.join('; ')}). Based on the analysis of the existing workflow and identified Calm Tech violations, propose a redesigned workflow. Focus on:
          1.  **Minimizing Steps:** Can steps be combined or automated? (Principle VII)
          2.  **Reducing Context Switching:** Can tasks be grouped or tool transitions smoothed? (Principle I)
          3.  **Leveraging Periphery:** Can status be monitored passively? (Principle III)
          4.  **Improving Information Flow:** Make necessary info available calmly when needed. (Principle II)
          5.  **Robustness:** How does the workflow handle failures or delays? (Principle VI)
          6.  **Familiarity:** Leverage existing user behaviors where possible. (Principle VIII)
          Present the redesigned workflow steps, explain the rationale based on Calm Tech principles, and highlight expected improvements (e.g., reduced time, fewer interruptions).
          Format as JSON with keys: 'redesigned_workflow' (object with 'name', 'description', 'steps' array), 'rationale', 'expected_improvements', 'calm_principles_addressed' (array of principle numbers).`
      })
    ]
  },
  EVALUATION: {
    id: 'evaluation_unit',
    name: 'Evaluation Unit',
    description: 'Evaluates proposed designs and workflows against Calm Tech principles and simulated data.',
    agents: [
      new LLMAgent({
        id: 'calmness_evaluator',
        name: 'Calmness Evaluator',
        unitId: 'evaluation_unit',
        unitName: 'Evaluation Unit',
        description: 'Scores designs/workflows based on adherence to the 8 Calm Tech principles.',
        systemPrompt: `You are a Calm Technology certification expert. Evaluate the provided design proposal (interface concepts, notification policies, workflow) based *strictly* on the 8 Principles of Calm Technology:
        ${CALM_TECH_PRINCIPLES.map((p, i) => `${i+1}. ${p}`).join('\\n')}

        Assign a score from 0 to 10 for *each* principle, where 10 represents perfect adherence. Provide a brief justification for each score based *only* on the provided design information and the principles.
        Identify specific aspects of the design that violate or uphold each principle. Calculate an overall score (average of the 8 principle scores).
        Format the output as JSON with keys: 'calm_evaluation' containing 'principle_scores' (object mapping principle number 1-8 to score 0-10), 'justifications' (object mapping principle number 1-8 to text justification), 'overall_score' (number), 'violations' (array of objects with 'principle_violated' number and 'description'), 'strengths' (array of objects with 'principle_applied' number and 'description').`
      }),
      new DataProcessingAgent({
          id: 'simulation_runner',
          name: 'Workflow Simulation Runner',
          unitId: 'evaluation_unit',
          unitName: 'Evaluation Unit',
          description: 'Simulates the redesigned workflow to estimate performance and attention impact.',
          processingFunction: (data, context) => {
              // Expects input like { redesigned_workflow: { steps: [...] }, notification_policies: {...}, num_simulations: 100 }
              const workflow = data?.redesigned_workflow;
              const policies = data?.notification_policies; // May be complex output from rule-based agent
              const numSimulations = data?.num_simulations || 100;

              if (!workflow?.steps) return { error: "Redesigned workflow steps not provided for simulation." };

              context.logger.info(`Running ${numSimulations} simulations for workflow: ${workflow.name}`);
              let totalSimulatedDuration = 0;
              let totalSimulatedNotifications = 0;
              let totalContextSwitches = 0; // Estimate based on tool changes

              for (let i = 0; i < numSimulations; i++) {
                   let currentDuration = 0;
                   let currentNotifications = 0;
                   let currentSwitches = 0;
                   let lastTools: string[] = [];

                   workflow.steps.forEach((step: any) => {
                       // Add variability to duration
                       const duration = (step.avg_duration_minutes || 10) * (0.8 + Math.random() * 0.4);
                       currentDuration += duration;

                       // Simulate notifications based on triggers and basic policies
                       (step.notification_triggers || []).forEach((trigger: string) => {
                            // Apply a very basic policy check (e.g., low priority might be batched/skipped)
                            const priority = trigger.toLowerCase().includes('urgent') || trigger.toLowerCase().includes('assigned') ? 'high' : 'low';
                            const isBatched = policies?.triggered_rules?.some((r:any) => r.policy_change?.includes('batched') && priority === 'low');
                            if (!isBatched || Math.random() > 0.8) { // Assume batching reduces notifications significantly
                                currentNotifications++;
                            }
                       });

                       // Estimate context switches based on tool changes
                       const currentTools = step.required_tools || [];
                       if (lastTools.length > 0 && !currentTools.every(tool => lastTools.includes(tool))) {
                           currentSwitches++;
                       }
                       lastTools = currentTools;
                  });
                  totalSimulatedDuration += currentDuration;
                  totalSimulatedNotifications += currentNotifications;
                  totalContextSwitches += currentSwitches;
              }

              const avgDuration = totalSimulatedDuration / numSimulations / 60; // hours
              const avgNotifications = totalSimulatedNotifications / numSimulations;
              const avgSwitches = totalContextSwitches / numSimulations;

              return {
                  simulation_summary: `Simulated ${numSimulations} runs of workflow '${workflow.name}'.`,
                  estimated_avg_duration_hours: avgDuration.toFixed(2),
                  estimated_avg_notifications_per_run: avgNotifications.toFixed(1),
                  estimated_avg_context_switches_per_run: avgSwitches.toFixed(1),
                  comparison_needed: "Compare these metrics against the original workflow analysis."
                  // Note: This is a very basic simulation. Real simulation would be far more complex.
              };
          }
      })
    ]
  },
  VISUALIZATION: {
    id: 'visualization_unit',
    name: 'Visualization Unit',
    description: 'Generates visualizations of Calm Tech metrics and designs.',
    agents: [
      new VisualizationAgent({
        id: 'attention_visualizer',
        name: 'Attention Demand Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Visualization Unit',
        description: 'Creates charts showing attention demand and focus levels.',
        visualizationType: 'attention_demand'
      }),
      new VisualizationAgent({
        id: 'notification_visualizer',
        name: 'Notification Flow Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Visualization Unit',
        description: 'Generates diagrams of notification sources, types, and priorities.',
        visualizationType: 'notification_flow'
      }),
      new VisualizationAgent({
        id: 'scorecard_visualizer',
        name: 'Calmness Scorecard Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Visualization Unit',
        description: 'Displays the Calm Tech evaluation scorecard.',
        visualizationType: 'calmness_scorecard'
      }),
       new VisualizationAgent({
           id: 'workflow_visualizer',
           name: 'Workflow Complexity Visualizer',
           unitId: 'visualization_unit',
           unitName: 'Visualization Unit',
           description: 'Displays workflow diagrams and complexity analysis.',
           visualizationType: 'workflow_complexity'
       })
      // Potentially add an agent using ImageGenerationAgent to visualize UI mockups
    ]
  }
};

// --- Workflow Stages (adapted for Calm Tech assessment/design) ---
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

const WORKFLOW_STAGES: WorkflowStage[] = [
  // --- Analysis Phase ---
  {
    id: 'fetch_workflow_definition',
    name: 'Fetch Workflow Definition',
    description: 'Retrieve the definition of the target workflow.',
    unit: UNITS.ORG_ANALYSIS,
    agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'api_agent_placeholder') || new APIAgent({ // Placeholder, replace if API needed
        id: 'workflow_definition_api', name: 'Workflow Definition API', unitId: 'org_analysis_unit', unitName: 'Org Analysis',
        description: 'Retrieves workflow definition', endpoint: 'https://api.example.com/workflow/definition', method: 'GET'
    }),
    prepareInput: (context) => ({ workflow_id: context.config.TARGET_SYSTEM || 'support-ticket-flow' }),
    dependencies: [],
    outputKey: 'workflow_definition'
  },
  {
    id: 'analyze_workflow',
    name: 'Analyze Workflow Complexity & Calmness',
    description: 'Analyze the workflow for complexity and Calm Tech issues.',
    unit: UNITS.ORG_ANALYSIS,
    agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'workflow_analyzer') as Agent,
    prepareInput: (context) => context.outputs.workflow_definition?.data || { error: "Workflow definition missing" },
    dependencies: ['fetch_workflow_definition'],
    outputKey: 'workflow_analysis'
  },
   {
       id: 'fetch_feedback',
       name: 'Fetch Employee Feedback',
       description: 'Retrieve employee feedback on focus and distractions.',
       unit: UNITS.ORG_ANALYSIS,
       agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'feedback_collector') as Agent,
       prepareInput: (context) => ({ limit: 150 }), // Fetch more feedback
       dependencies: [],
       outputKey: 'raw_employee_feedback'
   },
   {
       id: 'analyze_feedback',
       name: 'Analyze Feedback Trends',
       description: 'Process feedback to identify distraction patterns.',
       unit: UNITS.ORG_ANALYSIS,
       agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'feedback_analyzer') as Agent,
       prepareInput: (context) => context.outputs.raw_employee_feedback || { data: { feedback: [] } },
       dependencies: ['fetch_feedback'],
       outputKey: 'feedback_analysis'
   },
   {
       id: 'fetch_notification_logs',
       name: 'Fetch Notification Logs',
       description: 'Retrieve notification logs for analysis.',
       unit: UNITS.ORG_ANALYSIS,
       agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'notification_log_retriever') as Agent,
       prepareInput: (context) => ({ limit: 1000, time_range: '14d' }), // Wider range
       dependencies: [],
       outputKey: 'raw_notification_logs'
   },
   {
       id: 'analyze_notifications',
       name: 'Analyze Notification Patterns',
       description: 'Analyze volume, types, and sources of notifications.',
       unit: UNITS.ORG_ANALYSIS,
       agent: UNITS.ORG_ANALYSIS.agents.find(a => a.id === 'notification_analyzer') as Agent,
       prepareInput: (context) => context.outputs.raw_notification_logs || { data: { logs: [] } },
       dependencies: ['fetch_notification_logs'],
       outputKey: 'notification_analysis'
   },

  // --- Design Phase ---
  {
    id: 'design_calm_interface',
    name: 'Design Calm Interface Concepts',
    description: 'Generate UI concepts based on analysis.',
    unit: UNITS.CALM_DESIGN,
    agent: UNITS.CALM_DESIGN.agents.find(a => a.id === 'interface_designer') as Agent,
    prepareInput: (context) => ({
        analysis_summary: "Based on feedback and notification analysis, users experience high notification overload and frequent context switching. Key pain points: constant pings, visually cluttered dashboards.",
        feedback_highlights: context.outputs.feedback_analysis?.summary,
        notification_highlights: context.outputs.notification_analysis?.summary,
        workflow_issues: context.outputs.workflow_analysis?.potential_violations
    }),
    dependencies: ['analyze_feedback', 'analyze_notifications', 'analyze_workflow'],
    outputKey: 'interface_design_concepts'
  },
  {
    id: 'design_notification_policy',
    name: 'Design Notification Policies',
    description: 'Design Notification Policies',
    unit: UNITS.CALM_DESIGN,
    // This uses the RuleBasedAgent directly as the "process" applies the rules
    agent: UNITS.CALM_DESIGN.agents.find(a => a.id === 'notification_policy_designer') as Agent,
     prepareInput: (context) => ({
         // The rule-based agent acts on hypothetical inputs or context,
         // but here we pass the analysis to potentially inform default actions or context checks within rules.
         notification_analysis: context.outputs.notification_analysis,
         feedback_analysis: context.outputs.feedback_analysis,
         // We might pass hypothetical notification scenarios here to test the rules,
         // or the agent simply outputs the effective policy based on its rules.
         // For this example, let's assume it outputs its configured policy logic.
         trigger_mode: 'policy_generation' // Signal to output the policy logic
     }),
    dependencies: ['analyze_notifications', 'analyze_feedback'],
    outputKey: 'notification_policies' // Output might be the set of defined rules/recommendations
  },
   {
       id: 'redesign_workflow',
       name: 'Redesign Workflow for Calmness',
       description: 'Redesign Workflow for Calmness',
       unit: UNITS.CALM_DESIGN,
       agent: UNITS.CALM_DESIGN.agents.find(a => a.id === 'workflow_redesigner') as Agent,
       prepareInput: (context) => ({
           original_workflow: context.outputs.workflow_definition?.data,
           workflow_analysis: context.outputs.workflow_analysis,
           calm_principles: CALM_TECH_PRINCIPLES // Provide principles for reference
       }),
       dependencies: ['fetch_workflow_definition', 'analyze_workflow'],
       outputKey: 'redesigned_workflow_proposal'
   },

  // --- Evaluation Phase ---
   {
       id: 'simulate_redesigned_workflow',
       name: 'Simulate Redesigned Workflow',
       description: 'Simulate Redesigned Workflow',
       unit: UNITS.EVALUATION,
       agent: UNITS.EVALUATION.agents.find(a => a.id === 'simulation_runner') as Agent,
       prepareInput: (context) => ({
           redesigned_workflow: context.outputs.redesigned_workflow_proposal?.redesigned_workflow,
           notification_policies: context.outputs.notification_policies, // Policies might influence simulation
           num_simulations: 200
       }),
       dependencies: ['redesign_workflow', 'design_notification_policy'],
       outputKey: 'workflow_simulation_results'
   },
  {
    id: 'evaluate_calmness',
    name: 'Evaluate Calmness',
    description: 'Evaluate Calmness',
    unit: UNITS.EVALUATION,
    agent: UNITS.EVALUATION.agents.find(a => a.id === 'calmness_evaluator') as Agent,
    prepareInput: (context) => ({
        design_proposal: {
            interface_concepts: context.outputs.interface_design_concepts?.design_concepts,
            notification_policies: context.outputs.notification_policies, // Output from rule agent
            redesigned_workflow: context.outputs.redesigned_workflow_proposal?.redesigned_workflow,
            simulation_results: context.outputs.workflow_simulation_results
        },
        calm_principles: CALM_TECH_PRINCIPLES // Provide principles for evaluation context
    }),
    dependencies: ['design_calm_interface', 'design_notification_policy', 'redesign_workflow', 'simulate_redesigned_workflow'],
    outputKey: 'calmness_evaluation'
  },

  // --- Visualization Phase ---
  {
    id: 'visualize_attention_demand',
    name: 'Visualize Attention Demand',
    description: 'Visualize Attention Demand',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'attention_visualizer') as Agent,
    prepareInput: (context) => ({
        feedback_analysis: context.outputs.feedback_analysis, // Use processed feedback
        // Or potentially simulation_results if they include attention metrics
    }),
    dependencies: ['analyze_feedback', 'workflow_simulation_results'], // Depends on feedback or simulation
    outputKey: 'attention_demand_visualization'
  },
  {
    id: 'visualize_notification_flow',
    name: 'Visualize Notification Flow',
    description: 'Visualize Notification Flow',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'notification_visualizer') as Agent,
    prepareInput: (context) => ({
        notification_analysis: context.outputs.notification_analysis, // Use analyzed data
        proposed_policies: context.outputs.notification_policies
    }),
    dependencies: ['analyze_notifications', 'design_notification_policy'],
    outputKey: 'notification_flow_visualization'
  },
   {
       id: 'visualize_workflow',
       name: 'Visualize Workflow Complexity',
       description: 'Visualize Workflow Complexity',
       unit: UNITS.VISUALIZATION,
       agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'workflow_visualizer') as Agent,
       prepareInput: (context) => ({
           // Could combine original and redesigned for comparison visual
           workflow_definition: context.outputs.redesigned_workflow_proposal?.redesigned_workflow || context.outputs.workflow_definition?.data,
           analysis: context.outputs.workflow_analysis,
           simulation: context.outputs.workflow_simulation_results
       }),
       dependencies: ['fetch_workflow_definition', 'analyze_workflow', 'redesign_workflow', 'simulate_redesigned_workflow'],
       outputKey: 'workflow_visualization'
   },
  {
    id: 'visualize_scorecard',
    name: 'Visualize Calmness Scorecard',
    description: 'Visualize Calmness Scorecard',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'scorecard_visualizer') as Agent,
    prepareInput: (context) => context.outputs.calmness_evaluation || { calm_evaluation: { overall_score: 0, principle_scores: {} } }, // Pass evaluation results
    dependencies: ['evaluate_calmness'],
    outputKey: 'calmness_scorecard_visualization'
  },
   {
       id: 'generate_ui_mockups',
       name: 'Generate UI Mockups (Optional)',
       description: 'Generate UI Mockups (Optional)',
       unit: UNITS.VISUALIZATION, // Or CALM_DESIGN
       agent: new ImageGenerationAgent( // Assuming agent exists/is needed
           'ui_mockup_generator', 'UI Mockup Generator', 'visualization_unit', 'Visualization Unit',
           'Generates UI mockups based on design concepts', new OpenAIClient(), path.join(outputDir, 'images')
       ),
       prepareInput: (context) => ({
           prompts: context.outputs.interface_design_concepts?.mockup_prompts?.map((p: string, i: number) => ({
               prompt: p,
               filename: `ui_mockup_${i + 1}.png`
           })) || [{ prompt: "A calm, minimalist dashboard interface with subtle peripheral notifications.", filename: "default_mockup.png"}]
       }),
       dependencies: ['design_calm_interface'],
       outputKey: 'ui_mockups'
   }
];

// --- Workflow Visualization Function (Adapted for Calm Tech context) ---
function generateWorkflowVisualizations(context: WorkflowContext, outputDir: string): void {
  // Ensure logger has a valid path even if context is minimal initially
  const vizLogPath = path.join(outputDir, 'logs', 'visualization_generation.log');
  fs.ensureDirSync(path.dirname(vizLogPath));
  const logger = context.logger || new FileLogger(vizLogPath);

  // Ensure context has necessary properties with defaults if needed
   const safeContext: WorkflowContext = {
       config: context.config || PROJECT_CONFIG, // Use PROJECT_CONFIG as fallback
       outputs: context.outputs || {},
       logger: logger,
       eventSystem: context.eventSystem || EventSystem.getInstance(),
       startTime: context.startTime || Date.now(),
       metrics: context.metrics || { stageMetrics: {} },
       // currentStage is not strictly needed for visualization, can be omitted or defaulted
   };


  logger.info('Starting workflow visualization generation...');
  fs.ensureDirSync(path.join(outputDir, 'visualizations'));
  fs.ensureDirSync(path.join(outputDir, 'logs'));

  // Create mermaid workflow diagram
  let mermaidDiagram = 'graph TD;\\n';
  const unitColors: Record<string, string> = {
    'org_analysis_unit': '#81D4FA',   // Light Blue
    'calm_design_unit': '#A5D6A7',    // Light Green
    'evaluation_unit': '#FFCC80',     // Light Orange
    'visualization_unit': '#CE93D8'  // Light Purple
  };

   // Group stages by logical phase
   const phases: Record<string, string[]> = {
       "1_Analysis": ['fetch_workflow_definition', 'analyze_workflow', 'fetch_feedback', 'analyze_feedback', 'fetch_notification_logs', 'analyze_notifications'],
       "2_Design": ['design_calm_interface', 'design_notification_policy', 'redesign_workflow'],
       "3_Evaluation": ['simulate_redesigned_workflow', 'evaluate_calmness'],
       "4_Visualization": ['visualize_attention_demand', 'visualize_notification_flow', 'visualize_workflow', 'visualize_scorecard', 'generate_ui_mockups']
   };

   Object.entries(phases).forEach(([phaseName, stageIds]) => {
       const cleanPhaseName = phaseName.substring(phaseName.indexOf('_') + 1);
       mermaidDiagram += `    subgraph ${cleanPhaseName}\n`;
       stageIds.forEach(stageId => {
           const stage = WORKFLOW_STAGES.find(s => s.id === stageId);
           if (stage) {
               const nodeId = stage.id;
               const unitId = stage.unit.id;
               const agentType = stage.agent.constructor.name.replace('Agent', '');
               const isCompleted = !!context.outputs[stage.outputKey];
               const borderColor = isCompleted ? '#2E7D32' : '#757575'; // Dark Green / Grey
               const fillColor = unitColors[unitId] || '#E0E0E0'; // Grey fallback

               mermaidDiagram += `        ${nodeId}["${stage.name}<br/>(${agentType})<br/><i>${stage.unit.name}</i>"];\n`;
               mermaidDiagram += `        style ${nodeId} fill:${fillColor},stroke:${borderColor},stroke-width:${isCompleted ? '2px' : '1px'},color:#333;\n`;
           }
       });
       mermaidDiagram += `    end\n`;
   });


  // Add edges for dependencies
  for (const stage of WORKFLOW_STAGES) {
    for (const depId of stage.dependencies) {
        // Check if dependency exists to avoid errors
        if (WORKFLOW_STAGES.some(s => s.id === depId)) {
           mermaidDiagram += `    ${depId} --> ${stage.id};\n`;
        } else {
            logger.warn(`Dependency ${depId} for stage ${stage.id} not found in WORKFLOW_STAGES.`);
        }
    }
  }

  // Write MMD to file
  fs.writeFileSync(path.join(outputDir, 'visualizations', 'workflow_diagram.mmd'), mermaidDiagram);
  logger.info('Generated workflow mermaid diagram definition.');

  // Create metrics data for chart
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

  // --- Create HTML Dashboard ---
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Calm Tech Org Ergonomics Workflow</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background-color: #f8f9fa; color: #343a40; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #dee2e6; }
    h1 { color: #0056b3; } h2 { color: #17a2b8; margin-top: 40px; border-bottom: 1px solid #ced4da; padding-bottom: 5px;} h3 { color: #6c757d; }
    .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
    .card h3 { margin-top: 0; color: #007bff; }
    .workflow-diagram { grid-column: 1 / -1; } /* Span full width */
    .mermaid { text-align: center; background: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6; }
    .chart-container { height: 350px; }
    .stage-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .stage-card { background: #fff; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; transition: box-shadow 0.2s ease; }
    .stage-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .completed { border-left: 5px solid #28a745; } /* Green */
    .pending { border-left: 5px solid #ffc107; } /* Yellow */
    .failed { border-left: 5px solid #dc3545; } /* Red */
    .stage-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .stage-name { font-weight: bold; color: #495057; }
    .agent-type { font-size: 0.8em; padding: 3px 8px; border-radius: 10px; background: #e9ecef; color: #6c757d; }
    .LLM { background: #cfe2ff; color: #0a58ca; }
    .Data { background: #d1e7dd; color: #146c43; }
    .API { background: #fff3cd; color: #997404; }
    .Rule { background: #f8d7da; color: #842029; }
    .Visualization { background: #e2d9f3; color: #563d7c; }
    .Image { background: #d6f5d6; color: #198754; }
    .output-link { font-size: 0.8em; margin-top: 10px; }
    .output-link a { color: #007bff; text-decoration: none; } .output-link a:hover { text-decoration: underline; }
    .viz-preview { width: 100%; height: 300px; border: 1px solid #ccc; border-radius: 5px; margin-top: 15px; }
    .viz-placeholder { display: flex; justify-content: center; align-items: center; height: 300px; background: #f0f0f0; color: #888; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Calm Technology Organizational Ergonomics Workflow</h1>
      <p><strong>Objective:</strong> ${context.config.OBJECTIVE}</p>
      <p><strong>Target System/Workflow:</strong> ${context.config.TARGET_SYSTEM}</p>
    </div>

    <h2>Workflow Execution Overview</h2>
    <div class="card workflow-diagram">
       <h3>Workflow Diagram</h3>
       <div class="mermaid">${mermaidDiagram}</div>
    </div>

    <div class="grid-container">
       <div class="card">
           <h3>Processing Metrics</h3>
           <div class="chart-container">
               <canvas id="durationChart"></canvas>
           </div>
       </div>
       <div class="card">
           <h3>Calmness Evaluation</h3>
           ${context.outputs.calmness_scorecard_visualization ?
               `<iframe src="./visualizations/${path.basename(context.outputs.calmness_scorecard_visualization.visualization_path)}" class="viz-preview" title="Calmness Scorecard"></iframe>` :
               '<div class="viz-placeholder">Calmness Scorecard Not Generated</div>'
           }
       </div>
       <div class="card">
           <h3>Attention/Focus Analysis</h3>
            ${context.outputs.attention_demand_visualization ?
               `<iframe src="./visualizations/${path.basename(context.outputs.attention_demand_visualization.visualization_path)}" class="viz-preview" title="Attention Demand"></iframe>` :
               '<div class="viz-placeholder">Attention Demand Visualization Not Generated</div>'
           }
       </div>
       <div class="card">
           <h3>Notification Analysis</h3>
           ${context.outputs.notification_flow_visualization ?
              `<iframe src="./visualizations/${path.basename(context.outputs.notification_flow_visualization.visualization_path)}" class="viz-preview" title="Notification Flow"></iframe>` :
              '<div class="viz-placeholder">Notification Flow Visualization Not Generated</div>'
           }
       </div>
         <div class="card">
             <h3>Workflow Complexity</h3>
             ${context.outputs.workflow_visualization ?
                `<iframe src="./visualizations/${path.basename(context.outputs.workflow_visualization.visualization_path)}" class="viz-preview" title="Workflow Complexity"></iframe>` :
                '<div class="viz-placeholder">Workflow Visualization Not Generated</div>'
             }
         </div>
          <div class="card">
             <h3>Generated UI Mockups (Optional)</h3>
             ${context.outputs.ui_mockups?.images?.length > 0 ?
                  context.outputs.ui_mockups.images.map((img: any) =>
                      img.success ? `<p><a href="./images/${path.basename(img.imagePath)}" target="_blank">${path.basename(img.imagePath)}</a> (${img.imageType || 'mockup'})</p>` : `<p>Failed: ${img.prompt?.substring(0,30)}...</p>`
                  ).join('') :
                 '<div class="viz-placeholder">No UI Mockups Generated</div>'
             }
         </div>
    </div>

    <h2>Workflow Stages & Outputs</h2>
    <div class="stage-list">
      ${WORKFLOW_STAGES.map(stage => {
        const output = context.outputs[stage.outputKey];
        const stageMetrics = context.metrics.stageMetrics[stage.id];
        const statusClass = !stageMetrics ? 'pending' : (stageMetrics.endTime ? (output && !output.error ? 'completed' : 'failed') : 'running'); // Crude status
        const agentType = stage.agent.constructor.name.replace('Agent', '');
        let outputDisplay = 'No output generated or stage pending.';
        if (output) {
            if (output.visualization_path) {
                outputDisplay = `<div class="output-link"><a href="./visualizations/${path.basename(output.visualization_path)}" target="_blank">View Visualization</a></div>`;
            } else if (output.imagePath) {
                 outputDisplay = `<div class="output-link"><a href="./images/${path.basename(output.imagePath)}" target="_blank">View Image</a></div>`;
             } else if (output.summary || output.analysis_summary || output.design_concepts || output.redesigned_workflow || output.calm_evaluation) {
                // Show summary of complex outputs
                 outputDisplay = `<pre style="font-size: 0.8em; max-height: 100px; overflow-y: auto; background: #f8f9fa; padding: 5px; border-radius: 3px;">${JSON.stringify(output, null, 2).substring(0, 300)}...</pre>`;
             } else if (output.raw_content) {
                  outputDisplay = `<pre style="font-size: 0.8em; max-height: 100px; overflow-y: auto; background: #f8f9fa; padding: 5px; border-radius: 3px;">${output.raw_content.substring(0, 300)}...</pre>`;
              } else {
                 // Default JSON preview for other outputs
                 outputDisplay = `<pre style="font-size: 0.8em; max-height: 100px; overflow-y: auto; background: #f8f9fa; padding: 5px; border-radius: 3px;">${JSON.stringify(output, null, 2).substring(0, 300)}...</pre>`;
             }
        }


        return `
          <div class="stage-card ${statusClass}">
            <div class="stage-header">
              <span class="stage-name">${stage.name}</span>
              <span class="agent-type ${agentType}">${agentType}</span>
            </div>
            <p style="font-size: 0.9em; color: #6c757d;">Unit: ${stage.unit.name}</p>
            <p style="font-size: 0.9em; color: #6c757d;">Agent: ${stage.agent.name}</p>
            ${stageMetrics && stageMetrics.duration ? `<p style="font-size: 0.8em;">Duration: ${((stageMetrics.duration || 0) / 1000).toFixed(2)}s</p>` : '<p style="font-size: 0.8em;">Status: Pending/Running</p>'}
            <div>${outputDisplay}</div>
          </div>
        `;
      }).join('')}
    </div>
     <div style="margin-top: 30px; text-align: center; font-size: 0.8em; color: #6c757d;">
        <p>Full outputs saved in run directory: ${outputDir}</p>
        <p><a href="./workflow_outputs.json" target="_blank">View Raw Workflow Outputs JSON</a></p>
     </div>

  </div>

  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'base', themeVariables: {
        primaryColor: '#ffffff', // Background of nodes
        primaryTextColor: '#333',
        lineColor: '#adb5bd',
        fontSize: '12px'
    } });

    const durationCtx = document.getElementById('durationChart')?.getContext('2d');
    if (durationCtx) {
        new Chart(durationCtx, {
        type: 'bar',
        data: {
            labels: ${JSON.stringify(metricsData.map(d => d.name))},
            datasets: [{
            label: 'Processing Time (seconds)',
            data: ${JSON.stringify(metricsData.map(d => (d.duration_ms / 1000).toFixed(2)))},
            backgroundColor: ${JSON.stringify(metricsData.map(d => {
                const stage = WORKFLOW_STAGES.find(s => s.id === d.id);
                return stage ? (unitColors[stage.unit.id] || '#E0E0E0') : '#E0E0E0';
            }))},
            borderColor: '#ffffff', // White border for bars
            borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y', // Horizontal bar chart
            scales: { y: { ticks: { autoSkip: false } }, x: { beginAtZero: true, title: { display: true, text: 'Time (seconds)' } } },
            plugins: { legend: { display: false } }
        }
        });
    } else {
        console.error("Could not find canvas element for duration chart.");
    }
  </script>
</body>
</html>`;

  // Write HTML dashboard to file
  fs.writeFileSync(path.join(outputDir, 'visualizations', 'workflow_dashboard.html'), htmlContent);
  logger.info('Generated workflow HTML dashboard.');

  // Save full context outputs to JSON
  try {
      fs.writeJsonSync(path.join(outputDir, 'workflow_outputs.json'), context.outputs, { spaces: 2 });
      logger.info('Saved full workflow outputs to JSON.');
  } catch (error) {
       logger.error(`Failed to save workflow_outputs.json: ${error}`);
  }
}

// --- Main Execution Function (Adapted) ---
async function runCalmTechWorkflow() {
  console.log('Starting Calm Technology Organizational Ergonomics Workflow...');
  outputDir = path.join(__dirname, '../output/' + runId); // Ensure outputDir is set correctly

  if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY environment variable not set. This example requires a valid API key.");
      process.exit(1); // Exit if key is missing
  }

  fs.ensureDirSync(outputDir);
  console.log(`Created output directory: ${outputDir}`);
  // Create standard subdirectories
  ['visualizations', 'data', 'images', 'intermediates', 'logs', 'templates'].forEach(subDir => {
      fs.ensureDirSync(path.join(outputDir, subDir));
  });

  const workflowConfig = {
    ...PROJECT_CONFIG, // Spread base config
    PROJECT_ID: `calm-tech-eval-${PROJECT_CONFIG.TARGET_SYSTEM?.toLowerCase().replace(/\s+/g, '-').substring(0, 20) || 'system'}`,
    VERSION: '1.0.0',
    ORGANIZATION: 'Ergonomics Assessment Team',
    OUTPUT_DIR: outputDir,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CALM_TECH_PRINCIPLES: CALM_TECH_PRINCIPLES // Make principles available
  };

  // Create logger for this run
  const logger = new FileLogger(path.join(outputDir, 'logs', 'workflow.log'));
  logger.info("Workflow started with configuration:", workflowConfig);


  try {
    // Get workflow engine instance
    const workflowEngine = WorkflowEngine.getInstance({
      logger,
      templateDirectory: path.join(outputDir, 'templates') // Although unused here, good practice
    });

    // Register the task executor (logic adapted slightly for context passing)
    workflowEngine.registerTaskExecutor('executeAgentTask', async (task, context) => {
        logger.info(`Executing task: ${task.name} (ID: ${task.id})`);
        const agent = task.parameters?.agent as Agent;
        const prepareInput = task.parameters?.prepareInput as (context: WorkflowContext) => any;
        const outputKey = task.parameters?.outputKey as string;

        if (!agent || !prepareInput || !outputKey) {
            logger.error(`Task ${task.id} (${task.name}) is missing required parameters (agent, prepareInput, or outputKey).`);
            throw new Error(`Missing required parameters for task ${task.id}`);
        }

        // Record start time for metrics
         const startTime = Date.now();
         if (!context.metrics) context.metrics = { stageMetrics: {} };
         context.metrics.stageMetrics[task.id] = {
             startTime: startTime,
             agentType: agent.constructor.name
         };


        try {
            logger.info(`Preparing input for agent: ${agent.name}`);
            // Ensure context has necessary fields, especially outputs
            const fullContext: WorkflowContext = {
                 config: context.config || workflowConfig, // Ensure config is present
                 outputs: context.outputs || {},
                 logger: logger,
                 eventSystem: context.eventSystem || EventSystem.getInstance(), // Ensure event system
                 startTime: context.startTime || Date.now(), // Workflow start time
                 metrics: context.metrics,
                 currentStage: task.id
            };
            const input = prepareInput(fullContext); // Prepare input using the full context

            logger.info(`Processing with agent: ${agent.name}`);
            const output = await agent.process(input, fullContext); // Process with the agent

            // Store the output in the context (ensure outputs object exists)
            if (!context.outputs) { context.outputs = {}; }
            context.outputs[outputKey] = output;
            logger.info(`Stored output for task ${task.id} under key: ${outputKey}`);

            // Record end time and duration
            const endTime = Date.now();
            context.metrics.stageMetrics[task.id].endTime = endTime;
            context.metrics.stageMetrics[task.id].duration = endTime - startTime;
            logger.info(`Task ${task.id} completed in ${context.metrics.stageMetrics[task.id].duration} ms.`);

            return { success: true, result: output }; // Return success
        } catch (error: any) {
             logger.error(`Error executing task ${task.id} (${task.name}) with agent ${agent.name}: ${error.message}`, error.stack);
             // Record failure time
              const endTime = Date.now();
              if (context.metrics?.stageMetrics[task.id]) {
                  context.metrics.stageMetrics[task.id].endTime = endTime;
                  context.metrics.stageMetrics[task.id].duration = endTime - startTime;
              } else {
                   logger.error(`Metrics object missing for failed task ${task.id}`);
               }
             return { success: false, error: String(error) }; // Return failure
        }
    });


    // Create workflow from stages
    const workflow = workflowEngine.createWorkflow({
      name: `Calm Tech Evaluation: ${PROJECT_CONFIG.TARGET_SYSTEM}`,
      version: '1.0.0',
      tasks: WORKFLOW_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        unitId: stage.unit.id,
        action: 'executeAgentTask', // Use the registered executor name
        parameters: {
          agent: stage.agent,
          prepareInput: stage.prepareInput,
          outputKey: stage.outputKey
        },
        dependencies: stage.dependencies,
        metadata: {
          agent_type: stage.agent.constructor.name,
          unit_name: stage.unit.name
        }
      }))
    }, {
      context: { // Initial context for the workflow
        config: workflowConfig,
        units: UNITS,
        outputs: {}, // Initialize outputs
        logger: logger,
        eventSystem: EventSystem.getInstance(),
        startTime: Date.now(),
        metrics: { stageMetrics: {} }
      },
      autoStart: false // Start manually after setup
    });

    logger.info(`Workflow created with ID: ${workflow.id}`);

    // Start and await workflow completion
    workflowEngine.startWorkflow(workflow.id);
    logger.info(`Workflow ${workflow.id} started.`);

    // Wait for workflow completion with status updates
    let workflowCompleted = false;
    let lastStatus = '';
    while (!workflowCompleted) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds
      const currentWorkflow = workflowEngine.getWorkflow(workflow.id);
      if (!currentWorkflow) {
        logger.error(`Workflow with ID ${workflow.id} disappeared!`);
        throw new Error(`Workflow with ID ${workflow.id} not found during execution`);
      }
      if (currentWorkflow.status !== lastStatus) {
          logger.info(`Workflow ${workflow.id} status: ${currentWorkflow.status}`);
          lastStatus = currentWorkflow.status;
      }
      if (currentWorkflow.status === 'completed' || currentWorkflow.status === 'failed') {
        workflowCompleted = true;
        logger.info(`Workflow ${workflow.id} finished with status: ${currentWorkflow.status}`);
      }
    }

    // Get final workflow state
    const finalWorkflow = workflowEngine.getWorkflow(workflow.id);
    if (!finalWorkflow) {
      logger.error(`Could not retrieve final state for workflow ${workflow.id}`);
      throw new Error(`Workflow with ID ${workflow.id} not found after completion`);
    }

     // Ensure context exists before accessing outputs/metrics
     const finalContext = finalWorkflow.context || { outputs: {}, metrics: { stageMetrics: {} }, config: workflowConfig, logger: logger, eventSystem: EventSystem.getInstance(), startTime: Date.now() };

     // Generate final visualizations using the context from the completed workflow
     logger.info("Generating final workflow visualizations...");
     generateWorkflowVisualizations(finalContext, outputDir);


    if (finalWorkflow.status === 'failed') {
        logger.error("Workflow execution failed. Check logs for details.");
        // Optional: Save error details
         fs.writeJsonSync(path.join(outputDir, 'workflow_failure_details.json'), {
             failedTasks: finalWorkflow.tasks.filter(t => t.status === 'failed'),
             error: finalWorkflow.error || "Unknown error"
         }, { spaces: 2 });
    } else {
         logger.info("Workflow completed successfully.");
    }


    return outputDir; // Return the output directory path
  } catch (error: any) {
    logger.error('Critical error during workflow setup or execution:', error.message, error.stack);
    console.error('Workflow failed:', error);
    // Attempt to save partial outputs if possible
     try {
         const partialContext = WorkflowEngine.getInstance().getWorkflow(runId)?.context;
         if (partialContext?.outputs) {
             fs.writeJsonSync(path.join(outputDir, 'workflow_partial_outputs_on_error.json'), partialContext.outputs, { spaces: 2 });
         }
     } catch (saveError) {
          logger.error("Failed to save partial outputs during error handling:", saveError);
     }
    throw error; // Re-throw the error after logging
  }
}

// --- Run the workflow ---
runCalmTechWorkflow()
  .then(outputDir => {
    console.log(`✅ Calm Tech workflow completed successfully. Results saved to: ${outputDir}`);
    // Allow logs to flush before exiting
    setTimeout(() => process.exit(0), 1000);
  })
  .catch(error => {
    console.error('❌ Calm Tech workflow failed:', error);
    // Allow logs to flush before exiting
     setTimeout(() => process.exit(1), 1000);
  }); 