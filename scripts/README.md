# Repository scripts

Deterministic validation and generation scripts, run through the `./run.sh` arms, the `npm run validate:*`, `npm run units:manifest:*`, `npm run api:openapi:*`, and `npm run manuscript:*` commands. They inspect tracked source and documentation and do not change product files.

## Validation gates

| Script | Purpose |
| --- | --- |
| `gate.ts` | Declares every gate arm and runs it; backs `./run.sh` and `./run.sh report`. |
| `validate-repository.ts` | Tracked-file policy, unfinished-marker scan, prohibited vocabulary, and source-tree write checks. |
| `validate-docs.ts` | Relative Markdown link and anchor checks. |
| `validate-contracts.ts` | Alignment of public scheduler methods, HTTP routes, state versions, configuration variables, and manuscript extension claims. |
| `validate-decisions.ts` | Evidence-boundary decision records. |
| `validate-units.ts` | Reviewed organizational corpus checks. |
| `units-manifest.ts` | Check, diff, and explicit update modes for corpus integrity review. |
| `generate-openapi.ts` | Generates and checks the tracked HTTP contract. |
| `manuscript.ts` | Evidence, figures, hydration, validation, rendering, and publication checks for the manuscript. |
| `gnn-conformance.py` | Pinned GNN conformance check driven by `.github/gnn-pin.json`. |
| `container-check.sh` | Builds the committed image and waits for its `/ready` probe. |
| `clean-generated.ts` | Removes generated build, coverage, and manuscript-output directories. |

`gate.ts` is the only place the arm list is declared. Composite arms (`fast`, `all`) reference other arms instead of repeating their commands, and every arm calls one npm script or one repository script. `./run.sh --list` prints the live table.

See [`AGENTS.md`](AGENTS.md) for the rules an agent must follow when changing these gates, and [`../docs/gate.md`](../docs/gate.md) for the arms and their CI mapping.
