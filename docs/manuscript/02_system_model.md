# System model {#sec:system-model}

Let a task be a record \(\tau\) with identifier, input, requested capabilities, attempt count, and status. The status set is \(S = \{Q,R,C,F,X\}\), corresponding to queued, running, completed, failed, and cancelled. A repository transition is a partial function over a task and an event:

$$
\delta : S \times E \rightharpoonup S,
\qquad
\delta(Q, \mathsf{start}) = R,
\quad \delta(R, \mathsf{complete}) = C,
\quad \delta(R, \mathsf{fail}) \in \{Q,F\},
\quad \delta(Q,\mathsf{cancel}) = \delta(R,\mathsf{cancel}) = X.
$$ {#eq:task-transition}

The repository is the authority for transitions. A transition that is undefined by [@eq:task-transition] is rejected and cannot be persisted. A completed record carries a result and completion time; a running record carries a start time; terminal failure and cancellation carry completion time. These predicates are enforced both at mutation and at state-load boundaries.

An agent \(a\) is admissible for task \(\tau\) when its identifier constraint, capability set, and reservation limit all hold:
$$
\mathsf{admissible}(a,\tau) \iff
(\tau.agentId = \varnothing \lor \tau.agentId = a.id)
\land \tau.capabilities \subseteq a.capabilities
\land \mathsf{active}(a) < a.maxConcurrentTasks.
$$ {#eq:capability-match}

The reservation invariant is:
$$
0 \leq \mathsf{active}(a) \leq a.maxConcurrentTasks.
$$ {#eq:reservation-invariant}

A reservation is released only after the execution promise settles. Thus timeout and cancellation update task state without making capacity available while the underlying agent operation is still pending. Task state and execution-resource state are deliberately separate.

The provider boundary accepts a request, a schema, and an abort signal. The response enters the task path only when parsing succeeds:
$$
\mathsf{accepted}(r,\sigma) \iff \exists v\;[r.data=v \land \sigma.parse(v)=v].
$$ {#eq:provider-validation}

This model separates four facts that are often conflated: a request was accepted, an agent ran, a result was structurally valid, and the result was durably recorded. NoOrg reports completion only after all four facts hold.

Requests may be deduplicated by an idempotency key and may name a bounded dependency set. A dependent task remains queued until every dependency completes; a failed or cancelled dependency fails the descendant explicitly. Retryable failures requeue with exponential backoff metadata, and a deadline can expire queued work before an agent lease is acquired.
