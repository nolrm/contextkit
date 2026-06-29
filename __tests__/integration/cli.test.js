const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const packageJson = require('../../package.json');

describe('CLI Integration Tests', () => {
  const cliPath = path.join(__dirname, '../../bin/contextkit.js');
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-cli-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('version command', () => {
    test('1. --version shows current package version', () => {
      const result = execSync(`node "${cliPath}" --version`, { encoding: 'utf8' });
      expect(result.trim()).toBe(packageJson.version);
    });

    test('2. -v flag shows current package version', () => {
      const result = execSync(`node "${cliPath}" -v`, { encoding: 'utf8' });
      expect(result.trim()).toBe(packageJson.version);
    });
  });

  describe('help command', () => {
    test('3. --help shows all core commands', () => {
      const result = execSync(`node "${cliPath}" --help`, { encoding: 'utf8' });
      expect(result).toContain('Context Engineering for AI Development');
      expect(result).toContain('Commands:');
      expect(result).toContain('install');
      expect(result).toContain('status');
      expect(result).toContain('update');
      expect(result).toContain('analyze');
      expect(result).toContain('check');
      expect(result).toContain('note');
      expect(result).toContain('run');
    });

    test('4. --help shows all platform commands', () => {
      const result = execSync(`node "${cliPath}" --help`, { encoding: 'utf8' });
      expect(result).toContain('windsurf');
      expect(result).toContain('codex');
      expect(result).toContain('copilot');
      expect(result).toContain('claude');
      expect(result).toContain('cursor');
      expect(result).toContain('gemini');
      expect(result).toContain('aider');
    });

    test('5. install --help shows install options', () => {
      const result = execSync(`node "${cliPath}" install --help`, { encoding: 'utf8' });
      expect(result).toContain('Initialize ContextKit in the current project directory');
      expect(result).toContain('--no-hooks');
      expect(result).toContain('--non-interactive');
    });

    test('6. update --help shows update description and --force option', () => {
      const result = execSync(`node "${cliPath}" update --help`, { encoding: 'utf8' });
      expect(result).toContain('Update to latest version');
      expect(result).toContain('--force');
    });

    test('7. analyze --help shows analyze description and options', () => {
      const result = execSync(`node "${cliPath}" analyze --help`, { encoding: 'utf8' });
      expect(result).toContain('Analyze project');
      expect(result).toContain('--ai');
      expect(result).toContain('--scope');
    });

    test('8. check --help shows check description and options', () => {
      const result = execSync(`node "${cliPath}" check --help`, { encoding: 'utf8' });
      expect(result).toContain('Validate ContextKit installation');
      expect(result).toContain('--strict');
      expect(result).toContain('--verbose');
    });

    test('9. note --help shows note description and options', () => {
      const result = execSync(`node "${cliPath}" note --help`, { encoding: 'utf8' });
      expect(result).toContain('Add a note');
      expect(result).toContain('--priority');
      expect(result).toContain('--category');
    });

    test('10. run --help shows run description and options', () => {
      const result = execSync(`node "${cliPath}" run --help`, { encoding: 'utf8' });
      expect(result).toContain('Run a workflow');
      expect(result).toContain('--interactive');
    });
  });

  describe('status command', () => {
    test('11. status runs without crashing (installed or not)', () => {
      const result = execSync(`node "${cliPath}" status`, { encoding: 'utf8' });
      const notInstalled = result.includes('ContextKit is not installed');
      const installed = result.includes('ContextKit Status') && result.includes('Installation:');
      expect(notInstalled || installed).toBe(true);
    });

    test('12. status reports not installed when run from empty directory', () => {
      const result = execSync(`node "${cliPath}" status`, {
        encoding: 'utf8',
        cwd: tmpDir,
      });
      expect(result).toContain('not installed');
    });
  });

  describe('update command', () => {
    test('13. update exits cleanly with no .contextkit (not installed)', () => {
      const result = execSync(`node "${cliPath}" update`, {
        encoding: 'utf8',
        cwd: tmpDir,
      });
      expect(result).toContain('No ContextKit installation found');
    });

    test('14. update suggests install command when not installed', () => {
      const result = execSync(`node "${cliPath}" update`, {
        encoding: 'utf8',
        cwd: tmpDir,
      });
      expect(result).toContain('contextkit install');
    });
  });

  describe('check command', () => {
    test('15. check exits cleanly with no .contextkit (not installed)', () => {
      const result = execSync(`node "${cliPath}" check`, {
        encoding: 'utf8',
        cwd: tmpDir,
      });
      expect(result).toMatch(/not installed|No ContextKit/i);
    });
  });

  describe('error handling', () => {
    test('16. unknown command prints error and exits non-zero', () => {
      let threw = false;
      try {
        execSync(`node "${cliPath}" unknown-command`, { encoding: 'utf8' });
      } catch (err) {
        threw = true;
        const output = (err.stdout || '') + (err.stderr || '');
        expect(output).toMatch(/Unknown command: unknown-command/);
        expect(output).toMatch(/ck --help/);
        expect(err.status).toBe(1);
      }
      expect(threw).toBe(true);
    });
  });

  describe('update-notifier', () => {
    test('17. CLI exits with code 0 and notifier does not break output', () => {
      const result = execSync(`node "${cliPath}" --version`, {
        encoding: 'utf8',
        env: { ...process.env, CI: 'true' },
      });
      expect(result.trim()).toBe(packageJson.version);
    });

    test('18. --help output is unaffected by notifier', () => {
      const result = execSync(`node "${cliPath}" --help`, {
        encoding: 'utf8',
        env: { ...process.env, CI: 'true' },
      });
      expect(result).toContain('Context Engineering for AI Development');
      expect(result).toContain('Commands:');
    });
  });
});
