---
description: Run a long task against a one-page goal file — outcomes, checks, change log, progress — with an independent review per milestone
argument-hint: '["idea"] | status | done'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
effort: high
---

# Goal

Run a long task against a one-page goal file that survives context compaction and new sessions. You build in your own loop; the goal file keeps you anchored and makes "done" checkable.

## Usage

```
/goal "idea or task"     # start a new goal
/goal                    # resume the active goal
/goal status             # summarise progress, don't build
/goal done               # verify every outcome and close
```

## Files

- Goals live in `.contextkit/goals/<slug>.md` (create the folder if missing). Use the template at `.contextkit/templates/goal.md` if present, otherwise the template at the end of this file.
- Only one goal should have `status: active` at a time. Others are `paused` or `done`.

## Start

1. Read the project's context first (`AGENTS.md`, `CLAUDE.md`, `.contextkit/standards/index.md` if present) and enough code to understand the area.
2. Draft the goal file: 2–3 sentence Goal, 3–7 Outcomes written from the user's side, Constraints / Non-goals.
3. If something blocks a good draft, ask — at most 4 questions in one round, each with 2–4 concrete options and the recommended one first. Use your multiple-choice question tool if you have one (Claude Code: `AskUserQuestion`; Codex: `request_user_input`); otherwise list lettered options and ask for a reply like `1b, 2a`. Record answers in the file.
4. Show the Outcomes and get a yes before building. Outcomes are human-owned from here on.

## Build Loop

Work outcome by outcome:

1. Re-read the goal file at the start of every session and after any context compaction.
2. Plan, edit, run tests, fix — in your own loop. No hand-offs.
3. Refine the **Checks** for the current outcome as you learn. Checks are yours to change.
4. Log every change to Outcomes or Checks under **Changes**: `YYYY-MM-DD — O2 check changed: X, because Y`.
5. A change the user would notice (scope, UX, dropping or weakening an outcome) → ask first, with options. Internal changes → decide and log.
6. Keep **Progress** current (done / next / blocked) so a fresh session can pick up.

## Milestone Review

When an outcome looks done:

1. Run the project's tests and quality checks.
2. Get an independent review in a fresh context. If you can spawn a subagent, do it on the same model, passing only: the goal file path, the outcome ID, and the diff (`git diff` for this outcome). Never pass your own account of the work. Ask it to check the diff against the Outcome, its Checks, and the Changes log, and return `pass` or a numbered list of problems.
   - No subagent available → do the review yourself, reading only the goal file and the diff, as if someone else wrote it.
3. Problems → fix and review again (max 3 rounds, then ask the user).
4. Pass → tick the outcome, update Progress, and commit: `feat(<scope>): <outcome summary>` (or `fix`/`refactor` as fits). Don't skip hooks.

## Done

All outcomes ticked and reviewed → set `status: done`, add a final Progress line, and give the user a short summary: outcomes, notable changes from the log, anything skipped.

## Template

```markdown
---
status: active
created: YYYY-MM-DD
---

# Goal: <title>

## Goal

<2–3 sentences: what and why.>

## Outcomes

- [ ] O1: <A user can …>

## Checks

- O1: <…>

## Constraints / Non-goals

- <…>

## Open Decisions

## Changes

## Progress

- **Done:**
- **Next:**
- **Blocked:**
```

