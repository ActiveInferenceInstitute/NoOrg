# Unit Relationships System

The Unit Relationships System manages relationships between organizational units.

## Overview

This system provides:
- Relationship creation and management
- Permission management
- Relationship querying
- Relationship validation

## Components

### RelationshipManager

Manages relationships between organizational units.

**Key Features:**
- Create and delete relationships
- Manage permissions
- Query relationships
- Validate relationship integrity

## Usage

### Creating Relationships

```typescript
import { RelationshipManager, RelationshipType } from './RelationshipManager';

const manager = RelationshipManager.getInstance();

// Create relationship
const relationship = await manager.createRelationship({
  sourceUnitId: 'unit-001',
  targetUnitId: 'unit-002',
  type: RelationshipType.HIERARCHY,
  description: 'Reporting relationship',
  permissions: [{
    resource: 'reports',
    level: PermissionLevel.READ
  }]
});
```

### Querying Relationships

```typescript
// Find relationships
const relationships = await manager.findRelationships({
  sourceUnitId: 'unit-001',
  type: RelationshipType.HIERARCHY
});
```

## Integration

The relationships system integrates with:
- **Event System**: Publishes relationship events
- **Storage System**: Persists relationships
- **Units System**: Manages unit relationships

## Related Documentation

- [Relationships AGENTS.md](./AGENTS.md)
- [Units System](../../units/README.md)
