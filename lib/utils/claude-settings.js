const fs = require('fs-extra');
const chalk = require('chalk');

const SETTINGS_PATH = '.claude/settings.json';

class ClaudeSettings {
  async read() {
    if (!(await fs.pathExists(SETTINGS_PATH))) return {};
    try {
      const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
      return JSON.parse(raw);
    } catch {
      console.warn(
        chalk.yellow(`  ⚠  .claude/settings.json contains invalid JSON — skipping hook merge`)
      );
      return {};
    }
  }

  async write(settings) {
    await fs.ensureDir('.claude');
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
  }

  async addPostToolUseHook(command) {
    if (!command) throw new Error('hook command is required');

    const settings = await this.read();
    settings.hooks = settings.hooks || {};

    if (!Array.isArray(settings.hooks.PostToolUse)) {
      if (settings.hooks.PostToolUse !== undefined) {
        settings.hooks._contextkit_original_invalid = settings.hooks.PostToolUse;
      }
      settings.hooks.PostToolUse = [];
    }

    settings.hooks.PostToolUse = settings.hooks.PostToolUse.filter((entry) => !entry._contextkit);

    settings.hooks.PostToolUse.push({
      matcher: 'Edit|Write',
      hooks: [{ type: 'command', command }],
      _contextkit: true,
    });

    await this.write(settings);
  }

  async removeContextKitHooks() {
    const settings = await this.read();
    if (!Array.isArray(settings.hooks?.PostToolUse)) return;

    settings.hooks.PostToolUse = settings.hooks.PostToolUse.filter((entry) => !entry._contextkit);

    if (settings.hooks.PostToolUse.length === 0) {
      delete settings.hooks.PostToolUse;
    }

    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }

    await this.write(settings);
  }
}

module.exports = ClaudeSettings;
