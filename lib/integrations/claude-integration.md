# claude-integration.js

The Claude Code platform integration. Installs `CLAUDE.md`, `.claude/rules/`, and `.claude/skills/` (plus the canonical `AGENTS.md`, via `BaseIntegration#install`).

## Extends

`BaseIntegration`

## install(force = false)

Runs the full Claude Code setup:
1. Writes `AGENTS.md`, the bridge file (`CLAUDE.md`), path-scoped rules, and skills via `super.install()`
2. Ensures `.claude/skills/` directory exists
3. Adds `.claude/settings.local.json` to `.gitignore`
4. Removes legacy files: old `.claude/commands/`, the pre-2.0 always-on `contextkit-standards.md` rule, and skills retired in 2.0 (`lib/skills/retired.js`)

`CLAUDE.md` holds `@AGENTS.md` and `@.contextkit/standards/index.md` imports plus one Claude-only line. Claude Code reads `AGENTS.md` on its own only when there is no `CLAUDE.md`, so the import is what keeps both in step.

Rules come from `context_rules` in `.contextkit/config.yml` (`lib/utils/context-rules.js`) and use `paths:` frontmatter — Claude Code ignores `globs:`. Stale `contextkit-*.md` rules are removed; other files in `.claude/rules/` are left alone.

ContextKit does not write to `.claude/settings.json` — an earlier version installed a PostToolUse format+lint hook there, but it ran on every Edit/Write and slowed sessions down noticeably, so it was removed (see CHANGELOG). Quality checks still run at push time via the git pre-push hook (`GitHooks`).

## generatedFiles

Listed in the constructor. Does **not** include `.claude/settings.json`.

## Key Files Written

| File | Type | Purpose |
|---|---|---|
| `AGENTS.md` | Bridge (merged) | Canonical context file, imported by `CLAUDE.md` |
| `CLAUDE.md` | Bridge (merged) | Auto-loaded every Claude Code session; imports `AGENTS.md` + `index.md` |
| `.claude/rules/contextkit-<name>.md` | Generated | One path-scoped rule per `context_rules` entry |
| `.claude/skills/*/SKILL.md` | Generated | `/ck`, `/doc`, `/learn`, `/goal`, `/headline` |
