const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');
const { SKILLS } = require('../skills/registry');
const { RETIRED_SKILLS } = require('../skills/retired');
const { renderWrapper } = require('../skills/render');

class CodexIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'codex';
    this.displayName = 'OpenAI Codex CLI';
    // AGENTS.md is written by every integration (BaseIntegration#install), so
    // it isn't listed here — otherwise its presence would make every project
    // look like a Codex install and `ck update` would add Codex skills to it.
    this.bridgeFiles = [];
    this.generatedFiles = [
      ...SKILLS.map((s) => `.codex/skills/${s.name}/SKILL.md`),
      // Portable copy — the open Agent Skills convention other tools (and a
      // future Codex version) scan; additive, doesn't replace .codex/skills/
      // (confirmed via a live install: Codex CLI 0.155.1 reads both).
      ...SKILLS.map((s) => `.agents/skills/${s.name}/SKILL.md`),
    ];
    this.platformDir = '.codex';
  }

  async install(force = false) {
    await super.install(force);
    await this.removeLegacyFiles();
  }

  async removeLegacyFiles() {
    for (const name of Object.keys(RETIRED_SKILLS)) {
      for (const dir of ['.codex/skills', '.agents/skills']) {
        if (await fs.pathExists(`${dir}/${name}`)) await fs.remove(`${dir}/${name}`);
      }
    }
  }

  async generateFiles() {
    for (const skill of SKILLS) {
      await this.writeGeneratedFile(
        `.codex/skills/${skill.name}/SKILL.md`,
        renderWrapper(skill, 'codex')
      );
      await this.writeGeneratedFile(
        `.agents/skills/${skill.name}/SKILL.md`,
        renderWrapper(skill, 'agents')
      );
    }
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Codex CLI Usage:'));
    console.log('    AGENTS.md is auto-loaded every session');
    console.log('    Skills are installed in .codex/skills/');
    console.log('');
    console.log(chalk.dim('  Skills (use $skill-name in Codex):'));
    console.log(
      chalk.dim('    $ck [setup|update|tidy] — Status, write standards, finish upgrades, trim')
    );
    console.log(chalk.dim('    $doc [arch|feature|component] — Docs for the current change'));
    console.log(chalk.dim('    $learn "rule"     — Turn a correction into a project rule'));
    console.log(
      chalk.dim('    $goal "idea"      — Long task with a goal file and milestone review')
    );
    console.log(chalk.dim('    $headline [off]   — Short, result-first replies (always on)'));
  }
}

module.exports = CodexIntegration;
