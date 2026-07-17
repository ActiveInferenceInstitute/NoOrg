# Architecture

The composition root creates one application graph:

1. `loadConfig()` validates environment values.
2. `FileStateStore` loads a versioned state envelope.
3. A selected `LLMProvider` is constructed explicitly.
4. `AgentRegistry` validates and initializes executable agents.
5. `Coordinator` claims queued tasks, runs agents, persists transitions, publishes events, and records metrics.
6. The HTTP server exposes health, readiness, and metrics.

Every agent receives provider, state, logger, and clock dependencies. Agent output is validated before the coordinator marks a task complete. A task can only transition through the repository state machine.
