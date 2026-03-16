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
    // Bridge file: GEMINI.md (auto-loaded by Gemini CLI)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

${this.getStandardsBlock()}

## Corrections Log

- \`.contextkit/corrections.md\` — Track AI performance improvements

## Quick Reference

Before writing code, check the relevant standards files above. Always follow the project's established patterns and conventions.`;

    await this.writeBridgeFile('GEMINI.md', bridgeContent);

    // Gemini settings
    const settings = {
      description: 'ContextKit - Context Engineering',
      contextFiles: [
        '.contextkit/standards/code-style.md',
        '.contextkit/standards/testing.md',
        '.contextkit/standards/architecture.md',
        '.contextkit/standards/ai-guidelines.md',
        '.contextkit/standards/glossary.md',
        '.contextkit/product/mission-lite.md',
      ],
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
    console.log('    Standards are automatically included via GEMINI.md');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    GEMINI.md (bridge - auto-loaded)'));
    console.log(chalk.dim('    .gemini/settings.json (configuration)'));
  }
}

module.exports = GeminiIntegration;
