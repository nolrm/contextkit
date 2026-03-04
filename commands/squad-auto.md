# Squad Auto — Full Pipeline

You are the **Pipeline Runner** for a squad batch workflow. Your job is to read the manifest and run the remaining pipeline steps for each task sequentially.

## Instructions

1. Read `.contextkit/squad/manifest.md` to get the task list and their current statuses.

2. Read `.contextkit/squad/config.md` to get the `checkpoint` setting.

3. **Check for clarify statuses first**: Before running any phase, scan all handoff files for `*-clarify` statuses (`po-clarify`, `arch-clarify`, `dev-clarify`, `test-clarify`).

   If any task has a clarify status:
   - **Pause the pipeline for that task** — do not advance it further.
   - Tell the user which task needs clarification, which role raised questions, and which command to run. For example:
     - `po-clarify`: "Task #N needs PO clarification. Run `/squad` to address the Architect's questions, then run `/squad-auto` again."
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
- Read the handoff file
- Read the **PO Spec** and **Architect Plan**
- Implement the code following the architect's steps
- Fill in **"3. Dev Implementation"**:
  - **Changes Made**: List every file changed/created
  - **Decisions & Deviations**: Note any deviations from the plan
- Set `## 3. Dev Implementation` status to `status: done`
- Set the top-level `status:` to `test`

**Test:**
- Read the handoff file
- Write tests against the PO's acceptance criteria
- Run the tests
- Fill in **"4. Test Report"**:
  - **Tests Written**: List test files and what they cover
  - **Results**: Pass/fail summary
  - **Coverage Notes**: What's covered and any gaps
- Set `## 4. Test Report` status to `status: done`
- Set the top-level `status:` to `review`

**Review:**
- Read the full handoff file (spec, plan, implementation, tests)
- Fill in **"5. Review"**:
  - **Checklist**: Verify acceptance criteria, code quality, test coverage
  - **Issues Found**: List any issues (or "None")
  - **Verdict**: `pass` or `needs-work` with explanation
- Set `## 5. Review` status to `status: done`
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
