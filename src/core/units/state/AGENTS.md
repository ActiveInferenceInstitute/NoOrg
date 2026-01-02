# Unit State Management System Technical Documentation

## Overview

Complete technical documentation for state management interfaces, classes, and methods.

## Interfaces

### StateUpdateOptions

```typescript
interface StateUpdateOptions {
  merge?: boolean;
  notify?: boolean;
  updatedBy?: string;
  metadata?: Record<string, any>;
  broadcastUpdate?: boolean;
  conflictResolutionStrategy?: ConflictResolutionStrategy;
}
```

### ConflictResolutionStrategy

```typescript
enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  HIGHEST_VERSION_WINS = 'highest_version_wins',
  MERGE = 'merge',
  CUSTOM = 'custom'
}
```

### StateSubscriptionOptions

```typescript
interface StateSubscriptionOptions {
  immediate?: boolean;
  pathPrefix?: boolean;
  metadata?: Record<string, any>;
  debounceMs?: number;
}
```

## UnitStateManager Class

### Static Methods

#### getInstance()

```typescript
public static getInstance(): UnitStateManager
```

Gets singleton instance.

**Returns:** `UnitStateManager` - Singleton instance

### Instance Methods

#### setState()

```typescript
public async setState(
  path: string,
  value: any,
  options?: StateUpdateOptions
): Promise<void>
```

Sets state value.

**Parameters:**
- `path` (string): State path
- `value` (any): State value
- `options` (StateUpdateOptions, optional): Update options

**Returns:** `Promise<void>`

#### getState()

```typescript
public async getState<T>(path: string): Promise<T | null>
```

Gets state value.

**Parameters:**
- `path` (string): State path

**Returns:** `Promise<T | null>` - State value or null

#### deleteState()

```typescript
public async deleteState(path: string): Promise<boolean>
```

Deletes state value.

**Parameters:**
- `path` (string): State path

**Returns:** `Promise<boolean>` - Success status

#### subscribe()

```typescript
public subscribe(
  path: string,
  handler: (path: string, value: any) => void,
  options?: StateSubscriptionOptions
): () => void
```

Subscribes to state changes.

**Parameters:**
- `path` (string): State path pattern
- `handler` (function): Change handler
- `options` (StateSubscriptionOptions, optional): Subscription options

**Returns:** `() => void` - Unsubscribe function

## Related Documentation

- [State README](./README.md)
- [Units System](../../units/README.md)
