const chalk = require('chalk');
const fs = require('fs-extra');
const yaml = require('js-yaml');

const KNOWN_GATES = {
  'Node.js': ['typescript', 'eslint', 'prettier', 'format', 'lint', 'build', 'test', 'e2e'],
  Python: ['ruff-lint', 'typecheck', 'ruff-format', 'pytest'],
  Rust: ['cargo-check', 'clippy', 'cargo-test'],
  Go: ['go-vet', 'golangci-lint', 'go-test'],
  PHP: ['phpstan', 'phpunit'],
  Ruby: ['rubocop', 'rspec'],
  'Java / Kotlin': ['maven-verify', 'gradle-check', 'ktlint', 'kotlin-test'],
  Swift: ['swiftlint', 'swift-test'],
  '.NET': ['dotnet-build', 'dotnet-test'],
};

const ALL_GATE_KEYS = Object.values(KNOWN_GATES).flat();
const GATES_CONFIG_PATH = '.contextkit/quality-gates.yml';

class GatesCommand {
  async run(options = {}) {
    if (!(await fs.pathExists('.contextkit/config.yml'))) {
      console.log(chalk.red('ContextKit not installed. Run: ck install'));
      process.exit(1);
    }

    if (options.disable) {
      await this.disable(options.disable);
    } else if (options.enable) {
      await this.enable(options.enable);
    } else {
      await this.list();
    }
  }

  async list() {
    const disabled = await this.readDisabled();
    console.log(chalk.bold('\nQuality Gates\n'));
    for (const [stack, keys] of Object.entries(KNOWN_GATES)) {
      console.log(chalk.cyan(`  ${stack}`));
      for (const key of keys) {
        const isDisabled = disabled.includes(key);
        const status = isDisabled ? chalk.yellow('[disabled]') : chalk.green('[enabled] ');
        console.log(`    ${status}  ${key}`);
      }
    }
    console.log('');
    console.log(chalk.yellow('  To disable a gate: ck gates --disable <key>'));
    console.log(chalk.yellow('  To enable a gate:  ck gates --enable <key>'));
    console.log('');
  }

  async disable(key) {
    if (!ALL_GATE_KEYS.includes(key)) {
      this.printInvalidKey(key);
      process.exit(1);
    }
    const disabled = await this.readDisabled();
    if (disabled.includes(key)) {
      console.log(chalk.yellow(`Gate "${key}" is already disabled.`));
      return;
    }
    disabled.push(key);
    await this.writeDisabled(disabled);
    console.log(chalk.green(`✅ Gate "${key}" disabled.`));
  }

  async enable(key) {
    if (!ALL_GATE_KEYS.includes(key)) {
      this.printInvalidKey(key);
      process.exit(1);
    }
    const disabled = await this.readDisabled();
    const idx = disabled.indexOf(key);
    if (idx === -1) {
      console.log(chalk.yellow(`Gate "${key}" is already enabled.`));
      return;
    }
    disabled.splice(idx, 1);
    await this.writeDisabled(disabled);
    console.log(chalk.green(`✅ Gate "${key}" enabled.`));
  }

  async readDisabled() {
    if (!(await fs.pathExists(GATES_CONFIG_PATH))) return [];
    try {
      const content = await fs.readFile(GATES_CONFIG_PATH, 'utf-8');
      const parsed = yaml.load(content);
      return Array.isArray(parsed && parsed.disabled) ? parsed.disabled : [];
    } catch (err) {
      console.error(chalk.red('Error reading quality-gates.yml:'), err.message);
      process.exit(1);
    }
  }

  async writeDisabled(disabled) {
    if (!(await fs.pathExists(GATES_CONFIG_PATH))) {
      await fs.writeFile(GATES_CONFIG_PATH, `# Quality Gates Configuration\n\ndisabled:\n`);
    }
    const content = await fs.readFile(GATES_CONFIG_PATH, 'utf-8');
    // Replace or append the disabled block, preserving comments above it
    const withoutDisabled = content.replace(/^disabled:[\s\S]*$/m, '').trimEnd();
    const disabledBlock =
      disabled.length > 0
        ? `\ndisabled:\n${disabled.map((k) => `  - ${k}`).join('\n')}\n`
        : `\ndisabled:\n`;
    await fs.writeFile(GATES_CONFIG_PATH, withoutDisabled + disabledBlock);
  }

  printInvalidKey(key) {
    console.error(chalk.red(`Unknown gate key: "${key}"`));
    console.log(chalk.yellow('\nValid gate keys:'));
    for (const [stack, keys] of Object.entries(KNOWN_GATES)) {
      console.log(chalk.cyan(`  ${stack}: `) + keys.join(', '));
    }
  }
}

module.exports = GatesCommand;
