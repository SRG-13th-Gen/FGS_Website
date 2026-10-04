# Architecture rules

Read [ARCHITECTURE](../../docs/ARCHITECTURE.md), [SPEC-008](../../docs/specs/008-wordpress-removal.md) and contracts.

- One Next.js application owns public content and admin.
- Use server-only mysql2 services and versioned SQL migrations; no WordPress runtime adapters.
- Separate staging/production databases, credentials and media roots.
- Media lives outside every deployment directory; verify managed app access and restart/redeploy persistence.
- Public content reads dynamically without persistent caches for this release.
- Authorize protected operations; validate inputs, sanitize output and parameterize queries.
- Use transactions and revisions; distinguish completed saves from refresh failures.
- Docker is local database development only. Preserve conceptual history, design and preview automation.
