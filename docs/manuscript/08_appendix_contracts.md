# Appendix: contracts {#sec:contracts}

## Public TypeScript surface

The root module exports `Agent`, `AgentDescriptor`, `AgentContext`, `AgentTask`, `AgentResult`, `TaskRepository`, `AgentRegistry`, `TaskScheduler`, `StateStore`, `EventBus`, and `LLMProvider`. The composition root exports `createApplication` for the executable HTTP process. The coordinator is constructor-injected and exposes `start()`, `submitTask()`, `cancelTask()`, `getTask()`, `listTasks()`, and `shutdown()`.

## Provider contract

`LLMProvider.complete(request, schema, signal)` returns a response whose `data` has been parsed by the supplied schema and whose usage contains prompt tokens, completion tokens, total tokens, and cost. `DeterministicProvider` requires a caller-supplied derivation. `OpenAIProvider` requires an API key and uses structured response parsing. A closed provider rejects new calls.

## State envelope

The file store serializes `{ schemaVersion: 2, revision, state }`. Values are JSON values validated on write and read. Writes use a process lock, a private temporary file, and atomic replacement. Reads return defensive copies. A version-one envelope migrates to version two with revision zero; an invalid envelope fails startup.

## Error contract

Errors carry a stable code, safe message, retryability, and optional JSON details. Task errors are persisted when a transition records failure or interruption. Provider and task execution errors are logged without credentials, reflected in state, and propagated to the caller when no task transition can contain them.
