# Validation gate

`./run.sh` is the single gate entry point. Every arm is declared once in
`scripts/gate.ts`, and each arm calls an npm script from `package.json` or a
repository script, so a local run and a CI job execute the same command.
`./run.sh --list` prints the authoritative arm table, including the commands
each arm runs.

```bash
./run.sh                  # default fast arm
./run.sh lint types       # any subset, in order
./run.sh all              # ordinary gate (the same set as npm run validate)
./run.sh --list
```

The script requires the installed dependencies (`npm ci`); it refuses to start
otherwise.

## Arms

| Arm | What it proves |
| --- | --- |
| `types` | `tsc` type-checks source, tests, and scripts. |
| `lint` | ESLint over `src/`, `tests/`, and `scripts/`. |
| `format` | Prettier formatting check for the same trees. |
| `test:fast` | `tests/unit` only: the fastest test selection. |
| `test:full` | Unit and integration suites with the enforced coverage thresholds (90% lines, 80% branches). |
| `docs` | Relative Markdown links and anchors across every Markdown file. |
| `policy` | Tracked-file policy, unit corpus, corpus manifest, OpenAPI contract, contract alignment, and decision records. |
| `build` | `tsc` build into `dist/`. |
| `gnn` | Pinned GNN conformance (see below). |
| `manuscript` | Evidence, figures, hydration, validation, and the rendered manuscript check. |
| `security` | `npm audit --audit-level=high`. |
| `container` | Docker image build and `/ready` probe. |
| `live` | Live OpenAI provider suite; requires the `openai` profile and `OPENAI_API_KEY`. |

Two composite arms compose the above without restating a command:

- `fast` (the default, when no arm is named): `types`, `lint`, `format`,
  `test:fast`, `docs`.
- `all`: `types`, `lint`, `format`, `test:full`, `docs`, `policy`, `build`.
  This is what `npm run validate` runs.

`live`, `container`, and `manuscript` are never part of `fast` or `all`. The
live suite needs a network and credentials, the container arm needs a Docker
daemon, and the manuscript arm needs Pandoc, Pandoc-crossref, XeLaTeX,
`pdftotext`, and a headless browser.

## CI parity

`.github/workflows/ci.yml` runs the same arms through `./run.sh`, once each:

| Job | Key and display name | Arms |
| --- | --- | --- |
| Quality | `quality` — quality (node 24) | `lint types format docs policy build` |
| Tests | `test` — test (node 22) / test (node 24) | `test:fast` on Node 22, `test:full` on Node 24 |
| Security | `security` — security | `security` |
| Container | `container` — container | `container` |
| Manuscript | `manuscript-source` — manuscript source | `manuscript` |
| GNN conformance | `gnn-conformance` — gnn conformance (pinned) | `gnn` |
| Live provider | `live-provider` — live provider | `live`, only on `workflow_dispatch` |

Each job installs dependencies once and runs only the arms it owns, so no arm
runs twice in one pipeline. Coverage is measured once, in the Node 24 test job.
The `container` and `gnn-conformance` jobs install no Node toolchain: they invoke
the exact scripts their arms wrap (`scripts/container-check.sh` and
`scripts/gnn-conformance.py`), so each command still exists once.

## Measured arm times

`./run.sh report` runs every measured arm once on the current host and rewrites
[`_generated/gate-timings.md`](_generated/gate-timings.md) with wall time per
arm and the test/coverage evidence from the run. The pre-change baseline is
recorded in [`_generated/gate-baseline.json`](_generated/gate-baseline.json);
the generated page shows both columns.

## GNN conformance

`./run.sh gnn` runs [`scripts/gnn-conformance.py`](../scripts/gnn-conformance.py),
which reads the pin in [`.github/gnn-pin.json`](../.github/gnn-pin.json)
(schema `gnn-importer-pin/v1`, `ActiveInferenceInstitute/Generalized_Notation_Notation`
at tag `v5.0.3`, revision `8f293d9ba810e6eda5c09842d9c7ed9ffa5f92c1`), installs
that revision, and verifies the parser version. It parses, syntax-checks, and
type-checks every `*.gnn.md` sketch in the repository; when the repository has
none, it checks the pinned upstream exemplar instead and reports
`"source": "pinned-exemplar"`. See [`.github/GNN.md`](../.github/GNN.md).

The pinned parser declares its own supported Python range; CI uses Python 3.12.
The arm needs a supported `python3` plus the parser's runtime dependencies
(`defusedxml`, `psutil`, `pyyaml`).
