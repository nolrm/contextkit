const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

const DownloadManager = require('./download');
const { skillsByFamily } = require('../skills/registry');
const { yamlScalar } = require('../skills/render');
const { version: CK_VERSION } = require('../../package.json');

// Pinned to the release tag, not `main` — main's file layout can change between
// releases (files renamed/removed), which would 404 out from under older,
// already-published CLI versions still fetching from a moving branch.
const REPO_URL = `https://raw.githubusercontent.com/nolrm/contextkit/v${CK_VERSION}`;

// Self-contained global skills: no ~/.contextkit/ mirror. Each entry's source
// command file is fetched and inlined directly into ~/.claude/skills/<name>/SKILL.md.
//
// Only the squad + spec families are eligible for global install today — the
// rest lean on `.contextkit/standards/` for project-specific content, which
// doesn't have a sane global equivalent (see GLOBAL-SKILLS-PLAN.md §1).
// Derived from the shared registry (lib/skills/registry.js) so descriptions,
// argument hints, and tool/effort metadata can't drift from the per-project
// Claude Code skills — only the fetch/inline mechanics below are global-only.
function toGlobalEntry(entry) {
  const frontmatter = { description: entry.description };
  if (entry.argumentHint) frontmatter['argument-hint'] = yamlScalar(entry.argumentHint);
  if (entry.claude?.allowedTools) frontmatter['allowed-tools'] = entry.claude.allowedTools;
  if (entry.claude?.effort) frontmatter.effort = entry.claude.effort;
  if (entry.claude?.context) frontmatter.context = entry.claude.context;

  return {
    name: entry.name,
    family: entry.family,
    source: entry.source,
    frontmatter,
    extraSource: entry.extraSource,
    transform: entry.transform,
  };
}

const SKILLS = [...skillsByFamily('squad'), ...skillsByFamily('spec')].map(toGlobalEntry);

function buildFrontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push('contextkit-managed: true');
  lines.push(`contextkit-version: ${CK_VERSION}`);
  lines.push('---');
  return lines.join('\n');
}

class GlobalSkillsManager {
  constructor({ homeDir = os.homedir() } = {}) {
    this.downloadManager = new DownloadManager();
    this.targetDir = path.join(homeDir, '.claude', 'skills');
  }

  /**
   * Resolves a comma-separated filter (skill names or family shorthands
   * "squad"/"spec") to a deduplicated list of skill names. No filter -> all.
   */
  resolveNames(filter) {
    if (!filter) return SKILLS.map((s) => s.name);
    const names = new Set();
    for (const raw of filter
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)) {
      if (raw === 'squad' || raw === 'spec') {
        SKILLS.filter((s) => s.family === raw).forEach((s) => names.add(s.name));
      } else {
        const match = SKILLS.find((s) => s.name === raw);
        if (match) names.add(match.name);
      }
    }
    return [...names];
  }

  async buildSkillContent(def) {
    let body = await this.downloadManager.downloadText(`${REPO_URL}/${def.source}`);
    if (def.transform) {
      const extra = def.extraSource
        ? await this.downloadManager.downloadText(`${REPO_URL}/${def.extraSource}`)
        : undefined;
      body = def.transform(body, extra);
    }
    return `${buildFrontmatter(def.frontmatter)}\n\n${body}`;
  }

  async writeSkill(def) {
    const content = await this.buildSkillContent(def);
    const dest = path.join(this.targetDir, def.name, 'SKILL.md');
    await fs.ensureDir(path.dirname(dest));
    await fs.writeFile(dest, content);
  }

  async install(filter) {
    const names = this.resolveNames(filter);
    if (names.length === 0) {
      console.log(chalk.yellow(`⚠️  No matching skill(s) for "${filter}"`));
      return [];
    }
    for (const name of names) {
      const def = SKILLS.find((s) => s.name === name);
      await this.writeSkill(def);
      console.log(chalk.green(`  ✓ ${name}`));
    }
    console.log(chalk.green(`\n✅ Installed ${names.length} global skill(s) to ~/.claude/skills/`));
    return names;
  }

  // Same as install — always regenerates and overwrites. Idempotent by design,
  // no version-diffing required for correctness.
  async update(filter) {
    const names = filter ? this.resolveNames(filter) : await this.installedNames();
    if (names.length === 0) {
      console.log(chalk.yellow('⚠️  No contextkit-managed global skills installed.'));
      return [];
    }
    for (const name of names) {
      const def = SKILLS.find((s) => s.name === name);
      if (!def) continue;
      await this.writeSkill(def);
      console.log(chalk.green(`  ✓ ${name}`));
    }
    console.log(chalk.green(`\n✅ Updated ${names.length} global skill(s)`));
    return names;
  }

  async isManaged(name) {
    const skillFile = path.join(this.targetDir, name, 'SKILL.md');
    if (!(await fs.pathExists(skillFile))) return false;
    const content = await fs.readFile(skillFile, 'utf-8');
    return /^contextkit-managed:\s*true/m.test(content);
  }

  async installedNames() {
    if (!(await fs.pathExists(this.targetDir))) return [];
    const entries = await fs.readdir(this.targetDir);
    const managed = [];
    for (const entry of entries) {
      if (await this.isManaged(entry)) managed.push(entry);
    }
    return managed;
  }

  async list() {
    const names = await this.installedNames();
    const results = [];
    for (const name of names) {
      const skillFile = path.join(this.targetDir, name, 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');
      const versionMatch = content.match(/^contextkit-version:\s*(\S+)/m);
      results.push({
        name,
        version: versionMatch ? versionMatch[1] : 'unknown',
        current: versionMatch ? versionMatch[1] === CK_VERSION : false,
      });
    }
    return results;
  }

  // Requires an explicit filter or all:true — never wipes every global skill
  // just because no scope was given.
  async uninstall(filter, { all = false } = {}) {
    if (!all && !filter) return [];
    const candidates = all ? await this.installedNames() : this.resolveNames(filter);
    const removed = [];
    for (const name of candidates) {
      if (await this.isManaged(name)) {
        await fs.remove(path.join(this.targetDir, name));
        removed.push(name);
      }
    }
    return removed;
  }
}

module.exports = GlobalSkillsManager;
module.exports.SKILLS = SKILLS;
