# Commits, branches, and pull requests

## Branch flow

```text
feature/*, fix/*, docs/*, chore/*, refactor/*, test/*, build/*, ci/*, perf/*
  -> staging
staging -> main
```

`main` is the production branch. Treat `main` and `staging` as protected integration branches; verify actual GitHub protection settings when changing merge policy. After bootstrap, do not commit or push directly to them. Routine typed work branches target `staging`; production promotion has head exactly `staging` and base `main`. The owner requires passing PR checks for staging self-merges and an independent approval for main (DEC-117). No routine direct-main exception is defined.

Base new work on current remote `staging`. Reuse a related typed work branch after checking its history and target. If uncommitted work is on an integration branch, preserve it on an appropriate work branch before committing; if moving to the right base is unsafe, resolve that narrowly without discarding work. Do not silently retarget an existing PR.

## Commit discipline

- Inspect status, worktree diff, staged diff, branch, and intended scope. Stage explicit paths; preserve unrelated user work.
- Use focused Conventional Commit subjects: `type(scope): imperative summary`; scope is optional. Types: feat, fix, docs, test, refactor, build, ci, chore, perf.
- Include related contracts, tests, documentation, migrations, and lockfiles when they exist and belong to the change.
- Run applicable actual checks and `git diff --cached --check`. Do not invent a universal verification script before tooling exists.
- Never commit secrets, real environment files, local database data, caches, or credentials. Preserve literal Markdown/special characters with safe shell quoting or message files.
- Do not amend others' commits, rewrite shared history, force-push, merge, enable auto-merge, bypass checks, or change protections without explicit authorization for that action.

## PR workflow

Use the local [github-pr skill](../skills/github-pr/SKILL.md) for commit/push/PR requests. PR titles use Conventional Commit shape; bodies follow the [template](../../.github/pull_request_template.md), explain the resulting behavior, link affected requirement/spec IDs, and record real verification and unresolved decisions.

An explicit request to open a PR authorizes the necessary scoped commit/push/create actions. A commit-only request does not authorize pushing. A request to prepare a PR without publishing authorizes local preparation only. Preserve prior authorization; ask only when the next external action is genuinely unrequested. Creating a PR does not authorize merging or deployment.

## Empty-repository bootstrap

GitHub cannot compare branches without a commit history. Inspect local and remote state; an unborn local branch does not prove the remote is empty. Do not create a repository or replace existing remote history.

If the remote is genuinely empty, the one-time bootstrap sequence, when explicitly authorized, is: review the scoped initial files, create the initial commit on `main`, publish `main`, and create/publish `staging` at that same commit. Branch-protection configuration is a separate authorized action. The exception ends when those remote branches exist; later work follows normal PR flow. This scaffold documents that procedure only and authorizes none of those mutations by itself.
