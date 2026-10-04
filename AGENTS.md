# Repository agent instructions

This is the canonical instruction entry point for this repository. [CLAUDE.md](CLAUDE.md) and [GEMINI.md](GEMINI.md) redirect here. These instructions apply to code, documentation, and repository workflow work; current explicit user instructions take precedence.

## Start with a small reading set

Always read [onboarding](.agents/rules/00-repository-onboarding.md) and [docs/README.md](docs/README.md), then load only the rules relevant to the task:

| Work                                                   | Applicable rule                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| System boundaries, data ownership, application modules | [10-architecture](.agents/rules/10-architecture.md)                                 |
| Content reads/writes, media, offline migration         | [20-content-storage](.agents/rules/20-content-storage.md)                           |
| Auth, secrets, inquiries, uploads, private data        | [30-security-privacy](.agents/rules/30-security-privacy.md)                         |
| UI, forms, content presentation, design                | [40-frontend-design](.agents/rules/40-frontend-design.md)                           |
| Behavior changes or verification                       | [50-testing-quality](.agents/rules/50-testing-quality.md)                           |
| Documentation, requirements, specifications            | [60-specifications-documentation](.agents/rules/60-specifications-documentation.md) |
| Commits, branches, pushes, pull requests               | [70-commits-pull-requests](.agents/rules/70-commits-pull-requests.md)               |

The documentation index defines authority, document ownership, and task-specific reading paths. Resolve conflicts explicitly. A proposal is not an accepted requirement simply because it appears in a merged document.

## Repository invariants

- The application owns content in MySQL and uploads in persistent filesystem storage. WordPress is offline migration input only, per the owner's October 4 plan in [SPEC-008](docs/specs/008-wordpress-removal.md).
- Privileged database/auth/media settings remain server-only; no secrets in browser code, logs or tracked files.
- Staging and production databases, users and media directories are isolated. Media stays outside every deployment directory.
- Authorize protected operations, validate inputs, parameterize SQL, sanitize HTML and validate images/paths. Use transactions, revisions and soft deletion.
- Public content reads dynamically without persistent caches for this release. Report saved-but-refresh-failed outcomes accurately.
- Docker is local MariaDB only. Hostinger Node 24 serves production and preview; retain verified recovery data and environment isolation.
- Preserve [DESIGN](docs/DESIGN.md), branch-based [CI/CD](docs/CI_CD.md), and the historical conceptual draft.
- Preserve unrelated user changes and report actual verification honestly.

## Present repository state

The Next.js public and admin interfaces now use server-only services in `src/lib/content`. Seven section editors, article create/edit/trash and media selection/upload remain. Google verified-email allowlisting and eight-hour sessions remain. SQL migrations and offline migration/recovery tools are implemented; fresh WordPress backups and an export are retained outside Git. Hosted acceptance passed and production launched on October 4; evidence is recorded in SPEC-008. Inquiry submission is deferred. Use `pnpm verify`, `pnpm test:database`, and `pnpm test:e2e`; see [TESTING](docs/TESTING.md) and [DEPLOYMENT](docs/DEPLOYMENT.md).

shadcn components in `src/components/ui` are primitives. Custom public components and the school visual system are documented in [FRONTEND.md](docs/FRONTEND.md) and [DESIGN.md](docs/DESIGN.md).

For commit or PR tasks, use the repository-local [github-pr skill](.agents/skills/github-pr/SKILL.md). Ordinary editing does not authorize commits, pushes, merges, deployments, or branch-protection changes. Preserve authorization already given by the user instead of requesting it again.

For PR code-review requests, use the repository-local [github-pr-review skill](.agents/skills/github-pr-review/SKILL.md). It accepts a URL/number or discovers the intended open PR. Review findings do not authorize external comments, approval, edits or merging.

For authorized Hostinger shell or management API access, use the repository-local [hostinger-ssh skill](.agents/skills/hostinger-ssh/SKILL.md). Keep local SSH and API credentials in the ignored `.env.hostinger-ssh.local` file, never in tracked files.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` â€” verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
