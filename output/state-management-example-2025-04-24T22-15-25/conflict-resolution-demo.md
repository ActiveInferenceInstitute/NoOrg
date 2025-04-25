# Conflict Resolution Strategies Demonstration

This example demonstrates multiple conflict resolution strategies when concurrent updates occur.

## Concurrent Updates Test Case
Three different units attempted to update the same state path (`shared_data.user_count`) simultaneously:

| Unit | Update Value | Resolution Strategy |
|------|-------------|---------------------|
| Research Unit | 100 | LATEST_WINS |
| Development Unit | 120 | LATEST_WINS |
| Operations Unit | 110 | MERGE |

## Resolution Results
- **Research Unit** resolved to: 100
- **Development Unit** resolved to: 120
- **Operations Unit** resolved to: 110
- **Project Alpha** resolved to: undefined

## Strategy Explanations

### LATEST_WINS
The most recently applied update takes precedence, regardless of the value.

### FIRST_WINS
The first value set is preserved, and later updates are ignored.

### MERGE
- For objects: Properties from both objects are combined
- For arrays: Concatenation with duplicate removal
- For primitives: Application-specific logic (usually LATEST_WINS)

### CUSTOM
Custom conflict resolution logic can be provided based on application needs.
