# Architecture {#sec:architecture}

The composition root creates one dependency graph. Configuration is parsed once; the selected provider is constructed explicitly; the registry validates and initializes executable agents; the coordinator owns scheduling and lifecycle; the repository owns task transitions; the state store owns versioned persistence; and the HTTP server reads runtime observations. The graph is shown in [@fig:architecture].

![NoOrg dependency graph.](output/figures/architecture.png){#fig:architecture}

## Contracts

`Agent<TInput, TOutput>` exposes a descriptor, input schema, result schema, initialization, execution, validation, and shutdown. `TaskRepository` exposes creation, transitions, recovery, snapshots, and persistence. `AgentRegistry` owns capability matching and reservations. `TaskScheduler` exposes `start`, `submitTask`, `cancelTask`, `getTask`, and `shutdown`. `StateStore` exposes defensive reads, typed updates, revision information, flush, and close. `EventBus` validates event envelopes and awaits subscribed handlers with a bounded deadline.

The implementation uses a modular monolith because the hard requirement is lifecycle correctness within one process, not independent deployment. A file-backed state store is sufficient for the supported deployment model. A provider is not selected by probing credentials or silently changing profile: `NOORG_LLM_PROVIDER=local|openai` is required by configuration parsing.

## Execution graph

The coordinator polls queued records, obtains an admissible reservation, atomically starts the task, and invokes `agent.execute`. It validates the returned result again at the repository boundary, records metrics, publishes a typed event, and releases the reservation after settlement. Startup loads state and recovers interrupted running records before accepting work. Shutdown aborts new scheduling, drains active work, closes event delivery, closes providers and agents, flushes state, and releases the file lock.

The architecture has one source of truth for each concern. No alternate runtime tree is required to explain a supported example, and no documentation claim is accepted without a corresponding source contract or evidence record.
