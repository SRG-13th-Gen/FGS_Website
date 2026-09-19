# WordPress integration rules

Read [DATA_API_CONTRACTS.md](../../docs/DATA_API_CONTRACTS.md) and the relevant [decisions](../../docs/DECISIONS.md).

- Verify API behavior against official WordPress documentation and the selected CMS/plugin versions. Record source links and consultation dates for behavior that affects contracts.
- Keep conceptual DTO names distinct from WordPress wire fields. Validate pagination, resource IDs, status, and upstream responses at the adapter boundary.
- Public reads expose published content only; privileged edit-context data must not enter public caches or responses.
- Use a dedicated least-privilege Application Password account server-side. It is not a team login provider or a substitute for per-actor authorization.
- Native WordPress is the school editor. Preserve Gutenberg content; do not overwrite unsupported blocks through a simplistic custom editor.
- Define and verify revalidation for both native CMS edits and custom-admin mutations. Include slug changes, withdrawal/deletion, categories, and media dependencies.
- Never assume WordPress already emits the proposed webhook. Select and configure its producer through an accepted feature spec.
- Reconcile uncertain CMS mutations rather than blindly repeating potentially completed writes. Report saved-but-refresh-pending separately.

Check official Next.js documentation against the installed version for caching APIs. Do not infer cache behavior solely from use of native `fetch`.
