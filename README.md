<p align="center">
  <img src="public/images/logo/fgs-logo-website-1.webp" alt="Flor de Grace School crest" width="112" />
</p>

<h1 align="center">Flor de Grace School</h1>

<p align="center">School information, stories, and simple content management.</p>

<p align="center">
  <a href="https://flordegraceschoolinc.com/">Website</a> ·
  <a href="https://preview.flordegraceschoolinc.com/">Staging</a> ·
  <a href="docs/README.md">Documentation</a>
</p>

<p align="center"><strong>Next.js 16 · React 19 · TypeScript · MySQL · Node 24</strong></p>

## Built for the school

A responsive public website and Google-authenticated `/admin`, with application-owned content and persistent uploads.

- **Seven section editors** — Hero, About, Admission, Clubs, Gallery, Contact, and School Info.
- **News and media** — publish, edit, and trash stories; search/upload photos; preserve captions and image order. Image-only stories are supported.
- **Reliable editing** — revision conflicts protect concurrent saves, articles use soft deletion, and staging content stays separate from production.

Production is live with all five migrated legacy articles. WordPress is retired. Inquiry submission remains deferred.

## Tech stack

| Layer           | Tools                                                  |
| --------------- | ------------------------------------------------------ |
| Application     | Next.js 16 App Router, React 19, TypeScript            |
| Interface       | Tailwind CSS 4, shadcn/ui, Lucide icons                |
| Forms           | React Hook Form, Zod                                   |
| Authentication  | NextAuth.js, Google OAuth, verified-email allowlist    |
| Content & media | Hostinger MySQL, mysql2, persistent filesystem uploads |
| Development     | Node.js 24, pnpm 10.30.2, Docker/MariaDB               |
| Quality         | Vitest, Testing Library, Playwright, ESLint, Prettier  |
| Delivery        | GitHub Actions, Hostinger managed Node.js builds       |

Exact dependency versions are pinned in [package.json](package.json) and [pnpm-lock.yaml](pnpm-lock.yaml).

## Get running

Requires **Node 24**, **pnpm 10.30.2**, and **Docker**.

```sh
pnpm install --frozen-lockfile
pnpm setup:env
pnpm docker:up
pnpm db:migrate
pnpm dev
```

Open **http://localhost:3000**. MariaDB runs on `127.0.0.1:3307`; local media lives in `.data/media`. Add Google OAuth credentials and `ADMIN_ALLOWED_EMAILS` to ignored `.env.local` to use admin. See [local setup](docs/DOCKER.md).

## Check, then ship

| Command              | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `pnpm verify`        | Lint, types, tests, formatting, and production build         |
| `pnpm test:e2e`      | Browser smoke tests                                          |
| `pnpm test:database` | Database/importer tests; requires guarded disposable storage |

Protected PRs pass **Lint, Types, Tests & Build**. Pushes to `staging` deploy preview; `main`/`master` target production. Hostinger applies schema migrations before building. Production branch promotion remains pending; staging automation is verified. [CI/CD](docs/CI_CD.md) · [Test prerequisites](docs/TESTING.md)

## Find your way

[Architecture](docs/ARCHITECTURE.md) · [Content contracts](docs/DATA_API_CONTRACTS.md) · [Design](docs/DESIGN.md) · [Security](docs/SECURITY.md) · [Recovery](docs/DEPLOYMENT.md)

Contributor guidance lives in [AGENTS.md](AGENTS.md). Launch evidence is recorded in [SPEC-008](docs/specs/008-wordpress-removal.md); the [original conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) is historical.
