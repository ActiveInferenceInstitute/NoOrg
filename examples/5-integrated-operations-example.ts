/**
 * Example 4: Integrated Operations System (Simplified Version)
 * 
 * This example demonstrates basic integration of core components
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Import core modules
import { EventSystem, EventDefinition } from '../src/core/events/EventSystem';
import { StorageSystem } from '../src/core/storage/StorageSystem';
import { WorkflowEngine, WorkflowTemplate, TaskStatus, WorkflowStatus, ILogger, Workflow } from '../src/core/units/workflow/WorkflowEngine';
import { createWorkflowVisualization } from '../src/utils/visualization/workflowVisualizer';

// Create timestamp-based run folder for outputs
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputDir = path.join('output', `integrated-operations-${timestamp}`);
fs.ensureDirSync(outputDir);

// Custom logger implementation
class FileLogger implements ILogger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = path.join(outputDir, filename);
    fs.writeFileSync(this.logFile, `=== Integrated Operations Example - ${new Date().toISOString()} ===\n\n`);
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
const logger = new FileLogger('integrated-operations.log');

// Helper function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple task executor
async function executeBasicTask(task: any): Promise<any> {
  logger.info(`Executing task: ${task.name}`);
  await sleep(500);
  
  return {
    success: true,
    result: {
      status: TaskStatus.COMPLETED,
      output: {
        taskName: task.name,
        completed: true,
        timestamp: new Date().toISOString()
      }
    }
  };
}

// Main example function
async function runExample(): Promise<void> {
  logger.info('Starting integrated operations example...');
  
  // Initialize systems
  const eventSystem = EventSystem.getInstance();
  const storageSystem = StorageSystem.getInstance();
  const workflowEngine = WorkflowEngine.getInstance({ logger });
  
  // Register task executors
  workflowEngine.registerTaskExecutor('task1', executeBasicTask);
  workflowEngine.registerTaskExecutor('task2', executeBasicTask);
  workflowEngine.registerTaskExecutor('task3', executeBasicTask);
  
  // Create a simple workflow template
  const template: WorkflowTemplate = {
    id: uuidv4(),
    name: 'Simple Operations Workflow',
    description: 'Basic operations workflow with three tasks',
    version: '1.0',
    createdAt: Date.now(),
    tasks: [
      {
        id: uuidv4(),
        name: 'Task 1',
        description: 'First task in the workflow',
        unitId: 'unit1',
        action: 'task1'
      },
      {
        id: uuidv4(),
        name: 'Task 2',
        description: 'Second task in the workflow',
        unitId: 'unit2',
        action: 'task2',
        dependencies: [] // Will be set to task1 ID
      },
      {
        id: uuidv4(),
        name: 'Task 3',
        description: 'Third task in the workflow',
        unitId: 'unit3',
        action: 'task3',
        dependencies: [] // Will be set to task2 ID
      }
    ]
  };
  
  // Set up dependencies
  template.tasks[1].dependencies = [template.tasks[0].id];
  template.tasks[2].dependencies = [template.tasks[1].id];
  
  // Create template
  const createdTemplate = workflowEngine.createTemplate(template);
  logger.info(`Created workflow template: ${createdTemplate.id}`);
  
  // Create and start workflow
  const workflow = workflowEngine.createWorkflowFromTemplate(createdTemplate.id);
  logger.info(`Created workflow: ${workflow.id}`);
  workflowEngine.startWorkflow(workflow.id);
  
  // Monitor workflow progress
  let isRunning = true;
  const startTime = Date.now();
  
  while (isRunning) {
    await sleep(500);
    
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
    logger.info(`Progress: ${completedTasks}/${totalTasks} tasks completed`);
    
    if (currentWorkflow.status === WorkflowStatus.COMPLETED || 
        currentWorkflow.status === WorkflowStatus.FAILED) {
      isRunning = false;
      logger.info(`Workflow ${currentWorkflow.status.toLowerCase()}`);
    }
    
    // Timeout after 10 seconds
    if (Date.now() - startTime > 10000) {
      logger.warn('Timeout reached, stopping monitoring');
      isRunning = false;
    }
  }
  
  // Generate visualization
  const finalWorkflow = workflowEngine.getWorkflow(workflow.id);
  
  if (finalWorkflow) {
    const visualizationsDir = path.join(outputDir, 'visualizations');
    fs.ensureDirSync(visualizationsDir);
    
    createWorkflowVisualization(finalWorkflow, visualizationsDir);
    logger.info(`Created workflow visualization in ${visualizationsDir}`);
    
    // Save workflow results
    fs.writeJsonSync(
      path.join(outputDir, 'workflow-results.json'),
      {
        id: finalWorkflow.id,
        name: finalWorkflow.name,
        status: finalWorkflow.status,
        tasks: finalWorkflow.tasks.map(t => ({
          id: t.id,
          name: t.name,
          status: t.status
        }))
      },
      { spaces: 2 }
    );
  }
  
  // Create a simple HTML report
  const htmlReport = `<!DOCTYPE html>
<html>
<head>
  <title>Integrated Operations Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 15px 0; }
    .success { border-left: 5px solid #4CAF50; }
    .info { border-left: 5px solid #2196F3; }
  </style>
</head>
<body>
  <h1>Integrated Operations Report</h1>
  
  <div class="card info">
    <h2>System Overview</h2>
    <p>This report demonstrates the integrated operations of multiple systems working together.</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="card success">
    <h2>Workflow Summary</h2>
    <p>ID: ${workflow.id}</p>
    <p>Name: ${workflow.name}</p>
    <p>Status: ${finalWorkflow?.status || 'Unknown'}</p>
    <p>Tasks: ${finalWorkflow?.tasks.length || 0}</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'integrated-report.html'), htmlReport);
  logger.info(`Created HTML report in ${outputDir}`);
  
  logger.info(`Example completed. Results saved to: ${outputDir}`);
  
  // Get events before generating report
  const allEvents = eventSystem.getAllEvents(); 
  
  // Generate Markdown report only if workflow exists
  if (finalWorkflow) {
    await generateMarkdownReport(outputDir, finalWorkflow, allEvents);
  } else {
    logger.error('Could not generate Markdown report: final workflow state not found.');
  }
  
  // Exit cleanly after all work is done
  process.exit(0);
}

async function generateMarkdownReport(outputDir: string, workflow: Workflow, events: EventDefinition[]): Promise<void> {
  const reportPath = path.join(outputDir, 'integration-report.md');
  let reportContent = `# Integrated Operations Report\n\n`;
  
  reportContent += `## Workflow Summary\n`;
  reportContent += `- **ID:** ${workflow.id}\n`;
  reportContent += `- **Name:** ${workflow.name}\n`;
  reportContent += `- **Status:** ${workflow.status}\n`;
  reportContent += `- **Duration:** ${workflow.startedAt && workflow.completedAt ? ((workflow.completedAt - workflow.startedAt) / 1000).toFixed(2) : 'N/A'} seconds\n`;
  reportContent += `### Task Breakdown\n`;
  reportContent += `| Task Name | Status | Duration (s) |\n`;
  reportContent += `|---|---|---|\n`;
  workflow.tasks.forEach(task => {
    const taskDuration = task.startTime && task.endTime ? ((task.endTime - task.startTime) / 1000).toFixed(2) : '-';
    reportContent += `| ${task.name} | ${task.status} | ${taskDuration} |\n`;
  });
  reportContent += `\n`;

  reportContent += `## Event Summary\n`;
  reportContent += `- **Total Events Emitted:** ${events.length}\n`;
  const eventTypes = [...new Set(events.map(e => e.type))];
  reportContent += `- **Event Types:** ${eventTypes.join(', ')}\n`;
  reportContent += `### Events Log\n`;
  reportContent += `| Timestamp | Type | Payload |\n`;
  reportContent += `|---|---|---|\n`;
  events.slice(0, 10).forEach(e => { // Show first 10 events
    reportContent += `| ${new Date(e.timestamp).toISOString()} | ${e.type} | \`\`\`${JSON.stringify(e.payload)}\`\`\` |\n`;
  });
  if (events.length > 10) {
     reportContent += `| ... | ... | *(truncated)* |\n`;
  }
  reportContent += `\n`;
  
  // Add other relevant sections if applicable (e.g., state snapshots)
  // For now, keep it simple
  
  fs.writeFileSync(reportPath, reportContent);
  logger.info(`Generated Markdown report: ${reportPath}`);
}

// Run the example
runExample().catch(error => {
  logger.error('Error running example:', error);
  process.exit(1);
}); 