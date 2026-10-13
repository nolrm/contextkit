const fs = require('fs-extra');
const path = require('path');

const { SKILLS } = require('../../lib/skills/registry');
const {
  buildSkillContent,
  buildPluginManifest,
  PLUGIN_DIR,
} = require('../../scripts/build-plugin');

// The committed plugins/contextkit/ directory is generated output (see
// scripts/build-plugin.js) — this test fails CI if it's drifted from what the
// generator would currently produce, so a maintainer never forgets to run
// `npm run build:plugin` after touching commands/ or lib/skills/registry.js.
//
// Manually verified against a real Claude Code install (2.1.283): marketplace
// add, plugin install, and `claude plugin details` all confirmed the expected
// 22 skills and a clean validation pass. Not re-verified here — no `claude`
// binary assumed present in CI.

describe('plugins/contextkit/ — generated output stays in sync', () => {
  it('1. plugin.json on disk matches what buildPluginManifest() currently produces', async () => {
    const expected = await buildPluginManifest();
    const actual = await fs.readFile(
      path.join(PLUGIN_DIR, '.claude-plugin', 'plugin.json'),
      'utf-8'
    );
    expect(actual).toBe(expected);
  });

  it('2. every registry skill has a matching SKILL.md on disk with identical content', async () => {
    for (const entry of SKILLS) {
      const expected = await buildSkillContent(entry);
      const skillPath = path.join(PLUGIN_DIR, 'skills', entry.name, 'SKILL.md');
      const actual = await fs.readFile(skillPath, 'utf-8');
      expect(actual).toBe(expected);
    }
  });

  it('3. no stale skill directories left over from a renamed/removed registry entry', async () => {
    const skillsDir = path.join(PLUGIN_DIR, 'skills');
    const onDisk = (await fs.readdir(skillsDir)).sort();
    const expected = SKILLS.map((s) => s.name).sort();
    expect(onDisk).toEqual(expected);
  });

  it('4. plugin.json is well-formed and self-contained (no external .contextkit/ dependency)', async () => {
    const manifest = JSON.parse(
      await fs.readFile(path.join(PLUGIN_DIR, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    expect(manifest.name).toBe('contextkit');
    expect(typeof manifest.version).toBe('string');
    expect(manifest.version.length).toBeGreaterThan(0);
  });

  it('5. add-on skills are self-contained (inline content, no .contextkit/ pointer)', async () => {
    for (const name of ['goal', 'headline']) {
      const content = await fs.readFile(path.join(PLUGIN_DIR, 'skills', name, 'SKILL.md'), 'utf-8');
      expect(content).not.toMatch(/^Read `\.contextkit\/commands/m);
    }
    const goal = await fs.readFile(path.join(PLUGIN_DIR, 'skills', 'goal', 'SKILL.md'), 'utf-8');
    expect(goal).toContain('## Template');
  });

  it('6. root marketplace.json points at ./plugins/contextkit and is valid JSON', async () => {
    const repoRoot = path.resolve(__dirname, '../..');
    const marketplace = JSON.parse(
      await fs.readFile(path.join(repoRoot, '.claude-plugin', 'marketplace.json'), 'utf-8')
    );
    expect(marketplace.name).toBe('contextkit-marketplace');
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].source).toBe('./plugins/contextkit');
    // Validated against the real Claude Code CLI's path rule: plugin sources
    // must not contain ".." and must resolve under the marketplace root.
    expect(marketplace.plugins[0].source).not.toContain('..');
  });
});
