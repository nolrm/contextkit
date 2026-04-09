# Doc — Architecture (Level 1)

Generate or update architecture-level documentation for this project or a specific topic area.

## What I'll Do

1. Resolve the output filename from the argument (see **Output filename** below)
2. Detect the project stack by inspecting project files
3. Scope to a PR diff (if a PR number is provided) or the current branch changes
4. Identify architectural signals: new modules, service boundaries, data flows, key decisions
5. Generate or update the target file following the Level 1 documentation standard
6. Tailor artifacts to the detected stack profile

## How to Use

```
/doc-arch                   # whole-system overview → docs/architecture.md
/doc-arch auth              # auth subsystem → docs/auth.md
/doc-arch payment-pipeline  # specific area → docs/payment-pipeline.md
/doc-arch 142               # from PR #142 — infer topic from PR title → docs/<topic>.md
```

## Output filename

Derive the output path using this priority order:

1. **Explicit topic argument** (non-numeric) → `docs/<topic>.md` (kebab-case the argument) — use directly, no confirmation needed
2. **PR number argument** → fetch the PR title with `gh pr view <number> --json title`, convert to kebab-case → propose `docs/<title-slug>.md` and confirm before writing
3. **Current branch name** → strip common prefixes (`feat/`, `fix/`, `improve/`, `chore/`), kebab-case the remainder → propose `docs/<branch-slug>.md` and confirm before writing
4. **No topic inferable** → propose `docs/architecture.md` and confirm before writing

**Confirmation rule:** when the filename was inferred (not given directly), always ask before writing:

```
→ I'll write docs/auth-middleware.md — confirm? (or suggest a different name)
```

Wait for the user's reply. Accept the name as-is, or use whatever name they provide instead.

## Stack Detection

Inspect the project root to determine the stack profile:

| Profile           | Detected by                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **frontend**      | `package.json` with react / vue / angular / svelte / nextjs / nuxt dependency            |
| **backend-node**  | `package.json` without a frontend framework                                              |
| **backend-typed** | `go.mod` (Go), `Cargo.toml` (Rust), `pom.xml` or `build.gradle` (Java)                   |
| **scripting**     | `requirements.txt` or `pyproject.toml` (Python), `Gemfile` (Ruby), `composer.json` (PHP) |
| **generic**       | None of the above                                                                        |

## Output: `docs/<topic>.md`

Create the `docs/` directory if missing. If the file already exists, update in place — add or replace sections relevant to the current changes, preserve unrelated content.

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
