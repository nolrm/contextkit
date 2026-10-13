const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');
const { SKILLS } = require('../skills/registry');
const { RETIRED_SKILLS } = require('../skills/retired');
const { renderWrapper } = require('../skills/render');
const { readContextRules, ruleFiles, writeContextRules } = require('../utils/context-rules');

class CursorIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'cursor';
    this.displayName = 'Cursor';
    this.generatedFiles = [
      '.cursor/rules/contextkit-standards.mdc',
      ...ruleFiles('cursor', readContextRules()),
      '.cursor/rules/contextkit-components.mdc',
      '.cursor/rules/contextkit-api.mdc',
      ...SKILLS.map((s) => `.cursor/prompts/${s.name}.md`),
      // Portable copy — the open Agent Skills convention (per Cursor's own
      // docs, it also scans .agents/skills/, .claude/skills/, .codex/skills/
      // directly; not independently verified against a live Cursor install in
      // this repo — see CONTEXT-ENGINEERING-PLAN.md spike S2). Additive only.
      ...SKILLS.map((s) => `.agents/skills/${s.name}/SKILL.md`),
    ];
    this.bridgeFiles = [];
    this.platformDir = '.cursor/rules';
  }

  async install(force = false) {
    await super.install(force);
    await fs.ensureDir('.cursor/prompts');
    // Remove old monolithic rule file if present
    await this.removeLegacyFiles();
  }

  async removeLegacyFiles() {
    const legacyFiles = [
      '.cursor/rules/contextkit.mdc',
      '.cursor/rules/vibe-kit.mdc',
      '.cursor/rules/vibe-kit-standards.mdc',
      '.cursor/rules/vibe-kit-testing.mdc',
      '.cursor/rules/vibe-kit-components.mdc',
      '.cursor/rules/vibe-kit-api.mdc',
      // Removed in 2.0 — see lib/skills/retired.js
      ...Object.keys(RETIRED_SKILLS).map((n) => `.cursor/prompts/${n}.md`),
      ...Object.keys(RETIRED_SKILLS).map((n) => `.agents/skills/${n}`),
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
        console.log(chalk.yellow(`  Removed legacy ${file}`));
      }
    }
  }

  async generateFiles() {
    // Standards rule (always apply) — points at the canonical AGENTS.md
    const standardsRule = `---
description: ContextKit project context
alwaysApply: true
---

# ContextKit

This project's AI context lives in @AGENTS.md — read it, then @.contextkit/standards/index.md.
Topic standards load from the other \`contextkit-*\` rules when you touch matching files.
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-standards.mdc', standardsRule);

    // Path-scoped topic rules from config.yml context_rules
    await writeContextRules('cursor', readContextRules(), {
      keep: ['contextkit-standards.mdc', 'contextkit-components.mdc', 'contextkit-api.mdc'],
    });

    // Components rule
    const componentsRule = `---
description: ContextKit component standards
globs: "**/components/**"
alwaysApply: false
---

# Component Standards

Reference: @.contextkit/standards/code-style.md

## Templates

- @.contextkit/templates/component.md — Component template
- @.contextkit/templates/story.md — Story/demo template
- @.contextkit/templates/hook.md — Custom hook template

## Commands

- @.contextkit/commands/dev/create-component.md — Create component workflow
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-components.mdc', componentsRule);

    // API rule
    const apiRule = `---
description: ContextKit API and services standards
globs: "**/api/**, **/services/**"
alwaysApply: false
---

# API & Services Standards

Reference: @.contextkit/standards/architecture.md

## Templates

- @.contextkit/templates/api.md — API service template

## Commands

- @.contextkit/commands/dev/create-feature.md — Create feature workflow
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-api.mdc', apiRule);

    // Cursor prompts (.cursor/prompts/<name>.md) + portable .agents/skills/
    // copy — both rendered from the shared registry (lib/skills/registry.js)
    // instead of a hand-written subset (previously 10 of 22 skills).
    for (const skill of SKILLS) {
      await this.writeGeneratedFile(
        `.cursor/prompts/${skill.name}.md`,
        renderWrapper(skill, 'cursor')
      );
      await this.writeGeneratedFile(
        `.agents/skills/${skill.name}/SKILL.md`,
        renderWrapper(skill, 'agents')
      );
    }
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Cursor Usage:'));
    console.log('    Rules auto-load based on file context; AGENTS.md is the main context file');
    console.log('');
    console.log(chalk.dim('  Slash commands (in Cursor Chat):'));
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

module.exports = CursorIntegration;
