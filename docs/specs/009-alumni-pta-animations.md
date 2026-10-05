# SPEC-009: Alumni, PTA and motion

| Field                 | Value                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Feature ID            | SPEC-009                                                                                                        |
| Approval status       | Proposed (plan approved by the owner on 2026-10-05; client confirmation and design dependencies are pending)    |
| Implementation status | Implemented (local verification passed; pending owner browser acceptance and the client/designer confirmations) |
| Responsible owner     | Engineering team (design dependencies: Aya, frontend designer)                                                  |
| Requirement IDs       | FR-016 to FR-020 (added to [FRS_NFRS](../FRS_NFRS.md), status Proposed with DEC-121)                            |
| Decision IDs          | DEC-121 (proposed; amends DEC-115 and the one-page scope note under FR-003/004); DEC-010 and DEC-112 apply      |
| Acceptance evidence   | Local verification recorded below (2026-10-05); owner browser acceptance and hosted acceptance pending          |

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

| ID    | Criterion                                                                                                                                                                                                                                                                                                                                                                            | Requirement | Planned test                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------- |
| AC-01 | Given categories `pta` and `alumni`, validation accepts them and still rejects unknown values; labels exist for all five.                                                                                                                                                                                                                                                            | FR-016      | T-024 unit                          |
| AC-02 | Given `site-alumni` content, the schema accepts an empty list and rejects over-long fields, more than 24 items, and an image without alt text; defaults satisfy the schema.                                                                                                                                                                                                          | FR-017      | T-025 unit                          |
| AC-03 | Given published articles in all five categories, the homepage feed returns only `announcements`, `events` and `clubs`; `/alumni` lists only `alumni`; `/pta` lists only `pta`; draft and trash never appear.                                                                                                                                                                         | FR-018      | T-026 integration                   |
| AC-04 | Given no achievements, `/alumni` shows a truthful empty state for achievements; given no articles, `/alumni` and `/pta` each show a truthful empty state; given a database outage, each shows an unavailable state (not an empty one).                                                                                                                                               | FR-018      | T-027 e2e                           |
| AC-05 | Given an article in any category, its URL is `/news/[slug]` and existing URLs are unchanged. Back/“more” links on the article page point to the area that matches its category.                                                                                                                                                                                                      | FR-016      | T-026/T-027                         |
| AC-06 | `/alumni` and `/pta` are in the sitemap, have their own canonical and title, and are not shadowed by `[...legacy]` (static segments win; no `legacy_urls` row may use these paths).                                                                                                                                                                                                  | FR-015/018  | T-028                               |
| AC-07 | Admin "Alumni Achievements" saves with revision checks, media picker, save bar and unsaved-changes warning; a stale revision shows the reload conflict; add/remove/reorder work.                                                                                                                                                                                                     | FR-017      | T-025 unit; T-029 authenticated e2e |
| AC-08 | Admin sidebar groups are Overview, Website Sections (with Alumni Achievements) and Posts (All Posts, Add New); exactly one item is active on every admin page, including filtered All Posts and edit pages; the topbar title is correct; All Posts filters by category (`?category=`) and "Add New" from a filtered view preselects that category; the old activity routes redirect. | FR-016      | T-029                               |
| AC-09 | Navbar shows "Alumni" and "PTA" on desktop and mobile; route links work; anchor links from `/alumni`, `/pta` and `/news/[slug]` reach the homepage section; active state reflects the current route; Escape closes the mobile menu.                                                                                                                                                  | FR-019      | T-030 e2e                           |
| AC-10 | At 768, 1024, 1280 and 1440 px the navbar has no overlap or bad wrapping (including after the school name appears).                                                                                                                                                                                                                                                                  | FR-019      | T-030 e2e                           |
| AC-11 | With `prefers-reduced-motion: reduce`, reveal content is fully visible with no transition. With JavaScript disabled, all content is visible. Reveal causes no layout shift.                                                                                                                                                                                                          | FR-020      | T-031 e2e                           |

## Admin behavior

- **Sidebar (owner decision, 2026-10-05, replacing the earlier Alumni and PTA groups):** **Overview** → Dashboard; **Website Sections** → Hero, About, Admission, Clubs, Gallery, Contact, School Info and Alumni Achievements (`/admin/sections/alumni`); **Posts** → All Posts (`/admin/articles`) and Add New. The group was renamed from "News & Events" and "All News" became "All Posts" in the admin only; the public "News & Events" naming is unchanged. Separate Alumni and PTA groups were rejected because they duplicated the category picker in Add New and confused non-technical admins.
- All Posts shows a visible category filter (All, Announcements, Events, Clubs, PTA, Alumni) as links in a labelled navigation, with the selected one marked `aria-current="page"`. The choice lives in the URL (`?category=`, with `q` and `page`), each filter has its own empty message, and "Add New" from a filtered view links to `/admin/articles/new?category=<slug>`, which preselects only an allowlisted category. The sidebar and topbar title depend on the path only, so a filtered All Posts is still All Posts and every edit page (`/admin/articles/<id>/edit`) stays under All Posts. `/admin/alumni/activities` and `/admin/pta/activities` redirect (307) to `/admin/articles?category=alumni` and `?category=pta`, configured in `next.config.ts`; their page code and the shared locked-list wrapper are deleted. The new-article page keeps its default heading, because an area heading would go stale when the picker is changed.
- The category picker grid is `sm:grid-cols-3`; five options need `sm:grid-cols-2 lg:grid-cols-3` or similar. Icon/colors for PTA and Alumni are a design dependency.
- The admin dashboard section cards list the seven editors; add an Alumni card.
- Admin forms get no animation.
- **Fix recorded (2026-10-05):** after a successful save every admin section editor that uploads images (Hero, About, Admission, Gallery, Alumni and School Info) holds the stored media reference instead of the original file (`SectionSaveOk.uploadedMedia`), so a second save never uploads the same file again. Covered by `tests/integration/section-uploads.test.ts` and `tests/unit/saved-uploads.test.ts`.

## Public behavior

- `/alumni`: shared page chrome (navbar, footer), header in the existing section-header pattern, achievements grid (photo, name, batch, achievement title/description), then an "Alumni Activities" list of published `alumni` articles using the homepage news card. Each article links to `/news/[slug]`.
- `/pta`: page header and a grid of published `pta` articles using the same card; truthful empty state ("No PTA activities have been published yet.").
- Both pages are dynamic (`export const dynamic = "force-dynamic"`, as every other page), set explicit `metadata` with their own title, description and `alternates.canonical`. The root layout canonical is `/`, and child metadata inherits it unless overridden, so omitting the override would canonicalize both pages to the homepage.
- The `/pta` header (static, neutral text) and the `/alumni` article list heading are fixed in code. The `/alumni` page heading and intro come from `site-alumni`. **Deferred option (Q3):** admin-editable PTA header text, for example a `site-pta` section.
- The homepage feed excludes `pta` and `alumni` through an explicit option on the read (`getPublishedArticles({ excludeCategories })`), with parameterized SQL. The default of `getPublishedArticles()` is unchanged (Q1). The sitemap, admin dashboard and article-detail “more” list use deliberate choices instead of inheriting the default: the sitemap includes every published article; the “more” list is restricted to the same area as the current article.
- Implemented in phase 3: `alumniContent.getResult()` separates a database outage ("unavailable") from a missing or invalid row (defaults), so `/alumni` never presents an outage as an empty list. Both pages render the "unavailable" notice when their reads fail.
- The shared card is currently inline in `news-section.tsx` and the “more” list in `news/[slug]/page.tsx`. Extract one presentational card used by the homepage, `/alumni` and `/pta` instead of copying markup.

### Navbar

The current navbar assumes every item is a homepage anchor: it calls `preventDefault()` and `getElementById`, so on `/news/[slug]` its links silently do nothing, and the footer's `#about`-style links have the same defect. Proposed changes:

- Items become `{ label, href, kind: "anchor" | "route" }`. Route items use `next/link`. Anchor items use `/#id`; on `/` keep the in-page smooth scroll, elsewhere use normal navigation so Next scrolls to the hash (the global `scroll-padding-top: 5rem` already offsets the fixed header).
- Active state: on `/alumni` and `/pta` use `usePathname()`; on `/` keep the IntersectionObserver for anchors. The observer must not run, and `activeSection` must not drive the school-name reveal, off the homepage.
- Fit: nine items do not fit the current `md` (768 px) breakpoint even before the school name appears (`max-w-[260px]`). Decision (Q2): show the inline list from `xl` (1280 px), use the hamburger below it, and tighten item padding at `xl`; measure at 768/1024/1280/1440 with no overlap or awkward wrapping. Alternative: shorten labels (needs the designer). `max-h-[28rem]` on the mobile menu must grow for nine items.
- Order (owner decision 2026-10-05, Q2): Home, About Us, Admission, News & Events, PTA, Alumni, Clubs, Gallery, Contact Us.
- Footer quick links change to `/#…` so they work from every route. Implemented in a separate fix commit. The footer lists only a subset of sections (About, Admission, News & Events, Clubs), not the full navigation, so PTA and Alumni are not added to it.
- Implemented (phase 4): items are `{ label, href, kind }` in `src/components/public/nav-links.ts`. The inline list shows from `xl` and the mobile menu grows to `calc(100svh - 4rem)`, scrolling on very short screens. Active state: the homepage keeps the scroll-based section highlight (`aria-current="location"`), `/pta` and `/alumni` mark their tab (`aria-current="page"`), and an article page marks nothing because no tab links to it. Off the homepage the school name is always shown. Measured at 375, 768, 1024, 1279, 1280 and 1440 px: no overlap or wrapping, with about 270 px spare between the school name and the links at 1280 px, so item padding was not tightened.

## Animation and accessibility rules

- One client component, `Reveal` (`src/components/public/reveal.tsx`), using `IntersectionObserver` and CSS `transition` on `opacity` and `transform` only; optional `delay` index for staggering grid items. `tw-animate-css` is already installed; no animation library is added.
- Server HTML is always fully visible. The hidden pre-state is applied only after mount in the browser and only to elements that are below the viewport at that moment, so there is no flash, no hidden content without JavaScript, and nothing hidden from crawlers or assistive technology (never `display:none`/`visibility:hidden`, never `aria-hidden`).
- `prefers-reduced-motion: reduce` (checked at mount and on change): render visible, no transition. Observers disconnect after the first reveal.
- No layout shift: transform/opacity only, fixed offsets, no height changes. The wrapper goes around the card, not on the same element as hover transforms (`hover:-translate-y-*` would conflict).
- Applied to: new page headers and card grids, homepage section headers (About, Admission, News, Clubs, Gallery, Contact) and card grids. Hero is excluded (above the fold, LCP). Hover effects reuse the existing card hover pattern (`hover:-translate-y-0.5`/`-1`, image `group-hover:scale-105`, shadow).
- Do not combine with `backdrop-blur` on animated ancestors; DESIGN §3.5 forbids nested blur on Admission for mobile compositing.
- Implemented (phase 5): `Reveal` (`src/components/public/reveal.tsx`) hides an element only after mount, only while it is wholly below the viewport, only when motion is allowed and `IntersectionObserver` exists. It uses inline opacity and transform (never `display`, `visibility` or `aria-hidden`) and removes its inline styles when the transition ends, so no transform or stacking context lingers. The timing lives in one place, the `--motion-*` variables in `globals.css`. The hero heading, divider and tagline use a CSS-only `.motion-enter` entrance. `Reveal` is applied to the About, Admission, News, Clubs, Gallery and Contact headers and card groups (the Clubs carousel and each Gallery set as a whole, never single slides), the `/alumni` achievements and activity cards, and the `/pta` cards. The About mission/vision and Contact cards carry `backdrop-blur` and sit inside a `Reveal` wrapper, which is acceptable because the wrapper has no opacity or transform once the entrance finishes. Admission cards have no blur, so DESIGN §3.5 is respected there.
- Motion durations and distances (proposed starting point: 500 ms, 16 px) need designer confirmation (Aya).

## Dependencies and decisions

| ID / item        | Status   | Note                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-121          | Proposed | Extends the product from one public page and seven fixed editors to include `/alumni`, `/pta` and an eighth fixed editor. Amends DEC-115 and FR-002/003/004 wording. Owner instruction recorded above is the basis. Implemented in code, still Proposed: mark Accepted when the owner confirms and the client/designer questions below are answered. Recorded in DECISIONS and FRS_NFRS. |
| DEC-010          | Accepted | Visual system preserved; no new branding.                                                                                                                                                                                                                                                                                                                                                |
| DEC-112          | Proposed | Formal accessibility target still pending; the rules above are engineering requirements, not an audit.                                                                                                                                                                                                                                                                                   |
| Open design deps | Open     | See Q5–Q8 for Aya.                                                                                                                                                                                                                                                                                                                                                                       |

## Owner decisions and open questions

Answers recorded from the owner on 2026-10-05. The decision column is the implementation basis; "Pending" items still need the named confirmation.

| #   | Question                                                                                                                                    | Decision (2026-10-05)                                                                                                                                                                                                                                    | Status                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Q1  | Confirm the homepage News & Events feed excludes PTA and Alumni articles (and whether any should be allowed to appear there).               | Exclude `pta` and `alumni` from the homepage feed through an explicit option on `getPublishedArticles`, not a changed default. The sitemap keeps all published articles; the article page "more" list stays within the article's own area.               | Pending client confirmation        |
| Q2  | Navbar order and labels for "Alumni" and "PTA"; acceptable to move the inline list to `xl` and use the hamburger below?                     | Order: Home, About Us, Admission, News & Events, PTA, Alumni, Clubs, Gallery, Contact Us. Inline list at `xl`, hamburger below; mobile menu max height grows as needed. Measure at 768, 1024, 1280 and 1440 px with no overlap or awkward wrapping.      | Design dependency for Aya          |
| Q3  | Should `/alumni` and `/pta` header text be admin-editable?                                                                                  | Not now. The alumni heading and intro come from the `site-alumni` section. The `/pta` header stays static with neutral text. Admin-editable PTA header text (for example a `site-pta` section) is a deferred option.                                     | Decided; PTA editing deferred      |
| Q4  | Is an alumni photo required per achievement, or optional?                                                                                   | Optional per achievement; alt text is required when a photo is set.                                                                                                                                                                                      | Decided                            |
| Q5  | Design dependency: category pill colors/icons for PTA and Alumni; DESIGN.md currently lists Announcements green, Events blue, Clubs purple. | Interim: existing DESIGN.md patterns (neutral green pill); no new colors.                                                                                                                                                                                | Open design dependency (Aya)       |
| Q6  | Design dependency: alumni achievement card (portrait/aspect ratio, batch badge, empty state illustration or none).                          | Interim: reuse the homepage card with a 4:3 image; no new colors.                                                                                                                                                                                        | Open design dependency (Aya)       |
| Q7  | Design dependency: motion durations, distances and stagger spacing; which sections should not animate.                                      | Interim, implemented: 500 ms, 16 px, 80 ms stagger (capped at 3 steps), ease-out `cubic-bezier(0.22, 1, 0.36, 1)`, held in `--motion-*` variables in `src/app/globals.css`. Sections left static: the hero image, the quote band and the feature banner. | Open design dependency (Aya)       |
| Q8  | Design dependency: `/alumni`, `/pta` page header treatment (hero strip vs. section header on white).                                        | Interim: section header pattern on white.                                                                                                                                                                                                                | Open design dependency (Aya)       |
| Q9  | Should the admin "All News" label/group be renamed, since it now holds PTA and Alumni articles too?                                         | Resolved by the owner (2026-10-05): the admin group is now "Posts" with "All Posts", filtered by category; the public naming is unchanged.                                                                                                               | Decided                            |
| Q10 | Do any WordPress-era `legacy_urls` rows use `/alumni` or `/pta`? (Not checkable from the repository.)                                       | Unanswered; check staging/production before release.                                                                                                                                                                                                     | Open (engineering, before release) |
| Q11 | Design dependency: the admin category picker colours Announcements blue, while DESIGN.md lists Announcements green. This predates SPEC-009. | Left untouched (owner, 2026-10-05). Aya to decide which is intended.                                                                                                                                                                                     | Open design dependency (Aya)       |

### Plan approval (owner, 2026-10-05)

Approved as written, including these corrections:

- Dedicated `/admin/alumni/activities` and `/admin/pta/activities` routes. **Superseded by the owner on 2026-10-05:** they are now redirects to the filtered All Posts list (see Admin behavior).
- The `site-alumni` row is created by the migration with `INSERT IGNORE` (no semicolons inside statements).
- An importer skip flag for `site-alumni` (no WordPress origin).
- Explicit canonicals for `/alumni` and `/pta`.
- `Reveal` hides elements only after mount and only when below the viewport.
- DEC-121 is proposed to amend DEC-115.
- The navbar/footer link defect on `/news/[slug]` is a pre-existing bug. It is fixed in phase 4 in its own `fix` commit, separate from the feature commits.

Working rules: one phase at a time; each phase runs `pnpm lint`, `pnpm typecheck` and `pnpm test`, then stops for owner review before the next phase. Migrations run against the local Docker database only.

## Implementation approach

Delivered in six phases, one at a time. After each phase the owner reviews in the browser before the next starts, and each phase runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm format:check` (phase 6 runs `pnpm verify`). Each phase is one focused Conventional Commit.

| Phase | Scope                                                                                                                                                                               | Status  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1     | Data layer: migration 003, categories, `site-alumni` schema/registry/importer skip, explicit read options.                                                                          | Done    |
| 2     | Admin: alumni editor, five-option category picker, category filter on All Posts (replacing separate activity routes), consolidated sidebar, dashboard card, single active nav item. | Done    |
| 3     | Public `/alumni` and `/pta` pages, shared news card, sitemap entries and canonicals.                                                                                                | Done    |
| 4     | Navbar (new order, `xl` breakpoint, route/anchor items) and footer links. The `/news/[slug]` link defect is fixed in its own `fix` commit, separate from the feature.               | Done    |
| 5     | Motion: `Reveal` component and hover polish on public pages.                                                                                                                        | Done    |
| 6     | Docs completion and final verification: contracts, FRS/NFRS, DEC-121, testing map, then a disposable `*_fgstest` database in local Docker for `pnpm test:database`.                 | Planned |

Other repository-affecting points:

- `scripts/import-content.ts` iterates `SECTION_REGISTRY` and records any slug without a WordPress snapshot page as a broken reference. The new slug has no WordPress origin, so add an importable/legacy marker to the registry (or skip it explicitly) so offline imports and `tests/database/migration.test.ts` do not report a failure.
- Update [DATA_API_CONTRACTS](../DATA_API_CONTRACTS.md) (eight slugs, five categories, new routes), [FRONTEND](../FRONTEND.md), [FRS_NFRS](../FRS_NFRS.md) (FR-016 to FR-020 and the one-page note), [DECISIONS](../DECISIONS.md) (DEC-121), [TESTING](../TESTING.md) (coverage map) and the spec index. Historical "seven editors" statements in SPEC-007/008 evidence stay as history.
- No new dependency, environment variable, secret or privileged boundary. All reads use existing server-only services; admin actions call `requireAdmin()` first.

## Verification and evidence

| Requirement / criterion | Test ID and type        | Test path or manual procedure                                                                                                                                       | Result (2026-10-05)                                                                             |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| AC-01 / FR-016          | T-024 unit              | `tests/unit/content-validation.test.ts` (five categories, labels, unknown rejected)                                                                                 | Passed                                                                                          |
| AC-02 / FR-017          | T-025 unit              | `tests/unit/alumni-section.test.ts` (schema bounds, empty list, alt rule, defaults, migration SQL equals defaults); `tests/unit/saved-uploads.test.ts`              | Passed                                                                                          |
| AC-03, AC-05 / FR-018   | T-026 integration       | `tests/integration/content-queries.test.ts` (read options, area links), `alumni-read.test.ts`; real database in `tests/database/content.test.ts`                    | Passed                                                                                          |
| AC-04 / FR-018          | T-027 e2e               | `tests/e2e/alumni-pta.spec.ts` against a build with no content database (unavailable state); empty state needs a seeded database                                    | Passed (unavailable state); empty state covered by `alumni-read.test.ts`, browser check pending |
| AC-06 / FR-015          | T-028 unit/e2e          | `tests/unit/sitemap.test.ts`; canonical and title assertions in `alumni-pta.spec.ts`                                                                                | Passed                                                                                          |
| AC-07, AC-08            | T-029 authenticated e2e | `tests/e2e/admin-sidebar.spec.ts`; unit `tests/unit/admin-nav.test.ts`, `tests/integration/section-uploads.test.ts`; owner checked the editor and sidebar signed in | Unit/integration passed; **authenticated e2e skipped** (no `E2E_ADMIN_STORAGE_STATE`)           |
| AC-09, AC-10 / FR-019   | T-030 e2e               | `tests/e2e/navbar.spec.ts` (four desktop widths, 375 px mobile, links, active state, menu); `tests/unit/nav-links.test.ts`                                          | Passed                                                                                          |
| AC-11 / FR-020          | T-031 e2e               | `tests/e2e/motion.spec.ts` (reduced motion, JavaScript disabled, below-fold only, no layout shift, deep link); `tests/unit/reveal.test.ts`                          | Passed                                                                                          |

Default Playwright runs assume unavailable content storage, so `/alumni` and `/pta` smoke tests there assert the unavailable state; empty-state coverage needs a seeded isolated database and is recorded as skipped when the fixture is absent.

### Commands and results

| Command                                                                                                                                                                                                | Result                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, production `pnpm build` (all through `pnpm verify`)                                                                                   | Passed; 22 test files, 210 tests                                              |
| Database suites against a disposable `fgs_content_fgstest` database in local Docker (`node --env-file=.env.database-test.local node_modules/vitest/vitest.mjs run --config vitest.database.config.ts`) | Passed; 24 files, 221 tests including the unit tests (11 in `tests/database`) |
| `DB_PORT=9 pnpm test:e2e` (project Playwright config, production build, no reachable content database)                                                                                                 | 43 passed, 5 skipped                                                          |

Skipped: the five authenticated checks (`admin-sidebar`, `media-picker`, `content-workflows`) need a private Google session fixture and an isolated content database that are not generated by default. A skipped check is not a pass. The owner checked the admin editors, lists and sidebar signed in on the local site. Staging/production databases and Hostinger were not used. Hosted acceptance is not part of this record.

## Completion record

**Implementation (branch `feature/alumni-pta`, local; not pushed or merged at the time of writing):** data layer (migration 003, categories, `site-alumni`, read options), admin (alumni editor, five-option picker, activity routes, sidebar, dashboard card), public `/alumni` and `/pta`, navbar and footer links, scroll motion, article back links. Separate fixes: the duplicate-upload fix for every image editor and the `/news/[slug]` link defect. Pull request reference: pending.

**Verification:** local, 2026-10-05, as recorded above. Owner browser checks of the admin and public pages passed for phases 1 to 3; phases 3 to 5 are re-checked together in one browser pass before acceptance.

**Remaining before acceptance (approval stays Proposed):**

- Client: confirm the homepage feed excludes PTA and Alumni (Q1), and the owner confirms DEC-121.
- Designer (Aya): pill colours and icons (Q5), alumni card (Q6), motion values (Q7), page header treatment (Q8), Announcements blue versus green (Q11), and the navbar order and `xl` breakpoint as a design dependency (Q2).
- Engineering, before release: check staging and production `legacy_urls` for `/alumni` or `/pta` (Q10); run migration 003 on staging and production through the managed pipeline.
- Authenticated e2e coverage needs the private session fixture (skipped here).

**Accepted limitations:** the admin-editable PTA header is deferred (Q3); the formal accessibility audit remains DEC-112; rollback of migration 003 is manual and the previous release would show `pta`/`alumni` articles in the homepage feed without a category label.

**Admin navigation change (2026-10-05):** the sidebar was consolidated after the evidence above was recorded. It was verified with lint, typecheck, unit tests (including the redirects) and a dev-server redirect check; the updated authenticated e2e checks in `admin-sidebar.spec.ts` are written but skip without a session fixture and have not been run.

Advance status only as defined in [SPEC_WORKFLOW](../SPEC_WORKFLOW.md).
