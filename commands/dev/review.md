# Code Review

Review the current changes and provide actionable feedback.

## What I'll Do

1. Identify all modified and staged files
2. Review each change for correctness, clarity, and maintainability
3. Check adherence to project standards in `.contextkit/standards/`
4. Flag potential bugs, edge cases, and security issues
5. Suggest improvements with specific code examples
6. Summarize findings with a pass/needs-work verdict

## How to Use

```
Review my current changes
Review the changes in src/auth/
Review this PR focusing on security
```

## Review Checklist

- **Correctness** — Does the logic do what it claims?
- **Edge cases** — Are boundary conditions handled?
- **Error handling** — Are failures caught and surfaced properly?
- **Naming** — Are variables, functions, and files named clearly?
- **Tests** — Are new behaviors covered by tests?
- **Standards** — Does the code follow `.contextkit/standards/code-style.md`?
- **Security** — Any injection, auth, or data exposure risks?

## Standards Applied

- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/testing.md` — Testing requirements
- `.contextkit/standards/architecture.md` — Architecture patterns
