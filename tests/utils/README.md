# Test Utilities

This directory contains utility modules used by the test suites to analyze and document the codebase.

## Modules

### `file_structure_mapper.py`

A utility for recursively scanning and documenting the repository structure.

Features:
- Generates JSON representation of directory/file hierarchy
- Creates Markdown documentation of repository structure
- Configurable exclusion patterns for ignoring files/directories
- Captures file metadata (size, modification time)
- Supports depth-limited scanning
- Command-line interface for standalone use

Example usage:

```python
from tests.utils.file_structure_mapper import FileStructureMapper

# Create mapper instance
mapper = FileStructureMapper(
    root_dir="path/to/repo",
    exclude_patterns=["*.pyc", "__pycache__", "node_modules"]
)

# Generate and save JSON structure
mapper.save_json_structure("output.json")

# Generate and save Markdown structure
mapper.save_markdown_structure("output.md")
```

Command-line usage:

```bash
python -m tests.utils.file_structure_mapper \
    --root-dir path/to/repo \
    --output output.json \
    --markdown output.md \
    --exclude "*.pyc" "__pycache__" \
    --max-depth 3
```

## Integration with Test Suites

These utilities are used by:
- `tests/test_repo_structure.py`: Documents repository structure
- `tests/test_codebase_relationships.py`: Analyzes code dependencies

## Development

When adding new utilities:
1. Place the utility module in this directory
2. Add appropriate tests
3. Update this README
4. Document the utility's purpose and usage

## Best Practices

- Keep utilities focused and single-purpose
- Include docstrings and type hints
- Provide both programmatic and CLI interfaces where appropriate
- Use consistent error handling and logging
- Follow the repository's code style

---

**Metadata**
- Created: 2024-03-20
- Last Updated: 2024-03-20
- Purpose: Support Test Suite Development 