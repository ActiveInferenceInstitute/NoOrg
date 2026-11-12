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

## Commands

```bash
npm run type-check
npm run lint
npm run build
```

See [architecture](../docs/architecture.md) for the composition root and dependency graph, and the [repository overview](../README.md) for the full command list.
