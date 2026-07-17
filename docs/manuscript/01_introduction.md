# Introduction {#sec:introduction}

Agent systems are useful only when their boundaries are explicit enough to inspect. An agent descriptor identifies capabilities and a concurrency limit; an agent context supplies the provider, state, logger, clock, and configuration; an agent execution consumes a typed task; and a result becomes durable only after schema validation. These are software contracts rather than promises about cognition. The distinction matters because an orchestration layer can otherwise report success while no executable component performed the requested work.

NoOrg addresses this problem as a single-process, durable coordination runtime. It is intentionally modest in scope. It does not claim distributed consensus, horizontal scalability, quality superiority among providers, or autonomous behavior beyond the registered implementations. Its stronger claim is narrower: the release gates make the implemented lifecycle observable and reject several classes of silent success.

The system is motivated by three failure surfaces. First, an untyped boundary permits malformed task inputs and results to cross module boundaries. Second, asynchronous work can outlive a timeout or cancellation and continue consuming a reservation. Third, generated documentation can drift from the executable system. NoOrg treats these as one connected problem: typed contracts constrain the runtime, lifecycle rules constrain time, and evidence hydration constrains publication claims.

The remainder of the manuscript defines the model in [@sec:system-model], describes the architecture in [@sec:architecture], formalizes execution in [@sec:execution], reports measured checks in [@sec:evaluation], and records reproducibility and claim boundaries in [@sec:reproducibility] and [@sec:claims].
