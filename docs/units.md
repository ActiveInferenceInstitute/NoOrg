# Organizational units

The Markdown corpus under `units/` is domain content. It is not executable code and is not loaded implicitly by the coordinator.

`units/manifest.json` is the reviewed integrity record for the corpus. The opt-in `UnitCorpus` adapter verifies that record before exposing read-only Markdown documents with source paths and content digests. It never imports, evaluates, or infers executable behavior from document content.

When a workflow needs unit content, callers provide the relevant document or structured extraction as task input. Changes to unit documents should preserve their local README, charter, policy, process, and report conventions.

The manifest also records a digest for every Markdown path. Run `npm run units:manifest:diff` before review to obtain an explicit added/removed/changed integrity diff; update the reviewed record only with `npm run units:manifest:update` after the content change has been inspected.
