# Hostinger release and recovery

The owner's October 4 plan authorizes migration to `https://flordegraceschoolinc.com/`, subject to the gates below. Pushes to `staging` deploy preview; pushes to `main` or `master` deploy production through [CI/CD](CI_CD.md). Reviewed branch promotion remains controlled by existing branch protection.

## Environments

Hostinger account SSH is enabled and verified at port 65002. Managed apps use Node 24. Stage/live/test MySQL databases and users are separate; they were provisioned under the preview site so replacing the root cannot delete them.

Persistent roots are outside every website:
`/home/u414393871/.fgs-data/staging/media`,
`/home/u414393871/.fgs-data/production/media`,
and disposable test storage. Set `MEDIA_STORAGE_PATH` server-side. App access and restart/redeploy persistence must pass before accepting this arrangement.

Store secrets only in ignored private environment files and Hostinger runtime settings. API-returned masked OAuth values are unusable credentials. Actual preview values were securely recovered over SSH and isolated environment settings prepared. Google must allow `https://flordegraceschoolinc.com/api/auth/callback/google`.

## Mandatory launch gates

1. Freeze editorial changes for final capture. Fresh full backups of root and CMS must be recoverable and copied outside the repository/account. A temporary MU plugin rejects editorial POST requests and REST mutations while allowing authenticated export reads; remove it if migration is postponed.
2. Compare inventories and preserve missing items. Import seven newer CMS sections, all five published legacy articles and all uploads/variants. Reconciliation must have zero broken references/rejected conversions.
3. Pass `pnpm verify`, database tests and production browser tests. Verify actual hosted Google login, denied access and every admin workflow.
4. Verify persistent media after restart and redeployment; verify stage/live isolation and restoration into disposable storage.
5. Prepare hashed release archive, snapshot, secure production environment, root OAuth callback, backups and rollback instructions.

Only after all gates pass, delete the original root website, recreate a Hostinger Node 24 website, apply production schema/import, install production settings and deploy the accepted archive through managed builds. Keep preview automation intact.

## Acceptance after cutover

Check HTTPS, homepage, all five news details, every referenced asset, canonical URLs, sitemap and indexing. Check old article/homepage/upload redirects. Sign in through Google and save/edit/publish/trash/select/upload through admin. Back up and restore the new production content before deleting the remaining CMS installation and revoking obsolete integration credentials.

## Recovery

Initial cutover failure: recreate the original root website on order `1007128386`. Recreate its original database/user using the preserved `wp-config.php` credentials, then import `root.sql.gz` and extract `root.tar.gz` into the new root `public_html`. Restore the captured DNS configuration if it changed, and verify URLs and HTTPS. Remove the temporary `wp-content/mu-plugins/fgs-migration-freeze.php` file before resuming edits. Preserve the prepared new content database and media during diagnosis.

Later app rollback: redeploy the previous compatible hashed archive with the same new database/media settings. Do not restore an old content database over subsequent admin edits. For data recovery, restore verified backups into empty disposable storage first and review reconciliation.

## Operations evidence

Production launched on October 4, 2026 at `https://flordegraceschoolinc.com/`. Both WordPress websites are removed; production and preview are independent managed Node 24 websites. Existing preview CI remains unchanged. Obsolete WordPress settings were removed from local/runtime configuration; historical recovery credentials remain in private backups.

The final frozen export contains five articles, seven edited sections, 352 source media records and 2,289 downloaded assets with zero failed downloads, broken references or rejected conversions. Initial and fresh final WordPress file/SQL backups were checksum/integrity checked, restored into disposable storage and copied outside the repository. Accepted production content/uploads were backed up and restored separately; the production archive contains soft-deleted test audit history while the public site retains only the five legacy articles.

Production Google sign-in, all seven editor screens, authenticated section saves, image-only publication/edit/trash and media-library selection/search passed. The owner confirmed staging file selection. Production uploaded media was served with its checksum, appeared in the library and survived restart; saved section content also survived restart. Temporary changes and media were cleaned up. Staging edits and media remain isolated from production.

`pnpm verify` and 120 combined unit/integration/MySQL/importer tests passed. Four authenticated isolated browser checks passed. Production additionally passed 33 public-page/asset/article-redirect checks, homepage/upload redirects, sitemap coverage, indexing and four live browser checks (canonicals, five stories, anonymous protection, mobile layout). DNS remained unchanged during root replacement.

Deployed release: `fgs-release-b698aabb412bb33f.zip`, SHA-256 `b698aabb412bb33ff324116185a18529a7f150e111c15449cbfcd0025e4c8693`; build `01a105b9-3fbc-70f2-bcd3-ec4375f7d1b1`. Production recovery archive: `content-production-accepted.tar.gz`, SHA-256 `b69eead9f1e81329254922d21d0eee6ccdb9644dea6b404ac208d3bcd8d1c341`.

Copies are in ignored `backups/2026-10-04` and `backups/2026-10-04-final`, account-private `/home/u414393871/.fgs-backups`, and `C:/Users/MaChew/Documents/FGS Website Backups/2026-10-04-final` outside Git. Secure environment settings are stored privately alongside recovery copies. Later application rollback must preserve the live content database and media.

Post-launch cleanup removed disposable restore trees and retired server migration tools, freeing 4.62 GiB. The isolated test database was cleared while its application schema was retained; 102 restored WordPress tables were removed. Production/staging media and all recovery archives remain. Retired tools were archived privately before removal. Production and preview passed homepage, login and checksummed media checks after cleanup.
