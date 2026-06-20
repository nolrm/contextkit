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

  test('2. standards rule has alwaysApply true', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const content = await fs.readFile('.cursor/rules/contextkit-standards.mdc', 'utf-8');
    expect(content).toContain('alwaysApply: true');
    expect(content).toContain('@.contextkit/standards/code-style.md');
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

  test('6. creates all prompt files for slash commands', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const prompts = [
      'analyze',
      'review',
      'refactor',
      'test',
      'doc',
      'spec',
      'spec-component',
      'squad',
      'squad-architect',
      'squad-dev',
      'squad-test',
      'squad-review',
      'squad-auto',
      'ck',
    ];
    for (const prompt of prompts) {
      const filePath = `.cursor/prompts/${prompt}.md`;
      expect(await fs.pathExists(filePath)).toBe(true);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('.contextkit/commands/');
    }
  });

  test('7. prompt files reference correct subdirectory command paths', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const checks = [
      ['.cursor/prompts/analyze.md', '.contextkit/commands/dev/analyze.md'],
      ['.cursor/prompts/refactor.md', '.contextkit/commands/dev/refactor.md'],
      ['.cursor/prompts/test.md', '.contextkit/commands/dev/run-tests.md'],
      ['.cursor/prompts/doc.md', '.contextkit/commands/docs/add-documentation.md'],
      ['.cursor/prompts/spec.md', '.contextkit/commands/spec/spec.md'],
      ['.cursor/prompts/spec-component.md', '.contextkit/commands/dev/spec-component.md'],
      ['.cursor/prompts/squad.md', '.contextkit/commands/squad/squad.md'],
      ['.cursor/prompts/squad-architect.md', '.contextkit/commands/squad/squad-architect.md'],
      ['.cursor/prompts/squad-auto.md', '.contextkit/commands/squad/squad-auto.md'],
      ['.cursor/prompts/ck.md', '.contextkit/commands/dev/health-check.md'],
    ];

    for (const [file, expectedPath] of checks) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content).toContain(expectedPath);
    }
  });

  test('8. rule files reference correct subdirectory command paths', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const components = await fs.readFile('.cursor/rules/contextkit-components.mdc', 'utf-8');
    expect(components).toContain('.contextkit/commands/dev/create-component.md');
    expect(components).toContain('.contextkit/commands/dev/spec-component.md');

    const api = await fs.readFile('.cursor/rules/contextkit-api.mdc', 'utf-8');
    expect(api).toContain('.contextkit/commands/dev/create-feature.md');
  });

  test('9. generated Cursor spec content has no stale dev/spec.md references', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const specPrompt = await fs.readFile('.cursor/prompts/spec.md', 'utf-8');
    const specComponentPrompt = await fs.readFile('.cursor/prompts/spec-component.md', 'utf-8');
    const componentsRule = await fs.readFile('.cursor/rules/contextkit-components.mdc', 'utf-8');

    expect(specPrompt).not.toContain('.contextkit/commands/dev/spec.md');
    expect(specComponentPrompt).not.toContain('.contextkit/commands/dev/spec.md');
    expect(componentsRule).not.toContain('.contextkit/commands/dev/spec.md');
  });

  test('10. showUsage reflects the spec command split', async () => {
    const integration = new CursorIntegration();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    integration.showUsage();

    const output = consoleSpy.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(output).toContain('/spec     — Turn a product overview into a project spec');
    expect(output).toContain('/spec-component — Write a component spec before coding');

    consoleSpy.mockRestore();
  });

  test('11. validate returns valid after install', async () => {
    const integration = new CursorIntegration();
    await integration.install();

    const result = await integration.validate();
    expect(result.valid).toBe(true);
  });
});
