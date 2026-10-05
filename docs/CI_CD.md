# CI/CD

## Branch flow and checks

Typed work branches target `staging`; reviewed `staging` changes promote to `main`. `master` is supported by the workflows if used, but does not exist as of this audit.

[CI — Quality Checks](../.github/workflows/pr-verify.yml) runs on PRs into these branches. Its check **Lint, Types, Tests & Build** executes `pnpm verify`, including formatting. Both existing integration branches require that exact GitHub Actions check against the current base commit.

| Protection                              | `staging`                  | `main`                                                         |
| --------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| Pull request and resolved conversations | Required                   | Required                                                       |
| Independent approvals                   | 0                          | 1; stale approvals dismissed and latest push requires approval |
| Required check                          | Lint, Types, Tests & Build | Lint, Types, Tests & Build                                     |
| Administrator enforcement               | Enabled                    | Enabled                                                        |
| Force pushes and deletion               | Blocked                    | Blocked                                                        |

Production promotion must include the verification/deployment workflows: `main` still lacks them as of October 4. Required checks must pass before promotion; do not bypass protection.

## Automatic review requests

[CODEOWNERS](../.github/CODEOWNERS) assigns `@MaChewwwww` to all paths. GitHub requests the owner's review when the file exists on the PR's target branch. It does not require code-owner approval or change existing branch protections. PR authors cannot approve their own PRs; production still needs an eligible independent reviewer when MaChewwwww authors or last pushes the PR. Current PR #15 cannot obtain independent approval from its own author through this file.

## Deployment targets

[Deploy website](../.github/workflows/ci-cd.yml) runs on branch pushes, including PR merges.

| Branch           | GitHub environment | Domain                             |
| ---------------- | ------------------ | ---------------------------------- |
| `staging`        | `preview`          | `preview.flordegraceschoolinc.com` |
| `main`, `master` | `production`       | `flordegraceschoolinc.com`         |

Both environments have secret `HOSTINGER_API_TOKEN`, variable `HOSTINGER_ACCOUNT_USERNAME=u414393871`, and variable `HOSTINGER_DEPLOY_DOMAIN` set to the domain above. Deployment branch restrictions match this table; no deployment reviewer is required. Runtime OAuth/database/media settings stay in Hostinger and are never replaced by CI. Ignored local settings and backups are absent from Git source archives.

The workflow validates branch/account/domain, archives the pushed SHA, uploads through Hostinger's file API, checks archive readability, then starts and polls a managed Node 24 build. Successful publication is followed by HTTPS checks for `/`, `/admin/login` and `/sitemap.xml`. These checks do not verify authenticated workflows or response commit identity.

Archive creation and transfer allow four connection attempts, each with a 30-second connection timeout and waits of 5, 10 and 15 seconds between attempts. Only proxy/DNS/connect errors or timeouts with no HTTP response and zero curl pretransfer time are retried. Once transfer starts, failures stop the job for inspection rather than replaying an uncertain TUS request. The job allows 25 minutes, including the existing 15-minute build polling window.

One concurrency group serializes each destination; `main` and `master` share production. Running deployments are not canceled. GitHub may coalesce older pending runs when pushes arrive quickly.

## Schema migrations

Hostinger runs `build:deploy`: `npm run db:migrate && npm run build`. Using npm for nested scripts avoids Hostinger's older global pnpm, while the top-level install/build still uses the configured pnpm. Migrations use the destination's database settings; Actions needs no database password or SSH tunnel.

The runner acquires a database advisory lock, checks applied checksums and executes missing SQL in order. Applied SQL files are preserved byte-for-byte by `.gitattributes`. Never edit an applied migration. Statements must be resumable and backward-compatible with the application currently serving.

MySQL DDL commits implicitly. Migration failure blocks the build; a later build failure can still leave schema changes applied. Take a recoverable backup before schema changes and use expand/contract releases for destructive work. Normal builds and PR checks do not migrate databases. Content import, backups and rollback remain manual.

## Evidence and failures

Staging's [October 4 deployment succeeded](https://github.com/SRG-13th-Gen/FGS_Website/actions/runs/37193631397), including migration/build and public checks. Production's automated branch path is configured but has not been exercised; it still serves the accepted launch release.

The [October 5 staging run](https://github.com/SRG-13th-Gen/FGS_Website/actions/runs/37276980341/job/111656053561) stopped during upload creation: curl exited 28 after a 15-second connection timeout to `srv1758-files.hstgr.io:443`. No managed build or publication was started. Connection retries were added October 6; hosted verification of that change remains pending.

Failed builds retain the previous published app. A smoke-check failure after publication does not roll back. If upload/build-start results are uncertain, inspect Hostinger Deployments before retrying. Rebuild a known compatible commit to roll back application code, preserving live content/media. Uploaded ZIPs are not backups. See [recovery](DEPLOYMENT.md).
