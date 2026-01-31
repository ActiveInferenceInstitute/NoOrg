# Utility Scripts

This directory contains utility scripts for development, maintenance, and operations. These scripts automate common tasks and provide tools for managing the system.

## Available Scripts

### Fix and Check Units (fix_and_check_units.py)

A Python script for auditing and fixing organizational unit structures. It ensures that all units follow the correct naming conventions and directory structure.

```bash
# Run the units check and fix script
python fix_and_check_units.py
```text

The script performs the following tasks:
- Validates unit directory structures
- Checks naming conventions
- Ensures required subdirectories exist
- Generates reports of issues found

The script outputs a detailed log file (`units_audit.log`) documenting all issues found and actions taken.

## Running Scripts

### Python Scripts

Requirements:
- Python 3.8 or higher
- Required dependencies installed

```bash
# Run a Python script
python script_name.py [arguments]
```text

### JavaScript/TypeScript Scripts

Requirements:
- Node.js v18 or higher
- TypeScript (for TS scripts)
- Required dependencies installed

```bash
# Run a JavaScript script
node script_name.js [arguments]

# Run a TypeScript script
ts-node script_name.ts [arguments]
```text

## Creating New Scripts

When creating new utility scripts:

1. Use clear, descriptive names that indicate the script's purpose
2. Include documentation at the top of the script explaining its function
3. Provide command-line help with `--help` flag
4. Handle errors gracefully with informative messages
5. Use logging to document the script's actions
6. Include verification steps to validate inputs and outputs
7. Add the script to this README

## Best Practices

- Scripts should be idempotent (can be run multiple times without negative effects)
- Include progress indicators for long-running operations
- Provide options for dry-run modes where appropriate
- Log actions taken and results in a consistent format
- Use configuration files for complex settings
- Include cleanup routines to handle interrupted execution

## Related Documentation

- [Main Source Documentation](../README.md) 