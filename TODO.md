# NoOrg active roadmap

This file contains active future work only. Completed, obsolete, or rejected work is removed rather than archived here; Git history is the historical record.

Updated: 2026-07-17

## Working rules

- Work in priority order unless a dependency explicitly permits parallel work.
- Every implementation item requires source, tests, documentation, and generated-artifact alignment where applicable.
- Preserve the single-process deployment boundary until measured evidence justifies a storage or scheduling redesign.
- Keep live OpenAI checks explicit and opt-in; ordinary validation remains network-free.

## P3 — Deliberate future decisions

- [ ] Evaluate SQLite or another indexed durable store only after measured task-volume limits justify replacing the file store; record p50/p95/p99 latency, restart recovery, lock contention, disk growth, and failure behavior at 1k, 10k, and 100k records.
- [ ] Evaluate event streaming, external queues, multi-process scheduling, and distributed deployment only with new failure-model and evidence requirements covering leases, duplicate effects, event delivery, provider outages, and split-brain recovery.
- [ ] Do not claim distributed consensus, exactly-once external effects, provider quality, or general scalability without dedicated experiments and evidence collectors.

## Completion gate

Before closing any phase, run `npm run validate`, the relevant focused tests, `npm run manuscript:check`, `npm run release:check`, and `git diff --check`. No generated output, credentials, runtime state, or temporary files may be tracked, and documentation, manuscript claims, tests, and public types must agree with the implementation.
