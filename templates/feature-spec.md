# [FeatureName]

> **Spec-first document.** Write this before writing any code.
> When complete, this file lives next to the feature: `FeatureName/FeatureName.md`
> This is a **Page / Feature Level** doc (Level 2 of the documentation hierarchy).

---

## Purpose

What this feature does and why it exists. One or two sentences max.

## Scope

What this feature **owns**:
- [Responsibility 1]
- [Responsibility 2]

What this feature **does NOT cover** (out of scope):
- [Excluded concern 1]
- [Excluded concern 2]

## Main Sections / Layout

Key areas of the feature and what each contains:

| Section | Description |
|---------|-------------|
| [Section name] | [What it shows or does] |
| [Section name] | [What it shows or does] |

## Components & Hooks

| Name | Type | Role |
|------|------|------|
| `[ComponentName]` | Component | [What it handles] |
| `[useHookName]` | Hook | [What state/logic it manages] |

## Data & State

**API endpoints used:**
- `[METHOD] /[endpoint]` — [What it returns]

**Key state:**
- `[stateName]` — [What it tracks and when it changes]

## Key User Flows

Main paths through this feature:

1. **[Flow name]:** [User does X → system does Y → result Z]
2. **[Flow name]:** [User does X → system does Y → result Z]

**Edge cases:**
- [What happens when...]
- [What happens when...]

## Dependencies

**Depends on:**
- [Feature, service, or shared component this relies on]

**Entry points:**
- [Route or screen that leads here]

**Exit points:**
- [Where the user goes after completing the main flow]

## Notes

Any design decisions, trade-offs, or open questions to resolve before coding.
