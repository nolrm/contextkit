# Squad Batch — Multi-Task Kickoff

You are the **Product Owner** for a squad batch workflow. The user has provided multiple task descriptions. Your job is to create handoff files for each task and write the PO spec for all of them.

## Instructions

1. Parse the user's input for multiple task descriptions. Tasks may be provided as separate quoted strings, a numbered list, or comma-separated items.

2. Create the directory `.contextkit/squad/` if it doesn't exist.

3. **Detect mode — check if a batch is already in progress:**

   - **If `.contextkit/squad/manifest.md` does NOT exist** → **Fresh start**. Continue to step 4.
   - **If `.contextkit/squad/manifest.md` EXISTS** → **Append mode**. Jump to step 5.

---

### Fresh Start

4. Create `.contextkit/squad/config.md` if it doesn't already exist:

```markdown
# Squad Config

checkpoint: po
```

The `checkpoint` setting controls where the pipeline pauses:
- `po` (default) — pause only after all PO specs are done, then auto-run the rest
- `architect` — pause after PO specs AND after all architect plans

Create `.contextkit/squad/manifest.md` with the task list:

```markdown
# Squad Manifest

batch: true
total: [NUMBER_OF_TASKS]
checkpoint: [VALUE_FROM_CONFIG]
created: [TIMESTAMP]

## Tasks

1. handoff-1.md | "[task 1 description]" | status: pending
2. handoff-2.md | "[task 2 description]" | status: pending
3. handoff-3.md | "[task 3 description]" | status: pending
```

For each task, create `.contextkit/squad/handoff-[N].md` (see handoff template below).

Then continue to step 6.

---

### Append Mode

5. Read the existing `.contextkit/squad/manifest.md`:
   - Find the current `total:` value — call it `EXISTING_TOTAL`
   - New tasks will be numbered starting from `EXISTING_TOTAL + 1`
   - Update the `total:` value to `EXISTING_TOTAL + NEW_TASK_COUNT`
   - Append the new task lines to the `## Tasks` section, continuing the numbering:

```markdown
[EXISTING_TOTAL + 1]. handoff-[EXISTING_TOTAL + 1].md | "[new task description]" | status: pending
[EXISTING_TOTAL + 2]. handoff-[EXISTING_TOTAL + 2].md | "[new task description]" | status: pending
```

   For each new task, create `.contextkit/squad/handoff-[N].md` (see handoff template below).

   Tell the user: "Adding [N] new task(s) to the existing batch (now [NEW_TOTAL] total). Writing PO specs for the new tasks only."

   Then continue to step 6 for the new tasks only — do not re-process existing handoff files.

---

### Handoff Template

```markdown
# Squad Handoff

task: [TASK]
status: po
created: [TIMESTAMP]

---

## 1. PO Spec
status: pending

### User Story

### Acceptance Criteria

### Edge Cases

### Out of Scope

### Answers

---

## 2. Architect Plan
status: pending

### Approach

### Files to Change

### Trade-offs

### Implementation Steps

---

## 3. Dev Implementation
status: pending

### Changes Made

### Decisions & Deviations

---

## 4. Test Report
status: pending

### Tests Written

### Results

### Coverage Notes

---

## 5. Review
status: pending

### Checklist

### Issues Found

### Verdict
```

---

6. Now act as the **Product Owner** for each new task **sequentially**. For each new handoff file:
   - Read the codebase to understand the project (you only need to do this once)
   - Fill in the **"1. PO Spec"** section:
     - Write a clear **User Story** in "As a [role], I want [feature], so that [benefit]" format
     - Write specific, testable **Acceptance Criteria** as a numbered checklist
     - Identify **Edge Cases** that the dev and tester should handle
     - Define what is **Out of Scope** to prevent scope creep
   - Set `## 1. PO Spec` status to `status: done`
   - Set the top-level `status:` to `architect`
   - Update the manifest: change this task's status from `pending` to `po`

7. After all PO specs are complete, tell the user:

"All PO specs ready. Review the handoff files in `.contextkit/squad/`, then run `/squad-run` to continue the pipeline."

List each new handoff file and its task description so the user can easily review them.
