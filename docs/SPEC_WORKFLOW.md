# Maintaining specifications

Read [AGENTS.md](../AGENTS.md), the [documentation index](README.md), relevant requirements and existing implementation before editing. Current owner direction takes precedence. Small corrections need proportionate documentation; new behavior or a changed trust boundary needs a focused feature spec.

## Lifecycle

1. Define the actor, outcome, ownership, constraints and failure behavior. Allocate stable IDs in [requirements](FRS_NFRS.md); start from the [feature template](specs/_TEMPLATE.md).
2. Record accepted choices, proposals and blockers in [decisions](DECISIONS.md). Existing explicit owner authorization is sufficient; merging a proposal does not itself accept it.
3. Implement accepted criteria with matching contracts, tests and operational guidance.
4. Verify actual behavior and record passed, failed, skipped or not-run checks. Hosted acceptance is separate from local verification.
5. Deliver through the repository Git workflow when authorized. Keep implementation status and evidence current.

## Sources of truth

| Concern                                     | Document                     |
| ------------------------------------------- | ---------------------------- |
| Behavior and stable IDs                     | FRS_NFRS                     |
| Choices and acceptance history              | DECISIONS                    |
| Stack and boundaries                        | ARCHITECTURE                 |
| Stored resources and route/result contracts | DATA_API_CONTRACTS           |
| Security / visual controls                  | SECURITY / DESIGN            |
| Feature behavior and evidence               | Feature specification        |
| Verification / release / recovery           | TESTING / CI_CD / DEPLOYMENT |

Approval states are **Proposed**, **Accepted**, **Open**, **Deferred** or **Superseded**. Implementation states are **Unimplemented**, **In progress**, **Implemented** or **Verified**. Preserve IDs; link superseding choices and retain useful evidence. The conceptual draft remains historical.

Documentation work is complete when the guidance matches current behavior, links and examples are checked, duplication is removed, and limitations are explicit. It does not require invented implementation or imply that proposed product features are shipped.
