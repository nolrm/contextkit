const { execSync } = require('child_process');
const fs = require('fs-extra');
const chalk = require('chalk');

class GitHooksManager {
  constructor() {
    this.hooksPath = '.contextkit/hooks';
  }

  async installHooks(packageManager, hookChoices = { prePush: true, commitMsg: true }) {
    console.log(chalk.yellow('🪝 Setting up Git hooks...'));

    // Check if this is a git repo
    if (!fs.existsSync('.git')) {
      console.log(chalk.yellow('⚠️  Not a git repository, skipping Git hooks setup'));
      return;
    }

    try {
      // Clean up legacy Husky directory if present
      await this.cleanupLegacyHusky();

      // Clean up legacy .git/hooks/ files from previous ContextKit versions
      await this.cleanupLegacyGitHooks();

      // Remove hooks the user didn't select
      await this.removeUnselectedHooks(hookChoices);

      // Set core.hooksPath so git uses .contextkit/hooks/ directly
      execSync(`git config core.hooksPath ${this.hooksPath}`, { stdio: 'pipe' });
      console.log(chalk.green(`✅ Git hooks path set to ${this.hooksPath}`));

      // Add prepare script to package.json for automatic setup on npm install
      await this.addPrepareScript();

      // Show non-Node setup hint if no package.json
      if (!fs.existsSync('package.json')) {
        console.log(chalk.dim('   💡 For other developers, add to your setup:'));
        console.log(chalk.dim(`      git config core.hooksPath ${this.hooksPath}`));
      }

      console.log(chalk.green('✅ Git hooks setup complete'));
    } catch (error) {
      console.log(chalk.red('❌ Git hooks setup failed:'), error.message);
      throw error;
    }
  }

  async removeUnselectedHooks(hookChoices) {
    // If user didn't select a hook, remove it from .contextkit/hooks/
    // so core.hooksPath doesn't run hooks they didn't want
    if (!hookChoices.prePush) {
      const hookPath = `${this.hooksPath}/pre-push`;
      if (fs.existsSync(hookPath)) {
        await fs.remove(hookPath);
      }
    }
    if (!hookChoices.commitMsg) {
      const hookPath = `${this.hooksPath}/commit-msg`;
      if (fs.existsSync(hookPath)) {
        await fs.remove(hookPath);
      }
    }
  }

  async addPrepareScript() {
    if (!fs.existsSync('package.json')) return;

    try {
      const pkg = await fs.readJson('package.json');
      const prepareCmd = `git config core.hooksPath ${this.hooksPath}`;

      if (!pkg.scripts) pkg.scripts = {};

      // Don't overwrite if prepare already has our command
      if (pkg.scripts.prepare && pkg.scripts.prepare.includes('core.hooksPath')) {
        return;
      }

      // Append to existing prepare script or create new one
      if (pkg.scripts.prepare) {
        pkg.scripts.prepare = `${pkg.scripts.prepare} && ${prepareCmd}`;
      } else {
        pkg.scripts.prepare = prepareCmd;
      }

      await fs.writeJson('package.json', pkg, { spaces: 2 });
      console.log(chalk.green('✅ Added prepare script to package.json'));
    } catch {
      console.log(chalk.yellow('⚠️  Could not update package.json prepare script'));
    }
  }

  async cleanupLegacyHusky() {
    if (!fs.existsSync('.husky')) return;

    // Check if the .husky dir contains ContextKit/Vibe Kit markers
    const huskyHooks = ['pre-push', 'commit-msg', 'pre-commit'];
    let hasContextKitHooks = false;

    for (const hook of huskyHooks) {
      const hookPath = `.husky/${hook}`;
      if (fs.existsSync(hookPath)) {
        const content = await fs.readFile(hookPath, 'utf8');
        if (content.includes('.contextkit/') || content.includes('.vibe-kit/')) {
          hasContextKitHooks = true;
          break;
        }
      }
    }

    if (hasContextKitHooks) {
      await fs.remove('.husky');
      console.log(chalk.yellow('🧹 Removed legacy .husky/ directory'));
      console.log(chalk.dim('   💡 You can also run: npm uninstall husky'));
    }
  }

  async cleanupLegacyGitHooks() {
    // Remove wrapper hooks from .git/hooks/ left by previous ContextKit versions
    const hooks = ['pre-push', 'commit-msg'];
    for (const hook of hooks) {
      const hookPath = `.git/hooks/${hook}`;
      if (fs.existsSync(hookPath)) {
        const content = await fs.readFile(hookPath, 'utf8');
        if (content.includes('ContextKit managed hook')) {
          await fs.remove(hookPath);
        }
      }
    }
  }

  async uninstallHooks() {
    console.log(chalk.yellow('🪝 Removing Git hooks...'));

    // Unset core.hooksPath
    try {
      execSync('git config --unset core.hooksPath', { stdio: 'pipe' });
      console.log(chalk.green('✅ Removed core.hooksPath config'));
    } catch {
      // Already unset, that's fine
    }

    // Remove prepare script from package.json
    await this.removePrepareScript();

    console.log(chalk.green('✅ Git hooks removed'));
  }

  async removePrepareScript() {
    if (!fs.existsSync('package.json')) return;

    try {
      const pkg = await fs.readJson('package.json');
      if (!pkg.scripts?.prepare) return;

      const prepareCmd = `git config core.hooksPath ${this.hooksPath}`;

      if (pkg.scripts.prepare === prepareCmd) {
        delete pkg.scripts.prepare;
      } else if (pkg.scripts.prepare.includes(prepareCmd)) {
        // Remove our command from a chained prepare script
        pkg.scripts.prepare = pkg.scripts.prepare
          .replace(` && ${prepareCmd}`, '')
          .replace(`${prepareCmd} && `, '');
      }

      await fs.writeJson('package.json', pkg, { spaces: 2 });
    } catch {
      // Best effort
    }
  }
}

module.exports = GitHooksManager;
