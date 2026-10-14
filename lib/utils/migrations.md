# migrations.js

Format migration runner for the `.contextkit/` directory.

## Purpose

Detects when an installed `.contextkit/` directory uses an older format version and runs the appropriate migration steps to bring it up to date. Called by `ck update` before any files are downloaded or rewritten.

## Exports

`MigrationRunner` — class

## Public API

### `new MigrationRunner()`

No constructor arguments.

### `async run(currentVersion, configPath)`

Runs all pending migrations from `currentVersion` up to `CURRENT_FORMAT_VERSION`.

| Param            | Type                          | Description                                                                                          |
| ---------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `currentVersion` | `number \| undefined \| null` | Value of `format_version` from config.yml. `undefined`/`null` is treated as `0` (pre-1.0.0 install). |
| `configPath`     | `string`                      | Absolute or relative path to `.contextkit/config.yml`.                                               |

**Behaviour:**

- If `currentVersion` is missing/null → treated as `0`, runs v0→v1
- If `currentVersion === CURRENT_FORMAT_VERSION` → no-op
- If `currentVersion > CURRENT_FORMAT_VERSION` → logs warning, returns without modifying config
- Prints progress to console for each step

## Constants

`CURRENT_FORMAT_VERSION = 3` — increment when a new migration step is added.

`RETIRED_COMMAND_PATHS` — `.contextkit/`-relative command files removed in 2.0; also used by `update.js#removeLegacyFiles`.

## Steps

| Step | What it does |
|---|---|
| v0 → v1 | Adds `format_version: 1` |
| v1 → v2 (2.0) | `response_style` → `headline` + top-level `diagrams_in_docs` (keeps the user's values); drops `features.squad_ci_workflow`; adds `standards/index.md` to `required`; creates the `index.md` skeleton if missing; removes retired command files (`RETIRED_COMMAND_PATHS`). Anything needing judgment — custom `CLAUDE.md` content, squad/spec state, the squad CI workflow — is left in place and listed in `.contextkit/pending-cleanup.md` by `ck update` (see `upgrade-cleanup.js`) for `/ck update`. |
| v2 → v3 (2.1.1) | Strips `commands:`, `paths:`, and `conditionals:` — write-only template leftovers nothing in `lib/` ever read back, some pointing at files removed in 2.0 — along with their comment headers. |

## Adding a Future Migration

1. Increment `CURRENT_FORMAT_VERSION`
2. Add `if (v === N) await this._migrate_N_to_N1(configPath);` inside the loop in `run()`
3. Implement `_migrate_N_to_N1(configPath)` as a private method
4. Add test cases in `__tests__/utils/migrations.test.js`

**Only do this for structural changes** — renaming or reshaping data that already exists in `config.yml`. For a brand-new setting that's purely additive (a project without it should just gain it, with no restructuring), add it to `config-schema.js`'s `SETTINGS` registry instead — see `config-schema.md`. That path doesn't need a `format_version` bump and runs on every `ck update`, not just once per version jump.

## Usage Example

```js
const MigrationRunner = require('../utils/migrations');

const migrations = new MigrationRunner();
await migrations.run(config.format_version, '.contextkit/config.yml');
```

## Edge Cases & Notes

- Migrations are idempotent — safe to run twice
- The `ck update` backup is created before migrations run, so any failure can be rolled back
- `format_version: 0` (explicit) and missing `format_version` are both treated as v0
