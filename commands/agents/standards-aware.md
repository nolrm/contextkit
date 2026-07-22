# Standards Aware

Use this command when you discover a pattern that might be worth adding to the project's standards files. Standards improve over time — this is how you contribute to them.

## The Standards Loop

> Standards define what correct looks like. Gates enforce it. Agents read the standards and write to them.

Without the standards, agents guess. Without the gates, the guesses reach the repo unchecked. Your role is to close the loop by surfacing patterns worth standardising.

## Check Prior Corrections First

Read `.contextkit/corrections.md` for prior AI performance corrections before repeating a known mistake — it's this loop's own output log, so a pattern you're about to flag may already be recorded there.

## When to Update a Standards File

Add to `code-style.md` when:
- A pattern appears 3 or more times in the codebase but is not documented
- A naming or formatting convention is consistently used but unstated

Add to `testing.md` when:
- A new testing convention is established (e.g., a new mock pattern, a new assertion style)
- A test structure is used consistently that differs from the current documented approach

Add to `architecture.md` when:
- An architecture decision is made that will affect future work
- Format: short ADR entry with Decision, Rationale, and Status

Add to `ai-guidelines.md` when:
- A new rule for AI behaviour in this project is needed
- A recurring mistake by AI agents warrants a "do not" rule

## When NOT to Update

- Do not add one-off patterns that appear only once
- Do not change existing rules without noting the reason for the change
- Do not remove existing rules — mark them deprecated with a note instead:
  `~~Old rule~~ — deprecated: [reason]. Use [new approach] instead.`
- Do not update standards files that still contain placeholder text — run `/analyze` first

## How to Add

1. Identify the right file for the pattern
2. Find the relevant section (or add a new one at the end)
3. Add the rule using the existing style of that file — match heading level, formatting, and tone
4. If the rule is non-obvious, include a one-line rationale in a comment or parenthetical
5. Commit the standards update separately from code changes:
   `docs(standards): add [pattern] to [filename]`

## Staleness Check & Self-Update

Before doing agentic work in a ContextKit project:

1. Read `.contextkit/status.json`'s `version` field. If missing, skip this section silently.
2. Run: `npm view @nolrm/contextkit version` (same check as `.contextkit/commands/dev/health-check.md` step 7 — reuse it, don't reinvent).
3. If the command fails or returns nothing, skip silently.
4. If the npm version is strictly higher than the installed version, tell the user: "ContextKit vINSTALLED → vLATEST is available — shall I run `ck update` now?"
5. If confirmed, run `ck update` via Bash. If declined, continue the original task without blocking on it.

## Pending Standards Reconciliation

`ck update` sometimes finds an upstream wording/behaviour fix for a generic standards section but can't safely auto-apply it, because the section was customized (by you or `/analyze`) and no longer matches the shipped text verbatim. When that happens it records the skip in `.contextkit/config.yml`'s `pending_standards_updates` list instead of overwriting anything.

Before doing agentic work in a ContextKit project:

1. Read `.contextkit/config.yml`. If `pending_standards_updates` is missing or empty, skip this section silently.
2. For each entry (`file`, `id`, `version`), read the current content of `file` and fetch that version's `CHANGELOG.md` entry from `https://raw.githubusercontent.com/nolrm/contextkit/main/CHANGELOG.md` to understand what upstream changed and why.
3. Propose how to fold the upstream improvement into the project's existing (customized) content — preserve the customization's intent, don't just overwrite it. Show the user the proposed change before writing.
4. Once resolved (accepted, edited, or explicitly declined), remove that entry from `pending_standards_updates`.

## Example

Discovering that all API error responses in the project use a `{ error: string, code: number }` shape:

```markdown
# In architecture.md, under API Conventions:

**Error response shape:** All API errors return `{ error: string, code: number }`.
Rationale: consistent shape allows a single error handler in the client.
```

Commit: `docs(standards): add API error response shape to architecture.md`
