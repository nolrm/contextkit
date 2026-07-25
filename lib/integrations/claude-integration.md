# claude-integration.js

The Claude Code platform integration. Installs `CLAUDE.md`, `.claude/rules/`, and `.claude/skills/`.

## Extends

`BaseIntegration`

## install(force = false)

Runs the full Claude Code setup:
1. Writes bridge file (`CLAUDE.md`) and generated files (rules, skills) via `super.install()`
2. Ensures `.claude/skills/` directory exists
3. Adds `.claude/settings.local.json` to `.gitignore`
4. Removes legacy `.claude/commands/` files

ContextKit does not write to `.claude/settings.json` — an earlier version installed a PostToolUse format+lint hook there, but it ran on every Edit/Write and slowed sessions down noticeably, so it was removed (see CHANGELOG). Quality checks still run at push time via the git pre-push hook (`GitHooks`).

## generatedFiles

Listed in the constructor. Does **not** include `.claude/settings.json`.

## Key Files Written

| File | Type | Purpose |
|---|---|---|
| `CLAUDE.md` | Bridge (merged) | Auto-loaded every Claude Code session |
| `.claude/rules/contextkit-*.md` | Generated | Scoped rules for standards, testing, code style |
| `.claude/skills/*/SKILL.md` | Generated | All slash commands |
