# Agent guide — `tests/`

Read [`README.md`](README.md) and the top-level [`AGENTS.md`](../AGENTS.md) first.

## Rules

- Every behavior change in `src/` needs a matching test here; keep the ordinary `npm test` run network-free.
- Put live provider coverage only under `live/`; it requires an explicit OpenAI profile and never runs in the default gate.
- Preserve the coverage thresholds (90% lines, 80% branches) rather than weakening a test to pass.
- Fix the implementation instead of rewriting a test to make a change pass.

## Verify

Run `npm run test:fast` for the fast loop (`tests/unit`) and `./run.sh all` before handing off work. `npm test` runs both offline suites; `npm run test:live` is the only command that reaches the network.
