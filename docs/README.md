# Documentation index

## Status and authority

The repository has an implemented public landing page and article detail route, WordPress-backed section content, admin section/article editing, Google OAuth code with an exact admin allowlist, a WordPress revalidation producer/endpoint, local WordPress/MariaDB Compose services, and quality tooling. An independent Hostinger CMS copy and Node preview are deployed; public CMS reads, images, and native section cache refresh passed partial checks. The CMS core, available plugins, and active theme's parent were updated. Hosted OAuth, full preview acceptance, live cutover, and inquiry delivery remain unverified or unfinished. [SPEC-003](specs/003-team-admin.md), [SPEC-007](specs/007-site-content-management.md), and the [deployment runbook](DEPLOYMENT.md) record scope and evidence. Passing local checks does not establish launch acceptance.

- **Accepted**: established by the original draft or explicit owner direction. Acceptance is not evidence of implementation.
- **Proposed**: a recommendation awaiting a decision; do not silently treat it as approved.
- **Open**: a question without a selected answer. **Deferred**: intentionally outside the current delivery phase.

Record acceptance evidence in [DECISIONS.md](DECISIONS.md). The owner's requests approve documentation, v1 scope, repository scaffolding, and the accepted section/content decisions recorded there; they do not approve every proposed product detail in these documents.

Authority for future work:

1. Current explicit owner instructions, with resulting specification changes recorded.
2. Accepted decisions and accepted requirements in the maintained documentation.
3. Accepted feature specifications and their architecture, security, and contract constraints.
4. Implementation and tests as evidence of actual behavior, not permission to override requirements.
5. Proposed specifications, historical conceptual material, and external examples.

[AGENTS.md](../AGENTS.md) governs contributor conduct. If authoritative documents conflict, surface the conflict and resolve the affected decision rather than silently choosing one. The [original draft](conceptual/IMPLEMENTATION_PLAN.md) stays unchanged; its accepted architecture is carried into the maintained documents below.

## Document map

Owners below are responsibilities to assign, not named people already appointed.

| Document                                           | Purpose                                                                  | Responsible role                   |
| -------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| [FRS_NFRS.md](FRS_NFRS.md)                         | Requirement IDs, status, acceptance criteria                             | Product owner with engineering     |
| [ARCHITECTURE.md](ARCHITECTURE.md)                 | Boundaries, ownership, topology, flows                                   | Technical lead                     |
| [TECH_STACK.md](TECH_STACK.md)                     | Baseline stack and recommended alternatives                              | Technical lead                     |
| [FRONTEND.md](FRONTEND.md)                         | Installed primitives, custom-component ownership, and developer commands | Engineering with frontend designer |
| [DESIGN.md](DESIGN.md)                             | Visual design system, brand tokens, typography, and component patterns   | Frontend designer                  |
| [DOCKER.md](DOCKER.md)                             | Local services, setup, and operational safeguards                        | Engineering                        |
| [DEPLOYMENT.md](DEPLOYMENT.md)                     | Hostinger release gates, configuration, smoke tests, and recovery        | Engineering with school owner      |
| [CONTENT_SELECTION.md](CONTENT_SELECTION.md)       | Source inventory and selected launch copy/news                           | Engineering with school owner      |
| [CI_CD.md](CI_CD.md)                               | Staging preview workflow, GitHub setup, and recovery                     | Engineering                        |
| [DATA_API_CONTRACTS.md](DATA_API_CONTRACTS.md)     | Resource mappings and proposed interfaces                                | Engineering                        |
| [SECURITY.md](SECURITY.md)                         | Trust boundaries, access, secrets, privacy                               | Engineering with school owner      |
| [TESTING.md](TESTING.md)                           | Verification strategy and traceability matrix                            | Engineering/QA                     |
| [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md)               | Specification lifecycle and change process                               | All contributors                   |
| [DECISIONS.md](DECISIONS.md)                       | Accepted, proposed, open, and deferred decisions                         | Decision owner per entry           |
| [ROADMAP.md](ROADMAP.md)                           | Delivery phases and dependencies                                         | Product owner with engineering     |
| [Feature index](specs/README.md)                   | Planned features and future accepted specifications                      | Feature owners                     |
| [Feature template](specs/_TEMPLATE.md)             | Reusable specification structure                                         | All contributors                   |
| [Initial draft](conceptual/IMPLEMENTATION_PLAN.md) | Preserved historical blueprint                                           | Reference only                     |

## Read only what the task needs

| Task                             | Reading path                                                          |
| -------------------------------- | --------------------------------------------------------------------- |
| New contributor                  | Root README, AGENTS, this index, then relevant rules                  |
| Requirements or feature proposal | FRS_NFRS, DECISIONS, SPEC_WORKFLOW, feature index                     |
| CMS/public content               | ARCHITECTURE, DATA_API_CONTRACTS, SECURITY, relevant requirements     |
| Admin/authentication             | SECURITY, DECISIONS, contracts, admin requirements                    |
| Inquiry forms                    | Inquiry requirements, contracts, SECURITY, delivery/privacy decisions |
| Frontend design                  | DESIGN, FRONTEND, approved content requirements                       |
| Local setup                      | DOCKER, TECH_STACK, architecture hosting constraints                  |
| Testing                          | TESTING and the affected requirement/specification                    |
| Commits or PRs                   | Git rules and repository-local GitHub PR skill via AGENTS             |

## Keeping this index useful

Link every added engineering document here or through the feature index. Keep requirements in FRS_NFRS, decision status in DECISIONS, wire contracts in DATA_API_CONTRACTS, and visual decisions in DESIGN. Other documents link to those sources instead of maintaining competing copies. See [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md) for changes and traceability.
