# Flordegrace School Website

A Next.js App Router application backed by headless WordPress. WordPress owns public content and media; privileged CMS access will stay on the Next.js server.

## Current state

The repository includes the application/toolchain scaffold, Tailwind CSS, all 61 installable components from the selected shadcn Radix Nova registry, local WordPress/MariaDB services, and executable quality checks. The home page is a minimal non-indexable placeholder. School page designs, CMS integration, team admin, revalidation, and inquiry delivery remain future feature work.

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

`setup:env` creates an ignored `.env.local` with random development passwords and never overwrites it. It does not print the secrets. Complete WordPress's local installer to create your school-editor account, then select a permalink structure for `/wp-json` routes. A dedicated integration account is separate and will be used when CMS features are implemented.

The placeholder runs without Docker or CMS credentials, so frontend work can begin with `pnpm install --frozen-lockfile` and `pnpm dev`. Docker is local-only; no production deployment is configured.

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

- `src/app`: routes, layout, placeholder, not-found page, and global CSS.
- `src/components/ui`: installed shadcn primitives; custom public/admin components follow approved designs.
- `src/components/providers.tsx`: theme, tooltip, and toast wiring.
- `src/lib/env`: server-only configuration boundary and pure validation.
- `scripts`: cross-platform local environment and Docker commands.
- `tests`: unit and production browser smoke tests.
- `docs`: requirements, decisions, architecture, contracts, and feature specifications.

## Specifications and contributing

Start with [AGENTS.md](AGENTS.md) and the [documentation index](docs/README.md). [Requirements](docs/FRS_NFRS.md), [decisions](docs/DECISIONS.md), and [SPEC-006](docs/specs/006-repository-scaffold.md) distinguish product proposals from implemented scaffolding.

Typed work branches target `staging`; promotion uses `staging` -> `main`. Actual branch protection and CI/CD remain unconfigured. Use the local [GitHub PR skill](.agents/skills/github-pr/SKILL.md) when commits or PRs are requested. This scaffold does not create commits, push branches, or deploy.

The [initial conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) is preserved unchanged. Maintained specifications govern implementation.
