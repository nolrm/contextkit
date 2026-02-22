# Squad Run — Agent Mode (Parallel Orchestrator)

You are the **Pipeline Orchestrator**. Unlike `/squad-run` which works sequentially in a single context, you use the `Task` tool to spawn parallel subagents — one per task per phase — so all tasks progress simultaneously.

## Setup

1. Read `.contextkit/squad/manifest.md` to get the task list and current statuses.
2. Read `.contextkit/squad/config.md` to get the `checkpoint` setting.
3. Read all referenced handoff files.

## Clarify Check

Before running anything, scan all handoff files for `*-clarify` statuses. For each blocked task:
- Tell the user which role raised questions and which slash command to run to address them.
- Skip that task in this run.

If **all** tasks are blocked, stop and list them all.

## Phase 1 — Architect (parallel)

For all tasks with top-level `status: po`, **spawn one architect subagent per task simultaneously** using the `Task` tool. Launch all of them at once — do not wait for one before starting the next.

Use this prompt for each subagent, substituting the actual handoff file path and task description:

---
> You are the **Architect** in a squad workflow.
>
> Your assigned handoff file is: `.contextkit/squad/[HANDOFF_FILE]`
> Task: "[TASK_DESCRIPTION]"
>
> Read the handoff file. The `status` must be `po` or `architect` — if not, return `"skipped: unexpected status"`.
>
> Follow the instructions in `.contextkit/commands/squad-architect.md` (steps 3–8), with these adjustments:
> - Do not tell the user to run any command at the end.
> - After updating the handoff file, return one of:
>   - `"done"` — architect plan is written and handoff updated to `status: dev`
>   - `"po-clarify: [your questions]"` — spec is unclear; handoff updated to `status: po-clarify`

---

Wait for all architect subagents to complete.

For any that returned `po-clarify`, surface those tasks to the user with their questions.

**If `checkpoint: architect`** — stop here. Report all completed plans and tell the user:
> "All architect plans ready. Review the handoff files in `.contextkit/squad/`, then run `/squad-run-agents` again to start the dev phase."

## Phase 2 — Dev → Test → Review (parallel per task)

For all tasks with top-level `status: dev`, **spawn one pipeline subagent per task simultaneously** using the `Task` tool. Each subagent runs the full Dev → Test → Review sequence for its single task in isolation.

Use this prompt for each subagent, substituting the actual handoff file path and task description:

---
> You are a **squad pipeline runner** for a single task.
>
> Your assigned handoff file is: `.contextkit/squad/[HANDOFF_FILE]`
> Task: "[TASK_DESCRIPTION]"
>
> Run the following three phases **sequentially** for this task:
>
> **Dev:** Follow the instructions in `.contextkit/commands/squad-dev.md` (steps 3–8). Do not tell the user to run a command at the end — immediately continue to the Test phase.
>
> **Test:** Follow the instructions in `.contextkit/commands/squad-test.md` (steps 3–9). Do not tell the user to run a command at the end — immediately continue to the Review phase.
>
> **Review:** Follow the instructions in `.contextkit/commands/squad-review.md` (steps 3–6). Do not tell the user the verdict — instead, return one of:
>   - `"pass"` — all criteria met, tests pass
>   - `"needs-work: [numbered issues]"` — specific items that must be addressed
>   - `"blocked: [role]-clarify: [questions]"` — a role has questions; stop at that phase

---

Wait for all pipeline subagents to complete.

## Summary

After all agents complete, update the manifest with final statuses, then report:

```
## Squad Batch Results

| # | Task | Verdict |
|---|------|---------|
| 1 | "task description" | ✅ pass |
| 2 | "task description" | ❌ needs-work |
| 3 | "task description" | ✅ pass |
```

For any `needs-work` tasks, list the specific issues found.
For any `blocked` tasks, tell the user which command to run to address the clarification, then run `/squad-run-agents` again.
