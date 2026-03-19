const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  bold: (str) => str,
  cyan: (str) => str,
}));

const GatesCommand = require('../../lib/commands/gates');

describe('GatesCommand', () => {
  let tmpDir;
  let originalCwd;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-gates-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', 'ck: 1\nformat_version: 1\n');
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  describe('list()', () => {
    it('1. lists all gates as enabled when no quality-gates.yml exists', async () => {
      const cmd = new GatesCommand();
      const logs = [];
      jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
      await cmd.run({});
      console.log.mockRestore();
      const output = logs.join('\n');
      expect(output).toContain('[enabled]');
      expect(output).toContain('typescript');
      expect(output).toContain('pytest');
      expect(output).toContain('cargo-test');
    });

    it('2. shows disabled gates as disabled when quality-gates.yml has entries', async () => {
      await fs.writeFile(
        '.contextkit/quality-gates.yml',
        '# Quality Gates\ndisabled:\n  - typescript\n  - test\n'
      );
      const cmd = new GatesCommand();
      const logs = [];
      jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
      await cmd.run({});
      console.log.mockRestore();
      const output = logs.join('\n');
      expect(output).toMatch(/\[disabled\].*typescript/);
      expect(output).toMatch(/\[disabled\].*test/);
      expect(output).toMatch(/\[enabled\].*eslint/);
    });
  });

  describe('disable()', () => {
    it('3. adds gate key to disabled list in quality-gates.yml', async () => {
      const cmd = new GatesCommand();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      await cmd.run({ disable: 'typescript' });
      console.log.mockRestore();
      const content = await fs.readFile('.contextkit/quality-gates.yml', 'utf-8');
      expect(content).toContain('- typescript');
    });

    it('4. creates quality-gates.yml if it does not exist', async () => {
      expect(await fs.pathExists('.contextkit/quality-gates.yml')).toBe(false);
      const cmd = new GatesCommand();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      await cmd.run({ disable: 'lint' });
      console.log.mockRestore();
      expect(await fs.pathExists('.contextkit/quality-gates.yml')).toBe(true);
    });

    it('5. is a no-op when gate is already disabled', async () => {
      await fs.writeFile(
        '.contextkit/quality-gates.yml',
        'disabled:\n  - typescript\n'
      );
      const cmd = new GatesCommand();
      const logs = [];
      jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
      await cmd.run({ disable: 'typescript' });
      console.log.mockRestore();
      expect(logs.join('')).toContain('already disabled');
      const content = await fs.readFile('.contextkit/quality-gates.yml', 'utf-8');
      expect((content.match(/typescript/g) || []).length).toBe(1);
    });

    it('6. exits with error for unknown gate key', async () => {
      const cmd = new GatesCommand();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cmd.run({ disable: 'not-a-real-gate' })).rejects.toThrow();
      console.error.mockRestore();
      console.log.mockRestore();
      mockExit.mockRestore();
    });
  });

  describe('enable()', () => {
    it('7. removes gate key from disabled list', async () => {
      await fs.writeFile(
        '.contextkit/quality-gates.yml',
        'disabled:\n  - typescript\n  - test\n'
      );
      const cmd = new GatesCommand();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      await cmd.run({ enable: 'typescript' });
      console.log.mockRestore();
      const content = await fs.readFile('.contextkit/quality-gates.yml', 'utf-8');
      expect(content).not.toContain('- typescript');
      expect(content).toContain('- test');
    });

    it('8. is a no-op when gate is already enabled', async () => {
      await fs.writeFile('.contextkit/quality-gates.yml', 'disabled:\n');
      const cmd = new GatesCommand();
      const logs = [];
      jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
      await cmd.run({ enable: 'typescript' });
      console.log.mockRestore();
      expect(logs.join('')).toContain('already enabled');
    });
  });

  describe('not installed', () => {
    it('9. exits with clear message when ContextKit is not installed', async () => {
      await fs.remove('.contextkit/config.yml');
      const cmd = new GatesCommand();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cmd.run({})).rejects.toThrow();
      console.log.mockRestore();
      mockExit.mockRestore();
    });
  });
});
