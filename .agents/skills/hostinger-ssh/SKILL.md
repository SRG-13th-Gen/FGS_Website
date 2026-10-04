---
name: hostinger-ssh
description: Access the school Hostinger account for authorized shell or management API operations; managed builds are the deployment mechanism.
---

# Hostinger access

Production and preview are separate managed Node 24 websites. Both WordPress installations were retired after October 4 acceptance. Read [DEPLOYMENT](../../../docs/DEPLOYMENT.md) and [CI/CD](../../../docs/CI_CD.md) for current environment/recovery guidance.

SSH is enabled at `u414393871@46.202.138.125`, port `65002`:

```powershell
ssh -p 65002 u414393871@46.202.138.125
```

Use strict host-key checking. Verify a new fingerprint against a trusted record; stop and investigate a changed key. If shell access fails, check hPanel SSH status and connectivity before diagnosing credentials. SSH was verified October 4; earlier `/sbin/nologin` failures occurred while access was disabled.

Ignored `.env.hostinger-ssh.local` may contain `HOSTINGER_SSH_PASSWORD` and `HOSTINGER_API_TOKEN`. Read only the needed credential; never print it or place it in command arguments, logs, source, uploads or chat. OpenSSH does not read that file automatically; use its password prompt or a previously authorized key.

The API token is for operations, not application runtime. GitHub `preview` and `production` environments have their own secret configuration; CI uses upload/build APIs without SSH. Masked API values cannot be copied as working credentials.

Before mutations, identify the account/path/domain and keep the operation within the authorized environment. Preserve outside-deployment media and private recovery backups. A shell `git pull` does not publish a managed application. Exit shell sessions when finished.
