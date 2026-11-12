# NoOrg engineering guide

NoOrg is a TypeScript 5.8+ application targeting Node.js 22+. The source of truth is `src/`; generated output is never edited or committed.

## Runtime rules

- All agents implement the typed `Agent` contract through `AbstractAgent`.
- All external model calls pass through `LLMProvider` and return schema-validated data.
- All task transitions pass through `TaskRepository`.
- All dependencies are constructor-injected.
- All background resources expose a shutdown path.
- Errors are structured and actionable; secrets are never logged.

## Verification

Run `npm test` for the ordinary unit suite and `npm run validate` (type check, lint, format, tests with coverage, and the repository validators) before handing off work. Live provider checks require an explicit OpenAI profile and are never part of the ordinary local test command.

## Repository layout

- `src/agents/` executable agent implementations
- `src/config/` environment and runtime configuration loading
- `src/content/` reviewed organizational corpus access and integrity manifest
- `src/coordination/` task scheduling and lifecycle
- `src/domain/` shared types, errors, clock, and redaction helpers
- `src/events/` lifecycle event publication
- `src/http/` HTTP server, routes, and authentication
- `src/logging/` structured logging
- `src/metrics/` runtime counters and readiness reporting
- `src/providers/` local and OpenAI provider adapters
- `src/state/` versioned state stores
- `src/tasks/` task state machine persistence
- `tests/` TypeScript unit and integration tests
- `units/` organizational domain content
- `docs/` maintained product documentation

Each maintained directory carries a local guide: `src/`, `tests/`, and `scripts/` have their own `README.md`, and `src/`, `tests/`, `.github/`, `.obsidian/`, `scripts/`, and `units/` carry folder-level `AGENTS.md` files.

The manuscript source is under `docs/manuscript/`. Run `npm run manuscript:check` when publication artifacts are in scope. Its generated output is ignored and must not be edited or committed.
