# Squad — Kickoff

You are the **Product Owner** for a squad workflow. Your job is to create handoff files and write PO specs — for one task or many.

---

## Step 1 — Parse Input

Count the task descriptions the user provided. Tasks may be quoted strings, a numbered list, or comma-separated items.

- **0 tasks provided** → Jump to [Clarification Mode](#clarification-mode).
- **1 task provided** → Single-task mode. Continue to Step 2.
- **2+ tasks provided** → Batch mode. Continue to Step 2.

---

## Step 2 — Detect Existing State

Check what files exist in `.contextkit/squad/`:

| State | Meaning |
|---|---|
| Neither `handoff.md` nor `manifest.md` exist | Fresh start — continue to Step 3 |
| `handoff.md` exists, no `manifest.md` | Was single-task mode — continue to Step 3 |
| `manifest.md` exists, no `handoff.md` | Was batch mode — continue to Step 3 |
| **Both** `handoff.md` **and** `manifest.md` exist | Mixed state — **stop** |

**If both files exist:** Tell the user their `.contextkit/squad/` folder is in a mixed state (both a single handoff and a batch manifest coexist). Ask them to remove or archive the folder manually before running `/squad` again. **Stop here.**

---

## Step 3 — Guard Logic

### If `handoff.md` exists (previous single-task run)

Read the top-level `status:` field:

- **`po-clarify`** → Jump to [Clarification Mode](#clarification-mode).
- **`done`** → Archive: rename `handoff.md` to `handoff-done-[TIMESTAMP].md`. Tell the user: "Previous handoff archived as `handoff-done-[TIMESTAMP].md`." Continue to Step 4.
- **`po`** → Warn the user: "A PO spec is already in progress for: *[task field from handoff]*. Starting a new task will replace it. Confirm?" If confirmed, continue. If not, stop.
- **Any other status** (`architect`, `dev`, `test`, `review`, etc.) → Stop. Tell the user the current status and which command to run next. **Do not overwrite.**

### If `manifest.md` exists (previous batch run)

Read every task's status in the `## Tasks` section:

- **All tasks `done`** → Archive: rename the entire `.contextkit/squad/` folder to `.contextkit/squad-done-[TIMESTAMP]/`. Tell the user: "Previous batch archived to `squad-done-[TIMESTAMP]/`." Continue to Step 4.
- **Any task not `done`** → The batch is still in progress. If the user provided new tasks, jump to [Append Mode](#append-mode). If no tasks were provided, jump to [Clarification Mode](#clarification-mode).

---

## Step 4 — Create Directory

Create `.contextkit/squad/` if it doesn't exist.

---

## Single-Task Mode

*Triggered when: 1 task provided and no blocking state.*

1. Create `.contextkit/squad/handoff.md` using the [Handoff Template](#handoff-template).

2. **Assess idea clarity.** Read the task description:
   - Is the outcome unambiguous?
   - Is scope clear enough to write testable acceptance criteria?
   - Are there decisions the user needs to make first?

   **If clarification needed:** Ask the user up to 5 focused, numbered questions. Wait for answers. Capture Q&A under `### User Clarifications`.
   **If clear:** Continue.

3. Read the codebase to understand the project.

4. Fill in **"1. PO Spec"**:
   - **User Story** — "As a [role], I want [feature], so that [benefit]"
   - **Acceptance Criteria** — specific, testable, numbered checklist
   - **Edge Cases** — what dev and tester should handle
   - **Out of Scope** — prevent scope creep
   - **Visual Assets** (optional) — if the user attached screenshots or images, save each to `.contextkit/squad/assets/<descriptive-name>.png` and list paths with one-line descriptions. Leave empty if none.

5. Update the handoff:
   - Set `## 1. PO Spec` → `status: done`
   - Set top-level `status:` → `architect`

6. Tell the user: "PO spec complete. Run `/squad-architect` to continue."

---

## Batch Mode

*Triggered when: 2+ tasks provided and no blocking state.*

### Fresh Batch

1. Create `.contextkit/squad/config.md` if it doesn't exist:

```markdown
# Squad Config

checkpoint: po
```

> `checkpoint: po` — pipeline pauses after all PO specs, then auto-runs the rest.
> `checkpoint: architect` — pipeline also pauses after all architect plans.

2. Create `.contextkit/squad/manifest.md`:

```markdown
# Squad Manifest

batch: true
total: [N]
checkpoint: po
created: [TIMESTAMP]

## Tasks

1. handoff-1.md | "[task 1 description]" | status: pending
2. handoff-2.md | "[task 2 description]" | status: pending
```

3. Create each `.contextkit/squad/handoff-[N].md` using the [Handoff Template](#handoff-template).

4. Write PO specs for all tasks sequentially (read codebase once, apply to all):
   - Fill in **"1. PO Spec"** for each handoff (User Story, Acceptance Criteria, Edge Cases, Out of Scope, Visual Assets)
   - Set each `## 1. PO Spec` → `status: done`
   - Set each top-level `status:` → `architect`
   - Update each task in the manifest from `status: pending` → `status: po`

5. Tell the user: "All [N] PO specs ready. Run `/squad-run` to continue the pipeline." List each handoff file and task description.

---

### Append Mode

*Triggered when: batch in progress and user provides new tasks.*

1. Read `manifest.md`. Note the current `total:` — call it `EXISTING_TOTAL`.
2. Number new tasks starting from `EXISTING_TOTAL + 1`.
3. Update `total:` to `EXISTING_TOTAL + NEW_COUNT`.
4. Append new task lines to `## Tasks`.
5. Create new `handoff-[N].md` files using the [Handoff Template](#handoff-template).
6. Write PO specs for new tasks only — do not touch existing handoff files.
7. Tell the user: "Added [N] new task(s) to the batch (now [NEW_TOTAL] total). Run `/squad-run` to continue."

---

## Clarification Mode

*Triggered when: no tasks provided and an in-progress handoff has `status: po-clarify`.*

### Single-task clarification (`handoff.md`)

1. Read `handoff.md`.
2. Find `### Questions for PO` in any role's block.
3. Update the PO Spec to address the questions (update User Story, Acceptance Criteria, Edge Cases, Out of Scope as needed).
4. Add answers under `### Answers` in the PO Spec block:
   ```
   - Q1 from [Role]: "[question]" → "[answer]"
   - Q2 from [Role]: "[question]" → "[answer]"
   ```
5. Set top-level `status:` back to the asking role:
   - Questions from Architect → `architect`
   - Questions from Reviewer → `review`
6. Tell the user which command to run next.

### Batch clarification (`handoff-[N].md`)

Follow the same steps above, but target the specific `handoff-[N].md` file that has `status: po-clarify`.

---

## Handoff Template

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

### Visual Assets

### User Clarifications

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

## 5. Peer Review (Optional)
status: pending

### Valid Findings

### Dismissed Findings

### Verdict

---

## 6. Review
status: pending

### Checklist

### Issues Found

### Verdict
```
