const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  green: (str) => str,
  yellow: (str) => str,
  dim: (str) => str,
}));

const mockFixtures = {
  'commands/squad/squad.md': '# Squad — Kickoff\n\nSome squad workflow content.\n',
  'commands/squad/squad-dev.md': '# Squad — Dev\n\nImplementation workflow.\n',
  'commands/spec/spec.md':
    '# Spec — Project Specification\n\nIntro text.\n\n## Step 0 — Guard Check\n\nVerify `.contextkit/` exists in the current directory. If not, tell the user to run `ck install` first and stop.\n\n## Step 1 — Parse Input\n\nRest of the workflow.\n',
  'commands/dev/spec-component.md':
    '# Spec — Component\n\n3. Create `<ComponentName>/<ComponentName>.md` using `.contextkit/templates/component-spec.md`\n\n## Standards Applied\n',
  'templates/component-spec.md': '# [ComponentName]\n\nTemplate body.\n',
};

// Resolve fetched content by matching the known fixture suffix against the URL.
jest.mock('../../lib/utils/download', () => {
  return jest.fn().mockImplementation(() => ({
    downloadText: jest.fn().mockImplementation(async (url) => {
      const match = Object.keys(mockFixtures).find((source) => url.endsWith(source));
      if (!match) throw new Error(`No fixture for ${url}`);
      return mockFixtures[match];
    }),
  }));
});

const GlobalSkillsManager = require('../../lib/utils/global-skills');
const { version: CK_VERSION } = require('../../package.json');

describe('GlobalSkillsManager', () => {
  let tempHome;

  beforeEach(async () => {
    tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-global-skills-'));
  });

  afterEach(async () => {
    await fs.remove(tempHome);
  });

  const newManager = () => new GlobalSkillsManager({ homeDir: tempHome });

  test('1. resolveNames with no filter returns all 12 skills', () => {
    const manager = newManager();
    expect(manager.resolveNames(undefined)).toHaveLength(12);
  });

  test('2. resolveNames("squad") returns the 10-skill squad family', () => {
    const manager = newManager();
    const names = manager.resolveNames('squad');
    expect(names).toHaveLength(10);
    expect(names).toContain('squad-dev');
    expect(names).not.toContain('spec');
  });

  test('3. resolveNames("spec") returns spec + spec-component', () => {
    const manager = newManager();
    expect(manager.resolveNames('spec')).toEqual(['spec', 'spec-component']);
  });

  test('4. install writes a self-contained SKILL.md with contextkit-managed frontmatter', async () => {
    const manager = newManager();
    await manager.install('squad-dev');

    const skillPath = path.join(tempHome, '.claude', 'skills', 'squad-dev', 'SKILL.md');
    expect(await fs.pathExists(skillPath)).toBe(true);

    const content = await fs.readFile(skillPath, 'utf-8');
    expect(content).toContain('contextkit-managed: true');
    expect(content).toContain(`contextkit-version: ${CK_VERSION}`);
    expect(content).toContain('Implementation workflow.');
    // No pointer to an external .contextkit/commands/ file — fully inlined
    expect(content).not.toContain('.contextkit/commands/');
  });

  test('5. install applies the spec guard-removal transform', async () => {
    const manager = newManager();
    await manager.install('spec');

    const content = await fs.readFile(
      path.join(tempHome, '.claude', 'skills', 'spec', 'SKILL.md'),
      'utf-8'
    );
    expect(content).not.toContain('Guard Check');
    expect(content).not.toContain('tell the user to run `ck install`');
    expect(content).toContain('## Step 1 — Parse Input');
  });

  test('6. install applies the spec-component template-inlining transform', async () => {
    const manager = newManager();
    await manager.install('spec-component');

    const content = await fs.readFile(
      path.join(tempHome, '.claude', 'skills', 'spec-component', 'SKILL.md'),
      'utf-8'
    );
    expect(content).not.toContain('.contextkit/templates/component-spec.md');
    expect(content).toContain('## Component Spec Template');
    expect(content).toContain('Template body.');
  });

  test('7. list() reports only contextkit-managed skills with their version', async () => {
    const manager = newManager();
    await manager.install('squad-dev');

    const list = await manager.list();
    expect(list).toEqual([{ name: 'squad-dev', version: CK_VERSION, current: true }]);
  });

  test('8. update() regenerates only currently-installed skills when no filter given', async () => {
    const manager = newManager();
    await manager.install('squad-dev');
    const updated = await manager.update();
    expect(updated).toEqual(['squad-dev']);
  });

  test('9. uninstall requires an explicit filter or all:true — bare call is a no-op', async () => {
    const manager = newManager();
    await manager.install('squad-dev');

    const removed = await manager.uninstall(undefined, {});
    expect(removed).toEqual([]);
    expect(
      await fs.pathExists(path.join(tempHome, '.claude', 'skills', 'squad-dev', 'SKILL.md'))
    ).toBe(true);
  });

  test('10. uninstall never removes a same-named skill without the ownership marker', async () => {
    const manager = newManager();
    const foreignSkillDir = path.join(tempHome, '.claude', 'skills', 'squad-dev');
    await fs.ensureDir(foreignSkillDir);
    await fs.writeFile(
      path.join(foreignSkillDir, 'SKILL.md'),
      '---\ndescription: My own skill\n---\nNot managed by ContextKit.\n'
    );

    const removed = await manager.uninstall('squad-dev', {});
    expect(removed).toEqual([]);
    expect(await fs.pathExists(path.join(foreignSkillDir, 'SKILL.md'))).toBe(true);
  });

  test('11. uninstall --all removes every contextkit-managed skill', async () => {
    const manager = newManager();
    await manager.install('spec');
    const removed = await manager.uninstall(undefined, { all: true });
    expect(removed.sort()).toEqual(['spec', 'spec-component']);
    expect(await fs.pathExists(path.join(tempHome, '.claude', 'skills'))).toBe(true);
    expect(await fs.readdir(path.join(tempHome, '.claude', 'skills'))).toEqual([]);
  });
});
