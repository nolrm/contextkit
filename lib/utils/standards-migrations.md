# standards-migrations.js

Registry of content updates to generic sections inside already-installed `standards/*.md` files.

## Purpose

`ck update` deliberately never re-downloads `ai-guidelines.md`, `architecture.md`, or `code-style.md` (see `update.js#downloadFiles`) — they're user-owned, since `/analyze` augments them with project-specific content. That's correct for project-specific content, but it also means a wording or behaviour fix to the *generic* boilerplate `install.js` ships in these files never reaches a project that already ran `ck install`.

`standards-migrations.js` is the list of those fixes. `update.js#applyStandardsMigrations` looks for each entry's exact `from` text in the target file; if found, it replaces it with `to`. If not found — because the section was hand-edited by the user or customized by `/analyze` — the entry is left alone and recorded in `config.yml`'s `pending_standards_updates` list instead, for later AI-assisted reconciliation (see the `standards-aware` skill).

## Exports

`MIGRATIONS` — array of migration entries, checked in order.

## Migration Entry Shape

| Field | Type | Description |
| --- | --- | --- |
| `version` | `string` | The ContextKit version this content change shipped in. Only applied when the project is updating across this version (`isNewerVersion(entry.version, fromVersion) && !isNewerVersion(entry.version, toVersion)`). |
| `file` | `string` | Path to the target file, relative to the project root. |
| `id` | `string` | Stable identifier, used in log lines and `pending_standards_updates` entries. |
| `description` | `string` | One-line human-readable summary of what changed. |
| `from` | `string` | The exact text to find. Must match verbatim — no whitespace normalization. |
| `to` | `string` | The replacement text. |

## Usage Example

```js
const { MIGRATIONS } = require('../utils/standards-migrations');

for (const entry of MIGRATIONS) {
  if (!inRange(entry.version)) continue;
  const content = await fs.readFile(entry.file, 'utf8');
  if (content.includes(entry.from)) {
    await fs.writeFile(entry.file, content.replace(entry.from, entry.to));
  } else {
    // record entry.id under config.yml's pending_standards_updates
  }
}
```

See `update.js#applyStandardsMigrations` for the full loop, matching against `updateInfo.currentVersion`/`updateInfo.latestVersion`.

## Adding a New Entry

1. Make the wording/behaviour change to the section's template in `install.js` (this is what fresh installs get).
2. Add a matching entry here with the exact old text as `from` and the new text as `to`, tagged with the version this change ships in.
3. Add a `CHANGELOG.md` line under that version.
4. Add test cases in `__tests__/commands/update.test.js` covering the auto-apply and skip paths.

Only add an entry for a change to content that's already generic/universal — i.e. content that existed in every prior install, not a wholly new section. A brand-new section just needs to exist in `install.js`'s template; it reaches existing projects the next time they run `/analyze`, not through this registry.

## Edge Cases & Notes

- Matching is an exact substring check (`content.includes(entry.from)`), not fuzzy or whitespace-normalized. A miss is not an error — it just means the section was customized, so the entry is skipped and flagged rather than force-applied. This favors never corrupting user/`/analyze` content over maximizing auto-apply coverage.
- If `entry.file` doesn't exist in the project at all, the entry is silently skipped (nothing to migrate).
- Versioning uses the project's own semver `version:` field (via `update.js#isNewerVersion`), the same comparator already used to decide whether an update is available at all — not `config.yml`'s separate `format_version` int, which tracks structural migrations (see `migrations.md`).
