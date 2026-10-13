const chalk = require('chalk');
const BaseIntegration = require('./base-integration');
const { SKILLS } = require('../skills/registry');
const { RETIRED_SKILLS } = require('../skills/retired');
const { renderWrapper } = require('../skills/render');
const { readContextRules, ruleFiles, writeContextRules } = require('../utils/context-rules');

class ClaudeIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'claude';
    this.displayName = 'Claude Code';
    this.bridgeFiles = ['CLAUDE.md'];
    this.generatedFiles = [
      ...ruleFiles('claude', readContextRules()),
      ...SKILLS.map((s) => `.claude/skills/${s.name}/SKILL.md`),
    ];
    this.platformDir = '.claude/rules';
  }

  async install(force = false) {
    await super.install(force);
    const fs = require('fs-extra');
    await fs.ensureDir('.claude/skills');
    await this.addToGitignore('.claude/settings.local.json');
    await this.removeLegacyFiles();
  }

  async addToGitignore(entry) {
    const fs = require('fs-extra');
    if (!fs.existsSync('.gitignore')) return;
    const content = await fs.readFile('.gitignore', 'utf-8');
    if (content.includes(entry)) return;
    const separator = content.endsWith('\n') ? '' : '\n';
    await fs.appendFile('.gitignore', `${separator}${entry}\n`);
  }

  async removeLegacyFiles() {
    const fs = require('fs-extra');
    const legacyFiles = [
      '.claude/rules/vibe-kit-standards.md',
      '.claude/rules/vibe-kit-testing.md',
      '.claude/rules/vibe-kit-code-style.md',
      // 2.0: CLAUDE.md imports AGENTS.md, so the always-on pointer rule is redundant
      '.claude/rules/contextkit-standards.md',
      '.claude/commands/squad-batch.md',
      '.claude/commands/squad-peer-review.md',
      // Migrated to .claude/skills/ in 0.15.0
      ...[...Object.keys(RETIRED_SKILLS), 'doc', 'ck'].map((n) => `.claude/commands/${n}.md`),
      // Removed in 2.0 — see lib/skills/retired.js
      ...Object.keys(RETIRED_SKILLS).map((n) => `.claude/skills/${n}`),
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }

  async generateFiles() {
    const { version } = require('../../package.json');

    // Bridge file: CLAUDE.md imports the canonical AGENTS.md and the project
    // index. Claude Code only reads AGENTS.md on its own when there's no
    // CLAUDE.md, so the import is what keeps the two in step.
    const bridgeContent = `# Project Context (ContextKit)

Version: ${version}

@AGENTS.md
@.contextkit/standards/index.md

Claude Code: skills run as \`/ck\`, \`/doc\`, \`/learn\`, \`/goal\`, \`/headline\`. Topic standards load from \`.claude/rules/\` when you touch matching files. When you need a decision, ask with \`AskUserQuestion\` — concrete options, recommended first.`;

    await this.writeBridgeFile('CLAUDE.md', bridgeContent);

    // Path-scoped rules from config.yml context_rules (`paths:` frontmatter —
    // Claude Code ignores `globs:`).
    await writeContextRules('claude', readContextRules());

    // Skills — one loop over the shared registry (lib/skills/registry.js).
    for (const skill of SKILLS) {
      await this.writeGeneratedFile(
        `.claude/skills/${skill.name}/SKILL.md`,
        renderWrapper(skill, 'claude')
      );
    }
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Claude Code Usage:'));
    console.log('    CLAUDE.md imports AGENTS.md and .contextkit/standards/index.md');
    console.log('    .claude/rules/ load when you touch matching files');
    console.log('');
    console.log(chalk.dim('  Skills:'));
    console.log(
      chalk.dim('    /ck [setup|update|tidy] — Status, write standards, finish upgrades, trim')
    );
    console.log(chalk.dim('    /doc [arch|feature|component] — Docs for the current change'));
    console.log(chalk.dim('    /learn "rule"     — Turn a correction into a project rule'));
    console.log(
      chalk.dim('    /goal "idea"      — Long task with a goal file and milestone review')
    );
    console.log(chalk.dim('    /headline [off]   — Short, result-first replies (always on)'));
  }
}

module.exports = ClaudeIntegration;
