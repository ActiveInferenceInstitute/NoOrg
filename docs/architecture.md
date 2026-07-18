# Architecture

The composition root creates one application graph:

1. `loadConfig()` validates environment values.
2. `FileStateStore` loads a versioned state envelope.
3. A selected `LLMProvider` is constructed explicitly.
4. `AgentRegistry` validates and initializes executable agents.
5. `Coordinator` claims queued tasks, runs agents, persists transitions, publishes redacted events, and records metrics.
6. The HTTP server exposes health/readiness probes, authenticated metrics, and versioned task routes.
7. Optional configured agent modules and the opt-in unit corpus adapter are loaded only through explicit, versioned interfaces; modules outside the deployment boundary require a trusted digest.

Every agent receives provider, state, logger, and clock dependencies. Agent output is validated before the coordinator marks a task complete. A task can only transition through the repository state machine. Timeout state is recorded at the deadline while the agent reservation remains held until the underlying promise settles; bounded shutdown reports incomplete draining instead of claiming that all arbitrary agent code stopped.

Workflow records carry bounded graph depth and parent breadth, explicit priority propagation, and an optional parent-success gate. Provider usage is accumulated on task records so retry and terminal paths retain durable attribution; budget reservations cover estimated in-flight cost within the single-process boundary. The HTTP surface is described by the tracked OpenAPI contract at `docs/api/openapi.json`.
