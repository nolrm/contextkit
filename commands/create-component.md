# Create Component

Scaffold a new UI component with tests, following the MD-first pattern.

**MD-first rule:** A spec file must exist (or be created now) before any code is written.
The spec lives colocated with the component:

```
src/components/ComponentName/
  ComponentName.md    ← spec (Level 3 doc)
  ComponentName.tsx   ← implementation
  ComponentName.test.tsx
```

## What I'll Do

1. Check if `<ComponentName>/<ComponentName>.md` already exists
2. If not — create the spec from `.contextkit/templates/component-spec.md` and present it for review
3. Once spec is confirmed — detect the project's UI framework and conventions
4. Scaffold the component file using the spec as the source of truth
5. Add typed props/interfaces matching the spec's Props/API table
6. Create a test file with numbered test cases covering the spec's Logic & Behavior
7. Update exports if needed

## How to Use

```
Create a DataTable component with columns, data, and onRowClick props
Create a SearchBar component in src/components
Create a Modal component with title and children props
```

## Process

1. **Spec check** — Look for `<ComponentName>/<ComponentName>.md`. If missing, draft it from template and wait for approval before continuing.
2. **Detect patterns** — Scan existing components for conventions
3. **Scaffold** — Create component matching project structure, using spec as source of truth
4. **Props** — Define typed interface from spec's Props/API table
5. **Tests** — Add test file covering the Logic & Behavior section of the spec
6. **Exports** — Update barrel files or index if the project uses them

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level MD-first pattern
- `.contextkit/standards/code-style.md` — Coding conventions
- `.contextkit/standards/testing.md` — Testing patterns
