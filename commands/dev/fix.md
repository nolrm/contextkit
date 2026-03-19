# Fix Bug

Diagnose and fix a bug systematically.

## What I'll Do

1. Reproduce or locate the issue from the description
2. Trace the root cause through the codebase
3. Implement the minimal fix that resolves the issue
4. Add or update tests to cover the bug scenario
5. Verify the fix doesn't introduce regressions

## How to Use

```
Fix the login timeout error
Fix: users can submit the form twice
Fix the failing test in auth.test.js
```

## Process

1. **Understand** — Read the error, stack trace, or bug description
2. **Locate** — Find the relevant code paths
3. **Root cause** — Identify why it fails, not just where
4. **Fix** — Apply the smallest correct change
5. **Test** — Add a test that would have caught this bug
6. **Verify** — Run existing tests to confirm no regressions

## Standards Applied

- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/testing.md` — Testing requirements
