# Security policy

Do not commit credentials, runtime state, logs, coverage, or generated build output.

Provider credentials are read only at application startup and are never included in task results, events, metrics, or logs. Prompt and state paths are validated and runtime writes use atomic replacement.

Report vulnerabilities privately to the repository maintainers with reproduction steps, affected versions, and suggested containment.
