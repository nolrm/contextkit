# Create Feature

Scaffold a new feature (Page / Feature Level — Level 2 of the documentation hierarchy).

**Spec-first rule:** A feature spec must exist before any code is written.
The spec lives colocated with the feature:

```
src/features/FeatureName/
  FeatureName.md    ← spec (Level 2 doc, written first)
  index.ts          ← implementation
  components/       ← feature-scoped components
  FeatureName.test.ts
```

## What I'll Do

1. Check if `<FeatureName>/<FeatureName>.md` already exists
2. If not — create the spec from `.contextkit/templates/feature-spec.md` and present it for review
3. Once spec is confirmed — detect the project's architecture and conventions
4. Scaffold the feature file structure using the spec as source of truth
5. Implement core functionality
6. Add tests covering the key user flows defined in the spec
7. Wire up integration points (routes, exports, config)

## How to Use

```
Create a user authentication feature with login and logout
Create a notification system with email and in-app channels
Create a file upload feature with progress tracking
```

## Process

1. **Spec check** — Look for `<FeatureName>/<FeatureName>.md`. If missing, draft it from template and wait for approval before continuing.
2. **Detect patterns** — Scan existing features for conventions and structure
3. **Scaffold** — Create feature structure matching the project layout, using spec as source of truth
4. **Implement** — Build core logic with proper error handling
5. **Test** — Add tests covering the key user flows from the spec
6. **Integrate** — Connect to existing code (routes, exports, config)

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level documentation hierarchy (Page / Feature Level)
- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/testing.md` — Testing patterns
