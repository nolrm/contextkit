---
description: Write a component spec (MD-first) before coding begins
argument-hint: '<component or feature name>'
allowed-tools: Read, Write, Glob, Grep
effort: normal
---

# Spec — Component

Write a component spec (Level 3 of the MD-first pattern) before any code is written.

The spec file lives **colocated** with the component it describes:
```
src/components/Button/
  Button.md     ← spec (written first)
  Button.tsx    ← code (written after spec is approved)
```

## What I'll Do

1. Ask for the component name and a brief description of its purpose
2. Scan existing components to understand project patterns and naming conventions
3. Create `<ComponentName>/<ComponentName>.md` using the template below
4. Fill in Purpose, Responsibilities, Props/API, Logic & Behavior, and Dependencies based on your description
5. Present the spec for your review before any code is written

## How to Use

```
Spec a Button component that handles primary and secondary variants with loading state
Spec an AuthProvider that manages session state and exposes useAuth hook
Spec a DataTable with sortable columns, pagination, and row selection
```

## Process

1. **Understand** — Parse the description to identify purpose, props, and behavior
2. **Scan** — Check existing components for similar patterns or dependencies
3. **Draft spec** — Create `<ComponentName>/<ComponentName>.md` from template
4. **Fill** — Populate all sections based on description and codebase context
5. **Review** — Present the spec. Wait for approval before writing any code.

Once the spec is approved, use `create-component` to scaffold the implementation.

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level MD-first pattern
- `.contextkit/standards/code-style.md` — Naming conventions


## Component Spec Template

```markdown
# [ComponentName]

> **Spec-first document.** Write this before writing any code.
> When complete, this file lives next to the component: `ComponentName/ComponentName.md`

---

## Purpose

What this component does and why it exists. One or two sentences max.

## Responsibilities

What this component **owns**:
- [Responsibility 1]
- [Responsibility 2]

What this component **does NOT do** (out of scope):
- [Excluded concern 1]
- [Excluded concern 2]

## Props / API

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `propName` | `string` | Yes | — | What it controls |

## Logic & Behavior

Key rules, state transitions, and edge cases the implementer must know:

- **[Rule 1]:** [Description]
- **[Edge case]:** [What happens when...]
- **[State]:** [When X, show Y. When Z, disable W.]

## Dependencies

**Depends on:**
- [Component, hook, or service this relies on]

**Used by:**
- [Where this component is consumed]

## Notes

Any design decisions, trade-offs, or open questions to resolve before coding.

```

