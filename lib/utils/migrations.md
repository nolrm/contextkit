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

| Param | Type | Description |
|-------|------|-------------|
| `currentVersion` | `number \| undefined \| null` | Value of `format_version` from config.yml. `undefined`/`null` is treated as `0` (pre-1.0.0 install). |
| `configPath` | `string` | Absolute or relative path to `.contextkit/config.yml`. |

**Behaviour:**
- If `currentVersion` is missing/null → treated as `0`, runs v0→v1
- If `currentVersion === CURRENT_FORMAT_VERSION` → no-op
- If `currentVersion > CURRENT_FORMAT_VERSION` → logs warning, returns without modifying config
- Prints progress to console for each step

## Constants

`CURRENT_FORMAT_VERSION = 1` — increment when a new migration step is added.

## Adding a Future Migration

1. Increment `CURRENT_FORMAT_VERSION`
2. Add `if (v === N) await this._migrate_N_to_N1(configPath);` inside the loop in `run()`
3. Implement `_migrate_N_to_N1(configPath)` as a private method
4. Add test cases in `__tests__/utils/migrations.test.js`

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
