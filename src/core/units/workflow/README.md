# Unit Workflow System

The Unit Workflow System provides workflow execution capabilities for organizational units with support for DAG-based task dependencies, conditional execution, and versioning.

## Overview

This directory contains:
- **WorkflowEngine**: Complete workflow execution engine
- **WorkflowBuilder**: Fluent interface for building workflows

## Components

### WorkflowEngine

Complete workflow execution engine with:
- DAG-based task dependencies
- Conditional execution
- Task retries and timeouts
- Workflow templates
- Versioning support
- State persistence

### WorkflowBuilder

Fluent interface for building workflows:
- Planning phase configuration
- Execution phase configuration
- Collaboration setup
- Metadata management

## Usage

### Creating Workflows

```typescript
import { WorkflowBuilder } from './WorkflowBuilder';

const workflow = new WorkflowBuilder('Project Workflow', 'Multi-unit collaboration')
  .withPlanningPhase({
    leadUnit: 'Strategy',
    collaboratorUnit: 'Research'
  })
  .withExecutionPhase({
    coordinatorUnit: 'Operations',
    executorUnits: ['Development', 'Quality']
  })
  .build();
```text

### Executing Workflows

```typescript
import { WorkflowEngine } from './WorkflowEngine';

const engine = new WorkflowEngine();

// Create workflow
const workflow = await engine.createWorkflow({
  name: 'Data Analysis Workflow',
  tasks: [
    {
      id: 'task-1',
      name: 'Data Collection',
      unitId: 'Research',
      action: 'collect',
      dependencies: []
    },
    {
      id: 'task-2',
      name: 'Data Analysis',
      unitId: 'Analysis',
      action: 'analyze',
      dependencies: ['task-1']
    }
  ]
});

// Execute workflow
await engine.executeWorkflow(workflow.id);
```text

## Integration

The workflow system integrates with:
- **Event System**: Publishes workflow events
- **Storage System**: Persists workflow state
- **Units System**: Manages unit workflows

## Related Documentation

- [Workflow AGENTS.md](./AGENTS.md)
- [Units System](../../units/README.md)
