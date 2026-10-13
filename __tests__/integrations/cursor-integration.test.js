const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const CursorIntegration = require('../../lib/integrations/cursor-integration');

describe('CursorIntegration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-cursor-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test('1. creates scoped .mdc rule files', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    expect(await fs.pathExists('.cursor/rules/contextkit-standards.mdc')).toBe(true);
    expect(await fs.pathExists('.cursor/rules/contextkit-testing.mdc')).toBe(true);
    expect(await fs.pathExists('.cursor/rules/contextkit-components.mdc')).toBe(true);
    expect(await fs.pathExists('.cursor/rules/contextkit-api.mdc')).toBe(true);
  });

  test('2. standards rule has alwaysApply true and points at AGENTS.md', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const content = await fs.readFile('.cursor/rules/contextkit-standards.mdc', 'utf-8');
    expect(content).toContain('alwaysApply: true');
    expect(content).toContain('@AGENTS.md');
    expect(content).toContain('@.contextkit/standards/index.md');
  });

  test('3. testing rule has test file globs', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const content = await fs.readFile('.cursor/rules/contextkit-testing.mdc', 'utf-8');
    expect(content).toContain('*.test.*');
    expect(content).toContain('*.spec.*');
    expect(content).toContain('alwaysApply: false');
  });

  test('4. components rule scoped to components directory', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const content = await fs.readFile('.cursor/rules/contextkit-components.mdc', 'utf-8');
    expect(content).toContain('**/components/**');
  });

  test('5. removes legacy monolithic contextkit.mdc', async () => {
    // Create legacy file
    await fs.ensureDir('.cursor/rules');
    await fs.writeFile('.cursor/rules/contextkit.mdc', '# Legacy content');

    const integration = new CursorIntegration();
    await integration.install();

    expect(await fs.pathExists('.cursor/rules/contextkit.mdc')).toBe(false);
    expect(await fs.pathExists('.cursor/rules/contextkit-standards.mdc')).toBe(true);
  });

  test('6. creates a prompt file for every registry skill', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    for (const prompt of ['ck', 'doc', 'learn', 'goal', 'headline']) {
      const content = await fs.readFile(`.cursor/prompts/${prompt}.md`, 'utf-8');
      expect(content).toContain('.contextkit/commands/');
    }
  });

  test('7. prompt files reference correct subdirectory command paths', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const checks = [
      ['.cursor/prompts/ck.md', '.contextkit/commands/core/ck.md'],
      ['.cursor/prompts/doc.md', '.contextkit/commands/docs/doc.md'],
      ['.cursor/prompts/goal.md', '.contextkit/commands/addons/goal.md'],
    ];
    for (const [file, expectedPath] of checks) {
      expect(await fs.readFile(file, 'utf-8')).toContain(expectedPath);
    }
  });

  test('8. rule files reference correct subdirectory command paths', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const components = await fs.readFile('.cursor/rules/contextkit-components.mdc', 'utf-8');
    expect(components).toContain('.contextkit/commands/dev/create-component.md');
    expect(components).not.toContain('spec-component');

    const api = await fs.readFile('.cursor/rules/contextkit-api.mdc', 'utf-8');
    expect(api).toContain('.contextkit/commands/dev/create-feature.md');
  });

  test('9. removes retired prompts and keeps the hand-picked rule files', async () => {
    await fs.ensureDir('.cursor/prompts');
    await fs.writeFile('.cursor/prompts/squad-auto.md', 'old');

    const integration = new CursorIntegration();
    await integration.install();

    expect(await fs.pathExists('.cursor/prompts/squad-auto.md')).toBe(false);
    expect(await fs.pathExists('.cursor/rules/contextkit-components.mdc')).toBe(true);
    expect(await fs.pathExists('.cursor/rules/contextkit-api.mdc')).toBe(true);
  });

  test('10. showUsage lists the 2.0 skills', async () => {
    const integration = new CursorIntegration();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    integration.showUsage();

    const output = consoleSpy.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(output).toContain('/goal "idea"');
    expect(output).not.toContain('/squad');

    consoleSpy.mockRestore();
  });

  test('11. validate returns valid after install', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const result = await integration.validate();
    expect(result.valid).toBe(true);
  });
});
