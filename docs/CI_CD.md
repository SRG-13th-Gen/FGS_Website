# Automatic staging and production deployment

The [workflow](../.github/workflows/ci-cd.yml) builds and publishes the exact pushed commit using Hostinger upload and managed Node 24 / pnpm / Next.js build APIs.

| Branch | GitHub environment | Website |
| --- | --- | --- |
| `staging` | `preview` | `https://preview.flordegraceschoolinc.com/` |
| `main` or `master` | `production` | `https://flordegraceschoolinc.com/` |

The October 4 owner request supersedes the earlier production automation deferral. Direct pushes and PR merges trigger builds. Existing branch protection and PR review requirements remain unchanged. The workflow must be present in each pushed branch; supporting `master` does not create it.

## Configuration

Both GitHub environments were configured on October 4. Each has a `HOSTINGER_API_TOKEN` secret and these variables:

| Variable | Preview | Production |
| --- | --- | --- |
| `HOSTINGER_ACCOUNT_USERNAME` | `u414393871` | `u414393871` |
| `HOSTINGER_DEPLOY_DOMAIN` | `preview.flordegraceschoolinc.com` | `flordegraceschoolinc.com` |
| Allowed deployment branches | `staging` | `main`, `master` |

No deployment reviewer is required. Existing PR review requirements remain independent. The workflow validates the exact account and branch/domain mapping before uploading. Separate concurrency groups serialize each destination; `main` and `master` share the production group. Running deployments are not canceled. GitHub can replace an older pending run with a newer push, so rapid pushes may be coalesced despite each push triggering a run.

Runtime settings remain in Hostinger. CI never replaces Google/database credentials, imports content or resets databases. Hostinger now runs `build:deploy`: `db:migrate` followed by `build`, using the destination website's own database settings. Migration failure prevents publication. Migration checksums and an advisory lock guard repeat/concurrent execution. Staging and production databases and media remain isolated. Local ignored environment files are excluded from Git archives and unavailable to Actions.

## Verification and recovery

CI uploads tracked files from the pushed SHA, checks archive readability, starts a managed build and polls completion. It then checks HTTPS responses for the homepage, admin login and sitemap. These checks do not verify authenticated workflows or prove responses belong to the new commit.

The [PR workflow](../.github/workflows/pr-verify.yml) runs `pnpm verify` for PRs into `staging`, `main` and `master`. Deployment runs after push and is not a premerge check. Environment setup is verified separately from workflow execution: the revised workflow still needs committing and promotion before its first run. The earlier preview [run succeeded](https://github.com/SRG-13th-Gen/FGS_Website/actions/runs/36258492134); it does not verify this revision.

A failed build retains the previous published version. A smoke-check failure after publication does not automatically roll back. If upload/build-start responses are uncertain, inspect Hostinger Deployments before retrying. Rollback remains manual: rebuild a known good reviewed commit, retaining the content database and media. Uploaded ZIPs are not backups; preserve the recovery packages described in [DEPLOYMENT.md](DEPLOYMENT.md). Never print API tokens or temporary upload credentials; rotate exposed tokens.

## Schema migrations and production checks

On October 4, `main` was configured to require the GitHub Actions `Lint, Types, Tests & Build` check with current-base verification, retaining its independent approval and administrator enforcement. The verification workflow is not yet on `main`: promotion PRs must include it and publish a passing check before merge. `staging` requires the same check; `master` does not exist.

Migrations run inside Hostinger's build environment; Actions needs no database password or SSH tunnel. Normal builds and PR checks do not run migrations. Content import, backups and rollback remain manual.

Use additive, backward-compatible migrations because the old application continues serving during builds. MySQL DDL commits implicitly: failed migrations or later builds can leave schema changes applied even when the previous app remains published. Make statements resumable/idempotent, never edit applied migrations, and use expand/contract releases for destructive changes. Keep fresh recoverable backups before schema-changing releases; CI does not back up or reverse migrations. The updated hosted build path still needs its first deployment run after these changes are committed and promoted.

Applied SQL files are preserved byte-for-byte by `.gitattributes`; Git must not normalize their line endings because migration checksums include every byte.

The PR workflow displays as **CI — Quality Checks**, with the required check **Lint, Types, Tests & Build**. Its internal job ID stays `verify`; the command stays `pnpm verify`. Both branch protection rules use the displayed check name.

Hostinger invokes the deployment script with the configured pnpm version, but nested `pnpm` commands can resolve its older global binary. `build:deploy` uses `npm run db:migrate && npm run build` to retain fail-fast ordering without invoking that global pnpm.
