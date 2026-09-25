# Public assets

This directory contains bundled default images served by Next.js. Editable site images are seeded into and managed through WordPress; the local files let the public page render before the CMS is set up.

## Structure

- `images/logo/` — School logo (WebP)
- `images/hero/` — Hero background (PNG)
- `images/general/` — Classroom and admission images (WebP)

Files here are served from the root URL. For example:

- `public/images/logo/fgs-logo-website-1.webp` → `/images/logo/fgs-logo-website-1.webp`

Run `pnpm wp:seed-content` after local WordPress setup to upload these defaults and create the seven site-section pages. The seed script reuses matching media and does not overwrite edited section content.
