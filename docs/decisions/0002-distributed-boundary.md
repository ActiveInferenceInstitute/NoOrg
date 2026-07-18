# ADR-0002: multi-process and distributed boundary

Status: evidence-required

The supported deployment remains single-process. Event streaming, external queues, multi-process scheduling, and distributed deployment require a new failure model before implementation.

## Required evidence

Any proposal must specify ownership and recovery for task leases, state transitions, event delivery, provider calls, retries, shutdown, clock skew, network partitions, duplicate messages, and process crashes. It must test:

- duplicate submissions and idempotency-key reuse;
- lease expiry and late agent settlement;
- durable event replay and consumer failure;
- provider side effects across retries;
- split-brain writers and recovery after partial persistence;
- ordered transitions and bounded shutdown across processes.

The evidence must distinguish at-least-once delivery, idempotent effects, and exactly-once external effects. Exactly-once external effects are not inferred from a local transaction or a passing integration test.

## Decision gate

Do not add distributed coordination or claim consensus, exactly-once behavior, provider quality, or general scalability until the failure model, experiment harness, raw results, and operational rollback plan are reviewed together.
