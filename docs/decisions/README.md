# Architecture decision records

These records define evidence gates for changes that would alter NoOrg's failure model. They are decision protocols, not performance claims. A change may cross a gate only when the named measurements, failure tests, and artifact provenance are recorded.

## Records

- [ADR-0001: durable storage boundary](0001-storage-boundary.md) — evidence required before replacing the single-process file store.
- [ADR-0002: multi-process and distributed boundary](0002-distributed-boundary.md) — evidence required before adding processes, queues, or distributed deployment.
