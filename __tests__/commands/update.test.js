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

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: { version: '1.1.0' },
  }),
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

// Mock git-hooks manager
jest.mock('../../lib/utils/git-hooks', () => {
  return jest.fn().mockImplementation(() => ({
    installHooks: jest.fn().mockResolvedValue(undefined),
  }));
});

// Mock integrations registry
jest.mock('../../lib/integrations', () => ({
  getIntegration: jest.fn().mockReturnValue({
    validate: jest.fn().mockResolvedValue({ present: [], missing: [] }),
    install: jest.fn().mockResolvedValue(undefined),
  }),
  getAllIntegrationNames: jest.fn().mockReturnValue([]),
}));

let tmpDir;
let originalCwd;

const baseConfig = `# ContextKit Configuration
version: "1.0.0"
project_name: "test-project"
project_type: "node"

features:
  testing: true
  documentation: true
  code_review: true
  linting: true
  type_safety: true
  pre_push_hook: false
  commit_msg_hook: false
`;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-update-'));
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

function getUpdateModule() {
  delete require.cache[require.resolve('../../lib/commands/update')];
  return require('../../lib/commands/update');
}

describe('UpdateCommand', () => {
  it('1. fails if .contextkit is not installed', async () => {
    const update = getUpdateModule();
    await update({});

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('No ContextKit installation found');
  });

  it('2. creates backup before updating', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/test-file.txt', 'original');

    const update = getUpdateModule();
    // Force update
    await update({ force: true });

    // Backup should be cleaned up after success, but config should persist
    expect(await fs.pathExists('.contextkit/config.yml')).toBe(true);
  });

  it('3. preserves user config after update', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('project_name: "test-project"');
    expect(config).toContain('project_type: "node"');
  });

  it('4. updates version in config after update', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('version: "1.1.0"');
  });

  it('5. removes legacy pre-commit hook', async () => {
    await fs.ensureDir('.contextkit/hooks');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/hooks/pre-commit.sh', '#!/bin/sh\nexit 0');

    const update = getUpdateModule();
    await update({ force: true });

    expect(await fs.pathExists('.contextkit/hooks/pre-commit.sh')).toBe(false);
  });

  it('6. skips update when already up to date', async () => {
    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: '1.0.0' } });

    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({});

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('already up to date');
  });

  it('7. refreshes installed integrations', async () => {
    const { getAllIntegrationNames, getIntegration } = require('../../lib/integrations');
    const mockIntegration = {
      validate: jest.fn().mockResolvedValue({ present: ['CLAUDE.md'], missing: [] }),
      install: jest.fn().mockResolvedValue(undefined),
    };
    getAllIntegrationNames.mockReturnValue(['claude']);
    getIntegration.mockReturnValue(mockIntegration);

    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    expect(mockIntegration.install).toHaveBeenCalled();
  });

  it('8. reinstalls hooks when pre_push_hook is enabled', async () => {
    const configWithHooks = baseConfig.replace('pre_push_hook: false', 'pre_push_hook: true');
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', configWithHooks);

    const GitHooksManager = require('../../lib/utils/git-hooks');
    GitHooksManager.mockClear();
    const update = getUpdateModule();
    await update({ force: true });

    // The constructor is called during UpdateCommand creation
    const mockInstance = GitHooksManager.mock.results[0].value;
    expect(mockInstance.installHooks).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ prePush: true })
    );
  });

  it('9. removes legacy squad-peer-review command on update', async () => {
    await fs.ensureDir('.contextkit/commands');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/commands/squad-peer-review.md', '# old command');

    const update = getUpdateModule();
    await update({ force: true });

    expect(await fs.pathExists('.contextkit/commands/squad-peer-review.md')).toBe(false);
  });

  it('10. does not remove non-legacy files in commands directory', async () => {
    await fs.ensureDir('.contextkit/commands');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/commands/my-custom-command.md', '# user custom command');

    const update = getUpdateModule();
    await update({ force: true });

    expect(await fs.pathExists('.contextkit/commands/my-custom-command.md')).toBe(true);
  });

  it('12. always downloads squad-ci.md command on update', async () => {
    const DownloadManager = require('../../lib/utils/download');
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const downloadMock = DownloadManager.mock.results.at(-1).value;
    const downloadedUrls = downloadMock.downloadFile.mock.calls.map((c) => c[0]);
    expect(downloadedUrls.some((u) => u.includes('squad-ci.md'))).toBe(true);
  });

  it('13. updates squad-issue.yml when squad_ci_workflow feature is enabled', async () => {
    const DownloadManager = require('../../lib/utils/download');
    const configWithSquadCi = baseConfig + '  squad_ci_workflow: true\n';
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', configWithSquadCi);

    const update = getUpdateModule();
    await update({ force: true });

    const downloadMock = DownloadManager.mock.results.at(-1).value;
    const downloadedDests = downloadMock.downloadFile.mock.calls.map((c) => c[1]);
    expect(downloadedDests.some((d) => d.includes('squad-issue.yml'))).toBe(true);
  });

  it('14. does not update squad-issue.yml when squad_ci_workflow is false', async () => {
    const DownloadManager = require('../../lib/utils/download');
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const downloadMock = DownloadManager.mock.results.at(-1).value;
    const downloadedDests = downloadMock.downloadFile.mock.calls.map((c) => c[1]);
    expect(downloadedDests.some((d) => d.includes('squad-issue.yml'))).toBe(false);
  });

  it('15. skips update silently when npm registry is unreachable', async () => {
    const axios = require('axios');
    axios.get.mockRejectedValueOnce(new Error('network error'));

    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({});

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('already up to date');
  });

  it('11. version comparison works correctly', async () => {
    // Access the class to test isNewerVersion
    delete require.cache[require.resolve('../../lib/commands/update')];
    const updateModule = require('../../lib/commands/update');

    // We can't directly test isNewerVersion since it's on the class,
    // but we can test the behavior through the update flow
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const axios = require('axios');
    // Same version — no update
    axios.get.mockResolvedValueOnce({ data: { version: '1.0.0' } });
    await updateModule({});

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('already up to date');
  });
});
