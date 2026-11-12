# .github

GitHub-specific repository resources.

## CI validation

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

- **validate** — `npm ci` plus `npm run validate` on Node 22 and 24; the coverage-augmented test run on Node 24; the built `dist/` uploaded as an artifact.
- **manuscript-source** — installs pinned Pandoc, Pandoc-crossref, and XeLaTeX, then runs `npm run manuscript:check`; generated `docs/manuscript/output/` uploaded as evidence.
- **security** — `npm audit --audit-level=high` and `npm run validate:text` (tracked-file policy and prohibited-vocabulary scan).
- **live-provider** — runs the live OpenAI suite only when triggered manually via `workflow_dispatch`, using the repository's `OPENAI_API_KEY` secret.
- **container** — builds the Docker image and waits on its `/ready` probe before passing.
- **gnn-conformance** — installs the GNN parser pinned in `gnn-pin.json` and runs it against GNN's own pinned exemplar; this repository ships no `*.gnn.md` model, so this is a pin and pinned-parser baseline, not repository content conformance.

Dependency updates for npm and GitHub Actions are proposed weekly by Dependabot (`.github/dependabot.yml`).

## Related

- [Parent directory](../AGENTS.md)
