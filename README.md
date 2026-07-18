# NoOrg

NoOrg is a typed TypeScript runtime for coordinating executable agents with durable task state, explicit language-model providers, and observable lifecycle behavior.

## Requirements

- Node.js 20 or newer
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

See [architecture](docs/architecture.md), [configuration](docs/configuration.md), [operations](docs/operations.md), and [testing](docs/testing.md).

## Development commands

```bash
npm run type-check
npm run lint
npm test
npm run validate:text
npm run validate:docs
npm run validate:units
npm run validate:contracts
npm run validate:decisions
npm run build
npm run manuscript:check
npm run release:check
```

Generated files belong in ignored build, coverage, runtime-data, log, and `docs/manuscript/output/` directories. The repository stores source, tests, configuration, manuscript source, documentation, and domain unit content.

Use `npm run release:check` before publishing or pushing release work. It composes the local validation gate, executable example, dependency audit, manuscript rendering and inspection, and whitespace checks. Use `npm run clean` only for generated build, coverage, and manuscript-output directories; runtime state under `data/` is not deleted by the cleanup command.
