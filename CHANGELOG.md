# Changelog

## [0.13.5] - 2026-03-16

### Added
- **Quality Gates: 3 new stacks** — Kotlin (ktlint + Gradle test), Swift (SwiftLint + swift test), .NET/C# (dotnet build + dotnet test)
- **Quality Gates: config file** — `.contextkit/quality-gates.yml` with `disable:` list lets you opt out of specific gates without editing hook code (e.g. `disable: [eslint, prettier]`)
- **Quality Gates: per-gate timing** — each gate shows elapsed time (`✓ 2s`) after completion
- **Quality Gates: `DRY_RUN=1` mode** — set `DRY_RUN=1 git push` to preview which gates would run without executing them; exits 0
- **Quality Gates: monorepo support** — npm/pnpm workspace projects scope gates to affected packages when all push changes are inside workspace package directories

### Improved
- **Quality Gates: docs** — failure banner callout with real output example; commit-msg section adds auto-skip note, 10-char minimum, `improve` example; Node.js table row adds e2e + package.json note; workflow block replaced with numbered list; "skipped silently" used consistently; Troubleshooting section added; hooks-copied-at-install clarified; Kotlin/Swift/.NET rows added to framework table

---

## [0.13.4] - 2026-03-16

### Added
- **`/doc-arch` command** — generates `docs/architecture.md` (Level 1: system boundaries, key flows, Mermaid diagrams). Stack-aware; can target current branch or a PR number.
- **`/doc-feature` command** — generates `docs/features/<name>.md` (Level 2: feature scope, components, data flows, sequence diagrams). Accepts name, directory, or PR number.
- **`/doc-component` command** — generates a colocated `<name>.md` next to a file (Level 3: props/API, usage example, edge cases). Accepts file path or directory.
- **Docs: md-first page** — commands section with 3-level hierarchy table, per-command subsections, stack-awareness note, when-to-use-which table, squad integration note
- **Docs: slash-commands page** — doc-arch, doc-feature, doc-component entries added

---

## [0.13.3] - 2026-03-16

### Added
- **CI Squad** — label any GitHub issue `squad-ready` to trigger a full squad pipeline in GitHub Actions (PO → Architect → Dev → Test → Review → Doc) and open a draft PR automatically. No local setup required.
- **`ck install` CI Squad prompt** — opt-in prompt during install downloads `squad-issue.yml` to `.github/workflows/` and records `squad_ci_workflow: true` in config
- **`ck update` CI Squad sync** — re-downloads `squad-issue.yml` on `ck update` when `squad_ci_workflow` flag is set
- **`squad-ci.md` command** — new command distributed via install/update; instructs Claude Code CLI to run the full pipeline non-interactively in CI mode. On clarify: posts a GitHub comment and exits 0. On completion: writes `ci-result.md` for the PR body.
- **`templates/github-actions/squad-issue.yml`** — new GitHub Actions workflow template with branch creation, clarify comment flow, concurrency guard, and draft PR creation
- **Docs: CI Squad page** — new website page covering setup, how it works, writing good issues, clarify flow, and behaviour table

### Fixed
- **Website: commit types** — quality-gates page was showing stale `style` type; updated to `improve` (matches CLI and standards)

---

## [0.13.2] - 2026-03-13

### Fixed
- **`commit-msg` hook** — length check now tests the subject line only (`head -n1`), not the full message including body. A short subject with a long body previously passed incorrectly.
- **`commit-msg` hook** — length check now runs before the format check (was unreachable dead code — any message passing the format regex was already >10 chars).
- **`pre-push` hook** — fixed variable-width content inside box borders; `Project type` and success summary lines moved outside the box to prevent broken border alignment.

### Added
- **`pre-push` hook** — ERR trap prints a clear `❌ Quality Gates FAILED — push blocked.` banner when any gate fails, replacing silent exit.

### Changed
- **`commit-msg` hook** — removed `style` from allowed commit types (not used in this project; was inconsistent with documented types in `workflows.md` and `ai-guidelines.md`).
- **README** — commit types list updated to remove `style`, matching the hook and standards files.

---

## [0.13.1] - 2026-03-07

### Fixed
- **`ck ai` stale reference** — removed leftover `ck ai <cmd>` line from post-install Quick Reference output (command was removed in 0.13.0)
- **Install "In CLI" example** — replaced `ck ai "..."` example with generic slash command guidance

### Added
- **OpenCode auto-detection** — `ck install` now detects the `opencode` binary in PATH and suggests the OpenCode integration automatically, consistent with how `claude`, `codex`, and `gemini` CLI tools are detected

### Changed
- **`/squad` vague task handling** — PO now pushes back with up to 5 clarifying questions when a task description is too ambiguous to spec. Sets `status: po-clarify`, writes questions to the handoff, and pauses the pipeline. Running `/squad` again (no args) with answers resumes and writes the full spec.
- **`/squad` Clarification Mode** — split into two paths: kickoff clarification (questions in PO Spec block → write spec, advance to architect) and downstream clarification (questions from Architect/Reviewer → existing behavior)

---

## [0.13.0] - 2026-03-07

### Removed
- **`ck ai`** — removed AI chat fallback command; users interact via Cursor, Claude Code, OpenCode, etc.
- **`ck dashboard`** — removed observability dashboard command
- **`ck pull` / `ck publish`** — removed local registry commands (no shared registry was implemented; feature deferred)
- Unknown commands no longer silently forward to AI; now print an error and exit with code 1

### Added
- **`format_version` field** in `.contextkit/config.yml` — written as `format_version: 1` on `ck install`
- **Migration runner** (`lib/utils/migrations.js`) — `ck update` detects outdated format versions and migrates automatically; v0→v1 migration bootstraps the field on existing pre-1.0.0 installs

### Changed
- **Node.js engine** requirement bumped to `>=18.0.0` (Node 14/16 are EOL)
- **`improve`** added as a valid commit type in README (was already in `workflows.md` and the `commit-msg` hook)
- **Docs site** — removed observability/dashboard sections from Commands and Enterprise pages; quick-start and docs README now require Node 18.x

---

## [0.12.22] - 2026-03-06

### Fixed
- **`commit-msg` hook** — merge commits (`Merge branch ...`), revert commits, fixup, and squash commits are now skipped automatically instead of being rejected with a conventional format error.
- **`commit-msg` hook** — added `improve` as a valid commit type (was already listed in ContextKit's own standards but missing from the hook regex).

---

## [0.12.21] - 2026-03-06

### Added
- **Architect split signal** — the Architect now evaluates task complexity before writing the plan. If a task is too large (>~7 files, multiple independent concerns, or significant wasted effort risk), it writes a `### Recommended Split` with proposed sub-tasks and sets `status: po-clarify`. The PO then approves the split (running `/squad` as a batch) or dismisses it and proceeds as-is — no code is written until the PO decides.

### Changed
- **`/squad` Clarification Mode** — detects `### Recommended Split` in the Architect Plan block and guides the PO through the two response options (approve split or proceed as-is), separate from the standard spec Q&A flow.
- **`/squad-auto` `po-clarify` message** — updated to mention the split recommendation scenario so users understand what to expect when running `/squad`.

---

## [0.12.20] - 2026-03-06

### Added
- **`/squad-doc` phase** — new final pipeline step that runs after review passes. Creates companion `.md` files for every new code file and updates existing ones for significant modifications. Enforces MD-first as a quality gate rather than an afterthought.
- **`commands/squad-doc.md`** — new command file distributed via `ck install` and `ck update`.
- **`/squad-doc` slash command** — available in Claude Code after `ck claude`.

### Changed
- **Squad pipeline flow** — now `architect → dev → test → review → doc → done`. Review PASS routes to `doc` status instead of directly to `done`.
- **`squad-auto`** — runs the Doc phase inline after each task's review passes.
- **`squad-auto-parallel`** — runs a sequential Doc pass after all parallel agents complete.
- **Handoff template** — includes new `## 7. Doc` section.

---

## [0.12.19] - 2026-03-06

### Added
- **Passive update notifications** — `ck` now checks npm for newer versions of `@nolrm/contextkit` once per 24 hours and prints a non-blocking one-liner after any command if an update is available. Suppressed automatically in CI environments.
- **ContextKit version stamp in CLAUDE.md** — the generated `CLAUDE.md` now includes the installed version (`Version: X.Y.Z`) so AI tools can report it and check for updates when running `/ck`.
- **`/ck` update check step** — the health-check command now runs `npm view @nolrm/contextkit version`, compares to the installed version in `status.json`, and adds an update row to the status table.

### Changed
- **`health-check.md` now downloaded from GitHub** (like all other command files) instead of being written inline at install time. Existing users get the updated file via `ck update`.

---

## [0.12.17] - 2026-03-04

### Changed
- **Banner art** — replaced "CK" initials ASCII art with full "ContextKit" slant-style logo on `ck install` and `ck update`.

---

## [0.12.15] - 2026-03-04

### Added
- **`/squad-reset`** — new slash command to clear `.contextkit/squad/` and start fresh. Reports what was removed and flags any in-progress tasks before deleting.

### Changed
- **`/squad` mixed-state handling** — instead of hard-stopping when both `handoff.md` and `manifest.md` exist, `/squad` now offers to reset inline and continue with the provided task. Falls back to instructing `/squad-reset` if no task was given or the user declines.

### Removed
- **`/squad-peer-review`** removed from the pipeline. Existing installs have the file deleted automatically on `ck update`.

### Fixed
- **`ck update` legacy cleanup** — removes `.contextkit/commands/squad-peer-review.md` on update.

---

## [0.12.14] - 2026-03-04

### Changed
- **`/squad-run` renamed to `/squad-auto`**, **`/squad-run-agents` renamed to `/squad-auto-parallel`** — "auto" unambiguously signals hands-free execution; "run" was ambiguous (run what? run a step?). This is a breaking rename for muscle memory — existing users should note the new names.
- **Squad command menu labels** — added contextual suffixes so the slash-command dropdown is self-explanatory without guessing: `(start here)`, `(recommended)`, `(manual step 1/4)` through `(manual step 4/4)`.
- **Post-kickoff message** — `/squad` now recommends `/squad-auto` as the primary next step (hands-free) and lists manual steps as a secondary option. Previously it only mentioned `/squad-architect`.

### Breaking
- `/squad-run` no longer exists. Use `/squad-auto` instead.
- `/squad-run-agents` no longer exists. Use `/squad-auto-parallel` instead.

---

## [0.12.13] - 2026-03-04

### Added
- **`.contextkit/README.md`** — generated on `ck install`. Explains what the directory is, includes the install command (`npm install -g @nolrm/contextkit`) and npm link so any developer who encounters the folder knows what manages it.
- **`_source` block in `.contextkit/config.yml`** — machine-readable attribution written at install time with `tool`, `version`, and `npm` fields.
- **Updated attribution marker** — the `<!-- Generated by ContextKit -->` comment in all bridge files now includes the npm package name and link: `<!-- Generated by ContextKit (@nolrm/contextkit) https://www.npmjs.com/package/@nolrm/contextkit -->`. Backward-compatible: existing installs with the old short marker are detected and upgraded on next write.

---

## [0.12.12] - 2026-03-03

### Changed
- **`/squad-batch` removed** — merged into `/squad`. Pass one task for single-task mode, two or more for batch mode. `/squad` auto-detects and routes accordingly.
- **`commands/squad.md`, `.contextkit/commands/squad.md`** — full rewrite combining single-task, batch, append, and clarification flows into one command. Adds mixed-state detection, `po` in-progress warning before overwrite, `done` archiving for both single and batch, and standardised handoff template with Visual Assets and User Clarifications sections.
- **`lib/integrations/claude-integration.js`** — removed `.claude/commands/squad-batch.md` from generated files; added to legacy cleanup list so existing installs remove the stale file automatically.
- **`lib/integrations/cursor-integration.js`** — same as above for `.cursor/prompts/squad-batch.md`.
- **`lib/commands/install.js`, `lib/commands/update.js`** — removed `squad-batch.md` download.
- **`README.md`, `contextkit-docs`** — updated all batch flow examples to use `/squad`.

### Breaking
- `/squad-batch` no longer exists as a command. Use `/squad "task 1" "task 2" ...` instead.

---

## [0.12.11] - 2026-03-03

### Changed
- **`commands/squad.md`, `.contextkit/commands/squad.md`** — PO agent now checks for screenshots or images the user attached to the `/squad` invocation. If present, each image is saved to `.contextkit/squad/assets/` and listed with a one-line description under the new optional `### Visual Assets` section in the handoff. If no images are provided the section is left empty and the pipeline continues unchanged.
- **`commands/squad-architect.md`, `.contextkit/commands/squad-architect.md`** — Architect now reads any `### Visual Assets` file paths from the PO Spec before writing the plan.
- **`commands/squad-dev.md`, `.contextkit/commands/squad-dev.md`** — Dev now reads any `### Visual Assets` file paths from the PO Spec before implementing.
- **`README.md`** — Added Visual Assets section to the Squad Workflow docs and updated the PO role description.

---

## [0.12.9] - 2026-03-03

### Changed
- **`lib/commands/install.js`** — When a user declines reinstall, the CLI now shows a hint: run `ck update` to get the latest command and squad files without overwriting customized standards.

---

## [0.12.7] - 2026-03-01

### Changed
- **`commands/squad-batch.md`** — Batch kickoff now detects whether a manifest already exists. Fresh run creates a new manifest and handoff files as before. If a manifest exists, append mode activates: new tasks are numbered from where the existing batch left off, the manifest `total:` is updated, and PO specs are written for new tasks only — existing handoffs are never re-processed. Run `/squad-run` after to continue the full pipeline.

---

## [0.12.6] - 2026-03-01

### Changed
- **Standards template** — `standards/glossary.md` is now a neutral project-agnostic template (`[YOUR_DOMAIN]` / `[term]` placeholders) instead of shipping with e-commerce/accounting examples that don't apply to most projects.
- **`commands/analyze.md`** — Analysis now includes a Term & Glossary Detection step: AI scans the codebase for domain-specific vocabulary and appends discovered terms to `glossary.md`. Added Update Strategy rule: placeholder files are replaced, files with existing custom content are improved and augmented — never overwritten. Added `ai-guidelines.md`, `workflows.md`, and `glossary.md` to the list of files updated during analysis.
- **`standards/README.md`** — Quick Reference section is now stack-neutral (removed React/TypeScript-specific "functional components" and "atomic design" advice). Added `workflows.md` to the Standards file list. Updated glossary description to "Project terminology and domain glossary".
- **Root `standards/` reference files** — Added clear banner to `code-style.md`, `testing.md`, `architecture.md`, `ai-guidelines.md`, and `workflows.md` clarifying they are reference examples (not auto-installed) showing what `ck analyze` can generate.
- **Docs & README** — Updated glossary description from e-commerce-specific examples to generic domain terminology. Updated quick-start and platform-examples usage snippets to reflect that glossary terms come from the user's own project.

---

## [0.12.5] - 2026-02-26

### Changed
- **README** — Add direct link to [How context works](https://contextkit-docs.vercel.app/docs/how-context-works) docs page.
- **Docs site** — Footer copyright year 2026; sitemap and docs README include How Context Works page.

---

## [0.12.4] - 2026-02-26

### Changed
- **Docs** — Clarify that install is project-level only (README, CLI description, docs site quick-start and commands). No global mode; standards live in git with the project.
- **Docs site** — New Squad Workflow page (`/docs/squad`) with pipeline roles, single-task and batch flows, and feedback loop. Slash-commands page now links to it instead of listing all squad commands inline.
- **Docs site** — New How Context Works page (`/docs/how-context-works`) explaining the two-layer architecture (bridge file + scoped rules).

### Added
- **Install** — Warn when running `ck install` with no `.git` or `package.json` in the current directory (reminder to run from inside a project).

---

## [0.12.3] - 2026-02-26

### Fixed
- **Tests** — Unknown-command CLI test now accepts "ContextKit not initialized" when not installed (CI), so it passes in both CI and local.

---

## [0.12.2] - 2026-02-26

### Fixed
- **CLI** — Register `opencode` command so `ck opencode` works (integration existed; command was documented but not registered).
- **Tests** — CLI integration tests for `status` and unknown-command now pass in both CI (no config) and local (full install).

---

## [0.12.1] - 2026-02-23

### Fixed
- **Pre-push quality gates** — TypeScript, ESLint, and Prettier gates now only run when listed as dependencies in `package.json`, not when they appear in keywords. Fixes false positives for projects that mention these tools in keywords but don't use them.

---

## [0.12.0] - 2026-02-23

### Added
- **OpenCode integration** — New platform support. Run `ck opencode` to create `AGENTS.md` (auto-loaded by OpenCode). Same bridge file pattern as Codex.

---

## [0.11.0] - 2026-02-23

### Added
- **`/squad-run-agents`** — New Claude Code-only command that runs the squad batch pipeline using parallel subagents. Spawns one architect agent per task simultaneously (Phase 1), then one full dev→test→review pipeline agent per task simultaneously (Phase 2). Significantly faster than `/squad-run` for multi-task batches.
- **ESLint accessibility linting** for `contextkit-docs` — installed `eslint-plugin-test-a11y-js` with the `flat/react` preset and `@typescript-eslint/parser`. Fixed 30 violations across 11 files (heading order, table structure, button/form/link labels, keyboard accessibility).

### Fixed
- `.gitignore` docs artifact paths corrected from `vibe-kit-docs/` → `contextkit-docs/`

---

## [0.10.0] - 2026-02-20

### Changed
- **Interactive platform picker** — `ck install` now prompts "Which AI tool?" instead of auto-detecting all tools. Supports a positional argument (`ck install claude`) to skip the prompt. `--non-interactive` installs base files only. Platform-specific commands (`ck claude`, etc.) are unchanged.

---

## [0.9.7] - 2026-02-19

### Added
- **`/ck` Health Check** — slash command to check project health from inside any AI tool
  - Detects whether ContextKit is installed
  - Checks if standards files are still skeletons (wasting context tokens)
  - Checks if product files still have placeholder content
  - Lists active platform integrations
  - Reports a status table with recommended next steps
- Universal command file `.contextkit/commands/health-check.md` created during install
- Platform wrappers: `.claude/commands/ck.md` and `.cursor/prompts/ck.md`

## [0.9.6] - 2026-02-18

### Changed
- **Claude @imports** — CLAUDE.md now uses `@path` syntax to auto-load standards into context
  - Standards, product files, and corrections.md are imported automatically every session
  - Eliminates manual `Read` tool calls — saves tokens per session by avoiding repeated file reads
  - First-time use triggers a one-time approval dialog in Claude Code
  - `.claude/rules/` files simplified to reference auto-loaded standards instead of duplicating paths
  - Base integration (`getStandardsBlock()`) unchanged — `@` imports are Claude-specific

### Token Impact
- **Upfront**: slightly higher base context (standards content loaded immediately)
- **Per-session**: lower total usage — no Read tool calls needed for standards files
- **Net effect**: fewer tokens overall for typical sessions, plus guaranteed consistency

## [0.9.5] - 2026-02-18

### Added
- **Squad Workflow** — multi-agent pipeline with 7 slash commands
  - `/squad` — kick off a task as Product Owner (writes PO spec)
  - `/squad-architect` — design the technical plan from the PO spec
  - `/squad-dev` — implement code following the architect plan
  - `/squad-test` — write and run tests against acceptance criteria
  - `/squad-review` — review the full pipeline and give a PASS/NEEDS-WORK verdict
  - `/squad-batch` — kick off multiple tasks at once (batch PO specs)
  - `/squad-run` — auto-run the remaining pipeline for batch tasks
- Role-to-role feedback loop: downstream roles can raise questions for upstream roles via `*-clarify` statuses
- Shared handoff file (`.contextkit/squad/handoff.md`) tracks specs, plans, implementation, tests, and review

### Docs
- Added squad commands to README slash commands table and new Squad Workflow section
- Added squad commands and Squad Workflow section to docs site slash commands page

## [0.9.4] - 2026-02-16

### Added
- **Slash Commands** for Claude Code (`.claude/commands/`) and Cursor (`.cursor/prompts/`)
  - `/analyze` — scan codebase and generate standards content
  - `/review` — code review with checklist
  - `/fix` — diagnose and fix bugs
  - `/refactor` — refactor code with safety checks
  - `/test` — generate comprehensive tests
  - `/doc` — add documentation
- Both platforms delegate to universal `.contextkit/commands/` files
- New command files: `review.md`, `fix.md`, `refactor.md`

### Changed
- Git hooks now use `git config core.hooksPath .contextkit/hooks` instead of writing to `.git/hooks/`
- Auto-injects `prepare` script into `package.json` so hooks work for all devs after `npm install`
- Hook files renamed from `.sh` extension to match git conventions (`pre-push`, `commit-msg`)
- All existing commands rewritten to be framework-agnostic (no React assumptions)
- Legacy `.git/hooks/` ContextKit wrappers automatically cleaned up

### Fixed
- Gradle quality gate now checks for `gradlew` and verifies `check` task exists
- Go and Maven gates skip when no source files exist

## [0.9.0] - 2026-02-16

### Added
- **Quality Gates**: Pre-push hooks now auto-detect your project framework and run the right checks automatically
  - Node.js: TypeScript, ESLint, Prettier, build, test (auto-detects npm/yarn/pnpm/bun)
  - Python: ruff/flake8, mypy, black/ruff format, pytest
  - Rust: cargo check, clippy, cargo test
  - Go: go vet, golangci-lint, go test
  - PHP: PHPStan, PHPUnit
  - Ruby: RuboCop, RSpec/rake test
  - Java: Maven verify / Gradle check
  - Generic: informational message for unrecognized projects
- All gates skip gracefully when tools aren't installed
- Integration test suite for framework detection and hook installation

### Changed
- Git hooks now use native approach instead of Husky
- Hooks work in any git repo — no longer requires package.json or Node.js
- `ck install` hooks prompt now checks for `.git/` instead of `package.json`
- Install prompt updated with "Quality Gates" branding

### Removed
- Husky dependency — no longer installed or required
- `installHusky()`, `checkHuskyInstalled()`, `initializeHusky()`, `checkCommandExists()` methods from GitHooksManager

### Fixed
- Pre-push script grep patterns now match script keys (`"test":`) instead of any occurrence of the word in package.json

### Migration
- Existing `.husky/` directories with ContextKit markers are automatically cleaned up on next `ck install`
- Users can manually run `npm uninstall husky` to remove the dependency
