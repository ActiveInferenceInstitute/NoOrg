# System Tests

End-to-end scenarios for the NoOrg coordinator and agents. These tests should exercise real coordination flows (registration, task assignment, execution paths, and state persistence).

- Use the production wiring (no stubbed managers) to mirror runtime behavior.
- Keep fixtures small and deterministic; prefer recorded inputs over live network calls.
- Add health/metrics assertions to align with `/health` and monitoring expectations.

