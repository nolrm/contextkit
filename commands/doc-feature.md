# Doc — Feature (Level 2)

Generate or update feature-level documentation for a specific feature, route, or domain area.

## What I'll Do

1. Detect the project stack by inspecting project files
2. Identify the target feature from the argument, current branch name, or PR diff
3. Determine the feature's boundaries — which files, routes, or modules it covers
4. Generate or update `docs/features/<feature-name>.md` following the Level 2 documentation standard
5. Tailor content to the detected stack profile

## How to Use

```
/doc-feature                    # infer feature from current branch or recent changes
/doc-feature 98                 # infer feature from PR #98
/doc-feature apps/billing       # target a specific directory
/doc-feature auth               # target a named feature
```

## Stack Detection

Inspect the project root to determine the stack profile:

| Profile           | Detected by                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **frontend**      | `package.json` with react / vue / angular / svelte / nextjs / nuxt dependency            |
| **backend-node**  | `package.json` without a frontend framework                                              |
| **backend-typed** | `go.mod` (Go), `Cargo.toml` (Rust), `pom.xml` or `build.gradle` (Java)                   |
| **scripting**     | `requirements.txt` or `pyproject.toml` (Python), `Gemfile` (Ruby), `composer.json` (PHP) |
| **generic**       | None of the above                                                                        |

## Output: `docs/features/<feature-name>.md`

Create `docs/features/` if missing. If the file already exists, update in place — replace sections relevant to the current changes, preserve unrelated content.

### Structure to generate:

```markdown
# Feature: <Name>

## Purpose

[1–2 sentence description of what this feature does and why it exists]

## Scope

[files, routes, or modules this feature covers]

## Key Components / Modules

[list with one-line descriptions]

## Data & State

[data models, API contracts, state management]

## User Flows

[key paths through the feature — prose or Mermaid sequence]

## Dependencies

[internal: other features/modules; external: APIs, services]

## Edge Cases & Gotchas

[known non-obvious behaviors]
```

### Artifacts by stack profile:

**frontend**

- Route(s) this feature owns
- Components used (with roles)
- Hooks / context / stores
- API calls and response shapes
- Optional: layout sketch or Mermaid component tree

**backend-node**

- HTTP routes / controllers
- Service methods and their responsibilities
- Middleware applied
- DB queries / data access layer

**backend-typed** (Go / Rust / Java)

- Package(s) / crate(s) / modules
- Exported interfaces and types
- Request/response contracts
- Mermaid sequence diagram for the main flow

**scripting** (Python / Ruby / PHP)

- Module/class structure
- Public API surface
- External calls

**generic**

- File list with descriptions
- Main flow prose

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level documentation hierarchy
