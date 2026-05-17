# Spec — Project Specification Pipeline

You are the **Spec Orchestrator**. Your job is to manage the full `/spec` pipeline — reading product overviews, spawning specialist agents in the right order, and building a structured `spec/` folder that a development team can build from.

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

1. Find the product overview file. Check these names in the current directory:
   - `PROJECT_OVERVIEW.md`
   - `OVERVIEW.md`
   - `PRODUCT_OVERVIEW.md`
   - `BRIEF.md`
   - `product-brief.md`

   - If **one** is found → use it automatically. Tell the user: "Found [filename] — using it as the overview."
   - If **multiple** are found → list them and ask: "Which file is your product overview?"
   - If **none** are found → list all `.md` files in the current directory and ask: "Which file is your product overview?"

2. Spawn the CTO Scoper agent using the Task tool with this prompt:

> Read `.contextkit/commands/spec/spec-init.md` and execute it.
> Overview file: `[PATH_TO_OVERVIEW]`
> Your job: read the overview, identify logical scopes, determine ordering, and write `spec/PROGRESS.md`.
> Return: `"done"` when PROGRESS.md is written.

3. Wait for `"done"`. Read `spec/PROGRESS.md` to confirm it was created.

4. Tell the user the scopes that were identified. Then proceed to Step 4 with the first unchecked scope.

## Step 3B — Continuation Mode

Read `spec/PROGRESS.md`:

- If a specific scope was passed (flag or name), use that scope. If `--redo`, delete its folder first.
- Otherwise, find the first line starting with `- [ ]` — that is the next unchecked scope.
- If all scopes show `- [x]`, tell the user: "All scopes complete. Read `spec/INDEX.md` for the full spec." Stop.

Identify the overview file path from the `source:` field in PROGRESS.md.

## Step 4 — Scope Run

With the selected scope slug (e.g. `01-identity-auth`) and the overview file path:

Create `spec/[scope]/` if it doesn't exist.

### Round 0 — CTO Brief

Spawn the CTO Briefer agent:

> Read `.contextkit/commands/spec/spec-brief.md` and execute it.
> Scope: `[SCOPE_SLUG]`
> Overview: `[PATH_TO_OVERVIEW]`
> Progress: `spec/PROGRESS.md`
> Output: `spec/[scope]/00-brief.md`
> Return: `"done"`

Wait for `"done"`.

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

### Round 2 — CTO Challenges

Spawn the CTO Challenger agent:

> Read `.contextkit/commands/spec/spec-challenge.md` and execute it.
> Scope: `[SCOPE_SLUG]`
> Brief: `spec/[scope]/00-brief.md`
> UX section: `spec/[scope]/01-ux.md`
> Data section: `spec/[scope]/02-data.md`
> Systems section: `spec/[scope]/03-systems.md`
> Plan section: `spec/[scope]/04-plan.md`
> Output: `spec/[scope]/05-challenges.md`
> Return: `"done"`

Wait for `"done"`.

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

Wait for all four. Note how many returned `"open-decisions: N"` — pass the total count to the author.

### Final — CTO Author

Spawn the CTO Author agent:

> Read `.contextkit/commands/spec/spec-author.md` and execute it.
> Scope: `[SCOPE_SLUG]`
> Brief: `spec/[scope]/00-brief.md`
> UX section: `spec/[scope]/01-ux.md`
> Data section: `spec/[scope]/02-data.md`
> Systems section: `spec/[scope]/03-systems.md`
> Plan section: `spec/[scope]/04-plan.md`
> Challenges: `spec/[scope]/05-challenges.md`
> Open decisions from revisions: `[TOTAL_OPEN_DECISIONS]`
> Output: `spec/[scope]/SPEC.md`
> Progress file: `spec/PROGRESS.md`
> Index file: `spec/INDEX.md`
> Return: `"done"`

Wait for `"done"`.

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
