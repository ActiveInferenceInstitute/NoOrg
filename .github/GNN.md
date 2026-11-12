# GNN conformance

The conformance job is `gnn-conformance` with display name
`gnn conformance (pinned)`. It runs the `gnn` arm of `./run.sh`, which executes
`scripts/gnn-conformance.py`.

## Pin

The canonical pin file is [`.github/gnn-pin.json`](gnn-pin.json) with schema
`gnn-importer-pin/v1`:

| Field | Value |
| --- | --- |
| `repository` | `ActiveInferenceInstitute/Generalized_Notation_Notation` |
| `tag` | `v5.0.3` |
| `revision` | `8f293d9ba810e6eda5c09842d9c7ed9ffa5f92c1` |
| `recorded` | `2026-11-12` |

The script refuses a pin whose schema is not `gnn-importer-pin/v1`, whose
revision is not a 40-character commit id, or whose tag does not start with `v`.
It installs that exact revision with `pip` and fails when the installed
`gnn.__version__` differs from the tag.

## What the job parses

1. Every `*.gnn.md` sketch in the repository, parsed with `parse_gnn_formal`,
   syntax-checked with `validate_gnn_syntax`, and type-checked with
   `GNNTypeChecker`.
2. When the repository has no sketch, the pinned upstream
   `input/gnn_files/basics/static_perception.md` exemplar at the pinned
   revision, through the same three steps. This repository currently has no
   sketch, so the job reports `"source": "pinned-exemplar"`.

The job prints a single JSON line with `gnn-version`, `pin-revision`, `models`,
`source`, and `result`.

## Limits

A pass is a pipeline and pin conformance baseline: it proves the pinned parser
installs, matches its tag, and processes its input. It is not a claim that this
repository contains a GNN model, and it does not evaluate model quality.

## Tooling

The job installs Python 3.12 through the pinned organization composite action
`ActiveInferenceInstitute/.github/.github/actions/setup-python-uv@7159e67315330aac8e414aebae0ad1e999a41448`.
A seeded `uv` environment places that interpreter on `PATH`; `pip` installs the
parser's runtime dependencies (`defusedxml`, `psutil`, `pyyaml`).

Locally, `./run.sh gnn` needs a supported `python3` on `PATH`, the three parser
dependencies installed for that interpreter, and network access for the pinned
install.
