# Changelog

## Unreleased

- Hardened task schemas, cancellation and timeout state transitions, scheduler fairness, bounded shutdown, state locking, provider retries, redacted logging, and Prometheus output.
- Added authenticated versioned HTTP task endpoints, request limits, expanded health signals, injectable OpenAI transport tests, and coverage gates.
- Added idempotent/dependency-aware tasks, deadlines, retry backoff, query filters, provider budgets/rate limits/circuit breaking, per-task usage attribution, versioned agent loading, modular built-ins, and a provenance-safe unit corpus adapter.
- Task records now preserve the requested agent identity separately from the scheduler-assigned agent identity so idempotent replays remain stable after execution.
- Added bounded workflow depth/breadth, priority inheritance, parent-success gates, durable retry usage accumulation, in-flight provider budget reservations, external agent digest trust, per-file corpus integrity diffs, and a generated OpenAPI contract.
- Added evidence-gated architecture decision records for indexed storage and multi-process/distributed deployment; no scalability or exactly-once claims are added.
- Added reviewed corpus integrity manifests, contract/documentation validation, and failure-clean manuscript output handling.
- Added an active-only roadmap; generated artifacts and live provider checks remain outside ordinary validation.

## 2.0.0

- Rebuilt the runtime around typed executable agents, explicit providers, durable state, and lifecycle-safe coordination.
- Added local contract execution and explicit live OpenAI validation.
- Replaced generated repository artifacts and stale verification material with source-based checks.
