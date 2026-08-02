# Organizational units guidance

The Markdown under `units/` is reviewed organizational domain content, not executable code. Changes must preserve each unit directory's README, charter, policy, process, and report conventions.

`units/manifest.json` is the reviewed integrity record for the corpus. Before changing content, run `npm run units:manifest:diff` to obtain the explicit added/removed/changed diff. After the change has been inspected, refresh the reviewed record with `npm run units:manifest:update`; never hand-edit the manifest. The runtime loads no unit document implicitly and never interprets document text as executable behavior.
