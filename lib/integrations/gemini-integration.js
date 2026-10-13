const chalk = require('chalk');
const BaseIntegration = require('./base-integration');

class GeminiIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'gemini';
    this.displayName = 'Google Gemini CLI';
    this.bridgeFiles = ['GEMINI.md'];
    this.generatedFiles = ['.gemini/settings.json'];
    this.platformDir = '.gemini';
  }

  async generateFiles() {
    // Bridge file: GEMINI.md imports the canonical AGENTS.md (Gemini CLI
    // supports @file imports) — the sentence covers older versions that don't.
    const bridgeContent = `# Project Context (ContextKit)

This project's AI context lives in \`AGENTS.md\` — read it first, then \`.contextkit/standards/index.md\`.

@AGENTS.md`;

    await this.writeBridgeFile('GEMINI.md', bridgeContent);

    // Gemini settings
    const settings = {
      description: 'ContextKit - Context Engineering',
      contextFiles: ['AGENTS.md', '.contextkit/standards/index.md'],
    };

    await this.writeGeneratedFile(
      '.gemini/settings.json',
      JSON.stringify(settings, null, 2) + '\n'
    );
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Gemini CLI Usage:'));
    console.log('    GEMINI.md is auto-loaded by Gemini CLI');
    console.log('    Just run: gemini "create a button component"');
    console.log('    GEMINI.md imports AGENTS.md, the main context file');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    GEMINI.md (bridge - auto-loaded)'));
    console.log(chalk.dim('    .gemini/settings.json (configuration)'));
  }
}

module.exports = GeminiIntegration;
