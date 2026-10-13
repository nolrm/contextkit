const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Increment this when a new migration step is added.
const CURRENT_FORMAT_VERSION = 2;

// Command files removed in 2.0 (squad, spec, and the skills folded into /ck).
const RETIRED_COMMAND_PATHS = [
  'commands/squad',
  'commands/spec',
  'commands/agents',
  'commands/dev/spec-component.md',
  'commands/dev/compress.md',
  'commands/dev/health-check.md',
];

class MigrationRunner {
  /**
   * Run all pending migrations from currentVersion up to CURRENT_FORMAT_VERSION.
   * @param {number|undefined} currentVersion - parsed from config.yml format_version field
   * @param {string} configPath - path to config.yml
   */
  async run(currentVersion, configPath) {
    const from =
      currentVersion === undefined || currentVersion === null || Number.isNaN(currentVersion)
        ? 0
        : currentVersion;

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
      if (v === 1) await this._migrate_1_to_2(configPath);

      console.log(chalk.green(`  ✓ Format migrated to v${next}`));
    }
  }

  // ── Migrations ──────────────────────────────────────────────────────────────

  async _setFormatVersion(configPath, version) {
    const content = await fs.readFile(configPath, 'utf8');
    if (/^format_version:/m.test(content)) {
      await fs.writeFile(
        configPath,
        content.replace(/^format_version:.*$/m, `format_version: ${version}`)
      );
    } else {
      await fs.writeFile(configPath, content.trimEnd() + `\nformat_version: ${version}\n`);
    }
  }

  async _migrate_0_to_1(configPath) {
    await this._setFormatVersion(configPath, 1);
  }

  /**
   * 2.0: squad/spec removed, AGENTS.md canonical, headline replaces
   * response_style. Mechanical only — anything needing judgment is listed in
   * .contextkit/pending-cleanup.md by `ck update` for `/ck update`.
   */
  async _migrate_1_to_2(configPath) {
    let content = await fs.readFile(configPath, 'utf8');

    // response_style → headline + diagrams_in_docs (keep the user's values)
    const block = content.match(/^response_style:[^\n]*\n((?:[ \t]+[^\n]*\n?)*)/m);
    if (block) {
      const chatOff = /^[ \t]+chat_minimal_words:\s*false/m.test(block[1]);
      const diagramsOn = /^[ \t]+diagrams_in_docs:\s*true/m.test(block[1]);
      content = content.replace(block[0], '');
      content = content.replace(/^# Response style[^\n]*\n(?=\s*\n|$)/m, '');
      if (!/^headline:/m.test(content)) {
        content =
          content.trimEnd() +
          `\n\n# Headline: short, result-first replies — always-on block in AGENTS.md/CLAUDE.md (see /headline)\nheadline: ${!chatOff}\n`;
      }
      if (!/^diagrams_in_docs:/m.test(content)) {
        content =
          content.trimEnd() +
          `\n\n# Allow Mermaid diagrams in generated docs and standards (default: arrow chains instead)\ndiagrams_in_docs: ${diagramsOn}\n`;
      }
    }

    // squad CI flag is gone (the workflow can't run without squad)
    content = content.replace(/^[ \t]+squad_ci_workflow:[^\n]*\n/m, '');

    // index.md is required from 2.0
    if (/^required:\s*\n/m.test(content) && !/standards\/index\.md/.test(content)) {
      content = content.replace(/^required:\s*\n/m, 'required:\n  - standards/index.md\n');
    }
    content = content.replace(
      'The standards-aware skill reconciles these.',
      '/ck update reconciles these.'
    );

    await fs.writeFile(configPath, content);

    // Always-loaded project index
    const contextkitDir = path.dirname(configPath);
    const indexPath = path.join(contextkitDir, 'standards', 'index.md');
    if (!(await fs.pathExists(indexPath))) {
      const { INDEX_SKELETON } = require('./standards-index');
      await fs.ensureDir(path.dirname(indexPath));
      await fs.writeFile(indexPath, INDEX_SKELETON);
    }

    // Retired command files
    for (const rel of RETIRED_COMMAND_PATHS) {
      const full = path.join(contextkitDir, rel);
      if (await fs.pathExists(full)) await fs.remove(full);
    }

    await this._setFormatVersion(configPath, 2);
  }
}

module.exports = MigrationRunner;
module.exports.CURRENT_FORMAT_VERSION = CURRENT_FORMAT_VERSION;
module.exports.RETIRED_COMMAND_PATHS = RETIRED_COMMAND_PATHS;
