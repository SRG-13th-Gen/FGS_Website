# SPEC-004 Content revalidation

| Field          | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Approval       | Accepted for the Hostinger launch plan, 2026-09-26 (DEC-105)                    |
| Implementation | Local code implemented; hosted WordPress delivery and cache behavior unverified |
| Requirements   | FR-009, NFR-005; NFR-004 budgets still open                                     |
| Owners         | Engineering and school editors                                                  |

## Contract

WordPress remains the content authority. The version-controlled must-use plugin sends a server-to-server HTTPS `POST /api/revalidate` after relevant post, section-page, category, and media changes. The event has a `kind`, positive integer `id`, and old/new slugs for affected posts/pages when available. `X-FGS-Revalidation-Secret` authenticates the request. The endpoint never accepts caller-supplied cache paths, tags, or upstream URLs. It validates events, expires affected public data tags immediately, and invalidates the homepage and relevant old/new article paths. Section school-info and media changes also invalidate article detail rendering. Duplicate events are safe.

The producer does not fail a WordPress save if delivery fails. Public WordPress reads expire after 60 seconds as a fallback. A `503` from the endpoint signals a retryable cache failure; the current producer does not queue automatic retries. Manual recovery is to correct the webhook configuration and resend a valid event or wait for fallback expiry. A response confirms cache invalidation, not that a visitor already received regenerated HTML.

## Security and configuration

Set `FGS_REVALIDATION_URL` and `FGS_REVALIDATION_SECRET` privately in the CMS copy's `wp-config.php`; set the same secret as `REVALIDATION_SECRET` in each target Next.js environment. Use HTTPS and never put the secret in Git, a query string, or the browser. The CMS copy may send to preview during preview acceptance, then switch to the root after cutover. Hostinger's environment replacement requires the whole variable set on each update.

## Evidence and remaining work

- `tests/unit/revalidation-event.test.ts`: old/new slugs, path validation, media/school-info dependencies.
- `tests/integration/revalidate-route.test.ts`: unauthorized and malformed requests, immediate tag/path invalidation, retryable failure.
- `pnpm verify` and `pnpm test:e2e` verify local integration/build only; record exact run results in [TESTING.md](../TESTING.md).
- On preview, test native publication, slug rename, withdrawal/trash, section edit, category change, and media change against live WordPress. Verify HTTP 401/400 behavior and cache freshness on the actual Hostinger runtime. Test missing article behavior after withdrawal. Multi-instance invalidation and explicit freshness/performance budgets remain unverified.

WordPress hooks were checked against [the after-insert hook](https://developer.wordpress.org/reference/hooks/wp_after_insert_post/), [post deletion hook](https://developer.wordpress.org/reference/hooks/before_delete_post/), and [category edit hook](https://developer.wordpress.org/reference/hooks/edited_terms/) on 2026-09-26. The installed Next.js revalidation behavior was checked in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md` and `revalidatePath.md`.
