# Execution semantics {#sec:execution}

The lifecycle is a bounded sequence shown in [@fig:lifecycle]. A queued task is eligible for a claim; a running task owns one agent reservation; a terminal task owns no reservation. Failure may requeue the task only while the attempt limit permits another execution.

![Task lifecycle and reservation boundary.](output/figures/lifecycle.png){#fig:lifecycle}

## Timeout, cancellation, and retry

For deadline \(d\), the coordinator races agent completion against a timer. A timeout aborts the signal and waits for the agent promise to settle before releasing the lease. Cancellation follows the same reservation rule but produces the cancelled state when the repository still sees running work.

$$
\mathsf{retryable}(e, n, m) \iff e.retryable \land n < m,
\qquad
\mathsf{next}(R,e) =
\begin{cases}
Q & \mathsf{retryable}(e,n,m)\\
F & \text{otherwise.}
\end{cases}
$$ {#eq:timeout-retry}

The startup recovery rule treats persisted running records as interrupted. A record is requeued when its attempt budget permits; otherwise it is failed with a structured interruption error. Recovery is explicit, so a process restart cannot turn an unfinished execution into an unqualified success.

## Event delivery

Events have an identifier, type, timestamp, and JSON payload. A handler is invoked at most once for an event identifier and subscription position within a bus instance. Delivery is recorded after successful handler settlement. A handler deadline bounds the publisher’s wait; a timed-out handler remains tracked until its promise settles, so `close()` drains it before the bus is disposed.

$$
\mathsf{delivered}(e,h) \Rightarrow \#\mathsf{invoke}(e,h)=1,
\qquad
\mathsf{close}(B) \Rightarrow \forall p\in\mathsf{inFlight}(B),\;p\text{ settled}.
$$ {#eq:event-delivery}

## Readiness and metrics

Readiness is an operational predicate rather than a static process check:

$$
\mathsf{ready} \iff
  \mathsf{coordinatorStatus}=\mathsf{running}
  \land \mathsf{registryInitialized}
  \land |\mathsf{agents}|>0
  \land \mathsf{providerOpen}
  \land \mathsf{stateOpen}.
$$ {#eq:readiness}

The HTTP surface exposes `/health`, `/ready`, and `/metrics`. Counters and duration observations are updated by actual task transitions. No endpoint reports a fabricated dependency state.
