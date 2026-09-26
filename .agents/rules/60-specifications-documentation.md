# Specification and documentation rules

Follow [SPEC_WORKFLOW.md](../../docs/SPEC_WORKFLOW.md).

- Preserve accepted/proposed/open/deferred distinctions and separate approval from implementation status.
- Keep stable requirement, decision, feature, and test IDs. Do not reuse retired IDs or claim approval because a document was merged.
- Update the canonical source for the changed concern: requirements, decisions, architecture, contracts, security, local operations, or verification. Link instead of duplicating large specifications.
- Link new docs from [docs/README.md](../../docs/README.md) or the feature index. Use repository-relative Markdown links and stable headings.
- Keep the conceptual implementation draft unchanged; it is historical input. Preserve the designer's existing DESIGN guidance. The owner requested staging preview CI/CD on 2026-09-27; keep [CI_CD.md](../../docs/CI_CD.md) scoped to that workflow and its actual setup status.
- Label planned commands, interfaces, directories, and environment names honestly. Never imply nonexistent tools or deployments are working.
- Use a focused feature spec for substantial new behavior/contracts; ordinary editorial fixes do not need a heavyweight approval process.
- Record owner instructions that resolve a decision, with their scope and date. Do not re-request authorization already present in the task.

Documentation is part of implementation. Update affected specifications and evidence in the same change as behavior, and surface material conflicts rather than silently selecting the convenient source.
