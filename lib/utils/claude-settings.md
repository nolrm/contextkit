# claude-settings.js

Reads, merges, and writes `.claude/settings.json` safely — adding or removing ContextKit-owned entries without clobbering user content.

## Exports

`ClaudeSettings` — class

## Public API

### `read() → Promise<object>`

Returns the parsed contents of `.claude/settings.json`, or `{}` if the file does not exist. On invalid JSON, logs a yellow warning and returns `{}` (does not throw).

### `write(settings) → Promise<void>`

Writes the settings object to `.claude/settings.json` with 2-space indentation and a trailing newline. Creates `.claude/` if it does not exist.

### `addPostToolUseHook(command) → Promise<void>`

Adds a ContextKit-owned PostToolUse hook entry. Replaces any existing `_contextkit: true` entry rather than duplicating. Merges into existing file content — other keys (permissions, other hooks) are preserved.

Throws `Error('hook command is required')` if `command` is falsy.

Hook entry written:
```json
{
  "matcher": "Edit|Write",
  "hooks": [{ "type": "command", "command": "<command>" }],
  "_contextkit": true
}
```

### `removeContextKitHooks() → Promise<void>`

Removes all `PostToolUse` entries where `_contextkit: true`. If the array becomes empty, deletes the `PostToolUse` key. If `hooks` becomes empty, deletes the `hooks` key. No-op if the file is absent.

## Usage Example

```javascript
const ClaudeSettings = require('./claude-settings');

const cs = new ClaudeSettings();
await cs.addPostToolUseHook('pnpm run format && pnpm run lint --fix 2>&1 | tail -20');
// → writes .claude/settings.json, merging into existing content
```

## Edge Cases & Notes

- `PostToolUse` that is not an array: the original value is preserved under `_contextkit_original_invalid`, and a fresh array is started for ContextKit's entry
- Invalid JSON in existing file: returns `{}` with a warning — the file is NOT overwritten (protects corrupted user files)
- Thread safety: no file locking; not a concern for a CLI tool
