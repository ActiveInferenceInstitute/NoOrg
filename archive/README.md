# Archive Directory

This directory contains historical implementations, test results, and deprecated code that has been archived for reference purposes.

## Contents

### `/implementations/`
Legacy implementations of various components that have been replaced by newer versions in the main codebase.

### `/swarm_test/`
Historical swarm testing implementations and results. Contains the original swarm-based testing framework.

### `/swarm_pong_test/`
Pong game simulation using swarm intelligence algorithms for testing multi-agent coordination.

### `/swarm_sort_test/`
Sorting algorithm testing using swarm-based approaches.

## Purpose

This archive serves as:
- **Historical Reference**: Maintains a record of how the framework evolved
- **Learning Resource**: Shows different approaches and implementations
- **Migration Guide**: Helps understand changes between versions
- **Backup**: Preserves working code that may be useful in the future

## Usage Guidelines

### When to Use Archived Code
- **Research**: Studying different implementation approaches
- **Comparison**: Understanding how the framework has improved
- **Recovery**: When newer implementations have issues

### When NOT to Use Archived Code
- **Production**: Always use the latest implementations from `src/`
- **New Development**: Base new features on current architecture
- **Bug Fixes**: Fix issues in the current codebase, not archived versions

## Migration Notes

### From Archive to Current
- **Agent Implementations**: Use `src/agents/` instead of archive versions
- **Core Systems**: Use `src/core/` for current implementations
- **Test Results**: Reference current test outputs in `output/`

### Key Changes
- **Architecture**: Moved from class-based to interface-based design
- **Testing**: Enhanced with comprehensive unit and integration tests
- **Documentation**: Added extensive AGENTS.md files for each agent
- **Configuration**: Centralized configuration management

## Maintenance

This archive is maintained for historical purposes. Code here should not be actively developed or maintained unless specifically needed for research or recovery purposes.

## Related Documentation

- [Current Agent Framework](../../../src/agents/README.md)
- [Core Systems](../../../src/core/README.md)
- [Test Results](../../../output/)
- [Project History](../../../CHANGELOG.md)
