# Technology stack

Accepted current stack: Next.js 16 App Router, React 19, TypeScript, Tailwind/shadcn, pnpm, NextAuth Google OAuth, mysql2 and Hostinger MySQL/MariaDB. Direct dependency versions are pinned in package.json with one pnpm lockfile. Hostinger runs Node 24.

Application-owned content uses versioned SQL migrations. Media bytes use persistent environment-specific filesystem directories outside deployments. No WordPress runtime, Gutenberg dependency, CMS webhook or native editor remains. Offline migration uses htmlparser2/entities to convert the source snapshot; sanitize-html protects public output.

Vitest tests pure/server behavior, real database integration uses an explicitly guarded disposable database, and Playwright tests production browser flows. Docker is local MariaDB only. Inquiry delivery is deferred; no email provider or extra app service is introduced.

[Architecture](ARCHITECTURE.md), [deployment](DEPLOYMENT.md), [contracts](DATA_API_CONTRACTS.md) and [SPEC-008](specs/008-wordpress-removal.md) govern implementation.
