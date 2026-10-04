# Security and privacy

## Identity and authorization

Google OAuth requires `email_verified=true` and an exact normalized server allowlist match. Sessions are encrypted JWTs lasting eight hours. There is one administrator permission level, no public signup and no client-controlled role. Protected pages/actions authorize independently, including media search and mutations; hidden controls and route redirects alone are insufficient.

Hosted Google sign-in and anonymous admin protection passed at launch. Authorization/session tests and denied-callback browser checks provide additional evidence; rerun hosted identity checks when auth configuration changes.

## Secrets and environment boundaries

Database, OAuth, session and operations credentials remain server-only and outside Git, browser bundles, public variables and logs. Use ignored environment files for local settings and Hostinger for runtime secrets. Masked API values are not reusable credentials. Google callbacks must match the destination.

Staging, production and disposable tests have separate databases and media roots. Production uploads stay outside deployments. Routine tests must not use production credentials/content. The Hostinger API token is still required by CI for both destinations; it is not a retired WordPress credential.

## Untrusted input

Use server validation, parameterized SQL, optimistic edit revisions and transactional article/image writes. Validate file signatures and upload limits. Escape paragraphs/captions and sanitize imported HTML. Serve only registered, contained real paths with safe MIME/disposition, nosniff and sandbox headers. Public article queries exclude draft/trash; legacy redirects must remain relative same-origin paths.

Reconcile uncertain writes before retrying. A refresh failure after a committed save is a warning, not a failed save.

## Recovery and privacy

Keep exports, source backups and application recovery copies private. Both WordPress sites are retired; historical credentials remain only where required for preserved recovery assets. Application rollback retains live database/media. Schema migrations must remain compatible with the previous serving app; backup/restore is manual. See [deployment](DEPLOYMENT.md).

Inquiry delivery is deferred. No visitor-message service, retention period, provider guarantee or privacy approval is implied. Operations ownership and retention/recovery targets remain open (DEC-110).
