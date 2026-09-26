# Delivery roadmap

Status: proposed delivery sequence, not a dated commitment. The public site, WordPress read adapter, section editors, and article management are implemented locally. The design document records the frontend system. A staging-to-preview workflow is prepared; GitHub environment key names exist, while branch protections, merge, and a hosted run remain. Production identity, role controls, native CMS event refresh, inquiries, and launch readiness remain open.

| Phase                             | Deliverable                                                                 | Prerequisites and exit evidence                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Specification baseline         | Review proposed v1 requirements and create focused feature specs            | Assign decision owners; accept blocking choices; designer supplies design; confirm school content inventory                                     |
| 1. Application and CMS foundation | Pinned Next.js toolchain, local CMS/database setup, server-only CMS adapter | SPEC-001 accepted; package/runtime/database choices resolved; hosting feasibility checked early; local persistence and API verification         |
| 2. Public website                 | Approved pages, announcements, metadata, responsive and accessible states   | SPEC-002 accepted; content and design available; published-only and dependency-failure behavior verified                                        |
| 3. Team administration            | Team login, authorization, announcement/category/media operations           | SPEC-003 accepted; DEC-103/104/111 resolved; denied operations tested before connecting write credentials                                       |
| 4. Content refresh                | Team mutation invalidation and native WordPress events                      | SPEC-004 accepted; DEC-105 resolved; old-slug, withdrawal, duplicate-event, and cache-failure checks pass                                       |
| 5. Inquiry forms                  | Validated, abuse-controlled inquiry delivery                                | SPEC-005 accepted; DEC-104/106/110 resolved for inquiry scope; privacy notice, sandbox delivery, duplicate and uncertain-outcome tests verified |
| 6. Launch readiness               | Verified hosting, production content, recovery and operating instructions   | DEC-107/110/112 resolved for launch; runtime/cache, backup/restore, rollback, accessibility and budget evidence; school content approval        |

Phases overlap in the current code: local work for phases 1–3 and SPEC-007 is present, while the accepted production identity and release checks are still outstanding. Public, admin, and inquiry specifications can be drafted independently. Full release acceptance depends on revalidation even though public pages are built. Resolve storage/identity decisions before creating optional application tables.

The source-control path is typed work branches -> staging -> main. The owner requested automatic staging-to-preview deployment under DEC-113 on 2026-09-27; [CI_CD.md](CI_CD.md) records the prepared workflow and pending setup. Production deployment and rollback automation remain deferred. A manual release/rollback procedure is still needed before launch.

Search, analytics, advanced custom-admin page/block editing, and additional content types remain deferred. If existing school content must migrate, activate migration planning before release. No enrollment, payments, or student-record system is included.

Track feature acceptance and evidence in the [feature index](specs/README.md) and feature documents, not by marking an entire phase done after documentation is written. The initial [conceptual draft](conceptual/IMPLEMENTATION_PLAN.md) is not a task checklist.
