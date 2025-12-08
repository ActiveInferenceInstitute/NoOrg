"use strict";
/**
 * WorkflowVisualizer
 *
 * Utility to generate visual representations of workflows including DAG visualization,
 * workflow statistics, and decision trees.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkflowDOT = generateWorkflowDOT;
exports.generateWorkflowMermaid = generateWorkflowMermaid;
exports.generateWorkflowSummary = generateWorkflowSummary;
exports.generateWorkflowHTML = generateWorkflowHTML;
exports.createWorkflowVisualization = createWorkflowVisualization;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const WorkflowEngine_1 = require("../../core/units/workflow/WorkflowEngine");
/**
 * Generate a DOT-formatted graph for use with Graphviz
 */
function generateWorkflowDOT(workflow) {
    let dot = `digraph "${workflow.name}" {\n`;
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=filled, fontname="Arial"];\n';
    dot += '  edge [fontname="Arial"];\n\n';
    // Add nodes
    for (const task of workflow.tasks) {
        let color = '"#D3D3D3"'; // Default light gray
        switch (task.status) {
            case WorkflowEngine_1.TaskStatus.COMPLETED:
                color = '"#90EE90"'; // Light green
                break;
            case WorkflowEngine_1.TaskStatus.RUNNING:
                color = '"#87CEFA"'; // Light blue
                break;
            case WorkflowEngine_1.TaskStatus.FAILED:
                color = '"#FFA07A"'; // Light salmon
                break;
            case WorkflowEngine_1.TaskStatus.SKIPPED:
                color = '"#D8BFD8"'; // Thistle
                break;
            case WorkflowEngine_1.TaskStatus.CANCELLED:
                color = '"#A9A9A9"'; // Dark gray
                break;
        }
        const duration = task.startTime && task.endTime
            ? `\\nDuration: ${Math.round((task.endTime - task.startTime) / 1000)}s`
            : '';
        dot += `  "${task.id}" [label="${task.name}\\n[${task.status}]${duration}", fillcolor=${color}];\n`;
    }
    dot += '\n';
    // Add edges
    for (const task of workflow.tasks) {
        if (task.dependencies) {
            for (const depId of task.dependencies) {
                const depTask = workflow.tasks.find(t => t.id === depId);
                if (depTask) {
                    dot += `  "${depId}" -> "${task.id}";\n`;
                }
            }
        }
    }
    dot += '}\n';
    return dot;
}
/**
 * Create a mermaid diagram for workflow visualization
 */
function generateWorkflowMermaid(workflow) {
    let mermaid = '```mermaid\ngraph TD;\n';
    // Add nodes
    for (const task of workflow.tasks) {
        const duration = task.startTime && task.endTime
            ? ` (${Math.round((task.endTime - task.startTime) / 1000)}s)`
            : '';
        let style = '';
        switch (task.status) {
            case WorkflowEngine_1.TaskStatus.COMPLETED:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#90EE90,stroke:#228B22';
                break;
            case WorkflowEngine_1.TaskStatus.RUNNING:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#87CEFA,stroke:#4682B4';
                break;
            case WorkflowEngine_1.TaskStatus.FAILED:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#FFA07A,stroke:#CD5C5C';
                break;
            case WorkflowEngine_1.TaskStatus.SKIPPED:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#D8BFD8,stroke:#9370DB';
                break;
            case WorkflowEngine_1.TaskStatus.CANCELLED:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#A9A9A9,stroke:#696969';
                break;
            default:
                style = 'style t' + task.id.replace(/-/g, '') + ' fill:#D3D3D3,stroke:#808080';
        }
        const safeId = 't' + task.id.replace(/-/g, '');
        mermaid += `    ${safeId}["${task.name}<br/>(${task.status})${duration}"];\n`;
        mermaid += `    ${style};\n`;
    }
    // Add edges
    for (const task of workflow.tasks) {
        if (task.dependencies) {
            for (const depId of task.dependencies) {
                const depTask = workflow.tasks.find(t => t.id === depId);
                if (depTask) {
                    const sourceId = 't' + depId.replace(/-/g, '');
                    const targetId = 't' + task.id.replace(/-/g, '');
                    mermaid += `    ${sourceId} --> ${targetId};\n`;
                }
            }
        }
    }
    mermaid += '```';
    return mermaid;
}
/**
 * Generate workflow summary statistics in Markdown format
 */
function generateWorkflowSummary(workflow) {
    const completed = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.COMPLETED).length;
    const failed = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.FAILED).length;
    const skipped = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.SKIPPED).length;
    const running = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.RUNNING).length;
    const pending = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.PENDING).length;
    const cancelled = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.CANCELLED).length;
    let totalDuration = 0;
    let maxTaskDuration = 0;
    let minTaskDuration = Infinity;
    let longestTask = null;
    let shortestTask = null;
    for (const task of workflow.tasks) {
        if (task.startTime && task.endTime) {
            const duration = task.endTime - task.startTime;
            totalDuration += duration;
            if (duration > maxTaskDuration) {
                maxTaskDuration = duration;
                longestTask = task;
            }
            if (duration < minTaskDuration) {
                minTaskDuration = duration;
                shortestTask = task;
            }
        }
    }
    const avgDuration = completed > 0 ? totalDuration / completed : 0;
    let md = `# Workflow Summary: ${workflow.name}\n\n`;
    md += `**ID:** ${workflow.id}  \n`;
    md += `**Version:** ${workflow.version}  \n`;
    md += `**Status:** ${workflow.status}  \n`;
    md += workflow.description ? `**Description:** ${workflow.description}  \n` : '';
    md += `**Created:** ${new Date(workflow.createdAt).toLocaleString()}  \n`;
    if (workflow.startedAt) {
        md += `**Started:** ${new Date(workflow.startedAt).toLocaleString()}  \n`;
    }
    if (workflow.completedAt) {
        md += `**Completed:** ${new Date(workflow.completedAt).toLocaleString()}  \n`;
        const totalWorkflowDuration = (workflow.completedAt - workflow.startedAt) / 1000;
        md += `**Total Duration:** ${totalWorkflowDuration.toFixed(2)} seconds  \n`;
    }
    md += `\n## Task Statistics\n\n`;
    md += `- **Total Tasks:** ${workflow.tasks.length}\n`;
    md += `- **Completed:** ${completed}\n`;
    md += `- **Failed:** ${failed}\n`;
    md += `- **Skipped:** ${skipped}\n`;
    md += `- **Running:** ${running}\n`;
    md += `- **Pending:** ${pending}\n`;
    md += `- **Cancelled:** ${cancelled}\n`;
    if (completed > 0) {
        md += `\n## Performance Metrics\n\n`;
        md += `- **Average Task Duration:** ${(avgDuration / 1000).toFixed(2)} seconds\n`;
        if (longestTask) {
            md += `- **Longest Task:** ${longestTask.name} (${(maxTaskDuration / 1000).toFixed(2)} seconds)\n`;
        }
        if (shortestTask && shortestTask !== longestTask) {
            md += `- **Shortest Task:** ${shortestTask.name} (${(minTaskDuration / 1000).toFixed(2)} seconds)\n`;
        }
    }
    md += `\n## Tasks\n\n`;
    for (const task of workflow.tasks) {
        const duration = task.startTime && task.endTime
            ? `Duration: ${((task.endTime - task.startTime) / 1000).toFixed(2)}s`
            : 'Not completed';
        md += `### ${task.name}\n\n`;
        md += `- **ID:** ${task.id}\n`;
        md += `- **Status:** ${task.status}\n`;
        md += `- **${duration}**\n`;
        if (task.dependencies && task.dependencies.length > 0) {
            md += `- **Dependencies:** ${task.dependencies.length}\n`;
        }
        if (task.error) {
            md += `- **Error:** ${task.error}\n`;
        }
        md += '\n';
    }
    return md;
}
/**
 * Generate an HTML visualization of the workflow
 */
function generateWorkflowHTML(workflow) {
    const mermaidDiagram = generateWorkflowMermaid(workflow).replace('```mermaid\n', '').replace('\n```', '');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workflow: ${workflow.name}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .visualization {
      margin: 30px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: white;
      flex: 1;
      min-width: 150px;
    }
    .task-list {
      margin-top: 30px;
    }
    .task-item {
      margin-bottom: 10px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: white;
    }
    .completed { border-left: 5px solid #4CAF50; }
    .running { border-left: 5px solid #2196F3; }
    .failed { border-left: 5px solid #f44336; }
    .skipped { border-left: 5px solid #9C27B0; }
    .pending { border-left: 5px solid #9E9E9E; }
    .cancelled { border-left: 5px solid #607D8B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Workflow: ${workflow.name}</h1>
      <p>ID: ${workflow.id}</p>
      <p>Status: ${workflow.status}</p>
      ${workflow.description ? `<p>Description: ${workflow.description}</p>` : ''}
      <p>Created: ${new Date(workflow.createdAt).toLocaleString()}</p>
      ${workflow.startedAt ? `<p>Started: ${new Date(workflow.startedAt).toLocaleString()}</p>` : ''}
      ${workflow.completedAt ? `<p>Completed: ${new Date(workflow.completedAt).toLocaleString()}</p>` : ''}
      ${workflow.startedAt && workflow.completedAt ?
        `<p>Total Duration: ${((workflow.completedAt - workflow.startedAt) / 1000).toFixed(2)} seconds</p>` : ''}
    </div>
    
    <div class="visualization">
      <h2>Workflow Visualization</h2>
      <div class="mermaid">
        ${mermaidDiagram}
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <h3>Task Status</h3>
        <p>Total: ${workflow.tasks.length}</p>
        <p>Completed: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.COMPLETED).length}</p>
        <p>Failed: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.FAILED).length}</p>
        <p>Skipped: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.SKIPPED).length}</p>
        <p>Running: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.RUNNING).length}</p>
        <p>Pending: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.PENDING).length}</p>
        <p>Cancelled: ${workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.CANCELLED).length}</p>
      </div>
      
      <div class="stat-card">
        <h3>Task Dependencies</h3>
        <p>Total Dependencies: ${workflow.tasks.reduce((acc, task) => acc + (task.dependencies?.length || 0), 0)}</p>
        <p>Avg Dependencies Per Task: ${(workflow.tasks.reduce((acc, task) => acc + (task.dependencies?.length || 0), 0) / workflow.tasks.length).toFixed(2)}</p>
      </div>
      
      <div class="stat-card">
        <h3>Task Performance</h3>
        ${(() => {
        const completedTasks = workflow.tasks.filter(t => t.status === WorkflowEngine_1.TaskStatus.COMPLETED && t.startTime && t.endTime);
        if (completedTasks.length === 0)
            return '<p>No completed tasks yet</p>';
        const totalDuration = completedTasks.reduce((acc, t) => acc + (t.endTime - t.startTime), 0);
        const avgDuration = totalDuration / completedTasks.length;
        return `
            <p>Avg Task Duration: ${(avgDuration / 1000).toFixed(2)}s</p>
            <p>Total Task Time: ${(totalDuration / 1000).toFixed(2)}s</p>
          `;
    })()}
      </div>
    </div>
    
    <div class="task-list">
      <h2>Tasks</h2>
      ${workflow.tasks.map(task => {
        const duration = task.startTime && task.endTime
            ? `Duration: ${((task.endTime - task.startTime) / 1000).toFixed(2)}s`
            : 'Not completed';
        return `
          <div class="task-item ${task.status.toLowerCase()}">
            <h3>${task.name}</h3>
            <p>ID: ${task.id}</p>
            <p>Status: ${task.status}</p>
            <p>${duration}</p>
            ${task.dependencies && task.dependencies.length > 0 ?
            `<p>Dependencies: ${task.dependencies.length}</p>` : ''}
            ${task.error ? `<p>Error: ${task.error}</p>` : ''}
          </div>
        `;
    }).join('')}
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`;
}
/**
 * Create a complete visualization package for a workflow
 */
function createWorkflowVisualization(workflow, outputDir) {
    // Create directory if it doesn't exist
    fs.ensureDirSync(outputDir);
    // Generate DOT file
    const dotContent = generateWorkflowDOT(workflow);
    const dotPath = path.join(outputDir, `workflow-${workflow.id}.dot`);
    fs.writeFileSync(dotPath, dotContent);
    // Generate Markdown summary
    const markdownContent = generateWorkflowSummary(workflow);
    const markdownPath = path.join(outputDir, `workflow-${workflow.id}-summary.md`);
    fs.writeFileSync(markdownPath, markdownContent);
    // Generate HTML visualization
    const htmlContent = generateWorkflowHTML(workflow);
    const htmlPath = path.join(outputDir, `workflow-${workflow.id}.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    return `Workflow visualization package created in ${outputDir}`;
}
//# sourceMappingURL=workflowVisualizer.js.map