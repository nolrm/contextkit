# Quality Check

Run a comprehensive quality review on the specified code.

## What I'll Do

1. Check code against project standards
2. Identify type errors, lint issues, and formatting problems
3. Review test coverage for gaps
4. Flag security concerns and performance issues
5. Generate a summary report with actionable items

## How to Use

```
Quality check the auth module
Run quality check on the entire src/ directory
Check quality of the new API endpoints
```

## Checks Performed

- **Standards compliance** — Does it follow `.contextkit/standards/code-style.md`?
- **Type safety** — Any type errors or unsafe casts?
- **Test coverage** — Are new code paths tested?
- **Error handling** — Are failures handled gracefully?
- **Security** — Any injection, auth, or data exposure risks?
- **Performance** — Any obvious bottlenecks or wasteful patterns?
- **Accessibility** — UI components meet accessibility standards?

## Standards Applied

- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/testing.md` — Testing requirements
- `.contextkit/standards/architecture.md` — Architecture patterns
