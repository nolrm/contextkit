const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const ContinueIntegration = require('../../lib/integrations/continue-integration');

describe('ContinueIntegration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-continue-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test('1. creates .continue/rules/contextkit-standards.md', async () => {
    const integration = new ContinueIntegration();
    await integration.install();

    expect(await fs.pathExists('.continue/rules/contextkit-standards.md')).toBe(true);
    const content = await fs.readFile('.continue/rules/contextkit-standards.md', 'utf-8');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('alwaysApply: true');
  });

  test('2. creates .continue/config.yaml', async () => {
    const integration = new ContinueIntegration();
    await integration.install();

    expect(await fs.pathExists('.continue/config.yaml')).toBe(true);
    const content = await fs.readFile('.continue/config.yaml', 'utf-8');
    expect(content).toContain('contextkit-standards.md');
    expect(content).toContain('- AGENTS.md');
    expect(content).toContain('- .contextkit/standards/index.md');
  });

  test('3. does not overwrite existing config.json', async () => {
    await fs.ensureDir('.continue');
    await fs.writeJson('.continue/config.json', { custom: true });

    const integration = new ContinueIntegration();
    await integration.install();

    // config.json should be preserved
    const jsonConfig = await fs.readJson('.continue/config.json');
    expect(jsonConfig.custom).toBe(true);
    // config.yaml should NOT be created when config.json exists
    expect(await fs.pathExists('.continue/config.yaml')).toBe(false);
  });

  test('4. removes legacy vibe-kit-standards.md', async () => {
    await fs.ensureDir('.continue/rules');
    await fs.writeFile('.continue/rules/vibe-kit-standards.md', 'legacy');

    const integration = new ContinueIntegration();
    await integration.install();

    expect(await fs.pathExists('.continue/rules/vibe-kit-standards.md')).toBe(false);
    expect(await fs.pathExists('.continue/rules/contextkit-standards.md')).toBe(true);
  });

  test('5. validate returns valid after install', async () => {
    const integration = new ContinueIntegration();
    await integration.install();

    const result = await integration.validate();
    expect(result.valid).toBe(true);
    expect(result.present).toContain('.continue/rules/contextkit-standards.md');
  });
});
