# Refactor

Improve code structure without changing behavior.

## What I'll Do

1. Analyze the target code for improvement opportunities
2. Identify code smells: duplication, long functions, tight coupling
3. Plan refactoring steps that preserve behavior
4. Apply changes incrementally with tests passing at each step
5. Verify all existing tests still pass

## How to Use

```
Refactor the user service to reduce duplication
Refactor this file for readability
Refactor the auth module to use dependency injection
```

## Refactoring Targets

- **Extract** — Pull repeated logic into shared functions
- **Rename** — Improve clarity of names
- **Simplify** — Reduce nesting, remove dead code
- **Decouple** — Break tight dependencies between modules
- **Organize** — Group related code, improve file structure

## Rules

- Never change behavior — only structure
- Tests must pass before and after every step
- Prefer small, incremental changes over big rewrites
- Follow existing project patterns from `.contextkit/standards/architecture.md`

## Standards Applied

- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/architecture.md` — Architecture patterns
