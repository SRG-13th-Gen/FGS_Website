# Architecture

Status: accepted high-level boundaries from DEC-001 through DEC-005. Public WordPress reads, admin writes, Google OAuth authorization code, and CMS event revalidation code are implemented locally. The independent Hostinger preview's public Node routes passed partial smoke checks; hosted identity, CMS copy, live cutover, and inquiries remain unverified or unfinished.

## Accepted system boundaries

```text
School staff -> WordPress /wp-admin -> WordPress content + media
Visitors -> Next.js public routes -> WordPress REST API (public reads)
Team -> Next.js /admin -> authorized server operations -> WordPress REST API
WordPress content events -> authenticated Next.js revalidation endpoint
```

WordPress is the sole authority for posts, pages, categories, and media. Next.js caches are disposable delivery copies, not independently editable content stores. Next.js must neither query nor modify WordPress tables directly. The CMS owns its own database schema and user accounts.

| Boundary               | Responsibility                                                           | Must not own                                  |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| Public Next.js routes  | Content presentation, metadata, inquiry UI                               | CMS credentials or unpublished content        |
| Next.js server         | CMS adapter, team authorization, revalidation, proposed inquiry delivery | A second editable CMS                         |
| WordPress              | Editorial content, Gutenberg, media, school editor accounts              | Team application sessions                     |
| Optional app storage   | Only approved application-owned data                                     | Copies of CMS posts, pages, media, categories |
| Proposed email adapter | Deliver visitor inquiries to configured school recipients                | Public content or team authorization          |

## Proposed module boundaries

Use one Next.js application. Public routes, `/admin`, and server endpoints share server-only services without creating a second backend deployment. Route groups organize code; they do not authorize requests.

The application uses `src/app`, custom `src/components/public` and `src/components/admin` components, shadcn primitives in `src/components/ui`, and `src/lib/env`. CMS transport and content mapping are in `src/lib/wordpress`. `src/lib/auth` holds Google OAuth options, exact email allowlisting, and the admin guard. `src/lib/revalidation` maps trusted WordPress events to cache dependencies. Inquiry delivery remains planned. Add `lib/db` only after an application storage requirement is accepted.

UI entry points call validated application operations; those operations authorize access and invoke adapters. Components must not assemble privileged WordPress requests. See [contracts](DATA_API_CONTRACTS.md) for the proposed interface boundary.

## Content and cache flow

Public reads use published WordPress resources and explicit cache policy. Admin reads and mutations are private and must not share public cache entries. Native Next.js `fetch` is the accepted integration baseline; the selected Next.js version must determine the exact caching APIs and configuration. Do not assume framework defaults provide ISR. See the [official caching guide](https://nextjs.org/docs/app/getting-started/caching) (consulted 2026-09-19).

Current team-write flow, with full event coverage still proposed:

1. Validate the request and authorize the team actor before a CMS call.
2. Write to WordPress and retain its resource ID/result.
3. Call `revalidatePath` for affected public routes. Native CMS category/media dependency mapping is in the authenticated webhook endpoint; hosted behavior remains to verify.
4. If invalidation fails after the write succeeds, report that content was saved but refresh is pending. Do not repeat the write to fix the cache.

The version-controlled WordPress must-use plugin emits post, section-page, category, and media events after edits. `/api/revalidate` checks a server-only shared secret, validates resource type/ID/slugs, and derives tags/paths itself. Old and new article slugs are invalidated; the public read cache retains a 60-second fallback if a webhook delivery fails. Hosted delivery, withdrawal freshness, and multi-instance behavior still need proof on preview.

During a CMS outage, distinguish unavailable content from a genuine missing page. A previously published cache may be used only within the approved freshness/removal policy. No draft or private data may enter public caches. Do not claim immediate removal of cached content until verified.

## Inquiry flow (proposed)

Visitor -> same-origin Next.js endpoint -> validation and abuse controls -> email adapter -> configured school mailbox. The browser never chooses the recipient or accesses provider credentials. An accepted provider request is not proof of mailbox delivery.

The proposed default stores no inquiry message bodies in the application database. Mailboxes and the delivery provider still retain data; their retention and access rules require a school decision. Reliable duplicate handling may need shared application metadata storage even if message bodies are not retained. DEC-104 and DEC-106 must resolve this before implementation.

## Hosting and environments

Accepted target: Next.js at `flordegraceschoolinc.com`, independent WordPress at `cms.flordegraceschoolinc.com`, plus Node preview at `preview.flordegraceschoolinc.com`, all on Hostinger. Docker is local-only. The active Business plan and root WordPress installation were inspected through the Hostinger MCP; new site provisioning, DNS, TLS, and secrets are unverified. See [DEPLOYMENT.md](DEPLOYMENT.md).

Before selecting a deployment procedure, prove that the chosen Hostinger product supports the selected Next.js runtime, server operations, cache persistence/invalidation, and image handling. Decide how caches and sessions behave if more than one application instance runs. Self-hosted runtime concerns are described in the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting) (consulted 2026-09-19); this is not evidence of a particular Hostinger plan's capabilities.

Local topology is specified in [DOCKER.md](DOCKER.md). A Git `staging` branch does not establish a staging environment. CI/CD design remains deferred in [CI_CD.md](CI_CD.md); hosting readiness is tracked in DEC-107.

## Related specifications

See [requirements](FRS_NFRS.md), [security](SECURITY.md), [decisions](DECISIONS.md), and the [feature index](specs/README.md). Backup/restore, observability, and release readiness must be specified before launch; numerical targets remain open.
