const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');
const { renderAgentsMd } = require('./agents-md');
const { readContextRules, ruleFiles, writeContextRules } = require('../utils/context-rules');

class CopilotIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'copilot';
    this.displayName = 'GitHub Copilot';
    this.bridgeFiles = ['.github/copilot-instructions.md'];
    this.generatedFiles = ruleFiles('copilot', readContextRules());
    this.platformDir = '.github';
  }

  async generateFiles() {
    // Bridge file: same canonical body as AGENTS.md — Copilot Chat loads this
    // file automatically, and not every Copilot surface reads AGENTS.md.
    await this.writeBridgeFile('.github/copilot-instructions.md', renderAgentsMd());

    // Path-scoped topic rules (.github/instructions/*.instructions.md, applyTo)
    await writeContextRules('copilot', readContextRules());

    // Merge VS Code settings for copilot
    await this.mergeVSCodeSettings();
  }

  async mergeVSCodeSettings() {
    const settingsPath = '.vscode/settings.json';
    let settings = {};

    await fs.ensureDir('.vscode');

    if (await fs.pathExists(settingsPath)) {
      try {
        settings = await fs.readJson(settingsPath);
      } catch {
        settings = {};
      }
    }

    // Add copilot instruction reference
    settings['github.copilot.chat.codeGeneration.instructions'] = [
      { file: '.github/copilot-instructions.md' },
    ];
    settings['contextKit.standardsPath'] = '.contextkit/standards';
    settings['contextKit.templatesPath'] = '.contextkit/templates';

    await fs.writeJson(settingsPath, settings, { spaces: 2 });
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  GitHub Copilot Usage:'));
    console.log('    .github/copilot-instructions.md is auto-loaded by Copilot Chat');
    console.log('    In Copilot Chat: @.contextkit Create a button component');
    console.log('    Or: @.contextkit/standards Create a login form');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    .github/copilot-instructions.md (auto-loaded)'));
    console.log(chalk.dim('    .vscode/settings.json (updated with copilot config)'));
  }
}

module.exports = CopilotIntegration;
