# Operations

## Local execution

```bash
cp .env.example .env
npm run validate
npm run units:manifest:diff
npm run api:openapi:check
npm start
curl http://localhost:3000/health
curl http://localhost:3000/ready
curl http://localhost:3000/metrics

# With NOORG_HTTP_AUTH_TOKEN configured:
curl -H "Authorization: Bearer $NOORG_HTTP_AUTH_TOKEN" http://localhost:3000/v1/tasks

# Idempotent task submission with a deadline:
curl -X POST -H "Authorization: Bearer $NOORG_HTTP_AUTH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Analyze","description":"Analyze input","input":"text","idempotencyKey":"analyze-1","deadlineAt":"2030-01-01T00:00:00.000Z"}' \
  http://localhost:3000/v1/tasks
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

Production binds to `0.0.0.0` by default and requires `NOORG_HTTP_AUTH_TOKEN`. Development binds to `127.0.0.1` unless `NOORG_HOST` is explicitly set.

```bash
npm run manuscript:check
```

Before changing organizational content, inspect the manifest diff and update the reviewed per-file digests only after review. Before changing HTTP routes or request fields, regenerate the OpenAPI description with `npm run api:openapi` and commit the resulting contract together with source and tests.
