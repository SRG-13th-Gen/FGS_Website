# SPEC-003: Team Admin & Article Management

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| Feature ID            | SPEC-003                                                          |
| Approval status       | Accepted (per owner instruction 2026-09-20)                        |
| Implementation status | Unimplemented                                                      |
| Responsible owner     | Engineering                                                        |
| Requirement IDs       | [FR-005, FR-006, FR-007, FR-008, NFR-001, NFR-002, NFR-003](../FRS_NFRS.md) |
| Decision IDs          | [DEC-103, DEC-104, DEC-111](../DECISIONS.md)                       |
| Acceptance evidence   | Pending implementation                                             |

## Outcome and scope

### Actor & Problem
The school administrator / client needs a clean, streamlined portal at `/admin` to author and publish school updates, news, and stories without navigating the full complexity of the native WordPress dashboard.

### Observable Outcome
An authenticated administrator can visit `/admin`, create a new article with a title, category (`Clubs`, `Events`, `Announcements`), narrative body, and multiple uploaded pictures where each picture can have its own dedicated caption. Upon submission, the article is published to WordPress and reflected on the website.

### In Scope
- Client-facing dashboard at `/admin` and article publishing form.
- Article fields:
  - **Title**: Headline of the story or announcement.
  - **Category**: Choice of **Clubs**, **Events**, or **Announcements**.
  - **Body**: Main article text/content.
  - **Media / Pictures**: Multi-file image upload with an individual caption field for every uploaded picture.
- Server-side validation and secure orchestration with WordPress REST API (`/wp-json/wp/v2/media` and `/wp-json/wp/v2/posts`).
- Transparent feedback states (loading, upload progress, validation errors, success confirmation).

### Out of Scope
- Full-page site layout editing or arbitrary Gutenberg block design (native WordPress retains ownership of full static page layouts).
- Visitor commenting, user registration, or student portal features.
- Permanent media deletion or arbitrary taxonomy administration.

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

## Interfaces and data ownership

### Application Input Contract (Server Action)

```typescript
export interface ArticleMediaItem {
  file: File;
  caption?: string;
  altText?: string;
}

export type ArticleCategory = "clubs" | "events" | "announcements";

export interface CreateArticleInput {
  title: string;
  category: ArticleCategory;
  body: string;
  media?: ArticleMediaItem[];
}

export interface CreateArticleResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof CreateArticleInput, string>>;
}
```

### WordPress Upstream Mapping

| Application Field | Upstream Endpoint / Field | Notes |
| ----------------- | ------------------------- | ----- |
| `title` | `POST /wp/v2/posts` -> `title` | Set as post title |
| `category` | `POST /wp/v2/posts` -> `categories` | Mapped to WordPress Category ID for `clubs`, `events`, or `announcements` |
| `body` | `POST /wp/v2/posts` -> `content` | Stored as rendered content along with image blocks / gallery |
| `media[i].file` | `POST /wp/v2/media` -> Binary body | Media upload with `Content-Disposition` |
| `media[i].caption`| `POST /wp/v2/media` -> `caption` | Stored directly in WordPress media object |
| `media[0]` | `POST /wp/v2/posts` -> `featured_media` | First image assigned as featured cover image |

---

## Security and credentials

- All privileged communication with WordPress uses server-side environment variables (`WP_APPLICATION_USERNAME`, `WP_APPLICATION_PASSWORD`).
- No CMS credentials or private tokens are ever exposed to the client or browser bundle (enforcing [NFR-001](../FRS_NFRS.md)).
- Direct access to `/admin` requires authenticated session validation.

---

## Verification and evidence

| Criterion | Verification Type | Procedure | Result |
| --------- | ----------------- | --------- | ------ |
| Form validation (title, category, body) | Unit test | Submit invalid/empty payloads to article validation schema | Planned |
| Category allowlist (`clubs`, `events`, `announcements`) | Unit test | Verify only allowed category slugs are accepted | Planned |
| Image upload and caption attachment | Integration test | Mock WP REST API media and post endpoints; verify caption payload | Planned |
| Form resilience on error | E2E test | Trigger simulated 500 error; assert form fields and files remain populated | Planned |
| Authentication gate on `/admin` | E2E test | Assert unauthenticated request to `/admin` is redirected | Planned |
