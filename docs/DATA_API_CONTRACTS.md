# Data and API contracts

Status: WordPress is the accepted integration boundary. Resource mappings below describe upstream API concepts; application DTOs and interfaces are **Proposed**, **Unimplemented**, and not a published API. Select versions and settle feature decisions before making them executable contracts.

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

## Proposed server operation contracts

| Operation           | Input                                                               | Outcome and constraints                                                                                                  |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Public content read | Validated slug/ID or page/filter values                             | Normalized published content, genuine not-found, or dependency-unavailable; never raw privileged CMS errors              |
| Admin post write    | Resource ID when editing; allowlisted editable fields (Title, Category: `Clubs`/`Events`/`Announcements`, Body, Media with Captions); team session | Authorized WordPress write result per [SPEC-003](specs/003-team-admin.md), validation/permission/dependency failure, or unknown outcome requiring reconciliation |
| Category write      | ID when editing; permitted name/slug/parent fields                  | Validated CMS result; no arbitrary WordPress endpoint proxy                                                              |
| Media upload        | Allowed file plus permitted metadata                                | CMS media ID after successful validation/upload; limits and MIME policy need acceptance                                  |
| Cache refresh       | Validated content event                                             | Invalidate server-derived dependencies; do not repeat an already successful CMS write                                    |

Proposed admin operations use Server Actions; explicit external callbacks use Route Handlers. This avoids inventing a public `/api/admin/*` contract before it is needed. Each entry point must independently validate input and authorize the actor. A layout redirect is not a server authorization check.

For edits, decide concurrent-write detection and editor compatibility in SPEC-003. Preserve Gutenberg content unless an approved editor can round-trip it; route unsupported block edits to WordPress. Proposed post deletion means trash, not forced permanent deletion. WordPress remains the canonical result after mutations.

An internal result should distinguish validation failure, unauthorized/forbidden, missing resource, conflict, dependency failure, and uncertain outcome. Translate WordPress failures into safe UI messages and correlation IDs. Do not publish raw upstream responses or invent wire codes for Server Actions prematurely.

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
