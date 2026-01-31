# Migration Guide

## Overview

This guide covers migration paths for upgrading between major versions of the NoOrg framework.

## Version Migration

### Migrating from Legacy Agents

The `agents/` directory is deprecated. All agent implementations should use the new structure in `src/agents/`.

1. Move agent code from `agents/<AgentName>/` to `src/agents/<AgentName>/`
2. Ensure agents extend `AbstractAgent` from `src/agents/AbstractAgent.ts`
3. Update imports to use new module paths
4. Add AGENTS.md documentation following src/agents patterns

## Related Documentation

- [Agent Framework](../../src/agents/AGENTS.md)
- [Development Index](./index.md)
