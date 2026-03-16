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

  it('6. .prettierignore exists and excludes key directories', async () => {
    const ignorePath = path.join(ROOT, '.prettierignore');
    expect(await fs.pathExists(ignorePath)).toBe(true);
    const content = await fs.readFile(ignorePath, 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('templates/');
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

  it('9. prettier produces no diff on already-formatted files', () => {
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
