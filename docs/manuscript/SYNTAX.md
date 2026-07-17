# Manuscript syntax

The source uses CommonMark-compatible Markdown with Pandoc-crossref extensions.

## Labels and references

- Sections: `# Heading {#sec:identifier}` and `[@sec:identifier]`.
- Equations: `$$ ... $$ {#eq:identifier}` and `[@eq:identifier]`.
- Figures: `![Caption](path){#fig:identifier}` and `[@fig:identifier]`.
- Tables: a caption ending in `{#tbl:identifier}` and `[@tbl:identifier]`.
- Citations: `[@key]`, with keys declared in `references.bib`.

Numbering is supplied by Pandoc and Pandoc-crossref. Do not insert changing numeric values directly into source prose. Use an evidence token such as `{{EVIDENCE_WORD_COUNT}}` and let the hydration command resolve it.
