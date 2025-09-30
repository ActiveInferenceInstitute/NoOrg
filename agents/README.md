# Agents Directory (Legacy)

**⚠️ DEPRECATED**: This directory contains legacy agent implementations that have been replaced by the current agent framework in `src/agents/`.

## Purpose

This directory is maintained for historical reference and migration purposes only. The current, actively maintained agent implementations are located in `src/agents/`.

## Contents

### `/architectures/`
Legacy agent architecture documentation and specifications.

### `/communication/`
Old communication protocols and message formats.

### `/examples/`
Historical examples of agent usage and coordination.

### `/guides/`
Legacy implementation guides and best practices.

### `/system/`
Old system-level agent specifications.

### `/task/`
Legacy task management and execution frameworks.

### `/types/`
Historical type definitions for agents.

## Migration Status

All agents in this directory have been successfully migrated to the current framework:

- ✅ **Modern Architecture**: Moved to interface-based design in `src/agents/`
- ✅ **Enhanced Testing**: Added comprehensive unit and integration tests
- ✅ **Better Documentation**: Created detailed AGENTS.md files for each agent
- ✅ **Improved Performance**: Optimized for production use
- ✅ **Type Safety**: Enhanced TypeScript types and interfaces

## Usage

**DO NOT USE** these implementations for new development. Instead, use:

- **Agent Implementations**: `src/agents/`
- **Documentation**: `src/agents/*/AGENTS.md`
- **Tests**: `tests/unit/agents/`
- **Examples**: `examples/`

## Historical Value

This archive provides:
- **Learning Resource**: Understanding how the framework evolved
- **Migration Examples**: Showing progression from old to new implementations
- **Research Material**: Studying different architectural approaches

## Related Documentation

- [Current Agent Framework](../../../src/agents/README.md)
- [Agent Documentation](../../../docs/agents/README.md)
- [Migration Guide](../../../docs/development/migration-guide.md)
- [Current Test Coverage](../../../tests/unit/agents/README.md)
