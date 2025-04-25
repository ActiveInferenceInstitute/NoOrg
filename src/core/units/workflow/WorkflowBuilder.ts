/**
 * WorkflowBuilder module
 * 
 * Provides functionality to define and create workflows between organizational units.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  UnitWorkflow, 
  UnitWorkflowPhase, 
  UnitCollaboration 
} from '../UnitInterface';

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
export class WorkflowBuilder {
  private workflow: UnitWorkflow;
  private planningPhaseConfig?: PlanningPhaseConfig;
  private executionPhaseConfig?: ExecutionPhaseConfig;
  private logger: Console;

  /**
   * Create a new WorkflowBuilder
   * @param name - Workflow name
   * @param description - Workflow description
   * @param logger - Logger instance
   */
  constructor(
    name: string = 'Unit Workflow',
    description: string = 'Workflow between organizational units',
    logger: Console = console
  ) {
    this.workflow = {
      id: uuidv4(),
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
  public withName(name: string): WorkflowBuilder {
    this.workflow.name = name;
    return this;
  }

  /**
   * Set the description of the workflow
   * @param description - Workflow description
   * @returns This builder instance for chaining
   */
  public withDescription(description: string): WorkflowBuilder {
    this.workflow.description = description;
    return this;
  }

  /**
   * Add a planning phase to the workflow
   * @param config - Planning phase configuration
   * @returns This builder instance for chaining
   */
  public withPlanningPhase(config: PlanningPhaseConfig): WorkflowBuilder {
    this.planningPhaseConfig = config;
    return this;
  }

  /**
   * Add an execution phase to the workflow
   * @param config - Execution phase configuration
   * @returns This builder instance for chaining
   */
  public withExecutionPhase(config: ExecutionPhaseConfig): WorkflowBuilder {
    this.executionPhaseConfig = config;
    return this;
  }

  /**
   * Add metadata to the workflow
   * @param key - Metadata key
   * @param value - Metadata value
   * @returns This builder instance for chaining
   */
  public withMetadata(key: string, value: any): WorkflowBuilder {
    this.workflow.metadata = this.workflow.metadata || {};
    this.workflow.metadata[key] = value;
    return this;
  }

  /**
   * Build the workflow
   * @returns Built workflow
   */
  public build(): UnitWorkflow {
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
  private createPlanningPhase(): void {
    if (!this.planningPhaseConfig) return;
    
    const config = this.planningPhaseConfig;
    
    // Create planning phase
    const planningPhase: UnitWorkflowPhase = {
      id: uuidv4(),
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
    const collaboration: UnitCollaboration = {
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
  private createExecutionPhase(): void {
    if (!this.executionPhaseConfig) return;
    
    const config = this.executionPhaseConfig;
    
    // Create execution phase
    const executionPhase: UnitWorkflowPhase = {
      id: uuidv4(),
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
      const collaboration: UnitCollaboration = {
        phase: 'execution',
        units: [config.coordinatorUnit, executorUnit],
        outputType: 'unit_implementation',
        status: 'pending'
      };
      
      this.workflow.collaborations.push(collaboration);
    }
    
    // Add final collaboration for consolidation
    const finalCollaboration: UnitCollaboration = {
      phase: 'execution_consolidation',
      units: [config.coordinatorUnit, ...config.executorUnits],
      outputType: config.outputType || 'implementation_report',
      status: 'pending'
    };
    
    this.workflow.collaborations.push(finalCollaboration);
    
    this.logger.log(`Added execution phase to workflow ${this.workflow.id} with ${config.executorUnits.length} executor units`);
  }
} 