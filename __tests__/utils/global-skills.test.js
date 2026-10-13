const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  green: (str) => str,
  yellow: (str) => str,
  dim: (str) => str,
}));

const mockFixtures = {
  'commands/addons/goal.md': '# Goal\n\nRun a long task against a goal file.\n',
  'commands/addons/headline.md': '# Headline\n\nShort, result-first replies.\n',
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
  const skillFile = (name) => path.join(tempHome, '.claude', 'skills', name, 'SKILL.md');

  async function writeManagedSkill(name) {
    await fs.ensureDir(path.dirname(skillFile(name)));
    await fs.writeFile(
      skillFile(name),
      `---\ndescription: old\ncontextkit-managed: true\ncontextkit-version: 1.13.0\n---\nOld.\n`
    );
  }

  test('1. resolveNames with no filter returns the goal and headline skills', () => {
    expect(newManager().resolveNames(undefined)).toEqual(['goal', 'headline']);
  });

  test('2. resolveNames accepts family and skill names, ignores unknown ones', () => {
    const manager = newManager();
    expect(manager.resolveNames('goal')).toEqual(['goal']);
    expect(manager.resolveNames('headline,nope')).toEqual(['headline']);
    expect(manager.resolveNames('squad')).toEqual([]);
  });

  test('3. install writes a self-contained SKILL.md with contextkit-managed frontmatter', async () => {
    await newManager().install('goal');
    const content = await fs.readFile(skillFile('goal'), 'utf-8');
    expect(content).toContain('contextkit-managed: true');
    expect(content).toContain(`contextkit-version: ${CK_VERSION}`);
    expect(content).toContain('Run a long task against a goal file.');
    expect(content).not.toContain('.contextkit/commands/');
  });

  test('4. list() reports only contextkit-managed skills with their version', async () => {
    const manager = newManager();
    await manager.install('headline');
    expect(await manager.list()).toEqual([
      { name: 'headline', version: CK_VERSION, current: true },
    ]);
  });

  test('5. update() regenerates only currently-installed skills when no filter given', async () => {
    const manager = newManager();
    await manager.install('goal');
    expect(await manager.update()).toEqual(['goal']);
  });

  test('6. update() removes managed skills that were retired in 2.0', async () => {
    await writeManagedSkill('squad-dev');
    await newManager().update();
    expect(await fs.pathExists(path.dirname(skillFile('squad-dev')))).toBe(false);
  });

  test('7. uninstall requires an explicit filter or all:true — bare call is a no-op', async () => {
    const manager = newManager();
    await manager.install('goal');
    expect(await manager.uninstall(undefined, {})).toEqual([]);
    expect(await fs.pathExists(skillFile('goal'))).toBe(true);
  });

  test('8. uninstall never removes a same-named skill without the ownership marker', async () => {
    await fs.ensureDir(path.dirname(skillFile('goal')));
    await fs.writeFile(skillFile('goal'), '---\ndescription: My own skill\n---\nNot managed.\n');
    expect(await newManager().uninstall('goal')).toEqual([]);
    expect(await fs.pathExists(skillFile('goal'))).toBe(true);
  });

  test('9. uninstall("squad") removes pre-2.0 squad skills by family name', async () => {
    await writeManagedSkill('squad');
    await writeManagedSkill('squad-auto');
    const removed = await newManager().uninstall('squad');
    expect(removed.sort()).toEqual(['squad', 'squad-auto']);
  });

  test('10. uninstall --all removes every contextkit-managed skill', async () => {
    const manager = newManager();
    await manager.install('goal');
    await writeManagedSkill('spec');
    const removed = await manager.uninstall(undefined, { all: true });
    expect(removed.sort()).toEqual(['goal', 'spec']);
  });
});
