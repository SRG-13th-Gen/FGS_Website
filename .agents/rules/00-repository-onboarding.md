# Repository onboarding

1. Read root [AGENTS.md](../../AGENTS.md) and the [documentation index](../../docs/README.md).
2. Inspect Git status and the relevant files. Preserve unrelated and uncommitted work; never clean up user changes as an onboarding step.
3. Identify the affected requirements, decisions, feature outline/specification, and trust boundaries. Load only the relevant rules and documents.
4. Separate accepted choices, proposals, and open questions. Existing owner authorization is sufficient; do not ask the same question again.
5. Inspect actual manifests/configuration before selecting implementation or verification commands.

## Repository map

- Root README: project overview and current state.
- `docs/`: maintained engineering specifications; `docs/specs/`: feature index/template and feature contracts and migration evidence.
- `docs/conceptual/`: preserved historical inputs, not the place to maintain current requirements.
- `.agents/rules/`: repository conduct and engineering constraints.
- `.agents/skills/`: scoped repository workflows.
- `.github/`: review template; PR quality checks and branch-based Hostinger deployment workflows.

`src/app` contains the public site, article detail, admin, OAuth callback, media and legacy redirect routes; `src/components/public` and `src/components/admin` contain the custom interfaces; `src/components/ui` contains shadcn primitives. `src/lib/content` holds server-only database and media services, `src/lib/auth` Google session/allowlist checks, and `src/lib/env` server configuration validation. `tests/` and `scripts/` cover current workflows and local tooling. Hosted identity and production acceptance passed on October 4; inquiry delivery remains deferred. Follow the authority model in the documentation index; record significant scope/decision changes in the maintained sources.
