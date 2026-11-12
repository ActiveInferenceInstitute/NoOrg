# Documentation index

Flat index of the long-lived documentation in this repository. The narrative
hub is [`README.md`](README.md); the repository overview is
[`../README.md`](../README.md).

## Start here

- [Repository overview](../README.md) — what NoOrg is, quick start, runtime surface.
- [Documentation hub](README.md) — how the documentation is organized.
- [Architecture](architecture.md) — composition root, dependency graph, and one-source-of-truth rules.
- [Validation gate](gate.md) — the `./run.sh` entry point, its arms, and CI parity.
- [Configuration](configuration.md) — environment variables, defaults, and validation rules.
- [Operations](operations.md) — local execution, container deployment, state, shutdown, and release commands.
- [Testing](testing.md) — suites, coverage thresholds, and the live provider profile.
- [Units](units.md) — the reviewed organizational corpus and its integrity manifest.

## Reference

- [Gate measurements](_generated/gate-timings.md) — generated wall time per arm plus test and coverage evidence.
- [Gate baseline](_generated/gate-baseline.json) — pre-change arm measurements used as the comparison column.
- [GNN conformance](../.github/GNN.md) — the pinned parser, what the conformance job parses, and its limits.
- [OpenAPI contract](api/openapi.json) — generated HTTP description, checked against the implemented routes.
- [Architecture decision records](decisions/README.md) — [storage boundary](decisions/0001-storage-boundary.md) and [distributed boundary](decisions/0002-distributed-boundary.md).

## Manuscript

- [Manuscript overview](manuscript/README.md) — chapters, supporting sources, and commands.
- [Manuscript syntax](manuscript/SYNTAX.md) — Markdown and Pandoc-crossref conventions.
- [Manuscript guidance](manuscript/AGENTS.md) — token and evidence rules for changed prose.
- Chapters: [abstract](manuscript/00_abstract.md), [introduction](manuscript/01_introduction.md), [system model](manuscript/02_system_model.md), [architecture](manuscript/03_architecture.md), [execution semantics](manuscript/04_execution_semantics.md), [evaluation](manuscript/05_evaluation.md), [reproducibility](manuscript/06_reproducibility.md), [scope and related work](manuscript/07_scope_and_related_work.md), [appendix: contracts](manuscript/08_appendix_contracts.md), [claims and evidence](manuscript/09_claims_and_evidence.md), [glossary](manuscript/98_glossary.md), [references](manuscript/99_references.md).

## Repository guides

- [Engineering guide](../AGENTS.md) — runtime rules, layout, and verification.
- [Contributing](../CONTRIBUTING.md) — contribution workflow and obligations.
- [Security policy](../SECURITY.md) — reporting and deployment boundaries.
- [Code of conduct](../CODE_OF_CONDUCT.md)
- [License](../LICENSE.md)
- [Citation metadata](../CITATION.cff)
- [Changelog](../CHANGELOG.md)
- Active roadmap — open future work, at the repository root (the roadmap file is exempt from the unfinished-marker scan).
- [Repository description](../NoOrg.md)
- [2026-08-02 review record](../REVIEW_LOG_2026-08-02.md)

## Directory guides

- [`.aii/` sidecar](../.aii/README.md) — InstituteOS metadata, with its [agent guide](../.aii/AGENTS.md) and [integration note](../.aii/docs/INTEGRATION.md).
- [`.github/`](../.github/README.md) — CI jobs, Dependabot, GNN pin, with its [agent guide](../.github/AGENTS.md) and [workflow guide](../.github/workflows/README.md).
- [`.obsidian/`](../.obsidian/README.md) — editor configuration notes.
- [`docs/`](README.md)
- [`examples/`](../examples/README.md) — the runnable executable example.
- [`scripts/`](../scripts/README.md) — validation and generation gates, with its [agent guide](../scripts/AGENTS.md).
- [`src/`](../src/README.md) — source modules and runtime conventions, with its [agent guide](../src/AGENTS.md).
- [`tests/`](../tests/README.md) — unit, integration, and live suites, with its [agent guide](../tests/AGENTS.md).
- [`units/`](../units/README.md) — reviewed organizational corpus.
