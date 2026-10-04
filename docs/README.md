# Documentation

Audited October 4, 2026 against the source, hosted acceptance evidence and GitHub settings. Production is live; staging runs the current automated migration/build pipeline. Production branch promotion remains pending. Inquiry submission is deferred.

## Read by task

| Document                                      | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| [Architecture](ARCHITECTURE.md)               | Stack, modules, ownership and request flows             |
| [Local setup](DOCKER.md)                      | Database, environment and Docker commands               |
| [Frontend](FRONTEND.md) / [Design](DESIGN.md) | Component ownership and visual system                   |
| [Content contracts](DATA_API_CONTRACTS.md)    | Stored resources, result types and route behavior       |
| [Security](SECURITY.md)                       | Authentication, secrets and input boundaries            |
| [Testing](TESTING.md)                         | Commands, fixtures, coverage and evidence               |
| [CI/CD](CI_CD.md)                             | Branch checks, automated builds and schema migrations   |
| [Deployment and recovery](DEPLOYMENT.md)      | Hosted configuration, backups and rollback              |
| [Requirements](FRS_NFRS.md)                   | Stable requirement IDs and approval status              |
| [Decisions](DECISIONS.md)                     | Accepted choices, superseded choices and open questions |
| [Roadmap](ROADMAP.md)                         | Delivered scope and outstanding work                    |
| [Feature index](specs/README.md)              | Feature contracts and migration record                  |
| [Specification workflow](SPEC_WORKFLOW.md)    | Maintaining requirements and evidence                   |

## Authority

Current owner instructions take precedence, followed by accepted requirements/decisions, accepted feature specifications, implementation/test evidence, and historical proposals. Approval does not prove implementation; a passing local check does not prove hosted acceptance.

Use **Accepted**, **Proposed**, **Open**, **Deferred** and **Superseded** for decisions. Report verification as passed, failed, skipped or not run. Keep stable IDs and link replacement decisions rather than reusing IDs.

[AGENTS.md](../AGENTS.md) is the contributor entry point. The [conceptual draft](conceptual/IMPLEMENTATION_PLAN.md) and designer-owned [DESIGN.md](DESIGN.md) are preserved. Obsolete stack/content-selection notes were consolidated into architecture and SPEC-008; the retired SPEC-006 scaffold record remains in Git history.
