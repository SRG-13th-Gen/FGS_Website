# SPEC-008: Remove WordPress and migrate to production

Accepted: owner implementation plan, October 4, 2026. This supersedes WordPress ownership in DEC-001/002/003/102/105 and the implementation contracts in SPEC-003/004/007. The design, seven sections, Google login and preview deployment automation remain.

## Scope

MySQL-backed server-only content services replace WordPress reads/writes. Filesystem storage is isolated by environment and outside deployments. Retain authorized section editing, article create/edit/trash, media picker, validated fields and result unions. Add optimistic revisions, transactional image relationships, soft deletion, idempotent creation, image-only stories, 20 photos, 10 MB per file and 60 MB total new uploads. Public content is dynamic without persistent caches.

Offline export merges both inventories using the CMS as section authority. Checksummed imports preserve original stories, media variants, captions, order, links and dates; source-key reruns preserve later edits. Reconciliation reports missing references, rejected conversions and duplicates. Legacy links redirect to new articles/media/homepage.

Inquiry submission remains deferred. Preserve conceptual history and the existing visual design.

## Acceptance

All five legacy articles are published and editable. Seven section editors and media workflows work after Google sign-in; denied accounts and direct protected operations are rejected. Staging cannot affect production. Application-owned content and uploads survive restart and redeployment. Fresh backups restore into disposable storage.

Only then replace the root WordPress site with a managed Node 24 application and deploy the verified archive/snapshot. Confirm HTTPS, indexing, canonicals, sitemap, redirects, assets and authenticated operations. After production acceptance and verified recovery backups, delete CMS and revoke obsolete integration credentials. Initial failure restores original root; subsequent app rollback preserves content/uploads.

## Evidence

- Fresh root/CMS full files and SQL backups captured October 4, downloaded and checksum/integrity checked; off-repository copies retained.
- Source export: five posts, ten CMS pages, 352 media records, 2,289 downloaded assets, zero failed downloads.
- `pnpm verify` passed. Combined unit/integration and real MySQL/importer suites: 120 tests across 15 files passed. Four authenticated isolated browser checks passed, including all seven editors, image-only upload/publish/edit/trash and responsive admin layouts.
- Isolated stage/live/test databases and outside-site directories provisioned.
- Actual hosted Google sign-in passed; Google accepts the root callback URI. Restart and redeployment preserved a saved section and uploaded file; production isolation passed. Root/CMS full backups and application backups were restored into disposable storage and verified.
- All seven hosted editors saved and restored original content. Hosted image-only publishing, editing, trashing and library selection passed. Anonymous requests to protected pages redirect to login. Final frozen WordPress backups and the final production content backup restored successfully; all final source content/checksums match the prepared import.
- The owner confirmed the staging file-selection/upload check. Production launched at `https://flordegraceschoolinc.com/` on October 4 using managed Node 24. Google root sign-in, all seven editors, authenticated save, image-only publish/edit/trash and library search passed. Uploaded production media appeared in the library and survived restart; original section content was restored and the test article soft-deleted.
- Production passed 33 public/asset/redirect checks and four live browser checks covering indexing, canonicals, all five articles, anonymous admin protection and mobile layout. The accepted production backup restored into isolated test storage and was copied outside the repository. Both WordPress websites were removed; their integration credentials and runtime settings are obsolete. Preview remains an independent Node application.
- Deployed archive SHA-256: `b698aabb412bb33ff324116185a18529a7f150e111c15449cbfcd0025e4c8693`; managed production build: `01a105b9-3fbc-70f2-bcd3-ec4375f7d1b1`.

See [TESTING](../TESTING.md), [contracts](../DATA_API_CONTRACTS.md) and [deployment](../DEPLOYMENT.md).
