# Operations

## Local execution

```bash
cp .env.example .env
npm run validate
npm start
curl http://localhost:3000/health
curl http://localhost:3000/ready
curl http://localhost:3000/metrics
```

## State

State is stored in the configured runtime data path. Writes use a process lock, a temporary file, and atomic rename. The current state envelope is schema version `2` with a monotonic revision; version `1` is migrated at load and invalid state fails startup rather than silently resetting data.

## Shutdown

Send `SIGTERM` or `SIGINT`. The server stops accepting connections, the coordinator cancels active work, pending state is flushed, providers and agents close, and the process sets a non-zero exit code only when shutdown fails.

## Live provider validation

```bash
NOORG_LLM_PROVIDER=openai OPENAI_API_KEY=... npm run test:live
```

This command makes a network request and is intentionally separate from ordinary validation.

## Manuscript release

The source manuscript is under `docs/manuscript/`. Generated evidence, figures, hydrated chapters, HTML, PDF, provenance, and checksums are written under ignored `docs/manuscript/output/` and uploaded by CI as artifacts.

```bash
npm run manuscript:check
```
