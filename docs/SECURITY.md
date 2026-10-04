# Security and privacy

The October 4 owner plan makes application-owned MySQL content and filesystem media the current trust boundary. See [SPEC-008](specs/008-wordpress-removal.md).

Google OAuth requires `email_verified=true` and an exact normalized server allowlist match. There is no public signup or client-controlled role. Sessions last eight hours; the first release has one administrator permission level. Every protected server operation checks authorization, including media search and mutation actions. Hosted sign-in and denied-account acceptance remain mandatory gates.

Database, Google, session and operations credentials stay server-only. No secrets in browser bundles, public variables, responses, logs or Git. Keep migration snapshots/backups and real environment settings outside Git. API masked values cannot be reused as credentials. Stage/live/test credentials and media directories are separate; routine tests target explicitly guarded disposable storage.

Use bound SQL parameters, schema validation, optimistic revisions and transactions. Image uploads validate bytes/signatures, per-file and aggregate limits. Text/captions are escaped; imported HTML passes sanitization. Public queries exclude unpublished/trash content. File delivery validates both path segments and realpath containment, sets nosniff, safe disposition and sandbox policy. Redirect targets are same-origin paths.

Fresh backups, persistent account media, secure production OAuth/root callback and actual hosted sign-in gate deletion. Application rollback preserves new content and uploads. Retire obsolete WordPress integration credentials only after production acceptance and verified recovery backups. The Hostinger operations token remains needed by preview CI and must not be revoked as a WordPress credential.

Inquiry delivery remains deferred; no message submission, retention period, abuse provider or email guarantee is implied.
