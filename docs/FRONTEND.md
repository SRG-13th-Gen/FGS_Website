# Frontend implementation

The public site and local editorial UI use Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Lucide icons, and the installed shadcn primitives. The implemented visual tokens and component patterns are in [DESIGN.md](DESIGN.md); the shadcn registry supplies primitives, not the site's complete interface.

## Routes and components

| Location                       | Current behavior                                                                                                                                                                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`             | Server-rendered landing page: hero, school information, Montessori quote and banner, about, admissions, clubs, gallery, news, and contact. Seven structured content groups come from WordPress with local defaults. News reads published WordPress posts. |
| `src/app/news/[slug]/page.tsx` | Published article detail with sanitized body and media, plus distinct missing and CMS-unavailable states.                                                                                                                                                 |
| `src/app/admin/login`          | Temporary development-only login. It is disabled when `NODE_ENV=production`.                                                                                                                                                                              |
| `src/app/admin/(protected)`    | Admin dashboard, seven section editors, article list/new/edit/trash, and media picker. Server actions use the admin guard and WordPress REST adapter.                                                                                                     |
| `src/components/public`        | Custom navbar, footer, clubs carousel, gallery, and news grid.                                                                                                                                                                                            |
| `src/components/admin`         | Admin shell/navigation, shared fields, article fields, media picker, save bar, and unsaved-change warning.                                                                                                                                                |
| `src/components/ui`            | Installed shadcn primitives.                                                                                                                                                                                                                              |
| `src/lib/wordpress`            | Server-only public reads, sanitized article display, validation, post/media writes, and site-section adapters.                                                                                                                                            |

The public navbar, footer, clubs carousel, gallery expansion, and news expansion have client-side interactions. The landing page itself fetches content on the server. Article news cards come from WordPress, not a local sample-story module. Section editors update fixed fields stored in WordPress page metadata; they do not edit Gutenberg layouts.

## Content and image behavior

The homepage reads Hero, School Info, About, Admission, Contact, Clubs, and Gallery sections concurrently. The section adapter validates CMS data and falls back to bundled defaults when a section cannot be read. Run `pnpm wp:seed-content` after local WordPress setup to persist those defaults and bundled images into WordPress. The admin media picker can reuse an existing WordPress image or upload a new one.

Public news uses the three allowed categories: Clubs, Events, and Announcements. The listing shows an empty state or CMS-unavailable message as appropriate. Article detail distinguishes a genuine missing slug from unavailable WordPress. The simple admin editor opens unsupported Gutenberg content read-only and links to native WordPress editing. See [SPEC-003](specs/003-team-admin.md) and [SPEC-007](specs/007-site-content-management.md) for behavior and limits.

Image assets used as local defaults live under `public/images`. Public images use Next.js Image with responsive sizes. WordPress media URLs must match the remote-image configuration in `next.config.ts`.

On mobile, avoid nested `backdrop-filter` effects across tall stacked sections. Earlier layouts showed blank render layers in iOS Safari and mobile Chrome when large blurred overlays were combined. Use solid or tinted surfaces for long sections, and keep explicit image dimensions or `fill` with responsive `sizes` to limit layout shift.

## Current limits

The contact section presents school contact information; inquiry delivery is not implemented. The admin login is local development scaffolding, and production role enforcement has not been built. Native WordPress edits rely on the current time-based cache refresh until the authenticated event integration is implemented. Production deployment and final accessibility acceptance still need evidence.

## Local checks

Run `pnpm verify` for lint, route type generation/typecheck, unit and integration tests, formatting, and a production build. Run `pnpm test:e2e` for the production browser suite; its admin workflow coverage is limited by the development-only login. See [TESTING.md](TESTING.md) for exact scope.
