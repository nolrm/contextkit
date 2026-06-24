const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const CodexIntegration = require('../../lib/integrations/codex-integration');

jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  bold: (str) => str,
  cyan: (str) => str,
  dim: (str) => str,
}));

describe('CodexIntegration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-codex-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  it('1. creates AGENTS.md bridge file with standards and product context', async () => {
    const integration = new CodexIntegration();
    await integration.install();

    expect(await fs.pathExists('AGENTS.md')).toBe(true);
    const content = await fs.readFile('AGENTS.md', 'utf-8');
    expect(content).toContain('.contextkit/standards/code-style.md');
    expect(content).toContain('.contextkit/product/mission-lite.md');
    expect(content).toContain('.codex/skills/');
  });

  it('2. creates .codex/skills/ directory with all skill files', async () => {
    const integration = new CodexIntegration();
    await integration.install();

    expect(await fs.pathExists('.codex/skills')).toBe(true);

    const expectedSkills = [
      'analyze',
      'review',
      'refactor',
      'test',
      'doc',
      'spec',
      'spec-component',
      'ck',
      'squad',
      'squad-architect',
      'squad-dev',
      'squad-test',
      'squad-review',
      'squad-auto',
      'squad-reset',
      'squad-doc',
      'squad-go',
      'squad-spec',
      'doc-arch',
      'doc-feature',
      'doc-component',
      'agent-push-checklist',
      'context-budget',
      'standards-aware',
    ];
    for (const skill of expectedSkills) {
      expect(await fs.pathExists(`.codex/skills/${skill}/SKILL.md`)).toBe(true);
    }
  });

  it('3. SKILL.md files have correct Codex frontmatter format', async () => {
    const integration = new CodexIntegration();
    await integration.install();

    const specSkill = await fs.readFile('.codex/skills/spec/SKILL.md', 'utf-8');
    expect(specSkill).toContain('name: spec');
    expect(specSkill).toContain('description:');
    expect(specSkill).toContain('.contextkit/commands/spec/spec.md');

    const squadSkill = await fs.readFile('.codex/skills/squad/SKILL.md', 'utf-8');
    expect(squadSkill).toContain('name: squad');
    expect(squadSkill).toContain('.contextkit/commands/squad/squad.md');
  });

  it('4. squad-spec skill references squad-spec command and scope pattern', async () => {
    const integration = new CodexIntegration();
    await integration.install();

    const content = await fs.readFile('.codex/skills/squad-spec/SKILL.md', 'utf-8');
    expect(content).toContain('name: squad-spec');
    expect(content).toContain('.contextkit/commands/squad/squad-spec.md');
    expect(content).toContain('scope slug');
  });

  it('5. appends to existing AGENTS.md without overwriting', async () => {
    await fs.writeFile('AGENTS.md', '# My Agents Config\n\nCustom content.\n');

    const integration = new CodexIntegration();
    await integration.install();

    const content = await fs.readFile('AGENTS.md', 'utf-8');
    expect(content).toContain('# My Agents Config');
    expect(content).toContain('Custom content.');
    expect(content).toContain('ContextKit');
  });

  it('6. validate returns valid after install', async () => {
    const integration = new CodexIntegration();
    await integration.install();

    const result = await integration.validate();
    expect(result.valid).toBe(true);
    expect(result.present).toContain('AGENTS.md');
  });
});
