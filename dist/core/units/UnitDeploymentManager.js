"use strict";
/**
 * Unit Deployment Manager
 *
 * This module provides functionality for deploying multiagent compositions
 * based on organizational units.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitDeploymentManager = void 0;
const uuid_1 = require("uuid");
/**
 * Manager for deploying multiagent compositions based on organizational units
 */
class UnitDeploymentManager {
    constructor(structureManager, compositionManager, agentRegistry, coordinator, taskManager) {
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
    async deployComposition(config) {
        try {
            // Get the composition
            const composition = await this.compositionManager.getComposition(config.compositionId);
            // Create deployment status
            const deploymentId = `deploy_${Date.now()}_${config.compositionId}`;
            const status = {
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
            const units = [];
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Update deployment status if it exists
            const deploymentId = `deploy_${Date.now()}_${config.compositionId}`;
            if (this.deployments.has(deploymentId)) {
                const status = this.deployments.get(deploymentId);
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
    async terminateDeployment(deploymentId) {
        const status = this.deployments.get(deploymentId);
        if (!status) {
            throw new Error(`Deployment with ID ${deploymentId} not found`);
        }
        // Stop all agents
        for (const agentId of status.createdAgents) {
            try {
                // Change agent status to offline
                await this.agentRegistry.updateAgentStatus(agentId, { state: 'offline' });
                // Unregister the agent
                await this.agentRegistry.unregisterAgent(agentId);
            }
            catch (error) {
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
    async getDeploymentStatus(deploymentId) {
        const status = this.deployments.get(deploymentId);
        if (!status) {
            throw new Error(`Deployment with ID ${deploymentId} not found`);
        }
        return status;
    }
    /**
     * Get all deployments
     */
    async getAllDeployments() {
        return Array.from(this.deployments.values());
    }
    /**
     * Get active deployments
     */
    async getActiveDeployments() {
        return Array.from(this.deployments.values()).filter(status => status.status === 'active');
    }
    /**
     * Create agent for unit
     */
    async createAgentForUnit(unit, agentType, agentConfig) {
        const agentName = `${unit.name} ${agentType}`.trim();
        const agent = {
            id: (0, uuid_1.v4)(),
            name: agentName,
            type: agentType,
            capabilities: unit.capabilities,
            status: {
                state: 'available',
                lastUpdated: Date.now(),
                healthStatus: {
                    isHealthy: true,
                    errors: [],
                    lastHeartbeat: Date.now()
                }
            },
            metadata: {
                unitId: unit.id,
                unitName: unit.name,
                ...agentConfig
            }
        };
        return this.agentRegistry.registerAgent(agent);
    }
    /**
     * Create agent for capability
     */
    async createAgentForCapability(unit, capability, agentConfig) {
        const agentName = `${unit.name} ${capability.name} specialist`.trim();
        const agent = {
            id: (0, uuid_1.v4)(),
            name: agentName,
            type: 'specialist',
            capabilities: [capability],
            status: {
                state: 'available',
                lastUpdated: Date.now(),
                healthStatus: {
                    isHealthy: true,
                    errors: [],
                    lastHeartbeat: Date.now()
                }
            },
            metadata: {
                unitId: unit.id,
                unitName: unit.name,
                specialty: capability.name,
                ...agentConfig
            }
        };
        return this.agentRegistry.registerAgent(agent);
    }
    /**
     * Check if unit has agent with capability
     */
    async unitHasAgentWithCapability(unitId, capability) {
        const unit = await this.structureManager.getUnit(unitId);
        for (const agentId of unit.agents) {
            const agent = await this.agentRegistry.getAgent(agentId);
            if (agent.capabilities.some(c => c.name === capability.name)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Create tasks for the composition
     */
    async createCompositionTasks(units, agentIds) {
        // Create a main task that initializes the composition
        const taskDescription = `Initialize and coordinate units: ${units.map(u => u.name).join(', ')}`;
        const task = {
            id: (0, uuid_1.v4)(),
            type: 'unit_coordination',
            title: `Unit Coordination`,
            description: taskDescription,
            status: 'pending',
            priority: 'medium',
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
exports.UnitDeploymentManager = UnitDeploymentManager;
//# sourceMappingURL=UnitDeploymentManager.js.map