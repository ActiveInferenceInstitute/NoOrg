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

## Commands

```bash
npm run manuscript:evidence
npm run manuscript:figures
npm run manuscript:hydrate
npm run manuscript:validate
npm run manuscript:render
npm run manuscript:check
```

The local provider is selected explicitly for ordinary validation. A live provider run requires `NOORG_LLM_PROVIDER=openai` and `OPENAI_API_KEY`.
