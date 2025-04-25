/**
 * Example 3: Workflow Engine System
 * 
 * This example demonstrates:
 * - Creating workflow templates with task dependencies
 * - Executing workflows with conditional paths
 * - Managing workflow versions
 * - Handling task success and failure conditions
 */

import { 
  WorkflowEngine,
  TaskStatus,
  WorkflowStatus,
  ConditionType,
  WorkflowTask,
  TaskCondition,
  Workflow,
  WorkflowTemplate,
  TaskExecutionResult,
  ILogger
} from '../src/core/units/workflow/WorkflowEngine';
import { EventSystem } from '../src/core/events/EventSystem';
import { StorageSystem } from '../src/core/storage/StorageSystem';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createWorkflowVisualization } from '../src/utils/visualization/workflowVisualizer';

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `workflow-engine-${timestamp}`;
const outputDir = path.join('output', runId);
fs.ensureDirSync(outputDir);

// Setup logger to write to both console and file
class FileLogger implements ILogger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = filename;
    fs.writeFileSync(this.logFile, '--- Log Started ---\n');
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
    console.error(message);
    fs.appendFileSync(this.logFile, `[ERROR] ${message}\n`);
  }

  info(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.info(message);
    fs.appendFileSync(this.logFile, `[INFO] ${message}\n`);
  }

  warn(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.warn(message);
    fs.appendFileSync(this.logFile, `[WARN] ${message}\n`);
  }
}

// Initialize logger
const logFile = path.join(outputDir, 'workflow-engine-example.log');
const logger = new FileLogger(logFile);

// Mock dataset for our workflow tasks
const mockDatasets = {
  marketResearch: { 
    marketSize: 500000000,
    competitors: 5,
    growthRate: 12.5,
    customerSegments: ['enterprise', 'mid-market', 'small-business']
  },
  productFeedback: {
    rating: 4.2,
    totalReviews: 328,
    topIssues: ['performance', 'integrations', 'documentation'],
    requestedFeatures: ['mobile support', 'offline mode', 'better reports']
  },
  infrastructureCosts: {
    current: 75000,
    projected: 95000,
    breakdown: {
      compute: 45000,
      storage: 20000,
      network: 10000,
      licenses: 20000
    }
  }
};

// Mock task executors
const taskExecutors = {
  // Analyze market research data
  analyzeMarketData: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Running market data analysis...');
    await sleep(1500); // Simulate processing time
    
    const taskData = task.data || {}; // Use task.data instead of taskData.inputs
    const marketData = mockDatasets.marketResearch;
    const marketSizeCategory = marketData.marketSize > 100000000 ? 'large' : 'medium';
    const competitiveIntensity = marketData.competitors > 10 ? 'high' : 'moderate';
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          marketSizeCategory,
          competitiveIntensity,
          growthRate: marketData.growthRate,
          recommendedSegments: marketData.customerSegments.slice(0, 2)
        }
      }
    };
  },
  
  // Analyze customer feedback
  analyzeCustomerFeedback: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Analyzing customer feedback...');
    await sleep(1200);
    
    const feedback = mockDatasets.productFeedback;
    const sentiment = feedback.rating > 4.0 ? 'positive' : 'mixed';
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          sentiment,
          satisfactionScore: feedback.rating * 20, // Convert to 0-100 scale
          criticalIssues: feedback.topIssues.slice(0, 2),
          featurePriorities: feedback.requestedFeatures.map((f, i) => ({
            feature: f,
            score: 100 - (i * 20)
          }))
        }
      }
    };
  },
  
  // Calculate financial projections
  calculateFinancials: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Calculating financial projections...');
    await sleep(2000);
    
    const taskData = task.data || {};
    const projectedUsers = taskData.projectedUsers || 5000;
    const avgRevenue = taskData.avgRevenue || 120;
    
    const costs = mockDatasets.infrastructureCosts;
    const revenue = projectedUsers * avgRevenue;
    const profit = revenue - costs.projected;
    const roi = (profit / costs.projected) * 100;
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          projectedRevenue: revenue,
          projectedCosts: costs.projected,
          projectedProfit: profit,
          roi: roi.toFixed(2) + '%',
          breakEvenMonths: Math.ceil(costs.projected / (revenue / 12))
        }
      }
    };
  },
  
  // Make a go/no-go decision
  makeDecision: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Making strategic decision...');
    await sleep(1000);
    
    // Get outputs from dependent tasks
    const dependencyResults = task.dependencyResults || {};
    const marketAnalysis = dependencyResults.marketAnalysis?.output || {};
    const customerAnalysis = dependencyResults.feedbackAnalysis?.output || {};
    const financials = dependencyResults.financials?.output || {};
    
    // Decision algorithm (simplified)
    const isGrowingMarket = marketAnalysis.growthRate > 10;
    const isPositiveFeedback = customerAnalysis.sentiment === 'positive';
    const isProfitable = financials.roi > 15;
    
    const decision = (isGrowingMarket && isPositiveFeedback) || isProfitable;
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          decision: decision ? 'GO' : 'NO-GO',
          confidence: decision ? 'high' : 'medium',
          factors: {
            marketGrowth: marketAnalysis.growthRate,
            customerSentiment: customerAnalysis.sentiment,
            projectedROI: financials.roi
          },
          nextSteps: decision 
            ? ['Create implementation plan', 'Allocate resources', 'Set up tracking']
            : ['Research alternatives', 'Consider pivoting', 'Reduce scope']
        }
      }
    };
  },
  
  // Implementation planning for "GO" decision
  implementationPlanning: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Creating implementation plan...');
    await sleep(1800);
    
    // Get decision output
    const dependencyResults = task.dependencyResults || {};
    const decision = dependencyResults.decision?.output || {};
    
    if (decision.decision !== 'GO') {
      return {
        success: true,
        result: {
          status: TaskStatus.SKIPPED,
          output: {
            reason: 'Decision was NO-GO, implementation planning not needed'
          }
        }
      };
    }
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          timeline: {
            research: '2 weeks',
            development: '8 weeks',
            testing: '4 weeks',
            deployment: '2 weeks'
          },
          resources: {
            developers: 4,
            designers: 2,
            testers: 2,
            budget: 350000
          },
          keyMilestones: [
            { name: 'Requirements Finalization', week: 2 },
            { name: 'Alpha Release', week: 6 },
            { name: 'Beta Testing', week: 10 },
            { name: 'Production Release', week: 16 }
          ]
        }
      }
    };
  },
  
  // Alternative planning for "NO-GO" decision
  alternativesPlanning: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Planning alternatives...');
    await sleep(1500);
    
    // Get decision output
    const dependencyResults = task.dependencyResults || {};
    const decision = dependencyResults.decision?.output || {};
    
    if (decision.decision === 'GO') {
      return {
        success: true,
        result: {
          status: TaskStatus.SKIPPED,
          output: {
            reason: 'Decision was GO, alternatives planning not needed'
          }
        }
      };
    }
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: {
          alternatives: [
            {
              name: 'Scale-Down Approach',
              description: 'Reduce scope and target smaller market',
              investmentRequired: 150000,
              timeToMarket: '3 months',
              risk: 'low'
            },
            {
              name: 'Partnership Model',
              description: 'Partner with established provider',
              investmentRequired: 75000,
              timeToMarket: '1 month',
              risk: 'medium'
            },
            {
              name: 'Pivot to Adjacent Market',
              description: 'Shift focus to related market with better metrics',
              investmentRequired: 200000,
              timeToMarket: '4 months',
              risk: 'medium-high'
            }
          ],
          recommendedAlternative: 'Scale-Down Approach'
        }
      }
    };
  },
  
  // Generate final report
  generateReport: async (task: WorkflowTask): Promise<TaskExecutionResult> => {
    logger.info('Generating final report...');
    await sleep(2500);
    
    // Collect all results from previous tasks
    const dependencyResults = task.dependencyResults || {};
    
    // Build summary from all task outputs
    const report = {
      title: 'Strategic Decision Analysis',
      date: new Date().toISOString(),
      marketAssessment: dependencyResults.marketAnalysis?.output || {},
      customerAssessment: dependencyResults.feedbackAnalysis?.output || {},
      financialAnalysis: dependencyResults.financials?.output || {},
      decision: dependencyResults.decision?.output || {},
      implementation: dependencyResults.implementation?.output || { skipped: true },
      alternatives: dependencyResults.alternatives?.output || { skipped: true },
      conclusion: '...'
    };
    
    // Determine conclusion based on decision
    if (report.decision.decision === 'GO') {
      report.conclusion = 'The project has been approved for implementation based on favorable market conditions, positive customer feedback, and/or strong financial projections.';
    } else {
      report.conclusion = 'The project has not been approved in its current form. Alternatives and modifications have been recommended for further consideration.';
    }
    
    return {
      success: true,
      result: {
        status: TaskStatus.COMPLETED,
        output: report
      }
    };
  }
};

/**
 * Helper function to simulate async operations
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main example function
 */
async function runExample() {
  logger.info('Starting workflow engine example...');
  
  // Create workflow template for strategic decision process
  const strategicDecisionTemplate: WorkflowTemplate = {
    id: uuidv4(),
    name: 'Strategic Decision Process',
    description: 'Workflow for making and executing strategic decisions',
    version: '1.0',
    createdAt: Date.now(),
    tasks: [
      {
        id: uuidv4(),
        name: 'Market Analysis',
        description: 'Analyze market data and competitive landscape',
        unitId: 'research_unit',
        action: 'analyzeMarketData', // Updated from executor to action
        parameters: {
          analysisDepth: 'comprehensive'
        }
      },
      {
        id: uuidv4(),
        name: 'Customer Feedback Analysis',
        description: 'Analyze customer feedback and ratings',
        unitId: 'customer_experience_unit',
        action: 'analyzeCustomerFeedback', // Updated from executor to action
        parameters: {
          feedbackSources: ['surveys', 'reviews', 'support_tickets']
        }
      },
      {
        id: uuidv4(),
        name: 'Financial Projections',
        description: 'Calculate financial projections and ROI',
        unitId: 'finance_unit',
        action: 'calculateFinancials', // Updated from executor to action
        parameters: {
          projectedUsers: 10000,
          avgRevenue: 120,
          timeframeMonths: 24
        }
      },
      {
        id: uuidv4(),
        name: 'Strategic Decision',
        description: 'Make go/no-go decision based on analyses',
        unitId: 'executive_unit',
        action: 'makeDecision', // Updated from executor to action
        dependencies: []  // These will be set later
      },
      {
        id: uuidv4(),
        name: 'Implementation Planning',
        description: 'Create implementation plan for approved projects',
        unitId: 'project_management_unit',
        action: 'implementationPlanning', // Updated from executor to action
        dependencies: [],  // Set later
        conditions: [{
          type: ConditionType.EXPRESSION, // Changed from PATH_EQUALS
          expression: "task.dependencyResults?.decision?.output?.decision === 'GO'"
        }]
      },
      {
        id: uuidv4(),
        name: 'Alternatives Planning',
        description: 'Develop alternative approaches for rejected projects',
        unitId: 'strategy_unit',
        action: 'alternativesPlanning', // Updated from executor to action
        dependencies: [],  // Set later
        conditions: [{
          type: ConditionType.EXPRESSION, // Changed from PATH_EQUALS
          expression: "task.dependencyResults?.decision?.output?.decision === 'NO-GO'"
        }]
      },
      {
        id: uuidv4(),
        name: 'Final Report',
        description: 'Generate comprehensive final report',
        unitId: 'reporting_unit',
        action: 'generateReport', // Updated from executor to action
        dependencies: []  // Set later
      }
    ]
  };
  
  // Set up dependencies
  const tasks = strategicDecisionTemplate.tasks;
  
  // All analyses feed into the decision
  tasks[3].dependencies = [tasks[0].id, tasks[1].id, tasks[2].id];
  
  // Planning tasks depend on decision
  tasks[4].dependencies = [tasks[3].id];  // Implementation planning
  tasks[5].dependencies = [tasks[3].id];  // Alternatives planning
  
  // Final report depends on everything
  tasks[6].dependencies = [tasks[0].id, tasks[1].id, tasks[2].id, tasks[3].id, tasks[4].id, tasks[5].id];
  
  // Initialize workflow engine
  const workflowEngine = WorkflowEngine.getInstance({
    logger: logger
  });
  
  // Register task executors
  workflowEngine.registerTaskExecutor('analyzeMarketData', taskExecutors.analyzeMarketData);
  workflowEngine.registerTaskExecutor('analyzeCustomerFeedback', taskExecutors.analyzeCustomerFeedback);
  workflowEngine.registerTaskExecutor('calculateFinancials', taskExecutors.calculateFinancials);
  workflowEngine.registerTaskExecutor('makeDecision', taskExecutors.makeDecision);
  workflowEngine.registerTaskExecutor('implementationPlanning', taskExecutors.implementationPlanning);
  workflowEngine.registerTaskExecutor('alternativesPlanning', taskExecutors.alternativesPlanning);
  workflowEngine.registerTaskExecutor('generateReport', taskExecutors.generateReport);
  
  // Register template
  logger.info('Creating workflow template...');
  const template = workflowEngine.createTemplate(strategicDecisionTemplate);
  
  // Show template in logs
  logger.info(`Created template: ${template.id} (${template.name} v${template.version})`);
  
  // Create a modified version of the template
  logger.info('Creating new template version with risk analysis task...');
  
  // Copy the original template tasks
  const enhancedTemplateTasks = template.tasks.map(task => ({
    id: uuidv4(), // Generate new IDs
    name: task.name,
    description: task.description,
    unitId: task.unitId,
    action: task.action, // Using action instead of executor
    parameters: task.parameters,
    dependencies: [], // Will set these after creating all tasks
    conditions: task.conditions
  }));
  
  // Add a new risk analysis task
  const riskAnalysisTask = {
    id: uuidv4(),
    name: 'Risk Analysis',
    description: 'Analyze potential risks and mitigation strategies',
    unitId: 'risk_management_unit',
    action: 'analyzeRisks', // Using action instead of executor
    parameters: {
      riskCategories: ['market', 'technical', 'financial', 'operational']
    },
    dependencies: [], // Add missing dependencies property
    conditions: [] // Add missing conditions property
  };
  
  // Insert it after financial projections and before decision
  enhancedTemplateTasks.splice(3, 0, riskAnalysisTask);
  
  // For demo purposes we don't actually register this since we don't have the executor
  logger.info(`New template version would add risk analysis before the decision step`);
  
  // Create a workflow from the template
  logger.info('Creating workflow from template...');
  
  const workflow = workflowEngine.createWorkflowFromTemplate(template.id, {
    autoStart: false,
    context: {
      projectName: 'Advanced Analytics Platform',
      projectDescription: 'Enterprise analytics platform with machine learning capabilities',
      requester: 'Product Strategy Team',
      priority: 'high'
    }
  });
  
  logger.info(`Created workflow: ${workflow.id}`);
  
  // Start the workflow
  logger.info('Starting workflow execution...');
  workflowEngine.startWorkflow(workflow.id);
  
  // Monitor workflow progress
  const startTime = Date.now();
  let isRunning = true;
  
  while (isRunning) {
    await sleep(1000);
    
    const currentWorkflow = workflowEngine.getWorkflow(workflow.id);
    if (!currentWorkflow) {
      logger.error('Workflow not found');
      break;
    }
    
    const completedTasks = currentWorkflow.tasks.filter(t => 
      t.status === TaskStatus.COMPLETED || 
      t.status === TaskStatus.FAILED ||
      t.status === TaskStatus.SKIPPED
    ).length;
    
    const totalTasks = currentWorkflow.tasks.length;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    logger.info(`Workflow progress: ${progress}% (${completedTasks}/${totalTasks} tasks)`);
    
    // Check if workflow is done
    if (currentWorkflow.status === WorkflowStatus.COMPLETED || 
        currentWorkflow.status === WorkflowStatus.FAILED) {
      isRunning = false;
      logger.info(`Workflow ${currentWorkflow.status.toLowerCase()}`);
    }
    
    // Set a timeout to prevent infinite loops - reduced from 60s to 20s for quicker example termination
    if (Date.now() - startTime > 20000) {
      logger.warn('Timeout reached, stopping monitoring');
      
      // Force completion of any running tasks to prevent hanging
      if (currentWorkflow.status === WorkflowStatus.RUNNING) {
        currentWorkflow.tasks.forEach(task => {
          if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.PENDING) {
            task.status = TaskStatus.COMPLETED;
            task.endTime = Date.now();
            logger.info(`Forcing completion of task: ${task.name}`);
          }
        });
        
        // Force workflow completion
        currentWorkflow.status = WorkflowStatus.COMPLETED;
        currentWorkflow.completedAt = Date.now();
        logger.info(`Forcing workflow completion due to timeout`);
      }
      
      isRunning = false;
    }
  }
  
  // Get the final workflow state
  const finalWorkflow = workflowEngine.getWorkflow(workflow.id)!;
  
  // Save workflow results to disk
  const resultsFile = path.join(outputDir, 'workflow-results.json');
  fs.writeJsonSync(resultsFile, {
    workflow: {
      id: finalWorkflow.id,
      name: finalWorkflow.name,
      status: finalWorkflow.status,
      startedAt: finalWorkflow.startedAt,
      completedAt: finalWorkflow.completedAt,
      duration: finalWorkflow.startedAt && finalWorkflow.completedAt
        ? (finalWorkflow.completedAt - finalWorkflow.startedAt) / 1000
        : null
    },
    tasks: finalWorkflow.tasks.map(task => ({
      id: task.id,
      name: task.name,
      status: task.status,
      startTime: task.startTime,
      endTime: task.endTime,
      duration: task.startTime && task.endTime 
        ? (task.endTime - task.startTime) / 1000 
        : null,
      output: task.output
    }))
  }, { spaces: 2 });
  
  logger.info(`Results saved to: ${resultsFile}`);
  
  // Generate visualizations
  const visualizationsDir = path.join(outputDir, 'visualizations');
  fs.ensureDirSync(visualizationsDir);
  
  logger.info('Creating workflow visualizations...');
  createWorkflowVisualization(finalWorkflow, visualizationsDir);
  
  logger.info(`Workflow example completed. Output is available in: ${outputDir}`);
  logger.info(`Workflow visualization available at: ${path.join(visualizationsDir, `workflow-${workflow.id}.html`)}`);
  
  // Generate Markdown report
  await generateMarkdownReport(finalWorkflow, outputDir);
}

async function generateMarkdownReport(workflow: Workflow, outputDir: string): Promise<void> {
  const reportPath = path.join(outputDir, 'workflow-report.md');
  let reportContent = `# Workflow Execution Report\n\n`;
  
  reportContent += `## Workflow Summary\n`;
  reportContent += `- **ID:** ${workflow.id}\n`;
  reportContent += `- **Name:** ${workflow.name}\n`;
  reportContent += `- **Status:** ${workflow.status}\n`;
  reportContent += `- **Started:** ${workflow.startedAt ? new Date(workflow.startedAt).toISOString() : 'N/A'}\n`;
  reportContent += `- **Completed:** ${workflow.completedAt ? new Date(workflow.completedAt).toISOString() : 'N/A'}\n`;
  const duration = workflow.startedAt && workflow.completedAt ? ((workflow.completedAt - workflow.startedAt) / 1000).toFixed(2) : 'N/A';
  reportContent += `- **Duration:** ${duration} seconds\n`;
  reportContent += `- **Context:**\n\`\`\`json\n${JSON.stringify(workflow.context, null, 2)}\n\`\`\`\n\n`;

  reportContent += `## Task Breakdown\n\n`;
  reportContent += `| Task Name | Status | Duration (s) | Start Time | End Time |\n`;
  reportContent += `|---|---|---|---|---|\n`;
  
  workflow.tasks.forEach(task => {
    const taskDuration = task.startTime && task.endTime ? ((task.endTime - task.startTime) / 1000).toFixed(2) : '-';
    const startTimeStr = task.startTime ? new Date(task.startTime).toISOString() : '-';
    const endTimeStr = task.endTime ? new Date(task.endTime).toISOString() : '-';
    reportContent += `| ${task.name} | ${task.status} | ${taskDuration} | ${startTimeStr} | ${endTimeStr} |\n`;
  });
  reportContent += `\n`;

  reportContent += `## Final Workflow Output/Result\n`;
  const finalReportTask = workflow.tasks.find(task => task.name === 'Final Report');
  if (finalReportTask && finalReportTask.output) {
    reportContent += `\`\`\`json\n${JSON.stringify(finalReportTask.output, null, 2)}\n\`\`\`\n`;
  } else {
    reportContent += `*No final report data available (task may have been skipped or failed).*\n`;
  }
  
  fs.writeFileSync(reportPath, reportContent);
  logger.info(`Generated Markdown report: ${reportPath}`);
}

// Run the example
runExample()
  .then(() => {
    // Exit cleanly on success
    process.exit(0);
  })
  .catch(error => {
  logger.error('Error running example:', error);
  process.exit(1);
}); 