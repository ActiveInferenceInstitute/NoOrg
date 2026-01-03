/**
 * Unit Deployment Manager
 * 
 * This module provides functionality for deploying multiagent compositions
 * based on organizational units.
 */

import { v4 as uuidv4 } from 'uuid';
import { Agent, Capability, Task } from '../multiagent/types';
import { AgentRegistry } from '../multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../multiagent/MultiAgentCoordinator';
import { TaskManager } from '../multiagent/TaskManager';
import { OrganizationalCompositionManager, OrganizationalStructureManager, OrganizationalUnit } from './UnitInterface';

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
export class UnitDeploymentManager {
  private structureManager: OrganizationalStructureManager;
  private compositionManager: OrganizationalCompositionManager;
  private agentRegistry: AgentRegistry;
  private coordinator: MultiAgentCoordinator;
  private taskManager: TaskManager;
  private deployments: Map<string, DeploymentStatus>;
  
  constructor(
    structureManager: OrganizationalStructureManager,
    compositionManager: OrganizationalCompositionManager,
    agentRegistry: AgentRegistry,
    coordinator: MultiAgentCoordinator,
    taskManager: TaskManager
  ) {
    this.structureManager = structureManager;
    this.compositionManager = compositionManager;
    this.agentRegistry = agentRegistry;
    this.coordinator = coordinator;
    this.taskManager = taskManager;
    this.deployments = new Map();
  }
  
  /**
   * Deploy a multiagent composition based on organizational units
   */
  async deployComposition(config: DeploymentConfig): Promise<string> {
    try {
      // Get the composition
      const composition = await this.compositionManager.getComposition(config.compositionId);
      
      // Create deployment status
      const deploymentId = `deploy_${Date.now()}_${config.compositionId}`;
      const status: DeploymentStatus = {
        id: deploymentId,
        name: config.name,
        status: 'deploying',
        timestamp: Date.now(),
        unitAgentMap: {},
        createdAgents: [],
        createdTasks: []
      };
      
      this.deployments.set(deploymentId, status);
      
      // Get all units in the composition
      const units: OrganizationalUnit[] = [];
      for (const unitId of composition.units) {
        const unit = await this.structureManager.getUnit(unitId);
        units.push(unit);
      }
      
      // Create agents for each unit based on capabilities
      for (const unit of units) {
        status.unitAgentMap[unit.id] = [];
        
        // Create default agents if configured
        if (config.includeDefaultAgents) {
          const agentTypes = config.defaultAgentTypes || ['worker', 'manager', 'coordinator'];
          
          for (const agentType of agentTypes) {
            const agentId = await this.createAgentForUnit(unit, agentType, config.agentConfig);
            status.unitAgentMap[unit.id].push(agentId);
            status.createdAgents.push(agentId);
            
            // Assign agent to unit
            await this.structureManager.assignAgentToUnit(unit.id, agentId);
          }
        }
        
        // Create capability-specific agents
        for (const capability of unit.capabilities) {
          // Check if we already have an agent with this capability
          const hasCapability = await this.unitHasAgentWithCapability(unit.id, capability);
          
          if (!hasCapability) {
            const agentId = await this.createAgentForCapability(unit, capability, config.agentConfig);
            status.unitAgentMap[unit.id].push(agentId);
            status.createdAgents.push(agentId);
            
            // Assign agent to unit
            await this.structureManager.assignAgentToUnit(unit.id, agentId);
          }
        }
      }
      
      // Create tasks for the composition
      const createTaskId = await this.createCompositionTasks(units, status.createdAgents);
      status.createdTasks.push(createTaskId);
      
      // Update deployment status
      status.status = 'active';
      this.deployments.set(deploymentId, status);
      
      return deploymentId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update deployment status if it exists
      const deploymentId = `deploy_${Date.now()}_${config.compositionId}`;
      if (this.deployments.has(deploymentId)) {
        const status = this.deployments.get(deploymentId)!;
        status.status = 'failed';
        status.error = errorMessage;
        this.deployments.set(deploymentId, status);
      }
      
      throw new Error(`Failed to deploy composition: ${errorMessage}`);
    }
  }
  
  /**
   * Terminate a deployed composition
   */
  async terminateDeployment(deploymentId: string): Promise<boolean> {
    const status = this.deployments.get(deploymentId);
    if (!status) {
      throw new Error(`Deployment with ID ${deploymentId} not found`);
    }
    
    // Stop all agents
    for (const agentId of status.createdAgents) {
      try {
        // Change agent status to offline
        await this.agentRegistry.updateAgentStatus(agentId, 'offline');
        
        // Unregister the agent
        await this.agentRegistry.unregisterAgent(agentId);
      } catch (error: unknown) {
        console.error(`Failed to deactivate agent ${agentId}: ${error}`);
      }
    }
    
    // Update deployment status
    status.status = 'terminated';
    this.deployments.set(deploymentId, status);
    
    return true;
  }
  
  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const status = this.deployments.get(deploymentId);
    if (!status) {
      throw new Error(`Deployment with ID ${deploymentId} not found`);
    }
    
    return status;
  }
  
  /**
   * Get all deployments
   */
  async getAllDeployments(): Promise<DeploymentStatus[]> {
    return Array.from(this.deployments.values());
  }
  
  /**
   * Get active deployments
   */
  async getActiveDeployments(): Promise<DeploymentStatus[]> {
    return Array.from(this.deployments.values()).filter(
      status => status.status === 'active'
    );
  }
  
  /**
   * Create agent for unit
   */
  private async createAgentForUnit(
    unit: OrganizationalUnit, 
    agentType: string,
    agentConfig?: Record<string, any>
  ): Promise<string> {
    const agentName = `${unit.name} ${agentType}`.trim();
    
    const now = Date.now();
    const agent: Agent = {
      id: uuidv4(),
      name: agentName,
      type: agentType,
      capabilities: unit.capabilities,
      status: 'available',
      lastActive: now,
      createdAt: now,
      metadata: {
        unitId: unit.id,
        unitName: unit.name,
        ...agentConfig
      }
    };

    await this.agentRegistry.registerAgent(agent);
    return agent.id;
  }
  
  /**
   * Create agent for capability
   */
  private async createAgentForCapability(
    unit: OrganizationalUnit,
    capability: string,
    agentConfig?: Record<string, any>
  ): Promise<string> {
    const agentName = `${unit.name} ${capability} specialist`.trim();
    
    const now = Date.now();
    const agent: Agent = {
      id: uuidv4(),
      name: agentName,
      type: 'specialist',
      capabilities: [capability],
      status: 'available',
      lastActive: now,
      createdAt: now,
      metadata: {
        unitId: unit.id,
        unitName: unit.name,
        specialty: capability,
        ...agentConfig
      }
    };

    await this.agentRegistry.registerAgent(agent);
    return agent.id;
  }
  
  /**
   * Check if unit has agent with capability
   */
  private async unitHasAgentWithCapability(unitId: string, capability: string): Promise<boolean> {
    // For now, always return false to allow agent creation
    // TODO: Implement proper agent-capability tracking per unit
    return false;
  }
  
  /**
   * Create tasks for the composition
   */
  private async createCompositionTasks(
    units: OrganizationalUnit[],
    agentIds: string[]
  ): Promise<string> {
    // Create a main task that initializes the composition
    const taskDescription = `Initialize and coordinate units: ${units.map(u => u.name).join(', ')}`;
    
    const task: Task = {
      id: uuidv4(),
      name: 'Unit Coordination',
      description: taskDescription,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        type: 'unit_composition',
        unitIds: units.map(u => u.id)
      }
    };
    
    const taskId = await this.taskManager.createTask(task);
    
    // Assign to the first agent (this could be improved with better agent selection)
    if (agentIds.length > 0) {
      await this.taskManager.assignTask(taskId, agentIds[0]);
    }
    
    return taskId;
  }
} 