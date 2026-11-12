# .github

GitHub-specific repository resources.

## CI validation

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests.
Every job runs the arms of the single gate entry point `./run.sh`; the arms are
defined once in `scripts/gate.ts` and documented in
[`docs/gate.md`](../docs/gate.md). The two toolchain-isolated jobs (`container`,
`gnn-conformance`) invoke the same scripts their arms wrap and install no Node
dependencies.

| Job key | Display name | Arms | Node |
| --- | --- | --- | --- |
| `quality` | quality (node 24) | `lint types format docs policy build` | 24 |
| `test` | test (node 22) / test (node 24) | `test:offline` on 22, `test:full` on 24 | 22, 24 |
| `security` | security | `security` (`npm audit --audit-level=high`) | 24 |
| `container` | container | `container`; runs `scripts/container-check.sh`, no Node install | — |
| `manuscript-source` | manuscript source | `manuscript`; installs pinned Pandoc, Pandoc-crossref, XeLaTeX, and a headless browser | 24 |
| `gnn-conformance` | gnn conformance (pinned) | `gnn`; runs `scripts/gnn-conformance.py`, no Node install | — |
| `live-provider` | live provider | `live`; only on `workflow_dispatch`, with the `OPENAI_API_KEY` secret | 24 |

Each job installs dependencies once and runs only its own arms, so no arm runs
twice in one pipeline. The built `dist/` is uploaded from the quality job, and
`docs/manuscript/output/` from the manuscript job.

## GNN conformance

`gnn-conformance` is the job key; its display name is `gnn conformance (pinned)`.
It reads the pin in [`gnn-pin.json`](gnn-pin.json) (schema
`gnn-importer-pin/v1`) and checks it through
[`scripts/gnn-conformance.py`](../scripts/gnn-conformance.py). What the job
parses, the pinned revision, and the claim limits are recorded in
[`GNN.md`](GNN.md).

NoOrg's workflow installs Python with `actions/setup-python` and the parser with
`pip`; it does not use the organization composite action
`ActiveInferenceInstitute/.github/.github/actions/setup-python-uv@7159e67315330aac8e414aebae0ad1e999a41448`.

Dependency updates for npm and GitHub Actions are proposed weekly by Dependabot
([`dependabot.yml`](dependabot.yml)). Every action stays pinned to a full commit
SHA with a version comment.

## Related

- [Workflow guide](workflows/README.md)
- [Agent guide](AGENTS.md)
- [Parent guide](../AGENTS.md)
