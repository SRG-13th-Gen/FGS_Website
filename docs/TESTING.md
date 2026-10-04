# Verification

`pnpm verify`: ESLint, Next.js type generation/TypeScript, Vitest unit/mocked integration tests, Prettier check, production build. `pnpm test:e2e`: production build plus Chromium smoke tests. These do not establish hosted OAuth or production acceptance.

## Database and media integration

Provision an isolated database whose name ends in `_fgstest`. Set all DB settings, media path and `FGS_TEST_DATABASE` to that exact name in an ignored test environment. Apply migrations, then:

```sh
node --env-file=.env.database-test.local node_modules/vitest/vitest.mjs run --config vitest.database.config.ts
```

The suite deletes only its explicitly named disposable database's application rows, never production. It verifies publication retry identity, editable round trips, stale revisions, published-only reads, soft deletion, image-only publication, immutable media reuse, aggregate limits, transactional rollback, concurrent section saves, parameterized search and pagination. Upload files use temporary test storage.

Unit/importer fixtures cover nested galleries, cover blocks, captions, links, script rejection, legacy categories, path traversal, query bounds and output sanitization. Protected action tests cover authorization before side effects and saved-but-refresh-failed outcomes.

## Traceability

| Requirement/test ID    | Current evidence                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| FR-001/002, T-001/002  | SQL migrations, database integration suite; current ownership in SPEC-008                       |
| FR-005/006, T-005      | admin-auth/admin-session unit tests, content-actions integration; hosted Google login mandatory |
| FR-007/008, T-006/007  | database content suite and validation/rendering fixtures                                        |
| FR-009, T-008          | dynamic reads, revision tests and refresh-warning action tests                                  |
| FR-015, T-013          | robots tests and hosted sitemap/canonical browser acceptance                                    |
| NFR-001/002, T-014/015 | server-only configuration, HTML/image/path validation tests                                     |
| Recovery and isolation | disposable restore exercise, staging restart/redeploy and separate production credentials       |

## Hosted acceptance

Verify all seven editors, publishing/editing/trashing, media upload/selection, unauthenticated and denied access, actual Google sign-in, five migrated articles, responsive layouts, assets and redirects. Restart and redeploy staging; confirm saved content and uploaded bytes persist. Restore backups into disposable storage. Record actual evidence in [SPEC-008](specs/008-wordpress-removal.md) and [DEPLOYMENT](DEPLOYMENT.md). Skipped auth tests are not a pass.
