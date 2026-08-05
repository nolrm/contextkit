# Squad Spec — Single-Story Processor

You are the **Spec Runner**. Each invocation processes exactly one story from a spec scope — no more. All state lives on disk. Designed to be called repeatedly with context cleared between runs — Claude Code via `/loop /clear`, Codex via `/goal` (which clears context between turns natively).

Typical usage (single scope):
```
/loop /clear /squad-spec 01-identity-auth                              # Claude Code
/goal complete every story in scope 01-identity-auth via /squad-spec   # Codex
```

Auto mode — runs ALL completed scopes in sequence without a slug:
```
/loop /clear /squad-spec                            # Claude Code
/goal complete every story in every scope via /squad-spec   # Codex
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

- **Slug provided** → read `.contextkit/spec/[scope-slug]/SPEC.md`. If not found: stop — "No spec at `.contextkit/spec/[scope-slug]/SPEC.md`. Run `/spec` first."
- **No slug** → auto mode:
  1. Check `.contextkit/squad/next-scope.txt` — if it exists, read the slug from it, then **delete the file**. Use that slug.
  2. Otherwise, read `.contextkit/spec/PROGRESS.md` and use the first completed scope (`[x]`). Tell the user which scope was found.
  3. If no completed scopes exist: stop — "No completed scopes. Run `/spec` first."

### Create handoff files

Read the full SPEC.md. Extract every story from the `## Stories` table and the `### Squad Commands` section.

Create `.contextkit/squad/manifest.md`:

```markdown
# Squad Manifest

batch: true
total: [N]
source-spec: .contextkit/spec/[scope-slug]/SPEC.md
scope: [scope-slug]
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
attempts: 0
created: [TIMESTAMP]
spec: .contextkit/spec/[scope-slug]/SPEC.md

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

Read before planning: `.contextkit/spec/[scope-slug]/SPEC.md`
- Data model constraints: `## Data Model`
- API conventions: `## API Contracts`
- Story dependencies: [S# depends on S# / none]
- Open questions blocking this story: [list or "none"]

---

## 2. Architect Plan

status: pending
started:
completed:

### Approach

### Files to Change

### Trade-offs

### Implementation Steps

---

## 3. Dev Implementation

status: pending
started:
completed:

### Changes Made

### Decisions & Deviations

---

## 4. Test Report

status: pending
started:
completed:

### Tests Written

### Results

### Coverage Notes

---

## 5. Peer Review

status: pending
started:
completed:

Runs on any retry pass — skipped entirely on the first attempt (`attempts: 0`). An independent second opinion on the Dev fix: actively look for reasons it might not hold, don't rubber-stamp it.

### Valid Findings

### Dismissed Findings

### Verdict

---

## 6. Review

status: pending
started:
completed:

### Checklist

### Issues Found

### Verdict

---

## 7. Doc

status: pending
started:
completed:

### Files Documented

### Doc Notes
```

Write all handoff files to disk and update the manifest before continuing.

Then fall through to Step 3 to process the first story.

---

## Step 3 — Resume Mode

Read `manifest.md`. Each handoff's top-level `status:` is one of:

- `pending` — not started yet.
- `architect` / `dev` / `test` / `review` / `doc` — in progress. Finding a story in one of these states at the *start* of a fresh invocation means the previous run was interrupted mid-phase (dropped connection, crash) — Step 4 always carries a story through to `done` or `needs-work` in one continuous pass, so it never hands control back mid-phase on its own.
- `needs-work` — failed Review after exhausting retries (see Step 4). Terminal until a human fixes it.
- `done` — complete.

Select the next story, in this order:

1. **Interrupted story** — any story at `architect`/`dev`/`test`/`review`/`doc` whose dependencies are `done`. Take it and resume from that exact phase in Step 4 — do not restart from Architect. Prioritize this over starting new work so partial progress isn't stranded.
2. **Ready story** — otherwise, the first `pending` story whose dependencies are all `done`. Take it and start from Architect.
3. **Nothing selectable:**
   - **All stories `done`** → go to Step 5.
   - **Every remaining `pending`/interrupted story is blocked, directly or transitively, on a `needs-work` story** → stop: "Story [S#] needs rework — [N] other stories are blocked on it. Fix the issues and re-run."
   - **Otherwise** (remaining stories are just waiting on dependencies still in progress) → stop: "Waiting on dependencies. Re-run when blocking stories are complete."

A `needs-work` story does **not** halt the whole run by itself — if other stories are still selectable under 1 or 2 above (not dependent on it), keep processing them. Only stop when no story is selectable.

Read the selected story's handoff file.

---

## Step 4 — Run One Story

Process the selected story through its phases in one continuous pass. Start at Architect if the story was `pending`, or at the phase Step 3 identified if it was interrupted. Write the handoff file to disk after every phase, and update the manifest task status to match.

For every phase: stamp its `started:` field (a timestamp) when you begin it, and `completed:` when you finish it.

**Architect** (runs once, never retried):
- Read the handoff and `.contextkit/spec/[scope-slug]/SPEC.md` — data model and API contracts are hard constraints
- Fill in `## 2. Architect Plan`: Approach, Files to Change, Trade-offs, Implementation Steps
- Set `## 2. Architect Plan` → `status: done`, top-level `status:` → `dev`
- Write handoff. Update manifest task status to `architect`.

### Dev → Test → (Peer Review) → Review loop

Repeat this block until Review passes or `attempts` hits the cap (2). `attempts` starts at 0 and is incremented each time Review sends the story back.

**Dev:**
- Attempt 1 (`attempts: 0`): implement following the architect's plan.
- Retry (`attempts: 1`): read `## 6. Review` → Issues Found from the failed pass. Fix specifically those issues — don't re-architect or expand scope. Note in Decisions & Deviations that this is a retry addressing review feedback, and what changed.
- Fill in `## 3. Dev Implementation`: Changes Made, Decisions & Deviations
- Set `## 3. Dev Implementation` → `status: done`, top-level `status:` → `test`
- Write handoff.

**Test:**
- Write tests against the acceptance criteria
- Run only the tests scoped to this story — the files it touched and their direct dependents (e.g. `go test ./pkg/changed/...`, `jest path/to/changed`, `pytest path::`). Do not run the full project suite here; that runs once per scope, at the Step 5 gate. Use the runner's parallel/worker flags and its cache where available — avoid forcing a clean run unless something is actually stale.
- Fill in `## 4. Test Report`: Tests Written, Results, Coverage Notes
- Set `## 4. Test Report` → `status: done`, top-level `status:` → `review`
- Write handoff.

**Peer Review** (retry only — skip entirely when `attempts: 0`):
- Independently re-read the diff and the failed Review's Issues Found, without assuming the Dev fix worked
- Fill in `## 5. Peer Review`: Valid Findings, Dismissed Findings, Verdict
- Set `## 5. Peer Review` → `status: done`
- Write handoff.

**Review:**
- Read the full handoff, including Peer Review's findings if present
- Fill in `## 6. Review`: verify AC met, code quality, test coverage
- **Pass** → set top-level `status:` → `doc`. Exit the loop, continue to Doc below.
- **Needs-work:**
  - Increment `attempts`.
  - `attempts <= 2` → set top-level `status:` → `dev` (automatic retry). Write handoff, update manifest task status to `dev`. Announce: `↻ [S#] needs rework (attempt [attempts]/2) — retrying automatically.` Loop back to Dev.
  - `attempts > 2` → set top-level `status:` → `needs-work`. Write handoff. Update manifest. **Stop** — surface issues to user. Do not continue.

**Doc** (only reached after Review passes):
- Update companion docs for new or significantly changed files
- Fill in `## 7. Doc`
- Set `## 7. Doc` → `status: done`, top-level `status:` → `done`
- Write handoff. Update manifest task status to `done`.

Announce:
```
✓ [S#] complete — [story description] ([attempts] attempt(s))
  [X] of [N] stories done. Running /clear and continuing...
```

---

## Step 5 — Scope Complete

All stories in the current scope are done.

### Full-suite regression gate

This is the only point in the pipeline that runs the project's complete test suite — every story's Test phase above only ran tests scoped to its own changes. Start the full suite in the background (Bash `run_in_background`) using whatever parallel/worker flags the runner supports, so you can prepare the summary below while it runs, then wait for the result before proceeding.

- **Pass** → continue to the summary below.
- **Fail** → do not advance to the next scope. Match the failing test(s) against each story's "Files to Change" / "Changes Made" to identify the likely cause. Reopen that story: set its handoff and manifest status back to `needs-work`, and add to `## 6. Review` → Issues Found: "Full-suite regression: [failing test] — caught at scope gate, not story review." Print:
  ```
  ✗ Full-suite regression at scope gate: [scope-slug]
    Likely cause: [S#] — [failing test summary]
    Story reopened for rework. Re-run to fix before advancing.
  ```
  Stop. Do not print the scope summary or advance to the next scope.

Print the scope summary:

```
✓ Squad-spec complete: [scope-slug]

| # | Story | Verdict |
|---|-------|---------|
| S1 | [description] | pass |
| S2 | [description] | pass |

All [N] stories implemented.
```

### Advance to next scope (auto mode)

Read `.contextkit/spec/PROGRESS.md`. Get all completed scopes (`[x]`) in order. Find the current scope's position. Check if any completed scope comes after it.

**Next scope found:**
1. Delete `.contextkit/squad/manifest.md`
2. Write the next scope slug to `.contextkit/squad/next-scope.txt`
3. Print:
   ```
   → Advancing to next scope: [next-scope-slug]
     Continuing loop...
   ```
4. Do NOT stop — the driving mechanism (`/loop` or `/goal`) will re-invoke, Step 1 will find no manifest, Step 2 will read `next-scope.txt` and continue.

**No next scope (all scopes exhausted):**

Print the full run summary:

```
✓ All scopes complete.

| Scope | Stories | Status |
|-------|---------|--------|
| [scope-1] | [N] | done |
| [scope-2] | [N] | done |

Full spec implemented. Run complete.
```

Stop. Do not signal continuation — this satisfies `/loop`'s next check and `/goal`'s completion condition alike.
