# Claims and evidence {#sec:claims}

The manuscript distinguishes implemented guarantees from measured observations and open questions.

| Claim                                                                           | Class       | Evidence boundary                                     |
| ------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| A task is not completed before registered agent execution and result validation | Contract    | Agent, coordinator, repository, and integration tests |
| Persisted records obey the versioned envelope and task schema                   | Contract    | State-store tests and load-time validation            |
| Local provider output is deterministic only when a derivation is supplied       | Contract    | Provider unit tests and implementation                |
| Event handlers are awaited with timeout tracking and shutdown draining          | Contract    | Event-bus tests                                       |
| The current checkout passed the recorded local gates                            | Observation | Hydrated evidence JSON and command provenance         |
| The runtime is distributed, consensus-safe, or generally scalable               | Not claimed | Outside scope                                         |
| Provider responses are high quality or intelligent                              | Not claimed | No benchmark in this release                          |

The strongest release statement is consequently narrow: the checked source implements explicit contracts and the release commands report their observed evidence. A future claim about throughput, fault tolerance across hosts, or provider quality would require a new experiment and a new evidence collector.

The task graph, provider governance, and configurable extensions are implementation contracts, not evidence of distributed execution, economic optimality, or model quality. Those claims remain deliberately outside the release boundary.
