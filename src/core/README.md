# Core Systems Framework

This directory contains the core system implementations that provide fundamental functionality for the operations platform.

## Systems Overview

### Event System
The Event System provides a centralized event bus for publishing and subscribing to events across the application. It implements the Observer pattern and includes features for:
- Event emission and handling
- Event persistence and history
- Type-safe event definitions
- Singleton pattern for global access

Usage example:
```typescript
const eventSystem = EventSystem.getInstance();

// Subscribe to events
eventSystem.on('user:created', (event) => {
  console.log('New user created:', event.payload);
});

// Emit events
eventSystem.emit('user:created', { id: '123', name: 'John Doe' });

// Get event history
const history = eventSystem.getEventHistory('user:created');
```

### Message System
The Message System builds on top of the Event System to provide a robust messaging infrastructure with:
- Topic-based publish/subscribe
- Message persistence and history
- Asynchronous message handling
- Unsubscribe capabilities
- Message metadata support

Usage example:
```typescript
const messageSystem = MessageSystem.getInstance();

// Subscribe to messages
const unsubscribe = messageSystem.subscribe('notifications', async (message) => {
  await processNotification(message.payload);
});

// Publish messages
await messageSystem.publish('notifications', {
  userId: '123',
  content: 'Hello!'
}, {
  priority: 'high'
});

// Cleanup
unsubscribe();
```

### Storage System
The Storage System provides a flexible storage solution with:
- In-memory and disk persistence
- Cache management with TTL
- Asynchronous operations
- Type-safe storage
- Event emission for storage operations

Usage example:
```typescript
const storageSystem = StorageSystem.getInstance({
  persistToDisk: true,
  cacheTTL: 3600000 // 1 hour
});

// Store data
await storageSystem.set('user:123', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Retrieve data
const user = await storageSystem.get('user:123');

// Delete data
await storageSystem.delete('user:123');
```

### Monitoring System
The Monitoring System provides comprehensive monitoring capabilities:
- Metric recording and retrieval
- Alert definition and management
- Real-time monitoring
- Metric persistence
- Alert notifications

Usage example:
```typescript
const monitoringSystem = MonitoringSystem.getInstance();

// Record metrics
monitoringSystem.recordMetric('api.response_time', 150, {
  endpoint: '/users',
  method: 'GET'
});

// Create alerts
const alertId = monitoringSystem.createAlert(
  'high_response_time',
  (metric) => metric.value > 1000,
  'API response time exceeded 1000ms',
  'warning'
);

// Handle alerts
monitoringSystem.onAlert((alert) => {
  console.log(`Alert ${alert.name}: ${alert.message}`);
});
```

## Integration
All core systems are designed to work together seamlessly while maintaining loose coupling. They follow these design principles:
- Singleton pattern for global state management
- Event-driven architecture
- Asynchronous operations
- Type safety
- Persistence capabilities
- Error handling

## Dependencies
- Node.js (v18+)
- TypeScript
- fs-extra (for file system operations)
- events (Node.js built-in) 