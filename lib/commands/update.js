const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');

const DownloadManager = require('../utils/download');
const ProjectDetector = require('../utils/project-detector');
const GitHooksManager = require('../utils/git-hooks');
const MigrationRunner = require('../utils/migrations');
const { printBanner } = require('../utils/banner');

class UpdateCommand {
  constructor() {
    this.downloadManager = new DownloadManager();
    this.projectDetector = new ProjectDetector();
    this.gitHooksManager = new GitHooksManager();
    this.repoUrl = 'https://raw.githubusercontent.com/nolrm/contextkit/main';
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

      // Restore user configuration
      await this.restoreUserConfig(config);

      // Update Git hooks if they were enabled
      const hookChoices = {
        prePush: config.features?.pre_push_hook || config.features?.git_hooks || false,
        commitMsg: config.features?.commit_msg_hook || config.features?.git_hooks || false,
      };
      if (hookChoices.prePush || hookChoices.commitMsg) {
        await this.gitHooksManager.installHooks(packageManager, hookChoices);
      }

      // Refresh installed platform integrations
      await this.refreshIntegrations();

      // Update version in config
      await this.updateConfigVersion(
        updateInfo.latestVersion && updateInfo.latestVersion !== 'unknown'
          ? updateInfo.latestVersion
          : require('../../package.json').version
      );

      console.log(chalk.green('✅ ContextKit updated successfully!'));
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
      } else if (trimmed.startsWith('version:')) {
        config.version = trimmed.split('version:')[1].trim().replace(/"/g, '');
      } else if (trimmed.startsWith('project_name:')) {
        config.project_name = trimmed.split('project_name:')[1].trim().replace(/"/g, '');
      } else if (trimmed.startsWith('project_type:')) {
        config.project_type = trimmed.split('project_type:')[1].trim().replace(/"/g, '');
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
      } else if (trimmed.startsWith('squad_ci_workflow:')) {
        config.features = config.features || {};
        config.features.squad_ci_workflow =
          trimmed.split('squad_ci_workflow:')[1].trim() === 'true';
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

  async downloadFiles(projectType, config = {}) {
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
        [`${base}/commands/dev/review.md`, '.contextkit/commands/dev/review.md'],
        [`${base}/commands/dev/refactor.md`, '.contextkit/commands/dev/refactor.md'],
        [`${base}/commands/dev/run-tests.md`, '.contextkit/commands/dev/run-tests.md'],
        [`${base}/commands/docs/add-documentation.md`, '.contextkit/commands/docs/add-documentation.md'],
        [`${base}/commands/dev/quality-check.md`, '.contextkit/commands/dev/quality-check.md'],
        [`${base}/commands/dev/create-feature.md`, '.contextkit/commands/dev/create-feature.md'],
        [`${base}/commands/dev/create-component.md`, '.contextkit/commands/dev/create-component.md'],
        [`${base}/commands/dev/spec-component.md`, '.contextkit/commands/dev/spec-component.md'],
        [`${base}/commands/dev/health-check.md`, '.contextkit/commands/dev/health-check.md'],
        [`${base}/commands/squad/squad.md`, '.contextkit/commands/squad/squad.md'],
        [`${base}/commands/squad/squad-architect.md`, '.contextkit/commands/squad/squad-architect.md'],
        [`${base}/commands/squad/squad-dev.md`, '.contextkit/commands/squad/squad-dev.md'],
        [`${base}/commands/squad/squad-test.md`, '.contextkit/commands/squad/squad-test.md'],
        [`${base}/commands/squad/squad-review.md`, '.contextkit/commands/squad/squad-review.md'],
        [`${base}/commands/squad/squad-auto.md`, '.contextkit/commands/squad/squad-auto.md'],
        [`${base}/commands/squad/squad-reset.md`, '.contextkit/commands/squad/squad-reset.md'],
        [`${base}/commands/squad/squad-doc.md`, '.contextkit/commands/squad/squad-doc.md'],
        [`${base}/commands/squad/squad-ci.md`, '.contextkit/commands/squad/squad-ci.md'],
        [`${base}/commands/squad/squad-go.md`, '.contextkit/commands/squad/squad-go.md'],
        [`${base}/commands/spec/spec.md`, '.contextkit/commands/spec/spec.md'],
        [`${base}/commands/squad/squad-spec.md`, '.contextkit/commands/squad/squad-spec.md'],
        [`${base}/commands/docs/doc-arch.md`, '.contextkit/commands/docs/doc-arch.md'],
        [`${base}/commands/docs/doc-feature.md`, '.contextkit/commands/docs/doc-feature.md'],
        [`${base}/commands/docs/doc-component.md`, '.contextkit/commands/docs/doc-component.md'],
        [`${base}/commands/agents/context-budget.md`, '.contextkit/commands/agents/context-budget.md'],
        [`${base}/commands/agents/agent-push-checklist.md`, '.contextkit/commands/agents/agent-push-checklist.md'],
        [`${base}/commands/agents/standards-aware.md`, '.contextkit/commands/agents/standards-aware.md'],
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

      // Update CI squad workflow if the user opted in
      if (config.features?.squad_ci_workflow) {
        await fs.ensureDir('.github/workflows');
        await dl(
          `${base}/templates/github-actions/squad-issue.yml`,
          '.github/workflows/squad-issue.yml'
        );
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

  async restoreUserConfig(config) {
    // Restore user's project-specific configuration
    const configContent = `# ContextKit Configuration
format_version: ${config.format_version || 1}
version: "${config.version}"
project_name: "${config.project_name}"
project_type: "${config.project_type}"

# Features
features:
  testing: ${config.features?.testing || true}
  documentation: ${config.features?.documentation || true}
  code_review: ${config.features?.code_review || true}
  linting: ${config.features?.linting || true}
  type_safety: ${config.features?.type_safety || true}
  pre_push_hook: ${config.features?.pre_push_hook || config.features?.git_hooks || false}
  commit_msg_hook: ${config.features?.commit_msg_hook || config.features?.git_hooks || false}

# Paths (customize for your project)
paths:
  components: "${config.paths?.components || 'src/components'}"
  tests: "${config.paths?.tests || 'src/__tests__'}"
  stories: "${config.paths?.stories || 'src/stories'}"
  docs: "${config.paths?.docs || 'docs'}"

# Commands
commands:
  analyze: "${config.commands?.analyze || '@.contextkit/commands/dev/analyze.md'}"
  review: "${config.commands?.review || '@.contextkit/commands/dev/review.md'}"
  refactor: "${config.commands?.refactor || '@.contextkit/commands/dev/refactor.md'}"
  run_tests: "${config.commands?.run_tests || '@.contextkit/commands/dev/run-tests.md'}"
  add_docs: "${config.commands?.add_docs || '@.contextkit/commands/docs/add-documentation.md'}"
  quality_check: "${config.commands?.quality_check || '@.contextkit/commands/dev/quality-check.md'}"
  create_component: "${config.commands?.create_component || '@.contextkit/commands/dev/create-component.md'}"
  create_feature: "${config.commands?.create_feature || '@.contextkit/commands/dev/create-feature.md'}"
`;

    await fs.writeFile('.contextkit/config.yml', configContent);
  }

  async refreshIntegrations() {
    const { getAllIntegrationNames, getIntegration } = require('../integrations');

    let refreshed = 0;
    for (const name of getAllIntegrationNames()) {
      const integration = getIntegration(name);
      const result = await integration.validate();

      // Only refresh integrations that already have files installed
      if (result.present.length > 0) {
        try {
          await integration.install();
          refreshed++;
        } catch {
          // Skip failed refreshes silently
        }
      }
    }

    if (refreshed > 0) {
      console.log(chalk.green(`  ✅ Refreshed ${refreshed} platform integration(s)`));
    }
  }

  async removeLegacyFiles() {
    const legacyFiles = [
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
    const updatedContent = configContent.replace(/version: "[^"]*"/, `version: "${version}"`);
    await fs.writeFile('.contextkit/config.yml', updatedContent);
  }
}

async function update(options) {
  const updater = new UpdateCommand();
  await updater.update(options);
}

module.exports = update;
