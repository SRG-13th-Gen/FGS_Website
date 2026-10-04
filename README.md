# Flor de Grace School Website

Next.js 16 website with Google-authenticated `/admin`, MySQL content and persistent filesystem media. Production launched October 4, 2026. WordPress is retired; its exporter remains an offline recovery/migration tool.

- Public homepage, five migrated news articles, SEO metadata and legacy redirects.
- Seven section editors: Hero, About, Admission, Clubs, Gallery, Contact and School Info.
- Article publishing, editing and soft trash; image-only stories and ordered captioned photos.
- Searchable media picker and validated uploads. Staging and production content are isolated.
- Inquiry submission remains deferred.

## Local development

Use Node 24 and pnpm 10.30.2; exact dependencies are pinned in `package.json` and `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm setup:env
pnpm docker:up
pnpm db:migrate
pnpm dev
```

MariaDB listens on `127.0.0.1:3307`; media uses `.data/media`. Supply Google credentials and `ADMIN_ALLOWED_EMAILS` in ignored `.env.local` for admin access. Missing authentication settings deny access. Public fallback sections and honest news outage states allow frontend work without a database. See [local setup](docs/DOCKER.md).

## Quality and deployment

`pnpm verify` runs lint, type checks, unit/integration tests, formatting and a production build. `pnpm test:e2e` runs browser smoke tests; guarded database and authenticated fixtures are separate. See [testing](docs/TESTING.md).

PRs require **Lint, Types, Tests & Build**. Pushes to `staging` deploy [preview](https://preview.flordegraceschoolinc.com/); `main`/`master` target [production](https://flordegraceschoolinc.com/). Managed deployments apply pending schema migrations before building. Staging automation is verified; production still serves its accepted launch release until branch promotion. See [CI/CD](docs/CI_CD.md) and [recovery](docs/DEPLOYMENT.md).

Start with the [documentation index](docs/README.md). [AGENTS.md](AGENTS.md) defines contributor rules; [DESIGN.md](docs/DESIGN.md) defines the visual system. The [conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) is historical.
