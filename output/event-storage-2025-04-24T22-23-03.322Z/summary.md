# Event System and Storage System Integration Example
  
## Summary
- **Total Events**: 11
- **Event Types**: user:login, user:logout, system:startup, storage:set, storage:transaction:begin, storage:transaction:rollback
- **Correlation IDs**: session-abc123
- **Run Timestamp**: 2025-04-24T22:23:03.344Z

## Key Demonstrated Features
1. Event filtering and subscription patterns
2. Event persistence and replay
3. Storage transactions (including rollback)
4. Integration between events and storage systems

## Event Timeline
- **2025-04-24T22:23:03.327Z**: user:login (ID: 1745533383327-878094)
- **2025-04-24T22:23:03.329Z**: user:logout (ID: 1745533383329-566008)
- **2025-04-24T22:23:03.331Z**: system:startup (ID: 1745533383331-195567)
- **2025-04-24T22:23:03.332Z**: storage:set (ID: 1745533383332-210697)
- **2025-04-24T22:23:03.333Z**: storage:set (ID: 1745533383333-453114)
- **2025-04-24T22:23:03.333Z**: storage:set (ID: 1745533383333-292913)
- **2025-04-24T22:23:03.333Z**: storage:set (ID: 1745533383333-537610)
- **2025-04-24T22:23:03.333Z**: storage:transaction:begin (ID: 1745533383333-605886)
- **2025-04-24T22:23:03.334Z**: storage:set (ID: 1745533383334-833804)
- **2025-04-24T22:23:03.334Z**: storage:set (ID: 1745533383334-399661)
- **2025-04-24T22:23:03.336Z**: storage:transaction:rollback (ID: 1745533383336-326580)

## Storage & Event Flow Diagram
```
┌────────────────┐         ┌────────────────┐
│                │         │                │
│   EventSystem  │◄────────┤    Emitter     │
│                │         │                │
└───────┬────────┘         └────────────────┘
        │
        │ Events
        ▼
┌────────────────┐         ┌────────────────┐
│                │         │                │
│   Subscribers  │─────────►  StorageSystem │
│                │ Store   │                │
└────────────────┘ Event   └────────────────┘
                   Data
```

## Next Steps
- Create more complex event correlation patterns
- Implement custom storage adapters
- Explore event-driven architectures

