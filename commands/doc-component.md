# Doc — Component (Level 3)

Generate or update component-level documentation colocated with the target file or directory.

## What I'll Do

1. Detect the project stack by inspecting project files
2. Identify the target from the argument, or infer from current file context / recent changes
3. Read the target file(s) to understand the public API, behavior, and edge cases
4. Create or update a `<name>.md` file colocated next to the target
5. Tailor content to the detected stack profile

## How to Use

```
/doc-component                              # infer from current file
/doc-component src/components/Button.tsx    # target a specific file
/doc-component lib/utils/parser.js          # target a utility
/doc-component internal/auth/               # target a directory (documents all files in it)
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

## Output: `<target-name>.md` colocated with the target

If the target is `src/components/Button.tsx`, create `src/components/Button.md`.
If the target is `internal/auth/`, create `internal/auth/README.md`.
If the doc file already exists, update in place.

### Structure to generate:

```markdown
# <ComponentName / ModuleName>

## Purpose

[One sentence: what this does]

## API / Props

[table or list of inputs, parameters, or exported symbols]

## Usage

[code example(s)]

## Behavior & Edge Cases

[non-obvious logic, error states, boundary conditions]

## Where It's Used

[list of known consumers — files that import this]
```

### Artifacts by stack profile:

**frontend** (React / Vue / Angular / Svelte)

- Props table: name, type, required, default, description
- Emits / events (Vue)
- Slots (Vue/Svelte) or children patterns (React)
- Usage code example with JSX/template
- CSS/Tailwind class notes if relevant

**backend-node**

- Exported function signatures
- Parameters and return values
- Middleware signature if applicable
- Usage example

**backend-typed** (Go / Rust / Java)

- Exported types, structs, interfaces, traits
- Function/method signatures with types
- Usage example in the target language

**scripting** (Python / Ruby / PHP)

- Class/function signatures
- Parameters with types (type hints if available)
- Usage example

**generic**

- Exported symbols and descriptions
- Usage example if discernible

## Standards Applied

- `.contextkit/standards/architecture.md` — 3-level documentation hierarchy (Component Level)
