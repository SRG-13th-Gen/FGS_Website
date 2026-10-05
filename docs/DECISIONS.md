# Decision register

Approval and implementation are separate. Current choices come from owner instructions; evidence lives in feature specs and operational docs. Earlier IDs are retained without reusing them.

## Current decisions

| ID      | Accepted choice                                                                                                                                          | Basis / evidence                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| DEC-007 | Typed work branches → staging → production main                                                                                                          | Owner branch-flow choice; repository Git rules                                   |
| DEC-009 | Next.js scaffold and shadcn primitives; custom school composition remains designer-owned                                                                 | September 19 instruction; source and DESIGN                                      |
| DEC-010 | Preserve the school visual system and brand tokens                                                                                                       | September 20 instruction; DESIGN                                                 |
| DEC-101 | pnpm 10.30.2, one lockfile and exact direct dependencies                                                                                                 | Toolchain selection; package.json                                                |
| DEC-103 | Google verified-email allowlist, eight-hour encrypted JWT sessions, no signup                                                                            | September 26 plan; hosted sign-in verified October 4                             |
| DEC-109 | Vitest, Playwright, ESLint, Prettier and TypeScript                                                                                                      | Toolchain selection; TESTING                                                     |
| DEC-111 | One administrator permission level                                                                                                                       | September 26 plan; extra roles deferred                                          |
| DEC-115 | Seven fixed section editors; arbitrary page-layout editing excluded                                                                                      | September 20 instruction; SQL ownership now governed by DEC-118                  |
| DEC-117 | PRs/checks for staging; independent approval for main; protect integration branches                                                                      | September 27 instruction, strengthened October 4; CI_CD                          |
| DEC-118 | Application owns MySQL content and persistent uploads; replace WordPress, keep design/admin, isolate staging/live data, publish all five legacy articles | October 4 implementation plan; SPEC-008 and verified launch/recovery             |
| DEC-119 | Pushes to staging deploy preview; main/master deploy production                                                                                          | October 4 instruction; staging automation verified, production promotion pending |
| DEC-120 | Require the named quality check on both branches; run schema migrations before managed publication                                                       | October 4 instruction; branch settings and staging deployment verified           |

DEC-118 replaces an incorrectly duplicated DEC-115 heading in earlier migration documentation. The original DEC-115 remains the section-editor decision. No historical identifier is reused.

## Superseded decisions

| ID      | Earlier choice                                                 | Replacement                                                                   |
| ------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| DEC-001 | Headless WordPress + Next.js/admin                             | DEC-118                                                                       |
| DEC-002 | WordPress owns content/media; no direct app SQL                | DEC-118                                                                       |
| DEC-003 | Dedicated WordPress Application Password account               | DEC-118; database/auth credentials remain server-only                         |
| DEC-004 | Local WordPress/database Docker                                | DEC-118; Docker now local MariaDB only                                        |
| DEC-005 | App database conditional                                       | DEC-118; mysql2 and SQL migrations implemented                                |
| DEC-006 | V1 included inquiry delivery; public search/analytics deferred | Delivery portion deferred by October 4 plan; search/analytics remain deferred |
| DEC-008 | Docs-only scaffold; DESIGN/CI_CD initially empty               | DEC-009/010/119                                                               |
| DEC-102 | Local WordPress/PHP/MariaDB topology                           | DEC-118; MariaDB remains local database                                       |
| DEC-104 | Application storage requires future justification              | Content storage resolved by DEC-118; inquiry/audit storage remains undecided  |
| DEC-105 | WordPress webhook and 60-second cache fallback                 | Dynamic reads and mutation refresh in SPEC-004                                |
| DEC-108 | Curated initial WordPress posts and retained CMS               | DEC-118; all five original articles are published                             |
| DEC-113 | Preview-only deployment; production automation deferred        | DEC-119/120; rollback remains manual                                          |
| DEC-116 | Retain independent CMS during preview/cutover                  | Migration completed; both WordPress sites retired after acceptance            |

The [conceptual draft](conceptual/IMPLEMENTATION_PLAN.md) and Git history retain original context. [SPEC-008](specs/008-wordpress-removal.md) retains migration evidence and accepted limits: 20 photos, 10 MB per file, 60 MB aggregate new uploads and image-only articles.

## Open, proposed and deferred

| ID      | Status                         | Remaining decision                                                                                                                                                                                                                                       |
| ------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-106 | Proposed; delivery deferred    | Inquiry provider, recipient, sender verification, abuse controls, duplicate handling and privacy                                                                                                                                                         |
| DEC-107 | Resolved technical feasibility | Hostinger Node 24, Google sign-in, persistent storage, isolation and recovery verified at launch; operations targets remain DEC-110                                                                                                                      |
| DEC-110 | Open                           | Assign backup/incident/monitoring ownership; agree retention, data location and recovery targets                                                                                                                                                         |
| DEC-112 | Proposed                       | Formal WCAG 2.2 AA and numeric reliability/performance targets require approval and measurement                                                                                                                                                          |
| DEC-114 | Deferred                       | Public search, analytics, arbitrary page-layout editing and content types beyond accepted needs                                                                                                                                                          |
| DEC-121 | Proposed                       | Amends DEC-115: the product has `/alumni` and `/pta` pages and eight fixed section editors (Alumni added). Basis: October 5 client instructions and owner plan approval; accept when the owner confirms ([SPEC-009](specs/009-alumni-pta-animations.md)) |

DEC-121 is implemented in code but remains **Proposed**: it amends DEC-115 (seven fixed section editors) and the one-page scope under FR-002/003/004. DEC-115 stays the recorded decision until DEC-121 is accepted. Its open confirmations are listed in SPEC-009 (client: feed exclusion, legacy URLs; designer: pill colours, achievement card, motion values, page header treatment, Announcements colour).

Inquiry delivery, additional roles and visitor accounts are not implemented. Do not invent retention periods, provider guarantees or SLAs. Update requirements, contracts and evidence together when resolving a decision.
