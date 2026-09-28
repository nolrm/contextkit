---
description: Implement every story in a spec scope — loops continuously with context cleared between stories. Run /spec first to generate the scope.
argument-hint: '[scope-slug]'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
effort: high
context: fork
---

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

Read the full SPEC.md. Extract every story from the `## Stories` table, its EARS-format block in `### Acceptance Criteria`, and the `### Squad Commands` section.

**Validate before creating any handoff:** every story number in the `## Stories` table must have a matching `### Acceptance Criteria` block, every AC bullet must match EARS shape (`WHEN [event], the system SHALL [response]` or `IF [precondition], THEN the system SHALL [response]`), and every story must have a `/squad "..."` line in `### Squad Commands`. If anything fails this check, stop — do not create handoffs against a malformed spec. Tell the user which story/line failed and that `/spec --redo [scope-slug]` (or a manual edit) is needed first. This is a mechanical, non-optional check — a bad spec wastes an entire pipeline run before anyone notices otherwise.

Detect spec mode: read the `> Mode: full` or `> Mode: lite` field from the header block right under the title. Specs written before this field existed have no `Mode:` field — fall back to the old signal instead: a line reading `> Lite mode — ...` marks **lite**, its absence marks **full**. Lite mode means data model/API/UX for this scope live in the original source doc named on the `> Source:` line, not in SPEC.md; full mode means SPEC.md's own `## Data Model`/`## API Contracts`/`## UX Flows` sections are authoritative. Carry this mode into every handoff file created below.

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
spec-mode: [full|lite]

---

## 1. PO Spec

status: done

### User Story

As a [persona from spec], I want [what this story builds], so that [benefit].

### Acceptance Criteria

Copy this story's EARS-format block from SPEC.md's `## Stories` → `### Acceptance Criteria` verbatim — do not paraphrase or re-derive from the squad command string. Each line stays a single WHEN/IF…SHALL statement so Review can check it individually.
- [ ] WHEN [trigger], the system SHALL [response]
- [ ] IF [precondition], THEN the system SHALL [response]

### Edge Cases

Full mode: [from the spec's `## UX Flows` section — edge cases relevant to this story].
Lite mode (no `## UX Flows` in SPEC.md): read the source doc named on SPEC.md's `> Source:` line instead — pull edge cases from whatever it documents about this story's current/target behavior. If it documents none, write "none documented — verify during implementation."

### Out of Scope

Full mode: [from the spec's `## Out of Scope` section — filtered to this story].
Lite mode (no `## Out of Scope` in SPEC.md): leave as "not tracked separately in lite mode" unless the source doc explicitly calls something out as deferred.

### Spec Reference

Read before planning: `.contextkit/spec/[scope-slug]/SPEC.md`
- Full mode — data model constraints: `## Data Model`. API conventions: `## API Contracts`.
- Lite mode — SPEC.md has no Data Model/API Contracts sections; read the source doc named on SPEC.md's `> Source:` line instead. Its description of the existing system (files, functions, schema, endpoints already in place) is the hard constraint — do not invent alternatives.
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

### Open Question Resolutions

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

## 6. Review

status: pending
started:
completed:

### Prior Issues

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

Process the selected story through its phases, dispatching a fresh subagent per phase — each one gets an isolated context containing only the handoff file and the spec, never the reasoning trail from earlier phases. This prevents Review from anchoring on Dev's own account of its work. Start at Architect if the story was `pending`, or at the phase Step 3 identified if it was interrupted.

**Claude Code:** dispatch each phase below using the Task tool (`run_in_background: false` — phases are sequential, the orchestrator waits for each result before moving on). Pass exactly the prompt shown for that phase. The subagent reads the handoff file itself and writes its own section directly; it does not tell the user to run any command.

**Codex:** CLI 0.155.1+ ships a stable multi-agent capability (`multi_agent` feature flag) that can spawn an isolated subagent with its own context. Use it to dispatch each phase below the same way, if available in your installed version. If it isn't (older Codex, or the capability is disabled), fall back to running each phase's prompt inline in the current context, exactly as written, skipping the "dispatch a subagent" framing — the fallback is a capability gap, not a design choice.

Every dispatched prompt ends with: `Write the handoff file yourself. Return "done" or "error: <description>".` If a phase returns anything other than `"done"` (or `"done: pass"` / `"done: needs-work"` for Review): surface the error to the user and stop this story. After every phase completes, verify the handoff file actually changed (`started:`/`completed:` stamped, section `status:` set) before trusting a `"done"` — if it didn't, treat it as `error: subagent did not persist the handoff`.

**Architect** (runs once, never retried):

```
You are the Architect for one story in a squad-spec run. You have not seen any other phase's reasoning — work only from what's written below and in the files you read.

Handoff file: .contextkit/squad/handoff-[N].md — read `## 1. PO Spec`, including the `spec-mode:` field.
Spec: .contextkit/spec/[scope-slug]/SPEC.md — in full mode, its `## Data Model` and `## API Contracts` sections are hard constraints. In lite mode, SPEC.md has no such sections — follow `### Spec Reference` in the handoff to the original source doc instead; what it describes as already existing (files, functions, schema, endpoints) is the hard constraint. Do not design a new data model or API for a lite-mode story.

Fill in `## 2. Architect Plan`: Approach, Files to Change, Trade-offs, Implementation Steps.

If `## 1. PO Spec` → Spec Reference → "Open questions blocking this story" lists anything other than "none": squad-spec runs unattended — there is no human to escalate to, so resolve each question yourself. Under `### Open Question Resolutions`, write one line per question: `- Q: "[question]" → Resolved: "[assumption made]" — Rationale: "[why]"`. Do not leave a listed question unresolved and do not skip this section when questions exist; if there are none, leave it empty.

Stamp `started:`/`completed:`. Set `## 2. Architect Plan` → `status: done`, top-level `status:` → `dev`.
Write the handoff file yourself. Return "done" or "error: <description>".
```

Update manifest task status to `architect`.

### Dev → Test → Review loop

Repeat this block until Review passes or `attempts` hits the cap (2). `attempts` starts at 0 and is incremented each time Review sends the story back — this bookkeeping stays with the orchestrator, it isn't the Dev subagent's job to decide whether to loop.

**Dev:**

```
You are the Dev for one story in a squad-spec run. You have not seen the Architect's exploratory reasoning — only what's written in the handoff.

Handoff file: .contextkit/squad/handoff-[N].md — read `## 1. PO Spec` and `## 2. Architect Plan`.
[On retry only (attempts >= 1): also read `## 6. Review` → Issues Found from the failed pass. Fix specifically those issues — don't re-architect or expand scope. Note in Decisions & Deviations that this is a retry addressing review feedback, and what changed.]

Fill in `## 3. Dev Implementation`: Changes Made, Decisions & Deviations.
Stamp `started:`/`completed:`. Set `## 3. Dev Implementation` → `status: done`, top-level `status:` → `test`.
Write the handoff file yourself. Return "done" or "error: <description>".
```

**Test:**

```
You are the Tester for one story in a squad-spec run. You have not seen the Dev's implementation reasoning — only what's written in the handoff and the diff on disk.

Handoff file: .contextkit/squad/handoff-[N].md — read `## 1. PO Spec` and `## 3. Dev Implementation`.

Write tests against the acceptance criteria. Run only the tests scoped to this story — the files it touched and their direct dependents (e.g. `go test ./pkg/changed/...`, `jest path/to/changed`, `pytest path::`). Do not run the full project suite here; that runs once per scope, at the Step 5 gate. Use the runner's parallel/worker flags and its cache where available — avoid forcing a clean run unless something is actually stale.

Fill in `## 4. Test Report`: Tests Written, Results, Coverage Notes.
Stamp `started:`/`completed:`. Set `## 4. Test Report` → `status: done`, top-level `status:` → `review`.
Write the handoff file yourself. Return "done" or "error: <description>".
```

**Review** (Claude Code: dispatch on the primary model — omit `model`. This is the only gate between an unattended story and a commit, so it runs on the same model tier that wrote the code, never a smaller one):

```
You are the Reviewer for one story in a squad-spec run. You have not seen the Dev's or Tester's reasoning, only what they recorded in the handoff and the diff/test results on disk. Do not assume the code works because the handoff says it does — verify against the diff.

Handoff file: .contextkit/squad/handoff-[N].md — read `## 1. PO Spec` (acceptance criteria), `## 3. Dev Implementation`, and `## 4. Test Report`.

[On retry only (attempts >= 1): before overwriting `## 6. Review`, read its existing Issues Found from the previous pass. Under `### Prior Issues`, list each one as resolved or still open, citing the part of the diff that fixed it (or didn't). An issue the Dev only claims to have fixed is still open until the diff shows it.]

Fill in `## 6. Review`: check each acceptance criterion individually against the diff — they're EARS-format WHEN/IF…SHALL statements, so verify trigger and required response separately rather than judging the story holistically — plus code quality and test coverage against what's on disk. Any prior issue still open is a needs-work finding.
Stamp `started:`/`completed:`.
- Pass → set top-level `status:` → `doc`.
- Needs-work → leave top-level `status:` as `review`, list issues under Issues Found.
Write the handoff file yourself. Return "done: pass" or "done: needs-work" (or "error: <description>").
```

On the Review result:
- **`"done: pass"`** → continue to Doc below.
- **`"done: needs-work"`:**
  - Increment `attempts`.
  - `attempts <= 2` → set top-level `status:` → `dev` (automatic retry). Update manifest task status to `dev`. Announce: `↻ [S#] needs rework (attempt [attempts]/2) — retrying automatically.` Loop back to Dev.
  - `attempts > 2` → set top-level `status:` → `needs-work`. Update manifest. **Stop** — surface issues to user. Do not continue.

**Doc** (only reached after Review passes):

```
You are the Doc writer for one story in a squad-spec run. You have not seen the Dev's implementation reasoning — only what's recorded in the handoff.

Handoff file: .contextkit/squad/handoff-[N].md — read `## 3. Dev Implementation` (Changes Made) and `## 2. Architect Plan` (Files to Change).

Update companion docs for new or significantly changed files. Fill in `## 7. Doc`.
Stamp `started:`/`completed:`. Set `## 7. Doc` → `status: done`, top-level `status:` → `done`.
Write the handoff file yourself. Return "done" or "error: <description>".
```

**Commit** (orchestrator — not a subagent; runs after Doc's handoff write is verified):

Commit this story's changes now, before moving to the next story, so history stays story-granular and bisectable/revertable per story.

- Not a git repository (no `.git`) → skip this step entirely, no announcement needed.
- Otherwise, run `git status --porcelain`. Stage the files that correspond to this story — cross-check against `## 3. Dev Implementation` → Changes Made, `## 4. Test Report` → Tests Written, and `## 7. Doc` → Files Documented — with `git add <file> <file> ...`. If `git status --porcelain` shows anything unrelated to those (e.g. leftover changes from an earlier interrupted run), stop and surface it to the user instead of committing it blindly.
- Nothing staged (story was a no-op, e.g. a spike that only produced a finding doc already committed separately) → skip the commit, note "no changes to commit" in the story's announcement below, and continue.
- Otherwise commit:
  ```
  git commit -m "$(cat <<'EOF'
  <type>(<scope>): S[N] — <short story description>

  <1-2 sentence summary from Changes Made>
  [only if attempts > 0: "Required [attempts] retry attempt(s) after review."]

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  EOF
  )"
  ```
  Pick `<type>(<scope>)` per the same Conventional Commits rules `agent-push-checklist` enforces (`feat`/`fix`/`improve`/`docs`/`chore`/`refactor`/`test`).
- If `git commit` fails (e.g. a pre-commit hook rejects it): do not retry with `--no-verify`. Fix the underlying issue if it's something this pass caused (e.g. a lint failure), or if it can't be resolved here, set the story's top-level `status:` to `needs-work` with the failure recorded under `## 6. Review` → Issues Found, and stop this story — do not continue to the next story with this one uncommitted.
- After a successful commit (or "no changes to commit"), run `git rev-parse --short HEAD` and update this story's row in `.contextkit/spec/[scope-slug]/SPEC.md` → `## Stories` table: change its `Status` cell from `pending` to `done @ [sha]` (or `done @ [sha] (no-op)` if nothing was staged). This is the only place SPEC.md gets touched after `/spec` wrote it — a lightweight build record, not a spec edit; don't touch anything else in the file.

Update manifest task status to `done`.

Announce:
```
✓ [S#] complete — [story description] ([attempts] attempt(s))
  Committed: [commit subject line, or "no changes to commit"]
  [X] of [N] stories done. Running /clear and continuing...
```

---

## Step 5 — Scope Complete

All stories in the current scope are done.

### Full-suite regression gate

This is the only point in the pipeline that runs the project's complete test suite — every story's Test phase above only ran tests scoped to its own changes. Run it directly in the foreground, with the runner's parallelism kept low or serial (e.g. `jest --runInBand`, `go test -p 1 ./...`, `pytest -p no:xdist`) — this gate doesn't need to be fast, it needs the machine to stay usable while it runs. Wait for it to finish before doing anything else; the next scope does not start until this one is verified clean.

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

