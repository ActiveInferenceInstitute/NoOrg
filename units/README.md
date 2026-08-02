# Organizational Units

This directory is the reviewed Markdown corpus of organizational domain content: unit charters, policies, processes, reports, and relationship definitions under `units/`.

## Content

Units are organized hierarchically by unit directory (Administration, Development, Research, and so on). Each unit directory preserves its local conventions: a README, charter, policy, process, and report documents.

## Integrity and use

The corpus is domain content, not executable code. The runtime never loads it implicitly and never infers behavior from it. When a workflow needs unit content, callers supply the relevant document or structured extraction as task input. The opt-in `UnitCorpus` adapter verifies `units/manifest.json` before exposing read-only Markdown documents with source paths and content digests.

`units/manifest.json` is the reviewed integrity record: it stores a digest for every Markdown path plus a corpus content hash and link count. Inspect changes with `npm run units:manifest:diff` before review and refresh the reviewed record with `npm run units:manifest:update` only after the content change has been inspected.

## Related documentation

- [Units documentation](../docs/units.md)
- [Architecture](../docs/architecture.md)
- [Repository overview](../README.md)
