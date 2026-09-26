# Preview deployment from `staging`

Status: the first `staging` run on 2026-09-27 [failed during SSH transfer](https://github.com/SRG-13th-Gen/FGS_Website/actions/runs/36258028584) because the hosting account could not execute `/sbin/nologin`. The revised workflow uses Hostinger's file-upload API instead; that revision has not had a hosted run. A local API preflight was blocked by Cloudflare 1010 for the Python client, so API authorization remains unverified. The GitHub `preview` environment has the required API token secret and account/domain variable names, but their values have not been verified. The environment has no branch restriction and `staging` has no branch protection. This automates **preview only**; production release and rollback remain manual.

The [workflow](../.github/workflows/ci-cd.yml) runs on a push to `staging`. With branch protection requiring pull requests, a successful merge causes that push. It archives the exact pushed commit, uploads the ZIP into the preview website's `public_html` using Hostinger's [upload URL API](https://github.com/hostinger/api-python-sdk/blob/main/docs/HostingFilesApi.md), asks Hostinger to inspect the archive, then starts and polls a managed Node.js build through the Hostinger API. The API build publishes the new version only when it completes. A direct push to `staging` would also trigger this workflow, so enforce the desired merge-only policy with GitHub branch protection.

The failed SSH run showed that this account cannot execute the shell command the first workflow required. The revised workflow does not use SSH. Keep application runtime variables in Hostinger's **Environment variables** screen; this workflow does not read, replace, or print them. The existing root WordPress and independent CMS websites are outside this workflow's target.

## One-time setup

1. In Hostinger **Dev Tools → API**, create an API token for CI. It is displayed once. Store it as a GitHub `preview` environment secret. An optional local copy can go in the Git-ignored `.env.hostinger-ssh.local`; it is not available to GitHub Actions. Never place the token in tracked files or the Next.js runtime environment. [Hostinger API token guide](https://www.hostinger.com/support/10840865-what-is-hostinger-api/).
2. In GitHub, open **Settings → Environments → preview** and restrict deployment branches to `staging`. The environment exists, but this restriction was absent when checked on 2026-09-27. Leave required reviewers disabled if every merge should deploy without intervention.
3. Add these **environment variables** to `preview`:

   | Name | Value |
   | --- | --- |
   | `HOSTINGER_ACCOUNT_USERNAME` | `u414393871` |
   | `HOSTINGER_PREVIEW_DOMAIN` | `preview.flordegraceschoolinc.com` |

4. Add this **environment secret** to `preview`:

   | Name | Value |
   | --- | --- |
   | `HOSTINGER_API_TOKEN` | The new Hostinger API token. |

   The previous workflow's `HOSTINGER_SSH_PASSWORD` and `HOSTINGER_SSH_KNOWN_HOSTS` secrets and its SSH host/port variables are no longer used by CI. They can be removed from the GitHub `preview` environment after confirming no other workflow needs them. The ignored local `.env.hostinger-ssh.local` is not available to GitHub Actions.

5. Protect `staging` so it accepts changes only through merged pull requests; it was unprotected when checked on 2026-09-27. Merge the revised workflow to `staging` and check **Actions → Deploy preview** for the build ID and final state. The current preview continues to serve its last successful version if a new managed build fails. Do not assume setup is complete until one hosted run has succeeded.

## Failure and recovery

- Missing configuration, an upload failure, or an unreadable archive stops the run before starting a build. If the upload response is uncertain, inspect the preview website's file storage before retrying. If the build-start API response is lost, the build may still have started; inspect Hostinger Deployments before retrying.
- A failed Hostinger build fails the GitHub job; inspect the build ID in **Hostinger → preview website → Deployments** and fix the source or configuration before merging again.
- The ZIP name contains the Git commit for identification, but Hostinger manages `public_html` and may replace the uploaded file during deployment. Do not rely on that file as a backup. Roll back by rebuilding a known good reviewed commit into a fresh archive and redeploying it through Hostinger's managed flow; record the restored commit and build ID in a private operations record.
- The Hostinger API token grants access to the hosting account. Rotate it if exposed; never paste its value or the temporary upload credentials into issues, pull requests, or build logs.
