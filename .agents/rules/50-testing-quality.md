# Testing and quality

Read [TESTING.md](../../docs/TESTING.md) and the affected acceptance criteria.

- Inspect actual tooling before choosing commands. `pnpm verify` runs lint, type checks, unit tests, formatting and a production build. `pnpm test:e2e` builds and runs production browser smoke tests. `pnpm docker:config` validates Compose after local environment setup. These verify the scaffold, not unimplemented product features.
- Test meaningful behavior and boundary failures: authorization, published-only reads, uncertain writes, cache refresh, and inquiry abuse/deduplication/privacy as applicable.
- Default external-service tests to doubles, local disposable resources, or an approved sandbox. Real CMS writes, live email sends, and destructive resets require explicit scope authorization.
- Run the narrow checks relevant to the change; broaden when the change or observed failures justify it. Do not introduce tests that merely mirror prose or trivial implementation details.
- Check docs links, status consistency, traceability, and whitespace for documentation work. Preserve empty DESIGN and CI_CD placeholders.
- Never weaken a check or security condition just to pass. Report commands/results, skipped checks, and remaining limitations accurately.

Update feature evidence and the requirement-to-test mapping with actual test paths when code exists. **Not run** is not a passing result; a documented acceptance criterion is not an implemented test.
