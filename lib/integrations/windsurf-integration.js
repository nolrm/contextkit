const chalk = require('chalk');
const BaseIntegration = require('./base-integration');

class WindsurfIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'windsurf';
    this.displayName = 'Windsurf';
    this.bridgeFiles = ['.windsurfrules'];
    this.generatedFiles = ['.windsurf/rules/contextkit-standards.md'];
    this.platformDir = '.windsurf/rules';
  }

  async install(force = false) {
    await super.install(force);
    // Remove old vibe-kit-named files
    const fs = require('fs-extra');
    const legacyFile = '.windsurf/rules/vibe-kit-standards.md';
    if (await fs.pathExists(legacyFile)) {
      await fs.remove(legacyFile);
    }
  }

  async generateFiles() {
    // Bridge file: .windsurfrules (auto-loaded by Windsurf)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

${this.getStandardsBlock()}

## Key Rules

- Follow coding conventions in \`.contextkit/standards/code-style.md\`
- Use numbered test cases as defined in \`.contextkit/standards/testing.md\`
- Check \`.contextkit/standards/glossary.md\` for project-specific terminology
- Reference \`.contextkit/templates/\` for code generation patterns`;

    await this.writeBridgeFile('.windsurfrules', bridgeContent);

    // Modular rules file
    const standardsRule = `---
description: ContextKit project standards
alwaysApply: true
---

# ContextKit Standards

This project uses ContextKit for structured development standards.

## References

- \`.contextkit/standards/code-style.md\` — Coding conventions
- \`.contextkit/standards/testing.md\` — Testing patterns (numbered test cases required)
- \`.contextkit/standards/architecture.md\` — Architecture patterns
- \`.contextkit/standards/ai-guidelines.md\` — AI behavior rules
- \`.contextkit/standards/glossary.md\` — Project terminology
- \`.contextkit/product/mission-lite.md\` — Product context

## Templates

- \`.contextkit/templates/component.md\` — Component template
- \`.contextkit/templates/test.md\` — Test template
- \`.contextkit/templates/hook.md\` — Custom hook template
- \`.contextkit/templates/api.md\` — API service template

## Commands

- \`.contextkit/commands/analyze.md\` — Analyze and customize standards
- \`.contextkit/commands/create-component.md\` — Create components
- \`.contextkit/commands/create-feature.md\` — Create features
`;
    await this.writeGeneratedFile('.windsurf/rules/contextkit-standards.md', standardsRule);
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Windsurf Usage:'));
    console.log('    .windsurfrules is auto-loaded by Windsurf');
    console.log('    .windsurf/rules/ provides additional context');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    .windsurfrules (bridge - auto-loaded)'));
    console.log(chalk.dim('    .windsurf/rules/contextkit-standards.md (rules)'));
  }
}

module.exports = WindsurfIntegration;
