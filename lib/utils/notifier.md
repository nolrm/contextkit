# notifier.js

Thin wrapper around `update-notifier` for passive npm update notifications in the ContextKit CLI.

## Purpose

Checks npm once every 24 hours for a newer version of `@nolrm/contextkit`. If an update is available, prints a non-blocking one-liner after the command completes. Suppressed automatically in CI environments (`CI=true`).

## Exports

### `checkForUpdates()`

Initialises `update-notifier` with the package metadata from `package.json` and calls `.notify()`. Errors are silently swallowed — a notifier failure must never crash the CLI.

## Usage

Called once in `bin/contextkit.js` before `program.parse()`:

```javascript
const { checkForUpdates } = require('../lib/utils/notifier');
checkForUpdates();
program.parse(process.argv);
```

## Edge Cases

- `update-notifier` caches the check result for 24 hours — only one npm request per day per machine.
- Suppressed in CI via `update-notifier`'s built-in CI detection (`CI`, `CONTINUOUS_INTEGRATION`, `BUILD_NUMBER` env vars).
- Uses `update-notifier@5.1.0` — the last CommonJS-compatible release (v6+ is ESM-only).
