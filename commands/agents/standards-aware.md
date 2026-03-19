# Standards Aware

Use this command when you discover a pattern that might be worth adding to the project's standards files. Standards improve over time — this is how you contribute to them.

## The Standards Loop

> Standards define what correct looks like. Gates enforce it. Agents read the standards and write to them.

Without the standards, agents guess. Without the gates, the guesses reach the repo unchecked. Your role is to close the loop by surfacing patterns worth standardising.

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

## Example

Discovering that all API error responses in the project use a `{ error: string, code: number }` shape:

```markdown
# In architecture.md, under API Conventions:

**Error response shape:** All API errors return `{ error: string, code: number }`.
Rationale: consistent shape allows a single error handler in the client.
```

Commit: `docs(standards): add API error response shape to architecture.md`
