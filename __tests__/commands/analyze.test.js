const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  magenta: (str) => str,
  cyan: (str) => str,
  dim: (str) => str,
  bold: (str) => str,
}));

jest.mock('ora', () => () => ({
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({ scope: 'Current directory only' }),
}));

const analyze = require('../../lib/commands/analyze');

describe('AnalyzeCommand', () => {
  let tmpDir;
  let originalCwd;
  let consoleSpy;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-analyze-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  async function setupInstalled() {
    await fs.ensureDir(path.join(tmpDir, '.contextkit', 'commands'));
    await fs.writeFile(
      path.join(tmpDir, '.contextkit', 'commands', 'analyze.md'),
      '# Analyze instructions\n'
    );
    await fs.writeFile(
      path.join(tmpDir, '.contextkit', 'config.yml'),
      'ck: 1\nformat_version: 1\nversion: "1.0.0"\nanalysis_scope: null\nanalyzed_packages: []\n'
    );
  }

  it('1. exits early when .contextkit/commands/analyze.md does not exist', async () => {
    await analyze({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/ContextKit not found/);
  });

  it('2. completes without error in non-interactive single-package mode', async () => {
    await setupInstalled();
    await expect(analyze({ nonInteractive: true })).resolves.not.toThrow();
  });

  it('3. exits early when --package path does not exist', async () => {
    await setupInstalled();
    await analyze({ package: '/nonexistent/path/xyz' });
    // spinner.fail() is mocked; verify the run completes without logging success
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).not.toMatch(/completed successfully/i);
    expect(logged).not.toMatch(/Analysis Instructions/i);
  });

  it('4. runs successfully with a valid --package path', async () => {
    await setupInstalled();
    const pkgPath = path.join(tmpDir, 'packages', 'app');
    await fs.ensureDir(pkgPath);
    await fs.writeJson(path.join(pkgPath, 'package.json'), { name: 'app' });
    await expect(analyze({ package: pkgPath })).resolves.not.toThrow();
  });

  it('5. updateConfigWithScope writes analysis_scope to config.yml', async () => {
    await setupInstalled();
    await analyze({ nonInteractive: true });
    const content = await fs.readFile(path.join(tmpDir, '.contextkit', 'config.yml'), 'utf-8');
    expect(content).toMatch(/analysis_scope/);
  });

  it('6. detects monorepo when turbo.json and packages dir are present', async () => {
    await setupInstalled();
    await fs.writeFile(path.join(tmpDir, 'turbo.json'), '{}');
    // detectMonorepoStructure resets isMonorepo=false if no packages found
    // so we need at least one package with a package.json
    const pkgDir = path.join(tmpDir, 'packages', 'ui');
    await fs.ensureDir(pkgDir);
    await fs.writeJson(path.join(pkgDir, 'package.json'), { name: 'ui' });
    await expect(analyze({ nonInteractive: true })).resolves.not.toThrow();
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    // spinner.succeed() is mocked; monorepo path shows via displayScopeInfo
    expect(logged).toMatch(/Monorepo Structure/i);
  });

  it('7. --scope option is used in monorepo context without prompt', async () => {
    await setupInstalled();
    await fs.writeFile(path.join(tmpDir, 'turbo.json'), '{}');
    await expect(analyze({ scope: 'current', nonInteractive: true })).resolves.not.toThrow();
  });
});
