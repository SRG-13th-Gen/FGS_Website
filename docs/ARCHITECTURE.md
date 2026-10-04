# Architecture

The owner's October 4, 2026 instruction replaces the headless WordPress architecture. [SPEC-008](specs/008-wordpress-removal.md) governs migration; the conceptual draft is historical.

## Ownership and topology

One Next.js 16 application serves public pages, news detail, media, legacy redirects and Google-authenticated admin. Server-only `src/lib/content` owns editable content through mysql2. MySQL holds structured section JSON, articles, ordered article photos, revisions, media metadata and legacy URL mappings. Upload bytes live outside deployments in environment-specific account storage.

Staging and production have separate databases, users, passwords and storage roots. Neither environment reads or writes the other's content. Docker is local MariaDB only. Hostinger Node 24 is the deployment target. SSH access and outside-site directories were verified on October 4; managed application access and restart/redeploy persistence must also pass before launch.

## Reads and writes

Public reads query published articles dynamically, with no persistent content cache. Section defaults preserve presentation during outages. Missing articles and database failures are distinct results. React `cache` deduplicates section reads within a render only.

Every protected server entry authorizes the current verified, allowlisted Google session. Inputs pass server validation; IDs and SQL search parameters are bounded. Article/image mutations use transactions. Article and section revisions reject stale saves. Articles are soft deleted; create mutation keys make retries idempotent. A completed mutation with a failed route refresh is reported as saved with a warning.

Media upload validates file signatures and size, hashes bytes, writes immutable files and reuses identical uploads. Delivery validates path segments and real paths, preventing traversal and symlink escape. Image library membership is independent of public Gallery membership; resized imported variants are hidden from the picker.

## Migration and recovery

Offline tools export both WordPress inventories, prioritize the newer CMS sections, normalize nested galleries/cover blocks and import checksum-verified bytes. Existing source identifiers are not overwritten on reruns, preserving admin edits. Reconciliation reports count conversions, duplicates and missing references.

Release archives contain application source, migrations and the lockfile, never secrets or migration snapshots. Application rollback preserves the content database and media. Initial root cutover rollback restores the fresh original WordPress files and database. See [DEPLOYMENT](DEPLOYMENT.md).
