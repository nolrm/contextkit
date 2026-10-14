const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');

const DownloadManager = require('../utils/download');
const ProjectDetector = require('../utils/project-detector');
const GitHooksManager = require('../utils/git-hooks');
const MigrationRunner = require('../utils/migrations');
const StatusManager = require('../utils/status-manager');
const { printBanner } = require('../utils/banner');

class UpdateCommand {
  constructor() {
    this.downloadManager = new DownloadManager();
    this.projectDetector = new ProjectDetector();
    this.gitHooksManager = new GitHooksManager();
    this.statusManager = new StatusManager();
    // Pinned to the release tag, not `main` — main's file layout can change
    // between releases (files renamed/removed), which would 404 out from
    // under older, already-published CLI versions still fetching from a
    // moving branch.
    const { version } = require('../../package.json');
    this.repoUrl = `https://raw.githubusercontent.com/nolrm/contextkit/v${version}`;
  }

  async update(options = {}) {
    printBanner();
    console.log(chalk.magenta('🔄 Updating ContextKit...'));

    // Check if ContextKit is installed
    if (!(await fs.pathExists('.contextkit/config.yml'))) {
      console.log(chalk.red('❌ No ContextKit installation found in current directory'));
      console.log(chalk.yellow('💡 Run: contextkit install'));
      return;
    }

    // Check for updates
    const updateInfo = await this.checkForUpdates();
    if (!updateInfo.hasUpdate && !options.force) {
      console.log(chalk.green('✅ ContextKit is already up to date!'));
      return;
    }

    if (updateInfo.hasUpdate) {
      console.log(
        chalk.blue(`📦 Updating from ${updateInfo.currentVersion} to ${updateInfo.latestVersion}`)
      );
    }

    // Store force flag for use in downloadFiles
    this._force = options.force || false;

    // Create backup
    const backupPath = await this.createBackup();

    try {
      // Detect current configuration
      const config = await this.parseConfig();

      // Run any pending format migrations before touching files
      const migrations = new MigrationRunner();
      await migrations.run(config.format_version, '.contextkit/config.yml');
      // Re-read so format_version is current after migration
      const migratedConfig = await this.parseConfig();
      Object.assign(config, migratedConfig);

      const projectType = this.projectDetector.detectProjectType();
      const packageManager = this.projectDetector.detectPackageManager();

      // Clean up legacy pre-commit hook (replaced by pre-push only)
      const legacyPreCommit = '.contextkit/hooks/pre-commit.sh';
      if (await fs.pathExists(legacyPreCommit)) {
        await fs.remove(legacyPreCommit);
        console.log(chalk.yellow('🧹 Removed legacy pre-commit hook (replaced by pre-push)'));
      }

      // Download latest files
      await this.downloadFiles(projectType, config);

      // Remove files that were removed from CK
      await this.removeLegacyFiles();

      // Append any config settings introduced since this project's config.yml
      // was generated — never rewrites or removes what's already there.
      await this.appendMissingSettings(config);

      // Apply content fixes to generic standards/*.md sections introduced
      // since this project's last update — skips (and flags) anything the
      // user or /analyze has customized.
      // Up to the running CLI's version — it's what's applying the files
      await this.applyStandardsMigrations(
        updateInfo.currentVersion,
        require('../../package.json').version
      );

      // Update Git hooks if they were enabled
      const hookChoices = {
        prePush: config.features?.pre_push_hook || config.features?.git_hooks || false,
        commitMsg: config.features?.commit_msg_hook || config.features?.git_hooks || false,
      };
      if (hookChoices.prePush || hookChoices.commitMsg) {
        await this.gitHooksManager.installHooks(packageManager, hookChoices);
      }

      // Refresh installed platform integrations
      await this.refreshIntegrations(this._force);

      // AGENTS.md is the canonical context file — refresh it even when no
      // integration's own files were detected (e.g. OpenCode-only installs)
      if (await fs.pathExists('AGENTS.md')) {
        await require('../integrations/agents-md').writeAgentsMd();
      }

      // Headline response-style block follows config.yml `headline:`
      await this.applyHeadlineSetting();

      // Update version in config
      // The running CLI's version — its files are what was just written
      const finalVersion = require('../../package.json').version;
      await this.updateConfigVersion(finalVersion);

      // Keep status.json's version in sync too — `ck status` reads it
      // independently of config.yml, so it drifted permanently stale
      // (frozen at install-time version) without this.
      await this.statusManager.updateVersion(finalVersion);

      console.log(chalk.green('✅ ContextKit updated successfully!'));

      // Anything that needs a decision goes to pending-cleanup.md for /ck update
      await this.reportPendingCleanup();
    } catch (error) {
      console.log(chalk.red('❌ Update failed, restoring from backup...'));
      await this.restoreFromBackup(backupPath);
      throw error;
    } finally {
      // Clean up backup
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
      }
    }
  }

  async checkForUpdates() {
    const pkg = require('../../package.json');
    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://registry.npmjs.org/${pkg.name}/latest`,
        { timeout: 5000 }
      );

      const latestVersion = response.data.version;
      const currentVersion = await this.getCurrentVersion();
      const hasUpdate = this.isNewerVersion(latestVersion, currentVersion);

      return {
        hasUpdate,
        currentVersion,
        latestVersion,
      };
    } catch (error) {
      // Can't reach npm registry — skip update rather than blindly running
      return {
        hasUpdate: false,
        currentVersion: await this.getCurrentVersion(),
        latestVersion: 'unknown',
        error: error.message,
      };
    }
  }

  async getCurrentVersion() {
    try {
      const config = await this.parseConfig();
      return config.version || require('../../package.json').version;
    } catch {
      return require('../../package.json').version;
    }
  }

  isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `.contextkit-backup-${timestamp}`;

    await fs.copy('.contextkit', backupPath);
    return backupPath;
  }

  async restoreFromBackup(backupPath) {
    await fs.remove('.contextkit');
    await fs.copy(backupPath, '.contextkit');
  }

  async parseConfig() {
    const configContent = await fs.readFile('.contextkit/config.yml', 'utf8');
    const config = {};

    // Simple YAML parsing for our config format
    const lines = configContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('format_version:')) {
        config.format_version = parseInt(trimmed.split('format_version:')[1].trim(), 10);
      } else if (trimmed.startsWith('version:') && line === trimmed) {
        // Top-level `version:` only — `line === trimmed` excludes the
        // indented `_source.version` field, which tracks the CK tool
        // version rather than this project's config version.
        config.version = trimmed.split('version:')[1].trim().replace(/['"]/g, '');
      } else if (trimmed.startsWith('project_name:')) {
        config.project_name = trimmed.split('project_name:')[1].trim().replace(/['"]/g, '');
      } else if (trimmed.startsWith('project_type:')) {
        config.project_type = trimmed.split('project_type:')[1].trim().replace(/['"]/g, '');
      } else if (trimmed.startsWith('testing:')) {
        config.features = config.features || {};
        config.features.testing = trimmed.split('testing:')[1].trim() === 'true';
      } else if (trimmed.startsWith('documentation:')) {
        config.features = config.features || {};
        config.features.documentation = trimmed.split('documentation:')[1].trim() === 'true';
      } else if (trimmed.startsWith('code_review:')) {
        config.features = config.features || {};
        config.features.code_review = trimmed.split('code_review:')[1].trim() === 'true';
      } else if (trimmed.startsWith('linting:')) {
        config.features = config.features || {};
        config.features.linting = trimmed.split('linting:')[1].trim() === 'true';
      } else if (trimmed.startsWith('type_safety:')) {
        config.features = config.features || {};
        config.features.type_safety = trimmed.split('type_safety:')[1].trim() === 'true';
      } else if (trimmed.startsWith('git_hooks:')) {
        // Legacy single-flag compat
        config.features = config.features || {};
        config.features.git_hooks = trimmed.split('git_hooks:')[1].trim() === 'true';
      } else if (trimmed.startsWith('pre_push_hook:')) {
        config.features = config.features || {};
        config.features.pre_push_hook = trimmed.split('pre_push_hook:')[1].trim() === 'true';
      } else if (trimmed.startsWith('commit_msg_hook:')) {
        config.features = config.features || {};
        config.features.commit_msg_hook = trimmed.split('commit_msg_hook:')[1].trim() === 'true';
      }
    }

    return config;
  }

  // ── User-owned file download helper ────────────────────────────────────────
  // Downloads a file only if it does not already exist on disk.
  // With force=true, always downloads (overwrites). Failures are non-fatal.
  async _downloadUserOwnedFile(url, dest, force = false) {
    if (!force && (await require('fs-extra').pathExists(dest))) {
      console.log(chalk.dim(`  ⏭  ${dest} preserved (user-owned)`));
      return true;
    }
    return this._downloadOptional(url, dest);
  }

  // ── Optional file download helper ──────────────────────────────────────────
  // Downloads a file, logs a warning on failure, and returns false instead of
  // throwing. No single file failure should abort the entire update.
  async _downloadOptional(url, dest) {
    try {
      await this.downloadManager.downloadFile(url, dest);
      return true;
    } catch (error) {
      console.log(chalk.yellow(`  ⚠  Skipped ${dest} (${error.message})`));
      return false;
    }
  }

  async downloadFiles(_projectType) {
    const spinner = ora('Downloading latest files...').start();
    let skippedCount = 0;

    const dl = async (url, dest) => {
      const ok = await this._downloadOptional(url, dest);
      if (!ok) skippedCount++;
    };

    try {
      const base = this.repoUrl;

      // standards/README.md is CK-owned (attribution) — always update
      await dl(`${base}/standards/README.md`, '.contextkit/standards/README.md');

      // glossary.md is user-owned — only write if missing, never overwrite existing
      await this._downloadUserOwnedFile(
        `${base}/standards/glossary.md`,
        '.contextkit/standards/glossary.md',
        this._force
      );

      // Commands
      for (const [url, dest] of [
        [`${base}/commands/dev/analyze.md`, '.contextkit/commands/dev/analyze.md'],
        [`${base}/commands/dev/quality-check.md`, '.contextkit/commands/dev/quality-check.md'],
        [`${base}/commands/dev/create-feature.md`, '.contextkit/commands/dev/create-feature.md'],
        [`${base}/commands/dev/create-component.md`, '.contextkit/commands/dev/create-component.md'],
        [`${base}/commands/docs/doc-arch.md`, '.contextkit/commands/docs/doc-arch.md'],
        [`${base}/commands/docs/doc-feature.md`, '.contextkit/commands/docs/doc-feature.md'],
        [`${base}/commands/docs/doc-component.md`, '.contextkit/commands/docs/doc-component.md'],
        [`${base}/commands/docs/doc.md`, '.contextkit/commands/docs/doc.md'],
        [`${base}/commands/core/ck.md`, '.contextkit/commands/core/ck.md'],
        [`${base}/commands/core/learn.md`, '.contextkit/commands/core/learn.md'],
        [`${base}/commands/addons/goal.md`, '.contextkit/commands/addons/goal.md'],
        [`${base}/commands/addons/headline.md`, '.contextkit/commands/addons/headline.md'],
        [`${base}/hooks/pre-push`, '.contextkit/hooks/pre-push'],
        [`${base}/hooks/commit-msg`, '.contextkit/hooks/commit-msg'],
        [`${base}/hooks/setup-hooks.sh`, '.contextkit/hooks/setup-hooks.sh'],
        [`${base}/types/strict.tsconfig.json`, '.contextkit/types/strict.tsconfig.json'],
        [`${base}/types/global.d.ts`, '.contextkit/types/global.d.ts'],
        [`${base}/types/type-check.sh`, '.contextkit/types/type-check.sh'],
        [`${base}/types/typescript-strict.json`, '.contextkit/types/typescript-strict.json'],
        [`${base}/legacy/update.sh`, '.contextkit/scripts/update.sh'],
      ]) {
        await dl(url, dest);
      }

      // Make executables (only if present — optional files may have been skipped)
      for (const f of [
        '.contextkit/hooks/pre-push',
        '.contextkit/hooks/commit-msg',
        '.contextkit/hooks/setup-hooks.sh',
        '.contextkit/types/type-check.sh',
        '.contextkit/scripts/update.sh',
      ]) {
        if (await fs.pathExists(f)) await fs.chmod(f, '755');
      }

      if (skippedCount > 0) {
        spinner.succeed(`Files updated (${skippedCount} skipped — retry if issues persist)`);
      } else {
        spinner.succeed('Files updated successfully');
      }
    } catch (error) {
      spinner.fail('Failed to download files');
      throw error;
    }
  }

  // Diffs config.yml against the known-settings registry and appends
  // whatever top-level block or feature flag is missing, each with a
  // comment explaining what it does. Existing content is never touched —
  // this is what lets a project's own customizations survive `ck update`.
  async appendMissingSettings(config) {
    const { SETTINGS } = require('../utils/config-schema');
    const configPath = '.contextkit/config.yml';
    let content = await fs.readFile(configPath, 'utf8');
    const now = new Date().toISOString();
    const added = [];

    for (const setting of SETTINGS) {
      if (setting.detect.test(content)) continue;

      if (setting.insertInBlock) {
        const withInsertion = this._insertLineInBlock(
          content,
          setting.insertInBlock,
          setting.line()
        );
        if (withInsertion === content) continue; // target block itself absent — skip
        content = withInsertion;
      } else {
        content =
          content.trimEnd() + '\n' + setting.block({ config, now, content }).replace(/^\n?/, '\n');
      }
      added.push(setting.id);
    }

    if (added.length > 0) {
      await fs.writeFile(configPath, content);
      console.log(chalk.green(`  ➕ Added missing config setting(s): ${added.join(', ')}`));
    }
  }

  // Inserts `line` as the last entry of an existing top-level `blockKey:`
  // block, preserving indentation. Returns `content` unchanged if the block
  // itself doesn't exist yet (a whole missing block is handled elsewhere).
  _insertLineInBlock(content, blockKey, line) {
    const lines = content.split('\n');
    const headerIdx = lines.findIndex((l) => new RegExp(`^${blockKey}:\\s*$`).test(l));
    if (headerIdx === -1) return content;

    let insertIdx = headerIdx + 1;
    while (insertIdx < lines.length && /^[ \t]+\S/.test(lines[insertIdx])) insertIdx++;
    lines.splice(insertIdx, 0, line);
    return lines.join('\n');
  }

  // Applies content fixes to generic (non-/analyze-customized) sections of
  // standards/*.md files introduced between fromVersion and toVersion. These
  // files are never re-downloaded by `ck update` (see downloadFiles) since
  // /analyze customizes them per-project, so this is the only path by which a
  // wording/behaviour fix to shipped boilerplate reaches an existing install.
  // Exact-match only: a section that was hand-edited is left untouched and
  // recorded in config.yml's pending_standards_updates instead of force-applied
  // — see standards-migrations.md and /ck update.
  async applyStandardsMigrations(fromVersion, toVersion) {
    const { MIGRATIONS } = require('../utils/standards-migrations');
    const configPath = '.contextkit/config.yml';
    let configContent = await fs.readFile(configPath, 'utf8');
    let configChanged = false;

    for (const entry of MIGRATIONS) {
      const inRange =
        this.isNewerVersion(entry.version, fromVersion) &&
        !this.isNewerVersion(entry.version, toVersion);
      if (!inRange) continue;
      if (!(await fs.pathExists(entry.file))) continue;

      const fileContent = await fs.readFile(entry.file, 'utf8');
      // Already has the fix (e.g. installed after it shipped) — nothing to do.
      // An empty `to` is a removal: done once `from` is gone.
      if (entry.to ? fileContent.includes(entry.to) : !fileContent.includes(entry.from)) continue;
      if (entry.skipIfMissing && !fileContent.includes(entry.from)) continue;
      if (fileContent.includes(entry.from)) {
        await fs.writeFile(entry.file, fileContent.replace(entry.from, entry.to));
        console.log(chalk.green(`  ✏️  Updated ${entry.file} — ${entry.description}`));
      } else {
        console.log(
          chalk.yellow(
            `  ⚠️  ${entry.file} — ${entry.description} has local changes, not auto-updated (see CHANGELOG ${entry.version})`
          )
        );
        configContent = this._appendPendingStandardsUpdate(configContent, entry);
        configChanged = true;
      }
    }

    if (configChanged) {
      await fs.writeFile(configPath, configContent);
    }
  }

  // Appends `entry` to config.yml's `pending_standards_updates:` list,
  // converting the empty-array shorthand to block-list form on first use.
  // Reuses _insertLineInBlock once the block already has entries.
  _appendPendingStandardsUpdate(content, entry) {
    const entryBlock = [
      `  - file: ${entry.file}`,
      `    id: ${entry.id}`,
      `    version: "${entry.version}"`,
    ].join('\n');

    if (/^pending_standards_updates:\s*\[\]\s*$/m.test(content)) {
      return content.replace(
        /^pending_standards_updates:\s*\[\]\s*$/m,
        `pending_standards_updates:\n${entryBlock}`
      );
    }

    // appendMissingSettings (config-schema.js) always runs first and guarantees
    // this field exists, so the block header is always present here — either
    // as the `[]` shorthand above, or already in list form.
    return this._insertLineInBlock(content, 'pending_standards_updates', entryBlock);
  }

  async applyHeadlineSetting() {
    const { applyHeadlineToProject } = require('../utils/headline');
    const content = await fs.readFile('.contextkit/config.yml', 'utf8');
    const match = content.match(/^headline:\s*(true|false)/m);
    const enabled = match ? match[1] === 'true' : true;
    try {
      const changed = await applyHeadlineToProject(enabled);
      if (changed.length > 0) {
        console.log(
          chalk.green(`  ✅ Headline ${enabled ? 'on' : 'off'} → ${changed.join(', ')}`)
        );
      }
    } catch (error) {
      console.log(chalk.yellow(`  ⚠  Could not apply headline setting (${error.message})`));
    }
  }

  async reportPendingCleanup() {
    try {
      const { writeCleanupFile, CLEANUP_PATH } = require('../utils/upgrade-cleanup');
      const items = await writeCleanupFile();
      if (items.length > 0) {
        console.log('');
        console.log(chalk.yellow(`📋 ${items.length} item(s) need a decision — see ${CLEANUP_PATH}:`));
        items.forEach((item) => console.log(chalk.yellow(`   • ${item.title}`)));
        console.log(chalk.cyan('   Run /ck update in Claude Code or Codex to work through them.'));
      }
    } catch (error) {
      console.log(chalk.yellow(`  ⚠  Could not check for pending cleanup (${error.message})`));
    }
  }

  async refreshIntegrations(force = false) {
    const { getAllIntegrationNames, getIntegration } = require('../integrations');

    const refreshed = [];
    for (const name of getAllIntegrationNames()) {
      const integration = getIntegration(name);
      const result = await integration.validate();

      // Only refresh integrations that already have files installed. Shared
      // files (.agents/skills/, written by both Codex and Cursor) don't count —
      // otherwise a Codex project would get a Cursor install, and vice versa.
      if (result.present.some((f) => !f.startsWith('.agents/'))) {
        try {
          await integration.install(force);
          refreshed.push(name);
        } catch {
          // Skip failed refreshes silently
        }
      }
    }

    if (refreshed.length > 0) {
      console.log(
        chalk.green(`  ✅ Refreshed ${refreshed.length} platform integration(s): ${refreshed.join(', ')}`)
      );
    }
  }

  async removeLegacyFiles() {
    const { RETIRED_SKILLS } = require('../skills/retired');
    const { RETIRED_COMMAND_PATHS } = require('../utils/migrations');
    const retired = Object.keys(RETIRED_SKILLS);
    const legacyFiles = [
      // Removed in 2.0 — skills (every platform) and their command files
      ...retired.map((n) => `.claude/skills/${n}`),
      ...retired.map((n) => `.codex/skills/${n}`),
      ...retired.map((n) => `.agents/skills/${n}`),
      ...retired.map((n) => `.cursor/prompts/${n}.md`),
      ...RETIRED_COMMAND_PATHS.map((p) => `.contextkit/${p}`),
      '.claude/rules/contextkit-standards.md',
      // Removed in 0.14.0 — commands reorganised into dev/ squad/ docs/ agents/ subdirs
      '.contextkit/commands/analyze.md',
      '.contextkit/commands/review.md',
      '.contextkit/commands/fix.md',
      // Removed in 0.20.0 — /fix replaced by /squad for bug workflows
      '.contextkit/commands/dev/fix.md',
      '.contextkit/commands/refactor.md',
      '.contextkit/commands/run-tests.md',
      '.contextkit/commands/add-documentation.md',
      '.contextkit/commands/quality-check.md',
      // Removed — review/refactor/test/doc skills superseded by squad-review/
      // squad-test/squad-doc (pipeline steps) and doc-arch/feature/component (structured docs)
      '.contextkit/commands/dev/review.md',
      '.contextkit/commands/dev/refactor.md',
      '.contextkit/commands/dev/run-tests.md',
      '.contextkit/commands/docs/add-documentation.md',
      '.claude/skills/review',
      '.claude/skills/refactor',
      '.claude/skills/test',
      '.codex/skills/review',
      '.codex/skills/refactor',
      '.codex/skills/test',
      '.cursor/prompts/review.md',
      '.cursor/prompts/refactor.md',
      '.cursor/prompts/test.md',
      '.contextkit/commands/create-feature.md',
      '.contextkit/commands/create-component.md',
      '.contextkit/commands/spec.md',
      '.contextkit/commands/health-check.md',
      '.contextkit/commands/squad.md',
      '.contextkit/commands/squad-architect.md',
      '.contextkit/commands/squad-dev.md',
      '.contextkit/commands/squad-test.md',
      '.contextkit/commands/squad-review.md',
      '.contextkit/commands/squad-auto.md',
      '.contextkit/commands/squad-reset.md',
      '.contextkit/commands/squad-doc.md',
      '.contextkit/commands/squad-ci.md',
      '.contextkit/commands/doc-arch.md',
      '.contextkit/commands/doc-feature.md',
      '.contextkit/commands/doc-component.md',
      // Older legacy
      '.contextkit/commands/squad-peer-review.md',
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }

  async updateConfigVersion(version) {
    const configContent = await fs.readFile('.contextkit/config.yml', 'utf8');
    // Anchored to start-of-line (no leading whitespace) so this targets the
    // top-level `version:` field only, not the indented `_source.version`.
    const updatedContent = configContent.replace(
      /^version: "[^"]*"/m,
      `version: "${version}"`
    );
    await fs.writeFile('.contextkit/config.yml', updatedContent);
  }
}

async function update(options) {
  if (options && options.global) {
    const GlobalSkillsManager = require('../utils/global-skills');
    const manager = new GlobalSkillsManager();
    await manager.update();
    return;
  }
  const updater = new UpdateCommand();
  await updater.update(options);
}

module.exports = update;
