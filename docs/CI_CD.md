# Preview deployment from `staging`

Status: workflow prepared on 2026-09-27. The GitHub `preview` environment has the required secret and variable names, but their values have not been verified. The environment has no branch restriction and `staging` has no branch protection. The workflow is not active until merged to `staging`; no hosted run has been verified. This automates **preview only**; production release and rollback remain manual.

The [workflow](../.github/workflows/ci-cd.yml) runs on a push to `staging`. With branch protection requiring pull requests, a successful merge causes that push. It archives the exact pushed commit, transfers the ZIP into the preview website's `public_html` over SSH, asks Hostinger to inspect the archive, then starts and polls a managed Node.js build through the Hostinger API. The API build publishes the new version only when it completes. A direct push to `staging` would also trigger this workflow, so enforce the desired merge-only policy with GitHub branch protection.

SSH only transfers source. Hostinger's managed Next.js app cannot be built through SSH, and edits to its managed output will be overwritten. Keep application runtime variables in Hostinger's **Environment variables** screen; this workflow does not read, replace, or print them. The existing root WordPress and independent CMS websites are outside this workflow's target.

## One-time setup

1. In Hostinger, open the **preview** website → **Advanced → SSH Access**, confirm SSH is enabled and check the IP, port, and username. The endpoint was reachable on 2026-09-27, but authenticated access has not been verified. Hostinger's [SSH guide](https://www.hostinger.com/support/5634532-how-to-generate-ssh-keys-and-add-them-to-hostinger-dashboard/) covers access and keys.
2. In Hostinger **Dev Tools → API**, create an API token for CI. It is displayed once. Store it as a GitHub `preview` environment secret. An optional local copy can go in the Git-ignored `.env.hostinger-ssh.local`; it is not available to GitHub Actions. Never place the token in tracked files or the Next.js runtime environment. [Hostinger API token guide](https://www.hostinger.com/support/10840865-what-is-hostinger-api/).
3. In GitHub, open **Settings → Environments → preview** and restrict deployment branches to `staging`. The environment exists, but this restriction was absent when checked on 2026-09-27. Leave required reviewers disabled if every merge should deploy without intervention.
4. Add these **environment variables** to `preview`:

   | Name | Value |
   | --- | --- |
   | `HOSTINGER_ACCOUNT_USERNAME` | `u414393871` |
   | `HOSTINGER_PREVIEW_DOMAIN` | `preview.flordegraceschoolinc.com` |
   | `HOSTINGER_SSH_HOST` | `46.202.138.125` |
   | `HOSTINGER_SSH_PORT` | `65002` |

5. Add these **environment secrets** to `preview`:

   | Name | Value |
   | --- | --- |
   | `HOSTINGER_API_TOKEN` | The new Hostinger API token. |
   | `HOSTINGER_SSH_PASSWORD` | The hosting account's SSH password. The ignored local `.env.hostinger-ssh.local` is not available to GitHub Actions; enter its value in GitHub separately. |
   | `HOSTINGER_SSH_KNOWN_HOSTS` | The verified OpenSSH `known_hosts` line for `[46.202.138.125]:65002`. |

   Capture the public SSH host key with `ssh-keyscan -p 65002 -t ed25519 46.202.138.125`, then check its fingerprint with `ssh-keygen -lf` against a trusted Hostinger record before storing the line. `ssh-keyscan` alone does not authenticate the server. The locally saved key matched the current endpoint on 2026-09-27, but Hostinger has not independently confirmed its fingerprint. The workflow requires strict host-key checking and will fail if the key changes.

6. Protect `staging` so it accepts changes only through merged pull requests; it was unprotected when checked on 2026-09-27. Merge the workflow to `staging` and check **Actions → Deploy preview** for the build ID and final state. The current preview continues to serve its last successful version if a new managed build fails. Do not assume setup is complete until one hosted run has succeeded.

## Failure and recovery

- Missing configuration, an SSH failure, or an unreadable archive stops the run before starting a build. If the build-start API response is lost, the build may still have started; inspect Hostinger Deployments before retrying.
- A failed Hostinger build fails the GitHub job; inspect the build ID in **Hostinger → preview website → Deployments** and fix the source or configuration before merging again.
- The ZIP name contains the Git commit for identification, but Hostinger manages `public_html` and may replace the uploaded file during deployment. Do not rely on that file as a backup. Roll back by rebuilding a known good reviewed commit into a fresh archive and redeploying it through Hostinger's managed flow; record the restored commit and build ID in a private operations record.
- The Hostinger API token and SSH password grant access to the hosting account. Rotate them if exposed; never paste their values into issues, pull requests, or build logs.
