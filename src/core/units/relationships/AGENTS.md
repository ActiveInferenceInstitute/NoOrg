# Unit Relationships System Technical Documentation

## Overview

Complete technical documentation for relationship management interfaces, classes, and methods.

## Interfaces

### RelationshipType

```typescript
enum RelationshipType {
  HIERARCHY = 'hierarchy',
  PEER = 'peer',
  ADVISOR = 'advisor',
  SUPERVISOR = 'supervisor',
  DELEGATE = 'delegate',
  COLLABORATOR = 'collaborator',
  SERVICE_PROVIDER = 'service_provider',
  CUSTOM = 'custom'
}
```

### PermissionLevel

```typescript
enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin'
}
```

### ResourcePermission

```typescript
interface ResourcePermission {
  resource: string;
  level: PermissionLevel;
  conditions?: Record<string, any>;
}
```

### RelationshipConfig

```typescript
interface RelationshipConfig {
  sourceUnitId: string;
  targetUnitId: string;
  type: RelationshipType | string;
  description?: string;
  bidirectional?: boolean;
  permissions?: ResourcePermission[];
  metadata?: Record<string, any>;
}
```

### UnitRelationship

```typescript
interface UnitRelationship {
  id: string;
  sourceUnitId: string;
  targetUnitId: string;
  type: RelationshipType | string;
  description?: string;
  permissions?: ResourcePermission[];
  metadata?: Record<string, any>;
}
```

### RelationshipQueryOptions

```typescript
interface RelationshipQueryOptions {
  sourceUnitId?: string;
  targetUnitId?: string;
  type?: RelationshipType | string;
  resourcePermission?: string;
  minPermissionLevel?: PermissionLevel;
}
```

## RelationshipManager Class

### Static Methods

#### getInstance()

```typescript
public static getInstance(): RelationshipManager
```

Gets singleton instance.

**Returns:** `RelationshipManager` - Singleton instance

### Instance Methods

#### createRelationship()

```typescript
public async createRelationship(
  config: RelationshipConfig
): Promise<UnitRelationship>
```

Creates a relationship.

**Parameters:**
- `config` (RelationshipConfig): Relationship configuration

**Returns:** `Promise<UnitRelationship>` - Created relationship

#### deleteRelationship()

```typescript
public async deleteRelationship(id: string): Promise<boolean>
```

Deletes a relationship.

**Parameters:**
- `id` (string): Relationship ID

**Returns:** `Promise<boolean>` - Success status

#### findRelationships()

```typescript
public async findRelationships(
  options: RelationshipQueryOptions
): Promise<UnitRelationship[]>
```

Finds relationships matching criteria.

**Parameters:**
- `options` (RelationshipQueryOptions): Query options

**Returns:** `Promise<UnitRelationship[]>` - Matching relationships

#### getRelationship()

```typescript
public async getRelationship(id: string): Promise<UnitRelationship | null>
```

Gets relationship by ID.

**Parameters:**
- `id` (string): Relationship ID

**Returns:** `Promise<UnitRelationship | null>` - Relationship or null

## Related Documentation

- [Relationships README](./README.md)
- [Units System](../../units/README.md)
