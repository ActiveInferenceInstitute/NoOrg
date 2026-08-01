# NoOrg active roadmap

This file contains active future work only. Completed, obsolete, or rejected work is removed rather than archived here; Git history is the historical record, and review passes consolidate their completed findings under an explicit section below.

Updated: 2026-08-01
Owner: Active Inference Institute
Status: active
Last reviewed: 2026-08-01

## Working rules

- Work in priority order unless a dependency explicitly permits parallel work.
- Every implementation item requires source, tests, documentation, and generated-artifact alignment where applicable.
- Preserve the single-process deployment boundary until measured evidence justifies a storage or scheduling redesign.
- Keep live OpenAI checks explicit and opt-in; ordinary validation remains network-free.

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

Result after this pass: 85 tests passing (1 live OpenAI test skipped by design), line coverage 95.19%, branch coverage 83.67% (thresholds 90/80), and the full `npm run validate`, `npm run example`, `npm run manuscript:check`, and `git diff --check` gates are green.

## P3 — Deliberate future decisions

- [ ] Evaluate SQLite or another indexed durable store only after measured task-volume limits justify replacing the file store; record p50/p95/p99 latency, restart recovery, lock contention, disk growth, and failure behavior at 1k, 10k, and 100k records.
- [ ] Evaluate event streaming, external queues, multi-process scheduling, and distributed deployment only with new failure-model and evidence requirements covering leases, duplicate effects, event delivery, provider outages, and split-brain recovery.
- [ ] Do not claim distributed consensus, exactly-once external effects, provider quality, or general scalability without dedicated experiments and evidence collectors.

## Completion gate

Before closing any phase, run `npm run validate`, the relevant focused tests, `npm run manuscript:check`, `npm run release:check`, and `git diff --check`. No generated output, credentials, runtime state, or temporary files may be tracked, and documentation, manuscript claims, tests, and public types must agree with the implementation.
