# Agent Discovery Module

## Overview

The Agent Discovery module provides registration, capability matching, heartbeat monitoring, and status management for agents in the NoOrg multi-agent system.

## Key Features

- **Registration**: Agents register themselves with the discovery service upon initialization.
- **Capability Matching**: The system matches tasks to agents based on declared capabilities.
- **Heartbeat**: Active agents send periodic heartbeats to confirm availability.
- **Status Management**: Agent status (available, busy, error) is tracked centrally.

## Related Documentation

- [Agent Orchestration](./orchestration.md)
- [Multi-Agent Coordinator](../../../../src/core/multiagent/AGENTS.md)
