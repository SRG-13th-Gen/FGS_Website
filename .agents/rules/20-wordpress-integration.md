# Content storage and migration rules

The filename is retained for existing links. WordPress runtime integration is retired by the owner's October 4 [SPEC-008](../../docs/specs/008-wordpress-removal.md).

- Current services live in `src/lib/content`; database/media credentials stay server-only.
- Preserve DTOs and validated section fields; published-only public reads, explicit outage states.
- Authorize protected operations before side effects. Use transactions, revisions and soft deletion.
- Upload signatures, paths and aggregate sizes require validation; media storage must remain outside deployments.
- Migration tools stay separate from runtime. Source identifiers/checksums make imports resumable without overwriting admin edits.
- Preserve original wording, dates, captions, link destinations and image order; report rejected conversions and missing references.
- Do not delete either source site until mandatory backup, identity, storage and acceptance gates pass.
- Reconcile uncertain mutations before retrying; refresh failure is separate from save completion.
