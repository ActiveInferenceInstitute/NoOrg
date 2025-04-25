// Placeholder for Agent Manager Logic
const { UnitAgent } = require('./types');

class AgentManager {
    constructor() {
        this.agents = new Map(); // agentId -> Agent instance
        this.unitAgentMap = new Map(); // unitId -> agentId
    }

    registerAgent(agent) {
        if (!(agent instanceof UnitAgent)) {
            throw new Error('Invalid agent type provided to AgentManager.');
        }
        if (this.agents.has(agent.id)) {
            console.warn(`Agent with ID ${agent.id} already registered.`);
            return;
        }
        this.agents.set(agent.id, agent);
        this.unitAgentMap.set(agent.unitId, agent.id);
        console.log(`✅ Agent registered: ${agent.name} (AgentID: ${agent.id}, UnitID: ${agent.unitId})`);
    }

    getAgentById(agentId) {
        return this.agents.get(agentId);
    }

    getAgentForUnit(unitId) {
        const agentId = this.unitAgentMap.get(unitId);
        return agentId ? this.getAgentById(agentId) : null;
    }

    getAllAgents() {
        return Array.from(this.agents.values());
    }
}

module.exports = AgentManager; 