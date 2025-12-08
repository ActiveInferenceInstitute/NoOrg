"use strict";
/**
 * UnitAgentFactory module
 *
 * Creates agents from organizational units, with integrated capabilities and context.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitAgentFactory = void 0;
const uuid_1 = require("uuid");
/**
 * UnitAgentFactory class
 * Creates and configures agents based on organizational units
 */
class UnitAgentFactory {
    /**
     * Create a new UnitAgentFactory
     * @param relationshipManager - Optional relationship manager for context enhancement
     * @param config - Configuration options
     * @param logger - Logger instance
     */
    constructor(relationshipManager, config = {}, logger = console) {
        Object.defineProperty(this, "relationshipManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.relationshipManager = relationshipManager;
        this.logger = logger;
        this.config = {
            defaultModel: 'gpt-4o-mini',
            defaultCapabilities: ['reasoning', 'planning', 'problem-solving'],
            includeUnitContext: true,
            ...config
        };
    }
    /**
     * Create agents for a set of organizational units
     * @param units - Array of organizational units
     * @returns Array of created agents
     */
    createAgentsForUnits(units) {
        const agents = [];
        for (const unit of units) {
            try {
                const agent = this.createAgentForUnit(unit);
                agents.push(agent);
                this.logger.log(`Created agent for unit: ${unit.name} (ID: ${agent.id})`);
            }
            catch (error) {
                this.logger.warn(`Failed to create agent for unit ${unit.name}: ${error.message}`);
            }
        }
        return agents;
    }
    /**
     * Create an agent for a specific organizational unit
     * @param unit - Organizational unit
     * @returns Created agent
     */
    createAgentForUnit(unit) {
        // Combine unit capabilities with default capabilities
        const capabilities = [
            ...new Set([
                ...(this.config.defaultCapabilities || []),
                ...unit.capabilities
            ])
        ];
        // Create metadata with unit context
        const metadata = {
            unitId: unit.id,
            unitName: unit.name,
            unitDescription: unit.description,
            createdAt: Date.now()
        };
        // Include relationship context if available and enabled
        if (this.config.includeUnitContext && this.relationshipManager) {
            // Add hierarchical information
            const parentUnits = this.relationshipManager.findHierarchyUnits(unit.id, 'up');
            if (parentUnits.length > 0) {
                metadata.parentUnits = parentUnits.map(u => ({ id: u.id, name: u.name }));
            }
            // Add related units
            const relatedUnits = this.relationshipManager.findRelatedUnits(unit.id);
            if (relatedUnits.length > 0) {
                metadata.relatedUnits = relatedUnits.map(u => ({ id: u.id, name: u.name }));
            }
        }
        // Create the agent
        const agent = {
            id: (0, uuid_1.v4)(),
            name: `${unit.name} Agent`,
            type: this.normalizeUnitTypeForAgent(unit.name),
            description: unit.description,
            capabilities,
            status: 'available',
            metadata,
            preferredModel: this.config.defaultModel,
            lastActive: Date.now(),
            createdAt: Date.now()
        };
        return agent;
    }
    /**
     * Generate a system prompt for the agent based on organizational unit
     * @param unit - Organizational unit
     * @returns System prompt string
     */
    generateUnitAgentSystemPrompt(unit) {
        let prompt = `You are an AI agent representing the ${unit.name} organizational unit.\n\n`;
        // Add unit description
        prompt += `UNIT DESCRIPTION:\n${unit.description}\n\n`;
        // Add capabilities
        prompt += `KEY CAPABILITIES:\n`;
        unit.capabilities.forEach(cap => {
            prompt += `- ${cap.replace(/_/g, ' ')}\n`;
        });
        prompt += '\n';
        // Add hierarchical context
        if (this.relationshipManager) {
            const parentUnits = this.relationshipManager.findHierarchyUnits(unit.id, 'up');
            if (parentUnits.length > 0) {
                prompt += 'ORGANIZATIONAL HIERARCHY:\n';
                parentUnits.forEach(parent => {
                    prompt += `- Reports to: ${parent.name}\n`;
                });
                prompt += '\n';
            }
            // Add collaboration context
            const relatedUnits = this.relationshipManager.findRelatedUnits(unit.id);
            if (relatedUnits.length > 0) {
                prompt += 'KEY COLLABORATORS:\n';
                relatedUnits.forEach(related => {
                    prompt += `- ${related.name}\n`;
                });
                prompt += '\n';
            }
        }
        // Add response guidance
        prompt += `RESPONSE GUIDANCE:
- You should align all responses with the perspective and expertise of the ${unit.name} unit.
- Format responses professionally as would be expected from this organizational unit.
- Provide specific guidance and insights based on the unit's capabilities and knowledge areas.
- When asked about topics outside your unit's expertise, acknowledge this and suggest which units might be better positioned to address the query.
`;
        return prompt;
    }
    /**
     * Generate a user message prompt template for agent
     * @param unit - Organizational unit
     * @returns User message template
     */
    generateUnitAgentUserPrompt(unit) {
        return `[TASK CONTEXT]
Unit: ${unit.name}
Task ID: {{taskId}}
Task Name: {{taskName}}
Task Description: {{taskDescription}}

[PREVIOUS CONTEXT]
{{previousContext}}

[TASK INPUT]
{{taskInput}}

Please respond to this task from the perspective of the ${unit.name} unit, using your specific expertise and capabilities.
`;
    }
    /**
     * Normalize a unit name into an agent type string
     * @param unitName - Name of the unit
     * @returns Normalized agent type
     */
    normalizeUnitTypeForAgent(unitName) {
        return unitName
            .toLowerCase()
            .replace(/[^a-z0-9_\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }
}
exports.UnitAgentFactory = UnitAgentFactory;
//# sourceMappingURL=UnitAgentFactory.js.map