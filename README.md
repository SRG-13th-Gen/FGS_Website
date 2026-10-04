# Flor de Grace School Website

Next.js 16 public website and Google-authenticated `/admin`. The application owns content in MySQL and uploads in persistent filesystem storage. WordPress is used only by the offline migration exporter.

Seven section editors, article publishing/editing/trashing, and the media picker retain the existing design. Articles support paragraphs and up to 20 captioned photos, including image-only stories. Staging and production use separate databases and media directories.

## Development

Use Node 24 and pnpm 10.30.2:

```sh
pnpm install --frozen-lockfile
pnpm setup:env
pnpm docker:up
pnpm db:migrate
pnpm dev
```

Compose runs MariaDB at 127.0.0.1:3307. Configure Google credentials and an exact email allowlist in ignored local settings to use admin. Without them, protected access fails closed. Public fallbacks support frontend work without a database; unavailable news is reported honestly.

`pnpm verify` runs lint, types, unit/integration tests, formatting and a production build. `pnpm test:e2e` runs production browser smoke tests. `pnpm test:database` requires an explicitly named disposable test database; see [TESTING](docs/TESTING.md).

## Boundaries and migration

- `src/lib/content`: server-only database, media and content services.
- `src/lib/auth`: Google OAuth, verified-email allowlisting and eight-hour sessions.
- `db/migrations`: ordered, checksummed schema migrations.
- `scripts/migration`, `content:export` and `content:import`: offline source conversion.
- `content:backup` and `content:restore`: content plus checksummed media recovery.
- `src/app/media`: validated file delivery; legacy URLs redirect through database mappings.

[Architecture](docs/ARCHITECTURE.md), [contracts](docs/DATA_API_CONTRACTS.md), [deployment](docs/DEPLOYMENT.md), and [SPEC-008](docs/specs/008-wordpress-removal.md) describe current ownership and launch gates. Production launched on October 4, 2026; both WordPress installations were removed after hosted acceptance and verified recovery backups. Inquiry submission remains deferred. The [historical conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) and [design guidance](docs/DESIGN.md) are preserved. Preview automation remains scoped to staging.
