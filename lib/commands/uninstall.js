const chalk = require('chalk');

const GlobalSkillsManager = require('../utils/global-skills');

async function uninstall(name, options = {}) {
  if (!options.global) {
    console.log(chalk.yellow('⚠️  Only `--global` uninstall is supported right now.'));
    console.log(
      chalk.dim('   Per-project uninstall (standards/CLAUDE.md/hooks) is not yet implemented.')
    );
    return;
  }

  const manager = new GlobalSkillsManager();

  if (!options.all && !name) {
    const installed = await manager.list();
    if (installed.length === 0) {
      console.log(chalk.dim('Nothing to remove — no contextkit-managed global skills found.'));
      return;
    }
    console.log(chalk.yellow('Specify a skill/family to remove, or pass --all:\n'));
    for (const { name: skillName, version } of installed) {
      console.log(chalk.dim(`  - ${skillName} (v${version})`));
    }
    console.log(
      chalk.dim('\nExample: ck uninstall --global goal')
    );
    console.log(chalk.dim('         ck uninstall --global --all'));
    return;
  }

  const removed = await manager.uninstall(name, { all: options.all });
  if (removed.length === 0) {
    console.log(chalk.dim('Nothing to remove.'));
    return;
  }
  for (const skillName of removed) {
    console.log(chalk.green(`  ✓ removed ${skillName}`));
  }
  console.log(chalk.green(`\n✅ Removed ${removed.length} global skill(s)`));
}

module.exports = uninstall;
