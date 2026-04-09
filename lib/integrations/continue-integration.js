const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');

class ContinueIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'continue';
    this.displayName = 'Continue';
    this.generatedFiles = ['.continue/rules/contextkit-standards.md', '.continue/config.yaml'];
    this.bridgeFiles = [];
    this.platformDir = '.continue/rules';
  }

  async install(force = false) {
    await super.install(force);
    // Remove old vibe-kit-named files
    const legacyFile = '.continue/rules/vibe-kit-standards.md';
    if (await fs.pathExists(legacyFile)) {
      await fs.remove(legacyFile);
    }
  }

  async generateFiles() {
    // Rule file with frontmatter
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

## Commands

- \`.contextkit/commands/analyze.md\` — Analyze and customize standards
- \`.contextkit/commands/create-component.md\` — Create components
- \`.contextkit/commands/create-feature.md\` — Create features
- \`.contextkit/commands/run-tests.md\` — Run tests
- \`.contextkit/commands/quality-check.md\` — Quality checks
`;
    await this.writeGeneratedFile('.continue/rules/contextkit-standards.md', standardsRule);

    // config.yaml (new YAML format)
    const configYaml = `# Continue Configuration (ContextKit)
# See: https://docs.continue.dev/reference

name: ContextKit Standards

rules:
  - rules/contextkit-standards.md

context:
  - provider: file
    params:
      files:
        - .contextkit/standards/code-style.md
        - .contextkit/standards/testing.md
        - .contextkit/standards/architecture.md
        - .contextkit/standards/ai-guidelines.md
        - .contextkit/standards/glossary.md
        - .contextkit/product/mission-lite.md
`;

    // Only write config.yaml if neither config.yaml nor config.json exists
    if (
      !(await fs.pathExists('.continue/config.yaml')) &&
      !(await fs.pathExists('.continue/config.json'))
    ) {
      await this.writeGeneratedFile('.continue/config.yaml', configYaml);
    } else if (await fs.pathExists('.continue/config.yaml')) {
      // Update existing yaml
      await this.writeGeneratedFile('.continue/config.yaml', configYaml);
    }
    // If config.json exists, leave it alone (user may have custom config)
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Continue Usage:'));
    console.log('    Rules auto-load from .continue/rules/');
    console.log('    Continue will include ContextKit context automatically');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    .continue/rules/contextkit-standards.md (always apply)'));
    console.log(chalk.dim('    .continue/config.yaml (configuration)'));
  }
}

module.exports = ContinueIntegration;
