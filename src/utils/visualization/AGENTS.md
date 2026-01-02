# Visualization Utilities Technical Documentation

## Functions

### generateWorkflowDOT()

```typescript
export function generateWorkflowDOT(workflow: Workflow): string
```

Generates DOT-formatted graph for Graphviz.

**Parameters:**
- `workflow` (Workflow): Workflow object

**Returns:** `string` - DOT format string

### generateWorkflowMermaid()

```typescript
export function generateWorkflowMermaid(workflow: Workflow): string
```

Generates Mermaid diagram syntax.

**Parameters:**
- `workflow` (Workflow): Workflow object

**Returns:** `string` - Mermaid diagram string

## Related Documentation

- [Visualization README](./README.md)
- [Utils Documentation](../README.md)
