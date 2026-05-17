const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class HookDetector {
  _commandExists(name) {
    try {
      execSync(`which ${name}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  _pmPrefix(pm) {
    switch (pm) {
      case 'pnpm':
        return 'pnpm run';
      case 'yarn':
        return 'yarn';
      case 'bun':
        return 'bun run';
      default:
        return 'npm run';
    }
  }

  _lintFixCmd(pm, hasLintFix, hasLint) {
    if (hasLintFix) {
      switch (pm) {
        case 'yarn':
          return 'yarn lint:fix';
        default:
          return `${this._pmPrefix(pm)} lint:fix`;
      }
    }
    if (hasLint) {
      switch (pm) {
        case 'pnpm':
          return 'pnpm run lint --fix';
        case 'yarn':
          return 'yarn lint --fix';
        case 'bun':
          return 'bun run lint --fix';
        default:
          return 'npm run lint -- --fix';
      }
    }
    return null;
  }

  async _detectNode(projectDir) {
    const pkgPath = path.join(projectDir, 'package.json');
    if (!(await fs.pathExists(pkgPath))) return null;

    let packageJson;
    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      packageJson = JSON.parse(raw);
    } catch {
      return null;
    }

    const scripts = packageJson.scripts || {};

    let pm = 'npm';
    if (await fs.pathExists(path.join(projectDir, 'bun.lockb'))) {
      pm = 'bun';
    } else if (await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml'))) {
      pm = 'pnpm';
    } else if (await fs.pathExists(path.join(projectDir, 'yarn.lock'))) {
      pm = 'yarn';
    }

    const hasFormat = Boolean(scripts.format);
    const hasLintFix = Boolean(scripts['lint:fix']);
    const hasLint = Boolean(scripts.lint);

    const parts = [];

    if (hasFormat) {
      const prefix = this._pmPrefix(pm);
      parts.push(pm === 'yarn' ? `yarn format` : `${prefix} format`);
    }

    const lintCmd = this._lintFixCmd(pm, hasLintFix, hasLint);
    if (lintCmd) {
      parts.push(lintCmd);
    }

    if (parts.length === 0) return null;

    return parts.join(' && ') + ' 2>&1 | tail -20';
  }

  async _detectGo(projectDir) {
    if (!(await fs.pathExists(path.join(projectDir, 'go.mod')))) return null;

    const parts = [];
    if (this._commandExists('gofmt')) parts.push('gofmt -w .');
    if (this._commandExists('golangci-lint')) parts.push('golangci-lint run 2>&1 | tail -20');

    if (parts.length === 0) return null;

    const cmd = parts.join(' && ');
    // If only gofmt, add tail ourselves; if golangci-lint is present, it already has tail
    return parts.length === 1 && parts[0] === 'gofmt -w .' ? cmd : cmd;
  }

  async _detectPython(projectDir) {
    const hasPyproject = await fs.pathExists(path.join(projectDir, 'pyproject.toml'));
    const hasRequirements = await fs.pathExists(path.join(projectDir, 'requirements.txt'));
    if (!hasPyproject && !hasRequirements) return null;

    const parts = [];
    if (this._commandExists('black')) parts.push('black .');
    if (this._commandExists('ruff')) parts.push('ruff check --fix . 2>&1 | tail -20');

    if (parts.length === 0) return null;

    return parts.join(' && ');
  }

  async detect(projectDir = process.cwd()) {
    const node = await this._detectNode(projectDir);
    if (node) return node;

    const go = await this._detectGo(projectDir);
    if (go) return go;

    const python = await this._detectPython(projectDir);
    if (python) return python;

    return null;
  }
}

module.exports = HookDetector;
