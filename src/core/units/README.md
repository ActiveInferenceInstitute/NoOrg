# Organizational Units Framework

This module provides a framework for creating organizational structures that can be used with the multiagent system. It allows for creating multiagent compositions that mirror real-world organizational structures.

## Overview

The Organizational Units framework allows you to:

1. **Create hierarchical organizational structures** with units, departments, teams, etc.
2. **Define relationships between units** such as reporting, collaboration, service, and advisory relationships
3. **Assign capabilities to units** to define their areas of expertise
4. **Create compositions of units** for specific projects or tasks
5. **Deploy compositions as multiagent systems** with agents automatically created based on unit capabilities
6. **Orchestrate workflows across units** with specialized agents working together in a defined sequence

## Core Components

The framework consists of the following core components:

### Organizational Structure Manager

The `OrganizationalStructureManager` manages the organizational units and their relationships:

- Create, update, and delete units
- Assign agents and tasks to units
- Create relationships between units
- Query units by various criteria

### Organizational Composition Manager

The `OrganizationalCompositionManager` manages compositions of organizational units:

- Create compositions that include selected units
- Update and modify compositions
- Add and remove units from compositions
- Export and import compositions

### Unit Deployment Manager

The `UnitDeploymentManager` handles the deployment of compositions as multiagent systems:

- Deploy compositions by creating agents for each unit
- Create agents based on unit capabilities
- Create coordinator tasks for deployed compositions
- Terminate and manage deployments

### Organizational Workflow Manager

The `OrganizationalWorkflowManager` orchestrates workflows across organizational units:

- Create multi-step workflows with dependencies between steps
- Assign specialized agents from different units to each step
- Execute steps in the correct sequence based on dependencies
- Share outputs between workflow steps
- Track workflow status and results

## Usage Examples

### Creating an Organizational Structure

```typescript
// Initialize the structure manager
const structureManager = new DefaultOrganizationalStructureManager();

// Create a company unit
const companyId = await structureManager.createUnit({
  name: 'Acme Corp',
  description: 'A fictional company',
  capabilities: [
    { name: 'strategy', level: 5 }
  ]
});

// Create a department under the company
const engineeringId = await structureManager.createUnit({
  name: 'Engineering',
  description: 'Engineering department',
  capabilities: [
    { name: 'software_development', level: 5 },
    { name: 'system_design', level: 4 }
  ],
  parent: companyId
});

// Create a team under the department
const frontendId = await structureManager.createUnit({
  name: 'Frontend Team',
  description: 'Frontend development team',
  capabilities: [
    { name: 'ui_development', level: 4 },
    { name: 'react', level: 5 }
  ],
  parent: engineeringId
});
```text

### Creating and Deploying a Composition

```typescript
// Initialize managers
const structureManager = new DefaultOrganizationalStructureManager();
const compositionManager = new DefaultOrganizationalCompositionManager(structureManager);
const deploymentManager = new UnitDeploymentManager(
  structureManager,
  compositionManager,
  agentRegistry,
  coordinator,
  taskManager
);

// Create a composition with specific units
const compositionId = await compositionManager.createComposition(
  'Project X',
  'A new project',
  [frontendTeamId, backendTeamId, designTeamId]
);

// Deploy the composition as a multiagent system
const deploymentId = await deploymentManager.deployComposition({
  compositionId,
  name: 'Project X Deployment',
  description: 'Deployment of Project X team',
  includeDefaultAgents: true
});

// Get the deployment status
const deployment = await deploymentManager.getDeploymentStatus(deploymentId);
console.log(`Created ${deployment.createdAgents.length} agents`);
```text

### Creating and Executing a Workflow

```typescript
// Initialize workflow manager
const workflowManager = new OrganizationalWorkflowManager(
  structureManager,
  compositionManager,
  deploymentManager,
  sharedStateManager,
  agentRegistry,
  taskManager
);

// Create a workflow
const workflowId = await workflowManager.createWorkflow(
  'Strategic Innovation Project',
  'A project to develop new innovative solutions'
);

// Add workflow steps with dependencies
const planningStepId = await workflowManager.addWorkflowStep(
  workflowId,
  'Strategy Planning',
  'Develop the strategic plan',
  strategyUnitId,
  [strategyPlannerId, strategyAnalystId],
  [] // No dependencies
);

const riskStepId = await workflowManager.addWorkflowStep(
  workflowId,
  'Risk Assessment',
  'Assess risks associated with the plan',
  riskUnitId,
  [riskAssessorId, riskMitigatorId],
  [planningStepId] // Depends on planning step
);

const implementationStepId = await workflowManager.addWorkflowStep(
  workflowId,
  'Implementation',
  'Implement the approved plan',
  implementationUnitId,
  [implementerId],
  [riskStepId] // Depends on risk assessment
);

// Start the workflow
await workflowManager.startWorkflow(workflowId);

// Get workflow status
const workflow = await workflowManager.getWorkflowStatus(workflowId);
console.log(`Workflow status: ${workflow.status}`);
```text

## Complex Workflow Example

The framework supports complex workflows involving multiple organizational units working together. For example, a strategic innovation project might involve:

1. Strategy unit sets the initial plan
2. Risk Management analyzes the plan with input from the Risk Advisory Board
3. Innovation unit implements the approved plan
4. Knowledge Management unit handles technical aspects

Each unit contributes specialized agents to the workflow, with steps executed in sequence based on dependencies. Outputs from earlier steps are available to later steps, enabling coherent progression through the workflow.

## Strategic Innovation Workflow Implementation

We have implemented a comprehensive example that demonstrates the organizational workflow orchestration in the file `strategic-risk-innovation-workflow.js`. This example shows how five organizational units with specialized agents can collaborate on a knowledge engineering project:

### Workflow Steps and Dependencies

The workflow includes the following steps, with clear dependencies between them:

1. **Strategy Planning**
   - Executed by: Strategy Unit (Strategic Planner, Market Analyst)
   - Output: Strategic plan with objectives, timeline, budget, and KPIs
   - Dependencies: None (first step)

2. **Risk Assessment**
   - Executed by: Risk Management Unit (Risk Assessor, Risk Mitigator)
   - Output: Risk assessment with identified risks, severity ratings, and mitigation strategies
   - Dependencies: Strategy Planning (needs the strategic plan to assess)

3. **Risk Advisory Review**
   - Executed by: Risk Advisory Board (Governance Advisor, Compliance Officer)
   - Output: Advisory review with endorsement status, comments, and additional mitigations
   - Dependencies: Risk Assessment (reviews the risk assessment document)

4. **Innovation Planning**
   - Executed by: Innovation Unit (Innovation Specialist, Implementation Lead)
   - Output: Innovation plan with implementation approach and technical roadmap
   - Dependencies: Risk Advisory Review (waits for approval from the board)

5. **Knowledge Engineering Implementation**
   - Executed by: Knowledge Management Unit (Knowledge Engineer, Content Curator)
   - Output: Knowledge engineering implementation details including ontology structure
   - Dependencies: Innovation Planning (follows the approved innovation plan)

### Agent Specialization

Each organizational unit provides specialized agents with specific roles:

- **Strategy Unit**
  - Strategic Planner: Develops strategic plans
  - Market Analyst: Provides market insights

- **Risk Management Unit**
  - Risk Assessor: Evaluates potential risks
  - Risk Mitigator: Develops mitigation strategies

- **Risk Advisory Board**
  - Governance Advisor: Provides governance oversight
  - Compliance Officer: Ensures regulatory compliance

- **Innovation Unit**
  - Innovation Specialist: Develops innovative solutions
  - Implementation Lead: Manages implementation details

- **Knowledge Management Unit**
  - Knowledge Engineer: Develops knowledge structures
  - Content Curator: Organizes and categorizes knowledge

### Workflow Execution and Output Sharing

The workflow demonstrates how outputs from earlier steps are shared with later steps:

1. The Strategic Plan created in step 1 is passed to the Risk Management Unit for assessment
2. The Risk Assessment from step 2 is reviewed by the Risk Advisory Board
3. The approved plan with risk mitigations is used by the Innovation Unit
4. The Innovation Plan guides the Knowledge Engineering implementation

This structured approach enables a comprehensive process that mirrors real-world organizational decision-making and project execution, with proper checks and balances through risk assessment and governance review.

### Running the Example

You can run this example with:

```javascript
const { runStrategicInnovationWorkflow } = require('./examples/strategic-risk-innovation-workflow');

runStrategicInnovationWorkflow()
  .then(result => {
    console.log(`Workflow completed successfully`);
  })
  .catch(error => {
    console.error(`Error running workflow: ${error.message}`);
  });
```text

The example provides detailed console output showing the progression through the workflow steps, the status of each step, and the final results of the workflow.

## Extending the Framework

You can extend the framework by:

1. Creating custom implementations of the manager interfaces
2. Adding new relationship types
3. Creating specialized deployment strategies
4. Implementing domain-specific capabilities
5. Developing custom workflow patterns for specific use cases

For example, you could create:

- A `ProjectBasedDeploymentManager` for project management
- A `ResearchWorkflowManager` specialized for research and development workflows
- A `ComplianceOrchestrator` for regulatory compliance workflows

## Integration with Multiagent System

The organizational units framework integrates with the multiagent system through:

- The `AgentRegistry` for managing agents
- The `TaskManager` for creating and assigning tasks
- The `MultiAgentCoordinator` for coordinating agent activities
- The `SharedStateManager` for sharing state between agents and workflow steps

This integration allows agents to be created and managed based on the organizational structure, mirroring real-world organizational processes.

## Best Practices

1. **Design your organizational structure carefully** - Think about how units should be structured and related
2. **Define clear capabilities for each unit** - This will determine what agents are created
3. **Use compositions for specific tasks or projects** - Don't include unnecessary units
4. **Create specialized agents for each unit** - Each agent should have clear responsibilities
5. **Design workflows with clear dependencies** - Steps should flow naturally from one to the next
6. **Ensure proper information flow between steps** - Later steps should have access to outputs from earlier steps
7. **Monitor workflows and deployments** - Check the performance of deployed agent compositions
8. **Create reusable patterns** - Define templates for common organizational structures and workflows 