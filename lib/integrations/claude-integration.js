const chalk = require('chalk');
const BaseIntegration = require('./base-integration');
const { SKILLS } = require('../skills/registry');
const { renderWrapper } = require('../skills/render');

class ClaudeIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'claude';
    this.displayName = 'Claude Code';
    this.bridgeFiles = ['CLAUDE.md'];
    this.generatedFiles = [
      '.claude/rules/contextkit-standards.md',
      '.claude/rules/contextkit-testing.md',
      '.claude/rules/contextkit-code-style.md',
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
      '.claude/commands/squad-batch.md',
      '.claude/commands/squad-peer-review.md',
      // Migrated to .claude/skills/ in 0.15.0
      '.claude/commands/analyze.md',
      '.claude/commands/review.md',
      '.claude/commands/refactor.md',
      '.claude/commands/test.md',
      '.claude/commands/doc.md',
      '.claude/commands/squad.md',
      '.claude/commands/squad-architect.md',
      '.claude/commands/squad-dev.md',
      '.claude/commands/squad-test.md',
      '.claude/commands/squad-review.md',
      '.claude/commands/squad-auto.md',
      '.claude/commands/squad-reset.md',
      '.claude/commands/squad-doc.md',
      '.claude/commands/spec.md',
      '.claude/commands/ck.md',
      '.claude/commands/doc-arch.md',
      '.claude/commands/doc-feature.md',
      '.claude/commands/doc-component.md',
      '.claude/commands/agent-push-checklist.md',
      '.claude/commands/context-budget.md',
      '.claude/commands/standards-aware.md',
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }

  getStandardsBlock() {
    return `## Project Standards

The following standards are auto-loaded into context via @imports:

- @.contextkit/standards/code-style.md — Coding conventions and style rules
- @.contextkit/standards/architecture.md — Architecture decisions and patterns

Loaded on demand via skills, not always-loaded: testing.md (\`squad-test\` skill), workflows.md (\`agent-push-checklist\` skill), ai-guidelines.md and glossary.md (\`standards-aware\` skill), decisions.md and roadmap.md (\`product-context\` skill).

## Product Context

- @.contextkit/product/mission-lite.md — Product mission (condensed)

## Commands

- \`.contextkit/commands/dev/analyze.md\` — Analyze and customize standards
- \`.contextkit/commands/dev/create-component.md\` — Create components
- \`.contextkit/commands/dev/create-feature.md\` — Create features
- \`.contextkit/commands/dev/quality-check.md\` — Quality checks`;
  }

  async generateFiles() {
    const { version } = require('../../package.json');

    // Bridge file: CLAUDE.md (auto-loaded every session)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

## ContextKit
Version: ${version}

${this.getStandardsBlock()}

Corrections log (\`.contextkit/corrections.md\`) is loaded on demand via the \`standards-aware\` skill, not always-loaded.

## Quick Reference

Before writing code, check the relevant standards files above. Always follow the project's established patterns and conventions.

Chat terseness and doc diagrams are configurable per-project — see \`.contextkit/config.yml\` \`response_style\` block and \`ai-guidelines.md\` § Response Style.`;

    await this.writeBridgeFile('CLAUDE.md', bridgeContent);

    // Rule: always-apply standards pointer
    const standardsRule = `---
description: ContextKit project standards - always loaded
alwaysApply: true
---

# ContextKit Standards

This project uses ContextKit. Code style and architecture standards are auto-loaded via CLAUDE.md imports; product mission is too.

Loaded on demand via skills instead: testing conventions (\`squad-test\` skill), dev workflows (\`agent-push-checklist\` skill), AI behavior rules and project terminology (\`standards-aware\` skill), architecture decisions and roadmap (\`product-context\` skill).
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-standards.md', standardsRule);

    // Rule: testing standards (scoped to test files)
    const testingRule = `---
description: ContextKit testing standards for test files
globs:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/__tests__/**"
---

# Testing Standards

Follow the testing standards in \`.contextkit/standards/testing.md\` (also referenced by the \`squad-test\` skill).
- All test cases MUST use numbered descriptions (e.g., \`it("1. renders correctly")\`)
- Reference \`.contextkit/templates/test.md\` for test template patterns
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-testing.md', testingRule);

    // Rule: code style (scoped to source files)
    const codeStyleRule = `---
description: ContextKit code style for source files
globs:
  - "src/**"
  - "lib/**"
  - "app/**"
  - "packages/**"
---

# Code Style

Follow the code style standards auto-loaded via CLAUDE.md (from code-style.md).
- Reference \`.contextkit/templates/component.md\` for component patterns
- Reference \`.contextkit/templates/hook.md\` for custom hook patterns
- Reference \`.contextkit/templates/api.md\` for API service patterns
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-code-style.md', codeStyleRule);

    // Skills — one loop over the shared registry (lib/skills/registry.js)
    // instead of 25 hand-written blocks that could drift from each other.
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
    console.log('    CLAUDE.md is auto-loaded every session');
    console.log('    .claude/rules/ are loaded based on file context');
    console.log('');
    console.log(chalk.dim('  Slash commands:'));
    console.log(chalk.dim('    /analyze  — Analyze project and generate standards'));
    console.log(chalk.dim('    /spec-component — Write a component spec before coding'));
    console.log(chalk.dim('    /doc-arch      — Architecture docs (Level 1)'));
    console.log(chalk.dim('    /doc-feature   — Feature docs (Level 2)'));
    console.log(chalk.dim('    /doc-component — Component docs (Level 3)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad (multi-agent workflow):'));
    console.log(chalk.dim('    /squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    /squad-architect   — Design the implementation plan'));
    console.log(chalk.dim('    /squad-dev         — Implement the code'));
    console.log(chalk.dim('    /squad-test        — Write and run tests'));
    console.log(chalk.dim('    /squad-review      — Review and write verdict'));
    console.log(
      chalk.dim(
        '    /squad-go               — Extract tasks from conversation and run full pipeline',
        '    /squad-spec [scope]     — Load a spec scope and run the full pipeline for every story'
      )
    );
    console.log(chalk.dim('    /squad-auto             — Auto-run full pipeline (recommended)'));
    console.log(chalk.dim('    /squad-doc              — Document changes after review passes'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    /ck           — Check project setup and standards status'));
    console.log(chalk.dim('    /compress     — Rewrite a file for density and report the diff'));
    console.log(chalk.dim('    /product-context — Load architecture decisions and roadmap'));
  }
}

module.exports = ClaudeIntegration;
