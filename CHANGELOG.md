# Changelog

## Unreleased

- Hardened the HTTP request surface: explicit header/request/keep-alive timeouts, a cap on concurrent in-flight requests (`503 SERVER_BUSY`), a per-client authentication-failure throttle (`429 AUTH_RATE_LIMITED`), and constant-time bearer-token comparison.
- Remediated a high-severity transitive `brace-expansion` dependency advisory in build/lint tooling (`npm audit fix`); `npm audit --audit-level=high` is clean.
- Wired the 90% line / 80% branch coverage threshold into the ordinary `npm run validate` gate and closed earlier branch-coverage gaps with real regression tests (coordinator restart guard, priority inheritance, task-load integrity, file-state updates, review-scoring and data-record branches, provider usage passthrough, lock-owner parsing, event-delivery resilience).
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
