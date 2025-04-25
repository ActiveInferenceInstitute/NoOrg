# Examples

This directory contains example implementations and demos showcasing how to use the multi-agent operations framework. These examples serve as reference implementations and starting points for building your own applications.

## Available Examples

### Basic Coordination (basic_coordination.ts)

A simple example demonstrating how to set up and coordinate multiple agents for a basic task. Good starting point for new users.

```bash
# Run the basic coordination example
ts-node basic_coordination.ts
```

### Multi-Agent Workflow (multi_agent_workflow.ts)

Demonstrates a complete workflow involving multiple agents working together to achieve a complex task. Shows agent communication and coordination patterns.

```bash
# Run the multi-agent workflow example
ts-node multi_agent_workflow.ts
```

### Organizational Units Demo (organizationalUnitsDemo.js)

Showcases how to structure agents into organizational units that mirror real-world organizational structures. Demonstrates hierarchical communication and decision-making.

```bash
# Run the organizational units demo
node organizationalUnitsDemo.js
```

### Organization Demo (organization-demo.ts)

A TypeScript version of the organizational structure demo with enhanced type safety.

```bash
# Run the organization demo
ts-node organization-demo.ts
```

### Strategic Risk Innovation Workflow (strategic-risk-innovation-workflow.ts/js)

Advanced example showing a complex workflow for strategic planning, risk assessment, and innovation. Available in both JavaScript and TypeScript versions.

```bash
# Run the TypeScript version
ts-node strategic-risk-innovation-workflow.ts

# Run the JavaScript version
node strategic-risk-innovation-workflow.js
```

### Research Workflows

Two examples demonstrating research-focused workflows:

- **Complex Research Workflow** (complex_research_workflow.ts): Multi-stage research process with analysis and synthesis
- **Parallel Research Workflow** (parallel_research_workflow.ts): Research tasks executed in parallel with result aggregation

```bash
# Run the complex research workflow example
ts-node complex_research_workflow.ts

# Run the parallel research workflow example
ts-node parallel_research_workflow.ts
```

### Organizational Planning (run_organizational_planning.js)

Example showing how to use agents for organizational planning tasks.

```bash
# Run the organizational planning example
node run_organizational_planning.js
```

## Running the Examples

Requirements:
- Node.js v18 or higher
- TypeScript (for TS examples)
- Required dependencies installed (`npm install`)

To run a TypeScript example:
```bash
ts-node path/to/example.ts
```

To run a JavaScript example:
```bash
node path/to/example.js
```

## Example Structure

Most examples follow a common structure:

1. **Setup**: Import dependencies and configure the environment
2. **Agent Creation**: Instantiate and initialize the required agents
3. **Task Definition**: Define the tasks to be performed
4. **Execution**: Run the agents on the defined tasks
5. **Result Handling**: Process and display the results

## Creating New Examples

When creating new examples:

1. Start with a clear objective for what the example demonstrates
2. Use descriptive naming for files and functions
3. Include detailed comments explaining key concepts
4. Handle errors gracefully
5. Provide a clean output format for results
6. Document the example in this README

## Related Documentation

- [Main Source Documentation](../README.md)
- [Multiagent Examples README](./Multiagent_Examples_README.md)
- [Agents Documentation](../agents/README.md) 