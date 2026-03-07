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

const check = require('../../lib/commands/check');

describe('CheckCommand', () => {
  let tmpDir;
  let originalCwd;
  let consoleSpy;
  let exitSpy;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-check-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  async function writeConfig(content) {
    await fs.ensureDir(path.join(tmpDir, '.contextkit'));
    await fs.writeFile(path.join(tmpDir, '.contextkit', 'config.yml'), content);
  }

  async function writeMinimalConfig() {
    await writeConfig(`ck: 1\nversion: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\nrequired: []\noptional: []\n`);
  }

  it('1. exits early when config.yml does not exist', async () => {
    await check({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/ContextKit not installed/);
  });

  it('2. handles invalid YAML config gracefully without throwing', async () => {
    await writeConfig('{ invalid: yaml: content:');
    // loadConfig catches parse error, returns null; run() returns early silently
    await expect(check({})).resolves.not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('3. checkManifest warns when ck field is missing', async () => {
    await writeConfig('version: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\n');
    await check({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/ck.*field/i);
  });

  it('4. checkRequiredFiles adds error when required file is missing', async () => {
    await writeConfig('ck: 1\nversion: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\nrequired:\n  - standards/code-style.md\n');
    await check({});
    expect(exitSpy).toHaveBeenCalledWith(1);
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Required file missing/);
  });

  it('5. checkRequiredFiles passes when required file is present', async () => {
    await writeConfig('ck: 1\nversion: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\nrequired:\n  - standards/code-style.md\noptional: []\n');
    await fs.ensureDir(path.join(tmpDir, '.contextkit', 'standards'));
    await fs.writeFile(path.join(tmpDir, '.contextkit', 'standards', 'code-style.md'), '# Code Style\n');
    await check({ verbose: true });
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Required file exists: standards\/code-style.md/);
  });

  it('6. checkOptionalFiles warns when optional file is missing', async () => {
    await writeConfig('ck: 1\nversion: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\nrequired: []\noptional:\n  - standards/architecture.md\n');
    await check({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Optional file missing/);
  });

  it('7. checkPolicyCompliance warns when policy.yml is absent', async () => {
    await writeMinimalConfig();
    await check({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Policy file missing/);
  });

  it('8. checkPlatformIntegrations warns when no bridge files are present', async () => {
    await writeMinimalConfig();
    await check({});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/No platform bridge files found/);
  });

  it('9. checkPlatformIntegrations passes when CLAUDE.md is present', async () => {
    await writeMinimalConfig();
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Claude\n');
    await check({ verbose: true });
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Claude Code bridge file/);
  });

  it('10. errors cause process.exit(1)', async () => {
    await writeConfig('ck: 1\nversion: "1.0.0"\nupdated: "2026-03-07"\nprofile: "node"\nrequired:\n  - standards/missing.md\n');
    await check({});
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('11. --strict causes process.exit(1) on warnings only', async () => {
    await writeMinimalConfig();
    // No bridge files → warning. With --strict, should exit 1.
    await check({ strict: true });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
