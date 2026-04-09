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
      // Clean up legacy Husky directory if present (only removes CK-owned husky hooks)
      await this.cleanupLegacyHusky();

      // Clean up legacy .git/hooks/ files from previous ContextKit versions
      await this.cleanupLegacyGitHooks();

      // Detect conflicting hooks manager — suggest integration instead of forcing override
      const conflict = await this.detectExistingHooksManager();
      if (conflict.detected) {
        console.log(chalk.yellow(`\n⚠️  Existing hooks manager detected: ${conflict.type}`));
        console.log(chalk.yellow(`   ${conflict.details}`));
        console.log(chalk.blue('\n💡 To use ContextKit quality gates with your existing setup:'));
        const lines = conflict.suggestion.split('\n');
        for (const line of lines) {
          console.log(chalk.dim(`   ${line}`));
        }
        console.log(chalk.dim('\n   Skipping automatic hooks setup to avoid conflicts.'));
        console.log(
          chalk.dim(
            `   To force ContextKit hooks, run: git config core.hooksPath ${this.hooksPath}`
          )
        );
        return;
      }

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

  async detectExistingHooksManager() {
    // 1. Check if core.hooksPath already points somewhere other than .contextkit/hooks
    try {
      const currentHooksPath = execSync('git config core.hooksPath', {
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();
      if (currentHooksPath && currentHooksPath !== this.hooksPath) {
        return {
          detected: true,
          type: 'core.hooksPath',
          details: `core.hooksPath is already set to "${currentHooksPath}"`,
          suggestion: `Run your existing hooks via that path, or update it manually:\n  git config core.hooksPath ${this.hooksPath}`,
        };
      }
    } catch {
      // core.hooksPath not set — no conflict
    }

    // 2. Check for Husky (.husky/ still present after legacy cleanup = user-owned)
    if (fs.existsSync('.husky')) {
      return {
        detected: true,
        type: 'husky',
        details: 'Found .husky/ directory with project hooks',
        suggestion:
          'Call ContextKit hooks from your existing Husky hooks:\n' +
          '  echo "sh .contextkit/hooks/pre-push" >> .husky/pre-push\n' +
          '  echo "sh .contextkit/hooks/commit-msg" >> .husky/commit-msg',
      };
    }

    // 3. Check for Lefthook
    if (
      fs.existsSync('.lefthook.yml') ||
      fs.existsSync('lefthook.yml') ||
      fs.existsSync('.lefthook')
    ) {
      return {
        detected: true,
        type: 'lefthook',
        details: 'Found Lefthook configuration',
        suggestion:
          'Add ContextKit quality gates to your lefthook.yml:\n' +
          '  pre-push:\n' +
          '    commands:\n' +
          '      ck-quality:\n' +
          '        run: sh .contextkit/hooks/pre-push\n' +
          '  commit-msg:\n' +
          '    commands:\n' +
          '      ck-commit:\n' +
          '        run: sh .contextkit/hooks/commit-msg {1}',
      };
    }

    // 4. Check for simple-git-hooks or husky.hooks in package.json
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        if (pkg['simple-git-hooks']) {
          return {
            detected: true,
            type: 'simple-git-hooks',
            details: 'Found simple-git-hooks configuration in package.json',
            suggestion:
              'Add ContextKit hooks to your simple-git-hooks config in package.json:\n' +
              '  "simple-git-hooks": {\n' +
              '    "pre-push": "sh .contextkit/hooks/pre-push",\n' +
              '    "commit-msg": "sh .contextkit/hooks/commit-msg $1"\n' +
              '  }',
          };
        }
        if (pkg.husky && pkg.husky.hooks) {
          return {
            detected: true,
            type: 'husky-config',
            details: 'Found husky.hooks configuration in package.json',
            suggestion:
              'Add ContextKit hooks to your husky.hooks config in package.json:\n' +
              '  "husky": { "hooks": { "pre-push": "sh .contextkit/hooks/pre-push" } }',
          };
        }
      } catch {
        // Invalid package.json — skip
      }
    }

    // 5. Check for non-CK files in .git/hooks/
    const hooksToCheck = ['pre-push', 'commit-msg', 'pre-commit'];
    for (const hook of hooksToCheck) {
      const hookPath = `.git/hooks/${hook}`;
      if (fs.existsSync(hookPath)) {
        try {
          const content = fs.readFileSync(hookPath, 'utf-8');
          if (!content.includes('ContextKit managed hook') && !content.includes('.contextkit/')) {
            return {
              detected: true,
              type: 'git-hooks',
              details: `Found existing ${hook} hook in .git/hooks/`,
              suggestion:
                `Add ContextKit quality gates to your existing .git/hooks/${hook}:\n` +
                `  sh .contextkit/hooks/${hook}`,
            };
          }
        } catch {
          // Unreadable hook file — skip
        }
      }
    }

    return { detected: false, type: null, details: null, suggestion: null };
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
