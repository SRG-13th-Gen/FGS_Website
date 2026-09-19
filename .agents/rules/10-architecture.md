# Architecture rules

Read [ARCHITECTURE.md](../../docs/ARCHITECTURE.md), the affected requirements, and contracts before changing boundaries.

- Keep one Next.js application with public and team admin surfaces. Server entry points call validated, authorized operations and adapters.
- WordPress remains the public content/media authority. Use API resource IDs; caches are disposable delivery copies, not another CMS.
- Do not query or modify WordPress tables from the application. Keep any app-owned tables separate and justified by accepted requirements.
- Keep privileged CMS/email/auth integration behind server-only modules. Browser components must not construct authenticated upstream requests.
- Distinguish completed CMS writes from failed cache refreshes. Recover refresh independently instead of replaying writes.
- Verify the chosen hosting/runtime/cache model before adopting deployment-dependent behavior. Docker remains local-only.

When a boundary changes, update the architecture, contracts, affected requirements, and decision record together. Do not add services, queues, databases, or custom content types merely because they might be useful later.
