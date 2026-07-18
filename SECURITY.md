# Security policy

Do not commit credentials, runtime state, logs, coverage, or generated build output.

Provider credentials are read only at application startup and are never included in task results, events, metrics, or logs. Task and metrics HTTP endpoints require a bearer token whenever configured, and production startup requires one. Prompt and state paths are validated and runtime writes use atomic replacement.

Report vulnerabilities privately to the repository maintainers with reproduction steps, affected versions, and suggested containment.
