# SPEC-008: Application-owned content and production migration

Accepted October 4, 2026; completed the same day. [DEC-118](../DECISIONS.md#current-decisions) supersedes WordPress ownership/native editing and its webhook cache policy. The conceptual draft is historical. Design, seven section editors and Google admin are preserved; inquiry delivery is deferred.

## Delivered contract

Server-only mysql2 services own sections, articles, ordered images, media metadata and old URL mappings. Environment-specific immutable files live outside deployments. Staging/production credentials and content are isolated. Transactions, edit revisions, idempotent creation and soft trash protect writes. Public content reads dynamically without persistent caches.

Articles support paragraphs and up to 20 ordered captioned photos, including image-only stories; new files are limited to 10 MB each and 60 MB aggregate. HTML/links/files/paths are validated. Imports are resumable/checksummed and preserve later admin edits. Source galleries/cover blocks become the supported paragraph/photo presentation while retaining wording, dates, captions, links and order.

## Final source snapshot

The newer CMS copy supplied the seven edited sections. Both source inventories were reconciled; missing uploads and referenced variants were preserved. The final frozen export contains five articles, 352 source media records and 2,289 downloaded assets, with no failed downloads, broken references or rejected conversions. Earlier inspection counts were preliminary inventories, not final export totals.

| Original slug             | Published category |
| ------------------------- | ------------------ |
| `summer-class-2025-draft` | Events             |
| `summer-class-2025`       | Events             |
| `fgs-22`                  | Events             |
| `enrollment`              | Announcements      |
| `test-post`               | Announcements      |

Titles/dates come from original records rather than slug interpretation. Old article URLs map to `/news/<original-slug>`, homepage aliases to `/`, and upload paths to migrated files. Library imports do not automatically expand the public Gallery. All five stories remain editable through admin.

## Acceptance evidence

- Fresh full files/SQL backups of both WordPress installations were checksum/integrity checked, restored into disposable storage and copied outside the repository/account.
- `pnpm verify` passed. Combined real MySQL/importer and unit/integration verification passed 120 tests across 15 files. Four authenticated isolated browser checks covered the seven editors, image-only upload/publish/edit/trash and responsive admin.
- Actual hosted Google sign-in, anonymous protection, seven editor saves, image-only publication/edit/trash and library selection/search passed. The root Google callback was configured securely.
- Production upload bytes and saved section content survived restart; staging content/media survived restart/redeployment and remained isolated. Application backups restored successfully in disposable storage. Temporary public/test content was cleaned up or soft-trashed.
- Production launched at `https://flordegraceschoolinc.com/`. It passed 33 public/asset/redirect checks, homepage/upload redirects, indexing/sitemap checks and four live browser checks covering canonicals, five stories, anonymous protection and mobile layout.
- Both WordPress websites were removed only after verified acceptance/recovery. Historical recovery credentials/assets remain private; no WordPress service or runtime integration remains.

Initial production archive SHA-256: `b698aabb412bb33ff324116185a18529a7f150e111c15449cbfcd0025e4c8693`; Hostinger build `01a105b9-3fbc-70f2-bcd3-ec4375f7d1b1`. Recovery locations/checksums are in [DEPLOYMENT](../DEPLOYMENT.md).

## Subsequent release policy

The owner's later October 4 instruction authorizes branch-based deployment and schema migration before publication (DEC-119/120). Staging's revised pipeline passed; production branch promotion remains pending. Application rollback preserves live content/media. Schema rollback, recovery backups and offline imports remain manual. See [CI/CD](../CI_CD.md), [testing](../TESTING.md) and [contracts](../DATA_API_CONTRACTS.md).
