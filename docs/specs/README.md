# Feature specifications

| ID                                         | Scope                                                  | Current status                                                                   |
| ------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| SPEC-001                                   | Content/storage foundation                             | Earlier draft outline consolidated into SPEC-008 and architecture; ID reserved   |
| SPEC-002                                   | Public homepage, news and metadata                     | Implemented; requirements and frontend docs are current contracts                |
| [SPEC-003](003-team-admin.md)              | Google admin and article/media workflows               | Implemented; hosted acceptance recorded in SPEC-008                              |
| [SPEC-004](004-content-revalidation.md)    | Dynamic reads and mutation refresh                     | Implemented; old webhook/cache mechanism retired                                 |
| SPEC-005                                   | Inquiry submission                                     | Deferred; no delivery endpoint or provider selected                              |
| SPEC-006                                   | Initial repository scaffold                            | Historical record retired from active docs; retained in Git history; ID reserved |
| [SPEC-007](007-site-content-management.md) | Seven fixed section editors                            | Implemented with revision checks                                                 |
| [SPEC-008](008-wordpress-removal.md)       | Application content ownership and production migration | Completed October 4; migration/acceptance evidence retained                      |
| [SPEC-009](009-alumni-pta-animations.md)   | Alumni and PTA pages, admin areas and motion           | Proposed; unimplemented                                                          |

Use [requirements](../FRS_NFRS.md), [decisions](../DECISIONS.md), [contracts](../DATA_API_CONTRACTS.md) and [testing](../TESTING.md) for shared constraints. Create new feature specs from the [template](_TEMPLATE.md) using the [workflow](../SPEC_WORKFLOW.md). Do not reuse retired IDs.

## SPEC-002 Public website

One homepage with the accepted sections, published news detail routes, responsive presentation, canonicals, indexing controls and sitemap. Public article queries exclude unpublished/trash records; dependency outages show truthful unavailable states. Gallery membership is explicitly curated. See [frontend](../FRONTEND.md).

## SPEC-005 Inquiries

Delivery remains outside the implemented release. Validation, anti-abuse, recipient/provider, duplicate handling and privacy policy require acceptance before enabling submission. Displayed contact information does not imply an inquiry delivery service.
