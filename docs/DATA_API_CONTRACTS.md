# Content and route contracts

Source authority: `src/lib/content/types.ts`, section schemas/types and [SPEC-008](specs/008-wordpress-removal.md). WordPress REST/webhook contracts are retired from runtime.

## Stored resources

| Resource       | Contract                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Sections       | Seven registry slugs; validated JSON, positive revision and UTC modification date                            |
| Articles       | Unique slug, title, category, paragraph body, UTC dates, revision and `publish`/`draft`/`trash` status       |
| Article images | Ordered media foreign keys, alt and caption; first image is cover; relationships written transactionally     |
| Media          | Immutable registered path, filename, MIME, size, SHA-256, alt/caption, creation date and optional source key |
| Variants       | Imported media IDs served for legacy references but excluded from picker results                             |
| Legacy URLs    | Exact old paths mapped to validated relative destinations                                                    |
| Schema history | Migration filename, checksum and application date                                                            |

Schemas can represent draft/trash, but the current admin creates published stories and lists published entries. It has no draft-authoring, trash-restore or permanent-delete UI. Admin articles paginate by 10; media paginate by 12. Public news reads all published articles.

## Mutation results

Protected entry points authorize before invoking content services. Article edits and section saves submit the loaded revision; conflicts require reload. Creation retains one UUID across retries and resets it after publication. Trash marks status and increments revision; it does not delete rows or require a client revision.

Article results distinguish `success`, `validation_error`, `error` and `uncertain`. Completed saves return their new revision and a `cacheWarning` when route refresh fails. Section forms use their own result union. Upload references allow retry reuse. An uncertain database outcome requires reconciliation before another mutation.

## Validation

Categories are `announcements`, `events` and `clubs`. Title is required; at least one paragraph or photo is required. Maximum 20 ordered photos, 10 MB per new file and 60 MB aggregate new uploads. Reused library media does not add uploaded bytes. New uploads accept signature-validated JPEG, PNG, WebP and AVIF. Imported variants retain original metadata/checksums; safe imported SVG/GIF may be served but are not new-upload formats.

Section images reference registered media IDs, not arbitrary URLs. Gallery selection is independent of library membership. Search uses bound SQL; IDs/page numbers are validated. Paragraphs/captions are escaped and imported HTML is sanitized.

Uploads publish complete files through a same-directory atomic rename. Identical uploads reuse content; a retry repairs a partial file left by an earlier interrupted write. Article links preserve balanced parentheses in destinations while excluding enclosing prose punctuation.

## Public routes

| Route                         | Behavior                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                           | Dynamic published content; bundled section fallback and truthful news outage state                   |
| `/news/[slug]`                | Published article, missing-record handling, or distinct unavailable state                            |
| `/media/[...path]`            | Registered file and contained realpath; immutable caching, checksum ETag, nosniff and sandbox policy |
| Legacy catch-all              | Exact mapped 301; unknown path 404; database outage 503                                              |
| `/sitemap.xml`, `/robots.txt` | Production indexing controlled by `SITE_INDEXABLE`; admin/API excluded from crawl guidance           |

Media paths reject traversal/symlink escape. Safe images are inline; other imported files download as attachments. A matching ETag returns 304. Crawl directives are not authorization.

## Tool interfaces

Scripts read `FGS_ENV_FILE` or default `.env.local`; existing process variables take precedence. Non-secret configuration is listed in [deployment](DEPLOYMENT.md).

| Command                            | Behavior                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`                  | Ordered checksummed SQL under an advisory lock                                                    |
| `pnpm content:export <directory>`  | Historical WordPress export into ignored `.data`/`backups`; source credentials supplied privately |
| `pnpm content:import <directory>`  | Checksum-verified snapshot import; source-key reruns preserve later edits; reconciliation report  |
| `pnpm content:backup <directory>`  | Consistent relational snapshot plus checksum-verified media                                       |
| `pnpm content:restore <directory>` | Explicit `FGS_RESTORE_DATABASE=DB_NAME`; empty migrated content tables/media; checksums verified  |

Content import is offline, not part of deployment. It can insert valid records before its reconciliation report fails; inspect that report before retrying. MySQL DDL and filesystem copies are not transactional rollback. See [CI/CD](CI_CD.md) and [recovery](DEPLOYMENT.md).
