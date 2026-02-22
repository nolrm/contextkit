const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');

const DownloadManager = require('../utils/download');
const ProjectDetector = require('../utils/project-detector');
const GitHooksManager = require('../utils/git-hooks');

class UpdateCommand {
  constructor() {
    this.downloadManager = new DownloadManager();
    this.projectDetector = new ProjectDetector();
    this.gitHooksManager = new GitHooksManager();
    this.repoUrl = 'https://raw.githubusercontent.com/nolrm/contextkit/main';
  }

  async update(options = {}) {
    console.log(chalk.magenta('🔄 Updating ContextKit...'));

    // Check if ContextKit is installed
    if (!await fs.pathExists('.contextkit/config.yml')) {
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
      console.log(chalk.blue(`📦 Updating from ${updateInfo.currentVersion} to ${updateInfo.latestVersion}`));
    }

    // Create backup
    const backupPath = await this.createBackup();

    try {
      // Detect current configuration
      const config = await this.parseConfig();
      const projectType = this.projectDetector.detectProjectType();
      const packageManager = this.projectDetector.detectPackageManager();

      // Clean up legacy pre-commit hook (replaced by pre-push only)
      const legacyPreCommit = '.contextkit/hooks/pre-commit.sh';
      if (await fs.pathExists(legacyPreCommit)) {
        await fs.remove(legacyPreCommit);
        console.log(chalk.yellow('🧹 Removed legacy pre-commit hook (replaced by pre-push)'));
      }

      // Download latest files
      await this.downloadFiles(projectType);

      // Restore user configuration
      await this.restoreUserConfig(config);

      // Update Git hooks if they were enabled
      const hookChoices = {
        prePush: config.features?.pre_push_hook || config.features?.git_hooks || false,
        commitMsg: config.features?.commit_msg_hook || config.features?.git_hooks || false
      };
      if (hookChoices.prePush || hookChoices.commitMsg) {
        await this.gitHooksManager.installHooks(packageManager, hookChoices);
      }

      // Refresh installed platform integrations
      await this.refreshIntegrations();

      // Update version in config
      await this.updateConfigVersion(updateInfo.latestVersion || '1.0.0');

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
    try {
      const axios = require('axios');
      const response = await axios.get('https://api.github.com/repos/nolrm/contextkit/releases/latest', {
        timeout: 5000
      });
      
      const latestVersion = response.data.tag_name.replace('v', '');
      const currentVersion = await this.getCurrentVersion();
      const hasUpdate = this.isNewerVersion(latestVersion, currentVersion);
      
      return {
        hasUpdate,
        currentVersion,
        latestVersion
      };
    } catch (error) {
      return {
        hasUpdate: true, // Assume update available if we can't check
        currentVersion: await this.getCurrentVersion(),
        latestVersion: 'latest',
        error: error.message
      };
    }
  }

  async getCurrentVersion() {
    try {
      const config = await this.parseConfig();
      return config.version || '1.0.0';
    } catch {
      return '1.0.0';
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
      if (trimmed.startsWith('version:')) {
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
      }
    }

    return config;
  }

  async downloadFiles(projectType) {
    const spinner = ora('Downloading latest files...').start();

    try {
      // Download only the real files (not skeleton files - those come from install)
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/standards/README.md`,
        '.contextkit/standards/README.md'
      );
      
      // Keep glossary updated (universal file)
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/standards/glossary.md`,
        '.contextkit/standards/glossary.md'
      );

      // Download commands
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/analyze.md`,
        '.contextkit/commands/analyze.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/review.md`,
        '.contextkit/commands/review.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/fix.md`,
        '.contextkit/commands/fix.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/refactor.md`,
        '.contextkit/commands/refactor.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/run-tests.md`,
        '.contextkit/commands/run-tests.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/add-documentation.md`,
        '.contextkit/commands/add-documentation.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/quality-check.md`,
        '.contextkit/commands/quality-check.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/create-feature.md`,
        '.contextkit/commands/create-feature.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/create-component.md`,
        '.contextkit/commands/create-component.md'
      );

      // Download squad commands
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad.md`,
        '.contextkit/commands/squad.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-architect.md`,
        '.contextkit/commands/squad-architect.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-dev.md`,
        '.contextkit/commands/squad-dev.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-test.md`,
        '.contextkit/commands/squad-test.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-review.md`,
        '.contextkit/commands/squad-review.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-batch.md`,
        '.contextkit/commands/squad-batch.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-run.md`,
        '.contextkit/commands/squad-run.md'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/commands/squad-run-agents.md`,
        '.contextkit/commands/squad-run-agents.md'
      );

      // Download hooks (pre-push and commit-msg only, no pre-commit)
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/hooks/pre-push`,
        '.contextkit/hooks/pre-push'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/hooks/commit-msg`,
        '.contextkit/hooks/commit-msg'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/hooks/setup-hooks.sh`,
        '.contextkit/hooks/setup-hooks.sh'
      );

      // Download types
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/types/strict.tsconfig.json`,
        '.contextkit/types/strict.tsconfig.json'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/types/global.d.ts`,
        '.contextkit/types/global.d.ts'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/types/type-check.sh`,
        '.contextkit/types/type-check.sh'
      );
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/types/typescript-strict.json`,
        '.contextkit/types/typescript-strict.json'
      );

      // Templates are user-owned skeleton files — not overwritten during update

      // Download scripts
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/legacy/update.sh`,
        '.contextkit/scripts/update.sh'
      );

      // Make scripts executable
      await fs.chmod('.contextkit/hooks/pre-push', '755');
      await fs.chmod('.contextkit/hooks/commit-msg', '755');
      await fs.chmod('.contextkit/hooks/setup-hooks.sh', '755');
      await fs.chmod('.contextkit/types/type-check.sh', '755');
      await fs.chmod('.contextkit/scripts/update.sh', '755');

      spinner.succeed('Files updated successfully');
    } catch (error) {
      spinner.fail('Failed to download files');
      throw error;
    }
  }

  async restoreUserConfig(config) {
    // Restore user's project-specific configuration
    const configContent = `# ContextKit Configuration
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
  analyze: "${config.commands?.analyze || '@.contextkit/commands/analyze.md'}"
  review: "${config.commands?.review || '@.contextkit/commands/review.md'}"
  fix: "${config.commands?.fix || '@.contextkit/commands/fix.md'}"
  refactor: "${config.commands?.refactor || '@.contextkit/commands/refactor.md'}"
  run_tests: "${config.commands?.run_tests || '@.contextkit/commands/run-tests.md'}"
  add_docs: "${config.commands?.add_docs || '@.contextkit/commands/add-documentation.md'}"
  quality_check: "${config.commands?.quality_check || '@.contextkit/commands/quality-check.md'}"
  create_component: "${config.commands?.create_component || '@.contextkit/commands/create-component.md'}"
  create_feature: "${config.commands?.create_feature || '@.contextkit/commands/create-feature.md'}"
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

  async updateConfigVersion(version) {
    const configContent = await fs.readFile('.contextkit/config.yml', 'utf8');
    const updatedContent = configContent.replace(
      /version: "[^"]*"/,
      `version: "${version}"`
    );
    await fs.writeFile('.contextkit/config.yml', updatedContent);
  }
}

async function update(options) {
  const updater = new UpdateCommand();
  await updater.update(options);
}

module.exports = update;
