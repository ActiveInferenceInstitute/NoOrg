# NoOrg documentation

This index maps the maintained documentation for the NoOrg runtime. Product documentation lives in `docs/`; the reproducible manuscript source lives in `docs/manuscript/`; the reviewed organizational corpus lives in `units/`.

## Runtime documentation

- [Architecture](architecture.md) — composition root, dependency graph, execution graph, and one-source-of-truth rules.
- [Configuration](configuration.md) — environment variables, defaults, validation rules, and the HTTP task API surface.
- [Operations](operations.md) — local execution, container deployment, HTTP hardening, state, shutdown, and release commands.
- [Testing](testing.md) — the local validation gate, the live provider suite, coverage thresholds, and the publication gate.
- [Units](units.md) — the reviewed organizational Markdown corpus and its integrity manifest.

## Reference material

- [Architecture decision records](decisions/README.md) — evidence-gated boundaries for storage and distributed deployment changes.
- [OpenAPI contract](api/openapi.json) — generated HTTP description, checked against the implemented routes.
- [Manuscript](manuscript/README.md) — reproducible publication source, evidence hydration, and rendering pipeline.

## Repository guides

- [Repository overview](../README.md)
- [Contributing](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)
- [Code of conduct](../CODE_OF_CONDUCT.md)
- [License](../LICENSE.md)
