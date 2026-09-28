# Changelog

## [1.12.0] - 2026-09-28

### Added
- **ContextKit is now installable as a native Claude Code plugin** — `claude plugin marketplace add nolrm/contextkit` then `claude plugin install contextkit@contextkit-marketplace` gets all 22 squad/spec/dev/docs/agents skills, self-contained (no `.contextkit/` needed for `/spec` or `/squad` — same guard-removal transform the existing global-install path already used). Claude Code handles versioning/updates itself instead of `ck` managing a `~/.claude/skills/` folder by hand. Verified end-to-end against a real Claude Code install (2.1.283): marketplace add, install, and `claude plugin details` all confirmed the expected 22-skill inventory and a clean `claude plugin validate` pass on both the plugin and the marketplace manifest.
- **`scripts/build-plugin.js`** (`npm run build:plugin`) — regenerates the committed `plugins/contextkit/` directory from `lib/skills/registry.js` + `commands/`, reusing the same per-skill `transform`/`extraSource` logic the global-install path already had (e.g. `spec`'s `.contextkit/`-guard removal, `spec-component`'s inlined template). `__tests__/plugin/plugin-sync.test.js` fails CI if the committed output drifts from what the generator would currently produce, so a maintainer never forgets to run it after touching `commands/` or the registry.

## [1.11.0] - 2026-09-28

### Added
- **`SPEC.md` gets a structured `Mode:` header field** (`> Source: ... · Scope: ... · Mode: full|lite · Date: ...`) instead of `/squad-spec` inferring mode by string-matching a prose line. Specs written before this field existed fall back to the old prose sniff, so nothing already generated breaks.
- **`/spec` mechanically validates SPEC.md before updating progress files** — every story has a matching Acceptance Criteria block, every AC bullet matches EARS shape, no compound criteria, every story has a squad command. Fixes format issues itself rather than asking, since these are mechanical, not design decisions.
- **`/squad-spec` validates the same way before creating any handoff** — refuses to start a pipeline run against a malformed spec instead of discovering it partway through.
- **Stories table gets a `Status` column** (`pending` at spec time). `/squad-spec`'s Commit step updates it to `done @ <short-sha>` after each story's commit — lightweight build traceability without a separate tracking file.
- **`/spec --verify [scope-slug]`** — re-reads a built scope's code against its Acceptance Criteria and classifies every AC line as verified / drifted / unknown in a new `## Verification` section. Addresses the standard criticism of static specs (nothing re-checks them once code ships) without inventing a new subsystem — it's a judgment task the existing CTO-pass skill is already positioned to do. Reports only; never edits code or the spec.

## [1.10.0] - 2026-09-28

### Added
- **`/analyze` non-inferable filter** — every candidate rule must now pass three checks before it's written to a standards file: not derivable from a manifest/config/directory listing, grounded in a specific cited source file, and something that actually changes agent behavior. Directory trees, dependency inventories, and generic framework advice are explicitly excluded regardless of how the analysis scan surfaces them — grounded in a study finding generated context files with these included measured *lower* task success (0.5–2%) and *higher* inference cost (20%+) than no context file at all, while human-curated non-inferable-only content measured +4%. See `docs/token-efficiency.md` § Evidence for the full citations (added in this release).
- **150-line always-loaded budget check** — `/analyze` now counts `code-style.md` + `architecture.md`'s combined lines after writing and flags the user if it's over budget instead of growing silently.
- **`<!-- ck:unreviewed -->` markers** — every rule `/analyze` generates or updates gets one; a human clearing the marker is the review signal, not automatic. `ck check` now reports the count of unreviewed markers remaining per standards file.

### Fixed
- **`ck analyze` (the standalone CLI command, distinct from the `/analyze` skill) was silently broken against every real install** — its existence guard, its instructions-read, and both of its printed AI-chat prompt suggestions all checked/referenced `.contextkit/commands/analyze.md`, a path that has never existed since the file moved to `.contextkit/commands/dev/analyze.md`. It always printed "ContextKit not found" regardless of install state. The command's own test suite didn't catch this because its fixture wrote to the same wrong path the bug checked for.

## [1.9.0] - 2026-09-28

### Added
- **`.agents/skills/` — portable Agent Skills output** — Codex and Cursor now also write every skill to `.agents/skills/<name>/SKILL.md` (the shared cross-tool convention ~40 tools have adopted), alongside their existing `.codex/skills/`/`.cursor/prompts/` output. Confirmed via a live install against Codex CLI 0.155.1 that it reads both `.codex/skills/` and `.agents/skills/` — this is additive, not a migration. Cursor's own scanning of `.agents/skills/` is per its published docs, not independently verified against a live install (see `CONTEXT-ENGINEERING-PLAN.md` spike S2).
- **`lib/skills/registry.js` + `lib/skills/render.js`** — every skill's name, description, source command file, and per-target metadata now lives in one registry, rendered per platform instead of hand-written 3–4 times over. `global-skills.js`'s squad/spec skill list is now derived from the same registry.
- **Cursor gets full skill parity** — `.cursor/prompts/` now covers all 22 skills (previously 10: several squad phases, the doc family, and the agent/meta skills were missing).
- **`/squad-auto` isolates Dev, Test, Review, and Doc in their own subagent context by default** — matching `/squad-spec`'s design, and for the same reason: a Tester or Reviewer sharing Dev's context tends to verify Dev's account of its own work rather than the diff itself. `model_routing` no longer toggles isolation on/off; it only picks which model Dev/Test run on (Haiku vs. the primary model). Codex gets the same treatment where its now-stable `multi_agent` capability (CLI 0.155.1+) is available, falling back to inline execution otherwise.

### Fixed
- **Codex and OpenCode no longer overwrite each other's `AGENTS.md` block** — both previously wrote different content to the same marker-delimited section, so installing one after the other silently replaced the other's customization. Both now render from one shared `lib/integrations/agents-md.js`.
- **Stale `.contextkit/commands/...` paths in the standards block shared by Aider, Copilot, Gemini, Windsurf, and Continue** — missing the `dev/` subdirectory on every path, and referencing a `run-tests.md` file removed in 1.7.0. All five integrations pointed agents at files that don't exist.
- **Stale `showUsage()` output** in the Claude and Cursor integrations still listed `/review`, `/refactor`, `/test`, `/doc` — removed from the product in 1.7.0.
- **`squad-spec` global skill's argument hint** was missing the `.md`-file option `/squad`/`squad.md` skills already documented.

## [1.8.0] - 2026-09-28

### Added
- **`/spec` lite mode** — on init, `/spec` classifies the overview as either a greenfield product idea (**full** mode: Data Model, API Contracts, UX Flows, Stories) or an implementation plan against an existing system (**lite** mode: Stories + EARS Acceptance Criteria + squad commands only, deferring to the source doc for schema/API/UX instead of restating or reinventing them). The mode is recorded as `mode:` in `PROGRESS.md` and fixed for the whole spec run; `--full` / `--lite` override the detection when starting a new spec. `/squad-spec` carries the mode into each handoff (`spec-mode:`) and, in lite mode, points Architect at the source doc as the hard constraint.
- **`/squad <plan.md>`** — passing a single bare `.md` file extracts distinct, independently shippable tasks from it (one per phase for phase-structured plans), confirms the list, then continues as single-task or batch mode. Also works through `/squad-go`.

### Fixed
- **`/squad-auto` now runs each phase's full instructions** — it previously carried its own abbreviated copy of Architect/Dev/Test/Review/Doc, silently skipping PO-spec validation, task-split detection, context-file discovery, the test-level decision table, and Review escalation for anything run through `/squad-auto`. Each phase now follows the numbered steps of its own command file, and `*-clarify` results pause just that task and move on to the next instead of being assumed to advance.
- **`/squad-auto` model-routed sub-agents pointed at non-existent paths** (`commands/squad-dev.md` / `squad-test.md` instead of `commands/squad/…`), and the Tester range stopped one step short of the handoff update.
- **`/squad-review`** referenced the Review section as "5. Review" instead of "6. Review".
- **Claude `/spec` skill description** still described the retired multi-round domain-expert pipeline instead of the single inline CTO pass.

## [1.7.0] - 2026-08-14

### Added
- **Global skills — `ck install --global`, `ck update --global`, `ck check --global`, and the new `ck uninstall --global`** — install the squad pipeline (10 skills) and spec family (`spec`, `spec-component`) once to `~/.claude/skills/`, shared across every project instead of duplicated per-repo via `ck install`. Each skill is fully self-contained (source command content is inlined at generation time — no `~/.contextkit/` mirror to manage), and the two skills with hard local-`.contextkit/`-dependencies (`spec`'s existence guard, `spec-component`'s template file) are adapted for the global variant so they work in any repo with zero local setup. `ck update --global` regenerates/overwrites in place. Every generated file carries a `contextkit-managed`/`contextkit-version` marker in its frontmatter, so `ck uninstall --global` can never remove a same-named skill you wrote yourself, and `ck check --global` can report version drift without needing separate state. Project-level `.claude/skills/` (if present) still takes precedence over the global copies, so existing per-project installs are unaffected.
- **`ck uninstall`** — new top-level command (currently `--global` only; per-project uninstall of standards/CLAUDE.md/hooks is a separate future effort). Safe by default: a bare `ck uninstall --global` lists what's installed instead of removing anything — you need an explicit skill/family name or `--all`.

### Removed
- **`review`, `refactor`, `test`, and `doc` skills** — dropped from all three skill-generating platforms (Claude Code, Codex, Cursor). `review`/`test` were largely superseded by the squad pipeline's `squad-review`/`squad-test` phases for anyone running squad end-to-end; `doc` overlapped with the more precise `doc-arch`/`doc-feature`/`doc-component` (3-level docs) and `squad-doc`. `analyze` is unaffected and still generates `.contextkit/standards/`. Existing installs get these cleaned up automatically on the next `ck update` (added to the legacy-file cleanup list) — the removed command files remain in git history if ever needed.

## [1.6.1] - 2026-08-11

### Fixed
- **`ck update` now syncs `status.json`'s version field, not just `config.yml`'s** — `status.json` was only ever written once at `ck install` time; `StatusManager.updateVersion()` existed but was never called from the update flow, so `status.json`'s version (and `ck status`'s own independent update-check, which reads it) drifted permanently stale after every subsequent `ck update`, while `config.yml`'s version stayed correct.
- **Pre-push quality gate failures now actually show the failure banner** — `hooks/pre-push` set `trap on_gate_failure ERR` but was missing `set -o errtrace`, so the trap never fired for a failure inside a function (which every real gate runs through: `run_gate`, `run_node_gates_core`, etc.). A failing gate blocked the push correctly but silently — no "❌ Quality Gates FAILED" banner, no indication of what happened or where. Also fixed the summary box's `Gates:`/`Total:` lines, which used hardcoded padding and could render with a missing or misaligned border; they're now printed as plain lines below the box instead.
- **`ck update`/`ck status` no longer leak literal quote characters from single-quoted `config.yml` values** — their hand-rolled YAML parsers only stripped double quotes (`.replace(/"/g, '')`), so a `version: '1.0.0'`-style (single-quoted) config produced messages like `Updating from '1.0.0' to 1.6.0`. Beyond the display glitch, the mangled string fed into `isNewerVersion()`'s numeric comparison, where corrupted segments parse to `NaN` — a real (if edge-case) correctness bug, not just cosmetic. Also fixed `status.js`'s `version:` match missing the top-level-only guard `update.js` already had, which could pick up the indented `_source.version` depending on field order.

## [1.6.0] - 2026-08-11

### Changed
- **`/squad-spec` and `/squad-auto` commit per story/task, not just at the end of a run** — right after a story's (or task's) Doc phase passes, the orchestrator stages exactly the files named in that unit's Changes Made/Tests Written/Doc Notes (not a blanket `git add -A`) and commits in Conventional Commits format, before moving on. Skips cleanly if there's nothing to commit or the project isn't a git repo; if anything unrelated shows up staged, or the commit itself fails (e.g. a pre-commit hook), it stops and surfaces that instead of continuing with uncommitted work. Keeps history bisectable and revertable per story instead of one scope-sized commit at the end.
- **`/squad-spec` Architect now resolves blocking open questions itself** — a new `### Open Question Resolutions` section in the handoff template requires Architect to record the assumption made and its rationale for each open question a story's spec flags as blocking, instead of silently deciding and leaving it buried in prose. Scoped to `/squad-spec` specifically, since (unlike `/squad`/`/squad-auto`, which can pause via `arch-clarify`) it runs unattended with no human to escalate to mid-run.

## [1.5.0] - 2026-08-10

### Changed
- **`/squad-spec` dispatches each phase as an isolated subagent** — Architect, Dev, Test, Peer Review, Review, and Doc each now run in a fresh Task-tool context on Claude Code, reading only the handoff file rather than the accumulated reasoning of earlier phases. Prevents Review from anchoring on Dev's own account of its work. Codex falls back to the previous inline-in-context behavior — no equivalent subagent-spawn primitive is available to a `/goal`-driven skill yet.
- **`/squad-spec` Review and Peer Review default to `claude-haiku-4-5-20251001`** — both are verification passes against an already-written checklist (acceptance criteria, prior Issues Found), not design work, so they route to the cheaper model by default. Architect and Dev stay on the primary model.
- **`/spec` writes acceptance criteria in EARS format** — `SPEC.md`'s `## Stories` section now has a dedicated `### Acceptance Criteria` block per story (`WHEN [event], the system SHALL [response]` / `IF [precondition], THEN the system SHALL [response]`), instead of folding criteria into the one-line `/squad` command string. `/squad-spec`'s handoff pre-fill now copies this block verbatim rather than re-deriving criteria, and Review checks each line individually against the diff. `/spec --extend` appends new stories' AC blocks alongside their table rows.
- **`/squad-spec` Step 5 full-suite gate runs in the foreground with low/serial parallelism** — replaces the previous backgrounded, max-worker run. The background+parallelism combo was pinning the machine's CPU while barely saving any real time (it only overlapped the trivial summary-writing step, not actual work), and the gate already blocked until the suite finished either way. Advancing to the next scope still waits for a clean result.

### Fixed
- **`squad-spec` skill was missing `Task` in `allowed-tools`** — would have silently blocked the subagent dispatch above from working at all.

## [1.4.0] - 2026-08-05

### Changed
- **`/squad-spec` test scope** — per-story Test phase now runs only tests touching that story's changed files; the full suite runs once per scope, at the new Step 5 regression gate, backgrounded so it doesn't block reporting.
- **`/squad-spec` review failures now self-repair** — a `needs-work` verdict sends the story back to Dev automatically (up to 2 retries, tracked via a new `attempts` field) with an independent Peer Review pass on each retry, before finally stopping for a human.
- **`/squad-spec` Step 3 resume logic** — explicit precedence for `needs-work` stories (blocks only their dependents, not the whole run) and a defined recovery path for stories interrupted mid-phase (resumes from that phase instead of undefined behavior).

## [1.3.0] - 2026-07-24

### Removed
- **Claude Code PostToolUse format+lint hook** — `ck install`/`ck update` no longer writes a `PostToolUse` hook to `.claude/settings.json`. It ran the project's format+lint command after every single Edit/Write during a Claude Code session, which noticeably slowed sessions down on any file-heavy task. Quality is still enforced at push time via the existing pre-push git hook. Removed `lib/utils/hook-detector.js` and `lib/utils/claude-settings.js` along with their tests, since nothing else used them. Existing installs keep whatever hook entry they already have in `.claude/settings.json` (it's user-owned, gitignored state) — remove it by hand if you had one; `ck update` will not re-add it.

## [1.2.3] - 2026-07-22

### Added
- **`lib/utils/standards-migrations.js`** — registry of content fixes to *generic* sections of already-installed `standards/*.md` files. `ck update` never re-downloads `ai-guidelines.md`/`architecture.md`/`code-style.md` (they're user-owned so `/analyze` customizations survive), which meant a wording/behaviour fix to shipped boilerplate never reached existing installs. `update.js#applyStandardsMigrations` now replaces each entry's exact `from` text with `to` when found verbatim; if the section was hand-edited (by the user or `/analyze`) and no longer matches, the entry is recorded in a new `pending_standards_updates` list in `config.yml` instead of being force-applied. See `standards-migrations.md`.
- **`standards-aware` skill reconciles pending standards updates** — before doing agentic work, it now checks `config.yml`'s `pending_standards_updates` list and, for each entry, proposes folding the upstream change into the project's customized content rather than leaving it stale indefinitely.
- **`pending_standards_updates` config.yml field** — added via `config-schema.js` (existing installs) and `install.js`'s fresh-install template.

### Changed
- **`ai-guidelines.md`'s "README.md Context Discovery" rule scoped down** — now skips the check for quick lookups, one-line fixes, and single-file tasks with an already-clear purpose, keeping the full check only for substantial feature/component work. This is the first entry in the new `standards-migrations.js` registry above.

## [1.2.2] - 2026-07-21

### Changed
- **`/spec` and `/squad-spec` output moved to `.contextkit/spec/`** — previously written to a root-level `spec/` folder that was always committed. Per-feature specs are ephemeral working state (deleted/archived once the stories are implemented via squad), so the folder now lives under `.contextkit/` and is gitignored/archived the same way `.contextkit/squad/` already is (`.contextkit/spec-archived-[timestamp]/` on conflict). Updated `commands/spec/spec.md`, `commands/squad/squad-spec.md`, the `spec` skill's description text, `README.md`, and the public docs site's `/docs/spec` page. `lib/commands/install.js` now adds `.contextkit/spec/` and `.contextkit/spec-archived-*/` to generated `.gitignore` entries.

### Fixed
- **`ck update` no longer risks writing the project version into the wrong `config.yml` field** — `parseConfig` and `updateConfigVersion` matched any `version:` key, including the indented `_source.version` field (which tracks the CK tool version, not the project's). Both are now anchored to the top-level, unindented `version:` line only.

## [1.2.1] - 2026-07-14

### Fixed
- **`ck update` no longer drops config.yml blocks it doesn't recognize** — `restoreUserConfig` used to fully regenerate `config.yml` from a narrow hardcoded template, silently discarding any block absent from that template (`response_style`, `required`/`optional`/`conditionals`, `analysis_scope`/`analyzed_packages`, `features.squad_ci_workflow`, `profile`, `metadata`, etc.). Replaced with `appendMissingSettings`, which diffs the raw file against a new `config-schema.js` registry and only appends whatever's missing — with an explanatory comment — leaving everything else untouched. This also restores `check.js`'s required/optional-file gate and `analyze.js`'s monorepo scope memory, both of which were being silently disabled on any project that had run `ck update` even once.

### Added
- **`lib/utils/config-schema.js`** — single registry of additive `config.yml` settings, consumed by both a future `install.js` template pass and `update.js#appendMissingSettings`. See `lib/utils/config-schema.md`.

### Docs
- **`migrations.md`** — clarified when to use format-version migrations vs. the new additive `config-schema.js` registry.

### Tests
- **`update` unit tests** — added tests 22–26 covering appending `response_style`, `required`/`optional`/`conditionals`/`analysis_scope`, inserting `features.squad_ci_workflow` into the existing `features:` block, not duplicating settings that already exist, and not reordering/removing any pre-existing line.

## [1.2.0] - 2026-07-13

### Added
- **Configurable response style** — new `response_style` block in `config.yml` with two independent per-project flags: `chat_minimal_words` (terse, plain-text chat explanations) and `diagrams_in_docs` (allow Mermaid in generated `.contextkit/standards/*.md`). Both default to the existing compact behavior (`true`/`false`). Checked by `ai-guidelines.md`, `/analyze`'s Output Density rules, and the `compress` skill.
- Generated `CLAUDE.md` now points to the `response_style` config block so the toggle is discoverable every session, not just when `ai-guidelines.md` loads via the `standards-aware` skill.

### Tests
- **`install` unit tests** — added tests 64–65 verifying `config.yml` ships the `response_style` defaults and `ai-guidelines.md` documents both flags.
- **`claude-integration` unit tests** — added test 19 verifying generated `CLAUDE.md` references `response_style` / `config.yml`.
- **`download-manifest` test** — updated test 26 for the reworded (now config-aware) Output Density bullet in `analyze.md`.

## [1.1.7] - 2026-07-09

### Changed
- **Always-loaded standards footprint cut ~6x** — Claude Code and Codex now always-load only `code-style.md` and `architecture.md` via `CLAUDE.md`/`AGENTS.md` `@imports`. `testing.md`, `workflows.md`, `ai-guidelines.md`, `glossary.md`, `decisions.md`, `roadmap.md`, and `corrections.md` now load on demand via the `test`, `agent-push-checklist`, `standards-aware`, and new `product-context` skills instead. See `docs/token-efficiency.md` for the rationale.
- **`analyze` generates compact output by default**, and the `doc-*` skills gained a Length Check split-proposal step.

### Added
- **`compress` skill** — retrofits oversized standards/docs files for information density; marker-safe on bridge files and backs up hand-edited skill files first.
- **`product-context` skill** — loads architecture decisions and roadmap context on demand before proposing changes.
- **Update nudges** — a throttled pre-push hook check and a self-update offer surfaced via `standards-aware`, so existing installs that never check for updates still get pointed at `ck update`.

## [1.1.6] - 2026-06-29

### Added
- **`/squad-spec` auto mode** — running `/loop /clear /squad-spec` without a scope slug now processes ALL completed spec scopes in sequence. When a scope finishes it writes the next scope slug to `.contextkit/squad/next-scope.txt` and lets the loop continue rather than stopping. Only halts when all scopes are exhausted, printing a full cross-scope summary. Previously required manually re-triggering the loop for each scope.

## [1.1.5] - 2026-06-29

### Fixed
- **`ck update` resilience (complete)** — ALL file downloads (commands, hooks, standards, types, scripts) are now non-fatal. Any single file failure logs a `⚠ Skipped` warning and the update continues. Previously only types and legacy scripts were graceful; a transient 400 on any command file still aborted the entire update and rolled back the backup.
- **`ck update` skipped-file reporting** — spinner now shows `Files updated (N skipped — retry if issues persist)` when downloads were skipped, making partial updates visible.

### Tests
- **`update` unit tests** — added tests 20–21 verifying that a 400 on a command file download is non-fatal and logs a warning instead of aborting.
- **CLI integration tests** — expanded `cli.test.js` from 9 to 18 numbered tests; now covers `ck update`, `ck check`, `ck analyze`, `ck note`, `ck run` at the CLI level, and verifies `ck update` exits cleanly when ContextKit is not installed.
- **`download-manifest` test** — updated URL regex to match refactored `${base}` variable alongside original `${this.repoUrl}`.

## [1.1.4] - 2026-06-29

### Fixed
- **`ck update` resilience** — types files (`strict.tsconfig.json`, `global.d.ts`, `type-check.sh`, `typescript-strict.json`) and `scripts/update.sh` are now downloaded with graceful fallback. A transient network error on any of these non-critical files previously aborted the entire update and rolled back the backup. They now log a warning and continue.
- **`squad-config` integration test** — fixed test paths that expected squad commands at `.contextkit/commands/squad.md` (flat) instead of the correct `.contextkit/commands/squad/squad.md` (subdirectory).

## [1.1.3] - 2026-06-29

### Added
- **`/spec OVERVIEW.md`** — pass an overview file directly to start a new spec session. If an existing spec is detected from a different source file, prompts before archiving (`spec/` → `spec-archived-[timestamp]/`). Same source resumes normally with no prompt.
- **`/spec --add [scope-slug]`** — append a new scope to an in-progress spec and run it immediately. No need to manually edit `PROGRESS.md`.
- **`/spec --extend [scope-slug]`** — add new stories to an already-written scope. Appends to the Stories table and Squad Commands block; leaves data model, API contracts, and UX flows untouched unless strictly required.
- **`/spec` loop termination** — Step 5 now emits a stop signal so `/loop /clear /spec` terminates cleanly when all scopes are done (overnight batch runs).
- **`/squad` conversation extraction** — running `/squad` with no explicit task args (or with a directive phrase like "let's do it", "let's go", "go ahead") now scans the current conversation for agreed tasks, shows a confirmation list, and proceeds. Previously required explicit task descriptions.

### Changed
- **`/squad-go`** — simplified to "squad + auto-run": follows the full `/squad` workflow (including conversation extraction) then immediately runs the pipeline with no checkpoint pause. Previously duplicated squad logic; now delegates to `squad.md` with `checkpoint: none`.
- **`/squad-go` SKILL.md** — removed `context: fork`. Currently inert (fork is not yet implemented in Claude Code) but future-proofs the skill: when fork lands, leaving it would break conversation access.

### Improved
- **`ai-guidelines.md` + `AGENTS.md`** — added "Working on This Package" rule: when editing commands or skills in this repo, all mirror locations must be updated together (`.contextkit/commands/` + `commands/`, `.claude/skills/` + `.codex/skills/`).
- **`.claude/skills/spec/SKILL.md`** — updated argument hint to include new flags; replaced stale "multi-round domain experts" description with accurate single-pass CTO description; removed `context: fork`.
- **`.codex/skills/spec/SKILL.md`** — updated description to match new flags and behaviour.

## [1.1.2] - 2026-06-25

### Removed
- **`/squad-auto-parallel`** — removed. Parallel subagents have no write coordination; tasks in a real batch almost always touch shared files (e.g. `lib/index.js`, `README.md`), producing conflicts that cost more to resolve than the parallelism saves. Use `/squad-auto` for all batch runs.

## [1.1.1] - 2026-06-24

### Changed
- **Codex integration — full skills support** — `ck codex` now creates `.codex/skills/` with 24 skill files (same set as Claude Code): spec, squad, squad-auto, squad-spec, squad-go, all squad phase commands, doc family, dev commands, and agent commands. Each skill reads the corresponding `.contextkit/commands/` file. Previously only created `AGENTS.md` with no skill support.

## [1.1.0] - 2026-06-24

### Changed
- **`/spec` — complete redesign to single inline CTO pass** — replaced the multi-agent pipeline (4 parallel domain experts, CTO challenges, revision round, 8+ agent spawns per scope) with a single inline CTO pass. One `SPEC.md` per scope instead of 7 intermediate files. Output now includes a `### Squad Commands` section with copy-paste `/squad` commands for every story. Significantly lower token cost and simpler output.
- **`/spec` output format** — `SPEC.md` now contains: Summary, Personas, Data Model (full schema + ERD), API Contracts (all endpoints), UX Flows (key journeys + edge cases), Stories table with sizes and dependencies, Squad Commands, Open Questions, Out of Scope. The `ASSUMPTION:` inline marker flags inferred detail for CTO review.
- **Removed** `spec-ux.md`, `spec-data.md`, `spec-systems.md`, `spec-planner.md` — domain agent sub-commands no longer needed.

### Added
- **`/squad-spec [scope]`** — new command that loads a completed spec scope and runs the full squad pipeline (architect → dev → test → review → doc) for every story automatically. PO phase is skipped — the spec already is the PO spec. Designed for use with `/loop /clear /squad-spec [scope]` to process one story per loop iteration with a fresh context each time, preventing context bloat across long runs.

## [1.0.3] - 2026-06-24

### Changed
- **`/spec` pipeline — collapse sequential agents into orchestrator** — the four single-sequential CTO agents (Scoper, Briefer, Challenger, Author) are now inline steps run by the orchestrator directly. Only the two parallel domain expert rounds (Round 1 initial, Round 3 revision) still spawn sub-agents. Agent count per scope reduced from 11–12 to 8. The `spec-init.md`, `spec-brief.md`, `spec-challenge.md`, and `spec-author.md` files are removed — their logic lives in `spec.md`.

## [1.0.2] - 2026-06-20

### Changed
- **Cursor `/spec` command** — now points to the project-level spec pipeline (`commands/spec/spec.md`) with a description of the full multi-scope pipeline. Previously pointed to `commands/dev/spec.md` (the component spec).
- **Cursor `/spec-component` command** — new generated prompt for the component-level MD-first spec workflow (split from the old `/spec`). Added to `generatedFiles`, `contextkit-components.mdc` rule, and `showUsage()` output.

## [1.0.1] - 2026-06-08

### Added
- **README.md context discovery rule** — `standards/ai-guidelines.md` template now includes a `## README.md Context Discovery` section instructing AI agents to check for `README.md` at the feature/page and component levels before starting work.
- **Squad Architect step 5.7** — `/squad-architect` now discovers and reads context files at all relevant documentation levels before exploring the codebase, so plans are informed by existing docs.
- **Standard filename guidance** — `standards/architecture.md` template now documents `README.md` as the standard filename for feature/page and component levels, and named files (e.g. `docs/architecture.md`) for the architecture level.

## [1.0.0] - 2026-06-08

### Removed
- **`vibe-kit` / `vk` CLI aliases** — removed from `package.json#bin`. Use `contextkit` or `ck` instead. The deprecation warning has been in place since 0.16.x; 1.0.0 is the hard cutover.

### Fixed
- **Roadmap template placeholders** — the `roadmap.md` generated by `ck install` no longer contains confusing raw brackets (`[PHASE_NAME]`, `[FEATURE]`, `[ITEM]`). Replaced with instructional HTML comments that guide users to fill in their own content.

## [0.21.0] - 2026-06-08

### Security
- **Next.js / React CVE fix** — updated `contextkit-docs` dependencies (`next`, `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`) to patched versions resolving React Server Components vulnerabilities. Main package unaffected.

## [0.20.0] - 2026-05-26

### Removed
- **`/fix` command** — removed across all platforms (Claude Code, Cursor). Use `/squad` for bug fix workflows instead.

### Changed
- **Tagline** updated to "Context Engineering + Agentic AI Pipelines" — README hero, website (hero, SEO metadata, footer, docs intro), and `package.json` now reflect both pillars equally.
- **`package.json` keywords** — added `agentic-pipeline`, `agentic-ai`, `squad-workflow`, `ai-agents`, `autonomous-agents`, `multi-agent`, `claude-code`.

## [0.19.0] - 2026-05-17

### Added
- **`/spec` project specification pipeline** — multi-round, multi-persona pipeline that turns a product overview into an implementation-ready spec before any code is written. Runs CTO Scoper → CTO Brief → parallel domain experts (UX, Data, Systems, Planner) → CTO Challenger → parallel revisions → CTO Author with final `SPEC.md` synthesis. Scope-by-scope with `spec/PROGRESS.md` checklist.
- **9 new spec sub-commands** — `spec-init`, `spec-brief`, `spec-ux`, `spec-data`, `spec-systems`, `spec-planner`, `spec-challenge`, `spec-author` orchestrated by the main `spec` command.
- **`/spec-component`** — renamed from the previous `/spec` command; writes a component-level MD-first spec colocated with source.

### Changed
- **`/spec` skill** — now points to the new project spec pipeline (`spec/spec.md`); component spec moved to `/spec-component`.

## [0.18.0] - 2026-05-17

### Added
- **`/squad-go` express command** — single-invocation alternative to `/squad` + `/squad-auto`. Reads tasks from the current conversation, presents a confirmation list, writes PO specs, and immediately runs the full pipeline with no checkpoint pause.

## [0.17.0] - 2026-05-17

### Added
- **PostToolUse hook** — `ck install claude` now writes a PostToolUse hook to `.claude/settings.json` that runs format+lint after every file edit in a Claude Code session. Auto-detected for Node.js (npm/pnpm/yarn/bun), Go, and Python. Gracefully skipped when no tooling is found.

## [0.16.4] - 2026-04-10

### Fixed
- **CI: npm auth** — restore `registry-url` and `NODE_AUTH_TOKEN` via `NPM_TOKEN` secret; `--provenance` handles attestation only, not authentication

## [0.16.3] - 2026-04-10

### Fixed
- **CI: remove registry-url from setup-node** — `registry-url` writes an `.npmrc` expecting `NODE_AUTH_TOKEN` which conflicts with OIDC Trusted Publishing; removing it lets `--provenance` handle auth correctly

## [0.16.2] - 2026-04-10

### Fixed
- **CI: npm auth** — add `NODE_AUTH_TOKEN` to publish step so the registry accepts the `NPM_TOKEN` secret

## [0.16.1] - 2026-04-09

### Fixed
- **CI: npm self-update removed** — `npm install -g npm@latest` was corrupting the npm installation in the GitHub Actions hostedtoolcache; Node 22 ships with npm 10+ which already supports `--provenance`

## [0.16.0] - 2026-04-09

### Added
- **Smart git hooks detection** — `ck install` detects existing hooks managers (Husky, Lefthook, simple-git-hooks, existing `core.hooksPath`, scripts in `.git/hooks/`) and suggests integration instead of overriding
- **`ck install --force`** — regenerate all files including user-customized standards
- **`ck update --force`** — also regenerate user-owned files (standards, glossary)
- **`/squad` standalone mode** — if `.contextkit/` isn't set up, `/squad` offers to create just `.contextkit/squad/` so the pipeline works without a full `ck install`; never creates `.squad/` in the project root

### Improved
- **`ck install` smart reinstall** — skips user-owned standards files on reinstall; prints skip message with `--force` hint
- **`ck update` non-destructive** — never overwrites user-owned files (`glossary.md`, standards); preserved files logged clearly
- **`ck claude` / `ck cursor` version-aware** — skip regeneration when integration is already up to date; regenerate when version mismatches or files are missing
- **`ck analyze` tech stack fix** — no longer generates JS/TS standards for Go, Python, Rust, Java, and other non-JS projects
- **Gitignore taxonomy** — `addContextKitGitignoreEntries` writes 6 targeted runtime-state entries under a descriptive header; detects and handles existing ignore-all `.contextkit/*` pattern gracefully; upgrades legacy `# ContextKit` header
- **`/doc-arch` dynamic output** — output filename derived from topic argument, PR title, or branch name (`docs/<topic>.md`); confirms filename when inferred, falls back to `docs/architecture.md`

## [0.15.1] - 2026-04-07

### Improved
- **Squad pipeline: sequential task execution enforced** — `/squad-auto` writes each file to disk before moving to the next task
- **Testing standards: Testing Trophy levels** — `testing.md` updated with unit/integration/e2e decision table and change-driven test selection rules

## [0.15.0] - 2026-04-07

### Added
- **Skills format** — Claude commands migrated to skills format with rich frontmatter; Cursor rules updated to match
- **`ck install` gitignore entries** — adds `.contextkit/squad/` and `.contextkit/squad-done-*/` to `.gitignore` on install

### Fixed
- **`ck update` cursor paths** — corrected path resolution for Cursor rules on update

## [0.14.1] - 2026-03-24

### Fixed
- **`.claude/commands/` path bug** — all generated slash command wrappers now reference correct `.contextkit/commands/` subdir paths (`dev/`, `squad/`, `docs/`, `agents/`)

### Added
- New slash command wrappers: `/agent-push-checklist`, `/context-budget`, `/standards-aware`
- `ck install` now appends `.claude/settings.local.json` to `.gitignore` automatically (no-op if file absent or entry already present)

## [0.14.0] - 2026-03-23

### Removed
- **`ck gates` command** — gate configuration is managed directly via `.contextkit/quality-gates.yml`; editing the file is simpler and more transparent than a CLI wrapper

## [0.13.6] - 2026-03-17

### Added

- **Quality Gates: `format` script gate** — if `package.json` has a `format` script, runs it in write mode then blocks the push if any tracked files changed, with a remediation message (`git add -A && git commit -m 'chore: format'`)
- **Quality Gates: `lint` script gate** — if `package.json` has a `lint` script, runs it and blocks on non-zero exit
- Both gates respect `quality-gates.yml` (`disable: [format]` / `disable: [lint]`)
- **`ck install`: quality tooling scaffold** — when the pre-push hook is enabled on a Node.js project with no `format`/`lint` scripts, prompts to scaffold a minimal prettier + eslint setup (adds scripts, `.prettierrc`, `.prettierignore`, `eslint.config.js`, and installs devDependencies using the detected package manager); default No; skipped in CI/non-interactive mode; respects existing configs

### Improved

- **ContextKit own tooling** — added `prettier` + `eslint` (flat config) as devDependencies; `npm run format` and `npm run lint` scripts now active so the gates fire on ContextKit development too; initial format pass applied to all source files

### Fixed

- **`analyze.js`** — `const hasBackend` reassigned in loop; changed to `let` (surfaced by eslint)
- **`install.js`** — two useless escape sequences in shell template literal (`\$@` → `$@`, `\$(` → `$(`)

---

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
