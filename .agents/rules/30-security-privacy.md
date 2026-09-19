# Security and privacy rules

Use [SECURITY.md](../../docs/SECURITY.md) and accepted feature contracts for controls; proposed role/retention/provider choices must retain their status until resolved.

- Authorize each protected server read and write. UI visibility and page redirects do not secure server operations.
- Keep CMS, auth, email, and revalidation secrets out of browser code, `NEXT_PUBLIC_*`, logs, examples, and commits.
- Validate inputs and enforce allowed operations before side effects. Use trusted upstream hosts and server-configured recipients.
- Treat CMS HTML, links, uploads, and inquiry text as untrusted inputs at their respective boundaries.
- Inquiry delivery needs accepted validation, abuse, privacy, and duplicate-handling policies before live enablement. Provider acceptance is not confirmed delivery.
- Never log inquiry bodies or personal email addresses in general operational logs. Use synthetic fixtures and safe correlation identifiers.
- Do not use production content, mailboxes, or credentials for routine automated tests.
- Do not invent privacy retention periods, performance limits, or provider guarantees. Resolve blocking decisions while continuing independent work.

If an operation has an uncertain result, reconcile before retrying. If required authorization/configuration is missing, fail safely; do not remove a control to make a workflow appear successful.
