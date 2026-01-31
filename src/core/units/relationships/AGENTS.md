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
```text

### PermissionLevel

```typescript
enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin'
}
```text

### ResourcePermission

```typescript
interface ResourcePermission {
  resource: string;
  level: PermissionLevel;
  conditions?: Record<string, any>;
}
```text

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
```text

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
```text

### RelationshipQueryOptions

```typescript
interface RelationshipQueryOptions {
  sourceUnitId?: string;
  targetUnitId?: string;
  type?: RelationshipType | string;
  resourcePermission?: string;
  minPermissionLevel?: PermissionLevel;
}
```text

## RelationshipManager Class

### Static Methods

#### getInstance()

```typescript
public static getInstance(): RelationshipManager
```text

Gets singleton instance.

**Returns:** `RelationshipManager` - Singleton instance

### Instance Methods

#### createRelationship()

```typescript
public async createRelationship(
  config: RelationshipConfig
): Promise<UnitRelationship>
```text

Creates a relationship.

**Parameters:**
- `config` (RelationshipConfig): Relationship configuration

**Returns:** `Promise<UnitRelationship>` - Created relationship

#### deleteRelationship()

```typescript
public async deleteRelationship(id: string): Promise<boolean>
```text

Deletes a relationship.

**Parameters:**
- `id` (string): Relationship ID

**Returns:** `Promise<boolean>` - Success status

#### findRelationships()

```typescript
public async findRelationships(
  options: RelationshipQueryOptions
): Promise<UnitRelationship[]>
```text

Finds relationships matching criteria.

**Parameters:**
- `options` (RelationshipQueryOptions): Query options

**Returns:** `Promise<UnitRelationship[]>` - Matching relationships

#### getRelationship()

```typescript
public async getRelationship(id: string): Promise<UnitRelationship | null>
```text

Gets relationship by ID.

**Parameters:**
- `id` (string): Relationship ID

**Returns:** `Promise<UnitRelationship | null>` - Relationship or null

## Related Documentation

- [Relationships README](./README.md)
- [Units System](../../units/README.md)
