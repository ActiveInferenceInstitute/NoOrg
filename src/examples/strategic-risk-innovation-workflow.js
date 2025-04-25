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

const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Import core components
const { AgentRegistry } = require('../core/multiagent/AgentRegistry');
const { MultiAgentCoordinator } = require('../core/multiagent/MultiAgentCoordinator');
const { TaskManager } = require('../core/multiagent/TaskManager');
const { SharedStateManager } = require('../core/multiagent/SharedStateManager');

// Import organizational unit components
const { DefaultOrganizationalStructureManager } = require('../core/units/OrganizationalStructureManager');
const { DefaultOrganizationalCompositionManager } = require('../core/units/OrganizationalCompositionManager');
const { UnitDeploymentManager } = require('../core/units/UnitDeploymentManager');

// Load environment variables
dotenv.config();

/**
 * Orchestrates the workflow between organizational units
 */
class OrganizationalWorkflowManager {
  constructor(
    structureManager,
    compositionManager,
    deploymentManager,
    sharedStateManager,
    agentRegistry,
    taskManager
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
  async createWorkflow(name, description, metadata = {}) {
    const id = uuidv4();
    
    const workflow = {
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
    workflowId,
    name,
    description,
    unitId,
    agentIds,
    dependsOn = []
  ) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    const stepId = uuidv4();
    const step = {
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
  async startWorkflow(workflowId) {
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
  async executeWorkflowStep(workflowId, stepId) {
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
      
      const taskIds = [];
      
      // Create tasks for each agent
      for (const agentId of step.agentIds) {
        const agent = await this.agentRegistry.getAgent(agentId);
        const taskDescription = taskDescriptions[agent.type] || 
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
      }
      
      // Simulate execution of these tasks
      const results = await this.simulateAgentExecution(step, workflow, taskIds);
      
      // Update step with results
      step.status = 'completed';
      step.output = results;
      step.completedAt = Date.now();
      workflow.steps[stepIndex] = step;
      this.workflows.set(workflowId, workflow);
      
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.status`, 'completed');
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.output`, results);
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.completedAt`, step.completedAt);
      
      // Check for next steps that can be executed
      await this.checkAndExecuteNextSteps(workflowId, stepId);
      
      // Check if workflow is completed
      await this.checkWorkflowCompletion(workflowId);
    } catch (error) {
      console.error(`Error executing step ${step.name}: ${error.message}`);
      
      // Update step with error
      step.status = 'failed';
      step.error = error.message;
      workflow.steps[stepIndex] = step;
      this.workflows.set(workflowId, workflow);
      
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.status`, 'failed');
      await this.sharedStateManager.setState(`workflows.${workflowId}.steps.${stepId}.error`, error.message);
      
      // Mark workflow as failed
      workflow.status = 'failed';
      workflow.error = `Step ${step.name} failed: ${error.message}`;
      this.workflows.set(workflowId, workflow);
      
      await this.sharedStateManager.setState(`workflows.${workflowId}.status`, 'failed');
      await this.sharedStateManager.setState(`workflows.${workflowId}.error`, workflow.error);
    }
  }
  
  /**
   * Check and execute next steps in the workflow
   */
  async checkAndExecuteNextSteps(workflowId, completedStepId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    // Find steps that depend on the completed step
    const nextSteps = workflow.steps.filter(step => 
      step.status === 'pending' && step.dependsOn.includes(completedStepId)
    );
    
    // For each next step, check if all dependencies are completed
    for (const nextStep of nextSteps) {
      const allDependenciesCompleted = nextStep.dependsOn.every(depId => {
        const depStep = workflow.steps.find(s => s.id === depId);
        return depStep && depStep.status === 'completed';
      });
      
      if (allDependenciesCompleted) {
        await this.executeWorkflowStep(workflowId, nextStep.id);
      }
    }
  }
  
  /**
   * Check if workflow is completed
   */
  async checkWorkflowCompletion(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    // Check if all steps are completed
    const allCompleted = workflow.steps.every(step => step.status === 'completed');
    
    if (allCompleted && workflow.status !== 'completed') {
      workflow.status = 'completed';
      workflow.completedAt = Date.now();
      this.workflows.set(workflowId, workflow);
      
      await this.sharedStateManager.setState(`workflows.${workflowId}.status`, 'completed');
      await this.sharedStateManager.setState(`workflows.${workflowId}.completedAt`, workflow.completedAt);
      
      console.log(`Workflow completed: ${workflow.name}`);
    }
  }
  
  /**
   * Simulate agent execution for demo purposes
   */
  async simulateAgentExecution(step, workflow, taskIds) {
    console.log(`Simulating execution for ${step.name}...`);
    
    // For demo purposes, we'll return different results based on the step type
    const results = {};
    
    // Simulate strategy planning
    if (step.name.includes('Strategy Planning')) {
      results.strategicPlan = {
        title: "Knowledge Engineering Innovation Project",
        objectives: [
          "Develop a comprehensive knowledge engineering system",
          "Incorporate latest AI advancements",
          "Ensure scalability and modularity",
          "Target key enterprise clients in finance and healthcare"
        ],
        timeline: "Q4 2023 - Q2 2024",
        budget: "$1.2M",
        kpis: [
          "System accuracy > 95%",
          "Processing time < 100ms",
          "Client satisfaction > 4.5/5"
        ]
      };
    } 
    // Simulate risk assessment
    else if (step.name.includes('Risk Assessment')) {
      results.riskAssessment = {
        overallRiskLevel: "Medium",
        keyRisks: [
          {
            category: "Technical",
            description: "Integration complexity with legacy systems",
            probability: 0.7,
            impact: 0.6,
            severity: "Medium-High",
            mitigationStrategy: "Develop robust APIs and middleware"
          },
          {
            category: "Market",
            description: "Potential market saturation in target sectors",
            probability: 0.4,
            impact: 0.8,
            severity: "Medium",
            mitigationStrategy: "Differentiate with unique AI capabilities"
          },
          {
            category: "Regulatory",
            description: "Evolving AI regulatory landscape",
            probability: 0.9,
            impact: 0.7,
            severity: "High",
            mitigationStrategy: "Establish regulatory tracking system"
          }
        ],
        recommendations: [
          "Conduct monthly regulatory assessments",
          "Establish dedicated technical QA team",
          "Develop comprehensive risk mitigation plan"
        ]
      };
    }
    // Simulate risk advisory review
    else if (step.name.includes('Risk Advisory Review')) {
      results.advisoryReview = {
        endorsement: "Conditional Approval",
        comments: [
          "Strategic objectives align with organizational goals",
          "Technical risk assessment is thorough",
          "Recommend enhancing regulatory compliance monitoring",
          "Budget constraints may affect quality assurance processes"
        ],
        additionalMitigations: [
          "Allocate 15% of budget to compliance measures",
          "Develop quarterly risk reassessment protocol",
          "Establish executive oversight committee"
        ],
        conclusion: "Project may proceed with implementation of recommended measures"
      };
    }
    // Simulate innovation planning
    else if (step.name.includes('Innovation Planning')) {
      results.innovationPlan = {
        coreComponents: [
          "Knowledge graph architecture",
          "Machine learning inference engine",
          "Natural language processing module",
          "Explainable AI framework"
        ],
        innovativeFeatures: [
          "Self-healing data structures",
          "Adaptive reasoning algorithms",
          "Contextual understanding engine",
          "Multi-modal knowledge integration"
        ],
        implementationApproach: {
          phase1: "Core architecture development (8 weeks)",
          phase2: "Module integration and testing (12 weeks)",
          phase3: "Pilot deployment with key clients (6 weeks)",
          phase4: "Feedback incorporation and refinement (4 weeks)"
        },
        technicalRoadmap: {
          q1: "Architecture and core components",
          q2: "Integration and testing framework",
          q3: "Initial client deployment",
          q4: "Feature expansion and ecosystem development"
        }
      };
    }
    // Simulate knowledge engineering implementation
    else if (step.name.includes('Knowledge Engineering')) {
      results.knowledgeEngineering = {
        ontologyStructure: {
          domains: ["Finance", "Healthcare", "Enterprise", "Regulatory"],
          relationships: 27,
          entityTypes: 48,
          axioms: 156
        },
        knowledgeAcquisition: {
          automated: "80%",
          manual: "20%",
          sources: ["Industry databases", "Regulatory documents", "Academic research", "Expert interviews"]
        },
        reasoningSystem: {
          inferenceTypes: ["Deductive", "Inductive", "Abductive"],
          uncertaintyHandling: "Bayesian networks + fuzzy logic",
          performanceMetrics: {
            accuracy: "94.7%",
            recall: "91.2%",
            precision: "96.3%",
            f1Score: "93.8%"
          }
        },
        deliverables: [
          "Core knowledge graph (3M nodes, 12M edges)",
          "Domain-specific reasoning modules",
          "Knowledge maintenance workflows",
          "Integration APIs for client systems"
        ]
      };
    }
    
    // Mark all tasks as completed
    for (const taskId of taskIds) {
      await this.taskManager.completeTask(taskId, { success: true, data: results });
    }
    
    return results;
  }
  
  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    return workflow;
  }
  
  /**
   * Get all workflows
   */
  async getAllWorkflows() {
    return Array.from(this.workflows.values());
  }
}

/**
 * Run a strategic innovation workflow
 */
async function runStrategicInnovationWorkflow() {
  console.log("Initializing Strategic Innovation Workflow...");
  
  // Initialize core components
  const sharedStateManager = new SharedStateManager();
  const agentRegistry = new AgentRegistry();
  const taskManager = new TaskManager();
  
  // Initialize organizational unit components
  const structureManager = new DefaultOrganizationalStructureManager();
  const compositionManager = new DefaultOrganizationalCompositionManager(structureManager);
  
  // Create MultiAgentCoordinator
  const coordinator = new MultiAgentCoordinator("StrategicInnovationWorkflow", {
    agentRegistry: agentRegistry,
    taskManager: taskManager,
    sharedStateManager: sharedStateManager
  });
  
  // Initialize deployment manager
  const deploymentManager = new UnitDeploymentManager(
    structureManager,
    compositionManager,
    agentRegistry,
    coordinator,
    taskManager
  );
  
  // Initialize workflow manager
  const workflowManager = new OrganizationalWorkflowManager(
    structureManager,
    compositionManager,
    deploymentManager,
    sharedStateManager,
    agentRegistry,
    taskManager
  );
  
  // Define the organizational units
  const units = [
    { name: "Strategy Unit", description: "Sets strategic direction and plans", capabilities: [{ name: "strategic_planning", level: 5 }, { name: "market_analysis", level: 4 }] },
    { name: "Risk Management Unit", description: "Assesses and mitigates risks", capabilities: [{ name: "risk_analysis", level: 5 }, { name: "risk_mitigation", level: 4 }] },
    { name: "Risk Advisory Board", description: "Provides risk governance and advisory", capabilities: [{ name: "governance", level: 5 }, { name: "compliance", level: 4 }] },
    { name: "Innovation Unit", description: "Drives innovation initiatives", capabilities: [{ name: "innovation", level: 5 }, { name: "implementation", level: 4 }] },
    { name: "Knowledge Management Unit", description: "Manages knowledge engineering", capabilities: [{ name: "knowledge_engineering", level: 5 }, { name: "content_curation", level: 4 }] }
  ];
  
  // Create units
  const unitIds = {};
  for (const unit of units) {
    const unitId = await structureManager.createUnit(unit);
    unitIds[unit.name] = unitId;
    console.log(`Created ${unit.name} with ID: ${unitId}`);
  }
  
  // Create relationships between units
  await structureManager.createUnitRelationship(
    unitIds["Strategy Unit"], 
    unitIds["Risk Management Unit"], 
    "reporting",
    "Strategy submits plans to Risk Management for assessment"
  );
  
  await structureManager.createUnitRelationship(
    unitIds["Risk Management Unit"], 
    unitIds["Risk Advisory Board"], 
    "advisory",
    "Risk Management consults Advisory Board for guidance"
  );
  
  await structureManager.createUnitRelationship(
    unitIds["Strategy Unit"], 
    unitIds["Innovation Unit"], 
    "reporting",
    "Strategy directs Innovation on project implementation"
  );
  
  await structureManager.createUnitRelationship(
    unitIds["Innovation Unit"], 
    unitIds["Knowledge Management Unit"], 
    "collaboration",
    "Innovation and Knowledge Management collaborate on implementation"
  );
  
  // Define the agents for each unit (two per unit as requested)
  const agents = [
    { name: "Strategic Planner", type: "strategy_planner", unitId: unitIds["Strategy Unit"] },
    { name: "Market Analyst", type: "strategy_analyst", unitId: unitIds["Strategy Unit"] },
    { name: "Risk Assessor", type: "risk_assessor", unitId: unitIds["Risk Management Unit"] },
    { name: "Risk Mitigator", type: "risk_mitigator", unitId: unitIds["Risk Management Unit"] },
    { name: "Governance Advisor", type: "risk_advisor", unitId: unitIds["Risk Advisory Board"] },
    { name: "Compliance Officer", type: "risk_governance", unitId: unitIds["Risk Advisory Board"] },
    { name: "Innovation Specialist", type: "innovation_specialist", unitId: unitIds["Innovation Unit"] },
    { name: "Implementation Lead", type: "innovation_implementer", unitId: unitIds["Innovation Unit"] },
    { name: "Knowledge Engineer", type: "knowledge_engineer", unitId: unitIds["Knowledge Management Unit"] },
    { name: "Content Curator", type: "knowledge_curator", unitId: unitIds["Knowledge Management Unit"] }
  ];
  
  // Register agents and assign to units
  const agentIds = {};
  for (const agentDef of agents) {
    // Register the agent
    const agent = {
      id: uuidv4(),
      name: agentDef.name,
      type: agentDef.type,
      capabilities: [], // Will be filled based on unit capabilities
      status: {
        state: "available",
        lastUpdated: Date.now(),
        healthStatus: {
          isHealthy: true,
          errors: [],
          lastHeartbeat: Date.now()
        }
      },
      metadata: { unitId: agentDef.unitId }
    };
    
    // Get unit capabilities
    const unit = await structureManager.getUnit(agentDef.unitId);
    agent.capabilities = unit.capabilities;
    
    // Register the agent
    const agentId = await agentRegistry.registerAgent(agent);
    agentIds[agentDef.name] = agentId;
    
    // Assign agent to its unit
    await structureManager.assignAgentToUnit(agentDef.unitId, agentId);
    
    console.log(`Registered agent ${agentDef.name} with ID: ${agentId}`);
  }
  
  // Create a workflow
  const workflowId = await workflowManager.createWorkflow(
    "Strategic Knowledge Engineering Project",
    "A comprehensive innovation project focused on knowledge engineering with integrated risk assessment",
    { domain: "Knowledge Engineering", complexity: "High" }
  );
  
  console.log(`Created workflow with ID: ${workflowId}`);
  
  // Add workflow steps with dependencies
  // Step 1: Strategy Planning (no dependencies)
  const step1Id = await workflowManager.addWorkflowStep(
    workflowId,
    "Strategy Planning",
    "Develop initial strategic plan for the knowledge engineering project",
    unitIds["Strategy Unit"],
    [agentIds["Strategic Planner"], agentIds["Market Analyst"]]
  );
  
  // Step 2: Risk Assessment (depends on Strategy Planning)
  const step2Id = await workflowManager.addWorkflowStep(
    workflowId,
    "Risk Assessment",
    "Analyze risks associated with the strategic plan",
    unitIds["Risk Management Unit"],
    [agentIds["Risk Assessor"], agentIds["Risk Mitigator"]],
    [step1Id]
  );
  
  // Step 3: Risk Advisory Review (depends on Risk Assessment)
  const step3Id = await workflowManager.addWorkflowStep(
    workflowId,
    "Risk Advisory Review",
    "Review risk assessment and provide governance oversight",
    unitIds["Risk Advisory Board"],
    [agentIds["Governance Advisor"], agentIds["Compliance Officer"]],
    [step2Id]
  );
  
  // Step 4: Innovation Planning (depends on Risk Advisory Review)
  const step4Id = await workflowManager.addWorkflowStep(
    workflowId,
    "Innovation Planning",
    "Develop innovation plan based on approved strategy",
    unitIds["Innovation Unit"],
    [agentIds["Innovation Specialist"], agentIds["Implementation Lead"]],
    [step3Id]
  );
  
  // Step 5: Knowledge Engineering Implementation (depends on Innovation Planning)
  const step5Id = await workflowManager.addWorkflowStep(
    workflowId,
    "Knowledge Engineering Implementation",
    "Implement knowledge engineering components",
    unitIds["Knowledge Management Unit"],
    [agentIds["Knowledge Engineer"], agentIds["Content Curator"]],
    [step4Id]
  );
  
  // Start the workflow
  await workflowManager.startWorkflow(workflowId);
  
  // Wait a bit to allow workflow to complete (simulated)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Get the workflow status
  const workflowStatus = await workflowManager.getWorkflowStatus(workflowId);
  
  console.log("\n===== Workflow Final Status =====");
  console.log(`Workflow: ${workflowStatus.name}`);
  console.log(`Status: ${workflowStatus.status}`);
  
  if (workflowStatus.completedAt) {
    console.log(`Completed at: ${new Date(workflowStatus.completedAt).toLocaleString()}`);
    console.log(`Duration: ${(workflowStatus.completedAt - workflowStatus.startedAt) / 1000} seconds`);
  }
  
  console.log("\n===== Workflow Step Results =====");
  for (const step of workflowStatus.steps) {
    console.log(`\nStep: ${step.name}`);
    console.log(`Status: ${step.status}`);
    
    if (step.output) {
      console.log("Output Summary:");
      Object.keys(step.output).forEach(key => {
        console.log(`- ${key}: [${typeof step.output[key] === 'object' ? 'Complex object' : step.output[key]}]`);
      });
    }
  }
  
  console.log("\n===== Units and Agents =====");
  for (const unitName in unitIds) {
    const unitId = unitIds[unitName];
    const unit = await structureManager.getUnit(unitId);
    
    console.log(`\nUnit: ${unit.name}`);
    console.log(`Capabilities: ${unit.capabilities.map(c => c.name).join(', ')}`);
    console.log(`Agents: ${unit.agents.length}`);
    
    for (const agentId of unit.agents) {
      const agent = await agentRegistry.getAgent(agentId);
      console.log(`- ${agent.name} (${agent.type})`);
    }
  }
  
  return {
    workflow: workflowId,
    units: unitIds,
    agents: agentIds
  };
}

// Export the function so it can be run from the command line
module.exports = { runStrategicInnovationWorkflow };

// If this file is being run directly, execute the workflow
if (require.main === module) {
  runStrategicInnovationWorkflow().catch(error => {
    console.error("Error running workflow:", error);
  });
} 