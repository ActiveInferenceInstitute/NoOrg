# NoOrg engineering guide

NoOrg is a TypeScript 5.8+ application targeting Node.js 20+. The source of truth is `src/`; generated output is never edited or committed.

## Runtime rules

- All agents implement the typed `Agent` contract through `AbstractAgent`.
- All external model calls pass through `LLMProvider` and return schema-validated data.
- All task transitions pass through `TaskRepository`.
- All dependencies are constructor-injected.
- All background resources expose a shutdown path.
- Errors are structured and actionable; secrets are never logged.

## Verification

Run `npm run validate` before handing off work. Live provider checks require an explicit OpenAI profile and are never part of the ordinary local test command.

## Repository layout

- `src/agents/` executable agent implementations
- `src/coordination/` task scheduling and lifecycle
- `src/providers/` local and OpenAI provider adapters
- `src/state/` versioned state stores
- `src/tasks/` task state machine persistence
- `tests/` TypeScript unit and integration tests
- `units/` organizational domain content
- `docs/` maintained product documentation

The manuscript source is under `docs/manuscript/`. Run `npm run manuscript:check` when publication artifacts are in scope. Its generated output is ignored and must not be edited or committed.
