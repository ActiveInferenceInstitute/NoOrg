/**
 * Strategic Innovation Project with Risk Assessment Workflow
 *
 * This example demonstrates a comprehensive workflow between organizational units:
 * - Strategy unit sets the initial plan
 * - Risk Management analyzes the plan with input from Risk Advisory Board
 * - Innovation unit implements the approved plan
 * - Knowledge Management unit handles knowledge engineering aspects
 *
 * Each unit has specialized agents with specific roles in the process.
 */
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { TaskManager } from '../core/multiagent/TaskManager';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { DefaultOrganizationalStructureManager } from '../core/units/OrganizationalStructureManager';
import { DefaultOrganizationalCompositionManager } from '../core/units/OrganizationalCompositionManager';
import { UnitDeploymentManager } from '../core/units/UnitDeploymentManager';
interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    unitId: string;
    agentIds: string[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    dependsOn: string[];
    output?: any;
    completedAt?: number;
}
interface WorkflowConfig {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    startedAt: number;
    completedAt?: number;
    metadata: Record<string, any>;
}
/**
 * Orchestrates the workflow between organizational units
 */
declare class OrganizationalWorkflowManager {
    private structureManager;
    private compositionManager;
    private deploymentManager;
    private sharedStateManager;
    private agentRegistry;
    private taskManager;
    private workflows;
    constructor(structureManager: DefaultOrganizationalStructureManager, compositionManager: DefaultOrganizationalCompositionManager, deploymentManager: UnitDeploymentManager, sharedStateManager: SharedStateManager, agentRegistry: AgentRegistry, taskManager: TaskManager);
    /**
     * Create a new organizational workflow
     */
    createWorkflow(name: string, description: string, metadata?: Record<string, any>): Promise<string>;
    /**
     * Add a step to the workflow
     */
    addWorkflowStep(workflowId: string, name: string, description: string, unitId: string, agentIds: string[], dependsOn?: string[]): Promise<string>;
    /**
     * Start executing a workflow
     */
    startWorkflow(workflowId: string): Promise<void>;
    /**
     * Execute a specific workflow step
     */
    executeWorkflowStep(workflowId: string, stepId: string): Promise<void>;
    /**
     * Check and execute next steps in the workflow
     */
    private checkAndExecuteNextSteps;
    /**
     * Check if a workflow is completed
     */
    private checkWorkflowCompletion;
    /**
     * Simulate agent execution (in a real system, this would involve actual LLM calls)
     */
    private simulateAgentExecution;
    /**
     * Get workflow status
     */
    getWorkflowStatus(workflowId: string): Promise<WorkflowConfig>;
    /**
     * Get all workflows
     */
    getAllWorkflows(): Promise<WorkflowConfig[]>;
}
/**
 * Main function to run the strategic innovation workflow
 */
declare function runStrategicInnovationWorkflow(): Promise<void>;
export { OrganizationalWorkflowManager, runStrategicInnovationWorkflow };
//# sourceMappingURL=strategic-risk-innovation-workflow.d.ts.map