const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');

class CopilotIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'copilot';
    this.displayName = 'GitHub Copilot';
    this.bridgeFiles = ['.github/copilot-instructions.md'];
    this.generatedFiles = [];
    this.platformDir = '.github';
  }

  async generateFiles() {
    // Bridge file: .github/copilot-instructions.md (auto-loaded by Copilot Chat)
    const bridgeContent = `# Copilot Instructions (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

${this.getStandardsBlock()}

## Key Rules

- Follow coding conventions in \`.contextkit/standards/code-style.md\`
- Use numbered test cases as defined in \`.contextkit/standards/testing.md\`
- Check \`.contextkit/standards/glossary.md\` for project-specific terminology
- Reference \`.contextkit/templates/\` for code generation patterns (skeleton .md files)`;

    await this.writeBridgeFile('.github/copilot-instructions.md', bridgeContent);

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
