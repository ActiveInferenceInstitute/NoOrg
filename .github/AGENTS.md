# .github guidance

This directory holds GitHub platform resources only: the Actions workflow in `workflows/ci.yml` and its guide in `workflows/README.md`, the CI documentation in `README.md`, the weekly update configuration in `dependabot.yml`, the GNN conformance notes in `GNN.md`, and the pinned parser revision in `gnn-pin.json`.

- The pin file `gnn-pin.json` uses schema `gnn-importer-pin/v1` and records the parser repository, tag, revision, and recording date. `scripts/gnn-conformance.py` validates the schema and the revision before installing anything.
- The conformance job key is `gnn-conformance`; its display name is `gnn conformance (pinned)`.
- Every workflow job runs arms of the root `./run.sh` entry point, declared once in `scripts/gate.ts`. Keep the gates (`./run.sh all`, `npm run manuscript:check`, `npm run audit`) intact.
- Never add secrets to workflow files. Keep action versions pinned to full commit SHAs with a version comment; Dependabot updates them.

Follow the [root guide](../AGENTS.md) and the [workflow guide](workflows/README.md).
