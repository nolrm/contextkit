# Add Documentation

Generate clear documentation for the specified code.

## What I'll Do

1. Read the target code and understand its purpose
2. Add inline documentation (doc comments, type annotations)
3. Create or update README sections as needed
4. Write usage examples
5. Document public API and configuration options

## How to Use

```
Document the auth module
Add docs for the API endpoints in routes/
Write usage examples for the config parser
```

## Documentation Types

- **Inline comments** — Doc comments on public functions and classes
- **README** — Module-level overview and usage
- **API docs** — Endpoint descriptions, parameters, responses
- **Examples** — Runnable code snippets showing common usage
- **Architecture** — High-level design notes for complex modules

## Length Check

After writing or updating any README/doc file, count its lines (`wc -l`). If it's grown too long for its documentation level (see `.contextkit/standards/architecture.md` — Documentation Levels), don't just densify prose — propose splitting along the architecture/feature/component boundaries and wait for confirmation before creating new files.

## Standards Applied

- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/architecture.md` — Architecture patterns
