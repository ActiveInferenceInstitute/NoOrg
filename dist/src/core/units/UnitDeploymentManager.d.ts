/**
 * Unit Deployment Manager
 *
 * This module provides functionality for deploying multiagent compositions
 * based on organizational units.
 */
import { AgentRegistry } from '../multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../multiagent/MultiAgentCoordinator';
import { TaskManager } from '../multiagent/TaskManager';
import { OrganizationalCompositionManager, OrganizationalStructureManager } from './UnitInterface';
export interface DeploymentConfig {
    compositionId: string;
    name: string;
    description: string;
    includeDefaultAgents?: boolean;
    defaultAgentTypes?: string[];
    agentConfig?: Record<string, any>;
}
export interface DeploymentStatus {
    id: string;
    name: string;
    status: 'deploying' | 'active' | 'failed' | 'terminated';
    timestamp: number;
    unitAgentMap: Record<string, string[]>;
    createdAgents: string[];
    createdTasks: string[];
    error?: string;
}
/**
 * Manager for deploying multiagent compositions based on organizational units
 */
export declare class UnitDeploymentManager {
    private structureManager;
    private compositionManager;
    private agentRegistry;
    private coordinator;
    private taskManager;
    private deployments;
    constructor(structureManager: OrganizationalStructureManager, compositionManager: OrganizationalCompositionManager, agentRegistry: AgentRegistry, coordinator: MultiAgentCoordinator, taskManager: TaskManager);
    /**
     * Deploy a multiagent composition based on organizational units
     */
    deployComposition(config: DeploymentConfig): Promise<string>;
    /**
     * Terminate a deployed composition
     */
    terminateDeployment(deploymentId: string): Promise<boolean>;
    /**
     * Get deployment status
     */
    getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
    /**
     * Get all deployments
     */
    getAllDeployments(): Promise<DeploymentStatus[]>;
    /**
     * Get active deployments
     */
    getActiveDeployments(): Promise<DeploymentStatus[]>;
    /**
     * Create agent for unit
     */
    private createAgentForUnit;
    /**
     * Create agent for capability
     */
    private createAgentForCapability;
    /**
     * Check if unit has agent with capability
     */
    private unitHasAgentWithCapability;
    /**
     * Create tasks for the composition
     */
    private createCompositionTasks;
}
//# sourceMappingURL=UnitDeploymentManager.d.ts.map