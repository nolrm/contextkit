#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { install, update, status } = require('../lib');
const analyze = require('../lib/commands/analyze');
const ai = require('../lib/commands/ai');
const check = require('../lib/commands/check');
const note = require('../lib/commands/note');
const run = require('../lib/commands/run');
const publish = require('../lib/commands/publish');
const pull = require('../lib/commands/pull');
const dashboard = require('../lib/commands/dashboard');
const packageJson = require('../package.json');

// Set up the CLI
program
  .name('contextkit')
  .description('ContextKit - Context Engineering for AI Development')
  .version(packageJson.version, '-v, --version', 'Show version number');

// Install command
program
  .command('install [platform]')
  .description('Install ContextKit in current project')
  .option('--no-hooks', 'Skip Git hooks installation')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (platform, options) => {
    try {
      await install({ ...options, ...(platform ? { platform, fullInstall: true } : { fullInstall: true }) });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check installation status')
  .action(async () => {
    try {
      await status();
    } catch (error) {
      console.error(chalk.red('Status check failed:'), error.message);
      process.exit(1);
    }
  });

// Update command
program
  .command('update')
  .description('Update to latest version')
  .option('--force', 'Force update even if no changes')
  .action(async (options) => {
    try {
      await update(options);
    } catch (error) {
      console.error(chalk.red('Update failed:'), error.message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze project and customize ContextKit standards')
  .option('--ai <tool>', 'AI tool to use (aider, claude, gemini)')
  .option('--scope <scope>', 'Analysis scope: frontend, backend, both, or current (for monorepos)')
  .option('--package <package>', 'Analyze specific package path (e.g., apps/admin)')
  .option('--non-interactive', 'Skip interactive prompts (use defaults)')
  .action(async (options) => {
    try {
      await analyze(options);
    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error.message);
      process.exit(1);
    }
  });

// AI command with "ai" keyword
program
  .command('ai <prompt>')
  .description('Chat with AI using ContextKit context')
  .option('--ai <tool>', 'AI tool to use (aider, claude, gemini)')
  .action(async (prompt, options) => {
    try {
      await ai(prompt, options);
    } catch (error) {
      console.error(chalk.red('AI chat failed:'), error.message);
      process.exit(1);
    }
  });

// Check command
program
  .command('check')
  .description('Validate ContextKit installation and check policy compliance')
  .option('--strict', 'Treat warnings as errors')
  .option('--verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      await check(options);
    } catch (error) {
      console.error(chalk.red('Check failed:'), error.message);
      process.exit(1);
    }
  });

// Note command
program
  .command('note <message>')
  .description('Add a note to the corrections log')
  .option('--category <category>', 'Category (Rule Updates, AI Behavior, Preferences)')
  .option('--priority <priority>', 'Priority (HIGH, MEDIUM, LOW)', 'MEDIUM')
  .option('--task <task>', 'Task/feature name')
  .option('--changes <changes>', 'Changes description')
  .action(async (message, options) => {
    try {
      await note(message, options);
    } catch (error) {
      console.error(chalk.red('Note failed:'), error.message);
      process.exit(1);
    }
  });

// Run command
program
  .command('run <workflow>')
  .description('Run a workflow defined in instructions')
  .option('--interactive', 'Interactive mode (pause between steps)')
  .action(async (workflow, options) => {
    try {
      await run(workflow, options);
    } catch (error) {
      console.error(chalk.red('Workflow failed:'), error.message);
      process.exit(1);
    }
  });

// Publish command
program
  .command('publish')
  .description('Publish current ContextKit configuration to registry')
  .option('--name <name>', 'Package name (e.g., @company/react-standards)')
  .option('--version <version>', 'Version (e.g., 1.0.0)')
  .action(async (options) => {
    try {
      await publish(options);
    } catch (error) {
      console.error(chalk.red('Publish failed:'), error.message);
      process.exit(1);
    }
  });

// Pull command
program
  .command('pull <package>')
  .description('Pull ContextKit configuration from registry')
  .option('--force', 'Force overwrite existing .contextkit')
  .option('--backup', 'Backup existing .contextkit before pulling')
  .action(async (packageSpec, options) => {
    try {
      await pull(packageSpec, options);
    } catch (error) {
      console.error(chalk.red('Pull failed:'), error.message);
      process.exit(1);
    }
  });

// Dashboard command
program
  .command('dashboard')
  .description('Start observability dashboard')
  .option('--port <port>', 'Port number', '3001')
  .option('--no-server', 'Display metrics only (no web server)')
  .action(async (options) => {
    try {
      await dashboard(options);
    } catch (error) {
      console.error(chalk.red('Dashboard failed:'), error.message);
      process.exit(1);
    }
  });

// Platform-specific install commands
program
  .command('cursor')
  .description('Install Cursor integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'cursor', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('continue')
  .description('Install Continue integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'continue', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('aider')
  .description('Install Aider integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'aider', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('vscode')
  .description('Install VS Code integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'vscode', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('claude')
  .description('Install Claude CLI integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'claude', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('gemini')
  .description('Install Gemini CLI integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'gemini', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('codex')
  .description('Install Codex CLI integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'codex', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('opencode')
  .description('Install OpenCode integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'opencode', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('copilot')
  .description('Install GitHub Copilot integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'copilot', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('windsurf')
  .description('Install Windsurf integration only')
  .option('--non-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      await install({ platform: 'windsurf', ...options });
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      process.exit(1);
    }
  });

// Catch-all for unknown commands (treats them as prompts)
// This MUST be registered AFTER all commands but BEFORE parse()
program.on('command:*', function(args) {
  // The command wasn't found, treat it as a prompt
  const prompt = args.join(' ');

  if (prompt) {
    try {
      ai(prompt, {}).catch(error => {
        console.error(chalk.red('AI chat failed:'), error.message);
        process.exit(1);
      });
    } catch (error) {
      console.error(chalk.red('AI chat failed:'), error.message);
      process.exit(1);
    }
  }
});

// Parse command line arguments
program.parse();
