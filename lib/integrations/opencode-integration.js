const chalk = require('chalk');
const BaseIntegration = require('./base-integration');

class OpencodeIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'opencode';
    this.displayName = 'OpenCode';
    // OpenCode reads AGENTS.md natively; BaseIntegration#install writes it.
    this.bridgeFiles = [];
    this.generatedFiles = [];
    this.platformDir = '';
  }

  async generateFiles() {}

  showUsage() {
    console.log('');
    console.log(chalk.bold('  OpenCode Usage:'));
    console.log('    AGENTS.md is auto-loaded by OpenCode');
    console.log('    Just run: opencode "create a button component"');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    AGENTS.md (auto-loaded)'));
  }
}

module.exports = OpencodeIntegration;
