---
name: hostinger-ssh
description: Access the Flor de Grace School Hostinger shell or management API for authorized inspection and maintenance. Use for requests involving this Hostinger account; SSH access alone is not a Node.js deployment method.
---

# Hostinger SSH

The Hostinger SSH endpoint supplied by the site owner is `u414393871@46.202.138.125` on port `65002`. In PowerShell, connect with:

```powershell
ssh -p 65002 u414393871@46.202.138.125
```

Before connecting, check whether SSH is enabled for this hosting account. The preview endpoint was reachable on 2026-09-27, and its presented key matched the locally saved key. A GitHub Actions connection reached the host, but a remote command failed with `/sbin/nologin: No such file or directory`; shell access is therefore unproven. Check SSH status under the preview website's **Advanced → SSH Access** page if connection fails. Do not interpret a connection failure as a bad password until SSH status and network reachability are checked.

The owner may keep `HOSTINGER_SSH_PASSWORD` and `HOSTINGER_API_TOKEN` in the repository root's `.env.hostinger-ssh.local`. This file is excluded from Git by `.gitignore`. Read only the value needed for an authorized operation; never print either value or copy it into chat, logs, shell command arguments, or tracked files. OpenSSH does not automatically read `.env` files; a normal `ssh` session will still prompt for the password unless a compatible credential helper is configured. The API token is for Hostinger management API calls, not for the Next.js application's runtime environment.

This local file is not available to GitHub Actions. The staging workflow needs `HOSTINGER_API_TOKEN` separately as a GitHub `preview` environment secret; it no longer uses `HOSTINGER_SSH_PASSWORD` or `HOSTINGER_SSH_KNOWN_HOSTS`. Do not upload `.env.hostinger-ssh.local` to Hostinger or include it in deployment archives.

On first connection, verify the presented host key fingerprint against a trusted Hostinger record before accepting it. If an existing host key changes, stop and investigate; do not bypass host key checking. Let OpenSSH prompt for the password or use a key already authorized on the account. Never place a password, private key, or application secret in this skill, a shell command, logs, or tracked repository files.

If shell access becomes available, inspect `pwd` and the relevant directories to identify which website or app is in scope before changing files. This hosting account contains the original root WordPress site, an independent WordPress CMS copy, and a Next.js preview. Keep operations confined to the website named in the request. The staging preview workflow uses Hostinger's upload and build APIs because its SSH transfer failed. An SSH shell and a `git pull` do not by themselves establish an automatic deployment pipeline. Exit with `exit` when finished.
