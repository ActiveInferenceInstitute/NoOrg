/**
 * Example 7: Multi-Unit LLM Sequential Processing Flow
 * 
 * This example demonstrates:
 * - Sequential LLM processing across multiple organizational units
 * - Input/output concatenation between stages
 * - Process visualization and flow tracking
 * - Multi-stage approach to complex tasks
 */

import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';
import { EventSystem } from '../src/core/events/EventSystem';
import { LLMMessage } from '../src/core/multiagent/LLMClientInterface';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `multi-unit-llm-flow-${timestamp}`;
const outputDir = path.join('output', runId);
fs.ensureDirSync(outputDir);

// Configure the top-level project parameters
// These define what we want to build
const PROJECT_CONFIG = {
  X_FUNCTIONALITY: "A machine for counting ant behavior",
  Y_SITUATION: "Ant activity above and below ground, all over the world",
  Z_APPROACH: "Human-centered design with accessibility features, mobile-first approach, and privacy-preserving architecture",
  U_USERS: "Citizens of all ages and technical abilities, local government officials, and community organizations"
};

// Initialize logger
class FileLogger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = path.join(outputDir, filename);
    fs.writeFileSync(this.logFile, `=== Multi-Unit LLM Flow Example - ${new Date().toISOString()} ===\n\n`);
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
}

// Define the organizational units that will participate in the process
interface OrganizationalUnit {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
}

const UNITS: Record<string, OrganizationalUnit> = {
  INNOVATION: {
    id: 'innovation_unit',
    name: 'Innovation Unit',
    role: 'idea generation and concept development',
    systemPrompt: 'You are the Innovation Unit responsible for generating creative solutions to complex problems. You excel at thinking outside the box and identifying innovative approaches that address core needs.'
  },
  RESEARCH: {
    id: 'research_unit',
    name: 'Research Unit',
    role: 'market and user research',
    systemPrompt: 'You are the Research Unit responsible for analyzing market conditions, user needs, and competitive landscapes. You provide data-driven insights to guide decision-making.'
  },
  SECURITY: {
    id: 'security_unit',
    name: 'Security Unit',
    role: 'security and risk assessment',
    systemPrompt: 'You are the Security Unit responsible for identifying potential security vulnerabilities, privacy concerns, and regulatory compliance issues. You ensure all solutions meet security best practices.'
  },
  BOARD: {
    id: 'board_of_directors',
    name: 'Board of Directors',
    role: 'strategic oversight and approval',
    systemPrompt: 'You are the Board of Directors responsible for evaluating proposals from a strategic business perspective. You assess alignment with organizational goals, resource requirements, and potential ROI.'
  },
  DEVELOPMENT: {
    id: 'development_unit',
    name: 'Development Unit',
    role: 'technical implementation planning',
    systemPrompt: 'You are the Development Unit responsible for planning technical implementation details. You specify architecture, tech stack, development timeline, and resource requirements.'
  },
  MARKETING: {
    id: 'marketing_unit',
    name: 'Marketing Unit',
    role: 'brand development and communication strategy',
    systemPrompt: 'You are the Marketing Unit responsible for creating compelling brand identities and communication strategies. You excel at positioning products and services to appeal to target audiences.'
  }
};

// Define the flow stages
interface ProcessStage {
  id: string;
  name: string;
  unit: OrganizationalUnit;
  prompt: (context: ProcessContext) => string;
  outputKey: string;
  dependencies: string[];
}

// Context object to track outputs from each stage
interface ProcessContext {
  config: typeof PROJECT_CONFIG;
  outputs: Record<string, any>;
  currentStage?: string;
}

// Define the sequential process stages
const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'situation_assessment',
    name: 'Situation Assessment',
    unit: UNITS.INNOVATION,
    prompt: (context) => `
You are analyzing a situation to understand the problem space.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Approach: ${context.config.Z_APPROACH}
Target users: ${context.config.U_USERS}

Please provide:
1. A comprehensive analysis of the current situation
2. Key challenges and pain points for the users
3. Opportunities for innovation
4. Core problems that need to be solved

Format your response as JSON with the following keys:
- situation_analysis
- key_challenges (array)
- innovation_opportunities (array)
- core_problems (array)
    `,
    outputKey: 'situation_assessment',
    dependencies: []
  },
  {
    id: 'idea_generation',
    name: 'Idea Generation',
    unit: UNITS.INNOVATION,
    prompt: (context) => `
Based on the situation assessment, generate innovative ideas for the project.

SITUATION ASSESSMENT:
${JSON.stringify(context.outputs.situation_assessment, null, 2)}

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Approach: ${context.config.Z_APPROACH}
Target users: ${context.config.U_USERS}

Please generate:
1. 5 innovative concepts that address the core problems
2. Key features for each concept
3. Potential impact of each concept
4. Recommended concept to pursue further (with justification)

Format your response as JSON with the following keys:
- concepts (array of 5 concept objects with name, description, features, impact)
- recommended_concept (object with name and justification)
    `,
    outputKey: 'idea_generation',
    dependencies: ['situation_assessment']
  },
  {
    id: 'market_research',
    name: 'Market Research',
    unit: UNITS.RESEARCH,
    prompt: (context) => `
Conduct market research on the proposed concept to validate its potential.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Target users: ${context.config.U_USERS}

RECOMMENDED CONCEPT:
${JSON.stringify(context.outputs.idea_generation.recommended_concept, null, 2)}

Please provide:
1. Market size and growth potential
2. Competitive landscape analysis
3. User research insights
4. Market barriers and opportunities
5. Recommendation on concept viability

Format your response as JSON with the following keys:
- market_analysis
- competitors (array)
- user_insights (array)
- barriers_opportunities
- viability_assessment
    `,
    outputKey: 'market_research',
    dependencies: ['idea_generation']
  },
  {
    id: 'security_assessment',
    name: 'Security Assessment',
    unit: UNITS.SECURITY,
    prompt: (context) => `
Assess the security, privacy, and compliance implications of the proposed concept.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Approach: ${context.config.Z_APPROACH}

RECOMMENDED CONCEPT:
${JSON.stringify(context.outputs.idea_generation.recommended_concept, null, 2)}

MARKET RESEARCH:
${JSON.stringify(context.outputs.market_research, null, 2)}

Please provide:
1. Potential security vulnerabilities
2. Privacy considerations
3. Regulatory compliance requirements
4. Risk mitigation recommendations
5. Overall security assessment rating (Low, Medium, High risk)

Format your response as JSON with the following keys:
- security_vulnerabilities (array)
- privacy_considerations (array)
- regulatory_requirements (array)
- mitigation_recommendations (array)
- risk_rating
- summary
    `,
    outputKey: 'security_assessment',
    dependencies: ['idea_generation', 'market_research']
  },
  {
    id: 'board_review',
    name: 'Board Review',
    unit: UNITS.BOARD,
    prompt: (context) => `
Review the proposed concept from a strategic business perspective.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Approach: ${context.config.Z_APPROACH}
Target users: ${context.config.U_USERS}

CONCEPT INFORMATION:
${JSON.stringify(context.outputs.idea_generation.recommended_concept, null, 2)}

MARKET RESEARCH:
${JSON.stringify(context.outputs.market_research, null, 2)}

SECURITY ASSESSMENT:
${JSON.stringify(context.outputs.security_assessment, null, 2)}

Please provide:
1. Strategic alignment assessment
2. Resource requirement evaluation
3. ROI and business impact projections
4. Key risks and concerns
5. Board recommendations and conditions for approval

Format your response as JSON with the following keys:
- strategic_alignment
- resource_requirements
- roi_projections
- risks_concerns (array)
- recommendations (array)
- approval_status (one of: "Approved", "Conditionally Approved", "Rejected")
- approval_conditions (array, if conditionally approved)
    `,
    outputKey: 'board_review',
    dependencies: ['idea_generation', 'market_research', 'security_assessment']
  },
  {
    id: 'concept_refinement',
    name: 'Concept Refinement',
    unit: UNITS.INNOVATION,
    prompt: (context) => `
Refine the concept based on feedback from the Board of Directors, market research, and security assessment.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Approach: ${context.config.Z_APPROACH}
Target users: ${context.config.U_USERS}

ORIGINAL CONCEPT:
${JSON.stringify(context.outputs.idea_generation.recommended_concept, null, 2)}

MARKET RESEARCH:
${JSON.stringify(context.outputs.market_research, null, 2)}

SECURITY ASSESSMENT:
${JSON.stringify(context.outputs.security_assessment, null, 2)}

BOARD REVIEW:
${JSON.stringify(context.outputs.board_review, null, 2)}

Please provide:
1. Refined concept description addressing feedback
2. Updated key features (added, modified, or removed)
3. Implementation priorities
4. Unique selling points

Format your response as JSON with the following keys:
- refined_concept_name
- refined_concept_description
- key_features (array)
- implementation_priorities (array)
- unique_selling_points (array)
- addressed_feedback (object showing how each concern was addressed)
    `,
    outputKey: 'concept_refinement',
    dependencies: ['board_review', 'security_assessment', 'market_research']
  },
  {
    id: 'technical_planning',
    name: 'Technical Planning',
    unit: UNITS.DEVELOPMENT,
    prompt: (context) => `
Create a technical implementation plan for the refined concept.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Approach: ${context.config.Z_APPROACH}

REFINED CONCEPT:
${JSON.stringify(context.outputs.concept_refinement, null, 2)}

SECURITY ASSESSMENT:
${JSON.stringify(context.outputs.security_assessment, null, 2)}

Please provide:
1. Recommended architecture and tech stack
2. Development phases and timeline
3. Resource requirements (developers, designers, etc.)
4. Key technical challenges and solutions
5. Security and compliance implementation details
6. Testing and quality assurance approach

Format your response as JSON with the following keys:
- architecture
- tech_stack (object)
- development_phases (array)
- timeline (object)
- resources (object)
- technical_challenges (array with challenges and solutions)
- security_implementation
- testing_approach
    `,
    outputKey: 'technical_planning',
    dependencies: ['concept_refinement']
  },
  {
    id: 'brand_development',
    name: 'Brand Development',
    unit: UNITS.MARKETING,
    prompt: (context) => `
Develop a brand identity and communication strategy for the refined concept.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Target users: ${context.config.U_USERS}

REFINED CONCEPT:
${JSON.stringify(context.outputs.concept_refinement, null, 2)}

MARKET RESEARCH:
${JSON.stringify(context.outputs.market_research, null, 2)}

Please provide:
1. Brand name options (3-5) with rationale
2. Recommended brand name and tagline
3. Brand personality and voice
4. Key messaging points
5. Target audience segments and messaging approach for each
6. Communication channels strategy
7. Visual identity guidelines (colors, style, etc.)

Format your response as JSON with the following keys:
- brand_name_options (array)
- recommended_brand (object with name and tagline)
- brand_personality (array of attributes)
- brand_voice (description)
- key_messages (array)
- audience_segments (array with segment name and messaging approach)
- communication_channels (array)
- visual_identity (object)
    `,
    outputKey: 'brand_development',
    dependencies: ['concept_refinement', 'market_research']
  },
  {
    id: 'implementation_roadmap',
    name: 'Implementation Roadmap',
    unit: UNITS.DEVELOPMENT,
    prompt: (context) => `
Create a comprehensive implementation roadmap for the project.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Approach: ${context.config.Z_APPROACH}

REFINED CONCEPT:
${JSON.stringify(context.outputs.concept_refinement, null, 2)}

TECHNICAL PLANNING:
${JSON.stringify(context.outputs.technical_planning, null, 2)}

BRAND DEVELOPMENT:
${JSON.stringify(context.outputs.brand_development, null, 2)}

Please provide:
1. Project phases with detailed milestones
2. Resource allocation plan
3. Critical path and dependencies
4. Risk management approach
5. Success metrics and KPIs
6. Launch strategy
7. Post-launch support and iteration plan

Format your response as JSON with the following keys:
- project_phases (array)
- milestones (array)
- resource_allocation (object)
- critical_path (array)
- risk_management (object)
- success_metrics (array)
- launch_strategy (object)
- post_launch_plan (object)
    `,
    outputKey: 'implementation_roadmap',
    dependencies: ['technical_planning', 'brand_development']
  },
  {
    id: 'final_deliverable',
    name: 'Final Project Plan',
    unit: UNITS.BOARD,
    prompt: (context) => `
Create a comprehensive final project plan that synthesizes all the inputs from various units.

PROJECT BRIEF:
Functionality: ${context.config.X_FUNCTIONALITY}
Situation to address: ${context.config.Y_SITUATION}
Approach: ${context.config.Z_APPROACH}
Target users: ${context.config.U_USERS}

You have access to all previous outputs from the process. Create a comprehensive project plan that includes:
1. Executive summary
2. Project vision and objectives
3. Solution overview
4. Market opportunity
5. Technical implementation approach
6. Brand and marketing strategy
7. Timeline and resource requirements
8. Budget estimate
9. Risk assessment and mitigation
10. Success criteria and evaluation plan

Also generate a visual representation suggestion for this process flow that was just completed.

Format your response as JSON with the following structure:
- executive_summary
- project_vision
- objectives (array)
- solution_overview
- market_opportunity
- technical_approach
- brand_strategy
- timeline
- resources
- budget
- risks_and_mitigation
- success_criteria
- process_visualization_suggestion (description of how to visualize the process that was completed)
    `,
    outputKey: 'final_deliverable',
    dependencies: ['implementation_roadmap']
  }
];

/**
 * Create visual representations of the process flow
 */
function generateProcessVisualizations(context: ProcessContext, outputDir: string): void {
  const logger = new FileLogger('process_visualization.log');
  
  // Create a mermaid diagram of the process flow
  let mermaidDiagram = 'graph TD;\n';
  
  // Add nodes for each stage
  for (const stage of PROCESS_STAGES) {
    const nodeId = stage.id;
    const isCompleted = !!context.outputs[stage.outputKey];
    const style = isCompleted ? 
      `style ${nodeId} fill:#90EE90,stroke:#228B22` : 
      `style ${nodeId} fill:#D3D3D3,stroke:#808080`;
    
    mermaidDiagram += `    ${nodeId}["${stage.name}<br/>(${stage.unit.name})"];\n`;
    mermaidDiagram += `    ${style};\n`;
  }
  
  // Add edges for dependencies
  for (const stage of PROCESS_STAGES) {
    for (const depId of stage.dependencies) {
      mermaidDiagram += `    ${depId} --> ${stage.id};\n`;
    }
  }
  
  // Write to file
  fs.writeFileSync(path.join(outputDir, 'process_flow.mmd'), mermaidDiagram);
  
  // Create an HTML visualization
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Multi-Unit LLM Process Flow</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { display: flex; }
    .flow-diagram { flex: 1; border: 1px solid #ddd; padding: 20px; }
    .stage-details { flex: 1; margin-left: 20px; }
    .stage-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 15px; }
    .completed { border-left: 5px solid #4CAF50; }
    pre { background-color: #f5f5f5; padding: 10px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Multi-Unit LLM Process Flow</h1>
  
  <div class="container">
    <div class="flow-diagram">
      <h2>Process Flow Diagram</h2>
      <div class="mermaid">
${mermaidDiagram}
      </div>
    </div>
    
    <div class="stage-details">
      <h2>Process Stages</h2>
      ${PROCESS_STAGES.map(stage => `
        <div class="stage-card ${context.outputs[stage.outputKey] ? 'completed' : ''}">
          <h3>${stage.name}</h3>
          <p><strong>Unit:</strong> ${stage.unit.name}</p>
          <p><strong>Dependencies:</strong> ${stage.dependencies.length ? stage.dependencies.join(', ') : 'None'}</p>
          <p><strong>Status:</strong> ${context.outputs[stage.outputKey] ? 'Completed' : 'Pending'}</p>
        </div>
      `).join('')}
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'process_visualization.html'), htmlContent);
  
  // Create JSON file with all outputs
  fs.writeJsonSync(path.join(outputDir, 'process_outputs.json'), context.outputs, { spaces: 2 });
  
  logger.info('Generated process visualizations');
}

/**
 * Main function to run the sequential multi-unit LLM process
 */
async function runMultiUnitProcess() {
  const logger = new FileLogger('process_execution.log');
  logger.info('Starting multi-unit LLM process...');
  
  // Initialize OpenAI client
  const llm = new OpenAIClient();
  
  // Create event system for logging events
  const eventSystem = EventSystem.getInstance({
    enabled: true,
    storageDirectory: path.join(outputDir, 'events')
  });
  
  // Initialize process context
  const context: ProcessContext = {
    config: PROJECT_CONFIG,
    outputs: {}
  };
  
  // Setup stage metrics tracking
  interface StageMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    tokenUsage?: number;
    cost?: number;
  }
  
  const stageMetrics: Record<string, StageMetrics> = {};
  
  // Execute each stage in sequence, respecting dependencies
  for (const stage of PROCESS_STAGES) {
    try {
      // Check if all dependencies have been processed
      const dependenciesMet = stage.dependencies.every(depId => {
        const depStage = PROCESS_STAGES.find(s => s.id === depId);
        return depStage && context.outputs[depStage.outputKey];
      });
      
      if (!dependenciesMet) {
        logger.error(`Cannot process stage ${stage.id}: dependencies not met`);
        continue;
      }
      
      // Update current stage in context
      context.currentStage = stage.id;
      
      // Log stage start
      logger.info(`Starting stage: ${stage.name} (${stage.unit.name})`);
      const startTime = Date.now();
      stageMetrics[stage.id] = { startTime };
      
      // Emit event
      eventSystem.emit('process:stage:start', {
        stageId: stage.id,
        stageName: stage.name,
        unitId: stage.unit.id,
        unitName: stage.unit.name,
        timestamp: new Date().toISOString()
      });
      
      // Generate prompt for this stage
      const prompt = stage.prompt(context);
      
      // Create messages for LLM
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: stage.unit.systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ];
      
      // Save the prompt to the output directory
      fs.writeFileSync(
        path.join(outputDir, `${stage.id}_prompt.txt`), 
        `SYSTEM:\n${stage.unit.systemPrompt}\n\nUSER:\n${prompt}`
      );
      
      // Call the LLM
      const response = await llm.createChatCompletion(messages, {
        temperature: 0.7,
        max_tokens: 2500,
        model: 'gpt-4' // Using GPT-4 for more coherent multi-stage planning
      });
      
      // Extract content
      const content = response.choices[0]?.message?.content || '';
      
      // Parse JSON from content
      let parsedContent;
      try {
        // Try to parse as JSON
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```([\s\S]*?)```/) ||
                          [null, content];
        
        // Extract the JSON part if it's wrapped in code blocks
        const jsonContent = jsonMatch[1] || content;
        
        parsedContent = JSON.parse(jsonContent);
      } catch (error) {
        logger.error(`Error parsing JSON from response: ${error}`);
        // If JSON parsing fails, use the raw content
        parsedContent = { raw_content: content };
      }
      
      // Store the output in context
      context.outputs[stage.outputKey] = parsedContent;
      
      // Save the raw response
      fs.writeFileSync(
        path.join(outputDir, `${stage.id}_response.txt`), 
        content
      );
      
      // Save the parsed output
      fs.writeJsonSync(
        path.join(outputDir, `${stage.id}_output.json`),
        parsedContent,
        { spaces: 2 }
      );
      
      // Update metrics
      const endTime = Date.now();
      const metrics = stageMetrics[stage.id];
      metrics.endTime = endTime;
      metrics.duration = endTime - startTime;
      
      if (response.usage) {
        metrics.tokenUsage = response.usage.total_tokens;
        metrics.cost = llm.calculateCost(
          'gpt-4',
          response.usage.prompt_tokens,
          response.usage.completion_tokens
        );
      }
      
      // Log completion
      logger.info(`Completed stage: ${stage.name} in ${metrics.duration}ms`);
      
      // Emit completion event
      eventSystem.emit('process:stage:complete', {
        stageId: stage.id,
        stageName: stage.name,
        unitId: stage.unit.id,
        unitName: stage.unit.name,
        duration: metrics.duration,
        tokenUsage: metrics.tokenUsage,
        cost: metrics.cost,
        timestamp: new Date().toISOString()
      });
      
      // Generate updated process visualization after each stage
      generateProcessVisualizations(context, outputDir);
      
    } catch (error) {
      logger.error(`Error in stage ${stage.id}: ${error}`);
      
      // Emit error event
      eventSystem.emit('process:stage:error', {
        stageId: stage.id,
        stageName: stage.name,
        unitId: stage.unit.id,
        unitName: stage.unit.name,
        error: String(error),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Generate final metrics report
  const totalDuration = Object.values(stageMetrics).reduce((total, metric) => total + (metric.duration || 0), 0);
  const totalTokens = Object.values(stageMetrics).reduce((total, metric) => total + (metric.tokenUsage || 0), 0);
  const totalCost = Object.values(stageMetrics).reduce((total, metric) => total + (metric.cost || 0), 0);
  
  const metricsReport = {
    total_duration_ms: totalDuration,
    total_duration_formatted: `${(totalDuration / 1000).toFixed(2)} seconds`,
    total_tokens: totalTokens,
    total_cost: totalCost,
    cost_formatted: `$${totalCost.toFixed(4)}`,
    stages: Object.entries(stageMetrics).map(([stageId, metrics]) => {
      const stage = PROCESS_STAGES.find(s => s.id === stageId);
      return {
        id: stageId,
        name: stage ? stage.name : stageId,
        unit: stage ? stage.unit.name : 'Unknown',
        duration_ms: metrics.duration,
        duration_formatted: `${((metrics.duration || 0) / 1000).toFixed(2)} seconds`,
        token_usage: metrics.tokenUsage,
        cost: metrics.cost,
        cost_formatted: metrics.cost ? `$${metrics.cost.toFixed(4)}` : 'N/A'
      };
    })
  };
  
  // Save metrics report
  fs.writeJsonSync(
    path.join(outputDir, 'process_metrics.json'),
    metricsReport,
    { spaces: 2 }
  );
  
  // Generate summary report in Markdown
  const summaryMd = `# Multi-Unit LLM Process Summary

## Project Brief
- **Functionality:** ${PROJECT_CONFIG.X_FUNCTIONALITY}
- **Situation:** ${PROJECT_CONFIG.Y_SITUATION}
- **Approach:** ${PROJECT_CONFIG.Z_APPROACH}
- **Users:** ${PROJECT_CONFIG.U_USERS}

## Process Results
${Object.entries(context.outputs).length} of ${PROCESS_STAGES.length} stages completed successfully.

- **Total Process Duration:** ${metricsReport.total_duration_formatted}
- **Total Tokens Used:** ${metricsReport.total_tokens}
- **Total Cost:** ${metricsReport.cost_formatted}

## Stage Summary
| Stage | Unit | Duration | Tokens | Cost |
|-------|------|----------|--------|------|
${metricsReport.stages.map(s => 
  `| ${s.name} | ${s.unit} | ${s.duration_formatted} | ${s.token_usage || 'N/A'} | ${s.cost_formatted} |`
).join('\n')}

## Final Deliverable
${context.outputs.final_deliverable ? 
  `### Executive Summary
${context.outputs.final_deliverable.executive_summary}

### Project Vision
${context.outputs.final_deliverable.project_vision}

### Solution Overview
${context.outputs.final_deliverable.solution_overview}` : 
  'Final deliverable not generated.'}

## Next Steps
1. Review the detailed outputs for each stage in the output directory
2. Examine the process visualization to understand the flow
3. Consider implementing the proposed solution based on the final deliverable
`;

  fs.writeFileSync(
    path.join(outputDir, 'process_summary.md'),
    summaryMd
  );
  
  logger.info(`Process completed. Results saved to: ${outputDir}`);
  return outputDir;
}

// Run the process and handle any errors
runMultiUnitProcess()
  .then(outputDir => {
    console.log(`✅ Multi-unit LLM process completed successfully. Results saved to: ${outputDir}`);
    // Force the process to exit cleanly
    setTimeout(() => process.exit(0), 500);
  })
  .catch(error => {
    console.error('❌ Process failed with error:', error);
    // Force the process to exit with error code
    setTimeout(() => process.exit(1), 500);
  }); 