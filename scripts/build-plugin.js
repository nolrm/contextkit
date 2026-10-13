#!/usr/bin/env node
// Regenerates plugins/contextkit/ from lib/skills/registry.js + commands/.
// Maintainer-only build step — the plugin directory is committed output, not
// built at install time. Run after any change to commands/, lib/skills/registry.js,
// or a package.json version bump: `npm run build:plugin`.
//
// __tests__/plugin/plugin-sync.test.js fails CI if the committed output drifts
// from what this script would currently produce.

const fs = require('fs-extra');
const path = require('path');

const { SKILLS } = require('../lib/skills/registry');
const { renderInline } = require('../lib/skills/render');
const { version } = require('../package.json');

const REPO_ROOT = path.resolve(__dirname, '..');
const PLUGIN_DIR = path.join(REPO_ROOT, 'plugins', 'contextkit');

async function buildSkillContent(entry) {
  const sourcePath = path.join(REPO_ROOT, entry.source);
  let body = await fs.readFile(sourcePath, 'utf-8');

  if (entry.transform) {
    const extra = entry.extraSource
      ? await fs.readFile(path.join(REPO_ROOT, entry.extraSource), 'utf-8')
      : undefined;
    body = entry.transform(body, extra);
  }

  return renderInline(entry, body);
}

async function buildPluginManifest() {
  return (
    JSON.stringify(
      {
        $schema: 'https://anthropic.com/claude-code/plugin.schema.json',
        name: 'contextkit',
        version,
        description:
          'ContextKit skills — /ck (set up, update, tidy project context), /doc (docs for the current change), /learn (corrections → rules), /goal (long tasks with a goal file and milestone review), /headline (short, result-first replies).',
        author: { name: 'nolrm', url: 'https://github.com/nolrm/contextkit' },
        homepage: 'https://github.com/nolrm/contextkit',
        license: 'MIT',
      },
      null,
      2
    ) + '\n'
  );
}

async function build() {
  await fs.ensureDir(path.join(PLUGIN_DIR, '.claude-plugin'));
  await fs.writeFile(
    path.join(PLUGIN_DIR, '.claude-plugin', 'plugin.json'),
    await buildPluginManifest()
  );

  // Drop skill dirs whose registry entry was removed or renamed.
  const skillsDir = path.join(PLUGIN_DIR, 'skills');
  const current = new Set(SKILLS.map((s) => s.name));
  if (await fs.pathExists(skillsDir)) {
    for (const name of await fs.readdir(skillsDir)) {
      if (!current.has(name)) await fs.remove(path.join(skillsDir, name));
    }
  }

  for (const entry of SKILLS) {
    const dest = path.join(PLUGIN_DIR, 'skills', entry.name, 'SKILL.md');
    await fs.ensureDir(path.dirname(dest));
    await fs.writeFile(dest, await buildSkillContent(entry));
  }

  console.log(`Built ${SKILLS.length} skill(s) into ${path.relative(REPO_ROOT, PLUGIN_DIR)}/`);
}

if (require.main === module) {
  build().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { build, buildSkillContent, buildPluginManifest, PLUGIN_DIR };
