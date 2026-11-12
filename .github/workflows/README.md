# Workflows

GitHub Actions workflows for NoOrg.

## ci.yml

The single pipeline described in [.github/README.md](../README.md): quality,
tests on the Node 22/24 matrix, dependency security, a container build with a
readiness probe, the manuscript source check, the pinned GNN conformance
baseline (see [`../GNN.md`](../GNN.md)), and a manually triggered live-provider
run.

Every job runs arms of `./run.sh`, declared once in `scripts/gate.ts`. Run
`./run.sh --list` locally to see the same arms, and
[`../../docs/gate.md`](../../docs/gate.md) for what each one proves.
