/**
 * WorkflowBuilder module
 *
 * Provides functionality to define and create workflows between organizational units.
 */
import { UnitWorkflow } from '../UnitInterface';
/**
 * Configuration for a planning phase
 */
export interface PlanningPhaseConfig {
    leadUnit: string;
    collaboratorUnit: string;
    outputType?: string;
    metadata?: Record<string, any>;
}
/**
 * Configuration for an execution phase
 */
export interface ExecutionPhaseConfig {
    coordinatorUnit: string;
    executorUnits: string[];
    outputType?: string;
    metadata?: Record<string, any>;
}
/**
 * WorkflowBuilder class
 * Provides a fluent interface for building unit workflows
 */
export declare class WorkflowBuilder {
    private workflow;
    private planningPhaseConfig?;
    private executionPhaseConfig?;
    private logger;
    /**
     * Create a new WorkflowBuilder
     * @param name - Workflow name
     * @param description - Workflow description
     * @param logger - Logger instance
     */
    constructor(name?: string, description?: string, logger?: Console);
    /**
     * Set the name of the workflow
     * @param name - Workflow name
     * @returns This builder instance for chaining
     */
    withName(name: string): WorkflowBuilder;
    /**
     * Set the description of the workflow
     * @param description - Workflow description
     * @returns This builder instance for chaining
     */
    withDescription(description: string): WorkflowBuilder;
    /**
     * Add a planning phase to the workflow
     * @param config - Planning phase configuration
     * @returns This builder instance for chaining
     */
    withPlanningPhase(config: PlanningPhaseConfig): WorkflowBuilder;
    /**
     * Add an execution phase to the workflow
     * @param config - Execution phase configuration
     * @returns This builder instance for chaining
     */
    withExecutionPhase(config: ExecutionPhaseConfig): WorkflowBuilder;
    /**
     * Add metadata to the workflow
     * @param key - Metadata key
     * @param value - Metadata value
     * @returns This builder instance for chaining
     */
    withMetadata(key: string, value: any): WorkflowBuilder;
    /**
     * Build the workflow
     * @returns Built workflow
     */
    build(): UnitWorkflow;
    /**
     * Create planning phase based on configuration
     */
    private createPlanningPhase;
    /**
     * Create execution phase based on configuration
     */
    private createExecutionPhase;
}
