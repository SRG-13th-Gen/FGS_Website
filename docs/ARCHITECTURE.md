# Architecture

## Stack and ownership

Next.js 16 App Router, React 19, TypeScript, Tailwind/shadcn, NextAuth Google OAuth and mysql2. Node 24 and pnpm 10.30.2 are the supported toolchain; exact dependency versions live in `package.json`, with one pnpm lockfile. Local Docker runs MariaDB; Hostinger runs managed Node applications and MySQL.

The application owns content and uploads. MySQL stores seven validated section JSON records, articles, ordered article images, revisions, media metadata, variants, schema history and legacy URL mappings. Upload bytes live in immutable, environment-specific storage outside deployments. WordPress exists only as offline migration input. [DEC-118](DECISIONS.md#current-decisions) records this choice.

## Modules and routes

| Location                               | Responsibility                                                        |
| -------------------------------------- | --------------------------------------------------------------------- |
| `src/app`                              | Homepage, `/news/[slug]`, admin, OAuth, media, redirects and metadata |
| `src/lib/content`                      | Server-only SQL, content validation, sanitization and media services  |
| `src/lib/auth`                         | Verified Google email allowlist and eight-hour sessions               |
| `src/lib/env`                          | Server configuration validation                                       |
| `src/components/public`, `admin`, `ui` | School presentation, editor controls and UI primitives                |
| `db/migrations`                        | Immutable, ordered SQL migrations                                     |
| `scripts`                              | Migration, import/export, backup/restore and local tooling            |
| `tests`                                | Unit, mocked integration, guarded database and browser suites         |

## Request flow

Public pages read published content dynamically without persistent content caches. React `cache` only deduplicates section reads within a render. Missing articles and failed database reads remain distinct; unavailable sections use bundled design fallbacks.

Protected pages/actions authorize the current session before privileged operations. Validated inputs reach parameterized SQL. Article/image writes are transactional; article edits and section saves compare revisions. Article creation uses a stable mutation UUID for retries. Trash is a soft deletion. A completed save followed by a failed route refresh returns a warning rather than inviting duplicate writes.

Uploads validate signatures and size, hash bytes and reuse identical files. `/media/...` serves only registered paths with realpath containment. Library membership does not add images to the public Gallery. Imported resized variants remain available for legacy links but are hidden from the picker.

## Environments and releases

Preview and production have separate databases, credentials and media roots. Restart/redeployment persistence and recovery were verified at launch. Branch-based CI/CD applies backward-compatible migrations before managed builds; failed builds do not undo schema changes. Application rollback preserves live content and uploads.

See [contracts](DATA_API_CONTRACTS.md), [CI/CD](CI_CD.md), [recovery](DEPLOYMENT.md) and [SPEC-008](specs/008-wordpress-removal.md).
