# .github

GitHub-specific repository resources.

## CI validation

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

- **validate** — `npm ci` plus `npm run validate` on Node 20, 22, and 24; the coverage-augmented test run on Node 20; the built `dist/` uploaded as an artifact.
- **manuscript-source** — installs pinned Pandoc, Pandoc-crossref, and XeLaTeX, then runs `npm run manuscript:check`; generated `docs/manuscript/output/` uploaded as evidence.
- **security** — `npm audit --audit-level=high` and `npm run validate:text` (tracked-file policy and prohibited-vocabulary scan).
- **live-provider** — runs the live OpenAI suite only when triggered manually via `workflow_dispatch`, using the repository's `OPENAI_API_KEY` secret.
- **container** — builds the Docker image and waits on its `/ready` probe before passing.

## Related

- [Parent directory](../AGENTS.md)
