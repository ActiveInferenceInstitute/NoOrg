# Agent Communication - Technical Documentation

## Overview

This directory contains specifications for agent communication within the NoOrg framework. No executable code is present; all files are documentation.

## Document Types

### Message Formats (`message-formats.md`)

Defines the structure of messages exchanged between agents:

- Request/response envelopes
- Event payloads
- Error message structures
- Metadata conventions

### Interaction Patterns (`interaction-patterns.md`)

Documents common interaction paradigms:

- Synchronous request-response
- Asynchronous message passing
- Broadcast/multicast patterns
- Pipeline communication

### Protocols (`protocols.md`)

Communication protocol specifications:

- Connection establishment
- Message acknowledgment
- Retry and timeout handling
- Error recovery procedures

## Integration with Code

These specifications are implemented in:

- [`src/core/messaging/`](../../src/core/messaging/) - Message system implementation
- [`src/core/events/`](../../src/core/events/) - Event-driven communication
- [`src/core/multiagent/`](../../src/core/multiagent/) - Multi-agent coordination

## Related Documentation

- [Agent README](../README.md)
- [Agent AGENTS.md](../AGENTS.md)
