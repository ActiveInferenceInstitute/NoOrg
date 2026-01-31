# Contributing to NoOrg

Thank you for your interest in contributing to the NoOrg Multi-Agent Framework!

## Documentation Standards

All directories in this repository must contain the following documentation files:

1. **AGENTS.md**: Technical documentation describing the directory's purpose, contents, and integrations.
2. **README.md**: General human-readable overview.

### Automation

You can use `scripts/ensure_full_coverage.py` to check for missing documentation files.

## Pull Request Process

1. Ensure all tests pass.
2. Update documentation to reflect any code changes.
3. Run the link checker (`scripts/check_links.py`) to verify navigation paths.

## Code Style

- Use TypeScript for source code.
- Follow the established directory structure in `units/` and `src/`.
