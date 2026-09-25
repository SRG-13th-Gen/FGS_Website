# Technology stack

Status: the baseline is accepted from the initial draft. SPEC-006 implements the development foundation under the owner's delegated library choices. Product integration recommendations remain proposed where indicated in [DECISIONS.md](DECISIONS.md).

## Installed development baseline

The root `package.json` and `pnpm-lock.yaml` are the exact dependency authority. Node 24.13.0 and pnpm 10.30.2 are the tested toolchain, with Next.js 16.3.5, React 19.2.8, TypeScript 5.9.3, and Tailwind 4.3.3. Local Docker uses WordPress 7.1.1/PHP 8.3 and MariaDB 11.8.9.

The complete selected shadcn registry includes 61 UI modules and its supporting dependencies (including Radix, Base UI where used by upstream components, charts, calendar, carousel, drawer, panels, OTP and command primitives). React Hook Form, Zod and its form resolver, TanStack Table, Sonner, next-themes, and `server-only` support current and future custom components and server boundaries. See [FRONTEND.md](FRONTEND.md) and [DESIGN.md](DESIGN.md); full registry installation does not replace custom design.

Quality tooling: ESLint with Next.js rules, Prettier with Tailwind sorting, Vitest/V8 coverage, React Testing Library/jsdom, and Playwright Chromium. ESLint 9 is retained because the current Next.js plugin chain declares compatibility with it; ESLint 10 produced unsupported peer combinations. Upgrade that toolchain together when upstream plugins support it. jsdom 27.4.0 is compatible with the tested Node baseline; newer jsdom releases require a newer Node patch.

No auth provider, email SDK, ORM, application database, analytics, or global client-state library is installed speculatively. Native server fetching remains the chosen CMS access approach. Hosting compatibility is not established by a successful local build.

## Accepted baseline

| Area                  | Technology                                              | Intended use                                       |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Application           | Next.js App Router, React, TypeScript                   | Public site and custom team admin                  |
| Styling               | Tailwind CSS, shadcn/ui, Lucide React                   | Designer-directed styling, primitives, icons       |
| Forms                 | React Hook Form, Zod, Sonner                            | Form state, validation, notifications where useful |
| Content               | WordPress, Gutenberg, REST API, Media Library           | School-managed content and assets                  |
| CMS authentication    | WordPress Application Passwords                         | Dedicated server integration account               |
| Data access           | Native Next.js `fetch`; Server Actions / Route Handlers | Content reads and protected server operations      |
| Media/metadata        | Next.js Image and Metadata API                          | Public image delivery and search metadata          |
| CMS database          | MySQL or MariaDB                                        | Managed only by WordPress                          |
| Optional app database | MySQL or MariaDB; Drizzle if needed                     | Application-owned tables only                      |
| Runtime/tooling       | Node.js; npm or pnpm; GitHub                            | Development, dependencies, source control          |
| Local infrastructure  | Docker Compose                                          | WordPress and database only                        |
| Production target     | Hostinger                                               | Exact product/runtime to be verified               |

Do not add all optional dependencies speculatively. The designer owns visual choices; shadcn/ui is not a finished visual identity.

## Choices and alternatives

| Decision                              | Recommendation                                                                                           | Alternative and tradeoff                                                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-101 package manager (accepted)    | pnpm 10.30.2, one lockfile and exact direct versions                                                     | npm was viable; pnpm matches the available toolchain and isolates dependencies.                                                                                                                     |
| DEC-102 local CMS database (accepted) | MariaDB 11.8.9 for local WordPress                                                                       | MySQL is also within the original baseline. Production parity remains a hosting decision; local setup does not claim it.                                                                            |
| DEC-103 team identity                 | Established auth library with a managed OIDC provider and invite-only team access                        | Local passwords require recovery, credential storage, and session operations. WordPress identity reuse would couple school and team access policies. Provider/library selection remains open.       |
| DEC-104 application storage           | Introduce storage only for accepted audit, session, or duplicate-handling needs; no content mirror       | Adding a full app database immediately creates migrations and operations before requirements justify them. A provider-managed metadata store may suffice; consistency requirements must be checked. |
| DEC-105 revalidation                  | Authenticated content-event integration plus a documented recovery/fallback policy                       | Periodic refresh alone is simpler but weakens editorial freshness. Plugin versus small maintained WordPress integration remains open.                                                               |
| DEC-106 inquiry delivery              | Transactional email API through a server-only adapter; no attachments or automatic visitor replies in v1 | SMTP may suit the chosen hosting/mail service but needs equivalent result, retry, and duplicate semantics. Provider, costs, limits, and retention are not selected.                                 |
| DEC-109 testing tools (accepted)      | Vitest for isolated logic and Playwright for browser workflows; ESLint/Prettier/TypeScript gates         | Actual commands and test scope are recorded in TESTING; more product tests arrive with implementation.                                                                                              |

Recommendations are engineering judgments for this project. Official references: [pnpm motivation](https://pnpm.io/motivation), [Next.js authentication](https://nextjs.org/docs/app/guides/authentication), and [WordPress REST authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) (consulted 2026-09-19).

## Version and compatibility selection

The local toolchain now has exact direct dependency versions, a pnpm lockfile, Node version files, and explicit Docker image versions. For upgrades, review official release/migration notes and hosting compatibility, update manifest/lockfile and local image pins together as relevant, then run verification. Do not switch to a new major release solely because it is tagged latest.

Verify cache/revalidation behavior, auth integration, WordPress endpoints, and image hosts against the selected versions. Do not copy a current framework example into an older installed runtime without checking compatibility.

Hostinger MCP is optional operational assistance, not an application dependency. GitHub Actions remains a possible future CI/CD tool; no workflow is configured by this scaffold.
