const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

const DownloadManager = require('./download');
const { version: CK_VERSION } = require('../../package.json');

const REPO_URL = 'https://raw.githubusercontent.com/nolrm/contextkit/main';

// Self-contained global skills: no ~/.contextkit/ mirror. Each entry's source
// command file is fetched and inlined directly into ~/.claude/skills/<name>/SKILL.md.
const SKILLS = [
  {
    name: 'squad',
    family: 'squad',
    source: 'commands/squad/squad.md',
    frontmatter: {
      description: 'Squad pipeline kickoff — create handoff file and write PO spec',
      'argument-hint': '\'"<task description>"\'',
      'allowed-tools': 'Read, Write, Glob, Grep',
      effort: 'normal',
    },
  },
  {
    name: 'squad-architect',
    family: 'squad',
    source: 'commands/squad/squad-architect.md',
    frontmatter: {
      description: 'Write technical implementation plan from PO spec (manual step 1/4)',
      'allowed-tools': 'Read, Write, Glob, Grep, Bash',
      effort: 'normal',
    },
  },
  {
    name: 'squad-dev',
    family: 'squad',
    source: 'commands/squad/squad-dev.md',
    frontmatter: {
      description: 'Implement code changes following architect plan (manual step 2/4)',
      'allowed-tools': 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'normal',
    },
  },
  {
    name: 'squad-test',
    family: 'squad',
    source: 'commands/squad/squad-test.md',
    frontmatter: {
      description: 'Write and run tests against acceptance criteria (manual step 3/4)',
      'allowed-tools': 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'normal',
    },
  },
  {
    name: 'squad-review',
    family: 'squad',
    source: 'commands/squad/squad-review.md',
    frontmatter: {
      description: 'Review full handoff and write pass/needs-work verdict (manual step 4/4)',
      'allowed-tools': 'Read, Write, Glob, Grep, Bash',
      effort: 'normal',
    },
  },
  {
    name: 'squad-auto',
    family: 'squad',
    source: 'commands/squad/squad-auto.md',
    frontmatter: {
      description:
        'Auto-run full squad pipeline hands-free (architect → dev → test → review → doc)',
      'allowed-tools': 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'high',
      context: 'fork',
    },
  },
  {
    name: 'squad-reset',
    family: 'squad',
    source: 'commands/squad/squad-reset.md',
    frontmatter: {
      description: 'Delete squad state to start fresh',
      'allowed-tools': 'Read, Write, Glob',
      effort: 'low',
    },
  },
  {
    name: 'squad-doc',
    family: 'squad',
    source: 'commands/squad/squad-doc.md',
    frontmatter: {
      description: 'Document changes after review passes (manual step 5/5)',
      'allowed-tools': 'Read, Edit, Write, Glob, Grep',
      effort: 'normal',
    },
  },
  {
    name: 'squad-go',
    family: 'squad',
    source: 'commands/squad/squad-go.md',
    frontmatter: {
      description:
        'Extract tasks from conversation and run the full pipeline immediately — no checkpoint pause',
      'argument-hint': '\'"<optional task override>"\'',
      'allowed-tools': 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'high',
      context: 'fork',
    },
  },
  {
    name: 'squad-spec',
    family: 'squad',
    source: 'commands/squad/squad-spec.md',
    frontmatter: {
      description:
        'Implement every story in a spec scope — loops continuously with context cleared between stories. Run /spec first to generate the scope.',
      'argument-hint': "'[scope-slug]'",
      'allowed-tools': 'Read, Edit, Write, Glob, Grep, Bash, Task',
      effort: 'high',
      context: 'fork',
    },
  },
  {
    name: 'spec',
    family: 'spec',
    source: 'commands/spec/spec.md',
    frontmatter: {
      description:
        'Turn a product overview into an implementation-ready spec — UX flows, DB schema, API contracts, and build plan',
      'argument-hint': '"[scope-name] | --redo <scope> | --reset"',
      'allowed-tools': 'Read, Write, Glob, Grep, Task',
      effort: 'high',
      context: 'fork',
    },
    // Global variant drops the ".contextkit/ must exist" hard guard — global
    // skills should work in any repo with zero local ContextKit setup.
    transform: (content) =>
      content.replace(
        /## Step 0 — Guard Check\n\nVerify `\.contextkit\/` exists in the current directory\. If not, tell the user to run `ck install` first and stop\.\n\n/,
        ''
      ),
  },
  {
    name: 'spec-component',
    family: 'spec',
    source: 'commands/dev/spec-component.md',
    frontmatter: {
      description: 'Write a component spec (MD-first) before coding begins',
      'argument-hint': '"<component or feature name>"',
      'allowed-tools': 'Read, Write, Glob, Grep',
      effort: 'normal',
    },
    // Global variant inlines the template — no external .contextkit/templates/
    // file to depend on.
    extraSource: 'templates/component-spec.md',
    transform: (content, templateContent) => {
      const withUpdatedStep = content.replace(
        'Create `<ComponentName>/<ComponentName>.md` using `.contextkit/templates/component-spec.md`',
        'Create `<ComponentName>/<ComponentName>.md` using the template below'
      );
      return `${withUpdatedStep}\n\n## Component Spec Template\n\n\`\`\`markdown\n${templateContent}\n\`\`\`\n`;
    },
  },
];

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
