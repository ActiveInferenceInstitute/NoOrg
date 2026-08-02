# Contributing

NoOrg is a small, typed TypeScript runtime with a strict local validation gate. Contributions are welcome as focused pull requests against `main`.

## Workflow

1. Install dependencies with `npm install`.
2. Make source changes under `src/` and add or update TypeScript tests under `tests/`.
3. Document public behavior and configuration changes: update `README.md`, the relevant page under `docs/`, and the changelog (`CHANGELOG.md`). New future work goes into the active roadmap at the repository root as an open item; completed items are removed from it rather than left marked complete.
4. Run `npm run validate` and keep the gate green (type check, lint, formatting, tests, coverage, repository/docs/units/contract/decision validators, OpenAPI check, and build).
5. When publication artifacts are in scope, run `npm run manuscript:check` and keep generated output out of source control.
6. Commit in small, conventional steps (`docs:`, `fix:`, `feat:`, `test:`, `ci:`) and open a pull request.

## Rules of the road

- Keep changes focused; do not mix unrelated edits into one pull request.
- Preserve typed boundaries: all dependencies are constructor-injected, all task transitions pass through `TaskRepository`, and all external model calls pass through `LLMProvider`.
- Include failure-path coverage for new runtime behavior, not only the happy path.
- Never commit credentials, runtime state, logs, coverage output, or generated build artifacts.
- Manuscript prose must not contain hand-maintained measurements; changing values enter through evidence tokens hydrated by `scripts/manuscript.ts`.
