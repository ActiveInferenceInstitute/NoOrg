# Validation scripts

The scripts in this directory are deterministic repository gates. They inspect tracked source and documentation without changing product files.

- `validate-repository.ts` checks tracked-file policy, unfinished implementation markers, prohibited vocabulary, and source-tree writes.
- `validate-contracts.ts` checks that public scheduler methods, HTTP routes, state versions, configuration variables, and manuscript extension claims remain aligned.
- `validate-decisions.ts` checks evidence-boundary decision records.
- `units-manifest.ts` provides check, diff, and explicit update modes for corpus integrity review.
- `generate-openapi.ts` generates and checks the tracked HTTP contract.
- `validate-docs.ts` checks relative Markdown links.

The active roadmap is an explicit planning surface and is exempt from the unfinished-marker scan; completed items must still be removed from it rather than marked complete indefinitely.

Run them through the corresponding `npm run validate:*`, `npm run units:manifest:*`, and `npm run api:openapi:*` commands.
