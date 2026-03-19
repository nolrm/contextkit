# Doc — Architecture (Level 1)

Generate or update the architecture-level documentation for this project (`docs/architecture.md`).

## What I'll Do

1. Detect the project stack by inspecting project files
2. Scope to a PR diff (if a PR number is provided) or the current branch changes
3. Identify architectural signals: new modules, service boundaries, data flows, key decisions
4. Generate or update `docs/architecture.md` following the Level 1 documentation standard
5. Tailor artifacts to the detected stack profile

## How to Use

```
/doc-arch               # from current branch diff
/doc-arch 142           # from PR #142
/doc-arch               # after adding a new service or module
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

## Output: `docs/architecture.md`

Create the directory if missing. If the file already exists, update in place — add or replace sections relevant to the current changes, preserve unrelated content.

### Structure to generate:

```markdown
# Architecture

## Overview

[1–3 sentence system description]

## Stack

[detected stack and key dependencies]

## Directory Structure

[annotated tree of key directories]

## Key Flows

[prose + Mermaid diagrams]

## Architecture Decisions

[notable decisions with rationale]

## External Dependencies

[third-party services, APIs, databases]
```

### Artifacts by stack profile:

**frontend**

- Routes/pages overview (Next.js: `app/` or `pages/`; Vue/Nuxt: `pages/` or `router/`)
- Component hierarchy diagram (Mermaid)
- State management approach
- API integration pattern

**backend-node**

- Middleware chain diagram (Mermaid sequence)
- API endpoint surface (routes, controllers)
- Service/module boundaries
- Data layer (DB, ORM, caching)

**backend-typed** (Go / Rust / Java)

- Package/crate/module structure
- Interface and struct boundaries
- Service-to-service flows (gRPC, REST, message queues) — Mermaid sequence diagram
- Concurrency model (if relevant)

**scripting** (Python / Ruby / PHP)

- Module/package structure
- Class and function surface
- External integrations

**generic**

- Directory structure only
- High-level flow prose

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level documentation hierarchy
