# SPEC-006: Repository scaffold

| Field                 | Value                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approval status       | Accepted                                                                                                                                                                    |
| Implementation status | Verified (scaffold scope only)                                                                                                                                              |
| Responsible owner     | Engineering                                                                                                                                                                 |
| Requirement IDs       | NFR-001 (configuration boundary only), NFR-008, NFR-009 (local/toolchain portion)                                                                                           |
| Decision IDs          | DEC-009, DEC-101, DEC-102, DEC-109                                                                                                                                          |
| Acceptance evidence   | Owner instruction on 2026-09-19: scaffold Next.js, gitignore, Docker, Tailwind, all shadcn components; choose supporting libraries; retain designer-owned custom components |

## Outcome and scope

Provide a runnable development foundation with a pinned pnpm toolchain, Next.js App Router and TypeScript, Tailwind, the full official installable shadcn component registry, local WordPress/MariaDB, safe environment setup, and executable quality checks.

The scaffold is independent of production Hostinger provisioning. Auth, email delivery, CMS adapters/CRUD, cache events, final public pages, and school design remain separate features. No production service or repository branch workflow is configured here.

## Acceptance criteria

1. A fresh dependency installation uses one pnpm lockfile. Lint, type checks, environment tests, formatting, and a production build can be run from documented commands.
2. All installable components from the selected official registry are present and typecheck. Designer instructions require custom school components and preserve the empty DESIGN document.
3. Environment setup generates random local credentials without logging them or overwriting an existing file. Git ignores real environment files, dependencies, builds, test reports, and local service data.
4. Compose exposes only local WordPress on loopback; the database has no published host port. Both use persistent named volumes and health checks. Next.js runs on the host.
5. The placeholder page works without CMS connectivity. It and unknown-route behavior pass production browser checks; scaffold metadata prevents indexing.
6. Server configuration rejects credential-bearing/invalid URLs and insecure production CMS transport without echoing rejected values. No browser component imports server environment access.
7. Original conceptual draft, DESIGN, and CI_CD remain unchanged. Documentation reflects implemented scaffolding without marking product requirements complete.

## Decisions and dependencies

Use pnpm 10.30.2 (available toolchain), Node 24 LTS with 24.13.0 as the tested baseline, the Next.js 16.3.5 starter's compatible React/TypeScript baseline, Tailwind v4, Radix Nova shadcn primitives, Zod, React Hook Form, Sonner, next-themes, Vitest, Playwright, ESLint and Prettier. Pin resolved direct dependencies and commit the lockfile when commits are requested.

Select WordPress 7.1.1 with PHP 8.3 and MariaDB 11.8.9 for local development. This resolves local setup only; production parity remains a DEC-107 hosting check. Libraries needed by the full registry are installed as requested; no speculative app database/auth/email SDK is added.

## Verification evidence

T-023 covers scaffold checks. T-014/T-021 receive only partial evidence from configuration and Docker checks; full CMS credential/publication and persistence integration coverage still belongs to SPEC-001.

| Check                   | Evidence (2026-09-19)                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency installation | `pnpm install --frozen-lockfile` passed; all direct versions are exact; one lockfile                                                                  |
| Source/build gate       | `pnpm verify` passed: lint, types across all 61 UI modules, 12 unit tests, format check, production build                                             |
| Browser checks          | `pnpm test:e2e:run` passed against that build: 2 Chromium tests, placeholder/hydration and HTTP 404                                                   |
| Dependency audit        | `pnpm audit` passed with no known vulnerabilities reported at verification time                                                                       |
| Compose                 | `pnpm docker:config` and `pnpm docker:up` passed; both containers healthy; installer HTTP 200 at localhost:8080                                       |
| Local persistence       | Restart and recreation preserved the wp-config.php SHA-256; services returned healthy. Full installed-content/database restore tests remain pending.  |
| Local secret safety     | Repeated `pnpm setup:env` preserved existing file hash; Git exclusions verified; 13 built browser assets checked without exposing local secret values |
| Documentation           | 128 relative links/anchors checked; original draft hash unchanged; DESIGN and CI_CD remain zero bytes; GitHub PR skill validator passed               |

## Completion record

Verified on Windows with Node 24.13.0, pnpm 10.30.2, Docker Engine 29.4.1, and Compose 5.1.3. Local WordPress/MariaDB remain running; complete the WordPress installer to choose your local account. No CMS content, live email, auth provider, production hosting, or full backup/restore path was exercised.

No commits, pushes, or branch changes were made. The ignored `.scaffold` directory holds temporary generator output because automatic approval review blocked its cleanup; it is excluded from tooling and Git. It is not needed to run the application.
