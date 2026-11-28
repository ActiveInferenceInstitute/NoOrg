# Tests

Jest suites for the NoOrg runtime, written in TypeScript and run from the repository root.

## Layout

| Path | Purpose |
| --- | --- |
| `unit/` | Focused tests for agents, configuration, events, the GNN conformance script, metrics, providers, security, state, tasks, and the unit corpus. |
| `integration/` | End-to-end coordinator and HTTP integration tests. |
| `live/` | Opt-in live OpenAI provider test; excluded from the ordinary local run. |
| `fixtures/` | Actual native file-write/fsync barriers and an independent Node IPC state-lock worker. |
| `tsconfig.json` | TypeScript configuration shared by the suites. |

## Commands

```bash
npm run test:fast        # tests/unit only: the fast selection
npm test                 # ordinary unit and integration suites, network-free
npm run test:coverage    # coverage-augmented run with the enforced thresholds
npm run test:integration # integration suite only
npm run test:live        # live OpenAI suite; requires credentials
```

Coverage thresholds are 90% lines and 80% branches. `tests/live` is excluded from `npm test` and from the coverage run, so no default command reaches the network. See the [testing documentation](../docs/development/testing.md) for the gate arms and the live-provider profile, and the [validation gate](../docs/development/gate.md) for `./run.sh`.

## Focused runtime boundaries

`task-commit`, `state-lock` and `coordinator-commit` exercise real file-state
admission, pre-rename failure visibility, post-rename fencing, physical/token/
guard ownership and agent reservations. The stale-owner race uses independent
Node processes and IPC barriers, using native filesystem outcomes. Both timer
resolve/reject cases hold real completion/accounting writes past the execution
deadline, then require exact usage/events and reservation/file-state lease release.

`queue-traversal` exercises runnable and housekeeping work beyond the public
100-record page. `usage-accounting` covers additive deltas, restart history,
failed-commit reentry and late cancellation/timeout settlement. Provider receipts
use the existing offline transport seam, not live model calls.

`http-boundaries` and security cases cover UTF-8 bearer lengths, throttling,
workflow admission and complete queue totals. HTTP fixtures consume responses
and dispose their owned servers even on failure. `config-launch` parses the
actual example and uses real Node `--env-file` children to prove inherited
precedence and missing-file negative behavior. `provider-retention` covers
disabled history and enabled rolling-window failures/rollover.

These cases need the existing Node >=22/Jest/TypeScript/tsx dependency cohort,
bounded child/IPC/loopback access and native directory handles/fsync. Use owned
temporary state/output roots. Sanitized child environments must be accounted
for separately; parent-only temp/cache variables are not inherited implicitly.
Focused behavioral receipts do not establish coverage thresholds, live-provider
quality, scientific validity, GNN pin migration or full release acceptance.
