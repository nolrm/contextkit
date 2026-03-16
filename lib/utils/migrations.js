const chalk = require('chalk');
const fs = require('fs-extra');

// Increment this when a new migration step is added.
const CURRENT_FORMAT_VERSION = 1;

class MigrationRunner {
  /**
   * Run all pending migrations from currentVersion up to CURRENT_FORMAT_VERSION.
   * @param {number|undefined} currentVersion - parsed from config.yml format_version field
   * @param {string} configPath - path to config.yml
   */
  async run(currentVersion, configPath) {
    const from = currentVersion === undefined || currentVersion === null ? 0 : currentVersion;

    if (from > CURRENT_FORMAT_VERSION) {
      console.log(
        chalk.yellow(
          `⚠️  .contextkit/ format version (${from}) is newer than this version of ContextKit (${CURRENT_FORMAT_VERSION}). Skipping migration.`
        )
      );
      return;
    }

    if (from === CURRENT_FORMAT_VERSION) {
      return; // Nothing to do
    }

    for (let v = from; v < CURRENT_FORMAT_VERSION; v++) {
      const next = v + 1;
      console.log(chalk.blue(`  Migrating .contextkit/ format from v${v} to v${next}...`));

      if (v === 0) await this._migrate_0_to_1(configPath);

      console.log(chalk.green(`  ✓ Format migrated to v${next}`));
    }
  }

  // ── Migrations ──────────────────────────────────────────────────────────────

  async _migrate_0_to_1(configPath) {
    const content = await fs.readFile(configPath, 'utf8');
    if (content.includes('format_version:')) {
      // Update existing value to 1
      await fs.writeFile(configPath, content.replace(/^format_version:.*$/m, 'format_version: 1'));
    } else {
      await fs.writeFile(configPath, content.trimEnd() + '\nformat_version: 1\n');
    }
  }
}

module.exports = MigrationRunner;
