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
- `/spec --reset` → confirm with user first, then delete `spec/` entirely and stop
- `/spec --add [scope-slug]` → append a new scope and run it → **Step 3C**
- `/spec --add` (no slug) → stop: "Provide a scope slug: `/spec --add [scope-slug]`"
- `/spec --extend [scope-slug]` → extend an existing scope with new stories → **Step 3D**
- `/spec --extend` (no slug) → stop: "Provide a scope slug: `/spec --extend [scope-slug]`"

## Step 2 — State Detection

_(Reached only from `/spec` alone)_

Check if `spec/PROGRESS.md` exists:
- **Not found** → go to Step 3A (initialization mode, auto-detect overview)
- **Found** → go to Step 3B (continuation mode)

## Step 2B — Overview-File Init

_(Reached when the argument ends in `.md`)_

The user supplied an explicit overview file (e.g. `/spec MY_OVERVIEW.md`).

1. Check if `spec/PROGRESS.md` exists:

   - **Not found** → proceed to Step 3A, using the supplied file as the overview. Skip the auto-detection logic.

   - **Found, same source** → the supplied file matches the `source:` field in `spec/PROGRESS.md`. Resume normally: proceed to Step 3B (next unchecked scope).

   - **Found, different source** → conflict. Read the `source:` field and count completed vs total scopes. Prompt the user:

     > Found existing spec from `[OLD_SOURCE]` ([X] of [Y] scopes done). Archive it and start fresh with `[NEW_SOURCE]`? (yes/no)

     - **yes** → archive: rename `spec/` to `spec-archived-[YYYYMMDDHHMMSS]/`. If that name already exists, append `-2`, `-3`, etc. until the name is free. Then proceed to Step 3A using the supplied file as the overview.
     - **no** → stop: "Run `/spec` to continue the existing spec, or `/spec --reset` to clear it manually."

## Step 3A — Initialization Mode

_(Reached from Step 2 when no `spec/PROGRESS.md` exists, or from Step 2B after archiving / on first run with a new file)_

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

**Write `spec/PROGRESS.md`:**

```markdown
# Spec Progress

source: [PATH_TO_OVERVIEW]
created: [TODAY'S DATE]

## Scopes

- [ ] 01-[scope-slug]
- [ ] 02-[scope-slug]
- [ ] 03-[scope-slug]
[continue for all scopes]

## Scope Notes

[scope-slug]: [one-line reason for ordering or key dependency]
```

Slug format: kebab-case, max 30 characters, zero-padded number prefix (01, 02, ... 09, 10, 11...).

Tell the user the scopes identified. Then proceed to Step 4 with the first unchecked scope.

## Step 3B — Continuation Mode

Read `spec/PROGRESS.md`:
- If a specific scope was passed, use that scope. If `--redo`, delete its folder first.
- Otherwise find the first line starting with `- [ ]` — that is the next unchecked scope.
- If all scopes show `- [x]`, tell the user: "All scopes complete. Read `spec/INDEX.md` for the full spec." Stop.

Identify the overview file path from the `source:` field in PROGRESS.md.

## Step 3C — Add Scope (`--add`)

1. Check `spec/PROGRESS.md` exists. If not: stop — "No active spec. Run `/spec OVERVIEW.md` first to initialise."
2. Read `spec/PROGRESS.md`. Find the highest scope number in all existing scope lines (both checked and unchecked). Increment by 1, zero-pad to 2 digits (e.g. `05`).
3. Append the new scope line to the `## Scopes` block: `- [ ] [NN]-[scope-slug]`
4. Tell the user: "Added scope `[NN]-[scope-slug]`. Running it now."
5. Proceed to Step 4 for the new scope, using the `source:` file from PROGRESS.md as the overview.

## Step 3D — Extend Scope (`--extend`)

1. Check that `spec/[scope-slug]/SPEC.md` exists. If not: stop — "Scope `[scope-slug]` not found. Check `spec/PROGRESS.md` for valid scope slugs."
2. Read `spec/[scope-slug]/SPEC.md` and the overview file (from `source:` in `spec/PROGRESS.md`).
3. Identify new stories — user flows or features present in the overview (or now reasonably implied) that are **not already listed** in the `## Stories` table of that SPEC.md.
4. If none: tell the user "No new stories identified — SPEC.md is up to date." Stop.
5. Append new rows to the `## Stories` table (continuing the existing numbering: S[N+1], S[N+2], …).
6. Append new `/squad "..."` lines to the `### Squad Commands` block.
7. Add a note immediately after the `## Stories` heading (or at the end of the section): `Extended: [TODAY'S DATE] — [N] stories added`
8. **Do not** modify the Data Model, API Contracts, or UX Flows sections unless the new stories strictly require new fields or endpoints — if they do, append the additions rather than rewriting.
9. Tell the user: "Extended `[scope-slug]`: [N] new stories added."

## Step 4 — Scope Run

Create `spec/[scope]/` if it doesn't exist.

### Read context

Read:
- The product overview
- `spec/PROGRESS.md` — to understand where this scope sits and what ordering notes apply
- Any already-completed `SPEC.md` files from prior scopes — their data models and API conventions are constraints you must respect in this scope

### Write SPEC.md (single CTO pass)

Act as CTO and write `spec/[scope]/SPEC.md` directly. Cover all domains in sequence. This is a reference document developers build from — be specific, not exhaustive.

Where you fill in detail not explicit in the overview, mark it inline:
`ASSUMPTION: [what you're assuming] — [brief reasoning]`

```markdown
# Spec — [Scope Human Name]

> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Date: [TODAY'S DATE]

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

| # | Story | Size | Depends on |
|---|-------|------|-----------|
| S1 | [one-line description of what gets built] | S/M/L | — |
| S2 | [one-line description] | S/M/L | S1 |

### Squad Commands

```
/squad "S1 — [Story Title]: [what to build + key acceptance criteria in one sentence]"
/squad "S2 — [Story Title]: [what to build + key acceptance criteria in one sentence]"
```

Each command is self-contained — squad can run it without reading this spec.

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

### Update progress files

**Update `spec/PROGRESS.md`:** Mark this scope done:
`- [ ] [SCOPE_SLUG]` → `- [x] [SCOPE_SLUG] — done [TODAY'S DATE]`

**Update `spec/INDEX.md`:** Read it if it exists, create it if not.

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
  Output: spec/[scope]/SPEC.md

  Progress: X of Y scopes done.
  Remaining: [scope names]

  Run /spec to continue with the next scope.
```

If all scopes are done:

```
✓ All scopes complete.
  Full spec: spec/INDEX.md
```

Stop. Do not signal continuation — the loop ends here.
