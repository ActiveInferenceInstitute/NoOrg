# Unit State Management System

The Unit State Management System provides shared state management for organizational units.

## Overview

This system provides:
- Hierarchical state structure
- Real-time state synchronization
- State persistence
- Conflict resolution
- State subscriptions

## Components

### UnitStateManager

Manages shared state for organizational units.

**Key Features:**
- Set and get state values
- State subscriptions
- Conflict resolution
- State versioning
- State persistence

## Usage

### State Management

```typescript
import { UnitStateManager } from './UnitStateManager';

const stateManager = UnitStateManager.getInstance();

// Set state
await stateManager.setState('unit:001:status', 'active', {
  notify: true,
  updatedBy: 'system'
});

// Get state
const status = await stateManager.getState('unit:001:status');

// Subscribe to state changes
const unsubscribe = stateManager.subscribe('unit:001:*', (path, value) => {
  console.log(`State changed: ${path} = ${value}`);
});
```text

## Integration

The state system integrates with:
- **Event System**: Publishes state change events
- **Storage System**: Persists state
- **Units System**: Manages unit state

## Related Documentation

- [State AGENTS.md](./AGENTS.md)
- [Units System](../../units/README.md)
