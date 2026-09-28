const chalk = require('chalk');
const BaseIntegration = require('./base-integration');
const { renderAgentsMd } = require('./agents-md');
const { SKILLS } = require('../skills/registry');
const { renderWrapper } = require('../skills/render');

class CodexIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'codex';
    this.displayName = 'OpenAI Codex CLI';
    this.bridgeFiles = ['AGENTS.md'];
    this.generatedFiles = [
      ...SKILLS.map((s) => `.codex/skills/${s.name}/SKILL.md`),
      // Portable copy — the open Agent Skills convention other tools (and a
      // future Codex version) scan; additive, doesn't replace .codex/skills/
      // (confirmed via a live install: Codex CLI 0.155.1 reads both).
      ...SKILLS.map((s) => `.agents/skills/${s.name}/SKILL.md`),
    ];
    this.platformDir = '.codex';
  }

  async generateFiles() {
    // Bridge file: AGENTS.md (auto-loaded by Codex) — shared with OpenCode so
    // installing one after the other doesn't overwrite the other's content.
    await this.writeBridgeFile('AGENTS.md', renderAgentsMd());

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
    console.log(chalk.dim('    $analyze       — Analyze project and generate standards'));
    console.log(chalk.dim('    $review        — Review current changes'));
    console.log(chalk.dim('    $refactor      — Refactor code structure'));
    console.log(chalk.dim('    $test          — Generate or run tests'));
    console.log(chalk.dim('    $doc           — Add documentation'));
    console.log(chalk.dim('    $doc-arch      — Architecture docs (Level 1)'));
    console.log(chalk.dim('    $doc-feature   — Feature docs (Level 2)'));
    console.log(chalk.dim('    $doc-component — Component docs (Level 3)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad pipeline:'));
    console.log(chalk.dim('    $squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    $squad-auto        — Auto-run full pipeline (recommended)'));
    console.log(chalk.dim('    $squad-go          — Extract tasks from conversation and run'));
    console.log(chalk.dim('    $squad-spec [scope] — Implement all stories in a spec scope'));
    console.log(chalk.dim('    $squad-architect / $squad-dev / $squad-test / $squad-review'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Spec pipeline:'));
    console.log(chalk.dim('    $spec [scope]      — Run spec pipeline for next or named scope'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    $ck                — Check project setup and standards status'));
    console.log(
      chalk.dim('    $compress          — Rewrite a file for density and report the diff')
    );
    console.log(chalk.dim('    $product-context   — Load architecture decisions and roadmap'));
  }
}

module.exports = CodexIntegration;
