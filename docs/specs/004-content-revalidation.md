# SPEC-004: Content refresh

The owner-approved October 4 migration supersedes the former WordPress event/webhook mechanism. See [SPEC-008](008-wordpress-removal.md).

Public homepage and news detail read the database dynamically without persistent content caches. Admin mutations refresh affected public/admin paths. A successful database save followed by a failed refresh is still a completed save, with a warning; do not replay it.

The former revalidation endpoint, secret, WordPress producer and TTL policy are retired. React render deduplication is not a persistent cache. Verification covers completed-save/failed-refresh behavior and published-only dynamic reads.
