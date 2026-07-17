# Evaluation {#sec:evaluation}

The release evaluation is a local, deterministic execution of the repository gates. The evidence collector constructs a real `Coordinator`, `AgentRegistry`, `AnalysisAgent`, `DeterministicProvider`, `MemoryStateStore`, event bus, logger, clock, and metrics object. It submits a task through the public scheduler interface and waits for the persisted terminal record. It also records provider usage, state revision, readiness, and event delivery.

The release evidence reports {{EVIDENCE_TEST_COUNT}} passing Jest tests, {{EVIDENCE_UNIT_FILES}} unit-corpus Markdown files, and {{EVIDENCE_LINK_COUNT}} resolved relative Markdown links. The coordinator task reached `{{EVIDENCE_COMPLETED_STATUS}}`, consumed {{EVIDENCE_TOTAL_TOKENS}} provider tokens, and produced a state revision of {{EVIDENCE_STATE_REVISION}}. These are observations from the current checkout, not enduring performance guarantees.

| Property | Evidence source | Observed value |
| --- | --- | --- |
| Agent execution | Coordinator integration path | `{{EVIDENCE_COMPLETED_STATUS}}` |
| Local provider accounting | Provider response | `{{EVIDENCE_TOTAL_TOKENS}}` total tokens, `{{EVIDENCE_COST_USD}}` cost |
| State revision | State store | `{{EVIDENCE_STATE_REVISION}}` |
| Unit corpus | Corpus validator | `{{EVIDENCE_UNIT_FILES}}` Markdown files |
| Relative links | Corpus validator | `{{EVIDENCE_LINK_COUNT}}` resolved links |
| Event delivery | Event bus counter | `{{EVIDENCE_EVENT_DELIVERIES}}` delivery |

Table [@tbl:evaluation-properties] is deliberately small. It records the contract surfaces that can be established without a network service. Provider quality, response latency distributions, multi-process throughput, and general intelligence are outside the evidence boundary.

Table: Release evidence fields collected from executable checks. {#tbl:evaluation-properties}
