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
  bold: (str) => str
}));

// Mock ora
jest.mock('ora', () => {
  return () => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis()
  });
});

// Mock inquirer
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

// Mock download manager — create empty files so chmod doesn't fail
jest.mock('../../lib/utils/download', () => {
  const realFs = require('fs-extra');
  return jest.fn().mockImplementation(() => ({
    downloadFile: jest.fn().mockImplementation(async (url, dest) => {
      await realFs.ensureDir(require('path').dirname(dest));
      await realFs.writeFile(dest, '# mocked download\n');
    })
  }));
});

// Mock integrations registry
jest.mock('../../lib/integrations', () => ({
  getIntegration: jest.fn().mockReturnValue(null),
  getAllIntegrationNames: jest.fn().mockReturnValue([])
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
      expect.arrayContaining([
        expect.objectContaining({ name: 'shouldContinue' })
      ])
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
      showUsage: jest.fn()
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
      generatedFiles: []
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
      generatedFiles: []
    };
    getIntegration.mockReturnValue(mockIntegration);

    // First prompt: platform choice, second: git hooks (prePush), third: git hooks (commitMsg)
    inquirer.prompt
      .mockResolvedValueOnce({ platform: 'cursor' })
      .mockResolvedValueOnce({ prePush: false })
      .mockResolvedValueOnce({ commitMsg: false });

    const install = getInstallModule();
    await install({ fullInstall: true });

    // Should have prompted for platform
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'platform', type: 'list' })
      ])
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
    const platformPromptCalls = inquirer.prompt.mock.calls.filter(
      ([args]) => Array.isArray(args) ? args.some(a => a.name === 'platform') : args.name === 'platform'
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
});
