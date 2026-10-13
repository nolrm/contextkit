---
description: Update docs and standards affected by the current change — or write an arch / feature / component doc
argument-hint: '[arch | feature [name|path] | component <path>]'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: medium
---

# Doc

Keep docs and standards in step with the code. By default, works from the current change.

## Usage

```
/doc                     # docs affected by the current change
/doc arch                # architecture doc (Level 1)
/doc feature [name|path] # feature doc (Level 2)
/doc component <path>    # component doc (Level 3)
```

## Default: Docs for the Current Change

1. Run `git branch --show-current` and get the change set:
   - Feature branch → `git diff <default-branch>...HEAD` plus uncommitted changes.
   - Default branch → uncommitted changes (`git diff HEAD`).
2. Find docs that reference the changed code: `README.md` files at the root and in each changed directory, `docs/**`, colocated `<name>.md` files, API docs, and `.contextkit/standards/*.md`. Search for changed file names, exported symbols, routes, commands, config keys, and env vars.
3. For each hit, decide: **stale** (says something no longer true), **missing** (new behaviour not documented where readers would look), or **fine**.
4. Apply it:
   - Feature branch → list recommended updates first (path, what's outdated, suggested text), then apply them unless the user only wanted the list.
   - Default branch → apply the updates directly.
5. Standards drift: if the change introduces or breaks a convention recorded in `.contextkit/standards/`, update that file too — standards are the AI's context, stale standards are wrong context.
6. Package release check (npm package: `package.json` has `version` and isn't `"private": true`): suggest a version bump (patch/minor/major) and check `CHANGELOG.md` has an entry for the current version.
7. Reply with a short list: files updated, files flagged, and anything skipped.

## Levels

For an explicit level, read and follow the matching guide, then stop:

| Level | Guide | Output |
|---|---|---|
| `arch` | `.contextkit/commands/docs/doc-arch.md` | `docs/architecture.md` |
| `feature` | `.contextkit/commands/docs/doc-feature.md` | `docs/features/<name>.md` or the feature's `README.md` |
| `component` | `.contextkit/commands/docs/doc-component.md` | colocated `<name>.md` |

If a guide file is missing, write the doc using the same structure as the nearest existing doc of that level in the repo.

## Rules

- Update in place; preserve unrelated content.
- Docs describe what the code does now — no history, no "previously".
- Diagrams only if `.contextkit/config.yml` → `diagrams_in_docs: true`; otherwise prefer short arrow chains like `request → handler → service`.

