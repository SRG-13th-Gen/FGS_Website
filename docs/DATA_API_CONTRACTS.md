# Data and API contracts

Status: WordPress is the accepted integration boundary. Resource mappings below describe upstream API concepts. The **public content read**, **SPEC-003 admin post/media write**, and **SPEC-007 site section content** (Hero/School Info built; About/Admission/Contact/Clubs/Gallery pending) contracts are implemented and verified locally (`src/lib/wordpress/`; see [SPEC-003](specs/003-team-admin.md#verification-and-evidence) and [SPEC-007](specs/007-site-content-management.md#verification-and-evidence)). The category, media, and revalidation-endpoint contracts below remain **Proposed**/**Unimplemented** except where a row says otherwise — select versions and settle feature decisions before making the rest executable.

## WordPress resource mapping

Configured base: `WORDPRESS_URL` plus `/wp-json/wp/v2`. Resolve paths against a fixed trusted base; never accept a client-supplied upstream URL.

| Concept            | WordPress field or endpoint                                                                | Adapter responsibility                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Posts              | `/posts`; `id`, `slug`, `status`, `title.rendered`, `content.rendered`, `excerpt.rendered` | Separate public rendered content from privileged edit-context data                    |
| Post relationships | `featured_media`, `categories`, `author`                                                   | Resolve IDs deliberately; these are not full media/category objects                   |
| Post timestamps    | `date_gmt`, `modified_gmt`                                                                 | Normalize documented UTC values; handle absent/unset dates explicitly                 |
| Pages              | `/pages`; ID, slug, rendered title/content, parent                                         | Map approved school pages; do not assume flat slugs uniquely describe every hierarchy |
| Categories         | `/categories`; `id`, `name`, `slug`, `parent`                                              | Preserve taxonomy IDs; filter only by validated inputs                                |
| Media              | `/media`; `id`, `source_url`, `mime_type`, `alt_text`, `caption.rendered`                  | Allow approved image origins and safe presentation                                    |

The original draft's `featured_image`, `published_at`, and `file_url` are conceptual names, not WordPress wire fields. Treat embedded resources as optional and handle missing/deleted relationships.

Public requests use published/view-context content only. List queries validate pagination and filters; adapters preserve useful total/page information. Admin edit data must remain private and uncached by shared public caches.

Official references consulted 2026-09-19: [posts](https://developer.wordpress.org/rest-api/reference/posts/), [pages](https://developer.wordpress.org/rest-api/reference/pages/), [categories](https://developer.wordpress.org/rest-api/reference/categories/), [media](https://developer.wordpress.org/rest-api/reference/media/). Recheck against the installed CMS and plugins when implementing.

## Server operation contracts

| Operation                   | Status                                                                                   | Input                                                                                                                             | Outcome and constraints                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public content read         | **Implemented** (`lib/wordpress/reads.ts`)                                               | Slug (detail) or none (listing); category filtering is fixed to the three allowed slugs                                           | Normalized published content (`ArticleListResult`/`ArticleDetailResult`), genuine `not-found`, or `unavailable`; never raw privileged CMS errors                                                                                |
| Admin post write            | **Implemented** (`lib/wordpress/publish.ts`, `app/admin/(protected)/publish-actions.ts`) | Title, Category (`clubs`/`events`/`announcements`), Body, ordered images with captions/alt text; admin session (`requireAdmin()`) | Authorized WordPress write result per [SPEC-003](specs/003-team-admin.md#admin-publishing-fr-007fr-008-implemented): `success`, `validation_error`, `error`, or `uncertain` (timeout/unparseable response — never auto-retried) |
| Category write              | Unimplemented                                                                            | ID when editing; permitted name/slug/parent fields                                                                                | Validated CMS result; no arbitrary WordPress endpoint proxy                                                                                                                                                                     |
| Media upload                | **Implemented** (part of admin post write above)                                         | Allowed file (jpeg/png/webp/avif, sniffed by content not extension) plus caption/alt text, ≤10 MB                                 | WordPress media ID + URL after successful upload; a retry reuses an already-uploaded image by ID instead of re-uploading                                                                                                        |
| Cache refresh (admin write) | **Implemented** — interim                                                                | N/A (called automatically after a successful publish)                                                                             | `revalidatePath("/")` + `revalidatePath("/news/<slug>")`; a failure is reported as `cacheWarning`, not a publish failure                                                                                                        |
| Cache refresh (webhook)     | Unimplemented — see [Proposed revalidation endpoint](#proposed-revalidation-endpoint)    | Validated content event                                                                                                           | Invalidate server-derived dependencies; do not repeat an already successful CMS write                                                                                                                                           |

Proposed admin operations use Server Actions; explicit external callbacks use Route Handlers. This avoids inventing a public `/api/admin/*` contract before it is needed. Each entry point must independently validate input and authorize the actor. A layout redirect is not a server authorization check.

For edits, decide concurrent-write detection and editor compatibility in SPEC-003. Preserve Gutenberg content unless an approved editor can round-trip it; route unsupported block edits to WordPress. Proposed post deletion means trash, not forced permanent deletion. WordPress remains the canonical result after mutations.

An internal result should distinguish validation failure, unauthorized/forbidden, missing resource, conflict, dependency failure, and uncertain outcome. Translate WordPress failures into safe UI messages and correlation IDs. Do not publish raw upstream responses or invent wire codes for Server Actions prematurely.

## Site section content (SPEC-007, partially implemented)

Public site sections (Hero, About, Admission, Clubs, Gallery, Contact, School Info) are
**implemented** on top of the WordPress `pages` resource, distinct from the article
(`posts`) contract above:

| Concept          | WordPress field/endpoint                                                                                                    | Adapter responsibility                                                                                                                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section content  | `page.meta.fgs_section_data` (JSON string)                                                                                  | Registered via `register_post_meta()` in a must-use plugin (`wordpress/mu-plugins/fgs-site-content.php`), `show_in_rest: true`, `auth_callback` requires `edit_pages`. Validated both ways against the section's zod schema — the schema, not the WordPress-registered REST schema, is authoritative. |
| Section identity | `page.slug` (`site-hero`, `site-about`, `site-admission`, `site-clubs`, `site-gallery`, `site-contact`, `site-school-info`) | Fixed slugs created once by the seed script; never created ad hoc by a save action                                                                                                                                                                                                                    |
| Section images   | `{ mediaId, alt }` inside the JSON, resolved against `/media/<id>`                                                          | Never a hand-typed URL; resolved to a live `source_url` at read time (same missing-media fallback as the article cover image)                                                                                                                                                                         |
| Last-updated     | `page.modified_gmt`                                                                                                         | Shown on the admin dashboard's per-section card                                                                                                                                                                                                                                                       |

Reads: `GET /wp/v2/pages?slug=<slug>&status=publish` (public, unauthenticated — the meta
field is readable to anyone who can view the published page). Writes:
`POST /wp/v2/pages/<id>` with `{ meta: { fgs_section_data: "<json>" } }`, authenticated,
after `requireAdmin()` and zod validation. A missing page is a configuration error ("run the
seed script"), not a normal not-found — section pages are only ever created by
`pnpm wp:seed-content`, never by a save action.

## Proposed revalidation endpoint

`POST /api/revalidate` accepts a server-originated event describing the resource kind, resource ID, and change type. The final producer-specific schema, event identity, and old-slug strategy belong to SPEC-004 and DEC-105.

- Authenticate with a secret in a request header over HTTPS, never a query-string credential. Compare securely and support rotation through configuration.
- Allowlist event kinds and derive affected cache dependencies on the server. Reject arbitrary paths, tags, or URLs from untrusted callers.
- Missing/invalid authentication returns `401`; malformed/unsupported events return `400`; successful invalidation returns `200`; dependency/processing failure returns a retryable `503` where retry is safe.
- Repeated valid events must be harmless. Agree replay controls and retries with the chosen producer. A successful response means invalidation was accepted/completed per the selected cache API, not that every visitor already received regenerated content.
- Include publication, unpublication, deletion, old/new slug, category, and media dependencies in acceptance tests. No webhook producer exists yet.

## Proposed inquiry endpoint

`POST /api/inquiries`, same-origin JSON. Proposed body: `name`, `email`, `message`, and a client-generated opaque `requestId`; optional topic/privacy fields depend on school approval. Body and field limits, normalization, and request-key retention must be specified before implementation. Recipients and mail routing are server configuration, never request fields.

| Result                     | Proposed response                                   | Required behavior                                                           |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| Provider accepted          | `202`, safe request reference and `accepted` status | UI says the inquiry was submitted, without promising receipt/read time      |
| Invalid request            | `400`, safe field errors                            | No send; keep usable input for correction                                   |
| Conflicting request key    | `409`, safe conflict code                           | Same key with different content never silently replaces a request           |
| Abuse limit exceeded       | `429`, safe retry guidance                          | No send; do not expose detection internals                                  |
| Definite provider failure  | `503`, `unavailable`                                | No false success; preserve form input                                       |
| Delivery outcome uncertain | `503`, `outcome_unknown`                            | Do not automatically send again; retain the original key for reconciliation |

A same-key retry with the same content returns the recorded result or pending/unknown outcome without another provider submission. Claim this guarantee only after shared durable key coordination and provider reconciliation/idempotency are implemented and tested. In-memory deduplication alone is not sufficient across instances or restarts. Store minimal metadata with approved expiry; even payload fingerprints need privacy consideration. The UI should disable repeated submit while pending, but server enforcement remains authoritative.

Construct sender and recipient headers from trusted configuration; validate any reply-to value and escape text for the chosen email format. Provider keys, provider response bodies, inquiry text, and email addresses must not appear in general logs. A missing delivery/privacy/abuse configuration keeps the production form disabled.

## Application-owned data and changes

Team identity mapping, audit metadata, rate-limit state, and inquiry request metadata are possible application data, not finalized tables. Do not create the draft's illustrative schema automatically. [DECISIONS.md](DECISIONS.md) governs storage selection and retention.

Feature specs must settle exact schemas, input bounds, error handling, compatibility, and fixtures before code. Once implemented, version breaking contracts deliberately and update tests and consuming code in the same change. Traceability is maintained in [TESTING.md](TESTING.md).
