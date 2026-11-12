# Agent guide — `src/`

Read [`README.md`](README.md) and the top-level [`AGENTS.md`](../AGENTS.md) first. `src/` is the source of truth; generated output under `dist/` is never edited or committed.

## Rules

- Keep `src/index.ts` the composition root. Add modules and inject them there instead of reaching across layers.
- All agents implement `Agent` through `AbstractAgent`; external model calls go through `LLMProvider`; task transitions go through `TaskRepository`.
- Constructor-inject dependencies and expose a shutdown path for every background resource.
- Keep errors structured and actionable, and never log secrets.
- Update the matching test under `tests/` and the relevant document under `docs/` with every behavior change.

## Verify

Run `npm run type-check`, `npm run lint`, and `npm test` from the repository root; `npm run validate` is the full hand-off gate.
