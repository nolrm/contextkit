# Changelog

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
