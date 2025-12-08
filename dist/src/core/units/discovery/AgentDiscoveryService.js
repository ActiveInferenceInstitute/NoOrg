"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDiscoveryService = void 0;
const EventSystem_1 = require("../../events/EventSystem");
const StorageSystem_1 = require("../../storage/StorageSystem");
/**
 * AgentDiscoveryService allows agents to register themselves and discover other agents
 * in the distributed system.
 */
class AgentDiscoveryService {
    constructor(options = {}) {
        Object.defineProperty(this, "agents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "heartbeatInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "broadcastInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.agents = new Map();
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.storageSystem = StorageSystem_1.StorageSystem.getInstance();
        this.options = {
            heartbeatInterval: 30000, // 30 seconds
            expirationTime: 90000, // 90 seconds
            broadcastInterval: 60000, // 60 seconds
            ...options
        };
        this.setupEventListeners();
        this.startHeartbeatCheck();
        this.startBroadcasting();
        this.loadAgentsFromStorage();
    }
    static getInstance(options) {
        if (!AgentDiscoveryService.instance) {
            AgentDiscoveryService.instance = new AgentDiscoveryService(options);
        }
        return AgentDiscoveryService.instance;
    }
    /**
     * Register an agent with the discovery service
     */
    async registerAgent(agent) {
        const agentInfo = {
            ...agent,
            lastSeen: Date.now()
        };
        this.agents.set(agent.id, agentInfo);
        await this.storageSystem.set(`agent:${agent.id}`, agentInfo);
        this.eventSystem.emit('discovery:agent:registered', { agent: agentInfo });
        return agentInfo;
    }
    /**
     * Update an existing agent's information
     */
    async updateAgent(id, updates) {
        const agent = this.agents.get(id);
        if (!agent)
            return null;
        const updatedAgent = {
            ...agent,
            ...updates,
            id,
            lastSeen: Date.now()
        };
        this.agents.set(id, updatedAgent);
        await this.storageSystem.set(`agent:${id}`, updatedAgent);
        this.eventSystem.emit('discovery:agent:updated', { agent: updatedAgent });
        return updatedAgent;
    }
    /**
     * Send a heartbeat for an agent to indicate it's still active
     */
    async heartbeat(id) {
        const agent = this.agents.get(id);
        if (!agent)
            return false;
        agent.lastSeen = Date.now();
        await this.storageSystem.set(`agent:${id}`, agent);
        return true;
    }
    /**
     * Deregister an agent from the discovery service
     */
    async deregisterAgent(id) {
        const agent = this.agents.get(id);
        if (!agent)
            return false;
        this.agents.delete(id);
        await this.storageSystem.delete(`agent:${id}`);
        this.eventSystem.emit('discovery:agent:deregistered', { agentId: id });
        return true;
    }
    /**
     * Find agents that match specified criteria
     */
    findAgents(criteria = {}) {
        return Array.from(this.agents.values()).filter(agent => {
            // Filter by capabilities
            if (criteria.capabilities && criteria.capabilities.length > 0) {
                if (!criteria.capabilities.every(cap => agent.capabilities.includes(cap))) {
                    return false;
                }
            }
            // Filter by status
            if (criteria.status && agent.status !== criteria.status) {
                return false;
            }
            // Filter by metadata
            if (criteria.metadata) {
                for (const [key, value] of Object.entries(criteria.metadata)) {
                    if (agent.metadata[key] !== value) {
                        return false;
                    }
                }
            }
            return true;
        });
    }
    /**
     * Get a specific agent by ID
     */
    getAgent(id) {
        return this.agents.get(id);
    }
    /**
     * Get all registered agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Set up event listeners for discovery-related events
     */
    setupEventListeners() {
        this.eventSystem.on('discovery:heartbeat', (event) => {
            const { agentId } = event.payload;
            this.heartbeat(agentId);
        });
    }
    /**
     * Start the heartbeat check interval to detect inactive agents
     */
    startHeartbeatCheck() {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            const expiredAgents = [];
            for (const [id, agent] of this.agents.entries()) {
                if (now - agent.lastSeen > this.options.expirationTime) {
                    expiredAgents.push(id);
                }
            }
            // Remove expired agents
            for (const id of expiredAgents) {
                this.agents.delete(id);
                this.storageSystem.delete(`agent:${id}`);
                this.eventSystem.emit('discovery:agent:expired', { agentId: id });
            }
        }, this.options.heartbeatInterval);
    }
    /**
     * Start broadcasting the list of available agents
     */
    startBroadcasting() {
        this.broadcastInterval = setInterval(() => {
            const agents = this.getAllAgents();
            this.eventSystem.emit('discovery:agents:broadcast', { agents });
        }, this.options.broadcastInterval);
    }
    /**
     * Load previously registered agents from storage
     */
    async loadAgentsFromStorage() {
        try {
            // Get keys matching agent:*
            // Note: This is a simplified approach since we don't have a keys() method in StorageSystem
            // In a real implementation, you might need a list or query method
            // As a workaround, we're manually loading a known registry of agent IDs
            const agentRegistry = await this.storageSystem.get('agent:registry') || [];
            for (const agentId of agentRegistry) {
                const agent = await this.storageSystem.get(`agent:${agentId}`);
                if (agent) {
                    this.agents.set(agent.id, agent);
                }
            }
            this.eventSystem.emit('discovery:loaded', {
                count: this.agents.size
            });
        }
        catch (error) {
            console.error('Error loading agents from storage:', error);
        }
    }
    /**
     * Clean up resources when the service is shutting down
     */
    dispose() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
        }
    }
}
exports.AgentDiscoveryService = AgentDiscoveryService;
//# sourceMappingURL=AgentDiscoveryService.js.map