const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Mock chalk
jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  magenta: (str) => str,
  cyan: (str) => str,
  dim: (str) => str,
  bold: (str) => str,
  rgb: () => (str) => str,
}));

// Mock ora
jest.mock('ora', () => {
  return () => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  });
});

// Mock inquirer
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

// Mock download manager — create empty files so chmod doesn't fail
jest.mock('../../lib/utils/download', () => {
  const realFs = require('fs-extra');
  return jest.fn().mockImplementation(() => ({
    downloadFile: jest.fn().mockImplementation(async (url, dest) => {
      await realFs.ensureDir(require('path').dirname(dest));
      await realFs.writeFile(dest, '# mocked download\n');
    }),
  }));
});

// Mock integrations registry
jest.mock('../../lib/integrations', () => ({
  getIntegration: jest.fn().mockReturnValue(null),
  getAllIntegrationNames: jest.fn().mockReturnValue([]),
}));

const inquirer = require('inquirer');

let tmpDir;
let originalCwd;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-install-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
  jest.spyOn(console, 'log').mockImplementation();
});

afterEach(async () => {
  console.log.mockRestore();
  process.chdir(originalCwd);
  await fs.remove(tmpDir);
  jest.restoreAllMocks();
});

// Fresh require to avoid module cache issues across tests
function getInstallModule() {
  delete require.cache[require.resolve('../../lib/commands/install')];
  return require('../../lib/commands/install');
}

describe('InstallCommand', () => {
  it('1. creates .contextkit directory structure', async () => {
    const install = getInstallModule();
    inquirer.prompt.mockResolvedValue({ prePush: false, commitMsg: false });

    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/standards')).toBe(true);
    expect(await fs.pathExists('.contextkit/commands')).toBe(true);
    expect(await fs.pathExists('.contextkit/hooks')).toBe(true);
    expect(await fs.pathExists('.contextkit/templates')).toBe(true);
    expect(await fs.pathExists('.contextkit/types')).toBe(true);
    expect(await fs.pathExists('.contextkit/product')).toBe(true);
    expect(await fs.pathExists('.contextkit/policies')).toBe(true);
  });

  it('2. creates config.yml', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/config.yml')).toBe(true);
    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('project_name:');
    expect(config).toContain('pre_push_hook: false');
    expect(config).toContain('commit_msg_hook: false');
    expect(config).toContain('_source:');
  });

  it('3. creates skeleton standards files', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/standards/code-style.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/testing.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/architecture.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/ai-guidelines.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/workflows.md')).toBe(true);

    const testing = await fs.readFile('.contextkit/standards/testing.md', 'utf8');
    expect(testing).toContain('/analyze');
    expect(testing).toContain('Testing Levels');
    expect(testing).toContain('Testing Trophy');
    expect(testing).toContain('Change-Driven Decision Table');
    expect(testing).toContain('Context Coverage Rule');
  });

  it('4. creates skeleton template files', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/templates/component.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/templates/test.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/templates/story.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/templates/hook.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/templates/api.md')).toBe(true);
  });

  it('5. creates product context files', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/product/mission.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/product/mission-lite.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/product/roadmap.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/product/decisions.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/product/context.md')).toBe(true);
  });

  it('6. creates corrections log', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/corrections.md')).toBe(true);
    const content = await fs.readFile('.contextkit/corrections.md', 'utf8');
    expect(content).toContain('Corrections Log');
  });

  it('7. creates meta instructions', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/instructions/meta/pre-flight.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/instructions/meta/post-flight.md')).toBe(true);
  });

  it('8. creates policy file', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/policies/policy.yml')).toBe(true);
    const content = await fs.readFile('.contextkit/policies/policy.yml', 'utf8');
    expect(content).toContain('enforcement');
  });

  it('9. migrates legacy .vibe-kit/ directory', async () => {
    await fs.ensureDir('.vibe-kit/standards');
    await fs.writeFile('.vibe-kit/standards/test.md', 'legacy');

    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.vibe-kit')).toBe(false);
    expect(await fs.pathExists('.contextkit')).toBe(true);
  });

  it('10. removes legacy pre-commit hook', async () => {
    await fs.ensureDir('.contextkit/hooks');
    await fs.writeFile('.contextkit/hooks/pre-commit.sh', '#!/bin/sh\nexit 0');

    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/hooks/pre-commit.sh')).toBe(false);
  });

  it('11. prompts for reinstall when already installed', async () => {
    const install = getInstallModule();
    // First install
    await install({ nonInteractive: true, noHooks: true });

    // Second install — should prompt
    inquirer.prompt.mockResolvedValueOnce({ shouldContinue: false });
    await install({});

    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'shouldContinue' })])
    );
  });

  it('12. skips hooks with --no-hooks', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('pre_push_hook: false');
    expect(config).toContain('commit_msg_hook: false');
  });

  it('13. platform-specific install fails if .contextkit not installed', async () => {
    const install = getInstallModule();
    await install({ platform: 'claude' });

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('.contextkit is not installed');
  });

  it('14. platform-specific install works when .contextkit exists', async () => {
    const { getIntegration } = require('../../lib/integrations');
    const mockIntegration = {
      install: jest.fn(),
      displayName: 'Claude',
      showUsage: jest.fn(),
    };
    getIntegration.mockReturnValue(mockIntegration);

    const install = getInstallModule();
    // First install base
    await install({ nonInteractive: true, noHooks: true });
    // Then add platform
    await install({ platform: 'claude' });

    expect(mockIntegration.install).toHaveBeenCalled();
  });

  it('15. creates granular code-style files', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/standards/code-style/css-style.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/code-style/typescript-style.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/code-style/javascript-style.md')).toBe(true);
    expect(await fs.pathExists('.contextkit/standards/code-style/html-style.md')).toBe(true);
  });

  it('16. full install with platform argument installs that platform', async () => {
    const { getIntegration } = require('../../lib/integrations');
    const mockIntegration = {
      install: jest.fn(),
      displayName: 'Claude',
      showUsage: jest.fn(),
      bridgeFiles: ['CLAUDE.md'],
      generatedFiles: [],
    };
    getIntegration.mockReturnValue(mockIntegration);

    const install = getInstallModule();
    await install({ platform: 'claude', fullInstall: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/config.yml')).toBe(true);
    expect(mockIntegration.install).toHaveBeenCalled();
  });

  it('17. interactive mode prompts for platform choice', async () => {
    const { getIntegration } = require('../../lib/integrations');
    const mockIntegration = {
      install: jest.fn(),
      displayName: 'Cursor',
      showUsage: jest.fn(),
      bridgeFiles: ['.cursor/rules/contextkit-standards.md'],
      generatedFiles: [],
    };
    getIntegration.mockReturnValue(mockIntegration);

    // Force CI=true so promptGitHubActionsWorkflow() returns early (no prompt consumed)
    const savedCI = process.env.CI;
    process.env.CI = 'true';
    inquirer.prompt.mockReset();
    inquirer.prompt.mockResolvedValueOnce({ platform: 'cursor' });

    const install = getInstallModule();
    try {
      await install({ fullInstall: true, noHooks: true });
    } finally {
      if (savedCI === undefined) delete process.env.CI;
      else process.env.CI = savedCI;
    }

    // Should have prompted for platform
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'platform', type: 'list' })])
    );
    expect(mockIntegration.install).toHaveBeenCalled();
  });

  it('19. shows ck update hint when user declines reinstall', async () => {
    const install = getInstallModule();
    // First install
    await install({ nonInteractive: true, noHooks: true });

    // Second install — user declines
    inquirer.prompt.mockResolvedValueOnce({ shouldContinue: false });
    await install({});

    const output = console.log.mock.calls.flat().join(' ');
    expect(output).toContain('ck update');
    expect(output).toContain('Installation cancelled');
  });

  it('18. nonInteractive full install skips platform prompt', async () => {
    const { getIntegration } = require('../../lib/integrations');
    getIntegration.mockReturnValue(null);
    inquirer.prompt.mockClear();

    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true, fullInstall: true });

    expect(await fs.pathExists('.contextkit/config.yml')).toBe(true);
    // Should not have prompted for platform choice
    const platformPromptCalls = inquirer.prompt.mock.calls.filter(([args]) =>
      Array.isArray(args) ? args.some((a) => a.name === 'platform') : args.name === 'platform'
    );
    expect(platformPromptCalls).toHaveLength(0);
  });

  it('20. creates .contextkit/README.md with npm attribution', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/README.md')).toBe(true);
    const content = await fs.readFile('.contextkit/README.md', 'utf8');
    expect(content).toContain('ContextKit');
    expect(content).toContain('npm install -g @nolrm/contextkit');
    expect(content).toContain('https://www.npmjs.com/package/@nolrm/contextkit');
  });

  it('21. config.yml includes _source block with tool and npm fields', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('_source:');
    expect(config).toContain('tool: "@nolrm/contextkit"');
    expect(config).toContain('npm: "https://www.npmjs.com/package/@nolrm/contextkit"');
  });

  it('23. CI squad workflow is installed when prompt returns yes', async () => {
    // Temporarily unset CI env so promptGitHubActionsWorkflow runs interactively
    const savedCI = process.env.CI;
    delete process.env.CI;

    try {
      inquirer.prompt.mockReset();
      // noHooks=true skips hook prompts; mock squad CI (yes) then platform (none)
      inquirer.prompt
        .mockResolvedValueOnce({ squadCi: true })
        .mockResolvedValueOnce({ platform: null });

      const install = getInstallModule();
      await install({ noHooks: true });

      expect(await fs.pathExists('.github/workflows/squad-issue.yml')).toBe(true);
      const config = await fs.readFile('.contextkit/config.yml', 'utf8');
      expect(config).toContain('squad_ci_workflow: true');
    } finally {
      process.env.CI = savedCI;
    }
  });

  it('24. config.yml sets squad_ci_workflow: false when prompt declined', async () => {
    const savedCI = process.env.CI;
    delete process.env.CI;

    try {
      inquirer.prompt.mockReset();
      inquirer.prompt
        .mockResolvedValueOnce({ squadCi: false })
        .mockResolvedValueOnce({ platform: null });

      const install = getInstallModule();
      await install({ noHooks: true });

      expect(await fs.pathExists('.github/workflows/squad-issue.yml')).toBe(false);
      const config = await fs.readFile('.contextkit/config.yml', 'utf8');
      expect(config).toContain('squad_ci_workflow: false');
    } finally {
      process.env.CI = savedCI;
    }
  });

  it('25. config.yml sets squad_ci_workflow: false by default', async () => {
    const install = getInstallModule();
    await install({ nonInteractive: true, noHooks: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('squad_ci_workflow: false');
  });

  it('22. ck install <platform> when already installed adds platform without reinstall prompt', async () => {
    const { getIntegration } = require('../../lib/integrations');
    const mockIntegration = {
      install: jest.fn(),
      displayName: 'Cursor',
      showUsage: jest.fn(),
    };
    getIntegration.mockReturnValue(mockIntegration);

    const install = getInstallModule();
    // Base install first
    await install({ nonInteractive: true, noHooks: true });
    inquirer.prompt.mockClear();

    // Platform install without fullInstall (simulates `ck install cursor`)
    await install({ platform: 'cursor' });

    expect(mockIntegration.install).toHaveBeenCalled();
    // Reinstall prompt must NOT have been shown
    const reinstallCalls = inquirer.prompt.mock.calls.filter(([args]) =>
      (Array.isArray(args) ? args : [args]).some((a) => a.name === 'shouldContinue')
    );
    expect(reinstallCalls).toHaveLength(0);
  });
});

// ── Quality Tooling Scaffold ─────────────────────────────────────────────────

const childProcess = require('child_process');

describe('InstallCommand — promptQualityTooling / scaffoldQualityTooling', () => {
  let tmpDir;
  let originalCwd;
  let InstallCommand;
  let installer;
  let execSyncSpy;
  let savedCI;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-quality-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    jest.spyOn(console, 'log').mockImplementation();
    execSyncSpy = jest.spyOn(childProcess, 'execSync').mockImplementation(() => {});

    // Unset CI so promptQualityTooling interactive path is reachable in CI environments
    savedCI = process.env.CI;
    delete process.env.CI;

    delete require.cache[require.resolve('../../lib/commands/install')];
    ({ InstallCommand } = require('../../lib/commands/install'));
    installer = new InstallCommand();
  });

  afterEach(async () => {
    if (savedCI === undefined) delete process.env.CI;
    else process.env.CI = savedCI;
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it('26. promptQualityTooling skips when no package.json', async () => {
    await installer.promptQualityTooling('npm', {});
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it('27. promptQualityTooling skips when both scripts already exist', async () => {
    await fs.writeJson('package.json', { scripts: { format: 'prettier .', lint: 'eslint .' } });
    await installer.promptQualityTooling('npm', {});
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it('28. promptQualityTooling skips in CI mode', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    const original = process.env.CI;
    process.env.CI = 'true';
    await installer.promptQualityTooling('npm', {});
    expect(inquirer.prompt).not.toHaveBeenCalled();
    process.env.CI = original;
  });

  it('29. promptQualityTooling shows prompt when format script is missing', async () => {
    await fs.writeJson('package.json', { scripts: { lint: 'eslint .' } });
    inquirer.prompt.mockResolvedValue({ scaffold: false });
    await installer.promptQualityTooling('npm', {});
    expect(inquirer.prompt).toHaveBeenCalled();
  });

  it('30. promptQualityTooling shows prompt when lint script is missing', async () => {
    await fs.writeJson('package.json', { scripts: { format: 'prettier --write .' } });
    inquirer.prompt.mockResolvedValue({ scaffold: false });
    await installer.promptQualityTooling('npm', {});
    expect(inquirer.prompt).toHaveBeenCalled();
  });

  it('31. promptQualityTooling calls scaffoldQualityTooling when user answers yes', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    inquirer.prompt.mockResolvedValue({ scaffold: true });
    const scaffoldSpy = jest.spyOn(installer, 'scaffoldQualityTooling').mockResolvedValue();
    await installer.promptQualityTooling('npm', {});
    expect(scaffoldSpy).toHaveBeenCalled();
  });

  it('32. promptQualityTooling prints hint when user answers no', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    inquirer.prompt.mockResolvedValue({ scaffold: false });
    await installer.promptQualityTooling('npm', {});
    const logs = console.log.mock.calls.flat().join(' ');
    expect(logs).toContain('format/lint scripts later');
  });

  it('33. scaffoldQualityTooling adds format and lint scripts to package.json', async () => {
    await fs.writeJson('package.json', { name: 'test', scripts: {} });
    await installer.scaffoldQualityTooling({ name: 'test', scripts: {} }, 'npm');
    const pkg = await fs.readJson('package.json');
    expect(pkg.scripts.format).toBe('prettier --write .');
    expect(pkg.scripts.lint).toBe('eslint .');
  });

  it('34. scaffoldQualityTooling creates .prettierrc when none exists', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    expect(await fs.pathExists('.prettierrc')).toBe(true);
    const rc = await fs.readJson('.prettierrc');
    expect(rc.singleQuote).toBe(true);
    expect(rc.semi).toBe(true);
  });

  it('35. scaffoldQualityTooling skips .prettierrc when one already exists', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await fs.writeFile('.prettierrc', '{"singleQuote":false}');
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    const rc = await fs.readFile('.prettierrc', 'utf-8');
    expect(rc).toContain('"singleQuote":false'); // original unchanged
  });

  it('36. scaffoldQualityTooling creates .prettierignore when absent', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    expect(await fs.pathExists('.prettierignore')).toBe(true);
    const content = await fs.readFile('.prettierignore', 'utf-8');
    expect(content).toContain('node_modules/');
  });

  it('37. scaffoldQualityTooling creates eslint.config.js when none exists', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    expect(await fs.pathExists('eslint.config.js')).toBe(true);
    const content = await fs.readFile('eslint.config.js', 'utf-8');
    expect(content).toContain('@eslint/js');
    expect(content).toContain('globals.node');
    expect(content).toContain('globals.jest');
  });

  it('38. scaffoldQualityTooling skips eslint.config.js when one already exists', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await fs.writeFile('eslint.config.js', '// existing');
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    const content = await fs.readFile('eslint.config.js', 'utf-8');
    expect(content).toBe('// existing');
  });

  it('39. scaffoldQualityTooling runs npm install with correct devDependencies', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await installer.scaffoldQualityTooling({ scripts: {} }, 'npm');
    expect(execSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('npm install --save-dev prettier eslint @eslint/js globals'),
      expect.any(Object)
    );
  });

  it('40. scaffoldQualityTooling uses pnpm add -D for pnpm projects', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    await installer.scaffoldQualityTooling({ scripts: {} }, 'pnpm');
    expect(execSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining('pnpm add -D'),
      expect.any(Object)
    );
  });

  it('41. scaffoldQualityTooling handles npm install failure gracefully', async () => {
    await fs.writeJson('package.json', { scripts: {} });
    execSyncSpy.mockImplementation(() => {
      throw new Error('network error');
    });
    // Should not throw — wraps in try/catch
    await expect(installer.scaffoldQualityTooling({ scripts: {} }, 'npm')).resolves.not.toThrow();
    const logs = console.log.mock.calls.flat().join(' ');
    expect(logs).toContain('Could not complete quality tooling setup');
  });

  it('42. _hasExistingPrettierConfig returns true for .prettierrc', async () => {
    await fs.writeFile('.prettierrc', '{}');
    expect(await installer._hasExistingPrettierConfig({})).toBe(true);
  });

  it('43. _hasExistingPrettierConfig returns true for prettier key in package.json', async () => {
    expect(await installer._hasExistingPrettierConfig({ prettier: {} })).toBe(true);
  });

  it('44. _hasExistingPrettierConfig returns false when no config', async () => {
    expect(await installer._hasExistingPrettierConfig({})).toBe(false);
  });

  it('45. _hasExistingEslintConfig returns true for eslint.config.js', async () => {
    await fs.writeFile('eslint.config.js', '');
    expect(await installer._hasExistingEslintConfig({})).toBe(true);
  });

  it('46. _hasExistingEslintConfig returns true for .eslintrc.json', async () => {
    await fs.writeFile('.eslintrc.json', '{}');
    expect(await installer._hasExistingEslintConfig({})).toBe(true);
  });

  it('47. _hasExistingEslintConfig returns false when no config', async () => {
    expect(await installer._hasExistingEslintConfig({})).toBe(false);
  });
});

// ── addContextKitGitignoreEntries ─────────────────────────────────────────────

describe('InstallCommand — addContextKitGitignoreEntries', () => {
  let tmpDir;
  let originalCwd;
  let InstallCommand;
  let installer;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-gitignore-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    jest.spyOn(console, 'log').mockImplementation();

    delete require.cache[require.resolve('../../lib/commands/install')];
    ({ InstallCommand } = require('../../lib/commands/install'));
    installer = new InstallCommand();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it('51. skips silently when .gitignore does not exist', async () => {
    await expect(installer.addContextKitGitignoreEntries()).resolves.not.toThrow();
    expect(await fs.pathExists('.gitignore')).toBe(false);
  });

  it('52. appends all 5 entries and a # ContextKit header to an empty .gitignore', async () => {
    await fs.writeFile('.gitignore', '');
    await installer.addContextKitGitignoreEntries();

    const content = await fs.readFile('.gitignore', 'utf-8');
    expect(content).toContain('# ContextKit');
    expect(content).toContain('.contextkit/status.json');
    expect(content).toContain('.contextkit/status.yml');
    expect(content).toContain('.contextkit/context.md');
    expect(content).toContain('.contextkit/squad/');
    expect(content).toContain('.contextkit/squad-done-*/');
  });

  it('53. is idempotent — does not duplicate entries when run twice', async () => {
    await fs.writeFile('.gitignore', '');
    await installer.addContextKitGitignoreEntries();
    await installer.addContextKitGitignoreEntries();

    const content = await fs.readFile('.gitignore', 'utf-8');
    const count = (content.match(/\.contextkit\/status\.json/g) || []).length;
    expect(count).toBe(1);
  });

  it('54. appends only missing entries when some already present', async () => {
    await fs.writeFile('.gitignore', '.contextkit/status.json\n.contextkit/status.yml\n');
    await installer.addContextKitGitignoreEntries();

    const content = await fs.readFile('.gitignore', 'utf-8');
    expect(content).toContain('.contextkit/context.md');
    expect(content).toContain('.contextkit/squad/');
    expect(content).toContain('.contextkit/squad-done-*/');
    // Already-present entries should appear only once
    const count = (content.match(/\.contextkit\/status\.json/g) || []).length;
    expect(count).toBe(1);
  });

  it('55. does not add # ContextKit header when it already exists', async () => {
    await fs.writeFile('.gitignore', '# ContextKit\n.contextkit/status.json\n');
    // Add a fresh entry by temporarily removing one to force an append
    await installer.addContextKitGitignoreEntries();

    const content = await fs.readFile('.gitignore', 'utf-8');
    const headerCount = (content.match(/# ContextKit/g) || []).length;
    expect(headerCount).toBe(1);
  });

  it('56. handles file write error gracefully with a warning', async () => {
    await fs.writeFile('.gitignore', '');
    jest.spyOn(fs, 'appendFile').mockRejectedValue(new Error('permission denied'));

    await expect(installer.addContextKitGitignoreEntries()).resolves.not.toThrow();
    const logs = console.log.mock.calls.flat().join(' ');
    expect(logs).toContain('Could not update .gitignore');
  });
});

// ── Quality Gates Config ──────────────────────────────────────────────────────

describe('InstallCommand — createQualityGatesConfig', () => {
  let tmpDir;
  let originalCwd;
  let InstallCommand;
  let installer;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-gates-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);

    delete require.cache[require.resolve('../../lib/commands/install')];
    ({ InstallCommand } = require('../../lib/commands/install'));
    installer = new InstallCommand();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it('48. createQualityGatesConfig creates quality-gates.yml with all gate key comments', async () => {
    await fs.ensureDir('.contextkit');
    await installer.createQualityGatesConfig();

    expect(await fs.pathExists('.contextkit/quality-gates.yml')).toBe(true);
    const content = await fs.readFile('.contextkit/quality-gates.yml', 'utf8');
    expect(content).toContain('disabled:');
    expect(content).toContain('- test');
    expect(content).toContain('- pytest');
    expect(content).toContain('- cargo-test');
  });

  it('49. createQualityGatesConfig skips creation when quality-gates.yml already exists', async () => {
    await fs.ensureDir('.contextkit');
    const existing = 'disabled:\n  - test\n';
    await fs.writeFile('.contextkit/quality-gates.yml', existing);

    await installer.createQualityGatesConfig();

    const content = await fs.readFile('.contextkit/quality-gates.yml', 'utf8');
    expect(content).toBe(existing); // unchanged
  });

  it('50. install creates quality-gates.yml alongside config.yml', async () => {
    delete require.cache[require.resolve('../../lib/commands/install')];
    const installFn = require('../../lib/commands/install');
    await installFn({ nonInteractive: true, noHooks: true });

    expect(await fs.pathExists('.contextkit/quality-gates.yml')).toBe(true);
  });
});
