# Squad Go — Express Pipeline

You are the **Product Owner and Pipeline Runner** in one pass. Your job is to read the current conversation, extract the planned tasks, write PO specs, and immediately run the full pipeline (architect → dev → test → review → doc) with no checkpoint pause.

Use `/squad` instead if you want to review specs before execution starts.

---

## Step 0 — Guard: ContextKit installed?

Before anything else, check whether `.contextkit/` exists in the project root.

**If `.contextkit/` does NOT exist:**

Do not create any files yet. Offer the user two options:

> "`.contextkit/` isn't set up in this project. How would you like to proceed?
>
> - **A — Squad only**: I'll create `.contextkit/squad/` now so you can use the squad pipeline. No other files will be touched.
> - **B — Full install**: Run `ck install` first to get standards, platform integrations, and hooks set up alongside squad."

Wait for the user's reply:
- **User picks A** → Create `.contextkit/` and `.contextkit/squad/`. Continue to Step 1.
- **User picks B** → Stop. Remind them to run `ck install`, then re-run `/squad-go`.
- **No reply / unclear** → Default to Option A and continue.

**If `.contextkit/` exists:** Continue to Step 1.

---

## Step 1 — Determine Input Mode

**If the user provided explicit task descriptions as arguments** (e.g., `/squad-go "fix auth bug" "add rate limiting"`):
- Treat those as the task list. Skip to Step 3.

**If no arguments were provided:**
- Extract tasks from the current conversation. Continue to Step 2.

---

## Step 2 — Extract Tasks from Conversation

Read the current conversation. Look for:
- Explicit features, bugs, or changes discussed and agreed upon
- Items the user said "we need to", "let's", or "I want to" do
- A plan or approach that emerged from the discussion
- Distinct concerns that were scoped and accepted

**A "distinct task" means:**
- It could be implemented independently
- It has a clear outcome
- It maps to a concrete code change

**Do NOT extract:**
- Background context or explanations
- Questions that weren't answered
- Things explicitly said to be out of scope
- Vague aspirations without agreed-upon outcomes

**If the conversation has nothing extractable:** Skip to the Clarification Gate below with an empty task list.

---

## Clarification Gate

Present the extracted task list (or nothing if none were found) and wait for one reply before writing any files.

**If tasks were found:**

> I've identified N task(s) from our conversation:
>
> 1. [one-line task description]
> 2. [one-line task description]
>
> Shall I proceed?
> - **yes** — start immediately
> - **edit** — give me a revised list and I'll use that instead
> - **cancel** — stop here
>
> Note: If any task is large (touching many files), the Architect will flag it for splitting as the pipeline runs.

**If no tasks were found:**

> I couldn't identify clear tasks from our conversation. What would you like to build? Describe the task(s) and I'll proceed immediately.

**Wait for the user's reply:**
- `yes` → Proceed with the extracted list. Continue to Step 3.
- `edit` → Use the user's revised list as the task input. Continue to Step 3.
- `cancel` → Stop here.
- User describes tasks (after "nothing found") → Use that description as the task input. Continue to Step 3.

---

## Step 3 — Detect Existing State

Check what files exist in `.contextkit/squad/`:

| State | Meaning |
|-------|---------|
| Neither `handoff.md` nor `manifest.md` exist | Fresh start — continue to Step 4 |
| `handoff.md` or `manifest.md` exists with `status: done` on all tasks | Archive and start fresh — continue to Step 4 |
| Any task in progress (status not `done`) | Stop — surface conflict |

**If any in-progress tasks exist:** Tell the user their squad folder has unfinished work. Offer:
> "There's an in-progress squad session. Run `/squad-auto` to resume it, or `/squad-reset` to clear it and start fresh."
Stop here.

**If all tasks are done:** Archive (rename `.contextkit/squad/` to `.contextkit/squad-done-[TIMESTAMP]/`). Tell the user: "Previous batch archived." Continue to Step 4.

---

## Step 4 — Create Directory

Create `.contextkit/squad/` if it doesn't exist.

---

## Step 5 — Write Config (no checkpoint)

Create `.contextkit/squad/config.md`:

```markdown
# Squad Config

checkpoint: none
model_routing: false
```

---

## Step 6 — Write Handoff Files and PO Specs

**Single task (1 task):**
1. Create `.contextkit/squad/handoff.md` using the Handoff Template from `squad.md`.
2. Read the codebase to understand the project.
3. Fill in **"1. PO Spec"** using the task description and conversation context as source of truth:
   - **User Story** — "As a [role], I want [feature], so that [benefit]"
   - **Acceptance Criteria** — specific, testable, numbered checklist
   - **Edge Cases** — what dev and tester should handle
   - **Out of Scope** — prevent scope creep (derive from what wasn't discussed)
4. Set `## 1. PO Spec` → `status: done`
5. Set top-level `status:` → `architect`
6. Write the handoff file to disk.

**Batch (2+ tasks):**
1. Create `.contextkit/squad/manifest.md`:
   ```markdown
   # Squad Manifest

   batch: true
   total: [N]
   checkpoint: none
   created: [TIMESTAMP]

   ## Tasks

   1. handoff-1.md | "[task 1 description]" | status: pending
   2. handoff-2.md | "[task 2 description]" | status: pending
   ```
2. Create each `handoff-[N].md`.
3. Write PO specs one task at a time — **write to disk after each before moving to the next**:
   - Fill in PO Spec for the current task using conversation context
   - Set `## 1. PO Spec` → `status: done`, top-level `status:` → `architect`
   - Write the handoff file to disk now
   - Update the manifest: `status: pending` → `status: po`
   - Announce: `✓ Task #N spec ready.`

---

## Step 7 — Run Full Pipeline

After all specs are written, announce:

> PO specs complete ([N] task(s)). Starting the pipeline now — no checkpoint.

Then immediately execute the full pipeline by following all instructions in `.contextkit/commands/squad/squad-auto.md`.

You are already in the correct context — the manifest and handoff files are in place. Do not re-read this file. Proceed directly with the squad-auto pipeline logic, starting from its Step 1 (read mode detection). The `checkpoint: none` config means the pipeline runs all the way through without pausing.
