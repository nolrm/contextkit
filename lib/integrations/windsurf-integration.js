const chalk = require('chalk');
const BaseIntegration = require('./base-integration');
const { renderAgentsMd } = require('./agents-md');

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
    // Bridge file: same canonical body as AGENTS.md
    await this.writeBridgeFile('.windsurfrules', renderAgentsMd());

    // Modular rules file
    const standardsRule = `---
description: ContextKit project context
alwaysApply: true
---

# ContextKit

This project's AI context lives in \`AGENTS.md\` (mirrored in \`.windsurfrules\`).
Read \`.contextkit/standards/index.md\` first; it says which topic files to read for each kind of change.
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
