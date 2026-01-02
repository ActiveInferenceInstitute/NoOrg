# Visualization Utilities

Utilities for generating visual representations of workflows and organizational structures.

## Overview

Provides visualization capabilities for:
- Workflow diagrams (DOT, Mermaid)
- Organizational structure diagrams
- Workflow statistics and analytics

## Components

### WorkflowVisualizer

Generates visual representations of workflows.

**Key Features:**
- DOT format generation for Graphviz
- Mermaid diagram generation
- Workflow statistics
- Task dependency visualization

## Usage

```typescript
import { generateWorkflowMermaid } from './workflowVisualizer';

const mermaid = generateWorkflowMermaid(workflow);
console.log(mermaid);
```

## Related Documentation

- [Visualization AGENTS.md](./AGENTS.md)
- [Utils Documentation](../README.md)
