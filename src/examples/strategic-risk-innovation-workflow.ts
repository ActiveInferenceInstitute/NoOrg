/**
 * Strategic Innovation Project with Risk Assessment Workflow
 * 
 * This example demonstrates a comprehensive workflow between organizational units:
 * - Strategy unit sets the initial plan
 * - Risk Management analyzes the plan with input from Risk Advisory Board
 * - Innovation unit implements the approved plan
 * - Knowledge Management unit handles knowledge engineering aspects
 * 
 * Each unit has specialized agents with specific roles in the process.
 */

import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Import core components
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { TaskManager } from '../core/multiagent/TaskManager';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';

// Import organizational unit components
import { DefaultOrganizationalStructureManager } from '../core/units/OrganizationalStructureManager';
import { DefaultOrganizationalCompositionManager } from '../core/units/OrganizationalCompositionManager';
import { UnitDeploymentManager } from '../core/units/UnitDeploymentManager';
import { 
  OrganizationalUnit, 
  UnitRelationship,
  UnitConfig 
} from '../core/units/UnitInterface';

// Load environment variables
dotenv.config();

// Specialized workflow orchestration
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  unitId: string;
  agentIds: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  dependsOn: string[];
  output?: any;
  completedAt?: number;
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  metadata: Record<string, any>;
}

/**
 * Orchestrates the workflow between organizational units
 */
class OrganizationalWorkflowManager {
  private structureManager: DefaultOrganizationalStructureManager;
  private compositionManager: DefaultOrganizationalCompositionManager;
  private deploymentManager: UnitDeploymentManager;
  private sharedStateManager: SharedStateManager;
  private agentRegistry: AgentRegistry;
  private taskManager: TaskManager;
  private workflows: Map<string, WorkflowConfig>;
  
  constructor(
    structureManager: DefaultOrganizationalStructureManager,
    compositionManager: DefaultOrganizationalCompositionManager,
    deploymentManager: UnitDeploymentManager,
    sharedStateManager: SharedStateManager,
    agentRegistry: AgentRegistry,
    taskManager: TaskManager
  ) {
    this.structureManager = structureManager;
    this.compositionManager = compositionManager;
    this.deploymentManager = deploymentManager;
    this.sharedStateManager = sharedStateManager;
    this.agentRegistry = agentRegistry;
    this.taskManager = taskManager;
    this.workflows = new Map();
  }
  
  /**
   * Create a new organizational workflow
   */
  async createWorkflow(
    name: string, 
    description: string, 
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const id = uuidv4();
    
    const workflow: WorkflowConfig = {
      id,
      name,
      description,
      steps: [],
      status: 'pending',
      startedAt: Date.now(),
      metadata
    };
    
    this.workflows.set(id, workflow);
    await this.sharedStateManager.setState(`workflows.${id}`, workflow);
    
    return id;
  }
  
  /**
   * Add a step to the workflow
   */
  async addWorkflowStep(
    workflowId: string,
    name: string,
    description: string,
    unitId: string,
    agentIds: string[],
    dependsOn: string[] = []
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    const stepId = uuidv4();
    const step: WorkflowStep = {
      id: stepId,
      name,
      description,
      unitId,
      agentIds,
      status: 'pending',
      dependsOn
    };
    
    workflow.steps.push(step);
    this.workflows.set(workflowId, workflow);
    await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}`, step);
    
    return stepId;
  }
  
  /**
   * Start executing a workflow
   */
  async startWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    workflow.status = 'in-progress';
    this.workflows.set(workflowId, workflow);
    await this.sharedStateManager.setState(`workflows.${workflowId}.status`, 'in-progress');
    
    console.log(`Starting workflow: ${workflow.name}`);
    
    // Start steps that have no dependencies
    for (const step of workflow.steps) {
      if (step.dependsOn.length === 0) {
        await this.executeWorkflowStep(workflowId, step.id);
      }
    }
  }
  
  /**
   * Execute a specific workflow step
   */
  async executeWorkflowStep(workflowId: string, stepId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      throw new Error(`Step with ID ${stepId} not found in workflow ${workflowId}`);
    }
    
    const step = workflow.steps[stepIndex];
    
    // Check if dependencies are completed
    for (const depId of step.dependsOn) {
      const depStep = workflow.steps.find(s => s.id === depId);
      if (!depStep || depStep.status !== 'completed') {
        console.log(`Skipping step ${step.name} as dependencies are not completed`);
        return;
      }
    }
    
    console.log(`Executing step: ${step.name}`);
    
    // Update step status
    step.status = 'in-progress';
    workflow.steps[stepIndex] = step;
    this.workflows.set(workflowId, workflow);
    await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.status`, 'in-progress');
    
    try {
      // Get the unit
      const unit = await this.structureManager.getUnit(step.unitId);
      
      // Create tasks for the agents
      const taskDescriptions = {
        'strategy_planner': `Develop a strategic plan for: ${workflow.name}`,
        'strategy_analyst': `Analyze market conditions for: ${workflow.name}`,
        'risk_assessor': `Assess risks for project: ${workflow.name}`,
        'risk_mitigator': `Develop risk mitigation strategies for: ${workflow.name}`,
        'risk_advisor': `Provide risk advisory insights for: ${workflow.name}`,
        'risk_governance': `Ensure risk governance compliance for: ${workflow.name}`,
        'innovation_specialist': `Develop innovation strategies for: ${workflow.name}`,
        'innovation_implementer': `Implement innovation solutions for: ${workflow.name}`,
        'knowledge_engineer': `Develop knowledge structures for: ${workflow.name}`,
        'knowledge_curator': `Curate and organize knowledge for: ${workflow.name}`
      };
      
      const taskIds: string[] = [];
      
      // Create tasks for each agent
      for (const agentId of step.agentIds) {
        const agent = await this.agentRegistry.getAgent(agentId);
        const taskDescription = taskDescriptions[agent.type as keyof typeof taskDescriptions] || 
          `Perform ${agent.type} activities for: ${workflow.name}`;
        
        const taskId = await this.taskManager.createTask({
          id: uuidv4(),
          type: agent.type,
          title: `${step.name} - ${agent.type}`,
          description: taskDescription,
          status: 'pending',
          priority: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          assignedTo: agentId,
          metadata: {
            workflowId,
            stepId,
            unitId: step.unitId
          }
        });
        
        taskIds.push(taskId);
        
        // Start the task immediately
        await this.taskManager.updateTask(taskId, { status: 'in-progress' });
        
        console.log(`Created task for agent ${agent.name}: ${taskDescription}`);
      }
      
      // Set previous steps' output in shared state so agents can access it
      if (step.dependsOn.length > 0) {
        const dependencies: Record<string, any> = {};
        
        for (const depId of step.dependsOn) {
          const depStep = workflow.steps.find(s => s.id === depId);
          if (depStep && depStep.output) {
            dependencies[depStep.id] = depStep.output;
          }
        }
        
        await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.dependencies`, dependencies);
      }
      
      // Simulate the execution of the tasks by agents
      // In a real implementation, this would involve the agents processing the tasks
      // and generating results through LLM calls
      
      const stepOutput = await this.simulateAgentExecution(step, workflow, taskIds);
      
      // Update step status and output
      step.status = 'completed';
      step.output = stepOutput;
      step.completedAt = Date.now();
      workflow.steps[stepIndex] = step;
      
      // Mark all tasks as completed
      for (const taskId of taskIds) {
        await this.taskManager.updateTask(taskId, { 
          status: 'completed',
          result: {
            success: true,
            data: stepOutput
          }
        });
      }
      
      this.workflows.set(workflowId, workflow);
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}`, step);
      
      console.log(`Completed step: ${step.name}`);
      
      // Check for next steps that depend on this one
      await this.checkAndExecuteNextSteps(workflowId, stepId);
      
      // Check if workflow is completed
      await this.checkWorkflowCompletion(workflowId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing step ${step.name}: ${errorMessage}`);
      
      // Update step status
      step.status = 'failed';
      workflow.steps[stepIndex] = step;
      this.workflows.set(workflowId, workflow);
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.status`, 'failed');
      
      // Mark workflow as failed
      workflow.status = 'failed';
      this.workflows.set(workflowId, workflow);
      await this.sharedStateManager.setState(`workflows.${workflowId}.status`, 'failed');
    }
  }
  
  /**
   * Check and execute next steps in the workflow
   */
  private async checkAndExecuteNextSteps(workflowId: string, completedStepId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    for (const step of workflow.steps) {
      if (step.status === 'pending' && step.dependsOn.includes(completedStepId)) {
        // Check if all dependencies are satisfied
        const allDependenciesMet = step.dependsOn.every(depId => {
          const depStep = workflow.steps.find(s => s.id === depId);
          return depStep && depStep.status === 'completed';
        });
        
        if (allDependenciesMet) {
          await this.executeWorkflowStep(workflowId, step.id);
        }
      }
    }
  }
  
  /**
   * Check if a workflow is completed
   */
  private async checkWorkflowCompletion(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    const allStepsCompleted = workflow.steps.every(step => 
      step.status === 'completed' || step.status === 'failed'
    );
    
    const anyStepFailed = workflow.steps.some(step => step.status === 'failed');
    
    if (allStepsCompleted) {
      workflow.status = anyStepFailed ? 'failed' : 'completed';
      workflow.completedAt = Date.now();
      this.workflows.set(workflowId, workflow);
      await this.sharedStateManager.setState(`workflows.${workflowId}.status`, workflow.status);
      await this.sharedStateManager.setState(`workflows.${workflowId}.completedAt`, workflow.completedAt);
      
      console.log(`Workflow ${workflow.name} ${workflow.status}`);
    }
  }
  
  /**
   * Simulate agent execution (in a real system, this would involve actual LLM calls)
   */
  private async simulateAgentExecution(
    step: WorkflowStep, 
    workflow: WorkflowConfig,
    taskIds: string[]
  ): Promise<any> {
    const unit = await this.structureManager.getUnit(step.unitId);
    
    let output: any;
    
    switch (unit.name) {
      case 'Strategy':
        output = {
          plan: "Strategic plan for knowledge engineering innovation",
          objectives: [
            "Develop a new knowledge graph platform",
            "Integrate with existing content management systems",
            "Create automated knowledge extraction capabilities"
          ],
          timeline: "6 months",
          resources: "2 development teams, 1 research team",
          budget: "$500,000"
        };
        break;
        
      case 'Risk Management':
        output = {
          riskAssessment: "Medium-high risk profile",
          keyRisks: [
            "Technology implementation risks",
            "Integration complexity risks",
            "Resource allocation risks",
            "Timeline risks"
          ],
          mitigationStrategies: [
            "Phase-based implementation approach",
            "Dedicated integration specialists",
            "Regular risk review checkpoints",
            "Contingency budget allocation"
          ],
          recommendedActions: "Proceed with adjustments to timeline and resource allocation"
        };
        break;
        
      case 'Risk Advisory Board':
        output = {
          riskReview: "Advisory review completed",
          governanceAssessment: "Governance structure adequate",
          complianceIssues: "No major compliance issues identified",
          recommendations: [
            "Increase technical oversight",
            "Enhance data governance protocols",
            "Implement weekly risk monitoring"
          ],
          advisoryOpinion: "Proceed with recommended safeguards"
        };
        break;
        
      case 'Innovation':
        output = {
          innovationApproach: "Iterative development with design thinking",
          keyInnovations: [
            "Self-optimizing knowledge graphs",
            "Context-aware knowledge retrieval",
            "Automated knowledge validation"
          ],
          implementationPlan: "Three-phase rollout",
          technicalArchitecture: "Microservices-based platform with ML pipeline",
          expectedOutcomes: "50% increase in knowledge utilization efficiency"
        };
        break;
        
      case 'Knowledge Management':
        output = {
          knowledgeStructure: "Ontology-based knowledge representation",
          taxonomyDevelopment: "Domain-specific taxonomies implemented",
          contentOrganization: "Hierarchical with cross-domain linking",
          metadataSchema: "Extended Dublin Core with domain extensions",
          dataIntegrationApproach: "API-based with ETL pipelines",
          userAccessFramework: "Role-based with contextual permissions"
        };
        break;
        
      default:
        output = {
          generalOutput: "Work completed for step",
          timestamp: Date.now()
        };
    }
    
    // Wait to simulate actual processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return output;
  }
  
  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowConfig> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    return workflow;
  }
  
  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<WorkflowConfig[]> {
    return Array.from(this.workflows.values());
  }
}

/**
 * Main function to run the strategic innovation workflow
 */
async function runStrategicInnovationWorkflow() {
  console.log("Starting Strategic Innovation Project with Risk Assessment...");
  
  // Initialize the core components
  const agentRegistry = new AgentRegistry();
  const taskManager = new TaskManager();
  const sharedStateManager = new SharedStateManager();
  
  // Create the coordinator with the required components
  const coordinator = new MultiAgentCoordinator('StrategicInnovationWorkflow', {
    agentRegistry,
    taskManager,
    sharedStateManager
  });
  
  // Initialize the organizational managers
  const structureManager = new DefaultOrganizationalStructureManager();
  const compositionManager = new DefaultOrganizationalCompositionManager(structureManager);
  const deploymentManager = new UnitDeploymentManager(
    structureManager,
    compositionManager,
    agentRegistry,
    coordinator,
    taskManager
  );
  
  // Initialize the workflow manager
  const workflowManager = new OrganizationalWorkflowManager(
    structureManager,
    compositionManager,
    deploymentManager,
    sharedStateManager,
    agentRegistry,
    taskManager
  );
  
  // Load organizational unit definitions from the units/ directory
  const unitsDir = path.join(process.cwd(), 'units');
  
  // Map of unit names to their capabilities
  const unitCapabilities: Record<string, { name: string, level: number }[]> = {
    'Strategy': [
      { name: 'strategic_planning', level: 5 },
      { name: 'market_analysis', level: 4 },
      { name: 'business_development', level: 4 }
    ],
    'Risk_Management': [
      { name: 'risk_assessment', level: 5 },
      { name: 'risk_mitigation', level: 4 },
      { name: 'compliance_management', level: 4 }
    ],
    'Risk_Advisory_Board': [
      { name: 'risk_governance', level: 5 },
      { name: 'compliance_oversight', level: 4 },
      { name: 'strategic_risk', level: 4 }
    ],
    'Innovation': [
      { name: 'innovation_management', level: 5 },
      { name: 'technology_innovation', level: 4 },
      { name: 'process_innovation', level: 4 }
    ],
    'Knowledge_Management': [
      { name: 'knowledge_engineering', level: 5 },
      { name: 'content_management', level: 4 },
      { name: 'information_architecture', level: 4 }
    ]
  };
  
  // Create the organizational units
  console.log("Creating organizational units...");
  
  const unitIds: Record<string, string> = {};
  const unitDirectories = fs.readdirSync(unitsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Only create units we need for this workflow
  const requiredUnits = ['Strategy', 'Risk_Management', 'Risk_Advisory_Board', 'Innovation', 'Knowledge_Management'];
  
  for (const unitName of requiredUnits) {
    if (unitDirectories.includes(unitName)) {
      const unitMdPath = path.join(unitsDir, unitName, `${unitName.toLowerCase()}_unit.md`);
      let description = `${unitName.replace(/_/g, ' ')} Unit`;
      
      // Try to extract description from markdown if available
      if (fs.existsSync(unitMdPath)) {
        const content = fs.readFileSync(unitMdPath, 'utf8');
        const overviewMatch = content.match(/## Overview\n(.*?)(?=\n\n|\n##)/s);
        if (overviewMatch && overviewMatch[1]) {
          description = overviewMatch[1].trim();
        }
      }
      
      const unitConfig: UnitConfig = {
        name: unitName.replace(/_/g, ' '),
        description,
        capabilities: unitCapabilities[unitName] || [{ name: 'general', level: 3 }]
      };
      
      const unitId = await structureManager.createUnit(unitConfig);
      unitIds[unitName] = unitId;
      
      console.log(`Created unit: ${unitConfig.name} (${unitId})`);
    }
  }
  
  // Create relationships between units
  console.log("Creating unit relationships...");
  
  // Strategy informs Risk Management
  await structureManager.createUnitRelationship(
    unitIds['Strategy'],
    unitIds['Risk_Management'],
    'service',
    'Strategy provides plans to Risk Management for assessment'
  );
  
  // Risk Management consults with Risk Advisory Board
  await structureManager.createUnitRelationship(
    unitIds['Risk_Management'],
    unitIds['Risk_Advisory_Board'],
    'advisory',
    'Risk Management consults with Risk Advisory Board'
  );
  
  // Risk Management informs Innovation
  await structureManager.createUnitRelationship(
    unitIds['Risk_Management'],
    unitIds['Innovation'],
    'service',
    'Risk Management provides risk assessment to Innovation'
  );
  
  // Innovation collaborates with Knowledge Management
  await structureManager.createUnitRelationship(
    unitIds['Innovation'],
    unitIds['Knowledge_Management'],
    'collaboration',
    'Innovation collaborates with Knowledge Management on implementation'
  );
  
  // Create a composition of these units
  console.log("Creating organizational composition...");
  
  const compositionId = await compositionManager.createComposition(
    'Knowledge Engineering Innovation Project',
    'Strategic innovation project for knowledge engineering with risk assessment',
    Object.values(unitIds)
  );
  
  console.log(`Created composition: ${compositionId}`);
  
  // Register specialized agents for each unit
  console.log("Registering specialized agents...");
  
  interface AgentDefinition {
    name: string;
    type: string;
    description: string;
    unitId: string;
  }
  
  const agentDefinitions: AgentDefinition[] = [
    // Strategy agents
    {
      name: 'Strategy Planner',
      type: 'strategy_planner',
      description: 'Develops strategic plans and roadmaps',
      unitId: unitIds['Strategy']
    },
    {
      name: 'Strategy Analyst',
      type: 'strategy_analyst',
      description: 'Analyzes market conditions and opportunities',
      unitId: unitIds['Strategy']
    },
    
    // Risk Management agents
    {
      name: 'Risk Assessor',
      type: 'risk_assessor',
      description: 'Identifies and assesses risks in projects',
      unitId: unitIds['Risk_Management']
    },
    {
      name: 'Risk Mitigator',
      type: 'risk_mitigator',
      description: 'Develops risk mitigation strategies',
      unitId: unitIds['Risk_Management']
    },
    
    // Risk Advisory Board agents
    {
      name: 'Risk Advisor',
      type: 'risk_advisor',
      description: 'Provides high-level risk advisory insights',
      unitId: unitIds['Risk_Advisory_Board']
    },
    {
      name: 'Risk Governance',
      type: 'risk_governance',
      description: 'Ensures compliance with risk governance standards',
      unitId: unitIds['Risk_Advisory_Board']
    },
    
    // Innovation agents
    {
      name: 'Innovation Specialist',
      type: 'innovation_specialist',
      description: 'Develops innovative solutions and approaches',
      unitId: unitIds['Innovation']
    },
    {
      name: 'Innovation Implementer',
      type: 'innovation_implementer',
      description: 'Implements and delivers innovative solutions',
      unitId: unitIds['Innovation']
    },
    
    // Knowledge Management agents
    {
      name: 'Knowledge Engineer',
      type: 'knowledge_engineer',
      description: 'Designs knowledge structures and systems',
      unitId: unitIds['Knowledge_Management']
    },
    {
      name: 'Knowledge Curator',
      type: 'knowledge_curator',
      description: 'Curates and organizes knowledge assets',
      unitId: unitIds['Knowledge_Management']
    }
  ];
  
  const agentIds: Record<string, string> = {};
  
  for (const def of agentDefinitions) {
    const unit = await structureManager.getUnit(def.unitId);
    
    const agentId = await agentRegistry.registerAgent({
      id: uuidv4(),
      name: def.name,
      type: def.type,
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
        unitId: def.unitId,
        unitName: unit.name
      }
    });
    
    agentIds[def.type] = agentId;
    
    // Assign agent to unit
    await structureManager.assignAgentToUnit(def.unitId, agentId);
    
    console.log(`Registered agent: ${def.name} (${agentId}) for unit: ${unit.name}`);
  }
  
  // Create and configure the workflow
  console.log("Creating workflow...");
  
  const workflowId = await workflowManager.createWorkflow(
    'Knowledge Engineering Innovation Project',
    'Strategic innovation project for knowledge engineering with risk assessment',
    { compositionId }
  );
  
  // Add workflow steps
  console.log("Adding workflow steps...");
  
  // Step 1: Strategy Planning
  const strategyStepId = await workflowManager.addWorkflowStep(
    workflowId,
    'Strategy Planning',
    'Develop the strategic plan for the knowledge engineering innovation project',
    unitIds['Strategy'],
    [agentIds['strategy_planner'], agentIds['strategy_analyst']],
    []
  );
  
  // Step 2: Risk Assessment
  const riskStepId = await workflowManager.addWorkflowStep(
    workflowId,
    'Risk Assessment',
    'Assess risks associated with the strategic plan',
    unitIds['Risk_Management'],
    [agentIds['risk_assessor'], agentIds['risk_mitigator']],
    [strategyStepId]
  );
  
  // Step 3: Risk Advisory Review
  const advisoryStepId = await workflowManager.addWorkflowStep(
    workflowId,
    'Risk Advisory Review',
    'Provide advisory input on the risk assessment',
    unitIds['Risk_Advisory_Board'],
    [agentIds['risk_advisor'], agentIds['risk_governance']],
    [riskStepId]
  );
  
  // Step 4: Innovation Planning
  const innovationStepId = await workflowManager.addWorkflowStep(
    workflowId,
    'Innovation Planning',
    'Develop innovation approaches based on strategy and risk assessment',
    unitIds['Innovation'],
    [agentIds['innovation_specialist'], agentIds['innovation_implementer']],
    [advisoryStepId]
  );
  
  // Step 5: Knowledge Engineering Implementation
  const knowledgeStepId = await workflowManager.addWorkflowStep(
    workflowId,
    'Knowledge Engineering Implementation',
    'Implement knowledge engineering solutions based on innovation plan',
    unitIds['Knowledge_Management'],
    [agentIds['knowledge_engineer'], agentIds['knowledge_curator']],
    [innovationStepId]
  );
  
  // Start the workflow
  console.log("Starting workflow execution...");
  await workflowManager.startWorkflow(workflowId);
  
  // Wait for workflow to complete
  console.log("Waiting for workflow to complete...");
  
  let workflow = await workflowManager.getWorkflowStatus(workflowId);
  
  // Check workflow status every second
  while (workflow.status === 'in-progress') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    workflow = await workflowManager.getWorkflowStatus(workflowId);
  }
  
  // Display workflow results
  console.log("\n====================================");
  console.log("WORKFLOW EXECUTION COMPLETED");
  console.log("====================================");
  console.log(`Status: ${workflow.status}`);
  console.log(`Duration: ${(workflow.completedAt! - workflow.startedAt) / 1000} seconds`);
  console.log("\nResults by Unit:");
  
  for (const step of workflow.steps) {
    const unit = await structureManager.getUnit(step.unitId);
    console.log(`\n--- ${unit.name} (${step.name}) ---`);
    console.log(`Status: ${step.status}`);
    
    if (step.output) {
      console.log("Output:");
      console.dir(step.output, { depth: null });
    }
  }
  
  console.log("\n====================================");
  console.log("WORKFLOW SUMMARY");
  console.log("====================================");
  
  const strategyStep = workflow.steps.find(step => step.name === 'Strategy Planning');
  const riskStep = workflow.steps.find(step => step.name === 'Risk Assessment');
  const advisoryStep = workflow.steps.find(step => step.name === 'Risk Advisory Review');
  
  console.log("Strategic Objectives:");
  console.log(strategyStep?.output.objectives.map((o: string) => `- ${o}`).join('\n'));
  
  console.log("\nKey Risks:");
  console.log(riskStep?.output.keyRisks.map((r: string) => `- ${r}`).join('\n'));
  
  console.log("\nRisk Advisory Recommendations:");
  console.log(advisoryStep?.output.recommendations.map((r: string) => `- ${r}`).join('\n'));
  
  console.log("\nWorkflow Completed Successfully!");
}

// Run the example
if (require.main === module) {
  runStrategicInnovationWorkflow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(`Error executing workflow: ${error}`);
      process.exit(1);
    });
}

export { 
  OrganizationalWorkflowManager,
  runStrategicInnovationWorkflow
}; 