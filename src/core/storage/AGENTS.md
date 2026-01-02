# Storage System Technical Documentation

## Overview

The Storage System provides flexible data persistence with multiple backend support (memory, file, custom). This document provides complete technical documentation for all interfaces, classes, and methods.

## Interfaces

### StorageItem<T>

Represents a stored item with metadata.

```typescript
interface StorageItem<T> {
  key: string;
  value: T;
  timestamp: number;
  metadata?: Record<string, any>;
}
```

**Properties:**
- `key` (string): Storage key
- `value` (T): Stored value
- `timestamp` (number): Unix timestamp when item was stored
- `metadata` (Record<string, any>, optional): Additional metadata

### QueryOptions

Options for querying storage.

```typescript
interface QueryOptions {
  prefix?: string;
  metadata?: Record<string, any>;
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'key' | 'timestamp';
  sortDirection?: 'asc' | 'desc';
}
```

**Properties:**
- `prefix` (string, optional): Filter keys by prefix
- `metadata` (Record<string, any>, optional): Filter by metadata key-value pairs
- `fromTimestamp` (number, optional): Start timestamp for range filter
- `toTimestamp` (number, optional): End timestamp for range filter
- `limit` (number, optional): Maximum number of results
- `offset` (number, optional): Number of results to skip
- `sortBy` ('key' | 'timestamp', optional): Field to sort by
- `sortDirection` ('asc' | 'desc', optional): Sort direction

### StorageBackend

Interface for storage backend implementations.

```typescript
interface StorageBackend {
  set<T>(key: string, item: StorageItem<T>): Promise<void>;
  get<T>(key: string): Promise<StorageItem<T> | null>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(options?: QueryOptions): Promise<string[]>;
  query<T>(options: QueryOptions): Promise<StorageItem<T>[]>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}
```

### StorageOptions

Configuration options for StorageSystem.

```typescript
interface StorageOptions {
  backend?: 'memory' | 'file' | 'custom';
  persistToDisk?: boolean;
  storageDir?: string;
  cacheTTL?: number;
  customBackend?: StorageBackend;
}
```

**Properties:**
- `backend` ('memory' | 'file' | 'custom', optional): Backend type (default: 'memory')
- `persistToDisk` (boolean, optional): Whether to persist to disk (default: true)
- `storageDir` (string, optional): Directory for file backend
- `cacheTTL` (number, optional): Cache time-to-live in milliseconds (default: 3600000)
- `customBackend` (StorageBackend, optional): Custom backend implementation

## Classes

### MemoryStorageBackend

In-memory storage backend implementation.

#### Constructor

```typescript
constructor()
```

Creates a new memory storage backend.

#### Methods

All methods implement the `StorageBackend` interface. See `StorageBackend` interface for method signatures.

**Transaction Support:**
- Transactions are supported with isolated state
- Changes are only committed when `commitTransaction()` is called
- `rollbackTransaction()` discards all changes

### FileStorageBackend

File-based storage backend implementation.

#### Constructor

```typescript
constructor(storageDir: string)
```

**Parameters:**
- `storageDir` (string): Directory for storing files

**Behavior:**
- Creates directory if it doesn't exist
- Uses memory backend as cache
- Persists to disk when not in transaction

#### Methods

All methods implement the `StorageBackend` interface. See `StorageBackend` interface for method signatures.

**Persistence:**
- Items are persisted to disk as JSON files
- Keys are base64-encoded for safe filenames
- Files are loaded into memory cache on access
- All files are loaded into memory for queries

### StorageSystem

Main storage system class with multiple backend support.

#### Constructor

```typescript
private constructor(options: StorageOptions = {})
```

**Parameters:**
- `options` (StorageOptions, optional): Configuration options

**Note:** Constructor is private. Use `getInstance()` to obtain an instance.

#### Static Methods

##### getInstance()

```typescript
public static getInstance(options?: StorageOptions): StorageSystem
```

Gets the singleton instance of StorageSystem.

**Parameters:**
- `options` (StorageOptions, optional): Configuration (only used on first call)

**Returns:** `StorageSystem` - Singleton instance

**Example:**
```typescript
const storage = StorageSystem.getInstance({
  backend: 'file',
  storageDir: './data',
  cacheTTL: 7200000
});
```

#### Instance Methods

##### set()

```typescript
public async set<T>(
  key: string,
  value: T,
  metadata?: Record<string, any>
): Promise<void>
```

Stores a value with optional metadata.

**Parameters:**
- `key` (string): Storage key
- `value` (T): Value to store
- `metadata` (Record<string, any>, optional): Additional metadata

**Returns:** `Promise<void>` - Resolves when value is stored

**Example:**
```typescript
await storage.set('user:123', {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  version: '1.0',
  source: 'api'
});
```

**Events:** Emits 'storage:set' event with key and metadata.

##### get()

```typescript
public async get<T>(key: string): Promise<T | null>
```

Retrieves a value by key.

**Parameters:**
- `key` (string): Storage key

**Returns:** `Promise<T | null>` - Stored value or null if not found/expired

**Example:**
```typescript
const user = await storage.get<User>('user:123');
if (user) {
  console.log(user.name);
}
```

**Behavior:**
- Returns null if key doesn't exist
- Returns null if item has expired (based on cacheTTL)
- Automatically deletes expired items

##### delete()

```typescript
public async delete(key: string): Promise<void>
```

Deletes a value by key.

**Parameters:**
- `key` (string): Storage key

**Returns:** `Promise<void>` - Resolves when value is deleted

**Example:**
```typescript
await storage.delete('user:123');
```

**Events:** Emits 'storage:delete' event with key.

##### clear()

```typescript
public async clear(): Promise<void>
```

Clears all stored values.

**Returns:** `Promise<void>` - Resolves when all values are cleared

**Example:**
```typescript
await storage.clear();
```

**Events:** Emits 'storage:clear' event.

##### keys()

```typescript
public async keys(options?: QueryOptions): Promise<string[]>
```

Gets all storage keys, optionally filtered.

**Parameters:**
- `options` (QueryOptions, optional): Query options

**Returns:** `Promise<string[]>` - Array of keys

**Example:**
```typescript
// Get all keys
const allKeys = await storage.keys();

// Get keys with prefix
const userKeys = await storage.keys({ prefix: 'user:' });
```

##### query()

```typescript
public async query<T>(options: QueryOptions): Promise<T[]>
```

Queries storage with filtering, sorting, and pagination.

**Parameters:**
- `options` (QueryOptions): Query options

**Returns:** `Promise<T[]>` - Array of values (not StorageItems)

**Example:**
```typescript
// Query with filters
const recentUsers = await storage.query<User>({
  prefix: 'user:',
  fromTimestamp: Date.now() - 86400000, // Last 24 hours
  sortBy: 'timestamp',
  sortDirection: 'desc',
  limit: 10
});

// Query by metadata
const apiUsers = await storage.query<User>({
  metadata: { source: 'api' }
});
```

**Behavior:**
- Filters expired items automatically
- Returns values only (not StorageItem wrappers)
- Applies all filters, sorting, and pagination

##### beginTransaction()

```typescript
public async beginTransaction(): Promise<void>
```

Begins a transaction.

**Returns:** `Promise<void>` - Resolves when transaction begins

**Throws:** Error if transaction already in progress

**Example:**
```typescript
await storage.beginTransaction();
try {
  await storage.set('key1', 'value1');
  await storage.set('key2', 'value2');
  await storage.commitTransaction();
} catch (error) {
  await storage.rollbackTransaction();
}
```

**Events:** Emits 'storage:transaction:begin' event.

##### commitTransaction()

```typescript
public async commitTransaction(): Promise<void>
```

Commits the current transaction.

**Returns:** `Promise<void>` - Resolves when transaction is committed

**Throws:** Error if no transaction in progress

**Example:**
See `beginTransaction()` example.

**Events:** Emits 'storage:transaction:commit' event.

##### rollbackTransaction()

```typescript
public async rollbackTransaction(): Promise<void>
```

Rolls back the current transaction.

**Returns:** `Promise<void>` - Resolves when transaction is rolled back

**Throws:** Error if no transaction in progress

**Example:**
See `beginTransaction()` example.

**Events:** Emits 'storage:transaction:rollback' event.

## Usage Examples

### Basic Storage Operations

```typescript
import { StorageSystem } from './StorageSystem';

const storage = StorageSystem.getInstance();

// Store values
await storage.set('user:1', { name: 'Alice', age: 30 });
await storage.set('user:2', { name: 'Bob', age: 25 });

// Retrieve values
const user1 = await storage.get('user:1');
console.log(user1); // { name: 'Alice', age: 30 }

// Delete value
await storage.delete('user:1');
```

### File Backend

```typescript
const storage = StorageSystem.getInstance({
  backend: 'file',
  storageDir: './data/storage',
  cacheTTL: 3600000
});

// Values are persisted to disk
await storage.set('config', { theme: 'dark' });
```

### Transactions

```typescript
await storage.beginTransaction();

try {
  await storage.set('account:balance', 1000);
  await storage.set('account:history', []);
  await storage.commitTransaction();
} catch (error) {
  await storage.rollbackTransaction();
  throw error;
}
```

### Querying

```typescript
// Query with prefix
const userKeys = await storage.keys({ prefix: 'user:' });

// Query with filters
const recentItems = await storage.query({
  fromTimestamp: Date.now() - 3600000,
  sortBy: 'timestamp',
  sortDirection: 'desc',
  limit: 10
});

// Query by metadata
const apiData = await storage.query({
  metadata: { source: 'api', version: '1.0' }
});
```

### Custom Backend

```typescript
class CustomBackend implements StorageBackend {
  // Implement all StorageBackend methods
}

const storage = StorageSystem.getInstance({
  backend: 'custom',
  customBackend: new CustomBackend()
});
```

## Cache Expiration

Items are automatically expired based on `cacheTTL`:
- Expired items return null on `get()`
- Expired items are automatically deleted
- Cache cleanup runs periodically (every cacheTTL interval)

## Event Integration

StorageSystem emits events through EventSystem:
- `storage:set` - When value is stored
- `storage:delete` - When value is deleted
- `storage:clear` - When storage is cleared
- `storage:transaction:begin` - When transaction begins
- `storage:transaction:commit` - When transaction commits
- `storage:transaction:rollback` - When transaction rolls back

## Performance Characteristics

- **Memory Backend**: O(1) for get/set/delete, O(n) for queries
- **File Backend**: O(1) for cached items, O(n) for disk operations
- **Transactions**: Isolated state, no performance impact until commit
- **Cache**: Automatic expiration and cleanup

## Thread Safety

The StorageSystem is designed for single-threaded Node.js execution. For concurrent access, use appropriate synchronization mechanisms.

## Related Documentation

- [Storage System README](./README.md)
- [Core Systems Documentation](../README.md)
- [Event System Documentation](../events/AGENTS.md)
