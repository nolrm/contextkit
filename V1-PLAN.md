# ContextKit 1.0.0 — Release Plan

> Honest baseline: **0.12.7 today**. Feature-complete, but test coverage is 27%, core UX has a mismatch, and the project doesn't dogfood itself. One focused sprint gets us there.

---

## Summary

| Area | Status | Blocking 1.0? |
|------|--------|---------------|
| Core CLI (install, status, update) | ✅ Tested & stable | No |
| Platform integrations (9 platforms) | ✅ Working | No |
| Quality gates (7 languages) | ✅ Tested | No |
| Squad workflow | ✅ Feature-complete, ❌ untested | Yes |
| Command test coverage | ❌ 3/11 commands tested (27%) | Yes |
| Analyze UX clarity | ❌ Behavior mismatch | Yes |
| Project dogfooding | ❌ Own product files are placeholders | Yes |
| API stability contract | ❌ Not documented | Yes |
| Contributing guide | ❌ Missing | Yes |
| MD-first pattern (3-level spec) | 🚧 Partial (templates + commands done) | Yes |

---

## 1. Test Coverage

> **Goal:** Bring critical commands to tested. Not aiming for 100% — focus on the commands users actually run.

### High Priority (user-facing commands)
- [ ] `lib/commands/analyze.js` — test scope detection, monorepo detection, context loading, usage output
- [ ] `lib/commands/pull.js` — test registry pull, version resolution, backup flag, overwrite behavior
- [ ] `lib/commands/check.js` — test install detection, status reporting
- [ ] `lib/commands/run.js` — test command routing and execution

### Medium Priority
- [ ] `lib/commands/ai.js` — test prompt construction, tool routing (aider, claude, gemini)
- [ ] `lib/commands/dashboard.js` — test status rendering and data aggregation
- [ ] `lib/commands/publish.js` — test package validation and registry write
- [ ] `lib/commands/note.js` — test file append and corrections log format

### Squad Workflow (integration-level)
- [ ] Test manifest creation from `squad-batch` input (fresh start)
- [ ] Test manifest append mode (existing manifest detected, numbering continues correctly)
- [ ] Test `squad-run` phase routing based on manifest statuses
- [ ] Test clarify status detection pauses the correct tasks
- [ ] Test single handoff file creation from `squad` input

---

## 2. Analyze UX Clarity

> **The mismatch:** Users run `ck analyze` expecting standards files to be generated. The CLI only detects project structure and prints instructions — the AI does the actual work. This surprises users.

- [ ] Update the `ck analyze` terminal output to **explicitly state the handoff**: "Analysis complete. Now paste the above context into your AI tool, or run: `claude .contextkit/commands/analyze.md`"
- [ ] Add a "Next step" callout box at the end of the analyze output (not buried in instructions)
- [ ] Update README `ck analyze` section to clearly describe the two-stage process: CLI detects → AI generates
- [ ] Update docs site quick-start page to reflect the two-stage flow
- [ ] Consider adding `ck analyze --with-claude` / `--with-aider` flags that auto-invoke the detected AI tool (stretch goal — not blocking)

---

## 3. Project Dogfooding

> **The credibility gap:** ContextKit's own `.contextkit/` is mostly placeholder. The tool that helps teams fill their context hasn't filled its own.

### Product files
- [ ] Fill `.contextkit/product/mission.md` — write actual ContextKit mission, users, problem, value
- [ ] Fill `.contextkit/product/mission-lite.md` — condensed 2-3 sentence version for AI context
- [ ] Fill `.contextkit/product/decisions.md` — document real architectural decisions made so far:
  - Why markdown over a database
  - Why AI-delegated analyze (not in-CLI generation)
  - Why CommonJS over TypeScript
  - Why platform bridge files vs single universal format
- [ ] Fill `.contextkit/product/roadmap.md` — use this document as the source

### Standards files (run `ck analyze` on itself)
- [ ] Generate `.contextkit/standards/code-style.md` — Node.js/CommonJS, chalk, ora, inquirer patterns
- [ ] Generate `.contextkit/standards/architecture.md` — command pattern, utils structure, integration pattern
- [ ] Generate `.contextkit/standards/testing.md` — Jest, mock patterns, integration vs unit split
- [ ] Generate `.contextkit/standards/workflows.md` — git flow, versioning, changelog discipline
- [ ] Generate `.contextkit/standards/ai-guidelines.md` — ContextKit-specific AI behavior rules

---

## 4. API Stability Contract

> **1.0.0 signals "the interface is locked."** Without documenting what's stable, users can't trust it.

- [ ] Define and document the **stable public API surface** in README:
  - CLI commands that won't be renamed or removed
  - File paths that are guaranteed stable (`.contextkit/standards/`, `.contextkit/commands/`, handoff file schema)
  - Config file schema (`config.yml`, `manifest.md` fields)
- [ ] Add a **Breaking Changes policy** to README: breaking changes require a major bump, deprecated features get one release cycle warning
- [ ] Document the **squad handoff file schema** as a stable format (fields: `task`, `status`, sections 1–5)
- [ ] Document the **manifest.md schema** as stable (fields: `batch`, `total`, `checkpoint`, task list format)

---

## 5. Contributing Guide

- [ ] Create `CONTRIBUTING.md` at the project root with:
  - [ ] How to set up the dev environment
  - [ ] How to run tests (`npm test`)
  - [ ] How to add a new platform integration (the integration pattern)
  - [ ] How to add a new command
  - [ ] Commit message format (conventional commits — already enforced by hook)
  - [ ] PR checklist (tests pass, changelog entry, version bump if needed)
- [ ] Link `CONTRIBUTING.md` from README

---

## 6. MD-First Development Pattern

> **The idea:** Before any component or feature is coded, a markdown spec must exist. This is the 3-level documentation hierarchy — Architecture → Project → Component — where specs drive implementation, not the other way around.

### The 3 Levels (Option A: Colocated)

| Level | Scope | Location |
|-------|-------|----------|
| **1. Architecture** | How projects connect | `.contextkit/standards/architecture.md` |
| **2. Project** | What this project does, structure | `.contextkit/product/mission.md` + `context.md` |
| **3. Component** | Individual component logic & responsibilities | `<ComponentName>/<ComponentName>.md` (colocated) |

Level 3 example:
```
src/components/Button/
  Button.md       ← spec (written first)
  Button.tsx      ← code (written after spec)
  Button.test.tsx
```

### Deliverables

- [x] Create `templates/component-spec.md` — Level 3 spec template with Purpose, Responsibilities, Props/API, Logic & Behavior, Dependencies sections
- [x] Create `commands/spec.md` — Standalone command to write a component spec before coding
- [x] Update `commands/create-component.md` — Step 1 is now spec check/creation; code only after spec is confirmed
- [ ] Document the 3-level pattern in `.contextkit/standards/architecture.md`
- [ ] Add spec scanning to `ck analyze` — report which components have specs vs. missing

---

## 7. Polish & Loose Ends

- [ ] **`ck pull` docs** — it's implemented and registered but not mentioned anywhere in the README CLI commands table. Add it.
- [ ] **`squad-run-agents` scope** — currently undocumented that it's Claude Code-only. Add a note in the docs site squad page and in the command file itself.
- [ ] **`vibe-kit` / `vk` aliases** — these legacy aliases are still in `package.json` bin. Decide: keep with deprecation notice or remove before 1.0.
- [ ] **`nolrm-vibe-kit-0.1.2.tgz`** in the repo root — stale artifact, should be deleted or gitignored.
- [ ] **`test-project/`** in the repo root — confirm it's gitignored and not shipping in the npm package.
- [ ] **Node.js engine requirement** — `package.json` says `>=14.0.0` but codebase likely uses features requiring 16+. Verify and update if needed.

---

## 8. Version Milestones

| Version | Focus | Done when |
|---------|-------|-----------|
| **0.13** | Test coverage + analyze UX | All high-priority tests written, analyze output updated |
| **0.14** | Dogfooding + product files | All `.contextkit/product/` and standards filled |
| **0.15** | API contract + contributing | README stability docs + CONTRIBUTING.md merged |
| **0.16** | Polish sprint | All loose ends resolved, no known issues |
| **1.0.0** | Release | All items above checked off |

---

## Done When

1.0.0 ships when every checkbox above is checked. No partial credit.

> Last updated: 2026-03-01 · Baseline: v0.12.7
