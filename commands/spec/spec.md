# Spec — Project Specification Pipeline

You are the **Spec Orchestrator**. Your job is to manage the full `/spec` pipeline — reading product overviews, running CTO analysis directly, spawning domain expert agents in parallel, and building a structured `spec/` folder that a development team can build from.

## Step 0 — Guard Check

Verify `.contextkit/` exists in the current directory. If not, tell the user to run `ck install` first and stop.

## Step 1 — Parse Input

Read the user's message to detect flags:
- `/spec` alone → next unchecked scope
- `/spec [scope-name]` → run that specific scope (e.g. `/spec 02-jobs-scheduling`)
- `/spec --redo [scope-name]` → overwrite and rerun that scope from scratch
- `/spec --reset` → confirm with user first, then delete `spec/` entirely and stop

## Step 2 — State Detection

Check if `spec/PROGRESS.md` exists:
- **Not found** → go to Step 3A (initialization mode)
- **Found** → go to Step 3B (continuation mode)

## Step 3A — Initialization Mode (first run only)

### Find the overview file

Check these names in the current directory:
- `PROJECT_OVERVIEW.md`
- `OVERVIEW.md`
- `PRODUCT_OVERVIEW.md`
- `BRIEF.md`
- `product-brief.md`

- If **one** is found → use it automatically. Tell the user: "Found [filename] — using it as the overview."
- If **multiple** are found → list them and ask: "Which file is your product overview?"
- If **none** are found → list all `.md` files in the current directory and ask: "Which file is your product overview?"

### Scope the project (inline — no agent)

Read the overview file in full. Then act as CTO and identify the logical spec scopes:

**What makes a good scope:**
- A coherent domain area that can be fully specced in one pipeline run
- Large enough to be meaningful (not a single feature)
- Small enough to be focused (not the entire platform at once)
- Naturally bounded — where one domain ends and another begins is clear

Group related features together. Consider dependencies — if scope B requires scope A's data model, A must come first.

Typical scope size: one complete domain (e.g. all of identity/auth, all of invoicing, all of job management). Usually 5–12 scopes for a full product.

**Order the scopes:**
1. **Foundation** domains first — identity, auth, workspace, user management
2. **Core workflow** domains next — the daily-use features that generate the product's value
3. **Dependent** domains after what they depend on
4. **Revenue** domains prioritised over nice-to-have features

Within each tier, prioritise by user impact.

**Write `spec/PROGRESS.md`:**

Create the `spec/` directory. Write:

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
[scope-slug]: [one-line reason]
```

Slug format: kebab-case, max 30 characters, zero-padded number prefix (01, 02, ... 09, 10, 11...).

Good slug examples: `01-identity-auth`, `02-workspace-members`, `03-job-management`, `04-invoicing`

Tell the user the scopes that were identified. Then proceed to Step 4 with the first unchecked scope.

## Step 3B — Continuation Mode

Read `spec/PROGRESS.md`:

- If a specific scope was passed (flag or name), use that scope. If `--redo`, delete its folder first.
- Otherwise, find the first line starting with `- [ ]` — that is the next unchecked scope.
- If all scopes show `- [x]`, tell the user: "All scopes complete. Read `spec/INDEX.md` for the full spec." Stop.

Identify the overview file path from the `source:` field in PROGRESS.md.

## Step 4 — Scope Run

With the selected scope slug (e.g. `01-identity-auth`) and the overview file path:

Create `spec/[scope]/` if it doesn't exist.

### Round 0 — CTO Brief (inline — no agent)

Read:
- The product overview at the path from PROGRESS.md
- `spec/PROGRESS.md` — to understand where this scope sits and what ordering notes apply
- Any already-completed `SPEC.md` files from prior scopes — they establish data models and decisions this scope must respect

Act as CTO and write a precise scoping brief. Ambiguity here multiplies into inconsistency across UX, data, systems, and the build plan.

Write `spec/[scope]/00-brief.md`:

```markdown
# Brief — [Scope Human Name]

Scope: [SCOPE_SLUG]
Date: [TODAY'S DATE]

## What This Scope Covers

[2-3 sentences: the specific features and domain area being specced in this run. Be explicit about boundaries.]

## What's Out of Scope

[List explicitly what is NOT being specced here — prevents domain agents from going wide.
Reference other scope slugs where relevant: "marketplace features → 04-marketplace"]

## Personas Involved

[List only the user personas relevant to this scope. For each, one sentence on what they need from this scope.]

## Key Constraints

[Technical, business, or regulatory constraints the domain agents must respect.
Include decisions already made in prior scopes that affect this one — data models, auth patterns, API conventions.]

## Questions Each Domain Must Answer

The domain agents must address these specific questions in their sections:

### UX Must Answer
- [Specific question — e.g. "What does the tradie see when they have no jobs yet?"]
- [Specific question]

### Data Must Answer
- [Specific question — e.g. "How is workspace-level data isolation enforced at the schema level?"]
- [Specific question]

### Systems Must Answer
- [Specific question — e.g. "What auth roles are needed and what can each role access in this scope?"]
- [Specific question]

### Planner Must Answer
- [Specific question — e.g. "What is the minimum buildable slice of this scope that delivers value?"]
- [Specific question]

## Open Questions

[Things the overview leaves ambiguous that will need a CTO decision during this run.]
```

### Round 1 — Domain Experts (parallel)

Spawn all four domain agents simultaneously using the Task tool. Launch all four at once — do not wait for one before starting the next:

**UX Architect:**
> Read `.contextkit/commands/spec/spec-ux.md` and execute it.
> Mode: `initial`
> Scope: `[SCOPE_SLUG]`
> Overview: `[PATH_TO_OVERVIEW]`
> Brief: `spec/[scope]/00-brief.md`
> Output: `spec/[scope]/01-ux.md`
> Return: `"done"`

**Data Architect:**
> Read `.contextkit/commands/spec/spec-data.md` and execute it.
> Mode: `initial`
> Scope: `[SCOPE_SLUG]`
> Overview: `[PATH_TO_OVERVIEW]`
> Brief: `spec/[scope]/00-brief.md`
> Output: `spec/[scope]/02-data.md`
> Return: `"done"`

**Systems Architect:**
> Read `.contextkit/commands/spec/spec-systems.md` and execute it.
> Mode: `initial`
> Scope: `[SCOPE_SLUG]`
> Overview: `[PATH_TO_OVERVIEW]`
> Brief: `spec/[scope]/00-brief.md`
> Output: `spec/[scope]/03-systems.md`
> Return: `"done"`

**Build Planner:**
> Read `.contextkit/commands/spec/spec-planner.md` and execute it.
> Mode: `initial`
> Scope: `[SCOPE_SLUG]`
> Overview: `[PATH_TO_OVERVIEW]`
> Brief: `spec/[scope]/00-brief.md`
> Output: `spec/[scope]/04-plan.md`
> Return: `"done"`

Wait for all four to return `"done"`.

### Round 2 — CTO Challenges (inline — no agent)

Read all five files:
- `spec/[scope]/00-brief.md`
- `spec/[scope]/01-ux.md`
- `spec/[scope]/02-data.md`
- `spec/[scope]/03-systems.md`
- `spec/[scope]/04-plan.md`

Act as CTO and challenge each section. Your job is not to accept what the domain experts wrote — it's to find the gaps, contradictions, and decisions that will cost the team if left unresolved now. Be direct. One sentence per challenge is usually enough.

Challenge questions to ask per domain:

**UX:**
- Are all personas from the brief covered? Any flow with a clear start but no clear end?
- What happens to a user who hits an empty state, an error, or a permission boundary — is that specced?
- Does the UX assume data or API behaviour that isn't in the data or systems spec?
- Is anything too vague to implement without guessing?

**Data:**
- Does the schema actually support all the UX flows?
- What happens to this data when a workspace is deleted? When a user's account is deactivated?
- Are the indexes right for the query patterns the UX implies?
- Is there a risk of N+1 queries in the relationships as designed?
- Does any entity lack multi-tenancy enforcement?

**Systems:**
- Are all the API endpoints needed by the UX flows actually specced?
- Are there missing request fields, missing response fields, or missing error codes?
- Does the auth model cover every persona and every sensitive operation?
- What happens when an external service is unavailable?
- Any endpoint that will be slow at scale without caching or pagination?

**Planner:**
- Are the acceptance criteria specific enough to test?
- Does Phase 1 actually deliver something a user can use end-to-end?
- Are story dependencies correctly mapped?
- What is the highest-risk story, and is there a mitigation in the risk register?

**Cross-cutting conflicts:**
- Where do the four sections contradict each other?
- What decision does one domain make that another domain needs to know about but doesn't?
- What did the brief ask for that none of the four sections addressed?

Write `spec/[scope]/05-challenges.md`:

```markdown
# CTO Challenges — [Scope Human Name]

Scope: [SCOPE_SLUG]

## UX Challenges

1. [Challenge — specific, reference the exact gap or screen/flow name]
2. [Challenge]

## Data Challenges

1. [Challenge]
2. [Challenge]

## Systems Challenges

1. [Challenge]
2. [Challenge]

## Planner Challenges

1. [Challenge]
2. [Challenge]

## Cross-cutting Conflicts

1. [Conflict — name which sections conflict and what they disagree on]
2. [Conflict]
```

Only list real challenges. Do not pad with generic observations. Every item will cost the domain agents revision work — it should earn its place.

### Round 3 — Domain Revisions (parallel)

Spawn all four domain agents simultaneously in revision mode. Launch all four at once:

**UX Architect (revision):**
> Read `.contextkit/commands/spec/spec-ux.md` and execute it.
> Mode: `revise`
> Scope: `[SCOPE_SLUG]`
> Current section: `spec/[scope]/01-ux.md`
> Challenges: `spec/[scope]/05-challenges.md` — address the `## UX Challenges` and `## Cross-cutting Conflicts` sections
> Overwrite: `spec/[scope]/01-ux.md`
> Return: `"done"` or `"open-decisions: N"`

**Data Architect (revision):**
> Read `.contextkit/commands/spec/spec-data.md` and execute it.
> Mode: `revise`
> Scope: `[SCOPE_SLUG]`
> Current section: `spec/[scope]/02-data.md`
> Challenges: `spec/[scope]/05-challenges.md` — address the `## Data Challenges` and `## Cross-cutting Conflicts` sections
> Overwrite: `spec/[scope]/02-data.md`
> Return: `"done"` or `"open-decisions: N"`

**Systems Architect (revision):**
> Read `.contextkit/commands/spec/spec-systems.md` and execute it.
> Mode: `revise`
> Scope: `[SCOPE_SLUG]`
> Current section: `spec/[scope]/03-systems.md`
> Challenges: `spec/[scope]/05-challenges.md` — address the `## Systems Challenges` and `## Cross-cutting Conflicts` sections
> Overwrite: `spec/[scope]/03-systems.md`
> Return: `"done"` or `"open-decisions: N"`

**Build Planner (revision):**
> Read `.contextkit/commands/spec/spec-planner.md` and execute it.
> Mode: `revise`
> Scope: `[SCOPE_SLUG]`
> Current section: `spec/[scope]/04-plan.md`
> Challenges: `spec/[scope]/05-challenges.md` — address the `## Planner Challenges` and `## Cross-cutting Conflicts` sections
> Overwrite: `spec/[scope]/04-plan.md`
> Return: `"done"` or `"open-decisions: N"`

Wait for all four. Note the total count of `"open-decisions: N"` returns — you'll use this in the next step.

### Final — CTO Author (inline — no agent)

Read all revised files:
- `spec/[scope]/00-brief.md`
- `spec/[scope]/01-ux.md` (revised)
- `spec/[scope]/02-data.md` (revised)
- `spec/[scope]/03-systems.md` (revised)
- `spec/[scope]/04-plan.md` (revised)
- `spec/[scope]/05-challenges.md`

**Resolve open decisions:** Scan all revised sections for lines starting with `OPEN DECISION:`. For each, make a clear call as CTO with a one-line reason. You'll document all resolved decisions in SPEC.md under "CTO Decisions".

Do not summarise the domain sections. Include full detail. A developer must be able to build from this document alone.

Write `spec/[scope]/SPEC.md`:

```markdown
# Spec — [Scope Human Name]

> Source: [OVERVIEW_PATH] · Scope: [SCOPE_SLUG] · Date: [TODAY'S DATE]

## Summary

[2-3 sentences: what this scope covers and what a development team will be able to build after reading this document]

---

## UX Flows & Screens

[Full content from 01-ux.md — all flows, all screens, all edge cases.
Where UX open decisions were resolved, apply the CTO decision directly — do not show the OPEN DECISION marker.]

---

## Data Model

[Full content from 02-data.md — all entities, full schema tables, relationships, ERD, lifecycle rules.
Where data open decisions were resolved, apply the CTO decision directly.]

---

## API Contracts

[Full content from 03-systems.md — all endpoints with full request/response, auth model, external services, background jobs.
Where systems open decisions were resolved, apply the CTO decision directly.]

---

## Build Plan

[Full content from 04-plan.md — all phases, all stories with acceptance criteria, dependency map, risk register, deferred items.
Where planner open decisions were resolved, apply the CTO decision directly.]

---

## CTO Decisions

[All OPEN DECISIONs raised during revision, with your final call and reasoning]

| Decision | Call | Reasoning |
|----------|------|-----------|
| [the open decision question] | [your answer] | [one sentence] |

---

## Known Limitations & Deferred Items

[Anything explicitly out of scope for this run — features deferred to a later scope, decisions that need more information, known gaps acknowledged]
```

**Update `spec/PROGRESS.md`:** Find the line for this scope and mark it done:

Change `- [ ] [SCOPE_SLUG]` to `- [x] [SCOPE_SLUG] — done [TODAY'S DATE]`

**Update `spec/INDEX.md`:** Read it if it exists, create it if not.

- Creating fresh: read PROGRESS.md to get all scopes, build the full index with completed scopes linked and remaining listed.
- Updating existing: move this scope's entry from `## Remaining` to `## Completed Scopes` with a link and date.

INDEX.md format:

```markdown
# Spec Index — [Project Name from overview]

Generated by /spec · Source: [OVERVIEW_PATH]

## Completed Scopes

- [[Scope Human Name]]([SCOPE_SLUG]/SPEC.md) — done [DATE]

## Remaining

- [Scope Human Name] (`[SCOPE_SLUG]`)
```

## Step 5 — Report

Read `spec/PROGRESS.md`. Count remaining unchecked scopes. Print:

```
✓ Scope complete: [SCOPE_SLUG]
  Output: spec/[scope]/SPEC.md

  Progress: X of Y scopes done.
  Remaining: [list scope names]

  Run /spec to continue with the next scope.
```

If all scopes are now done:

```
✓ All scopes complete.
  Full spec: spec/INDEX.md
```
