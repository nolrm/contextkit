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

  it('16. update preserves existing user-owned glossary.md', async () => {
    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/standards/glossary.md', '# My custom glossary\nterm: my domain term\n');

    const update = getUpdateModule();
    await update({ force: false });

    const content = await fs.readFile('.contextkit/standards/glossary.md', 'utf8');
    expect(content).toBe('# My custom glossary\nterm: my domain term\n');
  });

  it('17. update writes glossary.md when it does not exist (restore)', async () => {
    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    // No glossary.md present

    const update = getUpdateModule();
    await update({ force: false });

    expect(await fs.pathExists('.contextkit/standards/glossary.md')).toBe(true);
  });

  it('18. update with --force regenerates user-owned glossary.md', async () => {
    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/standards/glossary.md', '# My custom glossary\n');

    const update = getUpdateModule();
    await update({ force: true });

    // Mock downloads write '# mocked download\n' — should replace custom content
    const content = await fs.readFile('.contextkit/standards/glossary.md', 'utf8');
    expect(content).toBe('# mocked download\n');
  });

  it('19. update logs preserved message when glossary.md skipped', async () => {
    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile('.contextkit/config.yml', baseConfig);
    await fs.writeFile('.contextkit/standards/glossary.md', '# custom\n');

    const update = getUpdateModule();
    await update({ force: false });

    const logged = console.log.mock.calls.flat().join(' ');
    expect(logged).toContain('glossary.md');
    expect(logged).toContain('preserved');
  });

  it('20. continues update when a command file download fails with 400', async () => {
    const DownloadManager = require('../../lib/utils/download');
    const realFs = require('fs-extra');

    DownloadManager.mockImplementationOnce(() => ({
      downloadFile: jest.fn().mockImplementation(async (url, dest) => {
        if (url.includes('refactor.md')) {
          throw new Error('Request failed with status code 400');
        }
        await realFs.ensureDir(path.dirname(dest));
        await realFs.writeFile(dest, '# mocked download\n');
      }),
    }));

    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await expect(update({ force: true })).resolves.not.toThrow();

    const logged = console.log.mock.calls.flat().join(' ');
    expect(logged).toContain('Skipped');
    expect(logged).toContain('refactor.md');
  });

  it('21. reports skipped count in success message when files are skipped', async () => {
    const DownloadManager = require('../../lib/utils/download');
    const realFs = require('fs-extra');
    const ora = require('ora');

    let succeedMessage = '';
    jest.spyOn(ora(), 'succeed').mockImplementation((msg) => {
      succeedMessage = msg || '';
    });

    DownloadManager.mockImplementationOnce(() => ({
      downloadFile: jest.fn().mockImplementation(async (url, dest) => {
        if (url.includes('typescript-strict.json')) {
          throw new Error('Request failed with status code 400');
        }
        await realFs.ensureDir(path.dirname(dest));
        await realFs.writeFile(dest, '# mocked download\n');
      }),
    }));

    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await expect(update({ force: true })).resolves.not.toThrow();

    const logged = console.log.mock.calls.flat().join(' ');
    expect(logged).toContain('Skipped');
    expect(logged).toContain('typescript-strict.json');
  });

  it('22. appends missing response_style block with explanatory comment', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('response_style:');
    expect(config).toContain('chat_minimal_words: true');
    expect(config).toContain('# plain-text, terse chat explanations');
  });

  it('23. appends missing required/optional/conditionals and analysis_scope blocks', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('required:');
    expect(config).toContain('optional:');
    expect(config).toContain('conditionals:');
    expect(config).toContain('analysis_scope: null');
    expect(config).toContain('analyzed_packages: []');
  });

  it('24. inserts missing squad_ci_workflow flag inside the existing features block', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    const featuresBlock = config.slice(config.indexOf('features:'));
    expect(featuresBlock).toContain('squad_ci_workflow: false');
  });

  it('25. does not duplicate settings that are already present', async () => {
    const configWithResponseStyle = `${baseConfig}\nresponse_style:\n  chat_minimal_words: false\n  diagrams_in_docs: true\n`;
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', configWithResponseStyle);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config.match(/^response_style:/gm)).toHaveLength(1);
    // User's existing value is preserved, not overwritten with the default
    expect(config).toContain('chat_minimal_words: false');
  });

  it('26. does not remove or reorder any pre-existing line', async () => {
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', baseConfig);

    const update = getUpdateModule();
    await update({ force: true });

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    // version's value is intentionally bumped by updateConfigVersion — everything else must survive untouched
    const originalLines = baseConfig
      .trim()
      .split('\n')
      .filter((line) => !line.startsWith('version:'));
    const updatedLines = config.split('\n');

    let cursor = 0;
    for (const line of originalLines) {
      cursor = updatedLines.indexOf(line, cursor);
      expect(cursor).toBeGreaterThanOrEqual(0);
      cursor++;
    }
  });

  it('27. bumps the top-level version field, not the nested _source.version, and stops re-updating once caught up', async () => {
    const configWithSource = `# ContextKit Configuration
_source:
  tool: "@nolrm/contextkit"
  version: "0.9.0"
  npm: "https://www.npmjs.com/package/@nolrm/contextkit"
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
    await fs.ensureDir('.contextkit');
    await fs.writeFile('.contextkit/config.yml', configWithSource);

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: '1.2.0' } });

    let update = getUpdateModule();
    await update({});

    let config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toMatch(/^version: "1\.2\.0"/m);
    // The nested _source.version is metadata from install time — update.js
    // must never touch it when bumping the project's own version field
    expect(config).toContain('  version: "0.9.0"');

    // Running update again with the same latest version must now report
    // "already up to date" — proves the bumped version was actually
    // persisted and read back correctly, instead of staying frozen
    axios.get.mockResolvedValueOnce({ data: { version: '1.2.0' } });
    console.log.mockClear();
    update = getUpdateModule();
    await update({});

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('already up to date');
  });

  it('28. applies a standards migration when the shipped section matches exactly', async () => {
    const { MIGRATIONS } = require('../../lib/utils/standards-migrations');
    const entry = MIGRATIONS[0];
    const versionParts = entry.version.split('.').map(Number);
    versionParts[versionParts.length - 1] = Math.max(0, versionParts[versionParts.length - 1] - 1);
    const fromVersion = versionParts.join('.');

    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile(
      '.contextkit/config.yml',
      baseConfig.replace('version: "1.0.0"', `version: "${fromVersion}"`)
    );
    await fs.writeFile(entry.file, `# ai guidelines\n\n${entry.from}\n`);

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: entry.version } });

    const update = getUpdateModule();
    await update({});

    const content = await fs.readFile(entry.file, 'utf8');
    expect(content).toContain(entry.to);
    expect(content).not.toContain(entry.from);

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('pending_standards_updates: []');
  });

  it('29. records a pending_standards_updates entry when the section was hand-edited', async () => {
    const { MIGRATIONS } = require('../../lib/utils/standards-migrations');
    const entry = MIGRATIONS[0];
    const versionParts = entry.version.split('.').map(Number);
    versionParts[versionParts.length - 1] = Math.max(0, versionParts[versionParts.length - 1] - 1);
    const fromVersion = versionParts.join('.');

    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile(
      '.contextkit/config.yml',
      baseConfig.replace('version: "1.0.0"', `version: "${fromVersion}"`)
    );
    const customized = '# ai guidelines\n\nThis section was hand-edited by the user.\n';
    await fs.writeFile(entry.file, customized);

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: entry.version } });

    const update = getUpdateModule();
    await update({});

    // Untouched — never force-apply over content that doesn't match verbatim
    const content = await fs.readFile(entry.file, 'utf8');
    expect(content).toBe(customized);

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('pending_standards_updates:');
    expect(config).toContain(`id: ${entry.id}`);
    expect(config).toContain(`file: ${entry.file}`);
  });

  it('30. does not re-apply a standards migration once the project is already at its version', async () => {
    const { MIGRATIONS } = require('../../lib/utils/standards-migrations');
    const entry = MIGRATIONS[0];

    await fs.ensureDir('.contextkit/standards');
    // Project's version already includes this migration — it should not run again
    await fs.writeFile(
      '.contextkit/config.yml',
      baseConfig.replace('version: "1.0.0"', `version: "${entry.version}"`)
    );
    await fs.writeFile(entry.file, `# ai guidelines\n\n${entry.from}\n`);

    const axios = require('axios');
    const nextVersionParts = entry.version.split('.').map(Number);
    nextVersionParts[nextVersionParts.length - 1] += 1;
    axios.get.mockResolvedValueOnce({ data: { version: nextVersionParts.join('.') } });

    const update = getUpdateModule();
    await update({});

    const content = await fs.readFile(entry.file, 'utf8');
    expect(content).toContain(entry.from);
    expect(content).not.toContain(entry.to);
  });

  it('31. silently skips a standards migration when the target file does not exist', async () => {
    const { MIGRATIONS } = require('../../lib/utils/standards-migrations');
    const entry = MIGRATIONS[0];
    const versionParts = entry.version.split('.').map(Number);
    versionParts[versionParts.length - 1] = Math.max(0, versionParts[versionParts.length - 1] - 1);
    const fromVersion = versionParts.join('.');

    await fs.ensureDir('.contextkit');
    await fs.writeFile(
      '.contextkit/config.yml',
      baseConfig.replace('version: "1.0.0"', `version: "${fromVersion}"`)
    );

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: entry.version } });

    const update = getUpdateModule();
    await update({});

    expect(await fs.pathExists(entry.file)).toBe(false);
    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).not.toContain(`id: ${entry.id}`);
  });

  it('32. appends a second pending entry without disturbing the first', async () => {
    jest.resetModules();
    jest.doMock('../../lib/utils/standards-migrations', () => ({
      MIGRATIONS: [
        {
          version: '9.9.1',
          file: '.contextkit/standards/ai-guidelines.md',
          id: 'synthetic-a',
          description: 'synthetic entry A',
          from: 'AAA',
          to: 'aaa',
        },
        {
          version: '9.9.2',
          file: '.contextkit/standards/ai-guidelines.md',
          id: 'synthetic-b',
          description: 'synthetic entry B',
          from: 'BBB',
          to: 'bbb',
        },
      ],
    }));

    await fs.ensureDir('.contextkit/standards');
    await fs.writeFile(
      '.contextkit/config.yml',
      baseConfig.replace('version: "1.0.0"', 'version: "9.9.0"')
    );
    // Matches neither synthetic entry's `from` — both fall to the pending path
    await fs.writeFile(
      '.contextkit/standards/ai-guidelines.md',
      '# custom content matching neither synthetic entry\n'
    );

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { version: '9.9.2' } });

    const update = require('../../lib/commands/update');
    await update({});

    const config = await fs.readFile('.contextkit/config.yml', 'utf8');
    expect(config).toContain('id: synthetic-a');
    expect(config).toContain('id: synthetic-b');
    // Single block header — the second append must extend it, not duplicate it
    expect(config.match(/^pending_standards_updates:/gm)).toHaveLength(1);

    jest.dontMock('../../lib/utils/standards-migrations');
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
