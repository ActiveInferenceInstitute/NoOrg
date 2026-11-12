# Workflows

GitHub Actions workflows for NoOrg.

## ci.yml

The single pipeline described in [.github/README.md](../README.md): validation on the Node 22/24 matrix, manuscript source check, dependency and repository-policy security scans, a manually triggered live-provider run, a container build with a readiness probe, and a pinned GNN baseline check (the job key stays `gnn-conformance`; the job runs GNN's own pinned exemplar, not repository GNN content).
