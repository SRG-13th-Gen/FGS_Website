# Flordegrace School Website

A Next.js App Router application backed by headless WordPress. WordPress owns public content and media; privileged CMS access will stay on the Next.js server.

## Current state

The public landing page and news detail routes read published WordPress content. `/admin` edits seven structured site sections and school news, including media, through a dedicated server-side WordPress account. Google OAuth with a verified-email allowlist replaces the temporary development login; without a configured client and exact administrator list, admin access fails closed. A must-use WordPress plugin sends content changes to the authenticated revalidation endpoint, backed by short cache expiry. Local code and the independent Hostinger preview's public routes are verified; hosted OAuth, the CMS copy, live cutover, and inquiry submission remain unfinished. See [SPEC-003](docs/specs/003-team-admin.md), [SPEC-007](docs/specs/007-site-content-management.md), and the [deployment runbook](docs/DEPLOYMENT.md).

**shadcn provides primitives.** The custom public components and visual guidance are documented in [FRONTEND.md](docs/FRONTEND.md) and [DESIGN.md](docs/DESIGN.md).

## Quick start

Prerequisites: Node.js 24 LTS (tested on 24.13.0), pnpm 10.30.2, and Docker Desktop/Compose for the local CMS. Use the pinned package manager; the repository has one pnpm lockfile.

```sh
pnpm install --frozen-lockfile
pnpm setup:env
pnpm docker:up
pnpm dev
```

- Application: [localhost:3000](http://localhost:3000).
- WordPress setup/admin: [localhost:8080/wp-admin](http://localhost:8080/wp-admin).
- The database stays inside the Compose network; it has no published host port.

`setup:env` creates an ignored `.env.local` with random development values and tops up any keys it manages that are missing, without overwriting values already set; it does not print secrets. Complete WordPress's local installer to create your school-editor account, then select a permalink structure for `/wp-json` routes. Create a separate integration account for the implemented CMS reads and writes.

`setup:env` seeds a random `NEXTAUTH_SECRET`. To use `/admin`, configure a Google OAuth web client, `NEXTAUTH_URL`, and exact comma-separated `ADMIN_ALLOWED_EMAILS` in ignored local settings. Add `/api/auth/callback/google` at that origin to Google's authorized redirect URIs. Without these values, `/admin` stays inaccessible.

The public site renders without Docker or CMS credentials (the news area shows its "unavailable" state), so frontend work can begin with `pnpm install --frozen-lockfile` and `pnpm dev`. Reading real articles/sections or publishing from `/admin` needs `pnpm docker:up` plus a dedicated WordPress integration account with the **Editor** role (SPEC-007 needs `edit_pages`, not just `edit_posts`): create an Application Password for it in `/wp-admin`, then set `WORDPRESS_USERNAME`/`WORDPRESS_APPLICATION_PASSWORD` in `.env.local` yourself (never commit real values — `.env.example` keeps empty placeholders). The local WordPress/PHP image's default upload limits (2 MB) are below SPEC-003's 10 MB-per-image cap; `docker/php/uploads.ini` raises them for local use only — see [DOCKER.md](docs/DOCKER.md). Docker is local-only; production deployment follows [DEPLOYMENT.md](docs/DEPLOYMENT.md).

Once Docker and the integration account are set up, run `pnpm wp:seed-content` once to import the current site copy and bundled images into WordPress (creates one page per section holding a structured content field; safe to re-run — it never overwrites a page's content once seeded or edited, and reuses already-uploaded images instead of duplicating them). Without seeding, every section falls back to the same default content, so the site still renders.

## Development commands

| Command                                     | Purpose                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`                                  | Next.js development server                                                                  |
| `pnpm build` / `pnpm start`                 | Production build / run that build                                                           |
| `pnpm verify`                               | Lint, types, unit tests, format check, production build                                     |
| `pnpm test` / `pnpm test:coverage`          | Unit tests / coverage                                                                       |
| `pnpm exec playwright install chromium`     | Install the browser used by smoke tests                                                     |
| `pnpm test:e2e`                             | Build and run production browser smoke checks on port 3100                                  |
| `pnpm format` / `pnpm format:check`         | Format / check maintained source and docs                                                   |
| `pnpm docker:config` / `pnpm docker:status` | Validate local Compose / inspect service health                                             |
| `pnpm docker:stop` / `pnpm docker:down`     | Stop services / remove containers and network, retaining volumes                            |
| `pnpm wp:seed-content`                      | Idempotently seed WordPress with default site section content and bundled images (SPEC-007) |
| `pnpm ui:add <name>` / `pnpm ui:all`        | Use the pinned shadcn CLI; review changes before regeneration                               |

See [DOCKER.md](docs/DOCKER.md) for local service details and [TESTING.md](docs/TESTING.md) for verification scope. `verify` does not start Docker or send email. The Hostinger release gates are in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Repository map

- `src/app`: routes, layout, public pages, admin routes, not-found page, and global CSS.
- `src/components/public` and `src/components/admin`: custom public sections and admin CMS interfaces; `src/components/ui` contains shadcn primitives.
- `src/components/providers.tsx`: theme, tooltip, and toast wiring.
- `src/lib/env`: server-only configuration boundary and pure validation.
- `src/lib/auth`: server-only Google OAuth configuration and exact email authorization.
- `src/lib/wordpress`: server-only WordPress REST adapter — public reads, HTML sanitization, category resolution, the admin publish flow (media upload + Gutenberg content building), and `sections/` (SPEC-007 structured site content: schemas, the per-section read/save adapter, media resolution).
- `src/components/admin`: the admin CMS shell (sidebar, topbar, dashboard) and reusable section-editor form fields.
- `wordpress/mu-plugins`: the must-use plugin registering section content and producing authenticated content-change events.
- `scripts`: cross-platform local environment/Docker commands, and the site content seed script.
- `tests`: unit, integration, and production browser smoke tests.
- `docs`: requirements, decisions, architecture, contracts, and feature specifications.

## Specifications and contributing

Start with [AGENTS.md](AGENTS.md) and the [documentation index](docs/README.md). [Requirements](docs/FRS_NFRS.md), [decisions](docs/DECISIONS.md), [SPEC-003](docs/specs/003-team-admin.md), and [SPEC-007](docs/specs/007-site-content-management.md) distinguish implemented behavior from outstanding requirements.

Typed work branches target `staging`; promotion uses `staging` -> `main`. Actual branch protection and CI/CD remain unconfigured. Use the local [GitHub PR skill](.agents/skills/github-pr/SKILL.md) when commits or PRs are requested.

The [initial conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) is preserved unchanged. Maintained specifications govern implementation.
