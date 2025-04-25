/**
 * WorkflowVisualizer
 *
 * Utility to generate visual representations of workflows including DAG visualization,
 * workflow statistics, and decision trees.
 */
import { Workflow } from '../../core/units/workflow/WorkflowEngine';
/**
 * Generate a DOT-formatted graph for use with Graphviz
 */
export declare function generateWorkflowDOT(workflow: Workflow): string;
/**
 * Create a mermaid diagram for workflow visualization
 */
export declare function generateWorkflowMermaid(workflow: Workflow): string;
/**
 * Generate workflow summary statistics in Markdown format
 */
export declare function generateWorkflowSummary(workflow: Workflow): string;
/**
 * Generate an HTML visualization of the workflow
 */
export declare function generateWorkflowHTML(workflow: Workflow): string;
/**
 * Create a complete visualization package for a workflow
 */
export declare function createWorkflowVisualization(workflow: Workflow, outputDir: string): string;
