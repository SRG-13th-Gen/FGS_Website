# Feature specification index

SPEC-001 through SPEC-005 remain **Draft outline / Unimplemented**. [SPEC-006: repository scaffold](006-repository-scaffold.md) records the accepted developer foundation and its verification. Create remaining feature documents from [_TEMPLATE.md](_TEMPLATE.md) when each feature is being specified, then link its implementation evidence here.

Common sources: [requirements](../FRS_NFRS.md), [contracts](../DATA_API_CONTRACTS.md), [decisions](../DECISIONS.md), [workflow](../SPEC_WORKFLOW.md), and [test matrix](../TESTING.md). Cross-cutting requirements may apply to more than one feature.

## SPEC-001 CMS foundation

- Scope: local CMS/database topology, toolchain bootstrap, public CMS adapter, content ownership and secret boundaries.
- Requirements: FR-001, FR-002, NFR-001, NFR-002, NFR-005, NFR-008, NFR-009.
- Dependencies: DEC-101/102 and early DEC-107 hosting verification; decide approved CMS content/rendering policy through DEC-108.
- Planned evidence: T-001, T-002, T-014, T-015, T-018, T-021, T-022. Production restoration evidence follows when an environment exists.

## SPEC-002 Public website

- Scope: approved school information pages, announcement list/detail, public metadata, accessible presentation and failure states.
- Requirements: FR-003, FR-004, FR-015, NFR-003, NFR-004, NFR-005.
- Dependencies: SPEC-001, designer-owned DESIGN, DEC-108/112, and SPEC-004 for release freshness behavior.
- Planned evidence: T-003, T-004, T-013, T-016, T-017, T-018.

## [SPEC-003 Team admin & article management](003-team-admin.md)

- Scope: client `/admin` dashboard, article authoring (title, category: Clubs/Events/Announcements, body, pictures with captions), team sessions/roles, media upload, safe result reporting.
- Requirements: FR-005, FR-006, FR-007, FR-008, NFR-001, NFR-002, NFR-003, NFR-005, NFR-007.
- Dependencies: SPEC-001, DEC-103/104/111; integrate SPEC-004 invalidation.
- Planned evidence: T-005, T-006, T-007, T-014, T-015, T-016, T-020.

## SPEC-004 Content revalidation

- Scope: authenticated CMS events, team mutation refresh, cache dependency mapping, withdrawal/slug changes and failure recovery.
- Requirements: FR-009, NFR-004, NFR-005, NFR-007.
- Dependencies: SPEC-001/002 resource mapping, DEC-105/107; integrate team writes from SPEC-003.
- Planned evidence: T-008, T-017, T-020.

## SPEC-005 Inquiries

- Scope: contact form, validation, abuse controls, delivery adapter, duplicate handling and privacy; no attachments or automatic visitor replies proposed.
- Requirements: FR-010, FR-011, FR-012, FR-013, FR-014, NFR-002, NFR-003, NFR-005, NFR-006, NFR-007.
- Dependencies: public contact page, DEC-104/106, inquiry-specific DEC-110 privacy/operational ownership; designer supplies form states.
- Planned evidence: T-009, T-010, T-011, T-012, T-015, T-016, T-019, T-020.

## SPEC-006 Repository scaffold

- [Accepted specification and verification](006-repository-scaffold.md).
- Scope: application/toolchain, full shadcn primitives, local Docker services, environment safety and quality checks; custom design remains designer-owned.
- Requirements: NFR-001 (configuration only), NFR-008, NFR-009 (local/toolchain only).
- Evidence: T-023 plus partial T-014/T-021; product integration tests remain pending.
