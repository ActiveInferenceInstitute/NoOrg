# NoOrg manuscript

This directory contains the reproducible source manuscript for the NoOrg runtime. It documents the executable TypeScript contracts, task semantics, provider boundary, persistence model, verification evidence, and claim limits.

## Chapters

- [`00_abstract.md`](00_abstract.md) — Abstract.
- [`01_introduction.md`](01_introduction.md) — Introduction.
- [`02_system_model.md`](02_system_model.md) — System model.
- [`03_architecture.md`](03_architecture.md) — Architecture.
- [`04_execution_semantics.md`](04_execution_semantics.md) — Execution semantics.
- [`05_evaluation.md`](05_evaluation.md) — Evaluation.
- [`06_reproducibility.md`](06_reproducibility.md) — Reproducibility.
- [`07_scope_and_related_work.md`](07_scope_and_related_work.md) — Scope and related work.
- [`08_appendix_contracts.md`](08_appendix_contracts.md) — Appendix: contracts.
- [`09_claims_and_evidence.md`](09_claims_and_evidence.md) — Claims and evidence.
- [`98_glossary.md`](98_glossary.md) — Glossary.
- [`99_references.md`](99_references.md) — References.

Supporting sources: [`preamble.md`](preamble.md) (rendering preamble), [`config.yaml`](config.yaml) and [`references.bib`](references.bib) (render metadata), [`SYNTAX.md`](SYNTAX.md) (Markdown and Pandoc-crossref conventions), and [`AGENTS.md`](AGENTS.md) (manuscript guidance).

## Source and generated layers

- Numbered Markdown files are the canonical source.
- `config.yaml`, `preamble.md`, and `references.bib` define rendering metadata.
- `figures/*.mmd` are figure sources.
- `scripts/manuscript.ts` collects runtime evidence, renders figures, hydrates tokens, validates the source, renders HTML/PDF, and writes checksums.
- `output/` is generated, ignored, and suitable for CI artifact upload.

## Variables

Prose never carries a hand-maintained measurement. `scripts/manuscript.ts evidence`
writes `output/evidence/runtime.json`, `hydrate` substitutes the declared tokens
into `output/manuscript/`, and `validate` rejects an unresolved or unknown token.
The declared tokens are `RELEASE_DATE`, `EVIDENCE_TEST_COUNT`,
`EVIDENCE_UNIT_FILES`, `EVIDENCE_LINK_COUNT`, `EVIDENCE_COMPLETED_STATUS`,
`EVIDENCE_TOTAL_TOKENS`, `EVIDENCE_COST_USD`, `EVIDENCE_STATE_REVISION`, and
`EVIDENCE_EVENT_DELIVERIES`. The declared variable input is the generated
`output/evidence/runtime.json`; the generator maps its fields to these tokens,
and the validator checks the same token list. `config.yaml` consumes
`RELEASE_DATE` as its `date`.

The figure registry is the `figures` list in `scripts/manuscript.ts`
(`architecture`, `lifecycle`, `provider`, `persistence`, `verification`); the
validator fails when a source `.mmd` or its rendered `.png` is missing.

## Toolchain

`manuscript:check` needs Pandoc, Pandoc-crossref, XeLaTeX, `pdftotext`, the
Mermaid CLI from the dev dependencies, and a headless browser. CI pins Pandoc
3.9 and Pandoc-crossref v0.3.24 and installs `poppler-utils` and `texlive-xetex`.
The check runs `npm test` to capture test counts as evidence, so it also needs
the installed Node dependencies.

## Commands

```bash
./run.sh manuscript       # the whole check, the same arm CI runs
npm run manuscript:evidence
npm run manuscript:figures
npm run manuscript:hydrate
npm run manuscript:validate
npm run manuscript:render
npm run manuscript:check
```

The local provider is selected explicitly for ordinary validation. A live provider run requires `NOORG_LLM_PROVIDER=openai` and `OPENAI_API_KEY`.
