const chalk = require('chalk');
const BaseIntegration = require('./base-integration');
const { renderAgentsMd } = require('./agents-md');

class OpencodeIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'opencode';
    this.displayName = 'OpenCode';
    this.bridgeFiles = ['AGENTS.md'];
    this.generatedFiles = [];
    this.platformDir = '';
  }

  async generateFiles() {
    // Bridge file: AGENTS.md (auto-loaded by OpenCode) — shared with Codex so
    // installing one after the other doesn't overwrite the other's content.
    await this.writeBridgeFile('AGENTS.md', renderAgentsMd());
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  OpenCode Usage:'));
    console.log('    AGENTS.md is auto-loaded by OpenCode');
    console.log('    Just run: opencode "create a button component"');
    console.log('    Standards are automatically included via AGENTS.md');
    console.log('');
    console.log(chalk.dim('  Files created:'));
    console.log(chalk.dim('    AGENTS.md (bridge - auto-loaded)'));
  }
}

module.exports = OpencodeIntegration;
