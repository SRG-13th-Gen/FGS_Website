# SPEC-007: Site Content Management

| Field                 | Value                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature ID            | SPEC-007                                                                                                                                                                                                                                                                                                                      |
| Approval status       | Accepted (owner instruction, recorded 2026-09-20 — see [DECISIONS.md](../DECISIONS.md))                                                                                                                                                                                                                                       |
| Implementation status | Partially implemented — storage layer, admin shell/dashboard, and the Hero, School Info, About, Admission, Contact, Clubs, and Gallery section editors are built, wired to the public site, and verified locally. The Articles list/edit/trash flow (step 8) is not yet built (a placeholder exists so navigation never 404s) |
| Responsible owner     | Engineering                                                                                                                                                                                                                                                                                                                   |
| Related requirements  | Extends [SPEC-003](003-team-admin.md)'s admin scope; formal FR/NFR IDs for this feature are not yet added to [FRS_NFRS.md](../FRS_NFRS.md) — pending a follow-up documentation pass                                                                                                                                           |
| Decision IDs          | [DEC-114](../DECISIONS.md) (narrowed — no longer covers structured section editing), new storage decision recorded in DECISIONS.md                                                                                                                                                                                            |
| Acceptance evidence   | See [Verification and evidence](#verification-and-evidence) below                                                                                                                                                                                                                                                             |

## Owner instruction (recorded 2026-09-20)

> The owner wants the school to edit all public website content from `/admin`: every
> landing page section's text and photos, plus articles.

Scope boundary set in the same instruction: **structured field editing only**. Arbitrary
page-layout or Gutenberg block editing remains out of scope and stays covered by
[DEC-114](../DECISIONS.md)'s deferral — the admin edits fixed fields per section (text,
images, and bounded repeatable lists), not free-form layout.

## Outcome and scope

### Actor & Problem

The school currently can't change most of its own public website content — headings, body
copy, and images across the landing page are hardcoded in the Next.js source. Only articles
(SPEC-003) are editable through WordPress today.

### Observable Outcome

An authenticated admin visits `/admin`, picks a website section from the sidebar (Hero,
About, Admission, Clubs, Gallery, Contact, or School Info), edits its text fields and
images through a plain form, and saves. The public site reflects the change (immediately for
admin-originated saves, and within the interim revalidation window for any other change) and
never breaks — a missing or unreachable section falls back to the same default content the
seed script uses.

### In Scope

- One structured content model per public site section, stored entirely in WordPress (no app
  database, no JSON files as a content store).
- An admin editor per section: grouped fields matching the section's field order on the
  public page, image replace with alt text, and keyboard-accessible add/edit/remove/reorder
  for repeatable items (programs, requirement categories, enrollment steps, contact cards,
  clubs, gallery photos, footer program list).
- An idempotent seed script that imports today's hardcoded copy/images into WordPress once.
- Public reads for every section, replacing the hardcoded copy, with a safe default fallback.
- The admin shell: sidebar navigation, dashboard with per-section last-updated + quick
  actions, sticky save bar, unsaved-changes warning, and toasts.

### Out of Scope

- Arbitrary page-layout or Gutenberg block editing (DEC-114 still covers this).
- Real team login/roles (DEC-103/DEC-111), the revalidation webhook (DEC-105), the inquiry
  form, and public visual redesign.
- Editing/trashing existing articles (tracked as pending in [SPEC-003](003-team-admin.md)).

## Storage approach

**Chosen approach**: one WordPress `page` per section (slugs `site-hero`, `site-about`,
`site-admission`, `site-clubs`, `site-gallery`, `site-contact`, `site-school-info`), each
holding its section's content as a single JSON string in a custom post meta field
(`fgs_section_data`), registered via `register_post_meta()` with `show_in_rest: true` in a
small version-controlled must-use plugin
(`wordpress/mu-plugins/fgs-site-content.php`, mounted read-only into the WordPress container
by `compose.yaml`). Images are referenced by WordPress media ID (`{ mediaId, alt }`); the
adapter resolves the media's current URL at read time, exactly like the SPEC-003 article
cover image, so a later media change or deletion degrades gracefully instead of breaking.

**Why this and not something simpler**: a genuinely simpler alternative — reusing WordPress's
built-in `excerpt`/`content` fields instead of a custom meta field — was considered and
rejected: it would either force each section's structured data through Gutenberg block HTML
(fighting the "fixed fields, not layout" requirement) or abuse `excerpt` for unrelated JSON,
which is confusing in wp-admin and has no schema. A dedicated custom REST field with an
explicit registered schema and `auth_callback` is the standard WordPress mechanism for
exactly this ("headless custom field," per the official `register_post_meta` reference) and
keeps WordPress as the sole store without inventing a second one.

References consulted 2026-09-20:

- [`register_post_meta()`](https://developer.wordpress.org/reference/functions/register_post_meta/)
- [Must-Use Plugins](https://developer.wordpress.org/plugins/plugin-basics/must-use-plugins/)

**Production note**: the must-use plugin is a local file mounted into the container in this
repository's Compose setup. Whatever hosts WordPress in production (DEC-107, still
unverified) must also have `wordpress/mu-plugins/fgs-site-content.php` present at
`wp-content/mu-plugins/` — see [DOCKER.md](../DOCKER.md).

## Content model (single source of truth: one zod schema per section)

Defined in `src/lib/wordpress/sections/*.ts`, registered in `registry.ts`:

| Section     | Slug               | Schema file      | Key fields                                                                                                                                                                      |
| ----------- | ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero        | `site-hero`        | `hero.ts`        | heading, tagline, background image                                                                                                                                              |
| School Info | `site-school-info` | `school-info.ts` | school name, short name, logo, address, phone, email, office hours, footer tagline, footer programs list                                                                        |
| About       | `site-about`       | `about.ts`       | section label, heading, story paragraphs (auto-balanced into two columns), mission, vision, Montessori quote (text + author), classroom feature banner (heading + body + image) |
| Admission   | `site-admission`   | `admission.ts`   | section label, heading, intro, background image, programs (icon + name + level + description), requirement categories (badge + title + items), enrollment steps                 |
| Contact     | `site-contact`     | `contact.ts`     | section label, heading, intro, cards (icon + title + detail + sub)                                                                                                              |
| Clubs       | `site-clubs`       | `clubs.ts`       | section label, heading, intro, clubs (icon + name + category + description + meeting day)                                                                                       |
| Gallery     | `site-gallery`     | `gallery.ts`     | section label, heading, intro, photos (image + caption)                                                                                                                         |

Each schema exports its own `*_DEFAULTS` constant — the single value used by the seed script,
the fallback-on-outage/missing-section value, and (for Hero/School Info/Gallery, which hold
images) the basis for a `*_FALLBACK` value with a real bundled local image path substituted
for the placeholder `mediaId: 0`, since an unreachable WordPress can't resolve any media ID.

Icon fields (Admission programs, Contact cards, Clubs) use a curated enum
(`src/lib/wordpress/sections/icons.tsx`) — admins pick from a fixed icon set, never free text.

## Admin information architecture

Sidebar groups (off-canvas on mobile, via the shadcn `sidebar` primitive):

- **Overview**: Dashboard (`/admin`) — a card per section with its last-updated time and an
  Edit link, the 5 most recent articles, and quick actions (New Article, View site).
- **Website Sections**: Hero, About, Admission, Clubs, Gallery, Contact, School Info
  (`/admin/sections/<slug>`), in the same order as the public page.
- **Articles**: All Articles (`/admin/articles`, placeholder), New Article
  (`/admin/articles/new`, the existing SPEC-003 flow, moved here unchanged).

Every section editor page: fields grouped in public-page order with helper text, a sticky
save bar ("Save changes" disabled until dirty, "Discard"), a native `beforeunload` warning
while dirty, inline field errors from the same zod schema the server action validates with,
and success/error/uncertain toasts (`sonner`).

## Server actions and revalidation

Every section's `saveXAction` (e.g. `src/app/admin/(protected)/sections/hero/actions.ts`):

1. Calls `requireAdmin()` first.
2. Uploads a replacement image if one was selected (`uploadSectionImage`, magic-byte sniffed,
   10 MB limit — the same rule as SPEC-003 article images), otherwise keeps the existing
   media ID.
3. Validates the assembled input against the section's zod schema (via the shared
   `createSectionAdapter`/`heroContent`/`schoolInfoContent`/`galleryContent` `save()`), which
   is also what the admin form's field errors are keyed from.
4. On success, calls `revalidatePath("/")` (and, for School Info, also the article route
   pattern, since it appears in every article's footer/navbar). A failure here is reported as
   `cacheWarning: true` ("Published, but the site may take a few minutes to update"), the same
   distinct-from-failure handling as SPEC-003 article publishing — never silently repeats the
   WordPress write.
5. A save-request timeout returns `status: "uncertain"`, telling the admin to check before
   retrying, never auto-retried.

## Interim revalidation

No DEC-105 webhook producer exists yet. Public section reads use the same 60-second `fetch`
`revalidate` stopgap as SPEC-003 article reads, so a native WordPress edit (bypassing
`/admin`) is picked up within that window; an `/admin`-originated save additionally gets the
immediate `revalidatePath` above.

## Verification and evidence

| Criterion                                                                                                                                           | Verification Type       | Procedure                                                                                                                                                                                                                                                                                                                    | Result              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Every section schema: valid input, invalid input, field limits                                                                                      | Unit test               | `tests/unit/sections-schemas.test.ts`                                                                                                                                                                                                                                                                                        | Passed              |
| Seed idempotency rule (never overwrite existing/edited content)                                                                                     | Unit test               | `tests/unit/sections-seed-logic.test.ts`                                                                                                                                                                                                                                                                                     | Passed              |
| Reorder logic for repeatable lists                                                                                                                  | Unit test               | `tests/unit/sections-reorder.test.ts`                                                                                                                                                                                                                                                                                        | Passed              |
| Generic section adapter: fallback to defaults, validation                                                                                           | Unit test               | `tests/unit/sections-adapter.test.ts`                                                                                                                                                                                                                                                                                        | Passed              |
| Hero/School Info read+image resolution, save, uncertain/error results                                                                               | Integration test        | `tests/integration/sections-content.test.ts` (mocked WordPress REST API)                                                                                                                                                                                                                                                     | Passed              |
| Hero save action: permission gate, image upload, cache-warning result                                                                               | Integration test        | `tests/integration/section-actions.test.ts`                                                                                                                                                                                                                                                                                  | Passed              |
| Unauthenticated admin routes redirect to login                                                                                                      | E2E test                | `tests/e2e/admin-login.spec.ts`                                                                                                                                                                                                                                                                                              | Passed              |
| Sidebar navigation at desktop and mobile widths                                                                                                     | E2E test                | `tests/e2e/admin-sidebar.spec.ts` (skips if the build's dev login is disabled, e.g. against a production build with no admin credentials configured for that environment)                                                                                                                                                    | Passed              |
| Seed script is idempotent against real local WordPress                                                                                              | Manual                  | Ran `pnpm wp:seed-content` twice; second run created no duplicate pages/media and left content unchanged                                                                                                                                                                                                                     | Passed (2026-09-20) |
| Editing Hero (text + image) and School Info (text) updates the public page                                                                          | Manual                  | Edited via `/admin`, confirmed the change live on `/` immediately after save, then restored seeded defaults                                                                                                                                                                                                                  | Passed (2026-09-20) |
| About/Admission/Contact/Clubs/Gallery: section schemas, content adapters, server actions                                                            | Unit + integration test | `tests/unit/sections-schemas.test.ts`, `tests/integration/sections-content.test.ts`, `tests/integration/section-actions.test.ts`                                                                                                                                                                                             | Passed              |
| About (text + banner image), Admission (text + background image), Contact (text), Clubs (text), Gallery (add/remove a photo) update the public page | Manual                  | Edited each via `/admin`, confirmed the change live on `/` immediately after save, then restored seeded defaults (image replacements re-uploaded the same seeded source file and the original WordPress media id was restored via a direct API patch, since the admin image picker cannot address a specific prior media id) | Passed (2026-09-21) |
| Articles list/edit/trash                                                                                                                            | —                       | Not built yet — placeholder page only; New Article flow unchanged                                                                                                                                                                                                                                                            | Pending             |
