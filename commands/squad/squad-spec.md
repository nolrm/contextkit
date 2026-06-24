# Squad Spec — Single-Story Processor

You are the **Spec Runner**. Each invocation processes exactly one story from a spec scope — no more. All state lives on disk. Designed to be called repeatedly by `/loop` with context cleared between runs.

Typical usage:
```
/loop /clear /squad-spec 01-identity-auth
```

---

## Step 1 — Detect State

Check whether `.contextkit/squad/manifest.md` exists:

- **Not found** → Setup mode. Go to Step 2.
- **Found** → Resume mode. Go to Step 3.

---

## Step 2 — Setup Mode (first run only)

### Find the spec

Parse input for a scope slug (e.g. `01-identity-auth`).

- **Slug provided** → read `spec/[scope-slug]/SPEC.md`. If not found: stop — "No spec at `spec/[scope-slug]/SPEC.md`. Run `/spec` first."
- **No slug** → read `spec/PROGRESS.md`, use the first completed scope (`[x]`). Tell user which scope was found. If none: stop — "No completed scopes. Run `/spec` first."

### Create handoff files

Read the full SPEC.md. Extract every story from the `## Stories` table and the `### Squad Commands` section.

Create `.contextkit/squad/manifest.md`:

```markdown
# Squad Manifest

batch: true
total: [N]
source-spec: spec/[scope-slug]/SPEC.md
created: [TIMESTAMP]

## Tasks

1. handoff-1.md | "[S1 squad command string]" | status: pending
2. handoff-2.md | "[S2 squad command string]" | status: pending
[continue for all stories]
```

For each story create `.contextkit/squad/handoff-[N].md` with the PO spec pre-filled from the spec. Status starts at `architect` — PO phase is skipped because the spec already is the PO spec:

```markdown
# Squad Handoff

task: [S# squad command string from spec]
status: architect
created: [TIMESTAMP]
spec: spec/[scope-slug]/SPEC.md

---

## 1. PO Spec

status: done

### User Story

As a [persona from spec], I want [what this story builds], so that [benefit].

### Acceptance Criteria

[From the squad command string and spec context — specific and testable]
- [ ] [criterion]
- [ ] [criterion]
- [ ] [criterion]

### Edge Cases

[From the spec UX Flows section — edge cases relevant to this story]

### Out of Scope

[From the spec Out of Scope section — filtered to this story]

### Spec Reference

Read before planning: `spec/[scope-slug]/SPEC.md`
- Data model constraints: `## Data Model`
- API conventions: `## API Contracts`
- Story dependencies: [S# depends on S# / none]
- Open questions blocking this story: [list or "none"]

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

---

## 7. Doc

status: pending

### Files Documented

### Doc Notes
```

Write all handoff files to disk and update the manifest before continuing.

Then fall through to Step 3 to process the first story.

---

## Step 3 — Resume Mode

Read `manifest.md`. Scan for the next story to process, respecting dependency order from the spec:

- A story is **ready** when its `status` is `pending` and all stories it `Depends on` are `done`.
- **No ready stories, but some are pending** → dependencies not yet met. Stop: "Waiting on dependencies. Re-run when blocking stories are complete."
- **All stories `done`** → print the final report (Step 5) and stop. Do not continue the loop.
- **Any story has `needs-work`** → stop: "Story [S#] needs rework. Fix the issues and re-run."

Take the first ready story. Read its handoff file.

---

## Step 4 — Run One Story

Process the selected story through all phases. Write the handoff file to disk after each phase.

**Architect:**
- Read the handoff and `spec/[scope-slug]/SPEC.md` — data model and API contracts are hard constraints
- Fill in `## 2. Architect Plan`: Approach, Files to Change, Trade-offs, Implementation Steps
- Set `## 2. Architect Plan` → `status: done`, top-level `status:` → `dev`
- Write handoff. Update manifest task status to `architect`.

**Dev:**
- Implement following the architect's steps
- Fill in `## 3. Dev Implementation`: Changes Made, Decisions & Deviations
- Set `## 3. Dev Implementation` → `status: done`, top-level `status:` → `test`
- Write handoff.

**Test:**
- Write tests against the acceptance criteria
- Run tests
- Fill in `## 4. Test Report`: Tests Written, Results, Coverage Notes
- Set `## 4. Test Report` → `status: done`, top-level `status:` → `review`
- Write handoff.

**Review:**
- Read the full handoff
- Fill in `## 6. Review`: verify AC met, code quality, test coverage
- If `needs-work`: set top-level `status:` → `needs-work`. Write handoff. Update manifest. **Stop** — surface issues to user. Do not continue.
- If `pass`: set top-level `status:` → `doc`. Continue.

**Doc:**
- Update companion docs for new or significantly changed files
- Fill in `## 7. Doc`
- Set `## 7. Doc` → `status: done`, top-level `status:` → `done`
- Write handoff. Update manifest task status to `done`.

Announce:
```
✓ [S#] complete — [story description]
  [X] of [N] stories done. Running /clear and continuing...
```

---

## Step 5 — Final Report (all stories done)

```
✓ Squad-spec complete: [scope-slug]

| # | Story | Verdict |
|---|-------|---------|
| S1 | [description] | pass |
| S2 | [description] | pass |

All [N] stories implemented.
Next: /spec for the next scope, then /loop /clear /squad-spec [next-scope-slug]
```

Stop. Do not signal continuation — the loop should end here.
