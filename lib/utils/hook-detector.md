# hook-detector.js

Detects the right PostToolUse hook command for a project based on its language, package manager, and available scripts.

## Exports

`HookDetector` — class

## Public API

### `detect(projectDir = process.cwd()) → Promise<string | null>`

Returns a shell command string suitable for use as a Claude Code PostToolUse hook, or `null` if no format/lint tooling is detected.

Tries three detectors in order: Node.js → Go → Python.

## Usage Example

```javascript
const HookDetector = require('./hook-detector');

const command = await new HookDetector().detect('/path/to/project');
// → "pnpm run format && pnpm run lint --fix 2>&1 | tail -20"
// → null (if no tooling found)
```

## Detection Logic

| Stack | Trigger | PM detection | Command built from |
|---|---|---|---|
| Node.js | `package.json` exists | lockfile (`bun.lockb` > `pnpm-lock.yaml` > `yarn.lock` > `npm`) | `scripts.format`, `scripts['lint:fix']`, `scripts.lint` |
| Go | `go.mod` exists | n/a | `gofmt` and/or `golangci-lint` (via `which`) |
| Python | `pyproject.toml` or `requirements.txt` | n/a | `black` and/or `ruff` (via `which`) |

For Node.js: `lint:fix` takes priority over `lint`. If only `lint` is present, `--fix` is appended (npm uses `-- --fix` separator; pnpm/yarn/bun pass args directly).

## Edge Cases & Notes

- Malformed `package.json` → returns `null`, does not throw
- No scripts in `package.json` → returns `null`
- Go/Python tools not on PATH → returns `null`
- Node.js takes priority when multiple stack markers coexist
