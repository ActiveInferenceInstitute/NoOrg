# Tests

Jest suites for the NoOrg runtime, written in TypeScript and run from the repository root.

## Layout

| Path | Purpose |
| --- | --- |
| `unit/` | Focused tests for agents, configuration, events, the GNN conformance script, metrics, providers, security, state, tasks, and the unit corpus. |
| `integration/` | End-to-end coordinator and HTTP integration tests. |
| `live/` | Opt-in live OpenAI provider test; excluded from the ordinary local run. |
| `tsconfig.json` | TypeScript configuration shared by the suites. |

## Commands

```bash
npm run test:fast        # tests/unit only: the fast selection
npm test                 # ordinary unit and integration suites, network-free
npm run test:coverage    # coverage-augmented run with the enforced thresholds
npm run test:integration # integration suite only
npm run test:live        # live OpenAI suite; requires credentials
```

Coverage thresholds are 90% lines and 80% branches. `tests/live` is excluded from `npm test` and from the coverage run, so no default command reaches the network. See the [testing documentation](../docs/testing.md) for the gate arms and the live-provider profile, and the [validation gate](../docs/gate.md) for `./run.sh`.
