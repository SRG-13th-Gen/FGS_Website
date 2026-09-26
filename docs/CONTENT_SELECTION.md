# Launch content selection

Status 2026-09-26: source inventory and repository fallback copy reviewed; no changes have been written to the hosted WordPress installation. The CMS copy and final public rendering remain to verify.

The source is the existing site's public WordPress REST API at `https://flordegraceschoolinc.com/wp-json/wp/v2` (read 2026-09-26). Its homepage itself returns HTTP 503. It exposes a published Home page, five published posts, and media. The copy flow preserves **all** original pages, posts, and uploads in the independent CMS website; only selected material enters the new site's structured sections and three public article categories.

## Sections

The seven section defaults in `src/lib/wordpress/sections/` seed the CMS copy once. Hero, About, mission/vision, address, phone, and email align with the old Home page's published copy. The school should edit those fields in `/admin` after OAuth is configured. A public Gallery with no selected photos shows its honest empty state until media can be assessed on the CMS copy.

The old Home page names **Science Club**, **English Club**, and **Makabayang Graciano**. The former fallback copy described six clubs and meeting times absent from the source; the launch defaults now use those three named clubs and say to contact the school for schedules. Office hours and a 24-hour email response claim were also absent, so the defaults no longer assert them. The admission inquiry step points to phone/email because visitor inquiry submission is deferred.

Use the existing brand logo, hero photo, classroom image, and admission image already bundled in the repository as fallback media. After CMS copy, link the corresponding WordPress media IDs where available. Do not publish unrelated uploads or an image merely because it exists in the library. Media with students must be checked against the school's existing published usage before selection.

## Posts and categories

| Original post                                         | Launch choice                                                                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `summer-class-2025-draft` (title “Summer Class 2026”) | Candidate for `events` after verifying its date/body/image on the CMS copy; it is the only substantive recent story.                         |
| `fgs-22` (title “FGS @23!”)                           | Keep in the CMS archive; its 2025 publication and event age make it less useful as launch news.                                              |
| `summer-class-2025`, `enrollment`, `test-post`        | Keep in the CMS archive. Their content is empty or stale, so do not map them to the three new public categories without an editorial update. |

Create or verify `clubs`, `events`, and `announcements` categories on the CMS copy. Map only the selected, checked story to `events`; leave the other posts and all original media intact. A missing category or no suitable current story produces a truthful empty News state. This is a curated launch selection, not a deletion or rewrite of the old site.
