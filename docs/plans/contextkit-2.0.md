# ContextKit 2.0 Plan

Status: implemented on branch `contextkit-2.0` (2026-10-13) — 1.14.0 and 2.0.0. See CHANGELOG.md.

## Why

- ContextKit's value is **context for the model**, not scripted workflows. Strong models (Opus/Sonnet 5.5, Fable 5.1, GPT-6 Astra) plan, build, and test in their own loop; role pipelines interrupt it.
- Local usage data: squad/spec last used Aug 2026 (Codex only), never in Claude Code. 0 Claude Code model-invoked loads of any ContextKit project skill. Projects work from standards + gates alone.
- Real gaps found:
  - Always-loaded files carry generic style rules; high-value domain guides (e.g. ~1,700 lines in hapara-frontend) are loaded by nothing.
  - `chat_minimal_words` lives in `ai-guidelines.md`, only loaded via `standards-aware` → effectively never applied in Claude Code.
  - `CLAUDE.md` and `AGENTS.md` bodies come from two templates and have drifted (`agents-md.js` still points testing.md at `squad-test`).

## Target shape

```
AGENTS.md        canonical: short standards index, "touching X → read Y" table, rules, headline block
CLAUDE.md        @AGENTS.md + Claude-only lines
other bridges    thin pointer, or none where the tool reads AGENTS.md natively
path-scoped rules  topic guides load only when matching files are touched
                   (.claude/rules paths:, Cursor .mdc globs, Copilot .instructions.md applyTo)
```

| Group | Skill | Job |
|---|---|---|
| Core | `/ck` | `setup` (was analyze) · `update` (migrate + clean, judgment work) · `tidy` (was compress; prune generic rules, find orphan guides, promote repeated corrections) |
| Core | `/doc` | Diff-driven by default: update docs/standards affected by the current change (absorbs personal `/check-docs`); `arch` / `feature` / `component` levels as options |
| Core | `/learn` | Save a correction into the right rule file (not just `corrections.md`) |
| Add-on | `/goal` | Long-horizon task template + runner (replaces squad/spec) |
| Add-on | `/headline` | Result-first, short replies. **Always on** via a marker block in `AGENTS.md`; skill installs/toggles it |

Removed: all `squad-*` (incl. `squad-ci`), `spec`, `spec-component`, `standards-aware`, `product-context`, `refactor`, `review`, `test`, `context-budget`, `ck` (health-check → `ck check` CLI), `agent-push-checklist` (pre-push gates enforce it).

## `/goal` design

`.contextkit/goals/<slug>.md`, ~1 page:

```
## Goal            2–3 sentences of intent
## Outcomes        3–7 checkable, user-side (human-owned)
## Checks          detailed criteria, refined while building (agent-owned)
## Constraints / Non-goals
## Open decisions  multiple-choice, waiting on a human
## Changes         dated: "AC3 changed: X, because Y"
## Progress        done / next / blocked
```

- Kickoff drafts outcomes; gaps asked as multiple choice (`AskUserQuestion` in Claude Code; `request_user_input` or lettered text fallback elsewhere).
- Agent builds in its own loop (plan → edit → test → fix), no role handoffs.
- `AGENTS.md` line: "If `.contextkit/goals/` has an active goal, read it first" — survives compaction and new sessions.
- Internal check changes: log only. User-visible changes (scope, UX, dropped outcome): ask first.
- Per outcome: fresh-context reviewer subagent (primary model) reads diff + goal + change log, never the builder's narrative. Fallback: inline review in tools without subagents.
- One commit per outcome; goal marked done when all outcomes verified.
- Design reference: personal `hapara-feature-canvas` (interview → outcomes), `ralph` / `task-loop` (caps, verify step).

## `/headline` rules

- Lead with the result or answer.
- No narrating reasoning, no recaps.
- Plain sentences; tables only for comparisons.
- Ask with options, not open-ended questions.
- Say plainly when something failed or was skipped.
- Code, commands, and paths stay complete — only prose shrinks.

Marketed as faster-to-read replies, not token/cost savings. Shareable standalone (one skill folder + snippet). `/headline` asks project vs user-level (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`); `/headline off` removes or pauses for the session.

## Stage 1 — 1.14.0 (non-breaking)

1. **Fix stale pointer** — `lib/integrations/agents-md.js` (`squad-test` → current skill).
2. **`/headline` add-on** — registry entry in `lib/skills/registry.js`, source `commands/addons/headline.md`; `ck install` adds the `AGENTS.md`/`CLAUDE.md` block by default (`--no-headline` to skip); global install via `lib/utils/global-skills.js`.
3. **`/goal` add-on** — registry entry, `commands/addons/goal.md`, template `templates/goal.md`; global install eligible.
4. **`/learn`** — registry entry, `commands/dev/learn.md`; reuses `lib/commands/note.js` for the log write.
5. **Diff-driven `/doc`** — rework `commands/docs/` into one diff-first workflow with level options (keep old `doc-*` skills as aliases until 2.0).
6. **Stale-context check** — `lib/commands/check.js`: broken file refs in standards, pointers to non-existent skills, always-loaded size budget. Warning-only in `hooks/pre-push`.
7. **`ck usage`** (opt-in) — new `lib/commands/usage.js`: Claude Code transcript scan for `Skill` tool calls + `SKILL.md` reads; Codex session scan for real `SKILL.md` reads (exclude startup skill lists). Optional `Skill` hook via `lib/utils/claude-settings.js`.
8. **Deprecation notices** — squad/spec skills print "removed in 2.0, use `/goal`".
9. **Docs** — README + website: add `goal` and `headline` pages, `ck usage`, deprecation banner on squad/spec pages.

## Stage 2 — 2.0.0 (breaking)

### AGENTS.md canonical
- `lib/integrations/agents-md.js` becomes the single body; `claude-integration.js` writes `@AGENTS.md` + Claude-only lines; `codex-integration.js` / `opencode-integration.js` unchanged consumers.
- Review `gemini`, `copilot`, `windsurf`, `aider`, `cursor` integrations: thin pointer vs native AGENTS.md support.

### Standards loading
- `lib/commands/install.js` + `commands/dev/analyze.md` (→ `/ck setup`): generate a ≤~50-line index in `AGENTS.md`; topic guides emitted as path-scoped rules per platform.
- `/ck tidy` prunes generic/linter-enforced rules and wires orphan guides.

### Skill removals and merges
- `lib/skills/registry.js`: remove retired entries; add `ck` (setup/update/tidy), keep `doc`, `learn`, `goal`, `headline`.
- Delete `commands/squad/`, `commands/spec/`, `commands/dev/spec-component.md`, `commands/agents/standards-aware.md`, `commands/agents/product-context.md`, `commands/agents/context-budget.md`, `commands/agents/agent-push-checklist.md`, `templates/github-actions/squad-issue.yml(.md)`, squad/spec templates no longer used.
- `lib/utils/global-skills.js`: families become `goal` / `headline` (not `squad` / `spec`); `lib/commands/uninstall.js` accepts old family names and removes them.
- Plugin: `plugins/contextkit/skills/`, `.claude-plugin/marketplace.json` regenerated from registry.
- Remove `response_style` from `lib/utils/config-schema.js` and `install.js`.

### Update path
- `lib/utils/migrations.js`: `CURRENT_FORMAT_VERSION = 2`; v1→v2 step (mechanical, inside ContextKit markers only, after backup):
  - rewrite `AGENTS.md` block; shrink `CLAUDE.md` block to the import
  - remove retired skill dirs from `.claude/skills`, `.codex/skills`, `.agents/skills`
  - convert `chat_minimal_words: true` → headline block; drop `response_style`
  - fix stale pointers
  - queue for `/ck update`: user content outside markers, unfinished `.contextkit/squad/` handoffs
- `lib/commands/update.js` `removeLegacyFiles()`: add retired files.
- `/ck update` skill (judgment, runs in Claude or Codex):
  - refuses on a dirty git tree
  - per custom `CLAUDE.md` block, **asks**: move to `AGENTS.md` / keep in `CLAUDE.md` / delete
  - unfinished squad handoff: asks convert to goal / archive / keep
  - reconciles pending standards updates (was `standards-aware`)
  - ends with summary + one commit

### Tests
- Update/remove: `__tests__/commands/squad.test.js`, `__tests__/skills/registry.test.js`, `__tests__/skills/render.test.js`, `__tests__/plugin/plugin-sync.test.js`, `__tests__/commands/update.test.js`, `__tests__/commands/install.test.js`, `__tests__/commands/check.test.js`.
- New: migration v1→v2 fixtures (custom content outside markers, in-flight squad handoff, `chat_minimal_words` on/off), `usage.test.js`, headline block install/remove.

### Docs
- **README**: rewrite Why / Key Features around context; `AGENTS.md`-first layout; new skill list; replace Squad Workflow, Spec Pipeline, CI Squad sections with a short "Long-running tasks (`/goal`)"; Add-ons section; "Upgrading to 2.0" section; Commands block (global skills, plugin, `ck usage`).
- **Website** (`contextkit-docs/`):
  - remove `docs/squad`, `docs/spec`, `docs/ci-squad` → redirect to `docs/goal`
  - new: `docs/goal`, `docs/headline`, `docs/upgrade-2-0`
  - update: `docs/how-context-works`, `docs/project-structure`, `docs/slash-commands`, `docs/commands`, `docs/platform-examples`, `docs/md-first`, `docs/quality-gates`, `docs/troubleshooting`, `docs/page.tsx`, `components/features.tsx`, `components/docs-sidebar.tsx`, `app/sitemap.ts`
- Standards files in this repo (`.contextkit/standards/architecture.md` etc.) and root `CLAUDE.md` bridge text updated to match.

## Verify before building

- Does Claude Code read `AGENTS.md` natively? (Plan assumes `CLAUDE.md` → `@AGENTS.md` import either way.)
- Path-scoped rule support and syntax per platform (Claude Code `paths:`, Cursor globs, Copilot `applyTo`, others).
- Which other tools read `AGENTS.md` natively (decides which bridge files remain).
- Codex `request_user_input` outside Plan mode (`default_mode_request_user_input` flag, under development as of 0.155.1) — text fallback must work without it.
