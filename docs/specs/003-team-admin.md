# SPEC-003: Team Admin & Article Management

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature ID            | SPEC-003                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Approval status       | Accepted (per owner instruction 2026-09-20)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Implementation status | Partially implemented — public reads, admin publishing, and the All Articles list/edit/trash flow (FR-007/FR-008/FR-009) are built and verified locally; team authentication (FR-005) remains the temporary dev-only login pending DEC-103; FR-006 role enforcement is deferred to DEC-111. The admin lives inside the [SPEC-007](007-site-content-management.md) CMS shell at `/admin/articles` (list), `/admin/articles/new` (publish), and `/admin/articles/<id>/edit` (edit or read-only). |
| Responsible owner     | Engineering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Requirement IDs       | [FR-005, FR-006, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-003](../FRS_NFRS.md)                                                                                                                                                                                                                                                                                                                                                                                                            |
| Decision IDs          | [DEC-103, DEC-104, DEC-111](../DECISIONS.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Acceptance evidence   | See [Verification and evidence](#verification-and-evidence) below                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Outcome and scope

### Actor & Problem

The school administrator / client needs a clean, streamlined portal at `/admin` to author and publish school updates, news, and stories without navigating the full complexity of the native WordPress dashboard.

### Observable Outcome

An authenticated administrator can visit `/admin`, create a new article with a title, category (`Clubs`, `Events`, `Announcements`), narrative body, and multiple uploaded pictures where each picture can have its own dedicated caption. Upon submission, the article is published to WordPress and reflected on the website. From the All Articles list, the admin can search by title, filter by category, page through results, edit an existing article's title/category/body/pictures, and move an article to trash with a confirmation naming it — never a permanent delete. An article whose WordPress content the simple editor can't safely reproduce opens read-only with a link to edit it natively in WordPress instead.

### In Scope

- Client-facing dashboard at `/admin` and article publishing form.
- Article fields:
  - **Title**: Headline of the story or announcement.
  - **Category**: Choice of **Clubs**, **Events**, or **Announcements**.
  - **Body**: Main article text/content.
  - **Media / Pictures**: Multi-file image upload with an individual caption field for every uploaded picture.
- Server-side validation and secure orchestration with WordPress REST API (`/wp-json/wp/v2/media` and `/wp-json/wp/v2/posts`).
- Transparent feedback states (loading, upload progress, validation errors, success confirmation).
- All Articles list: cover thumbnail, title, category, published date, status; title search and category filter pushed down to the WordPress REST query; pagination.
- Editing an existing article's title, category, body, and pictures (add/replace/remove, captions, alt text) — when the admin editor can safely round-trip its content (see [Read-only detection rule](#read-only-detection-rule)).
- Moving an article to WordPress's trash, with a confirmation dialog naming it. Never a permanent/forced delete.

### Out of Scope

- Full-page site layout editing or arbitrary Gutenberg block design (native WordPress retains ownership of full static page layouts) — including editing an article whose content the simple editor can't safely round-trip; that stays a native WordPress edit.
- Visitor commenting, user registration, or student portal features.
- Permanent media deletion or arbitrary taxonomy administration.
- Restoring a trashed article from `/admin` (use wp-admin; WordPress's own trash retention still applies).
- Draft/pending/scheduled article workflows — every article this app creates or lists is `status: publish`.

---

## Behavior and acceptance criteria

### 1. Form Composition & Validation

- **Title**
  - Given an empty or whitespace-only title, when submitted, then reject with a descriptive error ("Title is required").
  - Given a valid title (e.g. 3–200 characters), accept and sanitize leading/trailing whitespace.
- **Category**
  - Must strictly be one of the three accepted categories:
    - `Clubs`
    - `Events`
    - `Announcements`
  - Rejects any unrecognized or empty category value.
- **Body**
  - Given an empty body, when submitted, then reject with a descriptive error ("Article body is required").
  - Preserves formatting (paragraphs, line breaks, bullet lists) for presentation.
- **Pictures & Captions**
  - Allows uploading zero, one, or multiple images (`image/jpeg`, `image/png`, `image/webp`, `image/avif`).
  - Enforces per-file size limits (e.g., maximum 10MB per image).
  - Every uploaded picture displays a preview thumbnail with an associated **Caption** input field (optional per picture).
  - Admins can reorder or remove individual images before publishing.

### 2. Submission & Error Handling

- **Given** valid article data and authenticated admin session, **when** the admin clicks "Publish", **then**:
  1. The UI enters a pending/loading state and disables double-submission.
  2. The server action authenticates with WordPress using server-side application credentials.
  3. Media files are uploaded to `/wp-json/wp/v2/media` with their corresponding captions and alt text.
  4. The post is created in `/wp-json/wp/v2/posts` with the title, content body, uploaded media references (featured media and gallery/images with captions), and assigned category taxonomy ID.
  5. Content cache revalidation is triggered ([SPEC-004](README.md#spec-004-content-revalidation)).
  6. The UI displays a success alert with the published article status.
- **Given** a network or WordPress API failure, **when** submission fails, **then**:
  1. The admin receives a clear, non-technical failure message.
  2. All entered form data (title, category, body, selected files, captions) is preserved in the form so the admin can retry without losing their work.
- **Given** an unauthenticated visitor, **when** requesting `/admin` or submitting admin actions, **then** access is denied and redirected to the login flow.

---

## Public reads (FR-009, implemented)

`src/lib/wordpress/reads.ts` is the server-only public read adapter used by the
home page news section and `/news/[slug]`:

- Category slugs (`clubs`, `events`, `announcements`) are resolved to live
  WordPress category IDs at runtime (`categories.ts`); IDs are never hardcoded.
  Only published posts in those three categories are returned — a post outside
  them (e.g. `uncategorized`) is excluded from both the listing and direct slug
  lookup.
- `featured_media` becomes the article's cover image; missing or deleted media
  degrades to no cover image rather than an error.
- Post `content.rendered` is sanitized server-side (`sanitize.ts`, using
  `sanitize-html`) against a strict allowlist — paragraphs, lists, emphasis,
  links (`http`/`https`/`mailto`/`tel` only, no `javascript:`), headings
  (h2–h4), figures, images, and captions. Images are additionally restricted to
  the configured `WORDPRESS_URL` origin.
- Every read returns a typed result: `{status: "ok", ...}`,
  `{status: "not-found"}` (confirmed absent, or outside the allowed
  categories), or `{status: "unavailable"}` (upstream unreachable/rejected —
  including `env/schema.ts` rejecting a non-HTTPS `WORDPRESS_URL` outside
  development). The UI shows a calm "unavailable"/"no news yet" state, never a
  false not-found or fabricated sample content.
- **Interim revalidation (not DEC-105)**: no CMS webhook producer exists yet, so
  reads use a 60-second `fetch` `revalidate` window as a stopgap for native
  WordPress edits. Admin-published articles additionally get an immediate
  `revalidatePath("/")` + `revalidatePath("/news/<slug>")` call. This interim
  window is not a substitute for the accepted DEC-105 webhook design.

## Admin publishing (FR-007/FR-008, implemented)

### Application Input Contract (Server Action)

Implemented in `src/lib/wordpress/types.ts`, orchestrated by
`src/lib/wordpress/publish.ts` (pure business logic, no Next.js APIs) and
wrapped by `src/app/admin/(protected)/publish-actions.ts` (`requireAdmin()`,
`FormData` parsing, cache revalidation):

```typescript
export interface ArticleImageInput {
  clientId: string;
  file: File;
  caption: string;
  altText: string;
  existingMediaId: number | null; // set on retry to reuse an already-uploaded image
}

export interface PublishArticleInput {
  title: string;
  category: string; // validated against ARTICLE_CATEGORIES
  body: string;
  images: ArticleImageInput[];
}

export type PublishArticleResult =
  | {
      status: "success";
      slug: string;
      articlePath: string;
      cacheWarning: boolean;
    }
  | {
      status: "validation_error";
      fieldErrors: Partial<
        Record<"title" | "category" | "body" | "images", string>
      >;
      uploadedImages: UploadedImageRef[];
    }
  | { status: "error"; message: string; uploadedImages: UploadedImageRef[] }
  | {
      status: "uncertain";
      message: string;
      uploadedImages: UploadedImageRef[];
    };
```

### WordPress Upstream Mapping

| Application Field           | Upstream Endpoint / Field                  | Notes                                                                                                                                                                             |
| --------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                     | `POST /wp/v2/posts` -> `title`             | Sent as a plain string                                                                                                                                                            |
| `category`                  | `POST /wp/v2/posts` -> `categories`        | Resolved at runtime to the matching WordPress category ID; never hardcoded                                                                                                        |
| `body`                      | `POST /wp/v2/posts` -> `content`           | Built into Gutenberg block markup: paragraph blocks (blank-line split, HTML-escaped) followed by image blocks for every image **after** the first (`src/lib/wordpress/blocks.ts`) |
| `images[0]`                 | `POST /wp/v2/media`, then `featured_media` | First image is uploaded and set as the post's featured/cover image; **not** duplicated inline in the body                                                                         |
| `images[i].file`            | `POST /wp/v2/media` (multipart)            | Content sniffed by magic bytes (jpeg/png/webp/avif), not the extension or browser MIME type; 10 MB per file                                                                       |
| `images[i].caption`         | `POST /wp/v2/media` -> `caption`           | Also rendered as the image block's `<figcaption>` for images after the cover                                                                                                      |
| `images[i].altText`         | `POST /wp/v2/media` -> `alt_text`          | Falls back to caption, then article title, when left blank                                                                                                                        |
| `images[i].existingMediaId` | `GET /wp/v2/media/<id>`                    | On retry, confirms and reuses a previously uploaded image instead of re-uploading it                                                                                              |

Retries never duplicate uploads: a partial-failure result includes
`uploadedImages` (client id → WordPress media ID + URL); the admin form resends
these as `existingMediaId` so already-uploaded slots are skipped. A timeout or
unparseable response from post creation returns `status: "uncertain"` — the
admin is told to check wp-admin before retrying, and nothing is auto-retried.
On success, a failed `revalidatePath` call is reported as
`cacheWarning: true` ("Published, but the site may take a few minutes to
update"), distinct from a publish failure.

---

## Article list, edit, and trash (implemented)

Implemented in `src/lib/wordpress/admin-articles.ts` (reads),
`src/lib/wordpress/edit-article.ts` (mutations — reuses the same
image-upload/reuse pipeline as publishing, factored into
`src/lib/wordpress/article-images.ts`), and wired by
`src/app/admin/(protected)/articles/{page.tsx,actions.ts}` (list, trash) and
`src/app/admin/(protected)/articles/[id]/edit/{page.tsx,actions.ts}` (edit).
The category picker and picture upload/caption/replace/remove/cover UI are
shared components (`src/components/admin/article-fields.tsx`) used by both
the New Article and Edit Article forms — never duplicated.

### All Articles list

`GET /wp/v2/posts` with `status=publish`, `per_page=10`, `page`, `orderby=date&order=desc`,
and (when set) `search` and `categories` — search and pagination are WordPress
REST query parameters, never a fetch-everything-then-filter-in-app approach.
Title search uses the mu-plugin's `rest_post_query` filter
(`wordpress/mu-plugins/fgs-site-content.php`) to set WP_Query's
`search_columns` to `post_title` only, since the REST API's bare `search`
parameter matches title, content, and excerpt together with no built-in way to
scope it to the title alone. Pagination reads the `X-WP-Total`/`X-WP-TotalPages`
response headers. The category filter is scoped to the three managed
categories; the table's category column shows "Uncategorized" for a post
outside them rather than hiding it — the admin can still see and trash it.

### Editing an article

`GET /wp/v2/posts/<id>?context=edit` (authenticated) reads the raw,
un-rendered `content` field — `rendered` strips the Gutenberg block comments
that reading the real structure back out requires. The featured image is
edited as image slot 0, exactly the model `publishArticle()` already uses.
Saving revalidates `/`, the article's own path, and its own edit page, with
the same `cacheWarning`/`uncertain` distinct-from-failure handling as
publishing (see [Admin publishing](#admin-publishing-fr-007fr-008-implemented)
above) — a save-request timeout never auto-retries.

An unchanged photo (no new file selected) is never re-uploaded: its existing
media id is confirmed and reused, identically to a publish retry. **Concurrent
edits**: no optimistic-locking/conflict detection is implemented — a save is
last-write-wins, the same as every other admin write path in this app (the
section editors included). A future spec can add `modified_gmt`-based conflict
detection if concurrent admin edits turn out to be a real problem.

### Read-only detection rule

Per [DATA_API_CONTRACTS.md](../DATA_API_CONTRACTS.md): "Preserve Gutenberg
content unless an approved editor can round-trip it; route unsupported block
edits to WordPress." `src/lib/wordpress/article-content.ts` implements the
exact rule, covered by `tests/unit/article-content.test.ts`:

An article is editable in the simple admin editor if and only if its raw
content is composed **entirely** of top-level Gutenberg blocks, matching all
of the following:

1. Every block is either `core/paragraph` or `core/image` — any other block
   type (heading, list, gallery, quote, embed, columns, custom HTML, …) opens
   read-only.
2. Every `core/paragraph` block comes **before** every `core/image` block, with
   no interleaving. The admin editor always regenerates content in that exact
   order (paragraphs, then images) via `buildArticleContent()` — an image
   placed between paragraphs by a native edit can't be preserved in that
   position, so saving through the simple editor would silently reorder it.
3. Every paragraph block has no custom block attributes (alignment, drop cap,
   custom class, etc.) and its inner HTML is plain text plus `<br>` line
   breaks only — no links, bold/italic, or other inline formatting the plain
   textarea editor would strip on save.
4. Every image block has only the `id` and (optionally) `sizeSlug` attributes
   `buildImageBlock()` itself ever writes (nothing implying a custom link
   destination, alignment, or layout), and its markup is exactly one `<img>`
   with a numeric media id plus an optional plain-text `<figcaption>` — no
   wrapping link, gallery grid, or nested formatting.
5. Content with **no** block markup at all (legacy/classic-editor HTML) is
   always unsafe — the simple editor has no representation for it.

Anything that fails these checks returns a specific, admin-readable reason
(e.g. "This article has a picture placed between paragraphs — the admin
editor always puts all pictures after the body text, so saving would reorder
it.") and the edit page renders read-only: the reason, a note to edit the
article in WordPress instead, and a direct `wp-admin/post.php?post=<id>&action=edit`
link. The rule is intentionally conservative — it's fine to send a
technically-safe-but-unusual article to WordPress unnecessarily; it is never
fine to silently corrupt or reorder content the simple editor can't fully
represent.

### Trashing an article

`DELETE /wp/v2/posts/<id>` **without** `force=true` — the WordPress REST API's
documented behavior for that is trash, not permanent deletion (confirmed
against the [Posts endpoint reference](https://developer.wordpress.org/rest-api/reference/posts/#delete-a-post),
consulted 2026-09-21). A trashed post keeps WordPress's normal trash retention
and can be restored natively; this app never exposes permanent deletion. The
confirmation dialog names the article being trashed. A successful trash
revalidates `/`, `/admin/articles`, and the article's own public path so it
disappears from the site immediately rather than waiting for the 60-second
interim revalidation window.

---

## Security and credentials

- All privileged communication with WordPress uses server-side environment variables (`WORDPRESS_USERNAME`, `WORDPRESS_APPLICATION_PASSWORD`), read only through `src/lib/wordpress/client.ts`.
- No CMS credentials or private tokens are ever exposed to the client or browser bundle (enforcing [NFR-001](../FRS_NFRS.md)).
- Direct access to `/admin` requires authenticated session validation.

### Interim development login (temporary, not FR-005)

DEC-103 (managed OIDC team login) is on hold pending access to the school's Google
account. Until it is resolved, `/admin` is gated by a temporary, dev-only seeded
login (`src/lib/auth/dev-login.ts`) so admin UI work can continue locally:

- Credentials come only from `ADMIN_DEV_EMAIL`/`ADMIN_DEV_PASSWORD` in `.env.local`;
  the session cookie is signed with `ADMIN_DEV_SESSION_SECRET`, is httpOnly/sameSite=lax,
  and expires after 8 hours.
- It only functions outside production (`NODE_ENV !== "production"`). In a
  production build, `/admin/login` shows a disabled-sign-in message and every
  `/admin` route denies access; there is no open-access fallback.
- `requireAdmin()` (`src/lib/auth/require-admin.ts`) is the actual authorization
  check, called from the protected admin layout; the proxy-level redirect is only
  an optimistic UX shortcut.
- This has no rate limiting, lockout, password rules, allowlist, or roles.

FR-005 and this spec's authentication requirement remain **unimplemented** until
DEC-103 is accepted and built; the interim login is scaffolding, not the accepted
solution.

---

## Verification and evidence

All results below are from this repository's own test run against local Docker
WordPress (`pnpm test`, `pnpm test:e2e`) plus one manual publish, not a
hosted/CI run — see [TESTING.md](../TESTING.md) for scope.

| Criterion                                                                                                                                                                                | Verification Type | Procedure                                                                                                                                                                                                                                                                                                                                                                 | Result              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Form validation (title, category, body)                                                                                                                                                  | Unit test         | `tests/unit/wordpress-validation.test.ts`                                                                                                                                                                                                                                                                                                                                 | Passed              |
| Category allowlist (`clubs`, `events`, `announcements`)                                                                                                                                  | Unit test         | `tests/unit/wordpress-validation.test.ts`                                                                                                                                                                                                                                                                                                                                 | Passed              |
| Image content-type sniffing and 10 MB limit                                                                                                                                              | Unit test         | `tests/unit/wordpress-validation.test.ts`                                                                                                                                                                                                                                                                                                                                 | Passed              |
| Gutenberg block content builder (escaping, paragraph split, images)                                                                                                                      | Unit test         | `tests/unit/wordpress-blocks.test.ts`                                                                                                                                                                                                                                                                                                                                     | Passed              |
| Public HTML sanitizer allowlist                                                                                                                                                          | Unit test         | `tests/unit/wordpress-sanitize.test.ts`                                                                                                                                                                                                                                                                                                                                   | Passed              |
| Upstream post/media mapping, incl. missing media                                                                                                                                         | Unit test         | `tests/unit/wordpress-reads.test.ts`                                                                                                                                                                                                                                                                                                                                      | Passed              |
| Media-then-post order, captions/alt/featured_media, retry reuse                                                                                                                          | Integration test  | `tests/integration/wordpress-publish.test.ts` (mocked WP REST API)                                                                                                                                                                                                                                                                                                        | Passed              |
| Published-but-refresh-failed result                                                                                                                                                      | Integration test  | `tests/integration/publish-action.test.ts`                                                                                                                                                                                                                                                                                                                                | Passed              |
| Home page renders / calm unavailable state when reads are rejected                                                                                                                       | E2E test          | `tests/e2e/news-resilience.spec.ts`                                                                                                                                                                                                                                                                                                                                       | Passed              |
| Authentication gate on `/admin`                                                                                                                                                          | E2E test          | `tests/e2e/admin-login.spec.ts`                                                                                                                                                                                                                                                                                                                                           | Passed              |
| Publish one article with two images through `/admin`                                                                                                                                     | Manual            | Signed in with the dev login; published against local WordPress; confirmed on the home page, `/news/<slug>`, and in `wp-admin` (post + media, correct category/captions/alt text)                                                                                                                                                                                         | Passed (2026-09-20) |
| Read-only detection rule: round-trips our own content, rejects everything else                                                                                                           | Unit test         | `tests/unit/article-content.test.ts`                                                                                                                                                                                                                                                                                                                                      | Passed              |
| Admin list query building (search, category filter, pagination) and edit-context read (round-trippable vs. read-only vs. not-found vs. trashed)                                          | Integration test  | `tests/integration/admin-articles.test.ts` (mocked WP REST API)                                                                                                                                                                                                                                                                                                           | Passed              |
| Update pipeline: reuses unchanged photos, uploads new ones, clears the featured image when all photos are removed, uncertain-on-timeout                                                  | Integration test  | `tests/integration/edit-article.test.ts` (mocked WP REST API)                                                                                                                                                                                                                                                                                                             | Passed              |
| Trash: DELETE without `force`, not-found, uncertain-on-timeout                                                                                                                           | Integration test  | `tests/integration/edit-article.test.ts`                                                                                                                                                                                                                                                                                                                                  | Passed              |
| Edit/trash server actions: permission gate, revalidation, cache-warning result                                                                                                           | Integration test  | `tests/integration/article-management-actions.test.ts`                                                                                                                                                                                                                                                                                                                    | Passed              |
| Create an article, edit its title/body, add a photo, confirm each change on the public page, then trash it and confirm it disappears from the site but still exists in WordPress's trash | Manual            | Signed in with the dev login; ran the full flow against local WordPress; confirmed the edited title/body/photo caption rendered at `/news/<slug>`, confirmed the article disappeared from the public page and the admin list after trashing, and confirmed via the WordPress REST API that the post remained retrievable with `status=trash` (not deleted) before cleanup | Passed (2026-09-21) |
| A native-WordPress-edited article (a heading block) opens read-only with the reason shown and a working link to `wp-admin`                                                               | Manual            | Created a post directly via the WordPress REST API with a `core/heading` block, opened its `/admin/articles/<id>/edit` page, confirmed the read-only view and "Open in WordPress" link, confirmed no Save form is rendered                                                                                                                                                | Passed (2026-09-21) |
