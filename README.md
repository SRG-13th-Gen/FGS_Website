# Flordegrace School Website

A Next.js App Router application backed by headless WordPress. WordPress owns public content and media; privileged CMS access will stay on the Next.js server.

## Current state

The repository includes the application/toolchain scaffold, Tailwind CSS, all 61 installable components from the selected shadcn Radix Nova registry, local WordPress/MariaDB services, and executable quality checks. The public landing page is built, and the news/announcements area reads real published articles from WordPress (`src/lib/wordpress/`) in the `clubs`/`events`/`announcements` categories, with a calm "unavailable"/"no news yet" state when the CMS can't be read. `/admin` has a temporary dev-only login (see below) protecting a publishing form that writes articles (with images, captions, and alt text) to WordPress. Team authentication (DEC-103), role enforcement (DEC-111), the CMS revalidation webhook (DEC-105), and inquiry delivery remain future feature work — see [SPEC-003](docs/specs/003-team-admin.md) for exactly what is and isn't implemented.

**shadcn provides primitives. The frontend designer still creates custom school components, layouts, and the visual system.** See [FRONTEND.md](docs/FRONTEND.md); [DESIGN.md](docs/DESIGN.md) remains empty and designer-owned.

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

`setup:env` creates an ignored `.env.local` with random development values and tops up any keys it manages that are missing, without overwriting values already set; it does not print secrets. Complete WordPress's local installer to create your school-editor account, then select a permalink structure for `/wp-json` routes. A dedicated integration account is separate and will be used when CMS features are implemented.

`setup:env` also seeds `ADMIN_DEV_EMAIL`, `ADMIN_DEV_PASSWORD`, and `ADMIN_DEV_SESSION_SECRET` in `.env.local` for the temporary dev-only `/admin` login (see [SPEC-003](docs/specs/003-team-admin.md)). Check `.env.local` yourself for the generated email/password — they are never printed to the terminal. This login only works outside production and is scaffolding for FR-005, not the accepted DEC-103 team sign-in.

The public site renders without Docker or CMS credentials (the news area shows its "unavailable" state), so frontend work can begin with `pnpm install --frozen-lockfile` and `pnpm dev`. Reading real articles or publishing from `/admin` needs `pnpm docker:up` plus a dedicated WordPress integration account: create an Application Password for it in `/wp-admin`, then set `WORDPRESS_USERNAME`/`WORDPRESS_APPLICATION_PASSWORD` in `.env.local` yourself (never commit real values — `.env.example` keeps empty placeholders). The local WordPress/PHP image's default upload limits (2 MB) are below SPEC-003's 10 MB-per-image cap; `docker/php/uploads.ini` raises them for local use only — see [DOCKER.md](docs/DOCKER.md). Docker is local-only; no production deployment is configured.

## Development commands

| Command                                     | Purpose                                                          |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                  | Next.js development server                                       |
| `pnpm build` / `pnpm start`                 | Production build / run that build                                |
| `pnpm verify`                               | Lint, types, unit tests, format check, production build          |
| `pnpm test` / `pnpm test:coverage`          | Unit tests / coverage                                            |
| `pnpm exec playwright install chromium`     | Install the browser used by smoke tests                          |
| `pnpm test:e2e`                             | Build and test the production scaffold on port 3100              |
| `pnpm format` / `pnpm format:check`         | Format / check maintained source and docs                        |
| `pnpm docker:config` / `pnpm docker:status` | Validate local Compose / inspect service health                  |
| `pnpm docker:stop` / `pnpm docker:down`     | Stop services / remove containers and network, retaining volumes |
| `pnpm ui:add <name>` / `pnpm ui:all`        | Use the pinned shadcn CLI; review changes before regeneration    |

See [DOCKER.md](docs/DOCKER.md) for local service details and [TESTING.md](docs/TESTING.md) for verification scope. `verify` does not start Docker or send email. Production hosting capabilities still need verification before deployment.

## Repository map

- `src/app`: routes, layout, public pages, admin routes, not-found page, and global CSS.
- `src/components/ui`: installed shadcn primitives; custom public/admin components follow approved designs.
- `src/components/providers.tsx`: theme, tooltip, and toast wiring.
- `src/lib/env`: server-only configuration boundary and pure validation.
- `src/lib/auth`: server-only session/authorization helpers, including the temporary dev-only admin login (`dev-login.ts`).
- `src/lib/wordpress`: server-only WordPress REST adapter — public reads, HTML sanitization, category resolution, and the admin publish flow (media upload + Gutenberg content building).
- `scripts`: cross-platform local environment and Docker commands.
- `tests`: unit and production browser smoke tests.
- `docs`: requirements, decisions, architecture, contracts, and feature specifications.

## Specifications and contributing

Start with [AGENTS.md](AGENTS.md) and the [documentation index](docs/README.md). [Requirements](docs/FRS_NFRS.md), [decisions](docs/DECISIONS.md), and [SPEC-006](docs/specs/006-repository-scaffold.md) distinguish product proposals from implemented scaffolding.

Typed work branches target `staging`; promotion uses `staging` -> `main`. Actual branch protection and CI/CD remain unconfigured. Use the local [GitHub PR skill](.agents/skills/github-pr/SKILL.md) when commits or PRs are requested. This scaffold does not create commits, push branches, or deploy.

The [initial conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) is preserved unchanged. Maintained specifications govern implementation.
