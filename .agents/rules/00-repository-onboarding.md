# Repository onboarding

1. Read root [AGENTS.md](../../AGENTS.md) and the [documentation index](../../docs/README.md).
2. Inspect Git status and the relevant files. Preserve unrelated and uncommitted work; never clean up user changes as an onboarding step.
3. Identify the affected requirements, decisions, feature outline/specification, and trust boundaries. Load only the relevant rules and documents.
4. Separate accepted choices, proposals, and open questions. Existing owner authorization is sufficient; do not ask the same question again.
5. Inspect actual manifests/configuration before selecting implementation or verification commands.

## Repository map

- Root README: project overview and current state.
- `docs/`: maintained engineering specifications; `docs/specs/`: feature index/template and future feature specs.
- `docs/conceptual/`: preserved historical inputs, not the place to maintain current requirements.
- `.agents/rules/`: repository conduct and engineering constraints.
- `.agents/skills/`: scoped repository workflows.
- `.github/`: review template; automation is not configured by this scaffold.

`src/app` contains the runnable placeholder; `src/components/ui` contains installed shadcn primitives; `src/lib/env` contains server configuration validation; `tests/` and `scripts/` contain scaffold checks/tooling. CMS/auth/inquiry feature modules in the draft remain planned. Follow the authority model in the documentation index; record significant scope/decision changes in the maintained sources.
