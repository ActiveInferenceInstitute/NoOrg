"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
const uuid_1 = require("uuid");
const SharedStateManager_1 = require("./SharedStateManager");
/**
 * Implementation of the AgentRegistry
 * Manages agent registration, updates, and querying
 */
class AgentRegistry {
    /**
     * Get the singleton instance of AgentRegistry
     * @returns AgentRegistry instance
     */
    static getInstance() {
        if (!AgentRegistry.instance) {
            AgentRegistry.instance = new AgentRegistry();
        }
        return AgentRegistry.instance;
    }
    /**
     * Constructor initializes registry and required properties
     * @param stateManager Optional SharedStateManager instance
     */
    constructor(stateManager) {
        Object.defineProperty(this, "agents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "capabilityIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "stateManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Required properties from BaseAgent
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "capabilities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // Using any to simplify implementation
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "preferredModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "createdAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Required properties from AgentRegistry interface
        Object.defineProperty(this, "sharedStateManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "taskManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openAIClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "promptManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "executionConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const now = Date.now();
        this.stateManager = stateManager || SharedStateManager_1.SharedStateManager.getInstance();
        // Initialize required BaseAgent properties
        this.id = (0, uuid_1.v4)();
        this.name = 'Agent Registry';
        this.type = 'registry';
        this.description = 'Registry for managing agent registrations';
        this.capabilities = [
            { name: 'agent-registration', description: 'Manages agent registrations', parameters: {} }
        ];
        this.status = {
            id: this.id,
            name: this.name,
            type: this.type,
            status: 'available',
            lastActive: now,
            capabilities: [],
            metadata: {},
            state: 'available',
            lastUpdated: now,
            healthStatus: {
                isHealthy: true,
                errors: [],
                lastHeartbeat: now
            },
            metrics: {}
        };
        this.metadata = {};
        this.preferredModel = '';
        this.createdAt = now;
        this.lastActive = now;
        // Initialize required interface properties
        this.sharedStateManager = {
            setState: async (path, value) => {
                await this.stateManager.setState(path, value);
            },
            getState: async (path) => {
                return this.stateManager.getState(path);
            },
            clearState: async () => {
                await this.stateManager.clearState();
            },
            loadState: async () => {
                await this.stateManager.loadState();
            }
        };
        this.taskManager = {
            assignTask: async (taskId, agentId) => { },
            completeTask: async (taskId, agentId) => { },
            failTask: async (taskId, agentId, error) => { }
        };
        this.openAIClient = {
            createCompletion: async (prompt, options) => '',
            createChat: async (messages, options) => ''
        };
        this.promptManager = {
            getPrompt: async (name, variables) => '',
            addPrompt: async (name, template) => { },
            updatePrompt: async (name, template) => { },
            deletePrompt: async (name) => { }
        };
        this.executionConfig = {
            maxConcurrentTasks: 5,
            enableAutoRetry: true,
            maxRetryAttempts: 3,
            taskPriorityQueue: true,
            useAgentSpecialization: true,
            monitorAgentPerformance: true
        };
    }
    /**
     * Register a new agent
     * @param agent Agent data
     * @returns True if successful
     */
    async registerAgent(agent) {
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent with ID ${agent.id} already exists`);
        }
        this.agents.set(agent.id, { ...agent });
        // Index agent capabilities
        this.indexCapabilities(agent);
        // Update shared state
        await this.stateManager.setState(`agents.${agent.id}`, agent);
        return true;
    }
    /**
     * Unregister an agent
     * @param agentId Agent ID
     * @returns True if successful
     */
    async unregisterAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        // Remove from capability index
        this.removeFromCapabilityIndex(agent);
        this.agents.delete(agentId);
        // Update shared state
        await this.stateManager.setState(`agents.${agentId}`, undefined);
        return true;
    }
    /**
     * Update an agent
     * @param agentId Agent ID
     * @param updates Partial agent data for updates
     * @returns True if successful
     */
    async updateAgent(agentId, updates) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        // Update agent data
        const updatedAgent = { ...agent, ...updates };
        this.agents.set(agentId, updatedAgent);
        // Update shared state
        await this.stateManager.setState(`agents.${agentId}`, updatedAgent);
        return true;
    }
    /**
     * Get an agent by ID
     * @param agentId Agent ID
     * @returns Agent if found, null otherwise
     */
    async getAgent(agentId) {
        const agent = this.agents.get(agentId);
        return agent ? { ...agent } : null;
    }
    /**
     * List agents with optional filtering
     * @param filter Optional filter
     * @returns Array of agents
     */
    async listAgents(filter) {
        let agents = Array.from(this.agents.values());
        if (filter) {
            if (filter.types && filter.types.length > 0) {
                agents = agents.filter(agent => filter.types?.includes(agent.type));
            }
            if (filter.status && filter.status.length > 0) {
                agents = agents.filter(agent => filter.status?.includes(agent.status));
            }
            if (filter.capabilities && filter.capabilities.length > 0) {
                agents = agents.filter(agent => filter.capabilities?.some(cap => agent.capabilities.includes(cap)));
            }
            if (filter.metadata) {
                agents = agents.filter(agent => {
                    for (const [key, value] of Object.entries(filter.metadata)) {
                        if (typeof agent.metadata[key] !== typeof value || agent.metadata[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
        }
        // Convert to AgentType
        return agents.map(agent => this.convertToAgentType(agent));
    }
    /**
     * Convert Agent to AgentType
     * @param agent Agent object
     * @returns AgentType object
     */
    convertToAgentType(agent) {
        return {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            description: agent.description || '',
            capabilities: agent.capabilities,
            status: agent.status,
            metadata: agent.metadata || {},
            preferredModel: agent.preferredModel || '',
            lastActive: agent.lastActive || Date.now(),
            createdAt: agent.createdAt || Date.now()
        };
    }
    /**
     * Update agent capabilities
     * @param agentId Agent ID
     * @param capabilities New capabilities
     * @returns Success status
     */
    async updateAgentCapabilities(agentId, capabilities) {
        try {
            const agent = this.agents.get(agentId);
            if (!agent) {
                throw new Error(`Agent ${agentId} not found`);
            }
            // Remove old capabilities from index
            this.removeFromCapabilityIndex(agent);
            // Update agent capabilities
            agent.capabilities = capabilities;
            if (!agent.metadata) {
                agent.metadata = {};
            }
            agent.metadata.lastCapabilityUpdate = Date.now();
            // Add new capabilities to index
            this.indexCapabilities(agent);
            return true;
        }
        catch (error) {
            console.error(`Failed to update agent capabilities: ${error.message}`);
            return false;
        }
    }
    /**
     * Update agent status
     * @param agentId Agent ID
     * @param status New status
     * @returns Success status
     */
    async updateAgentStatus(agentId, status) {
        try {
            const agent = this.agents.get(agentId);
            if (!agent) {
                throw new Error(`Agent ${agentId} not found`);
            }
            agent.status = status;
            return true;
        }
        catch (error) {
            console.error(`Failed to update agent status: ${error.message}`);
            return false;
        }
    }
    /**
     * Get agent status
     * @param agentId Agent ID
     * @returns Agent status or null
     */
    async getAgentStatus(agentId) {
        const agent = this.agents.get(agentId);
        return agent?.status || null;
    }
    /**
     * Check if agent is available
     * @param agentId Agent ID
     * @returns Availability status
     */
    async isAgentAvailable(agentId) {
        const status = await this.getAgentStatus(agentId);
        return status === 'available';
    }
    /**
     * Validate agent data
     * @param agent Agent to validate
     * @returns Validation result
     */
    validateAgent(agent) {
        if (!agent.id || !agent.name || !agent.type) {
            return false;
        }
        if (!Array.isArray(agent.capabilities) || agent.capabilities.length === 0) {
            return false;
        }
        if (!agent.status) {
            return false;
        }
        return true;
    }
    /**
     * Index agent capabilities
     * @param agent Agent to index
     */
    indexCapabilities(agent) {
        agent.capabilities.forEach(capability => {
            if (!this.capabilityIndex.has(capability)) {
                this.capabilityIndex.set(capability, new Set());
            }
            this.capabilityIndex.get(capability)?.add(agent.id);
        });
    }
    removeFromCapabilityIndex(agent) {
        agent.capabilities.forEach(capability => {
            const agentSet = this.capabilityIndex.get(capability);
            if (agentSet) {
                agentSet.delete(agent.id);
                // Clean up empty sets
                if (agentSet.size === 0) {
                    this.capabilityIndex.delete(capability);
                }
            }
        });
    }
    /**
     * Remove agent from capabilities index
     * @param agent Agent to remove
     */
    removeFromCapabilitiesIndex(agent) {
        agent.capabilities.forEach(capability => {
            const cap = typeof capability === 'string' ? { name: capability } : capability;
            const agents = this.capabilityIndex.get(cap.name);
            if (agents) {
                agents.delete(agent.id);
                if (agents.size === 0) {
                    this.capabilityIndex.delete(cap.name);
                }
            }
        });
    }
    /**
     * Get agents by capability
     * @param capability Capability name to filter by
     * @param minLevel Optional minimum capability level (Note: Capability type has no level, this param is unused)
     * @returns Agents with the specified capability
     */
    async getAgentsByCapability(capability, minLevel) {
        const agents = Array.from(this.agents.values());
        return agents.filter(agent => {
            return agent.capabilities.includes(capability);
        });
    }
    /**
     * Get the total number of registered agents
     * @returns Total agent count
     */
    async getAgentCount() {
        return this.agents.size;
    }
    /**
     * Get agents by current state
     * @param state State to filter by
     * @returns Agents in the specified state
     */
    async getAgentsByState(state) {
        return Array.from(this.agents.values()).filter(agent => agent.status === state);
    }
    /**
     * Find agents with a specific capability
     * @param capability The capability to look for
     * @returns Array of agents with the specified capability
     */
    async findAgentsByCapability(capability) {
        const agentIds = this.capabilityIndex.get(capability);
        if (!agentIds || agentIds.size === 0) {
            return [];
        }
        return Array.from(agentIds)
            .map(id => this.agents.get(id))
            .filter((agent) => agent !== undefined);
    }
    /**
     * Get the count of agents by status
     * @returns Object with counts for each status state
     */
    async getAgentCountsByStatus() {
        const counts = {
            'offline': 0,
            'available': 0,
            'busy': 0,
            'error': 0
        };
        for (const agent of this.agents.values()) {
            const statusKey = agent.status;
            if (Object.prototype.hasOwnProperty.call(counts, statusKey)) {
                counts[statusKey]++;
            }
            else {
                console.warn(`Unexpected agent status found: ${statusKey} for agent ${agent.id}`);
            }
        }
        return counts;
    }
    /**
     * Get the count of agents by type
     * @returns Object with counts for each type
     */
    async getAgentCountsByType() {
        const counts = {};
        const agents = await this.listAgents();
        agents.forEach(agent => {
            counts[agent.type] = (counts[agent.type] || 0) + 1;
        });
        return counts;
    }
    /**
     * Get all available capabilities across all agents
     * @returns Array of unique capabilities
     */
    async getAvailableCapabilities() {
        return Array.from(this.capabilityIndex.keys());
    }
    /**
     * Clear all agents from the registry
     */
    async clear() {
        this.agents.clear();
        this.capabilityIndex.clear();
    }
    /**
     * Find agents by type
     * @param type Agent type to search for
     * @returns Array of agents of the specified type
     */
    async findAgentsByType(type) {
        try {
            const agents = Array.from(this.agents.values());
            const matchingAgents = agents.filter(agent => agent.type === type);
            return matchingAgents.map(agent => this.convertToAgentType(agent));
        }
        catch (error) {
            console.error(`Failed to find agents by type: ${error.message}`);
            return [];
        }
    }
    /**
     * Get capabilities for a specific agent
     * @param agentId Agent ID
     * @returns Array of capabilities
     */
    async getAgentCapabilities(agentId) {
        try {
            const agent = this.agents.get(agentId);
            if (!agent) {
                return [];
            }
            return agent.capabilities;
        }
        catch (error) {
            console.error(`Failed to get agent capabilities: ${error.message}`);
            return [];
        }
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=AgentRegistry.js.map