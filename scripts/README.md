# Repository scripts

Deterministic validation and generation scripts, run through the `npm run validate:*`, `npm run units:manifest:*`, `npm run api:openapi:*`, and `npm run manuscript:*` commands. They inspect tracked source and documentation and do not change product files.

## Validation gates

| Script | Purpose |
| --- | --- |
| `validate-repository.ts` | Tracked-file policy, unfinished-marker scan, prohibited vocabulary, and source-tree write checks. |
| `validate-docs.ts` | Relative Markdown link and anchor checks. |
| `validate-contracts.ts` | Alignment of public scheduler methods, HTTP routes, state versions, configuration variables, and manuscript extension claims. |
| `validate-decisions.ts` | Evidence-boundary decision records. |
| `validate-units.ts` | Reviewed organizational corpus checks. |
| `units-manifest.ts` | Check, diff, and explicit update modes for corpus integrity review. |
| `generate-openapi.ts` | Generates and checks the tracked HTTP contract. |
| `manuscript.ts` | Evidence, figures, hydration, validation, rendering, and publication checks for the manuscript. |
| `clean-generated.ts` | Removes generated build, coverage, and manuscript-output directories. |

See [`AGENTS.md`](AGENTS.md) for the rules an agent must follow when changing these gates.
