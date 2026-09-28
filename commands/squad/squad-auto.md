# Squad Auto — Full Pipeline

You are the **Pipeline Runner** for a squad batch workflow. Your job is to read the manifest and run the remaining pipeline steps for each task sequentially.

**RULE: One task at a time.** Complete every phase (architect → dev → test → review → doc) for task #1 fully before touching task #2. Never read ahead or batch work across tasks. After finishing each task, write the handoff file to disk and announce completion before moving on.

## Instructions

1. Determine the run mode:
   - **If `manifest.md` exists**: batch mode — read it to get the task list and their current statuses.
   - **If no `manifest.md` but `handoff.md` exists**: single-task mode — treat it as a batch of one task with the file `handoff.md`. Read the handoff's top-level `status:` field as the task status for phase detection. Skip any manifest update steps.
   - **If neither exists**: stop and tell the user: "No squad session found. Run `/squad 'your task'` to start."

2. Read `.contextkit/squad/config.md` to get the `checkpoint` and `model_routing` settings. If the file does not exist or `model_routing` is absent, default `model_routing` to `false`.

3. **Check for clarify statuses first**: Before running any phase, scan all handoff files for `*-clarify` statuses (`po-clarify`, `arch-clarify`, `dev-clarify`, `test-clarify`).

   If any task has a clarify status:
   - **Pause the pipeline for that task** — do not advance it further.
   - Tell the user which task needs clarification, which role raised questions, and which command to run. For example:
     - `po-clarify`: "Task #N needs PO input. Run `/squad` — if the Architect flagged a split recommendation, you'll be guided through approving or dismissing it; otherwise you'll answer the Architect's spec questions. Then run `/squad-auto` again."
     - `arch-clarify`: "Task #N needs Architect clarification. Run `/squad-architect` to address the Dev's questions, then run `/squad-auto` again."
     - `dev-clarify`: "Task #N needs Dev clarification. Run `/squad-dev` to address the Tester's questions, then run `/squad-auto` again."
     - `test-clarify`: "Task #N needs Tester clarification. Run `/squad-test` to address the Reviewer's questions, then run `/squad-auto` again."
   - **Continue processing other tasks** that are not in a clarify state.
   - If ALL remaining tasks are in a clarify state, stop and list them all.

4. Determine which phase to run based on task statuses in the manifest:

Every phase below says "follow all of `[file]` steps N–M" — this means literally that: read the referenced command file and execute its numbered steps in full, not a paraphrased or abbreviated version. This pipeline's safety nets (PO-spec validation, task-too-large split detection, context-file discovery, the test-level decision table, review escalation) live in those step-by-step instructions — running an abbreviated version here would silently skip them for every task that goes through `/squad-auto` instead of the manual per-phase commands, which defeats the point of having them at all. The excluded steps at the start of each range are "read the handoff" (already done) and a `*-clarify` resume-branch that only applies when re-entering a phase already in that clarify state (not applicable the first time a task reaches a phase); the excluded step at the end is always "tell the user what to run next" — not applicable here since the pipeline continues on its own.

### Phase: Architect (tasks with status `po`)

If any tasks have status `po`:

- Take the **first** task with status `po`. Do not read other handoff files yet.
- Read its handoff file (e.g., `handoff-1.md`). Verify the top-level `status:` is `architect`.
- Follow all of `.contextkit/commands/squad/squad-architect.md` steps 3–8 (including 5.5 and 5.7) for this task. Write the handoff file yourself.
- Check the resulting top-level `status:`:
  - **`po-clarify`** (the PO Spec was ambiguous, or the Architect recommended splitting the task) → do not advance this task further this run. Update the manifest: change this task's status to `po-clarify`. Announce: `⏸ Task #N needs PO input before the Architect can plan it — see handoff-N.md (or handoff.md).` Move on to the next task with status `po`, if any.
  - **`dev`** → Update the manifest: change this task's status to `architect`. Announce: `✓ Task #N architected.`
- Repeat for the next task with status `po`. Complete each task's Architect pass fully before starting the next.

- **If `checkpoint: architect`**: Stop here and tell the user:
  "All architect plans ready. Review the handoff files, then run `/squad-auto` again to continue."

- **If `checkpoint: po`**: Continue immediately to the Dev phase below.

### Phase: Dev → Test → Review (tasks with status `architect`)

Take the **first** task with status `architect`. Run all phases to completion for this task before reading the next handoff file. Do not start task #2 until task #1 has reached `done` status and its handoff file is written to disk.

**Dev:**

Follow all of `.contextkit/commands/squad/squad-dev.md` steps 3–9 for this task.

- **If `model_routing: false`** (default): run those steps inline, in this context.
- **If `model_routing: true`**: spawn a sub-agent using the Agent tool with `model: claude-haiku-4-5-20251001`:
  ```
  You are the Developer in a squad workflow.
  Handoff file: `.contextkit/squad/[HANDOFF_FILE]`
  Follow all instructions in `.contextkit/commands/squad/squad-dev.md` steps 3–9.
  Do not tell the user to run any command at the end.
  After updating the handoff file, return "done" or "error: [description]".
  ```
  If the sub-agent returns `"error: ..."`: surface the error to the user and stop the pipeline.

Check the resulting top-level `status:`:
- **`arch-clarify`** (Dev has questions for the Architect) → do not advance this task further this run. Update the manifest: change this task's status to `arch-clarify`. Announce: `⏸ Task #N needs Architect clarification — see handoff-N.md.` Move on to the next eligible task, if any.
- **`test`** → continue to Test below.

**Test:**

Follow all of `.contextkit/commands/squad/squad-test.md` steps 3–10 for this task — this includes the change-driven test-level decision table (step 6); don't skip straight to writing tests without classifying the required level(s) first.

- **If `model_routing: false`** (default): run those steps inline, in this context.
- **If `model_routing: true`**: spawn a sub-agent using the Agent tool with `model: claude-haiku-4-5-20251001`:
  ```
  You are the Tester in a squad workflow.
  Handoff file: `.contextkit/squad/[HANDOFF_FILE]`
  Follow all instructions in `.contextkit/commands/squad/squad-test.md` steps 3–10.
  Do not tell the user to run any command at the end.
  After updating the handoff file, return "done" or "error: [description]".
  ```
  If the sub-agent returns `"error: ..."`: surface the error to the user and stop the pipeline.

Check the resulting top-level `status:`:
- **`dev-clarify`** (Tester has questions for Dev) → do not advance this task further this run. Update the manifest: change this task's status to `dev-clarify`. Announce: `⏸ Task #N needs Dev clarification — see handoff-N.md.` Move on to the next eligible task, if any.
- **`review`** → continue to Review below.

**Review:**

Follow all of `.contextkit/commands/squad/squad-review.md` steps 3–7 for this task, run inline in this context (Review is never Haiku-routed regardless of `model_routing`). This includes its escalation paths — the Reviewer may raise questions for the Tester, Dev, Architect, or PO instead of only ever passing or failing; don't reduce Review to a checklist-and-verdict-only pass.

Check the resulting top-level `status:`:
- **`test-clarify` / `dev-clarify` / `arch-clarify` / `po-clarify`** (Reviewer escalated a question to that role) → do not advance this task further this run. Update the manifest to match. Announce which role needs to respond and which command surfaces it (per squad-review.md's own messaging for each case). Move on to the next eligible task, if any.
- **`review`** (verdict was `needs-work`, no escalation) → do not continue to Doc. Surface the issues to the user and stop this task.
- **`doc`** (verdict was `pass`) → continue to Doc below.

**Doc:**

Follow all of `.contextkit/commands/squad/squad-doc.md` steps 3–9 for this task, run inline in this context. Write the handoff file yourself.

**Commit** (runs after the handoff write above, before touching the manifest):

- Not a git repository (no `.git`) → skip this step entirely.
- Otherwise, run `git status --porcelain`. Stage the files that correspond to this task — cross-check against `## 3. Dev Implementation` → Changes Made, `## 4. Test Report` → Tests Written, and `## 7. Doc` → Files Documented — with `git add <file> <file> ...`. If `git status --porcelain` shows anything unrelated to this task (e.g. leftovers from an interrupted earlier run), stop and surface it to the user instead of committing it blindly.
- Nothing staged → skip the commit, note "no changes to commit" in the completion announcement, and continue.
- Otherwise commit, one task = one commit:
  ```
  git commit -m "$(cat <<'EOF'
  <type>(<scope>): Task #N — <short task description>

  <1-2 sentence summary from Changes Made>

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  EOF
  )"
  ```
  Pick `<type>(<scope>)` per the same Conventional Commits rules `agent-push-checklist` enforces (`feat`/`fix`/`improve`/`docs`/`chore`/`refactor`/`test`).
- If `git commit` fails (e.g. a pre-commit hook rejects it): do not retry with `--no-verify`. Fix the underlying issue if it's something this pass caused, otherwise set the task's top-level `status:` to `needs-work` with the failure recorded under `## 6. Review` → Issues Found, and stop this task — do not continue to the next task with this one uncommitted.

- Update the manifest: change this task's status to `done`
- Announce: `✓ Task #N complete: [description]` — note the commit subject line or "no changes to commit" — then and only then move to the next task with status `architect`.

5. After all tasks are complete, print a summary:

```
## Squad Batch Summary

| # | Task | Verdict |
|---|------|---------|
| 1 | "task description" | pass |
| 2 | "task description" | needs-work |
| 3 | "task description" | pass |
```

List any tasks that got `needs-work` verdicts and what issues were found.
