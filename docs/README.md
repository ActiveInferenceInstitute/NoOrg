# NoOrg documentation

This index maps the maintained documentation for the NoOrg runtime. Product documentation lives in `docs/`; the reproducible manuscript source lives in `docs/manuscript/`; the reviewed organizational corpus lives in `units/`. The flat list of long-lived documents is [`documentation-index.md`](documentation-index.md).

## Runtime documentation

- [Architecture](architecture.md) — composition root, dependency graph, execution graph, and one-source-of-truth rules.
- [Configuration](configuration.md) — environment variables, defaults, validation rules, and the HTTP task API surface.
- [Operations](operations.md) — local execution, container deployment, HTTP hardening, state, shutdown, and release commands.
- [Testing](testing.md) — suites, coverage thresholds, the live provider profile, and the publication gate.
- [Units](units.md) — the reviewed organizational Markdown corpus and its integrity manifest.

## Validation gate

- [Validation gate](gate.md) — the `./run.sh` entry point, every arm, and the CI job that runs it.
- [Gate measurements](_generated/gate-timings.md) — generated wall time per arm with test and coverage evidence; refresh with `./run.sh report`.
- [Gate baseline](_generated/gate-baseline.json) — the pre-change arm measurements used as the comparison column.
- [GNN conformance](../.github/GNN.md) — the pinned parser revision, what the conformance job parses, and the claim limits.

## Reference material

- [Documentation index](documentation-index.md) — flat index of every long-lived document.
- [Architecture decision records](decisions/README.md) — evidence-gated boundaries for storage and distributed deployment changes.
- [OpenAPI contract](api/openapi.json) — generated HTTP description, checked against the implemented routes.
- [Manuscript](manuscript/README.md) — reproducible publication source, evidence hydration, and rendering pipeline.

## Repository guides

- [Repository overview](../README.md)
- [Engineering guide](../AGENTS.md)
- [Contributing](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)
- [Code of conduct](../CODE_OF_CONDUCT.md)
- [License](../LICENSE.md)
