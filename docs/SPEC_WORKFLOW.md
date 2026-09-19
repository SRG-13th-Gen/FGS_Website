# Specification-driven development

## Start with the decision, not a parallel source of truth

Read [AGENTS.md](../AGENTS.md), the [documentation index](README.md), and only the relevant requirements, decisions, and rules. Inspect repository state before editing. The maintained specifications govern intended behavior; the initial conceptual draft remains historical input.

Small corrections need a proportionate documentation change, not a feature spec for every typo. New behavior, a changed contract, or a substantial trust-boundary change warrants a focused feature specification.

## Lifecycle

1. **Propose.** Allocate stable requirement IDs in [FRS_NFRS.md](FRS_NFRS.md), or reuse existing IDs. Create a feature document from the [template](specs/_TEMPLATE.md) and link it in the [feature index](specs/README.md). Record alternatives and blockers in [DECISIONS.md](DECISIONS.md).
2. **Resolve.** Identify the actor, outcome, scope, data ownership, affected contracts, failure behavior, and acceptance criteria. Resolve only decisions that block the feature; unrelated open decisions need not stop independent work.
3. **Accept.** Record the owner's explicit acceptance and the exact requirement/decision scope, date, and evidence. A user request that already authorizes the described choice is sufficient; do not ask for the same approval twice. Merging documentation does not automatically accept every proposal inside it.
4. **Implement.** Work from accepted criteria, respecting current explicit user direction. Keep implementation, contracts, docs, and tests in agreement. If a material choice is still unresolved, prepare the reviewable proposal and ask only for the missing decision before implementing that choice.
5. **Verify.** Run relevant actual checks, record evidence in the feature spec, and update the testing matrix. Distinguish not run, failed, and passed. Document any accepted limitations.
6. **Deliver.** Use the repository Git workflow when committing/opening a PR is requested. Include changed requirement/spec IDs and verification evidence. Update implementation status only to reflect achieved work.

## Status model

| Dimension                     | Values                                            | Meaning                                              |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Decision/requirement approval | Proposed, Accepted, Open, Deferred, Superseded    | Authority and readiness; not implementation progress |
| Feature approval              | Draft, In review, Accepted, Superseded            | Whether the specification is agreed                  |
| Implementation                | Unimplemented, In progress, Implemented, Verified | Code existence and acceptance evidence               |
| Verification result           | Not run, Passed, Failed, Blocked                  | Actual check outcome with evidence                   |

Do not reuse retired IDs. A superseded decision should link its replacement and explain why. The template itself is not a feature and has no implementation status to advance.

## What belongs where

- Observable behavior and constraints: FRS_NFRS.
- Choices, owners, rationale, and acceptance history: DECISIONS.
- Boundaries/data ownership: ARCHITECTURE; detailed wire shapes: DATA_API_CONTRACTS.
- Cross-cutting controls: SECURITY; visual decisions: designer-owned DESIGN.
- Feature-specific behavior, examples, implementation checklist, and evidence: its feature spec.
- Verification strategy and requirement mapping: TESTING; sequencing: ROADMAP.

Reference the canonical source instead of duplicating large requirements or schemas. Feature specifications may refine an accepted requirement, but may not silently contradict it. Update affected documents in the same change when behavior or boundaries change.

## Ready for implementation

A feature is ready when its blocking decisions are resolved, accepted criteria are testable, inputs/outputs and data ownership are clear, dependencies exist or are included in scope, and verification is defined. Numeric limits, provider choices, and privacy rules must be explicitly accepted where the feature depends on them; illustrative examples are not defaults.

## Done

Code and required configuration exist, relevant checks pass, acceptance evidence is linked, operational effects are documented, and no material unaccepted behavior is hidden in the implementation. For documentation-only work, completion means the requested docs are accurate, linked, and checked; it does not require invented application commands or mark software as implemented.
