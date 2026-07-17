# Validation scripts

The scripts in this directory are deterministic repository gates. They inspect tracked source and documentation without changing product files.

- `validate-repository.ts` checks tracked-file policy, unfinished implementation markers, prohibited vocabulary, and source-tree writes.
- `validate-docs.ts` checks relative Markdown links.

Run them through `npm run validate:text` and `npm run validate:docs`.
