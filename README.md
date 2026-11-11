# NoOrg

NoOrg is a typed TypeScript runtime for coordinating executable agents with durable task state, explicit language-model providers, and observable lifecycle behavior. It is developed and maintained by the [Active Inference Institute](https://activeinference.institute/).

## Status

NoOrg is an active research runtime at working-copy maturity. The default development profile runs fully offline against the deterministic local provider; the OpenAI provider and the live test suite require an `OPENAI_API_KEY`. Container deployment uses the committed `Dockerfile` and `docker-compose.yml`. External agent modules require explicit trust configuration.

## Contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Runtime surface](#runtime-surface)
- [Example](#example)
- [Architecture](#architecture)
- [Development commands](#development-commands)
- [Project guides](#project-guides)
- [License](#license)
- [InstituteOS sidecar](#instituteos-sidecar)

## Requirements

- Node.js 22 or newer
- npm
- An OpenAI API key only when using the explicit `openai` provider

## Quick start

```bash
npm install
cp .env.example .env
npm run validate
npm start
```

The default development profile uses the deterministic local provider and requires no network access. Production requires `NOORG_LLM_PROVIDER=openai` and `OPENAI_API_KEY`.

## Runtime surface

- `GET /health` reports process health.
- `GET /ready` reports coordinator readiness.
- `GET /metrics` exposes runtime counters when metrics are enabled.
- `POST /v1/tasks`, `GET /v1/tasks`, `GET /v1/tasks/:id`, and `POST /v1/tasks/:id/cancel` expose the authenticated task API.
- The generated [OpenAPI contract](docs/api/openapi.json) is checked against the implemented routes.
- `Coordinator.submitTask()` queues a typed task for a registered executable agent.
- Optional agent modules are explicitly configured with `NOORG_AGENT_MODULES`; organizational Markdown is available only through the opt-in `UnitCorpus` adapter and its reviewed manifest.
- External agent modules require `NOORG_AGENT_MODULE_TRUSTED_SHA256` provenance allowlisting.

## Example

```bash
npm run example
```

The example uses the local provider, executes a real analysis agent, and prints the completed task result.

## Architecture

The composition root creates configuration, state, provider, event bus, metrics, registry, agents, coordinator, and HTTP server. Dependencies are injected into each component, and shutdown disposes them in reverse order.

```text
HTTP or library caller
        |
    Coordinator
     /       \
Task store   Agent registry
                 |
             Agent.execute
                 |
          Local or OpenAI provider
```

See the [documentation index](docs/README.md), [architecture](docs/architecture.md), [configuration](docs/configuration.md), [operations](docs/operations.md), and [testing](docs/testing.md). The reproducible [manuscript](docs/manuscript/README.md) documents the executable contracts, task semantics, and claim boundaries.

## Development commands

```bash
npm run type-check
npm run lint
npm test
npm run validate:text
npm run validate:docs
npm run validate:units
npm run units:manifest:check
npm run api:openapi:check
npm run validate:contracts
npm run validate:decisions
npm run build
npm run manuscript:check
npm run release:check
```

Generated files belong in ignored build, coverage, runtime-data, log, and `docs/manuscript/output/` directories. The repository stores source, tests, configuration, manuscript source, documentation, and domain unit content.

Use `npm run release:check` before publishing or pushing release work. It composes the local validation gate, executable example, dependency audit, manuscript rendering and inspection, and whitespace checks. Use `npm run clean` only for generated build, coverage, and manuscript-output directories; runtime state under `data/` is not deleted by the cleanup command.

## Project guides

Each maintained directory carries a local guide:

- [`docs/`](docs/README.md) — documentation index, with per-topic and manuscript pages.
- [`src/`](src/README.md) — source modules and runtime conventions.
- [`tests/`](tests/README.md) — unit, integration, and live suites.
- [`scripts/`](scripts/README.md) — repository validation and generation gates.
- [`units/`](units/README.md) — reviewed organizational corpus and its integrity manifest.
- [`examples/`](examples/README.md) — the runnable executable example.

## License

NoOrg is published under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE.md). See [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), and the [Code of Conduct](CODE_OF_CONDUCT.md) for collaboration guidelines. To cite this repository, use the [CITATION.cff](CITATION.cff) metadata.

## InstituteOS sidecar

This repository carries a committed [`.aii/`](.aii/README.md) sidecar with curated
InstituteOS metadata (`aii-sidecar/v1`): category, maturity, ecosystem relations,
key artifacts, provenance, and portable tasks. It is read by
[InstituteOS](https://github.com/ActiveInferenceInstitute/InstituteOS) tooling and
does not affect the project's build or runtime.
