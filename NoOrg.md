# NoOrg domain map

NoOrg separates domain content from executable infrastructure.

- `units/` contains organizational charters, policies, processes, and reports.
- `src/` contains the executable coordination runtime.
- `tests/` verifies state, providers, agents, orchestration, and HTTP behavior.
- `docs/` describes contracts and operations.

The runtime does not infer behavior from the Markdown corpus. Domain content is supplied explicitly as task input and validated by the relevant agent.
