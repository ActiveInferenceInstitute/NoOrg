"use strict";
/**
 * WorkflowBuilder module
 *
 * Provides functionality to define and create workflows between organizational units.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowBuilder = void 0;
const uuid_1 = require("uuid");
/**
 * WorkflowBuilder class
 * Provides a fluent interface for building unit workflows
 */
class WorkflowBuilder {
    /**
     * Create a new WorkflowBuilder
     * @param name - Workflow name
     * @param description - Workflow description
     * @param logger - Logger instance
     */
    constructor(name = 'Unit Workflow', description = 'Workflow between organizational units', logger = console) {
        this.workflow = {
            id: (0, uuid_1.v4)(),
            name,
            description,
            collaborations: [],
            status: 'pending',
            metadata: {}
        };
        this.logger = logger;
    }
    /**
     * Set the name of the workflow
     * @param name - Workflow name
     * @returns This builder instance for chaining
     */
    withName(name) {
        this.workflow.name = name;
        return this;
    }
    /**
     * Set the description of the workflow
     * @param description - Workflow description
     * @returns This builder instance for chaining
     */
    withDescription(description) {
        this.workflow.description = description;
        return this;
    }
    /**
     * Add a planning phase to the workflow
     * @param config - Planning phase configuration
     * @returns This builder instance for chaining
     */
    withPlanningPhase(config) {
        this.planningPhaseConfig = config;
        return this;
    }
    /**
     * Add an execution phase to the workflow
     * @param config - Execution phase configuration
     * @returns This builder instance for chaining
     */
    withExecutionPhase(config) {
        this.executionPhaseConfig = config;
        return this;
    }
    /**
     * Add metadata to the workflow
     * @param key - Metadata key
     * @param value - Metadata value
     * @returns This builder instance for chaining
     */
    withMetadata(key, value) {
        this.workflow.metadata = this.workflow.metadata || {};
        this.workflow.metadata[key] = value;
        return this;
    }
    /**
     * Build the workflow
     * @returns Built workflow
     */
    build() {
        // Create planning phase if configured
        if (this.planningPhaseConfig) {
            this.createPlanningPhase();
        }
        // Create execution phase if configured
        if (this.executionPhaseConfig) {
            this.createExecutionPhase();
        }
        this.logger.log(`Built workflow: ${this.workflow.name} (ID: ${this.workflow.id})`);
        return { ...this.workflow };
    }
    /**
     * Create planning phase based on configuration
     */
    createPlanningPhase() {
        if (!this.planningPhaseConfig)
            return;
        const config = this.planningPhaseConfig;
        // Create planning phase
        const planningPhase = {
            id: (0, uuid_1.v4)(),
            name: 'Planning Phase',
            status: 'pending',
            leadUnitId: config.leadUnit,
            participatingUnitIds: [config.leadUnit, config.collaboratorUnit],
            outputType: config.outputType || 'implementation_plan',
            metadata: config.metadata || {}
        };
        // Add phase to workflow
        this.workflow.planningPhase = planningPhase;
        // Add collaboration for planning phase
        const collaboration = {
            phase: 'planning',
            units: [config.leadUnit, config.collaboratorUnit],
            outputType: config.outputType || 'implementation_plan',
            status: 'pending'
        };
        this.workflow.collaborations.push(collaboration);
        this.logger.log(`Added planning phase to workflow ${this.workflow.id}`);
    }
    /**
     * Create execution phase based on configuration
     */
    createExecutionPhase() {
        if (!this.executionPhaseConfig)
            return;
        const config = this.executionPhaseConfig;
        // Create execution phase
        const executionPhase = {
            id: (0, uuid_1.v4)(),
            name: 'Execution Phase',
            status: 'pending',
            leadUnitId: config.coordinatorUnit,
            participatingUnitIds: [config.coordinatorUnit, ...config.executorUnits],
            outputType: config.outputType || 'implementation_report',
            metadata: config.metadata || {}
        };
        // Add phase to workflow
        this.workflow.executionPhase = executionPhase;
        // Add collaboration for execution phase - coordinator with each executor
        for (const executorUnit of config.executorUnits) {
            const collaboration = {
                phase: 'execution',
                units: [config.coordinatorUnit, executorUnit],
                outputType: 'unit_implementation',
                status: 'pending'
            };
            this.workflow.collaborations.push(collaboration);
        }
        // Add final collaboration for consolidation
        const finalCollaboration = {
            phase: 'execution_consolidation',
            units: [config.coordinatorUnit, ...config.executorUnits],
            outputType: config.outputType || 'implementation_report',
            status: 'pending'
        };
        this.workflow.collaborations.push(finalCollaboration);
        this.logger.log(`Added execution phase to workflow ${this.workflow.id} with ${config.executorUnits.length} executor units`);
    }
}
exports.WorkflowBuilder = WorkflowBuilder;
//# sourceMappingURL=WorkflowBuilder.js.map