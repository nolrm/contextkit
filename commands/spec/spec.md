# Spec — Project Specification

You are the **CTO**. Your job is to read a product overview and produce a full reference spec — one scope at a time. Single inline pass per scope. No agents, no revision rounds.

## Step 0 — Guard Check

Verify `.contextkit/` exists in the current directory. If not, tell the user to run `ck install` first and stop.

## Step 1 — Parse Input

Read the user's message to detect flags and arguments:

- `/spec` alone → next unchecked scope → **Step 2**
- `/spec [file.md]` (any argument ending in `.md`) → overview-file-driven init → **Step 2B**
- `/spec [scope-name]` (argument does NOT end in `.md`) → run that specific scope → **Step 3B**
- `/spec --redo [scope-name]` → overwrite and rerun that scope from scratch → **Step 3B**
- `/spec --reset` → confirm with user first, then delete `.contextkit/spec/` entirely and stop
- `/spec --add [scope-slug]` → append a new scope and run it → **Step 3C**
- `/spec --add` (no slug) → stop: "Provide a scope slug: `/spec --add [scope-slug]`"
- `/spec --extend [scope-slug]` → extend an existing scope with new stories → **Step 3D**
- `/spec --extend` (no slug) → stop: "Provide a scope slug: `/spec --extend [scope-slug]`"
- `/spec --verify [scope-slug]` → re-check a built scope's Acceptance Criteria against the current code → **Step 3E**
- `/spec --verify` (no slug) → stop: "Provide a scope slug: `/spec --verify [scope-slug]`"

**Mode override:** `--full` or `--lite` may accompany `/spec` or `/spec [file.md]` (e.g. `/spec PLAN.md --lite`) to force the spec mode instead of auto-detecting it. Strip the flag before routing with the rules above. Both flags together → stop: "Pass only one of `--full` / `--lite`." The override only takes effect when a new spec is initialized (Step 3A); if the run resumes an existing spec instead, ignore it and tell the user: "Mode is fixed per spec run — this spec is already in `[mode]` mode. Use `/spec --reset` and re-run with `--[mode]` to change it."

## Step 2 — State Detection

_(Reached only from `/spec` alone)_

Check if `.contextkit/spec/PROGRESS.md` exists:
- **Not found** → go to Step 3A (initialization mode, auto-detect overview)
- **Found** → go to Step 3B (continuation mode)

## Step 2B — Overview-File Init

_(Reached when the argument ends in `.md`)_

The user supplied an explicit overview file (e.g. `/spec MY_OVERVIEW.md`).

1. Check if `.contextkit/spec/PROGRESS.md` exists:

   - **Not found** → proceed to Step 3A, using the supplied file as the overview. Skip the auto-detection logic.

   - **Found, same source** → the supplied file matches the `source:` field in `.contextkit/spec/PROGRESS.md`. Resume normally: proceed to Step 3B (next unchecked scope).

   - **Found, different source** → conflict. Read the `source:` field and count completed vs total scopes. Prompt the user:

     > Found existing spec from `[OLD_SOURCE]` ([X] of [Y] scopes done). Archive it and start fresh with `[NEW_SOURCE]`? (yes/no)

     - **yes** → archive: rename `.contextkit/spec/` to `.contextkit/spec-archived-[YYYYMMDDHHMMSS]/`. If that name already exists, append `-2`, `-3`, etc. until the name is free. Then proceed to Step 3A using the supplied file as the overview.
     - **no** → stop: "Run `/spec` to continue the existing spec, or `/spec --reset` to clear it manually."

## Step 3A — Initialization Mode

_(Reached from Step 2 when no `.contextkit/spec/PROGRESS.md` exists, or from Step 2B after archiving / on first run with a new file)_

### Find the overview file

- If an overview file was supplied (from Step 2B): use it. Tell the user: "Using `[filename]` as the overview."
- Otherwise, check these names in the current directory:
  - `PROJECT_OVERVIEW.md`
  - `OVERVIEW.md`
  - `PRODUCT_OVERVIEW.md`
  - `BRIEF.md`
  - `product-brief.md`
  - If **one** is found → use it automatically. Tell the user: "Found [filename] — using it as the overview."
  - If **multiple** are found → list them and ask: "Which file is your product overview?"
  - If **none** are found → list all `.md` files in the current directory and ask: "Which file is your product overview?"

### Classify the input (automatic — do not ask the user)

If `--full` or `--lite` was passed (Step 1), use that mode, skip the classification below, and state it in the scopes announcement as e.g. `Running in lite mode (--lite override).`

Otherwise, read the overview file in full, then decide **full** or **lite** mode:

- **full** — the default. Use when the overview reads as a product idea: features described in terms of user value, no assumption the reader can see the codebase, data model / API / UX still open decisions.
- **lite** — use when the overview reads as an implementation plan against a system that already exists: it names specific files, functions, or components to modify; includes a "current state" / "what's already built" section; describes closing gaps or wiring together existing pieces rather than designing new ones; or states that schema/API/UX for the area are already decided and unchanged.

Weigh the signals — a few incidental file references in an otherwise idea-level doc don't tip it to lite; a doc that is *structured around* existing code (per-phase changes with named files, "verified current state" framing, no new entities/endpoints) does.

Set the mode and move on without asking. State the decision to the user in one line as part of the scopes announcement in the next section, e.g.:
`Detected an existing-system implementation plan — running in lite mode (Stories + Acceptance Criteria per scope, no Data Model/API/UX regeneration). Re-run with --full to override.`

If a later scope in this same spec turns out to need the other mode (rare — e.g. a lite-mode spec whose overview is later edited to include real greenfield feature work), don't switch mid-spec. Flag it to the user as an observation instead: mode is fixed per spec run, decided once at init, so a genuine mismatch means starting a new spec (`/spec --reset`, then re-run with `--full` or `--lite`) rather than mixing modes across scopes.

### Define scopes (inline)

Read the overview file in full. Act as CTO and identify the logical spec scopes.

**What makes a good scope:**
- A coherent domain area that can be fully specced in one pass
- Large enough to be meaningful (not a single feature)
- Small enough to be focused (not the entire platform at once)
- Naturally bounded — where one domain ends and another begins is clear

**Order the scopes:**
1. **Foundation** domains first — identity, auth, workspace, user management
2. **Core workflow** domains next — the daily-use features that generate the product's value
3. **Dependent** domains after what they depend on
4. **Revenue** domains prioritised over nice-to-have features

Typical project: 5–12 scopes. Good slug examples: `01-identity-auth`, `02-workspace-members`, `03-job-management`, `04-invoicing`

**Write `.contextkit/spec/PROGRESS.md`:**

```markdown
# Spec Progress

source: [PATH_TO_OVERVIEW]
created: [TODAY'S DATE]
mode: [full|lite]

## Scopes

- [ ] 01-[scope-slug]
- [ ] 02-[scope-slug]
- [ ] 03-[scope-slug]
[continue for all scopes]

## Scope Notes

[scope-slug]: [one-line reason for ordering or key dependency]
```

Slug format: kebab-case, max 30 characters, zero-padded number prefix (01, 02, ... 09, 10, 11...).

Tell the user the scopes identified, including the mode line from the classification step above. Then proceed to Step 4 with the first unchecked scope.

## Step 3B — Continuation Mode

Read `.contextkit/spec/PROGRESS.md`:
- If a specific scope was passed, use that scope. If `--redo`, delete its folder first.
- Otherwise find the first line starting with `- [ ]` — that is the next unchecked scope.
- If all scopes show `- [x]`, tell the user: "All scopes complete. Read `.contextkit/spec/INDEX.md` for the full spec." Stop.

Identify the overview file path from the `source:` field in PROGRESS.md, and the mode from the `mode:` field (spec runs created before this field existed have no `mode:` line — treat those as `full`).

## Step 3C — Add Scope (`--add`)

1. Check `.contextkit/spec/PROGRESS.md` exists. If not: stop — "No active spec. Run `/spec OVERVIEW.md` first to initialise."
2. Read `.contextkit/spec/PROGRESS.md`. Find the highest scope number in all existing scope lines (both checked and unchecked). Increment by 1, zero-pad to 2 digits (e.g. `05`).
3. Append the new scope line to the `## Scopes` block: `- [ ] [NN]-[scope-slug]`
4. Tell the user: "Added scope `[NN]-[scope-slug]`. Running it now."
5. Proceed to Step 4 for the new scope, using the `source:` file from PROGRESS.md as the overview.

## Step 3D — Extend Scope (`--extend`)

1. Check that `.contextkit/spec/[scope-slug]/SPEC.md` exists. If not: stop — "Scope `[scope-slug]` not found. Check `.contextkit/spec/PROGRESS.md` for valid scope slugs."
2. Read `.contextkit/spec/[scope-slug]/SPEC.md` and the overview file (from `source:` in `.contextkit/spec/PROGRESS.md`).
3. Identify new stories — user flows or features present in the overview (or now reasonably implied) that are **not already listed** in the `## Stories` table of that SPEC.md.
4. If none: tell the user "No new stories identified — SPEC.md is up to date." Stop.
5. Append new rows to the `## Stories` table (continuing the existing numbering: S[N+1], S[N+2], …).
6. Append a new EARS-format block for each new story to `### Acceptance Criteria`, matching the format already used there.
7. Append new `/squad "..."` lines to the `### Squad Commands` block.
8. Add a note immediately after the `## Stories` heading (or at the end of the section): `Extended: [TODAY'S DATE] — [N] stories added`
9. In full-mode scopes: **do not** modify the Data Model, API Contracts, or UX Flows sections unless the new stories strictly require new fields or endpoints — if they do, append the additions rather than rewriting. Lite-mode scopes have no such sections — skip this step.
10. Tell the user: "Extended `[scope-slug]`: [N] new stories added."

## Step 3E — Verify Scope (`--verify`)

_(Reached from Step 1 when `--verify [scope-slug]` is passed. Independent of the scope-run loop — doesn't touch `PROGRESS.md` or advance anything.)_

Checks whether the code actually satisfies what a spec promised, since a spec built weeks ago can drift from the code that shipped for it (the standard failure mode of static specs: nothing re-checks them after the build). This is a judgment task, not a mechanical one — reading a Go handler and deciding whether it satisfies "the system SHALL return 403" takes understanding the code, not just grepping for a string.

1. Check `.contextkit/spec/[scope-slug]/SPEC.md` exists. If not: stop — "Scope `[scope-slug]` not found."
2. Read the full SPEC.md — every story's Acceptance Criteria block — and the current codebase relevant to this scope (use the Story titles and, in full mode, the Data Model/API Contracts sections, as your map of where to look; in lite mode, follow `### Spec Reference` to the original source doc's description of the affected files).
3. For each AC bullet, decide one of:
   - **verified** — the current code satisfies this line. Cite the file/function that does it.
   - **drifted** — code exists for the general area but no longer satisfies this specific line (changed behavior, removed handling, a renamed field this line still references). Cite what you found instead and where (`file:line`).
   - **unknown** — you can't find code that clearly addresses this line either way (possibly never built, or built somewhere this scan didn't cover). Say what you looked for and where.
4. Append (or replace, if re-running) a `## Verification` section at the end of SPEC.md:

```markdown
## Verification

Last checked: [TODAY'S DATE]

**S1 — [Story Title]**
- ✅ verified — WHEN [event]... (src/foo.ts:42)
- ⚠️ drifted — IF [precondition]... — code now does [X] instead, see src/bar.ts:10
- ❓ unknown — WHEN [event]... — no matching handler found under src/api/

**S2 — [Story Title]**
- ✅ verified — ...
```

5. Report a one-line summary: `Verified [scope-slug]: [N] verified, [N] drifted, [N] unknown out of [N] total AC lines.` If anything drifted or is unknown, list which stories need attention — don't silently fix the code or the spec; this step only reports.

## Step 4 — Scope Run

Create `.contextkit/spec/[scope]/` if it doesn't exist.

### Read context

Read:
- The product overview
- `.contextkit/spec/PROGRESS.md` — to understand where this scope sits, what ordering notes apply, and the `mode:` for this spec run
- Any already-completed `SPEC.md` files from prior scopes — in full mode, their data models and API conventions are constraints you must respect in this scope; in lite mode, prior scopes have no such sections to check against

### Write SPEC.md (single CTO pass)

Act as CTO and write `.contextkit/spec/[scope]/SPEC.md` directly. This is a reference document developers build from — be specific, not exhaustive.

Where you fill in detail not explicit in the overview, mark it inline:
`ASSUMPTION: [what you're assuming] — [brief reasoning]`

Use the template matching this spec's `mode` (from PROGRESS.md, Step 3B / set in Step 3A).

#### Full mode

Cover all domains in sequence:

```markdown
# Spec — [Scope Human Name]

> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Mode: full · Date: [TODAY'S DATE]

## Summary

[2-3 sentences: what this scope covers and what a team can build after reading this document]

## Personas

| Persona | What they need from this scope |
|---------|-------------------------------|
| [name] | [one sentence] |

---

## Data Model

[One subsection per entity. Any entity defined in a prior scope must not be redefined — reference it by name only.]

### [EntityName]

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | no | gen_random_uuid() | PK |
| workspace_id | uuid | no | | FK → workspaces.id |
| created_at | timestamptz | no | now() | |
| updated_at | timestamptz | no | now() | |
| deleted_at | timestamptz | yes | null | soft delete |

**Indexes:** [column(s) — reason]
**Constraints:** [constraint name: what it enforces]

```mermaid
erDiagram
  [EntityA] ||--o{ [EntityB] : "has many"
```

**Multi-tenancy:** [how workspace-level isolation is enforced]
**Lifecycle:** [what happens on workspace delete / user deactivation]

---

## API Contracts

[One subsection per endpoint. Follow conventions established in prior scopes.]

### [METHOD] /api/v1/[path]

**Purpose:** [one sentence]
**Auth:** [role required: owner / member / admin / public]
**Request:**
```json
{
  "field": "type — description"
}
```
**Response (200):**
```json
{
  "field": "type — description"
}
```
**Errors:** `400` [when] · `401` [when] · `403` [when] · `404` [when]

---

## UX Flows

[Key user journeys only — not screen-by-screen. Focus on what the developer needs to understand to implement correctly.]

### [Flow Name] — [Persona]

**Goal:** [what the user is trying to do]

1. [step — what the user does / what they see]
2. [step]
3. ...

**Success:** [end state]
**Key edge cases:** [the ones that affect implementation — permission boundaries, empty states, errors]

---

## Stories

Stories are ordered by dependency. Run them in sequence with `/squad`.

| # | Story | Size | Depends on | Status |
|---|-------|------|-----------|--------|
| S1 | [one-line description of what gets built] | S/M/L | — | pending |
| S2 | [one-line description] | S/M/L | S1 | pending |

### Acceptance Criteria

One block per story, written in EARS format (Easy Approach to Requirements Syntax) — each line names a trigger and the system's required response, so Review can check it against the diff line by line instead of judging it holistically. Use `WHEN [event], the system SHALL [response]` for behavior triggered by an action, and `IF [precondition], THEN the system SHALL [response]` for state-based rules. Keep each line testable by a single assertion — split compound criteria ("and"/"or") into separate lines.

**S1 — [Story Title]**
- WHEN [user/system action], the system SHALL [observable response]
- IF [precondition], THEN the system SHALL [observable response]

**S2 — [Story Title]**
- WHEN [user/system action], the system SHALL [observable response]

### Squad Commands

```
/squad "S1 — [Story Title]: [what to build]. AC: [criterion 1]; [criterion 2]."
/squad "S2 — [Story Title]: [what to build]. AC: [criterion 1]."
```

Each command is self-contained — squad can run it without reading this spec. `/squad-spec` reads the `### Acceptance Criteria` block above directly instead of parsing the command string.

---

## Open Questions

Resolve these before building the relevant story. Do not assume — escalate.

| Question | Blocks | Owner |
|----------|--------|-------|
| [question] | S# or "scope" | product / tech / stakeholder |

---

## Out of Scope

Features explicitly not built in this scope.

| Feature | Deferred to |
|---------|------------|
| [feature] | [scope slug] |
```

#### Lite mode

The overview already carries the data model, API contracts, and UX decisions for this scope (they live in the source doc, not here) — don't regenerate them. Extract only the build plan:

```markdown
# Spec — [Scope Human Name]

> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Mode: lite · Date: [TODAY'S DATE]
> Lite mode — data model, API, and UX are defined in the source doc and are unchanged for this scope; not restated here.

## Summary

[2-3 sentences: what this scope covers and what a team can build after reading this document]

---

## Stories

Stories are ordered by dependency. Run them in sequence with `/squad`.

| # | Story | Size | Depends on | Status |
|---|-------|------|-----------|--------|
| S1 | [one-line description of what gets built] | S/M/L | — | pending |
| S2 | [one-line description] | S/M/L | S1 | pending |

### Acceptance Criteria

One block per story, written in EARS format (Easy Approach to Requirements Syntax) — each line names a trigger and the system's required response, so Review can check it against the diff line by line instead of judging it holistically. Use `WHEN [event], the system SHALL [response]` for behavior triggered by an action, and `IF [precondition], THEN the system SHALL [response]` for state-based rules. Keep each line testable by a single assertion — split compound criteria ("and"/"or") into separate lines.

**S1 — [Story Title]**
- WHEN [user/system action], the system SHALL [observable response]
- IF [precondition], THEN the system SHALL [observable response]

**S2 — [Story Title]**
- WHEN [user/system action], the system SHALL [observable response]

### Squad Commands

```
/squad "S1 — [Story Title]: [what to build]. AC: [criterion 1]; [criterion 2]."
/squad "S2 — [Story Title]: [what to build]. AC: [criterion 1]."
```

Each command is self-contained — squad can run it without reading this spec. `/squad-spec` reads the `### Acceptance Criteria` block above directly instead of parsing the command string.

---

## Open Questions

Resolve these before building the relevant story. Do not assume — escalate.

| Question | Blocks | Owner |
|----------|--------|-------|
| [question] | S# or "scope" | product / tech / stakeholder |
```

If, while extracting stories, you find the overview *does* imply a genuinely new entity, endpoint, or flow for this scope (not just wiring existing pieces together), don't silently add Data Model/API/UX sections to a lite-mode doc — note it under Open Questions instead, flagged for the user to confirm whether this scope was misclassified.

### Validate SPEC.md

Before updating progress files, mechanically check what you just wrote — this catches the kind of format error that would otherwise waste an entire `/squad-spec` run before anyone notices:

1. **Every story in the `## Stories` table has an EARS-format Acceptance Criteria block.** Cross-check story numbers between the two.
2. **Every AC bullet matches EARS shape**: `WHEN [event], the system SHALL [response]` or `IF [precondition], THEN the system SHALL [response]`. A quick sanity pass: `grep -nE '^\- (WHEN|IF) ' SPEC.md` should return one line per bullet under `### Acceptance Criteria` — anything under that heading NOT matched is a format violation.
3. **No compound criteria** — a bullet with "and"/"or" after "SHALL" joining two independent, separately-testable outcomes should be split into two bullets instead. (Not every "and" is compound — "SHALL return the created record and a 201 status" is one observable outcome; "SHALL send an email and SHALL log the event" is two.)
4. **Every story has a corresponding `/squad "..."` line** in `### Squad Commands`.

If anything fails: fix it directly in the SPEC.md you just wrote — don't ask the user, this is a mechanical formatting issue, not a design decision. Re-check after fixing.

### Update progress files

**Update `.contextkit/spec/PROGRESS.md`:** Mark this scope done:
`- [ ] [SCOPE_SLUG]` → `- [x] [SCOPE_SLUG] — done [TODAY'S DATE]`

**Update `.contextkit/spec/INDEX.md`:** Read it if it exists, create it if not.

```markdown
# Spec Index — [Project Name]

Source: [OVERVIEW_PATH]

## Completed Scopes

- [Scope Human Name](./[SCOPE_SLUG]/SPEC.md) — done [DATE]

## Remaining

- [Scope Human Name] (`[SCOPE_SLUG]`)
```

## Step 5 — Report

```
✓ Scope complete: [SCOPE_SLUG]
  Output: .contextkit/spec/[scope]/SPEC.md

  Progress: X of Y scopes done.
  Remaining: [scope names]

  Run /spec to continue with the next scope.
```

If all scopes are done:

```
✓ All scopes complete.
  Full spec: .contextkit/spec/INDEX.md
```

Stop. Do not signal continuation — the loop ends here.
