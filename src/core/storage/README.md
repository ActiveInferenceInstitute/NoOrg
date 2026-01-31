# Storage System

The Storage System provides persistent and in-memory data storage capabilities for the multi-agent framework, supporting various storage backends and data models.

## Overview

The Storage System enables reliable data persistence, caching, and retrieval across the framework. It supports multiple storage backends and provides a unified interface for data operations.

## Core Components

### StorageSystem

The main storage system that manages data persistence, retrieval, and caching operations.

**Key Features:**
- Multiple storage backends (memory, file, database)
- Data serialization and compression
- Cache management with TTL
- Transaction support
- Query capabilities

**Usage:**
```typescript
import { StorageSystem } from './StorageSystem';

// Get singleton instance
const storage = StorageSystem.getInstance();

// Store data
await storage.set('user.profile', {
  id: 'user-123',
  name: 'John Doe',
  preferences: { theme: 'dark' }
});

// Retrieve data
const profile = await storage.get('user.profile');
console.log('User profile:', profile);

// Store with expiration
await storage.set('session.token', 'abc123', {
  ttl: 3600 // Expires in 1 hour
});

// Query data
const users = await storage.query('users.*', {
  filter: { active: true },
  limit: 10
});
```text

## Storage Backends

### Memory Backend
In-memory storage for fast, temporary data storage.

**Configuration:**
```typescript
const memoryStorage = storage.createBackend('memory', {
  maxSize: '100MB',
  enableCompression: true
});
```text

**Use Cases:**
- Session data
- Temporary calculations
- Fast caching

### File Backend
File-based storage for persistent data storage.

**Configuration:**
```typescript
const fileStorage = storage.createBackend('file', {
  basePath: '/data',
  enableEncryption: true,
  compressionLevel: 6
});
```text

**Use Cases:**
- Configuration files
- Log data
- Backup storage

### Database Backend
Database storage for structured data with query capabilities.

**Configuration:**
```typescript
const dbStorage = storage.createBackend('database', {
  connectionString: 'postgresql://localhost:5432/app',
  poolSize: 10,
  enableMigrations: true
});
```text

**Use Cases:**
- User data
- Application state
- Analytics data

## Data Models

### Key-Value Storage
Simple key-value storage with optional metadata.

```typescript
interface KeyValueData {
  key: string;
  value: any;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    ttl?: number;
    tags?: string[];
  };
}
```text

### Document Storage
Document-based storage for complex data structures.

```typescript
interface DocumentData {
  id: string;
  collection: string;
  data: Record<string, any>;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}
```text

### Time Series Storage
Optimized storage for time-series data.

```typescript
interface TimeSeriesData {
  metric: string;
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}
```text

## Advanced Operations

### Transactions
```typescript
// Start transaction
const transaction = await storage.beginTransaction();

// Perform operations
await transaction.set('user.balance', 100);
await transaction.set('transaction.log', {
  userId: 'user-123',
  amount: 100,
  timestamp: Date.now()
});

// Commit transaction
await transaction.commit();

// Or rollback on error
await transaction.rollback();
```text

### Batch Operations
```typescript
// Batch write operations
await storage.batchSet([
  { key: 'user.1', value: user1Data },
  { key: 'user.2', value: user2Data },
  { key: 'user.3', value: user3Data }
]);

// Batch read operations
const results = await storage.batchGet([
  'user.1',
  'user.2',
  'user.3'
]);
```text

### Query Operations
```typescript
// Query with filters
const activeUsers = await storage.query('users.*', {
  filter: { status: 'active' },
  sort: { createdAt: -1 },
  limit: 10
});

// Full-text search
const searchResults = await storage.search('documents.*', {
  query: 'machine learning',
  fields: ['title', 'content'],
  limit: 20
});
```text

## Configuration

### StorageSystem Configuration
```typescript
interface StorageConfig {
  defaultBackend?: string;
  enableCaching?: boolean;
  cacheSize?: number;
  enableCompression?: boolean;
  enableEncryption?: boolean;
  encryptionKey?: string;
}
```text

### Backend-Specific Configuration
```typescript
interface BackendConfig {
  // Memory backend
  memory?: {
    maxSize?: string;
    enableCompression?: boolean;
  };

  // File backend
  file?: {
    basePath?: string;
    enableEncryption?: boolean;
    compressionLevel?: number;
  };

  // Database backend
  database?: {
    connectionString?: string;
    poolSize?: number;
    enableMigrations?: boolean;
  };
}
```text

## Performance

### Performance Characteristics
- **Memory Backend**: Sub-millisecond access, limited by RAM
- **File Backend**: Millisecond access, limited by disk I/O
- **Database Backend**: 10-100ms access, optimized for complex queries

### Optimization Strategies
- **Caching**: Automatic caching for frequently accessed data
- **Compression**: Reduces storage size for large objects
- **Indexing**: Database query optimization
- **Batch Operations**: Reduces round trips for multiple operations

## Error Handling

The system includes comprehensive error handling:
- **StorageConnectionError**: Backend connection failures
- **StorageTimeoutError**: Operation timeout
- **StorageQuotaError**: Storage limit exceeded
- **StorageCorruptionError**: Data corruption detected

## Security

- **Data Encryption**: Optional encryption at rest and in transit
- **Access Control**: Role-based access to stored data
- **Audit Logging**: Complete audit trail of data operations
- **Data Sanitization**: Automatic sanitization of sensitive data

## Integration

The Storage System integrates with:
- **Event System**: Publishes storage operation events
- **Monitoring System**: Provides storage metrics and health checks
- **Messaging System**: Supports message persistence
- **Task Manager**: Stores task state and results

## Best Practices

1. **Choose Appropriate Backends**: Use memory for speed, file/database for persistence
2. **Use TTL for Temporary Data**: Set appropriate expiration for cache data
3. **Batch Operations**: Use batch operations for multiple related updates
4. **Monitor Storage Usage**: Track storage growth and cleanup old data
5. **Implement Backups**: Regular backups for critical data

## Advanced Features

### Data Migration
```typescript
// Migrate data between backends
await storage.migrateData('users.*', 'memory', 'database');

// Migrate with transformation
await storage.migrateData('legacy.*', 'file', 'database', {
  transform: (data) => transformLegacyFormat(data)
});
```text

### Data Replication
```typescript
// Set up data replication
storage.setupReplication({
  source: 'primary-database',
  targets: ['backup-database', 'analytics-database'],
  strategy: 'real-time'
});
```text

### Data Archiving
```typescript
// Archive old data
await storage.archiveData('logs.older_than_1_year', {
  destination: 'cold-storage',
  compression: true,
  encryption: true
});
```text

## Monitoring

Built-in monitoring capabilities:
- Storage usage metrics
- Operation performance tracking
- Backend health monitoring
- Data consistency checks

## Troubleshooting

### Common Issues

#### Storage Backend Unavailable
**Cause**: Backend service down or misconfigured
**Solution**:
```typescript
// Check backend health
const health = await storage.checkBackendHealth('database');
if (!health.healthy) {
  // Switch to fallback backend
  storage.setDefaultBackend('memory');
}
```text

#### High Memory Usage
**Cause**: Memory backend growing too large
**Solution**:
```typescript
// Enable automatic cleanup
storage.enableAutoCleanup({
  maxSize: '500MB',
  cleanupStrategy: 'lru' // Least recently used
});
```text

#### Slow Query Performance
**Cause**: Missing indexes or large datasets
**Solution**:
```typescript
// Add indexes for common queries
await storage.createIndex('users', 'email');
await storage.createIndex('users', 'createdAt');

// Optimize query patterns
const optimizedResults = await storage.query('users.active', {
  index: 'createdAt',
  limit: 100
});
```text

## Related Documentation

- [Storage System API Reference](../../../docs/index.md)
- [Integration Patterns](../../../docs/core/integration/patterns/README.md)
- [Monitoring Integration](../monitoring/README.md)
