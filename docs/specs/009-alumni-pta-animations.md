# SPEC-009: Alumni, PTA and motion

| Field                 | Value                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Feature ID            | SPEC-009                                                                                                     |
| Approval status       | Proposed (plan approved by the owner on 2026-10-05; client confirmation and design dependencies are pending) |
| Implementation status | Unimplemented                                                                                                |
| Responsible owner     | Engineering team (design dependencies: Aya, frontend designer)                                               |
| Requirement IDs       | FR-016 to FR-020 (proposed; to be added to [FRS_NFRS](../FRS_NFRS.md) with the implementation change)        |
| Decision IDs          | DEC-121 (proposed; amends DEC-115 and the one-page scope note under FR-003/004); DEC-010 and DEC-112 apply   |
| Acceptance evidence   | Pending; later record approver, date and evidence link                                                       |

## Owner/client instructions

Recorded October 5, 2026 from the school client's meeting with the team. They are owner-level instructions and take precedence over the retained one-page scope; the design that fulfils them is proposed until the open questions below are answered.

| #   | Instruction                                                                     | Scope recorded here                                                                       |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Add an Alumni tab to the public website and to the admin.                       | Public `/alumni` route and navbar tab; admin "Alumni" navigation group.                   |
| 2   | PTA activities and alumni activities must be separate from each other.          | Distinct article categories, admin lists, public pages and homepage-feed behavior.        |
| 3   | The Alumni tab focuses on alumni achievements.                                  | Editable alumni-achievements section is the primary content of `/alumni`.                 |
| 4   | The site shows PTA activities/events; PTA has its own tab in the public navbar. | Public `/pta` route and navbar tab listing published PTA articles.                        |
| 5   | The client wants animations on the website.                                     | Reusable scroll-reveal and hover motion on public pages only, within accessibility rules. |

Not in scope: PTA/alumni membership data, alumni accounts or submissions, donations, events calendars, public search, new roles, inquiry delivery (SPEC-005), changing existing article URLs.

## Outcome and scope

Staff can publish PTA activities and alumni activities as articles, and maintain an ordered list of alumni achievements. Visitors reach `/alumni` and `/pta` from the navbar and see only content of that area. The homepage News & Events feed keeps showing school news.

## Data model and migration

- Add `003_alumni_pta.sql` (never edit 001/002). It must be idempotent, contain no literal semicolons inside statements (the runner in `scripts/migrate.ts` splits on `;`), and:
  1. `ALTER TABLE articles MODIFY category ENUM('announcements','events','clubs','pta','alumni') NOT NULL` — new values are appended last so existing stored values keep their meaning.
  2. `INSERT IGNORE INTO sections (slug, data) VALUES ('site-alumni', '<defaults JSON>')`. Without a row the editor cannot save, because `saveSectionRaw` only `UPDATE`s and `getSectionRevision` returns 0. A unit test must assert the SQL JSON equals `ALUMNI_DEFAULTS` to prevent drift.
- `ARTICLE_CATEGORIES` becomes `announcements, events, clubs, pta, alumni`; labels add `pta: "PTA"` and `alumni: "Alumni"`. `validation.ts` already derives its enum from the constant. The duplicate literal union in `new-article-form.tsx` is replaced by `ArticleCategorySlug`.
- `SECTION_SLUGS` and `SECTION_REGISTRY` gain `site-alumni` (`publicAnchor: "/alumni"`).
- Rollback: application rollback is safe with the wider ENUM, but the previous release would show `pta`/`alumni` articles in the homepage feed with a blank category pill. Schema rollback remains manual, per [CI/CD](../CI_CD.md).

### `site-alumni` schema (proposed bounds)

| Field              | Rule                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `sectionLabel`     | trimmed string, 1–60                                                                                   |
| `heading`          | trimmed string, 3–150                                                                                  |
| `intro`            | trimmed string, 0–400                                                                                  |
| `achievements`     | ordered array, **0**–24 items (clubs requires ≥1; this section must allow an empty list)               |
| item `name`        | trimmed, 1–100                                                                                         |
| item `batch`       | trimmed, 1–40 (free text, e.g. "Batch 2015" or "Class of 2015"; no year validation)                    |
| item `title`       | trimmed, 1–120                                                                                         |
| item `description` | trimmed, 0–400                                                                                         |
| item `image`       | optional `{ mediaId, alt }` via `imageRefSchema`; alt ≤ 200 and required when an image is set (see Q4) |

Defaults contain no people: `sectionLabel: "Alumni"`, `heading: "Alumni Achievements"`, `intro: "Celebrating the accomplishments of Flor de Grace School alumni."`, `achievements: []`. A missing or invalid stored row falls back to these defaults. A missing media reference renders the card without a photo; no placeholder person or image is invented.

## Behavior and acceptance criteria

| ID    | Criterion                                                                                                                                                                                                                              | Requirement | Planned test                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------- |
| AC-01 | Given categories `pta` and `alumni`, validation accepts them and still rejects unknown values; labels exist for all five.                                                                                                              | FR-016      | T-024 unit                          |
| AC-02 | Given `site-alumni` content, the schema accepts an empty list and rejects over-long fields, more than 24 items, and an image without alt text; defaults satisfy the schema.                                                            | FR-017      | T-025 unit                          |
| AC-03 | Given published articles in all five categories, the homepage feed returns only `announcements`, `events` and `clubs`; `/alumni` lists only `alumni`; `/pta` lists only `pta`; draft and trash never appear.                           | FR-018      | T-026 integration                   |
| AC-04 | Given no achievements, `/alumni` shows a truthful empty state for achievements; given no articles, `/alumni` and `/pta` each show a truthful empty state; given a database outage, each shows an unavailable state (not an empty one). | FR-018      | T-027 e2e                           |
| AC-05 | Given an article in any category, its URL is `/news/[slug]` and existing URLs are unchanged. Back/“more” links on the article page point to the area that matches its category.                                                        | FR-016      | T-026/T-027                         |
| AC-06 | `/alumni` and `/pta` are in the sitemap, have their own canonical and title, and are not shadowed by `[...legacy]` (static segments win; no `legacy_urls` row may use these paths).                                                    | FR-015/018  | T-028                               |
| AC-07 | Admin "Alumni Achievements" saves with revision checks, media picker, save bar and unsaved-changes warning; a stale revision shows the reload conflict; add/remove/reorder work.                                                       | FR-017      | T-025 unit; T-029 authenticated e2e |
| AC-08 | Admin sidebar shows Alumni (Achievements, Activities) and PTA (Activities); exactly one item is active; the topbar title is correct; "Add New" from a filtered list preselects its category.                                           | FR-016      | T-029                               |
| AC-09 | Navbar shows "Alumni" and "PTA" on desktop and mobile; route links work; anchor links from `/alumni`, `/pta` and `/news/[slug]` reach the homepage section; active state reflects the current route; Escape closes the mobile menu.    | FR-019      | T-030 e2e                           |
| AC-10 | At 768, 1024, 1280 and 1440 px the navbar has no overlap or bad wrapping (including after the school name appears).                                                                                                                    | FR-019      | T-030 e2e                           |
| AC-11 | With `prefers-reduced-motion: reduce`, reveal content is fully visible with no transition. With JavaScript disabled, all content is visible. Reveal causes no layout shift.                                                            | FR-020      | T-031 e2e                           |

## Admin behavior

- Sidebar groups: **Alumni** → "Alumni Achievements" (`/admin/sections/alumni`), "Alumni Activities"; **PTA** → "PTA Activities". The existing **News & Events** group keeps "All News" and "Add New".
- The existing article list reads the filter from `?category=` and `getAdminPageTitle`/`isActive` look only at the pathname, so query-string links would highlight "All News" and both new items together and share one title. **Proposal:** give each area its own thin route that renders the shared list with a locked category — `/admin/alumni/activities` and `/admin/pta/activities` — and keep `?category=` on `/admin/articles` for the optional filter select. `/admin/articles/new?category=alumni|pta` preselects the category (validated against `ARTICLE_CATEGORIES`, default unchanged). `getAdminPageTitle` then needs only new exact entries plus a title for edit pages by category.
- The category picker grid is `sm:grid-cols-3`; five options need `sm:grid-cols-2 lg:grid-cols-3` or similar. Icon/colors for PTA and Alumni are a design dependency.
- The admin dashboard section cards list the seven editors; add an Alumni card.
- Admin forms get no animation.

## Public behavior

- `/alumni`: shared page chrome (navbar, footer), header in the existing section-header pattern, achievements grid (photo, name, batch, achievement title/description), then an "Alumni Activities" list of published `alumni` articles using the homepage news card. Each article links to `/news/[slug]`.
- `/pta`: page header and a grid of published `pta` articles using the same card; truthful empty state ("No PTA activities have been published yet.").
- Both pages are dynamic (`export const dynamic = "force-dynamic"`, as every other page), set explicit `metadata` with their own title, description and `alternates.canonical`. The root layout canonical is `/`, and child metadata inherits it unless overridden, so omitting the override would canonicalize both pages to the homepage.
- The `/pta` header (static, neutral text) and the `/alumni` article list heading are fixed in code. The `/alumni` page heading and intro come from `site-alumni`. **Deferred option (Q3):** admin-editable PTA header text, for example a `site-pta` section.
- The homepage feed excludes `pta` and `alumni` through an explicit option on the read (`getPublishedArticles({ excludeCategories })`), with parameterized SQL. The default of `getPublishedArticles()` is unchanged (Q1). The sitemap, admin dashboard and article-detail “more” list use deliberate choices instead of inheriting the default: the sitemap includes every published article; the “more” list is restricted to the same area as the current article.
- The shared card is currently inline in `news-section.tsx` and the “more” list in `news/[slug]/page.tsx`. Extract one presentational card used by the homepage, `/alumni` and `/pta` instead of copying markup.

### Navbar

The current navbar assumes every item is a homepage anchor: it calls `preventDefault()` and `getElementById`, so on `/news/[slug]` its links silently do nothing, and the footer's `#about`-style links have the same defect. Proposed changes:

- Items become `{ label, href, kind: "anchor" | "route" }`. Route items use `next/link`. Anchor items use `/#id`; on `/` keep the in-page smooth scroll, elsewhere use normal navigation so Next scrolls to the hash (the global `scroll-padding-top: 5rem` already offsets the fixed header).
- Active state: on `/alumni` and `/pta` use `usePathname()`; on `/` keep the IntersectionObserver for anchors. The observer must not run, and `activeSection` must not drive the school-name reveal, off the homepage.
- Fit: nine items do not fit the current `md` (768 px) breakpoint even before the school name appears (`max-w-[260px]`). Decision (Q2): show the inline list from `xl` (1280 px), use the hamburger below it, and tighten item padding at `xl`; measure at 768/1024/1280/1440 with no overlap or awkward wrapping. Alternative: shorten labels (needs the designer). `max-h-[28rem]` on the mobile menu must grow for nine items.
- Order (owner decision 2026-10-05, Q2): Home, About Us, Admission, News & Events, PTA, Alumni, Clubs, Gallery, Contact Us.
- Footer quick links change to `/#…` so they work from every route.

## Animation and accessibility rules

- One client component, `Reveal` (`src/components/public/reveal.tsx`), using `IntersectionObserver` and CSS `transition` on `opacity` and `transform` only; optional `delay` index for staggering grid items. `tw-animate-css` is already installed; no animation library is added.
- Server HTML is always fully visible. The hidden pre-state is applied only after mount in the browser and only to elements that are below the viewport at that moment, so there is no flash, no hidden content without JavaScript, and nothing hidden from crawlers or assistive technology (never `display:none`/`visibility:hidden`, never `aria-hidden`).
- `prefers-reduced-motion: reduce` (checked at mount and on change): render visible, no transition. Observers disconnect after the first reveal.
- No layout shift: transform/opacity only, fixed offsets, no height changes. The wrapper goes around the card, not on the same element as hover transforms (`hover:-translate-y-*` would conflict).
- Applied to: new page headers and card grids, homepage section headers (About, Admission, News, Clubs, Gallery, Contact) and card grids. Hero is excluded (above the fold, LCP). Hover effects reuse the existing card hover pattern (`hover:-translate-y-0.5`/`-1`, image `group-hover:scale-105`, shadow).
- Do not combine with `backdrop-blur` on animated ancestors; DESIGN §3.5 forbids nested blur on Admission for mobile compositing.
- Motion durations and distances (proposed starting point: 500 ms, 16 px) need designer confirmation (Aya).

## Dependencies and decisions

| ID / item        | Status   | Note                                                                                                                                                                                                                                                                    |
| ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-121          | Proposed | Extends the product from one public page and seven fixed editors to include `/alumni`, `/pta` and an eighth fixed editor. Amends DEC-115 and FR-002/003/004 wording. Owner instruction recorded above is the basis; mark Accepted when the open questions are answered. |
| DEC-010          | Accepted | Visual system preserved; no new branding.                                                                                                                                                                                                                               |
| DEC-112          | Proposed | Formal accessibility target still pending; the rules above are engineering requirements, not an audit.                                                                                                                                                                  |
| Open design deps | Open     | See Q5–Q8 for Aya.                                                                                                                                                                                                                                                      |

## Owner decisions and open questions

Answers recorded from the owner on 2026-10-05. The decision column is the implementation basis; "Pending" items still need the named confirmation.

| #   | Question                                                                                                                                    | Decision (2026-10-05)                                                                                                                                                                                                                               | Status                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Q1  | Confirm the homepage News & Events feed excludes PTA and Alumni articles (and whether any should be allowed to appear there).               | Exclude `pta` and `alumni` from the homepage feed through an explicit option on `getPublishedArticles`, not a changed default. The sitemap keeps all published articles; the article page "more" list stays within the article's own area.          | Pending client confirmation        |
| Q2  | Navbar order and labels for "Alumni" and "PTA"; acceptable to move the inline list to `xl` and use the hamburger below?                     | Order: Home, About Us, Admission, News & Events, PTA, Alumni, Clubs, Gallery, Contact Us. Inline list at `xl`, hamburger below; mobile menu max height grows as needed. Measure at 768, 1024, 1280 and 1440 px with no overlap or awkward wrapping. | Design dependency for Aya          |
| Q3  | Should `/alumni` and `/pta` header text be admin-editable?                                                                                  | Not now. The alumni heading and intro come from the `site-alumni` section. The `/pta` header stays static with neutral text. Admin-editable PTA header text (for example a `site-pta` section) is a deferred option.                                | Decided; PTA editing deferred      |
| Q4  | Is an alumni photo required per achievement, or optional?                                                                                   | Optional per achievement; alt text is required when a photo is set.                                                                                                                                                                                 | Decided                            |
| Q5  | Design dependency: category pill colors/icons for PTA and Alumni; DESIGN.md currently lists Announcements green, Events blue, Clubs purple. | Interim: existing DESIGN.md patterns (neutral green pill); no new colors.                                                                                                                                                                           | Open design dependency (Aya)       |
| Q6  | Design dependency: alumni achievement card (portrait/aspect ratio, batch badge, empty state illustration or none).                          | Interim: reuse the homepage card with a 4:3 image; no new colors.                                                                                                                                                                                   | Open design dependency (Aya)       |
| Q7  | Design dependency: motion durations, distances and stagger spacing; which sections should not animate.                                      | Interim: 500 ms, 16 px, 80 ms stagger.                                                                                                                                                                                                              | Open design dependency (Aya)       |
| Q8  | Design dependency: `/alumni`, `/pta` page header treatment (hero strip vs. section header on white).                                        | Interim: section header pattern on white.                                                                                                                                                                                                           | Open design dependency (Aya)       |
| Q9  | Should the admin "All News" label/group be renamed, since it now holds PTA and Alumni articles too?                                         | Unanswered; default stands: unchanged, area groups give filtered views.                                                                                                                                                                             | Open (client)                      |
| Q10 | Do any WordPress-era `legacy_urls` rows use `/alumni` or `/pta`? (Not checkable from the repository.)                                       | Unanswered; check staging/production before release.                                                                                                                                                                                                | Open (engineering, before release) |

### Plan approval (owner, 2026-10-05)

Approved as written, including these corrections:

- Dedicated `/admin/alumni/activities` and `/admin/pta/activities` routes.
- The `site-alumni` row is created by the migration with `INSERT IGNORE` (no semicolons inside statements).
- An importer skip flag for `site-alumni` (no WordPress origin).
- Explicit canonicals for `/alumni` and `/pta`.
- `Reveal` hides elements only after mount and only when below the viewport.
- DEC-121 is proposed to amend DEC-115.
- The navbar/footer link defect on `/news/[slug]` is a pre-existing bug. It is fixed in phase 4 in its own `fix` commit, separate from the feature commits.

Working rules: one phase at a time; each phase runs `pnpm lint`, `pnpm typecheck` and `pnpm test`, then stops for owner review before the next phase. Migrations run against the local Docker database only.

## Implementation approach

Phased as proposed in the planning message; each phase leaves `pnpm verify` green. Other repository-affecting points:

- `scripts/import-content.ts` iterates `SECTION_REGISTRY` and records any slug without a WordPress snapshot page as a broken reference. The new slug has no WordPress origin, so add an importable/legacy marker to the registry (or skip it explicitly) so offline imports and `tests/database/migration.test.ts` do not report a failure.
- Update [DATA_API_CONTRACTS](../DATA_API_CONTRACTS.md) (eight slugs, five categories, new routes), [FRONTEND](../FRONTEND.md), [FRS_NFRS](../FRS_NFRS.md) (FR-016 to FR-020 and the one-page note), [DECISIONS](../DECISIONS.md) (DEC-121), [TESTING](../TESTING.md) (coverage map) and the spec index. Historical "seven editors" statements in SPEC-007/008 evidence stay as history.
- No new dependency, environment variable, secret or privileged boundary. All reads use existing server-only services; admin actions call `requireAdmin()` first.

## Verification and evidence

| Requirement / criterion | Test ID and type        | Test path or manual procedure                                                                                       | Result and evidence |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| AC-01 / FR-016          | T-024 unit              | Planned: extend `tests/unit/content-validation.test.ts`                                                             | Not run             |
| AC-02 / FR-017          | T-025 unit              | Planned: extend `tests/unit/sections-schemas.test.ts`, `sections-reorder.test.ts`                                   | Not run             |
| AC-03, AC-05 / FR-018   | T-026 integration       | Planned: extend `tests/integration/content-queries.test.ts`; DB check in `tests/database/content.test.ts`           | Not run             |
| AC-04 / FR-018          | T-027 e2e               | Planned: `tests/e2e/alumni-pta.spec.ts` (no-database build, unavailable state; empty state needs a content fixture) | Not run             |
| AC-06 / FR-015          | T-028 unit/e2e          | Planned: sitemap unit test; canonical assertions in the e2e spec                                                    | Not run             |
| AC-07, AC-08            | T-029 authenticated e2e | Planned: extend `admin-sidebar.spec.ts`; skips without `E2E_ADMIN_STORAGE_STATE`                                    | Not run             |
| AC-09, AC-10 / FR-019   | T-030 e2e               | Planned: `tests/e2e/navbar.spec.ts`, desktop and 375 px mobile, four desktop widths                                 | Not run             |
| AC-11 / FR-020          | T-031 e2e               | Planned: reduced-motion emulation and JavaScript-disabled context                                                   | Not run             |

Default Playwright runs assume unavailable content storage, so `/alumni` and `/pta` smoke tests there assert the unavailable state; empty-state coverage needs a seeded isolated database and is recorded as skipped when the fixture is absent. Record actual commands and results here when work is performed.

## Completion record

Pending. Record implementation/PR references, remaining accepted limitations and the verification date. Advance status only as defined in [SPEC_WORKFLOW](../SPEC_WORKFLOW.md).
