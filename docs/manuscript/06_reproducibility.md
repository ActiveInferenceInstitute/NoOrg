# Reproducibility {#sec:reproducibility}

The supported baseline is Node.js 20 or newer and the package-lock-resolved dependency graph. A clean checkout can install dependencies with `npm ci`, run the TypeScript type check, lint, formatting check, Jest tests, corpus and documentation validators, and production build. The manuscript pipeline then performs six explicit stages:

1. `manuscript:evidence` executes the real local runtime path and writes JSON evidence.
2. `manuscript:figures` converts tracked Mermaid sources into generated images.
3. `manuscript:hydrate` resolves all declared manuscript variables into a generated source tree.
4. `manuscript:validate` checks labels, citations, figure assets, tokens, and cross-reference syntax.
5. `manuscript:render` invokes Pandoc, Pandoc-crossref, citeproc, and XeLaTeX when available.
6. `manuscript:check` runs the full sequence, inspects rendered text, and writes checksums and provenance.

The generated tree is intentionally outside source control. CI uploads `docs/manuscript/output/` as a release artifact, while the source manuscript, evidence collector, figure sources, configuration, and validators remain reviewable. This boundary prevents machine-specific output from becoming a second source of truth.

The local provider is deterministic and has no token or monetary usage. OpenAI execution is separately gated by explicit provider selection and a credential. Its structured response parser, timeout, retry limit, backoff, model, base URL, and cost rates are configuration inputs. Secrets are never written to evidence or logs.
