# Squad Auto — Full Pipeline

You are the **Pipeline Runner** for a squad batch workflow. Your job is to read the manifest and run the remaining pipeline steps for each task sequentially.

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

### Phase: Architect (tasks with status `po`)

If any tasks have status `po`:

- For each task with status `po` (in order):
  - Read the handoff file (e.g., `handoff-1.md`)
  - **Verify** the top-level `status:` is `architect`
  - Read the **PO Spec** section
  - Explore the codebase to understand the architecture
  - Fill in the **"2. Architect Plan"** section:
    - **Approach**: High-level technical approach
    - **Files to Change**: Every file to create/modify with a summary
    - **Trade-offs**: Alternatives considered and rationale
    - **Implementation Steps**: Numbered, ordered steps for the dev
  - Set `## 2. Architect Plan` status to `status: done`
  - Set the top-level `status:` to `dev`
  - Update the manifest: change this task's status to `architect`

- **If `checkpoint: architect`**: Stop here and tell the user:
  "All architect plans ready. Review the handoff files, then run `/squad-auto` again to continue."

- **If `checkpoint: po`**: Continue immediately to the Dev phase below.

### Phase: Dev → Test → Review (tasks with status `architect`)

For each task with status `architect` (in order), run all three steps sequentially:

**Dev:**

- **If `model_routing: false`** (default): run inline —
  - Read the handoff file
  - Read the **PO Spec** and **Architect Plan**
  - Implement the code following the architect's steps
  - Fill in **"3. Dev Implementation"**: Changes Made, Decisions & Deviations
  - Set `## 3. Dev Implementation` status to `status: done`
  - Set the top-level `status:` to `test`

- **If `model_routing: true`**: spawn a sub-agent using the Agent tool with `model: claude-haiku-4-5-20251001`:
  ```
  You are the Developer in a squad workflow.
  Handoff file: `.contextkit/squad/[HANDOFF_FILE]`
  Follow all instructions in `.contextkit/commands/squad-dev.md` steps 3–9.
  Do not tell the user to run any command at the end.
  After updating the handoff file, return "done" or "error: [description]".
  ```
  - If the sub-agent returns `"error: ..."`: surface the error to the user and stop the pipeline.
  - If `"done"`: continue to Test phase.

**Test:**

- **If `model_routing: false`** (default): run inline —
  - Read the handoff file
  - Write tests against the PO's acceptance criteria
  - Run the tests
  - Fill in **"4. Test Report"**: Tests Written, Results, Coverage Notes
  - Set `## 4. Test Report` status to `status: done`
  - Set the top-level `status:` to `review`

- **If `model_routing: true`**: spawn a sub-agent using the Agent tool with `model: claude-haiku-4-5-20251001`:
  ```
  You are the Tester in a squad workflow.
  Handoff file: `.contextkit/squad/[HANDOFF_FILE]`
  Follow all instructions in `.contextkit/commands/squad-test.md` steps 3–9.
  Do not tell the user to run any command at the end.
  After updating the handoff file, return "done" or "error: [description]".
  ```
  - If the sub-agent returns `"error: ..."`: surface the error to the user and stop the pipeline.
  - If `"done"`: continue to Review phase.

**Review:**
- Read the full handoff file (spec, plan, implementation, tests)
- Fill in **"6. Review"**:
  - **Checklist**: Verify acceptance criteria, code quality, test coverage
  - **Issues Found**: List any issues (or "None")
  - **Verdict**: `pass` or `needs-work` with explanation
- Set `## 6. Review` status to `status: done`
- If verdict is `needs-work`: set top-level `status:` to `review` — **do not continue to Doc**. Surface the issues to the user and stop this task.
- If verdict is `pass`: set top-level `status:` to `doc` and continue to Doc phase below.

**Doc:**
- Read the **Dev Implementation** (Changes Made) and **Architect Plan** (Files to Change)
- For each **new file**: create a companion `<filename>.md` colocated with it (Purpose, Exports/Public API, Usage Example, Edge Cases & Notes) — unless one already exists and is accurate
- For each **modified file**: update the companion `.md` if the change was significant; skip trivial changes
- Check if `README.md` or `.contextkit/` docs reference changed files/commands — update if stale
- Fill in **"7. Doc"**: Files Documented, Doc Notes
- Set `## 7. Doc` status to `status: done`
- Set the top-level `status:` to `done`
- Update the manifest: change this task's status to `done`

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
