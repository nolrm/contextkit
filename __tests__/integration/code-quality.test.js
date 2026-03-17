const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');

describe('Code Quality Setup', () => {
  it('1. package.json has format script targeting lib, bin, and __tests__', async () => {
    const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
    expect(pkg.scripts.format).toBeDefined();
    expect(pkg.scripts.format).toContain('prettier --write');
    expect(pkg.scripts.format).toContain('lib/**/*.js');
    expect(pkg.scripts.format).toContain('bin/**/*.js');
    expect(pkg.scripts.format).toContain('__tests__/**/*.js');
  });

  it('2. package.json has lint script targeting lib, bin, and __tests__', async () => {
    const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.lint).toContain('eslint');
    expect(pkg.scripts.lint).toContain('lib/');
    expect(pkg.scripts.lint).toContain('bin/');
    expect(pkg.scripts.lint).toContain('__tests__/');
  });

  it('3. package.json has prettier as devDependency', async () => {
    const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
    expect(pkg.devDependencies.prettier).toBeDefined();
    expect(pkg.devDependencies.prettier).toMatch(/^\^3\./);
  });

  it('4. package.json has eslint as devDependency', async () => {
    const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
    expect(pkg.devDependencies.eslint).toBeDefined();
  });

  it('5. .prettierrc exists with correct style settings', async () => {
    const rcPath = path.join(ROOT, '.prettierrc');
    expect(await fs.pathExists(rcPath)).toBe(true);
    const rc = await fs.readJson(rcPath);
    expect(rc.singleQuote).toBe(true);
    expect(rc.semi).toBe(true);
    expect(rc.tabWidth).toBe(2);
  });

  it('6. .prettierignore exists and excludes key directories including commands/', async () => {
    const ignorePath = path.join(ROOT, '.prettierignore');
    expect(await fs.pathExists(ignorePath)).toBe(true);
    const content = await fs.readFile(ignorePath, 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('templates/');
    // commands/ must be ignored so markdown command files don't get reformatted
    // (would cause divergence between commands/ and .contextkit/commands/)
    expect(content).toContain('commands/');
  });

  it('7. eslint.config.js exists and is valid CommonJS', async () => {
    const configPath = path.join(ROOT, 'eslint.config.js');
    expect(await fs.pathExists(configPath)).toBe(true);
    // Should be requireable as CommonJS
    const config = require(configPath);
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it('8. eslint passes with zero errors', () => {
    try {
      execSync('npm run lint 2>&1', { cwd: ROOT, encoding: 'utf-8' });
    } catch (err) {
      throw new Error(`lint had errors:\n${err.stdout || ''}`);
    }
    // If execSync didn't throw, exit code was 0 — zero errors
    expect(true).toBe(true);
  });

  it('9. pre-push hook skips eslint/prettier dep gates when lint/format scripts exist', async () => {
    // ContextKit has both eslint/prettier in devDependencies AND lint/format scripts.
    // The hook must not double-run — dep gates must be suppressed in favour of the scripts.
    const hookContent = await fs.readFile(path.join(ROOT, 'hooks', 'pre-push'), 'utf-8');
    // ESLint dep gate is guarded by "no lint script"
    expect(hookContent).toContain('lint script takes precedence');
    // Prettier dep gate is guarded by "no format script"
    expect(hookContent).toContain('format script takes precedence');

    // Verify ContextKit's own package.json has all four (dep + script for each)
    const pkg = await fs.readJson(path.join(ROOT, 'package.json'));
    expect(pkg.devDependencies.eslint).toBeDefined();
    expect(pkg.devDependencies.prettier).toBeDefined();
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.format).toBeDefined();
  });

  it('10. prettier produces no diff on already-formatted files', () => {
    // Run prettier in check mode — exits non-zero if any file would change
    try {
      execSync('npx prettier --check "lib/**/*.js" "bin/**/*.js" "__tests__/**/*.js" 2>&1', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
    } catch (err) {
      throw new Error(`prettier found unformatted files:\n${err.stdout || ''}`);
    }
    // If it didn't throw, all files are formatted
    expect(true).toBe(true);
  });
});
