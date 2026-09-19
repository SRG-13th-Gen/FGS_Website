---
name: github-pr
description: Prepare scoped commits and GitHub pull requests for this repository, using typed work branches into staging and staging-to-main promotion. Use for commit, push, PR preparation, or PR creation requests; excludes merging, deployment, and protection changes.
---

# GitHub PR

Follow [AGENTS.md](../../../AGENTS.md), [Git rules](../../rules/70-commits-pull-requests.md), and the [PR template](../../../.github/pull_request_template.md). Keep the user's requested scope: commit-only stays local; preparation-only does not publish; an explicit open-PR request authorizes necessary scoped commits and pushing. Do not ask again for authorization already given.

## Inspect and choose the path

1. Inspect status, current branch, worktree/staged diffs, remotes, recent history, and available verification tooling. Preserve unrelated work. Detect an unborn branch without assuming the remote is empty.
2. Before remote work, verify `origin` is the intended GitHub repository and check `gh auth status` without exposing tokens. If tooling/access is unavailable, complete local preparation and report the missing prerequisite; do not create a remote, repository, or fork automatically.
3. Fetch the relevant remote refs before selecting a base. Inspect existing open PRs for the intended head/base so retries reuse an existing PR. Never silently retarget one with a different base.
4. Normal work uses a related typed branch based on current `origin/staging`, targeting `staging`. Allowed prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`, `build/`, `ci/`, `perf/`.
5. Production promotion uses head `staging` and base `main`, with existing reviewed commits and no promotion-only commit. Check the branch comparison and exclude unrelated/uncommitted work; do not push directly to the protected branch to prepare it.

Reject detached HEAD, PRs from `main`, unrelated branch history, or typed branches targeting `main`. Resolve wrong-base or ahead/behind issues without destructive cleanup or an unauthorized rebase/force-push. Unrelated changes may remain unstaged during a normal work PR if they can be safely preserved.

If either integration branch is missing, inspect remote history. For a truly empty remote, follow only the explicitly authorized bootstrap sequence in the Git rules. Otherwise report the exact missing prerequisite instead of fabricating branch history. A general PR request does not implicitly authorize the exceptional direct bootstrap pushes.

## Prepare a scoped commit

If intended changes are uncommitted:

1. Ensure they are on the correct typed branch before committing, preserving other changes.
2. Run checks appropriate to the files and actual manifests. For documentation-only work, check links, requirements/status consistency, and whitespace. Application/scaffold changes use `pnpm verify`; browser behavior uses `pnpm test:e2e`; Compose changes use `pnpm docker:config` after local environment setup. Report unavailable runtime checks honestly.
3. Inspect for secrets and accidental generated/local data. Stage explicit intended paths and review the complete staged diff, including anything staged before this task. Do not include unrelated pre-staged changes.
4. Run `git diff --cached --check` and review `git diff --cached` before committing.
5. Use a focused Conventional Commit subject. Use `git commit -F <message-file>` or correct shell literal quoting; preserve dollar signs and backticks, especially in PowerShell. Never use JSON stringification as shell escaping.

If the intended work is already committed, reuse it. Before PR creation, require a meaningful comparison against the chosen base; never create an empty commit just to open a PR.

## Prepare the review text

Use the template, scaled to the actual change. Lead with the problem and resulting behavior. Include requirement/spec/decision references, verification commands and results, material risks, unresolved decisions, and relevant rollout notes. Do not claim unavailable tests ran or proposals were accepted.

Write multiline Markdown to a temporary UTF-8 body file and use `--body-file`; do not pass multiline Markdown through an inline shell argument. Use safe literal quoting for titles (escaping embedded quotes correctly) or a structured API. Scratch files must not enter the commit.

## Publish only within authorization

When commit/preparation-only work is requested, return the prepared result without pushing. If publication would help but is unrequested, complete the local reviewable result before asking for that final action.

For an authorized PR:

1. Push a normal typed work branch without force: `git push --set-upstream origin <head>`. A promotion uses the already-published `staging` ref; do not push a protected branch as a side effect.
2. Recheck for an open PR using explicit head and base, for example `gh pr list --head <head> --base <base> --state open --json number,url,baseRefName,headRefName`. Also inspect any PR for that head with a different base. Reuse the matching PR; update its title/body only within requested scope.
3. Create only if none exists: `gh pr create --base <base> --head <head> --title <safely-quoted-title> --body-file <body-file>`. Review requirements and merge permissions remain unchanged.
4. If a push/create response is uncertain, inspect the remote ref and open PRs before retrying. Do not produce duplicate PRs or empty retry commits.
5. Remove only the temporary files created for this task. Report PR URL (when published), head/base, commit SHA, checks, and blockers. When the host provides an artifact-attachment tool, attach the created PR to the task.

Do not merge, enable auto-merge, delete branches, deploy, or bypass checks as part of PR creation. Official command reference: [gh pr create](https://cli.github.com/manual/gh_pr_create), consulted 2026-09-19; inspect installed command help if behavior differs.
