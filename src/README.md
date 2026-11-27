# Source tree

TypeScript source for the NoOrg runtime. `src/index.ts` is the composition root; the remaining modules are wired together there through constructor injection. Generated output under `dist/` is never edited or committed.

## Modules

| Directory | Responsibility |
| --- | --- |
| `agents/` | Executable agent contract (`AbstractAgent`), built-in agents, loader, and registry. |
| `config/` | Environment and runtime configuration loading and validation. |
| `content/` | Opt-in `UnitCorpus` adapter and manifest verification for `units/`. |
| `coordination/` | Task scheduling, lifecycle, and shutdown. |
| `domain/` | Shared types, structured errors, clock, and redaction helpers. |
| `events/` | Lifecycle event publication. |
| `http/` | HTTP server, routes, authentication, and the generated OpenAPI contract. |
| `logging/` | Structured logging. |
| `metrics/` | Runtime counters and readiness reporting. |
| `providers/` | Local and OpenAI `LLMProvider` adapters. |
| `state/` | Versioned state stores. |
| `tasks/` | Task state machine and durable task repository. |

## Conventions

- All agents implement the typed `Agent` contract through `AbstractAgent`.
- All external model calls pass through `LLMProvider` and return schema-validated data.
- All task transitions pass through `TaskRepository`.
- All dependencies are constructor-injected and every background resource exposes a shutdown path.
- Errors are structured and actionable; secrets are never logged.

## Runtime contracts

Public task pages remain capped at 100. Scheduling, health and metrics use
complete internal snapshots. `blockedTasks` counts the union of capability,
capacity, relationship and backoff blockers without double-counting; the
capability/capacity classifications are not a complete partition of that total.

State mutations publish committed values, revisions and task maps only after
durable replacement. Rejected pre-rename write/fsync candidates stay invisible
and cannot become a later flush or shutdown state. Rename/directory-sync
uncertainty may leave new raw disk bytes without acknowledgement: it fences
the store and retains its namespace guard. Guards are never automatically
reclaimed. Stop writers, preserve state/owner/guard/temp physical evidence and
obtain explicit reviewed recovery; never reset or roll back blindly.

Provider task counters are cumulative per provider instance; the coordinator
durably commits only new deltas and advances checkpoints only after success.
Fresh provider counters do not subtract persisted historical usage. Late
cancellation/timeout settlement records usage once without publishing a result.
Disabled rate limiting retains no request-time history; enabled windows retain
their existing quota, rollover, circuit and budget semantics.

Execution timers are cleared when the agent/timeout race settles, before durable
completion, accounting or event delivery. Reservation ownership lasts through
finalization; genuine timed-out work retains its reservation until the actual
operation settles. Structured task failures retain their original code in the
health observation rather than being reclassified as an unknown error.
Shutdown settles an already pending claim without claiming or cancelling the
remaining queued backlog, which stays persisted for the next process.

## Commands

```bash
npm run type-check
npm run lint
npm run build
```

See [architecture](../docs/design/architecture.md) for the composition root and dependency graph, and the [repository overview](../README.md) for the full command list.
