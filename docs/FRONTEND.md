# Frontend implementation

Preserve the designer's [DESIGN](DESIGN.md) guidance. The WordPress migration changes storage, not public composition or admin structure.

`src/components/ui` contains shadcn primitives; `src/components/public` contains the school's navbar, hero, sections, gallery, news and footer. `src/components/admin` contains the shell, form fields, media picker and article controls. The homepage and news detail read dynamic server-only content services in `src/lib/content`.

Eight editors cover Hero, About, Admission, Clubs, Gallery, Contact, School Info and Alumni (alumni achievements with an optional photo and required alt text). Media is selected by ID or uploaded; JSON never accepts arbitrary image URLs. Gallery membership remains explicitly selected photos. Article forms retain paragraphs and ordered captioned photos and support image-only stories. Stale revisions show a reload conflict; saved-but-refresh-failed messages do not invite duplicate saves.

Imported images use local `/media/...` URLs through Next.js Image. Bundled fallback assets remain under `public/images`. No WordPress remote-image configuration, Gutenberg editor or native-editor fallback is required.

Google login and allowlisting are implemented; hosted sign-in passed October 4. Contact information is displayed, while inquiry submission remains deferred. See [TESTING](TESTING.md) and [SPEC-008](specs/008-wordpress-removal.md) for verification.

## Alumni, PTA and motion (SPEC-009)

**Pages.** `/alumni` shows the `site-alumni` header and achievements grid, then "Alumni Activities" (published `alumni` articles). `/pta` shows a static header and published `pta` articles. Both use the shared `ArticleCard` (`src/components/public/article-card.tsx`, also used by the homepage news), the section-header pattern from DESIGN and the existing neutral/green tokens, and show truthful empty and unavailable notices (`area-page.tsx`). Each sets its own title and canonical.

**Admin.** The sidebar has Alumni (Achievements, Activities) and PTA (Activities) groups. Exactly one item is active: the longest matching href (`getActiveAdminNavHref`). Known limitation: it reads the path only, so `/admin/articles/new?category=alumni` highlights "Add New" and editing an article highlights "All News". The category picker has five options in two columns. The new-article page adapts its heading and copy to the area it was opened from.

**Navbar.** Items are `{ label, href, kind }` in `src/components/public/nav-links.ts`, in the order Home, About Us, Admission, News & Events, PTA, Alumni, Clubs, Gallery, Contact Us. Section links are `/#section`: on the homepage they smooth-scroll (instant with reduced motion), elsewhere they navigate and land on the section. PTA and Alumni are normal routes. The inline list shows from `xl` (1280 px) and the hamburger below it. The mobile menu is as tall as the viewport allows and scrolls on very short screens, closes after navigation, and Escape closes it and returns focus to the button. Active state: the homepage keeps the scroll-based highlight (`aria-current="location"`), `/pta` and `/alumni` mark their tab (`aria-current="page"`), article pages mark nothing. The footer's quick links use the same `/#section` targets.

**Motion.** `Reveal` (`src/components/public/reveal.tsx`) fades and slides content up on scroll using `IntersectionObserver`, with transform and opacity only. The server HTML is fully visible. After mount it hides an element only when it is wholly below the viewport, motion is allowed and `IntersectionObserver` exists, then removes its inline styles when done, so nothing is hidden without JavaScript or from assistive technology and nothing shifts. Put it around a card, not on an element with its own hover transform. The hero uses a CSS-only `.motion-enter` entrance. Timing lives in the `--motion-*` variables in `src/app/globals.css` (500 ms, 16 px, 80 ms stagger, ease-out; interim values for the designer). There is no motion in admin.
