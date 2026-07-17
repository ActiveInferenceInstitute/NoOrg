# NoOrg manuscript

This directory contains the reproducible source manuscript for the NoOrg runtime. It documents the executable TypeScript contracts, task semantics, provider boundary, persistence model, verification evidence, and claim limits.

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
