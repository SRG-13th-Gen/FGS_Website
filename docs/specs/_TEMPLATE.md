# SPEC-NNN: Feature title

Copy this template to a descriptive file in this directory. Replace instructional fields and link the resulting spec from the index. Do not treat template examples as accepted requirements.

| Field                 | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| Feature ID            | Allocate or reuse a reserved SPEC ID                    |
| Approval status       | Draft                                                   |
| Implementation status | Unimplemented                                           |
| Responsible owner     | Assign a role/person                                    |
| Requirement IDs       | Link relevant entries in FRS_NFRS                       |
| Decision IDs          | Link dependencies in DECISIONS                          |
| Acceptance evidence   | Pending; later record approver, date, and evidence link |

## Outcome and scope

Describe the actor, problem, intended observable outcome, and in/out-of-scope behavior. Identify how this feature fits accepted requirements without copying them in full.

## Behavior and acceptance criteria

Specify normal, empty, invalid, unauthorized, dependency-failure, and recovery behavior as relevant. Use concrete Given/When/Then scenarios or equivalent testable statements. Tie each criterion to a requirement ID and planned verification ID.

## Interfaces and data ownership

Link canonical contracts and add only feature-specific detail. Define inputs/outputs, validation bounds, state transitions, permissions, persistence, cache effects, concurrency, and retry/idempotency where the feature needs them. Identify secrets and personal data; keep invented thresholds/providers out of accepted fields.

## Dependencies and decisions

List blocking decisions with IDs, preferred proposals, alternatives, and owners. Distinguish blockers from independent future work. Record approvals before implementing dependent proposals.

## Implementation approach

Describe affected boundaries/modules, ordered work, configuration, and required documentation updates. Include migration, compatibility, rollout, monitoring, and rollback only where the change needs them. Check existing code before specifying new modules or scripts.

## Verification and evidence

| Requirement / criterion         | Test ID and type          | Test path or manual procedure | Result and evidence |
| ------------------------------- | ------------------------- | ----------------------------- | ------------------- |
| Replace with linked requirement | Allocate or reuse test ID | Planned; no test exists yet   | Not run             |

Record actual commands, environment, results, review evidence, and limitations when work is performed. Never convert a proposed check into a passing result without running it.

## Completion record

Record implementation/PR references, remaining accepted limitations, and verification date. Advance status only when its definition in [SPEC_WORKFLOW.md](../SPEC_WORKFLOW.md) is met.
