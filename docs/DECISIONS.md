# Decision register

Decision status and implementation status are separate. **Accepted** entries establish intent; they do not claim working software. **Proposed** entries need acceptance before implementation. **Open** entries identify information still required. **Deferred** entries are intentionally postponed.

All initial entries were recorded 2026-09-19. Accepted sources are the preserved [draft](conceptual/IMPLEMENTATION_PLAN.md) and the owner's documentation-scaffold instructions. Roles below identify who should resolve decisions; named owners are not yet assigned.

## Accepted decisions

| ID      | Decision                                                                                                                   | Acceptance basis                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| DEC-001 | Headless WordPress with a Next.js App Router public site and team `/admin`                                                 | Initial draft, sections 1-2                                                                             |
| DEC-002 | WordPress owns public content/media; API access only; no app content mirror or direct CMS SQL                              | Initial draft, sections 1, 5-6                                                                          |
| DEC-003 | Privileged WordPress calls run server-side using a dedicated Application Password account                                  | Initial draft, sections 8 and 10                                                                        |
| DEC-004 | Docker supports local WordPress/database development only; Hostinger is the production target                              | Initial draft, sections 3 and 11; hosting product not selected                                          |
| DEC-005 | Use the draft's stack; app database and Drizzle remain conditional                                                         | Initial draft, sections 4 and 12                                                                        |
| DEC-006 | V1 specification includes public site, team admin, and inquiry forms; search and analytics deferred                        | Owner's planning answers and implementation request                                                     |
| DEC-007 | Typed work branches -> staging -> production main                                                                          | Owner's branch-flow choice; local initial branch is main                                                |
| DEC-008 | DESIGN and CI_CD remain empty; preserve conceptual draft; initial change limited to docs/workflow instructions             | Initial owner implementation request; docs-only scope superseded by DEC-009                             |
| DEC-009 | Build the repository scaffold and install the full official shadcn component set; designer still creates custom components | Owner instruction 2026-09-19 delegates supporting library/tooling choices; implemented through SPEC-006 |
| DEC-010 | Visual design system, brand tokens (#54B435 green, #eada2b yellow), and custom component specifications documented         | Owner instruction 2026-09-20; documented in DESIGN.md and FRONTEND.md                                  |
| DEC-101 | pnpm 10.30.2 with one lockfile and exact direct dependency versions                                                        | Engineering selection under DEC-009; available and tested local toolchain                               |
| DEC-102 | Local WordPress 7.1.1/PHP 8.3 with MariaDB 11.8.9; Docker local-only                                                       | Engineering selection under DEC-009; production engine parity still requires DEC-107                    |
| DEC-109 | Vitest for isolated logic; Playwright for production browser smoke tests; ESLint/Prettier/TypeScript checks                | Engineering selection under DEC-009; actual commands in TESTING and package.json                        |

## Proposed decisions

Acceptance is still pending for every entry in this section. Detailed comparisons are in [TECH_STACK.md](TECH_STACK.md); behavior is in [FRS_NFRS.md](FRS_NFRS.md).

| ID      | Preferred proposal                                                                                  | Remaining decision / evidence                                                                                                                                                               | Responsible role                |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| DEC-103 | Invite-only managed OIDC team login through an established library                                  | Provider/library, team enrollment/revocation, MFA, session lifetime, and role mapping                                                                                                       | Technical lead with owner       |
| DEC-104 | Minimal application storage only when justified                                                     | Audit durability/retention, session needs, shared idempotency/rate-limit storage, engine and migrations                                                                                     | Technical lead                  |
| DEC-105 | Authenticated content events and explicit cache recovery                                            | Webhook producer, event schema, retry/replay policy, expiry, withdrawal freshness, multi-instance behavior                                                                                  | Technical lead with editors     |
| DEC-106 | Transactional inquiry email API; no app storage of message bodies, attachments, or auto-replies     | Provider, recipient, sender/domain verification, reply-to policy, field/size limits, quotas, spam control, ambiguous delivery reconciliation and retention across provider/mailbox/metadata | School owner with engineering   |
| DEC-108 | Home, About, Admissions, Programs, Announcements, Contact                                           | Final sitemap, navigation, content inventory, category labels, Gutenberg block allowlist; school content approval                                                                           | School owner with designer      |
| DEC-111 | Admin/Editor/Viewer roles with least privilege; trash instead of permanent deletion in custom admin | Final permission matrix, audit events and editor workflow                                                                                                                                   | Owner with engineering          |
| DEC-112 | WCAG 2.2 AA as proposed accessibility target; explicit reliability/performance budgets              | Owner acceptance, device/browser scope, measurement setup and numeric targets                                                                                                               | Owner with designer/engineering |

## Open and deferred decisions

| ID      | Status   | Question / completion evidence                                                                                                                                                             | Responsible role              |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| DEC-107 | Open     | Which Hostinger product supports the required Node runtime, server endpoints, caching, image handling, secrets, TLS, and CMS/database? Record a capability check before deployment design. | Technical lead                |
| DEC-110 | Open     | Who owns backups, restoration, monitoring, incident response, domain management and school privacy approval? Specify recovery targets, retention, data location and launch evidence.       | School owner with engineering |
| DEC-113 | Deferred | CI/CD, branch-protection configuration, staging environment, deployment/rollback automation                                                                                                | Engineering                   |
| DEC-114 | Deferred | Search, analytics, migration procedure, custom content types beyond accepted needs, and advanced admin page/block editing                                                                  | Product owner                 |

Deferred does not mean permanently excluded. Migration planning becomes a launch dependency if existing content must be moved. Manual release/rollback and recovery readiness are still required if automation remains deferred.

## Updating decisions

For an accepted proposal, retain its ID and record the chosen alternative, rationale, named approver, date, and link to durable approval evidence (issue, PR, or recorded owner instruction). Update requirements and contracts together. Supersede earlier choices explicitly; do not erase their history or mark every proposal accepted merely because the documentation was merged.
