const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');
const { SKILLS } = require('../skills/registry');
const { renderWrapper } = require('../skills/render');

class CursorIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'cursor';
    this.displayName = 'Cursor';
    this.generatedFiles = [
      '.cursor/rules/contextkit-standards.mdc',
      '.cursor/rules/contextkit-testing.mdc',
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
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
        console.log(chalk.yellow(`  Removed legacy ${file}`));
      }
    }
  }

  async generateFiles() {
    // Standards rule (always apply)
    const standardsRule = `---
description: ContextKit project standards
globs: "**/*.{ts,tsx,js,jsx,py,rs,go}"
alwaysApply: true
---

# ContextKit Standards

This project uses ContextKit for structured development standards.

## References

- @.contextkit/standards/code-style.md — Coding conventions
- @.contextkit/standards/architecture.md — Architecture patterns
- @.contextkit/standards/ai-guidelines.md — AI behavior rules
- @.contextkit/standards/glossary.md — Project terminology
- @.contextkit/product/mission-lite.md — Product context

## Workflow

1. Check standards before generating code
2. Follow project patterns and conventions
3. Include proper testing (numbered test cases)
4. Ensure type safety
5. Run quality checks
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-standards.mdc', standardsRule);

    // Testing rule (scoped to test files)
    const testingRule = `---
description: ContextKit testing standards
globs: "**/*.test.*, **/*.spec.*, **/__tests__/**"
alwaysApply: false
---

# Testing Standards

Reference: @.contextkit/standards/testing.md

## Required Pattern: Numbered Test Cases

All test cases MUST use numbered descriptions:

\`\`\`typescript
describe("ComponentName", () => {
  it("1. renders basic component", () => { /* ... */ });
  it("2. handles user interactions", () => { /* ... */ });
  it("3. displays correct content", () => { /* ... */ });
});
\`\`\`

## Templates

- @.contextkit/templates/test.md — Test template
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-testing.mdc', testingRule);

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
- @.contextkit/commands/dev/spec-component.md — Write a component spec before coding
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
    console.log('    Rules auto-load based on file context');
    console.log('');
    console.log(chalk.dim('  Slash commands (in Cursor Chat):'));
    console.log(chalk.dim('    /analyze  — Analyze project and generate standards'));
    console.log(chalk.dim('    /spec     — Turn a product overview into a project spec'));
    console.log(chalk.dim('    /spec-component — Write a component spec before coding'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad (multi-agent workflow):'));
    console.log(chalk.dim('    /squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    /squad-architect   — Design the implementation plan'));
    console.log(chalk.dim('    /squad-dev         — Implement the code'));
    console.log(chalk.dim('    /squad-test        — Write and run tests'));
    console.log(chalk.dim('    /squad-review      — Review and write verdict'));
    console.log(chalk.dim('    /squad-auto        — Auto-run full pipeline (recommended)'));
    console.log(chalk.dim('    /squad-go / /squad-spec / /squad-doc / /squad-reset'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Docs & health check:'));
    console.log(chalk.dim('    /doc-arch / /doc-feature / /doc-component'));
    console.log(chalk.dim('    /ck           — Check project setup and standards status'));
  }
}

module.exports = CursorIntegration;
