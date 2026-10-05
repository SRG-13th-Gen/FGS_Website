# Content and route contracts

Source authority: `src/lib/content/types.ts`, section schemas/types and [SPEC-008](specs/008-wordpress-removal.md). WordPress REST/webhook contracts are retired from runtime.

## Stored resources

| Resource       | Contract                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Sections       | Eight registry slugs (the seven original editors plus `site-alumni`); validated JSON, positive revision and UTC modification date |
| Articles       | Unique slug, title, category, paragraph body, UTC dates, revision and `publish`/`draft`/`trash` status                            |
| Article images | Ordered media foreign keys, alt and caption; first image is cover; relationships written transactionally                          |
| Media          | Immutable registered path, filename, MIME, size, SHA-256, alt/caption, creation date and optional source key                      |
| Variants       | Imported media IDs served for legacy references but excluded from picker results                                                  |
| Legacy URLs    | Exact old paths mapped to validated relative destinations                                                                         |
| Schema history | Migration filename, checksum and application date                                                                                 |

Migration `003_alumni_pta.sql` widens the `articles.category` ENUM (new values appended last) and inserts the `site-alumni` section row with `INSERT IGNORE`. The row has no WordPress origin, so the registry marks it `legacyImport: false` and the offline importer skips it. A unit test asserts the SQL JSON equals `ALUMNI_DEFAULTS`.

`site-alumni` content: `sectionLabel` (1 to 60), `heading` (3 to 150), `intro` (0 to 400) and `achievements` (0 to 24, in order). Each achievement has `name` (1 to 100), `batch` (1 to 40, free text), `title` (1 to 120), `description` (0 to 400) and an optional `image` `{ mediaId, alt }` whose alt text is required (1 to 200). Defaults contain no people. A missing or invalid stored row falls back to the defaults, and a missing media record renders the card without a photo.

Schemas can represent draft/trash, but the current admin creates published stories and lists published entries. It has no draft-authoring, trash-restore or permanent-delete UI. Admin articles paginate by 10; media paginate by 12. `getPublishedArticles(options)` returns every published article unless told otherwise: `categories` keeps only those categories and `excludeCategories` drops them (bound parameters, never interpolated). The homepage feed passes `excludeCategories: ["pta", "alumni"]`, `/pta` and `/alumni` pass `categories`, the article page "more" list stays within the article's own area, and the sitemap and admin dashboard read every category.

## Mutation results

Protected entry points authorize before invoking content services. Article edits and section saves submit the loaded revision; conflicts require reload. Creation retains one UUID across retries and resets it after publication. Trash marks status and increments revision; it does not delete rows or require a client revision.

A section save that uploads new images also returns `uploadedMedia` (slot index to stored media id) so the form holds the saved reference and never uploads the same file twice. `alumniContent.getResult()` distinguishes a database outage (`unavailable`) from a missing or invalid row (defaults).

Article results distinguish `success`, `validation_error`, `error` and `uncertain`. Completed saves return their new revision and a `cacheWarning` when route refresh fails. Section forms use their own result union. Upload references allow retry reuse. An uncertain database outcome requires reconciliation before another mutation.

## Validation

Categories are `announcements`, `events`, `clubs`, `pta` and `alumni` (the labels are Announcements, Events, Clubs, PTA and Alumni). Title is required; at least one paragraph or photo is required. Maximum 20 ordered photos, 10 MB per new file and 60 MB aggregate new uploads. Reused library media does not add uploaded bytes. New uploads accept signature-validated JPEG, PNG, WebP and AVIF. Imported variants retain original metadata/checksums; safe imported SVG/GIF may be served but are not new-upload formats.

Section images reference registered media IDs, not arbitrary URLs. Gallery selection is independent of library membership. Search uses bound SQL; IDs/page numbers are validated. Paragraphs/captions are escaped and imported HTML is sanitized.

Uploads publish complete files through a same-directory atomic rename. Identical uploads reuse content; a retry repairs a partial file left by an earlier interrupted write. Article links preserve balanced parentheses in destinations while excluding enclosing prose punctuation.

## Public routes

| Route                         | Behavior                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | Dynamic published content; bundled section fallback and truthful news outage state                                                                   |
| `/news/[slug]`                | Published article (any category), missing-record handling, or distinct unavailable state                                                             |
| `/alumni`                     | `site-alumni` header and achievements, then published `alumni` articles; own title and canonical; empty and unavailable states                       |
| `/pta`                        | Static header, then published `pta` articles; own title and canonical; empty and unavailable states                                                  |
| `/media/[...path]`            | Registered file and contained realpath; immutable caching, checksum ETag, nosniff and sandbox policy                                                 |
| Legacy catch-all              | Exact mapped 301; unknown path 404; database outage 503                                                                                              |
| `/sitemap.xml`, `/robots.txt` | Production indexing controlled by `SITE_INDEXABLE`; lists `/`, `/alumni`, `/pta` and every published article; admin/API excluded from crawl guidance |

Admin routes (all behind `requireAdmin()`): `/admin/sections/alumni` (editor), `/admin/alumni/activities` and `/admin/pta/activities` (the shared article list locked to one category) and `/admin/articles/new?category=<slug>`, which preselects only an allowlisted category. Article URLs are unchanged: every article is `/news/[slug]`.

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
