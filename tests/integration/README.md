# Integration Tests

Covers interactions across core subsystems (events, messaging, storage, monitoring) and agent coordination. Use real implementations with minimal mocking to catch interface drift.

- Target cross-component workflows (task creation → assignment → completion).
- Validate persistence paths (storage, shared state) and event propagation.
- Keep runtimes bounded to fit CI defaults (30s Jest timeout).

