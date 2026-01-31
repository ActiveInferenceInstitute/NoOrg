# Diagram Utilities Technical Documentation

## Overview

Complete technical documentation for diagram generation functions.

## Functions

### generateOrgStructureDiagram()

```javascript
function generateOrgStructureDiagram(units, relationships): string
```text

Generates Mermaid syntax for organizational structure.

**Parameters:**
- `units` (Array): Organizational units
- `relationships` (Array): Relationships between units

**Returns:** `string` - Mermaid diagram syntax

### generateWorkflowDiagram()

```javascript
function generateWorkflowDiagram(workflowSteps, options = {}): string
```text

Generates Mermaid syntax for workflow.

**Parameters:**
- `workflowSteps` (Array): Workflow steps
- `options` (object, optional): Customization options

**Returns:** `string` - Mermaid diagram syntax

## Related Documentation

- [Diagrams README](./README.md)
