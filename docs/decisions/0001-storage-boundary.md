# ADR-0001: durable storage boundary

Status: evidence-required

NoOrg remains a single-process file-backed runtime. SQLite or another indexed store is justified only after a measured workload demonstrates that the current store is the limiting factor rather than task execution, provider latency, or host resources.

## Required evidence

Measure the same workload at 1,000, 10,000, and 100,000 task records with representative result and usage sizes. Record:

- create, transition, list, and restart-recovery p50/p95/p99 latency;
- state-file bytes, temporary-file bytes, and flush duration;
- lock wait duration and concurrent-writer refusal behavior;
- corrupt-file recovery, interrupted replacement, and stale-lock reclamation;
- memory use and CPU time at each workload size.

The evidence must include the command, host/runtime versions, raw measurements, and a regenerated report. It must separate warm-cache and cold-cache results.

## Decision gate

Adopt an indexed store only when the file store breaches an explicitly recorded service limit at a supported workload, and the replacement passes an equivalent schema, recovery, single-writer, and shutdown test matrix. Preserve the `StateStore` boundary so the migration remains reversible.

No current release claims general scalability or recommends SQLite without this evidence.
