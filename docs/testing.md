# Testing

Ordinary tests use the deterministic local provider and real in-memory or file-backed components. They do not replace runtime dependencies or suppress logging.

```bash
npm run type-check
npm run lint
npm test
npm run test:integration
npm run validate:text
npm run validate:docs
npm run validate:units
npm run validate:contracts
npm run validate:decisions
npm run build
npm run test:coverage
npm run manuscript:check
npm run release:check
```

`npm run validate` is the ordinary local and CI gate. `npm run release:check` is the publication gate: it adds the executable example, high-severity dependency audit, full manuscript generation/render inspection, and `git diff --check`.

The live suite requires both the OpenAI provider profile and an API key. It validates structured response parsing and provider configuration; local tests validate orchestration and agent behavior without network access. Rendered manuscript files are generated release artifacts, not source files.

Coverage is enforced at 90% lines and 80% branches by Jest. The coverage command remains local and deterministic; live provider checks are never part of the ordinary validation command.

The manuscript check clears its generated output before starting and removes partial output on failure, so interrupted release runs cannot become a later evidence source.
