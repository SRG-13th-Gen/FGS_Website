# Testing and verification

Status: executable scaffold checks now exist under SPEC-006. Product scenarios T-001 through T-022 remain planned except where partial evidence is explicitly recorded; T-023 tracks the developer foundation. CI/CD is not configured. Do not report scaffold checks as complete product coverage.

## Available commands

| Command              | Coverage                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm lint`          | Next.js/TypeScript/React lint rules across maintained source                                 |
| `pnpm typecheck`     | Next.js route type generation plus strict TypeScript, including every installed UI primitive |
| `pnpm test`          | Server environment safety and registry subscription regression checks                        |
| `pnpm test:coverage` | Unit checks with V8 coverage (currently environment schema)                                  |
| `pnpm format:check`  | Prettier/Tailwind formatting; historical draft and empty placeholders excluded               |
| `pnpm build`         | Production Next.js build without network fonts or CMS access                                 |
| `pnpm verify`        | Lint, types, unit tests, formatting and production build                                     |
| `pnpm test:e2e`      | Build then Chromium smoke tests against a dedicated production server on port 3100           |
| `pnpm test:e2e:run`  | Reuse an already-built artifact for browser tests; does not rebuild                          |
| `pnpm docker:config` | Quiet Compose validation after `pnpm setup:env`                                              |

Install the browser once with `pnpm exec playwright install chromium`. The browser test runner manages its own server, refuses to reuse an unknown process, and stores failures under ignored report/trace directories. It does not start the CMS or send email. Current tests are [environment](../tests/unit/environment.test.ts), [UI subscriptions](../tests/unit/ui-subscriptions.test.ts), and [browser smoke checks](../tests/e2e/scaffold.spec.ts).

## Verification layers

- Documentation changes: validate links, status/authority consistency, requirement references, and whitespace; preserve the intentionally empty placeholders.
- Pure logic: use installed Vitest for validation and isolated behavior; add permission/adapter tests as those features are implemented.
- Integration: exercise CMS adapters against controlled fixtures and, when available, disposable local WordPress. Include failure and permission paths.
- Browser workflows: extend the installed Playwright scaffold suite for public content, admin, and inquiries; include keyboard, error, and responsive states. Real email sends are not a default test action.
- Operations: verify local volumes/networking, production capability assumptions, restore, rollback, and approved performance/freshness targets when environments exist.

Inspect actual manifests before running checks. Run checks proportional to the changed behavior and record exact commands, results and limitations. Product criteria still require their own tests; passing the scaffold suite does not implement them.

Implementation references consulted 2026-09-19: [Next.js with Vitest](https://nextjs.org/docs/app/guides/testing/vitest), [Next.js with Playwright](https://nextjs.org/docs/app/guides/testing/playwright), and [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Tool selection is accepted in DEC-109; the formal accessibility target remains proposed.

## Requirement-to-scenario matrix

Feature definitions are in the [feature index](specs/README.md). This table is the initial traceability plan. Replace pending evidence with test paths and run/PR references as implementation arrives.

| Test ID | Requirements              | Scenario / expected observation                                                                                                                                                       | Feature                      | Evidence                                                                                                                   |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T-001   | FR-001                    | Inspect persistence boundaries; CMS resource reads/writes use REST; no editable content mirror or CMS SQL                                                                             | SPEC-001                     | Not run                                                                                                                    |
| T-002   | FR-002                    | Publish fictional content through native WordPress and consume it from the application                                                                                                | SPEC-001                     | Not run                                                                                                                    |
| T-003   | FR-003                    | Approved information page, missing page, CMS outage, and empty content produce distinct correct states                                                                                | SPEC-002                     | Not run                                                                                                                    |
| T-004   | FR-004                    | Published-only listing/detail, pagination, invalid page values, draft/private exclusion, and missing media                                                                            | SPEC-002                     | Not run                                                                                                                    |
| T-005   | FR-005, FR-006            | Anonymous, expired/revoked session, unknown role, and each matrix role attempt reads/writes directly at server entry points                                                           | SPEC-003                     | Not run                                                                                                                    |
| T-006   | FR-007                    | Draft creation, editing, publication, withdrawal, trash, concurrent edits, and uncertain CMS write outcome without duplicate creation                                                 | SPEC-003                     | Not run                                                                                                                    |
| T-007   | FR-008                    | Category create/edit and media upload/select; invalid type/size and unauthorized requests cause no write                                                                              | SPEC-003                     | Not run                                                                                                                    |
| T-008   | FR-009, NFR-005           | Team and native CMS edits invalidate dependencies; invalid secret is rejected; duplicate event harmless; old/new slug and withdrawal/deletion refresh; saved-but-refresh-failed state | SPEC-003, SPEC-004           | Not run                                                                                                                    |
| T-009   | FR-010, FR-011            | Valid inquiry reaches stub; missing/invalid/oversized/header-injection inputs never send; client bypass still validates server-side                                                   | SPEC-005                     | Not run                                                                                                                    |
| T-010   | FR-012                    | Approved rate-limit boundary, concurrent clients, bot rejection, inaccessible-control fallback, and unavailable required abuse configuration                                          | SPEC-005                     | Not run                                                                                                                    |
| T-011   | FR-013, NFR-005           | Provider accepted, rejected, timed out, and accepted-before-timeout cases; no false delivery claim or blind repeat send                                                               | SPEC-005                     | Not run                                                                                                                    |
| T-012   | FR-014                    | Concurrent same-key/same-content requests across workers and restart yield one provider submission; changed content conflicts; expiry and ambiguous recovery follow approved policy   | SPEC-005                     | Not run                                                                                                                    |
| T-013   | FR-015                    | Canonical public URLs, metadata, sitemap entries, and exclusion of private/admin resources                                                                                            | SPEC-002                     | Not run                                                                                                                    |
| T-014   | NFR-001                   | Inspect browser assets, responses, environment exposure, and logs for seeded fake secrets; authenticated production CMS transport uses HTTPS                                          | SPEC-001, SPEC-003           | Partial: environment tests and browser asset secret scan in SPEC-006; privileged CMS flow pending                          |
| T-015   | NFR-002                   | Malicious CMS HTML/URLs/uploads, forged origin, privilege escalation, and direct server calls are rejected or safely rendered                                                         | SPEC-001, SPEC-003, SPEC-005 | Not run                                                                                                                    |
| T-016   | NFR-003                   | Keyboard/focus, labels, error announcements, contrast, responsive layouts and reduced motion against accepted accessibility scope                                                     | SPEC-002, SPEC-003, SPEC-005 | Not run                                                                                                                    |
| T-017   | NFR-004                   | Representative page/cache measurements against accepted budgets; blocked until targets and environment are defined                                                                    | SPEC-002, SPEC-004           | Not run                                                                                                                    |
| T-018   | NFR-005                   | CMS failure at uncached and cached reads; no fabricated not-found; stale/removal handling meets accepted policy                                                                       | SPEC-001, SPEC-002           | Not run                                                                                                                    |
| T-019   | NFR-006                   | No message/email leakage in logs; recipient tampering fails; storage/provider/mailbox retention configuration and privacy notice reviewed                                             | SPEC-005                     | Not run                                                                                                                    |
| T-020   | NFR-007                   | Safe correlated operation outcomes and actor attribution; no credentials or inquiry content in audit records                                                                          | SPEC-003, SPEC-004, SPEC-005 | Not run                                                                                                                    |
| T-021   | NFR-008, NFR-009          | Host-to-CMS and container-to-host connectivity, health/readiness, and persistent uploads/database after restart                                                                       | SPEC-001                     | Partial: Compose health, installer HTTP, configuration persistence verified; installed-content and callback checks pending |
| T-022   | NFR-009                   | Restore CMS database/media and rehearse application rollback in an isolated environment against accepted recovery objectives                                                          | SPEC-001                     | Not run                                                                                                                    |
| T-023   | NFR-001, NFR-008, NFR-009 | Repository scaffold: dependency/type/build checks, safe environment parsing, generated UI subscriptions, browser smoke checks and local Docker setup                                  | SPEC-006                     | Passed 2026-09-19; exact evidence and scope in SPEC-006                                                                    |

## Fixtures and side effects

Use fictional school content and synthetic contact details. Default automated tests use CMS/email doubles; opt-in integration tests use disposable local resources or an approved sandbox. Tests must not change production content, email real recipients, or erase persistent local volumes without explicit scope authorization.

Test observable behavior and trust boundaries rather than duplicating implementation details or snapshotting prose. Do not weaken validations or test expectations to hide failures. Use official documentation matching locked versions for framework-specific behavior.

## Completion evidence

Each feature spec records requirement IDs, test IDs, actual test paths, exact commands, results, environment/version information where relevant, and outstanding limitations. A feature is not **Verified** until its accepted criteria have evidence. Manual design/privacy/operational checks remain explicit when automation cannot establish them.

CI/CD implementation stays deferred. A missing pipeline does not waive applicable local verification or launch-readiness checks.
