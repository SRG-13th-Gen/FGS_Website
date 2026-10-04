# SPEC-003: Team admin and article management

Accepted September 20; storage and limits revised by the owner's October 4 plan in [SPEC-008](008-wordpress-removal.md). Requirements FR-005/006/007/008/009 and NFR-001/002/003 retain their IDs.

Google OAuth requires a verified email exactly matching the server allowlist. Sessions last eight hours. Every protected server operation authorizes independently. Hosted OAuth passed October 4; rerun hosted checks when identity settings change.

Admin retains its existing dashboard, article list/search/category filter/pagination, create/edit forms, captioned photo controls, media picker and named trash confirmation. Articles store title, category, optional paragraph body and up to 20 ordered images. Body is required only when there are no photos. Each new file is limited to 10 MB and aggregate new uploads to 60 MB.

MySQL transactions persist article/image relationships. Revision checks reject stale updates. Stable creation UUIDs reconcile repeated submissions without duplicate articles. Trash is soft deletion. Saved content with a refresh failure is reported separately. Imported gallery/cover and image-only stories remain editable; native WordPress fallback links are removed.

Evidence: auth/session unit tests, protected action integration tests, real database content suite and production browser workflows. Completed hosted acceptance is recorded in [SPEC-008](008-wordpress-removal.md); future releases follow [DEPLOYMENT](../DEPLOYMENT.md).
