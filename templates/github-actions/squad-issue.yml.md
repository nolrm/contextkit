# squad-issue.yml

## Purpose

GitHub Actions workflow template that turns a labeled GitHub issue into a pull request automatically. When a developer labels any issue `squad-ready`, this workflow creates a feature branch, runs the full ContextKit squad pipeline (PO → architect → dev → test → review → doc) using the Claude Code CLI, and opens a draft PR linked back to the issue — with no local setup required.

Installed to `.github/workflows/squad-issue.yml` in user projects when they opt in during `ck install`.

## Trigger & Conditions

- **Event:** `issues: types: [labeled]`
- **Guard:** `if: github.event.label.name == 'squad-ready'`
- **Concurrency:** `group: squad-issue-{issue_number}, cancel-in-progress: false` — prevents duplicate runs; a re-label on an in-flight issue queues rather than cancels.
- **Timeout:** 60 minutes (full squad pipelines can take 10–20 min)

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Passed to Claude Code CLI for the pipeline |
| `GITHUB_TOKEN` | Auto-provided; used for `gh pr create` and `gh issue comment` |

The workflow validates `ANTHROPIC_API_KEY` in the first step and fails fast with a clear message if missing.

## Workflow Steps

1. **Validate API key** — fails with a descriptive error if `ANTHROPIC_API_KEY` is not set
2. **Checkout** — `fetch-depth: 0` for full git history
3. **Setup Node.js 20** — with npm cache
4. **Install dependencies** — `npm ci`
5. **Configure git** — sets `github-actions[bot]` identity
6. **Create feature branch** — `fix/issue-N-slug` (or `feat/...` if title starts with "feat"). Reuses existing branch if already present.
7. **Write handoff from issue** — creates `.contextkit/squad/handoff.md` with issue title as task and issue body injected into `### Answers`
8. **Install Claude Code CLI** — `npm install -g @anthropic-ai/claude-code`
9. **Run squad CI pipeline** — `claude --dangerously-skip-permissions -p "Read .contextkit/commands/squad-ci.md and run the CI pipeline."`
10. **Check for clarify state** — reads `ci-result.md`; if `status: clarify`, posts a GitHub comment with the questions and exits 0 (non-failing run)
11. **Commit and push** — captures `ci-result.md` content into a step output, then deletes it before committing; pushes to the feature branch
12. **Create draft PR** — uses content from step output as PR body; appends `Closes #N` link

## Edge Cases & Notes

- **Branch already exists:** The "Create feature branch" step checks with `git ls-remote` and reuses the existing branch rather than failing.
- **No changes to commit:** If Claude made no filesystem changes, the commit step exits 0 gracefully (no empty commit).
- **`ci-result.md` lifecycle:** Written by Claude during the pipeline, captured into a GitHub step output before being deleted from the commit, then read for the PR body. This ensures the PR description contains the squad summary even though the file is not committed.
- **`--dangerously-skip-permissions`:** Required in the unattended CI environment. The runner is short-lived and trusted (GitHub-hosted).
- **`cancel-in-progress: false`:** A mid-flight pipeline is not cancelled if the issue is re-labeled; the branch-exists check handles re-triggers gracefully.
- **`npm ci` requirement:** The user project must have a `package.json` with a lockfile. For non-Node projects this step will fail — future work could make this conditional.
