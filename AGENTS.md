# Repository agent instructions

This is the canonical instruction entry point for this repository. [CLAUDE.md](CLAUDE.md) and [GEMINI.md](GEMINI.md) redirect here. These instructions apply to code, documentation, and repository workflow work; current explicit user instructions take precedence.

## Start with a small reading set

Always read [onboarding](.agents/rules/00-repository-onboarding.md) and [docs/README.md](docs/README.md), then load only the rules relevant to the task:

| Work                                                     | Applicable rule                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| System boundaries, data ownership, application modules   | [10-architecture](.agents/rules/10-architecture.md)                                 |
| CMS reads/writes, WordPress authentication, cache events | [20-wordpress-integration](.agents/rules/20-wordpress-integration.md)               |
| Auth, secrets, inquiries, uploads, private data          | [30-security-privacy](.agents/rules/30-security-privacy.md)                         |
| UI, forms, content presentation, design                  | [40-frontend-design](.agents/rules/40-frontend-design.md)                           |
| Behavior changes or verification                         | [50-testing-quality](.agents/rules/50-testing-quality.md)                           |
| Documentation, requirements, specifications              | [60-specifications-documentation](.agents/rules/60-specifications-documentation.md) |
| Commits, branches, pushes, pull requests                 | [70-commits-pull-requests](.agents/rules/70-commits-pull-requests.md)               |

The documentation index defines authority, document ownership, and task-specific reading paths. Resolve conflicts explicitly. A proposal is not an accepted requirement simply because it appears in a merged document.

## Repository invariants

- WordPress owns public content and media. Use its REST API; never create a second editable content store or directly access CMS tables from Next.js.
- Privileged WordPress calls and credentials stay server-side. No secrets in browser code, public environment variables, logs, or committed files.
- Docker is for local WordPress/database development only. Hostinger is the production target; its exact runtime capabilities remain unverified until recorded.
- The optional application database is only for accepted application-owned needs. Do not create illustrative schemas automatically.
- Preserve the frontend designer's implemented visual guidance in [DESIGN.md](docs/DESIGN.md). Keep [CI_CD.md](docs/CI_CD.md) empty until that work is requested; do not invent CI/CD configuration.
- Preserve [the initial conceptual draft](docs/conceptual/IMPLEMENTATION_PLAN.md) as historical input. Update maintained specifications instead.
- Preserve unrelated user changes. Document actual implementation and verification status honestly.

## Present repository state

The repository contains a Next.js/TypeScript/Tailwind site, the selected shadcn registry, local WordPress/MariaDB Compose services, and executable quality checks. The public landing page and news detail route, WordPress-backed site sections, and local admin section/article workflows are implemented. The admin uses a temporary development-only login; production team authentication, role enforcement, native WordPress revalidation events, inquiry delivery, and deployment remain unfinished. Use `pnpm verify` for lint, types, unit tests, formatting and build; `pnpm test:e2e` for production browser checks; and `pnpm docker:config` for Compose validation after `pnpm setup:env`. See [TESTING.md](docs/TESTING.md) for scope and prerequisites.

shadcn components in `src/components/ui` are primitives. Custom public components and the school visual system are documented in [FRONTEND.md](docs/FRONTEND.md) and [DESIGN.md](docs/DESIGN.md).

For commit or PR tasks, use the repository-local [github-pr skill](.agents/skills/github-pr/SKILL.md). Ordinary editing does not authorize commits, pushes, merges, deployments, or branch-protection changes. Preserve authorization already given by the user instead of requesting it again.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
