# config-schema.js

Registry of `config.yml` settings added after the initial `format_version: 1` layout. Lets `ck update` backfill missing settings into an existing project without rewriting the file.

## Purpose

`install.js#createConfiguration` always writes a complete, current `config.yml`. Over time new top-level blocks get added to that template (`response_style`, `required`/`optional`/`conditionals`, `analysis_scope`, etc.) for projects installed later — but existing projects that already ran `ck install` never see them, since `ck update` doesn't regenerate the whole file.

`config-schema.js` is the single list of "settings that should exist"; `update.js#appendMissingSettings` diffs a project's raw `config.yml` text against it and appends whatever is missing, each with a comment. Existing content is never touched — this is what lets a project's own customizations survive `ck update`. Keep entries here in sync with the literal template in `install.js#createConfiguration`.

## Exports

`SETTINGS` — array of setting descriptors, checked in order.

## Setting Descriptor Shape

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Identifier used in the `➕ Added missing config setting(s): ...` log line. |
| `detect` | `RegExp` | Tested against the raw file text. If it matches, the setting is already present and is skipped. |
| `block` | `({ config, now }) => string` | For a whole new top-level block: returns the text (including a leading blank line and explanatory comment) to append at the end of the file. |
| `insertInBlock` | `string` (optional) | Set instead of `block` when the setting is a single line that belongs inside an *existing* top-level block (e.g. a new `features.*` flag). Names that block's key. |
| `line` | `() => string` (optional) | Paired with `insertInBlock` — the single line to splice in as the last entry of that block. |

A descriptor has either `block` or `insertInBlock`/`line`, not both.

## Usage Example

```javascript
const { SETTINGS } = require('../utils/config-schema');

for (const setting of SETTINGS) {
  if (setting.detect.test(content)) continue; // already present
  // ...append setting.block(...) or splice setting.line() into insertInBlock
}
```

See `update.js#appendMissingSettings` for the full diff/append loop and `update.js#_insertLineInBlock` for how `insertInBlock` entries are spliced in.

## Adding a New Setting

1. Add the block/line to `install.js#createConfiguration`'s template so fresh installs include it.
2. Add a matching entry to `SETTINGS` here so existing installs get it via `ck update`.
3. Add test cases in `__tests__/commands/update.test.js` covering the append.

If the new setting requires restructuring or renaming *existing* data rather than just adding something new, that's a job for `migrations.js`, not this registry — see `migrations.md`.

## Edge Cases & Notes

- Order in `SETTINGS` is the order blocks are appended to the file — it does not need to match `install.js`'s layout, since appended settings always land after whatever the project already had.
- `insertInBlock` entries are skipped (not appended elsewhere) if the target block itself doesn't exist yet in the file — that gap is expected to be covered by a `block` entry for the block itself.
- Detection regexes should anchor on `^` so an indented key inside one block can't be confused with an unrelated block of the same name.
