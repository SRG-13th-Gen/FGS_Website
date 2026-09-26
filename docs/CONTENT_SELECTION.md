# Launch content selection

Status 2026-09-26: source inventory and repository fallback copy reviewed. The original WordPress site has not been changed. The independent CMS copy completed, its homepage and REST API load, and the seven structured-content sections were seeded. Preview renders the CMS sections and a CMS image passed Next.js optimization.

The source is the existing site's public WordPress REST API at `https://flordegraceschoolinc.com/wp-json/wp/v2` (read 2026-09-26). Its homepage itself returns HTTP 503. It exposes a published Home page, five published posts, and media. The copy flow preserves **all** original pages, posts, and uploads in the independent CMS website; only selected material enters the new site's structured sections and three public article categories.

## Sections

The seven section defaults in `src/lib/wordpress/sections/` seed the CMS copy once. Hero, About, mission/vision, address, phone, and email align with the old Home page's published copy. The school should edit those fields in `/admin` after OAuth is configured. A public Gallery with no selected photos shows its honest empty state until media can be assessed on the CMS copy.

The old Home page names **Science Club**, **English Club**, and **Makabayang Graciano**. The former fallback copy described six clubs and meeting times absent from the source; the launch defaults now use those three named clubs and say to contact the school for schedules. Office hours and a 24-hour email response claim were also absent, so the defaults no longer assert them. The admission inquiry step points to phone/email because visitor inquiry submission is deferred.

Use the existing brand logo, hero photo, classroom image, and admission image already bundled in the repository as fallback media. After CMS copy, link the corresponding WordPress media IDs where available. Do not publish unrelated uploads or an image merely because it exists in the library. Media with students must be checked against the school's existing published usage before selection.

## Posts and categories

| Original post                                         | Launch choice                                                                                                                                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `summer-class-2025-draft` (title “Summer Class 2026”) | Keep in the CMS archive for editorial correction. Its February 2026 publication date precedes the May 30, 2026 event described in the body, and the body has draft wording. Do not map it to `events` yet.   |
| `fgs-22` (title “FGS @23!”)                           | Keep in the CMS archive; its 2025 publication and event age make it less useful as launch news.                                                                                                              |
| `summer-class-2025`, `enrollment`, `test-post`        | Keep in the CMS archive. Their content is empty or stale, so do not map them to the three new public categories without an editorial update. The copy's `test-post` was moved from `clubs` to Uncategorized. |

The `clubs`, `events`, and `announcements` categories now exist on the CMS copy with no posts. Leave all original posts and media intact. No story currently meets the launch check, so the public site shows an empty News state until the school corrects and approves one. This is a curated launch selection, not a deletion or rewrite of the old site.
