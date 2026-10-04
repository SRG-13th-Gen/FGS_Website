# Delivery sequence

The owner's accepted October 4 plan in [SPEC-008](specs/008-wordpress-removal.md) governs current delivery. All six migration steps below completed on October 4, 2026; evidence is recorded in SPEC-008 and DEPLOYMENT.

1. Replace WordPress runtime with application-owned database/media services while preserving design/admin.
2. Capture fresh recoverable sources and export/normalize/import all content into isolated staging.
3. Complete local/database/browser checks, actual hosted Google sign-in, storage persistence and disposable restoration.
4. Prepare accepted release, production environment, OAuth callback and rollback assets.
5. Replace root website with managed Node 24 and deploy verified content/release.
6. Verify production and recovery backups, then remove the remaining CMS and obsolete integration credentials.

Preview automation remains in place; production promotion stays controlled. Inquiry delivery, extra roles, search and analytics remain deferred. Passing local tests does not satisfy hosted launch gates.
