# Examples Directory

This directory contains example implementations and demonstrations of the multiagent system framework.

## Organizational Unit Examples

### Strategic Risk Innovation Workflow

The [strategic-risk-innovation-workflow.js](./strategic-risk-innovation-workflow.js) example demonstrates a comprehensive workflow between organizational units:

- **Strategy Unit** sets the initial strategic plan
- **Risk Management Unit** analyzes the plan for risks
- **Risk Advisory Board** reviews the risk analysis and provides governance
- **Innovation Unit** develops implementation plans based on approved strategy
- **Knowledge Management Unit** handles knowledge engineering aspects

Each unit has specialized agents with specific roles, and the workflow includes proper sequencing with dependencies between steps.

### Organization Units Demo

The standalone [organization-units-demo.js](../../organization-units-demo.js) in the root directory provides a simplified demonstration of organizational units, their relationships, and workflow, without requiring compilation or runtime dependencies. It shows:

1. Five organizational units with different capabilities
2. Ten specialized agents (two per unit)
3. Relationships between units (reporting, advisory, collaboration)
4. A workflow with five steps and proper dependencies
5. Sample outputs from each step

## Basic Multiagent Examples

### Basic Coordination

The [basic_coordination.ts](./basic_coordination.ts) demonstrates the fundamental coordination capabilities between multiple agents.

### Multi-agent Workflow

The [multi_agent_workflow.ts](./multi_agent_workflow.ts) shows how to create a workflow involving multiple specialized agents working together.

## Running the Examples

To run TypeScript examples:

1. Compile the TypeScript code: `npm run build`
2. Run the compiled JavaScript: `node dist/examples/example_name.js`

To run JavaScript examples:

1. Run directly with Node.js: `node src/examples/example_name.js` or `node example_name.js` (for root directory examples)

## Organization Unit Framework

The organizational unit examples showcase the following components:

1. **OrganizationalStructureManager**: Manages units and their relationships
2. **OrganizationalCompositionManager**: Manages compositions of units
3. **UnitDeploymentManager**: Deploys compositions as multiagent systems
4. **OrganizationalWorkflowManager**: Orchestrates workflows across units

For more detailed information, see the [Organizational Units README](../core/units/README.md). 