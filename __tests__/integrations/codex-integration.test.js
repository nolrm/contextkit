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

  it('1. writes the canonical AGENTS.md with the index pointer and read-when table', async () => {
    await new CodexIntegration().install();

    const content = await fs.readFile('AGENTS.md', 'utf-8');
    expect(content).toContain('Read `.contextkit/standards/index.md` first');
    expect(content).toContain('| write or change tests | `.contextkit/standards/testing.md` |');
    expect(content).toContain('`.contextkit/goals/`');
    expect(content).toContain('`$name` in Codex');
    expect(content).not.toContain('squad');
  });

  it('2. creates .codex/skills/ and .agents/skills/ for every registry skill', async () => {
    await new CodexIntegration().install();

    for (const skill of ['ck', 'doc', 'learn', 'goal', 'headline']) {
      expect(await fs.pathExists(`.codex/skills/${skill}/SKILL.md`)).toBe(true);
      expect(await fs.pathExists(`.agents/skills/${skill}/SKILL.md`)).toBe(true);
    }
  });

  it('3. SKILL.md files have correct Codex frontmatter format', async () => {
    await new CodexIntegration().install();

    const goal = await fs.readFile('.codex/skills/goal/SKILL.md', 'utf-8');
    expect(goal).toContain('name: goal');
    expect(goal).toContain('description:');
    expect(goal).toContain('.contextkit/commands/addons/goal.md');
    expect(goal).toContain('`$goal`');
  });

  it('4. removes retired skill directories from .codex/skills and .agents/skills', async () => {
    await fs.ensureDir('.codex/skills/squad-spec');
    await fs.ensureDir('.agents/skills/standards-aware');

    await new CodexIntegration().install();

    expect(await fs.pathExists('.codex/skills/squad-spec')).toBe(false);
    expect(await fs.pathExists('.agents/skills/standards-aware')).toBe(false);
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
    expect(result.present).toContain('.codex/skills/goal/SKILL.md');
  });

  it('7. AGENTS.md alone does not make a project look like a Codex install', async () => {
    await fs.writeFile('AGENTS.md', '# Mine\n');
    const result = await new CodexIntegration().validate();
    expect(result.present).toEqual([]);
  });
});
