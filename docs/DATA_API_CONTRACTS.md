# Content and API contracts

Current authority: [SPEC-008](specs/008-wordpress-removal.md), accepted October 4, 2026. WordPress REST contracts and webhook producers are retired from runtime.

## Configuration

Server-only settings: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `MEDIA_STORAGE_PATH`, Google OAuth settings, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_ALLOWED_EMAILS`, `SITE_INDEXABLE`. Production media storage is absolute and outside all deployment directories. Database credentials and media roots differ by environment. Hostinger API/SSH credentials are operations-only.

## Stored resources

| Resource       | Storage and constraints                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Sections       | Seven fixed slugs; JSON validated by existing section schemas; positive revision; UTC modification date          |
| Articles       | Stable slug, title, category, paragraph body, published/draft/trash status, original UTC date, positive revision |
| Article photos | Ordered foreign keys, alt and caption; index zero is cover; transaction with article mutation                    |
| Media          | Immutable path, source key, original filename, MIME, bytes, SHA-256, alt, caption, creation date                 |
| Variants       | Media IDs retained for old URL delivery but omitted from picker                                                  |
| Legacy URLs    | Exact old path to validated same-origin path                                                                     |

Application DTOs and result unions live in `src/lib/content/types.ts` and section types. A successful article/section mutation returns its new revision. Stale revisions return a safe conflict. Unknown database outcomes require reconciliation before another mutation. The create request's UUID remains stable for retries and changes after completed publication.

## Validation and delivery

Article title is required; category is Announcements, Events or Clubs. Body is optional when at least one image exists. Maximum 20 photos, 10 MB per new file and 60 MB aggregate new file bytes. New files accept signature-validated JPEG, PNG, WebP and AVIF. Imported files retain all source metadata and checksums.

Public reads expose published articles only. Admin search/pagination use bound SQL parameters. Protected server actions authorize independently of page routing. HTML output escapes paragraph text and captions; sanitizer restricts allowed tags, links and local media paths.

`GET /media/<segments>` requires a registered database path and a contained real filesystem path. It returns immutable media with checksum ETag, safe MIME/disposition, nosniff and sandbox policy. `GET /<legacy-path>` returns a 301 to the stored local destination. Unknown paths return 404; dependency failure returns 503.

## Offline commands

`db:migrate` applies ordered checksummed SQL under an advisory lock. `content:export <directory>` saves a dated snapshot outside Git. `content:import <directory>` verifies every byte and inserts missing source records without replacing subsequent edits. Its report includes broken references and rejected conversions; either makes the command fail.

`content:backup <directory>` reads a consistent database snapshot and checksum-verifies every media file. `content:restore <directory>` requires `FGS_RESTORE_DATABASE=DB_NAME`, an empty migrated database and empty media directory. It rejects modified backups and restores relational content transactionally. Run restoration against disposable storage before launch.
