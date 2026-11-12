# NoOrg active roadmap

This file contains active future work only. Completed, obsolete, or rejected work is removed rather than archived here; Git history is the historical record, and review passes consolidate their completed findings under an explicit section below.

Updated: 2026-11-12
Owner: Active Inference Institute
Status: active
Last reviewed: 2026-11-12

## Working rules

- Work in priority order unless a dependency explicitly permits parallel work.
- Every implementation item requires source, tests, documentation, and generated-artifact alignment where applicable.
- Preserve the single-process deployment boundary until measured evidence justifies a storage or scheduling redesign.
- Keep live OpenAI checks explicit and opt-in; ordinary validation remains network-free.

## Completed/Closed — 2026-11-12 gate and documentation pass

- [x] Added `./run.sh` as the single gate entry point, with the arm list declared once in `scripts/gate.ts` and every arm calling one npm or repository script; `npm run validate` now runs the `all` arm. Affected: `run.sh`, `scripts/gate.ts`, `package.json`.
- [x] Split the test command: `npm run test:fast` selects `tests/unit`, `npm test` keeps the network-free unit and integration suites, and `npm run test:coverage` enforces the coverage thresholds and writes `coverage/jest-results.json` and `coverage/coverage-summary.json`. Live provider coverage stays behind `npm run test:live`. Affected: `package.json`, `jest.config.cjs`, `tests/README.md`.
- [x] Removed duplicated CI work: each job installs dependencies once, coverage runs once on Node 24, Node 22 retains both offline suites without coverage instrumentation, and `validate:text` runs only inside `policy`. Affected: `.github/workflows/ci.yml`.
- [x] Moved the pinned GNN conformance check from inline workflow Python into `scripts/gnn-conformance.py`, which also validates the `gnn-importer-pin/v1` schema and the commit id in `.github/gnn-pin.json`; the container build and readiness probe moved into `scripts/container-check.sh`. Affected: `scripts/gnn-conformance.py`, `scripts/container-check.sh`, `.github/workflows/ci.yml`.
- [x] Added `docs/gate.md`, the flat `docs/documentation-index.md`, and the generated `docs/_generated/gate-timings.md`; pre-change arm measurements are recorded in `docs/_generated/gate-baseline.json`. Affected: `docs/gate.md`, `docs/documentation-index.md`, `docs/README.md`, `docs/testing.md`, `_generated`.
- [x] Corrected the sidecar `docs` entries to `docs/INTEGRATION.md` and `docs/AGENTS.md`, which resolve relative to `.aii/` and match the files that exist there; `aii_platform.aii_sidecar validate` reports `OK`. Affected: `.aii/config.yaml`. Evidence: #17 (`e60bede`), #18 (`a10ee20`).
- [x] Made the manuscript evidence record `sourceDirty` alongside `sourceCommit`, and made the rendered-PDF check reject the same unresolved `{{`/`[?` tokens and references the HTML check already rejected. Affected: `scripts/manuscript.ts`. Evidence: #17 (`e60bede`).
- [x] Made `scripts/gnn-conformance.py` require exactly `True` from `GNNTypeChecker.validate_gnn_files`, so the `2` and `False` sentinels no longer print a passing receipt; `validate_gnn_syntax` receives `is_content=True`, and the receipt's `scope`/`result` distinguish repository sketches from the pinned exemplar baseline. Affected: `scripts/gnn-conformance.py`, `.github/GNN.md`, `docs/gate.md`. Evidence: #20 (`087d49b`); `tests/unit/gnn-conformance.test.ts` asserts `2`, `False` and `None` fail on both source paths.

## Completed/Closed — 2026-08-01 red-team fix pass

Implemented during the deepest hostile red-team review; every validated Minor and Medium finding from that pass is closed here.

- [x] Enforce coverage in the ordinary `npm run validate` gate by routing the test step through `npm run test:coverage`. Previously the 90% line / 80% branch thresholds were enforced only by the separate `test:coverage` command (contradicting docs/testing.md), and branch coverage sat exactly at 80.00. Aligned docs/testing.md with the gate. Affected: `package.json`, `docs/testing.md`.
- [x] Close a timing side-channel on the HTTP auth token by replacing the plain string-comparison bearer check in `src/http/server.ts` with a constant-time comparison via the new `isBearerAuthorized` helper; added unit tests covering equal, wrong, missing, and differing-length credentials.
- [x] Harden the HTTP request surface against resource exhaustion (the scoped Major): explicit header/request/keep-alive timeouts, a cap on concurrent in-flight requests (`503 SERVER_BUSY`), and a per-client authentication-failure throttle with window reset (`429 AUTH_RATE_LIMITED`) via the new `AuthThrottle`. Documented in `docs/operations.md` and `SECURITY.md`; covered by unit and HTTP integration tests.
- [x] Add regression coverage for the coordinator restart guard: `Coordinator.start()` after `shutdown()` rejects `COORDINATOR_CLOSED` (`src/coordination/coordinator.ts`).
- [x] Add regression coverage for `TaskRepository.effectivePriority` inherited-priority ordering under `inherit_max` with a `wait_for_success` parent (`src/tasks/task-repository.ts`).
- [x] Add regression coverage for `TaskRepository.load` rejection of a missing parent, a missing dependency, a persisted dependency cycle, and duplicate persisted idempotency keys (`src/tasks/task-repository.ts`).
- [x] Add regression coverage for `FileStateStore.update`, non-JSON numeric lock-owner parsing, and `FileStateStore` round-trips (`src/state/state-store.ts`).
- [x] Add coverage for review-scoring and record-input agent branches and provider usage passthrough.

Result after that pass: 85 tests passing (1 live OpenAI test skipped by design), line coverage 95.19%, branch coverage 83.67% (thresholds 90/80), and the full `npm run validate`, `npm run example`, `npm run manuscript:check`, and `git diff --check` gates are green.

The 2026-08-02 documentation pass verified the current state: 86 tests passing (1 live OpenAI test skipped by design), and every local validation gate green.

## Completed/Closed — 2026-08-02 documentation deep pass

Implemented during the documentation-focused review; every scoped Minor and Medium finding from that pass is closed here, and the full review record is in `REVIEW_LOG_2026-08-02.md`.

- [x] Add a maintained documentation index at `docs/README.md` and link it from the repository README together with the manuscript, a completed development-command list, and license/contributing/security/code-of-conduct references. Affected: `docs/README.md`, `README.md`.
- [x] Add the missing `OPENAI_BASE_URL` row to the configuration reference table so the table matches `.env.example` and `src/config/config.ts`. Affected: `docs/configuration.md`.
- [x] Document container deployment (committed `Dockerfile` and `docker-compose.yml` were previously undocumented) and the CI container job's readiness probe. Affected: `docs/operations.md`.
- [x] Expand `CONTRIBUTING.md` with the contribution workflow, conventional commit steps, documentation obligations, and the local validation gate. Affected: `CONTRIBUTING.md`.
- [x] Add `CITATION.cff` with authors from the manuscript metadata, the repository license, and version, with no fabricated identifiers. Affected: `CITATION.cff`, `README.md`.
- [x] Fix trailing whitespace in `LICENSE.md` and correct the stale test count in this roadmap (85 → 86 passing). Affected: `LICENSE.md`, `TODO.md`.
- [x] Replace boilerplate corpus guides with content that matches `docs/units.md`, and repair the 21 invalid Mermaid closing fences in `units/unitdirectory.md`; refresh the reviewed `units/manifest.json` after inspection (3 file digests changed). Affected: `units/README.md`, `units/AGENTS.md`, `units/unitdirectory.md`, `units/manifest.json`.
- [x] Replace auto-generated "Technical Documentation" files under `.github/` and `.obsidian/` with accurate, concise content. Affected: `.github/README.md`, `.github/AGENTS.md`, `.github/workflows/README.md`, `.obsidian/README.md`, `.obsidian/AGENTS.md`.
- [x] Document how to run the executable example. Affected: `examples/README.md`.

## Completed/Closed — 2026-11-11 documentation completeness pass

Implemented during the third documentation pass; the repository's documentation tree, guides, and sidecar were brought to full coverage. All gates remain green.

- [x] Add the missing folder guides for the remaining unguided top-level directories: `src/README.md`, `src/AGENTS.md`, `tests/README.md`, `tests/AGENTS.md`, and `scripts/README.md`. Affected: `src/README.md`, `src/AGENTS.md`, `tests/README.md`, `tests/AGENTS.md`, `scripts/README.md`.
- [x] Add a status statement and table of contents to the repository README, and link the per-directory guides from a new project-guides section. Affected: `README.md`.
- [x] Record the folder-guide convention in the engineering guide. Affected: `AGENTS.md`.
- [x] Add the missing `institute.maturity` field to the InstituteOS sidecar so `config.yaml` matches the rendered sidecar documents, and bump `meta.updated`. The rendered `README.md` and `docs/INTEGRATION.md` were hand-checked for consistency because `aii_platform` is unavailable offline. Affected: `.aii/config.yaml`.

## Open / deferred — 2026-08-02 documentation pass

- Per-file content review of the 1824-file `units/` corpus (`git ls-files units | wc -l`) beyond the corpus-level fixes above; out of scope for a documentation pass. Owner: whoever next edits `units/`.
- `docs/manuscript/output/` evidence refresh; generated by CI, never committed. Blocked on: GitHub Actions is billing-locked org-wide, so the `manuscript-source` job cannot produce the artifact; the refresh has to be run locally with the Pandoc, Pandoc-crossref, XeLaTeX, `pdftotext`, and headless-browser toolchain that `./run.sh manuscript` requires.
- The P3 items below remain open by design.

## Open — 2026-11-12 estate pin alignment

- [ ] Move `.github/gnn-pin.json` from `v5.0.3` (`8f293d9ba810e6eda5c09842d9c7ed9ffa5f92c1`) to the estate standard `v5.1.0` (`75c834bd8519dc7b5adc4d24f16bf393cfd1ecdf`), then re-run `./run.sh gnn`. The pin is the only GNN reference in the repository: `scripts/gnn-conformance.py` installs that exact revision and asserts `gnn.__version__` equals the tag, and `.github/workflows/ci.yml` repeats the tag in a comment. The bump is not a one-line edit: the script imports `gnn.parsers.basic` (`parse_gnn_formal`, `validate_gnn_syntax`) and `gnn.type_checker.GNNTypeChecker`, so those entry points must be re-checked against the new revision first. Owner: repository maintainer. Blocked on: nothing external, but the hosted `gnn-conformance` job cannot supply evidence while GitHub Actions is billing-locked org-wide, so the pass must be recorded from a local `./run.sh gnn` run.

Note: the estate's `inferactively-pymdp` 1.0.5 pin does not apply to this repository. The runtime is TypeScript — `package.json` depends only on `openai` and `zod` — and no tracked file references `pymdp` or `inferactively`. Do not add a Python pin here without a Python consumer.

## P3 — Deliberate future decisions

- [ ] Evaluate SQLite or another indexed durable store only after measured task-volume limits justify replacing the file store; record p50/p95/p99 latency, restart recovery, lock contention, disk growth, and failure behavior at 1k, 10k, and 100k records.
- [ ] Evaluate event streaming, external queues, multi-process scheduling, and distributed deployment only with new failure-model and evidence requirements covering leases, duplicate effects, event delivery, provider outages, and split-brain recovery.
- [ ] Do not claim distributed consensus, exactly-once external effects, provider quality, or general scalability without dedicated experiments and evidence collectors.

## Completion gate

Before closing any phase, run `npm run validate`, the relevant focused tests, `npm run manuscript:check`, `npm run release:check`, and `git diff --check`. No generated output, credentials, runtime state, or temporary files may be tracked, and documentation, manuscript claims, tests, and public types must agree with the implementation.
