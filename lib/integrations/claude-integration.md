# claude-integration.js

The Claude Code platform integration. Installs `CLAUDE.md`, `.claude/rules/`, `.claude/skills/`, and a PostToolUse hook in `.claude/settings.json`.

## Extends

`BaseIntegration`

## install(force = false)

Runs the full Claude Code setup:
1. Writes bridge file (`CLAUDE.md`) and generated files (rules, skills) via `super.install()`
2. Ensures `.claude/skills/` directory exists
3. Adds `.claude/settings.local.json` to `.gitignore`
4. Removes legacy `.claude/commands/` files
5. Detects project tooling and installs a PostToolUse hook in `.claude/settings.json`

### Hook Installation (step 5)

Uses `HookDetector` to detect the right format+lint command for the project (Node.js, Go, or Python). If a command is found, `ClaudeSettings.addPostToolUseHook()` writes it to `.claude/settings.json` with a `_contextkit: true` marker.

- On success: logs `✓ PostToolUse hook: <command>`
- No tooling detected: logs a dim yellow skip message
- Any error: logs a yellow warning and continues (graceful degradation)

Re-running `install()` (e.g. via `ck update → refreshIntegrations()`) replaces the existing ContextKit hook rather than duplicating it.

## generatedFiles

Listed in the constructor. Does **not** include `.claude/settings.json` — that file is a merge target, not overwritten.

## Key Files Written

| File | Type | Purpose |
|---|---|---|
| `CLAUDE.md` | Bridge (merged) | Auto-loaded every Claude Code session |
| `.claude/rules/contextkit-*.md` | Generated | Scoped rules for standards, testing, code style |
| `.claude/skills/*/SKILL.md` | Generated | All slash commands |
| `.claude/settings.json` | Merged | PostToolUse hook entry (`_contextkit: true`) |
