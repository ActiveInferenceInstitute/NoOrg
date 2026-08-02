# .github guidance

This directory holds GitHub platform resources only: the Actions workflow in `workflows/ci.yml` and the CI documentation in `README.md`. Changes to the pipeline must keep the repository gates (`npm run validate`, `npm run manuscript:check`, `npm audit --audit-level=high`) intact and must not add secrets to workflow files.
