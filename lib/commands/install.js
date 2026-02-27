const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const DownloadManager = require('../utils/download');
const ProjectDetector = require('../utils/project-detector');
const GitHooksManager = require('../utils/git-hooks');
const StatusManager = require('../utils/status-manager');

class InstallCommand {
  constructor() {
    this.downloadManager = new DownloadManager();
    this.projectDetector = new ProjectDetector();
    this.gitHooksManager = new GitHooksManager();
    this.statusManager = new StatusManager();
    this.repoUrl = 'https://raw.githubusercontent.com/nolrm/contextkit/main';
  }

  async install(options = {}) {
    // Migrate legacy .vibe-kit/ directory
    if (await fs.pathExists('.vibe-kit') && !await fs.pathExists('.contextkit')) {
      console.log(chalk.yellow('Found legacy .vibe-kit/ directory'));
      console.log(chalk.yellow('Renaming to .contextkit/...'));
      await fs.move('.vibe-kit', '.contextkit');
      console.log(chalk.green('✅ Migrated .vibe-kit/ → .contextkit/'));
      console.log('');
    }

    // Clean up legacy pre-commit hook (replaced by pre-push only)
    const legacyPreCommit = '.contextkit/hooks/pre-commit.sh';
    if (await fs.pathExists(legacyPreCommit)) {
      await fs.remove(legacyPreCommit);
      console.log(chalk.yellow('🧹 Removed legacy pre-commit hook (replaced by pre-push)'));
    }

    // Warn if run outside a project directory
    const hasGit = await this._findFileUpward('.git', 3);
    const hasPkg = await fs.pathExists('package.json');
    if (!hasGit && !hasPkg) {
      console.log(chalk.yellow('⚠️  No project detected (no .git or package.json found in this directory).'));
      console.log(chalk.yellow('   Make sure you are inside your project before running `ck install`.'));
      console.log('');
    }

    const requestedPlatform = options.platform;
    const isFullInstall = !!options.fullInstall;

    // Handle platform-specific installation (e.g., `ck claude`)
    if (requestedPlatform && !isFullInstall) {
      const isInstalled = await this.isAlreadyInstalled();

      if (!isInstalled) {
        console.log(chalk.red('❌ .contextkit is not installed'));
        console.log(chalk.yellow('💡 Run: contextkit install'));
        console.log(chalk.dim('   This installs the base .contextkit directory'));
        console.log(chalk.dim('   Then you can run: contextkit ' + requestedPlatform));
        return;
      }

      // .contextkit exists, just add the platform integration
      console.log(chalk.green('✓ .contextkit already exists'));
      console.log(chalk.blue(`🔧 Adding ${requestedPlatform} integration...`));
      console.log('');
      await this.installPlatformIntegration(requestedPlatform);
      return;
    }

    // Full installation
    console.log(chalk.magenta('🎵 Installing ContextKit...'));
    console.log('');

    // Detect project type
    const projectType = this.projectDetector.detectProjectType();
    const packageManager = this.projectDetector.detectPackageManager();

    console.log(chalk.green(`🧩 Detected project: ${projectType}`));
    console.log(chalk.green(`📦 Package manager: ${packageManager}`));
    console.log('');

    // Check if already installed
    if (await this.isAlreadyInstalled()) {
      const { shouldContinue } = await this.promptReinstall();
      if (!shouldContinue) {
        console.log(chalk.yellow('⏭️  Installation cancelled'));
        return;
      }
    }

    // Create directory structure
    await this.createDirectoryStructure();

    // Download files
    await this.downloadFiles(projectType, options);

    // Ask about Git hooks
    let hookChoices = { prePush: true, commitMsg: true };
    if (!options.nonInteractive && !options.noHooks) {
      hookChoices = await this.promptGitHooks();
    } else if (options.noHooks) {
      hookChoices = { prePush: false, commitMsg: false };
    }

    // Install Git hooks if requested
    if (hookChoices.prePush || hookChoices.commitMsg) {
      await this.gitHooksManager.installHooks(packageManager, hookChoices);
    }

    // Create configuration
    await this.createConfiguration(projectType, hookChoices);

    // Create status tracking
    await this.createStatusFile(projectType, packageManager, hookChoices);

    // Determine which platform to install
    let chosenPlatform = requestedPlatform || null;
    if (!chosenPlatform && !options.nonInteractive) {
      chosenPlatform = await this.promptPlatformChoice();
    }

    // Install chosen platform integration
    if (chosenPlatform) {
      await this.installPlatformIntegration(chosenPlatform);
    }

    // Success message
    this.showSuccessMessage(hookChoices, chosenPlatform, projectType, packageManager);
  }

  async installPlatformIntegration(platform) {
    try {
      const { getIntegration } = require('../integrations');
      const integration = getIntegration(platform);

      if (!integration) {
        console.log(chalk.red(`❌ Unknown platform: ${platform}`));
        console.log(chalk.yellow('💡 Available: claude, cursor, copilot, codex, opencode, gemini, aider, continue, windsurf'));
        return;
      }

      await integration.install();

      console.log('');
      console.log(chalk.green(`🎉 ${integration.displayName} integration installed!`));

      integration.showUsage();

    } catch (error) {
      console.log(chalk.red(`❌ Failed to install ${platform} integration`));
      console.log(chalk.yellow(error.message));
    }
  }

  showPlatformUsage(platform) {
    const { getIntegration } = require('../integrations');
    const integration = getIntegration(platform);
    if (integration) {
      integration.showUsage();
    }
  }

  async isAlreadyInstalled() {
    return await fs.pathExists('.contextkit/config.yml');
  }

  async promptReinstall() {
    const { shouldContinue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldContinue',
        message: 'ContextKit is already installed. Do you want to reinstall?',
        default: false
      }
    ]);
    return { shouldContinue };
  }

  async promptPlatformChoice() {
    const { platform } = await inquirer.prompt([{
      type: 'list',
      name: 'platform',
      message: 'Which AI tool are you using?',
      choices: [
        { name: 'Claude Code', value: 'claude' },
        { name: 'Cursor', value: 'cursor' },
        { name: 'Copilot (GitHub)', value: 'copilot' },
        { name: 'Codex (OpenAI)', value: 'codex' },
        { name: 'OpenCode', value: 'opencode' },
        { name: 'Gemini', value: 'gemini' },
        { name: 'Windsurf', value: 'windsurf' },
        { name: 'Aider', value: 'aider' },
        { name: 'Continue', value: 'continue' },
        { name: 'Skip (base only)', value: null },
      ]
    }]);
    return platform;
  }

  async promptGitHooks() {
    // Check for non-interactive mode
    if (process.env.CI === 'true' || process.env.NON_INTERACTIVE === 'true') {
      console.log(chalk.yellow('🤖 Non-interactive mode detected, skipping Git hooks'));
      return { prePush: false, commitMsg: false };
    }

    if (!await fs.pathExists('.git')) {
      console.log(chalk.yellow('⚠️  Skipping Git hooks setup (not a git repository)'));
      return { prePush: false, commitMsg: false };
    }

    console.log('');
    console.log('──────────────────────────────────────────────');
    console.log(chalk.blue('⚙️  Quality Gates — Git Hooks'));
    console.log('──────────────────────────────────────────────');
    console.log('');

    // Ask about pre-push hook
    console.log(chalk.bold('Pre-push Quality Gates'));
    console.log(chalk.dim('Auto-detects your framework (Node, Python, Rust, Go, etc.)'));
    console.log(chalk.dim('and runs the right checks before pushing.'));
    console.log('');
    const { prePush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'prePush',
        message: 'Enable pre-push hook? (runs quality checks before push)',
        default: false
      }
    ]);

    if (prePush) {
      console.log(chalk.green('  ✅ Pre-push hook enabled'));
    } else {
      console.log(chalk.yellow('  ⏭️  Skipping pre-push hook'));
    }
    console.log('');

    // Ask about commit-msg hook
    console.log(chalk.bold('Commit message hook'));
    console.log(chalk.dim('Enforces conventional commit format:'));
    console.log(chalk.dim('  <type>(<scope>): <description>'));
    console.log(chalk.dim('  types: feat, fix, docs, style, refactor, test, chore'));
    console.log(chalk.dim('  example: feat(auth): add login page'));
    console.log('');
    const { commitMsg } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'commitMsg',
        message: 'Enable commit-msg hook? (enforces conventional commit format)',
        default: false
      }
    ]);

    if (commitMsg) {
      console.log(chalk.green('  ✅ Commit message hook enabled'));
      console.log(chalk.blue('  💡 Commits must use: <type>(scope): description'));
    } else {
      console.log(chalk.yellow('  ⏭️  Skipping commit message hook'));
    }
    console.log('');

    if (!prePush && !commitMsg) {
      console.log(chalk.blue('💡 You can enable hooks anytime with: `ck update --hooks`'));
      console.log('');
    }

    return { prePush, commitMsg };
  }

  async createDirectoryStructure() {
    console.log(chalk.blue('📁 Creating structure...'));
    
    const directories = [
      '.contextkit/standards',
      '.contextkit/standards/code-style', // Granular code style files
      '.contextkit/product', // Product context (mission, roadmap, decisions)
      '.contextkit/instructions', // Workflow instructions
      '.contextkit/instructions/meta', // Meta instructions (pre-flight/post-flight)
      '.contextkit/instructions/core', // Core workflow instructions
      '.contextkit/hooks',
      '.contextkit/types',
      '.contextkit/commands',
      '.contextkit/templates',
      '.contextkit/scripts',
      '.contextkit/integrations',
      '.contextkit/policies' // Policy enforcement configs
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
    }

    // Platform directories are now created lazily by each integration's install()

    console.log(chalk.green('✅ .contextkit/ directory created'));
    console.log(chalk.green('✅ Standards, templates, and commands installed'));
    console.log('');
  }

  async createSkeletonStandards() {
    const skeletonFiles = {
      'standards/code-style.md': `# Code Style

<!-- Content will be generated by running: ck analyze -->

Your code style standards will be automatically generated based on your codebase patterns, conventions, and existing code.

Run \`ck analyze\` to generate this content.

## Conditional Loading

This file can be split into granular files for better organization:
- \`code-style/css-style.md\` - CSS-specific standards
- \`code-style/typescript-style.md\` - TypeScript-specific standards
- \`code-style/javascript-style.md\` - JavaScript-specific standards
- \`code-style/html-style.md\` - HTML-specific standards

Use conditional loading tags:
\`\`\`markdown
<!-- when:css -->
### CSS Conventions
[CSS-specific content]

<!-- when:typescript -->
### TypeScript Conventions
[TypeScript-specific content]
\`\`\`
`,
      
      'standards/testing.md': `# Testing Standards

<!-- Content will be generated by running: ck analyze -->

Your testing standards will be automatically generated based on your existing test patterns and testing framework.

Run \`ck analyze\` to generate this content.

## ⭐ REQUIRED: Numbered Test Cases

**All test cases MUST use numbered descriptions for easy tracking and debugging:**

\`\`\`typescript
describe("ComponentName", () => {
  it("1. renders basic component", () => {
    // test implementation
  });

  it("2. handles user interactions", () => {
    // test implementation
  });

  it("3. displays correct content", () => {
    // test implementation
  });
});
\`\`\`

**Benefits:**
- Easy identification of failing tests
- Simple reference in discussions and bug reports
- Consistent organization across all test files
- Quick debugging and maintenance
`,
      
      'standards/architecture.md': `# Architecture

<!-- Content will be generated by running: ck analyze -->

Your architecture patterns will be documented based on your project structure and organization.

Run \`ck analyze\` to generate this content.`,
      
      'standards/ai-guidelines.md': `# AI Guidelines

<!-- Content will be generated by running: ck analyze -->

Guidelines for AI assistance will be defined based on your project's needs and patterns.

Run \`ck analyze\` to generate this content.`,
      
      'standards/workflows.md': `# Workflows

<!-- Content will be generated by running: ck analyze -->

Development workflows and processes will be documented based on your project's practices.

Run \`ck analyze\` to generate this content.`
    };

    // Create granular code-style skeleton files
    const granularCodeStyleFiles = {
      'standards/code-style/css-style.md': `# CSS Style Guide

<!-- Content will be generated by running: ck analyze -->

CSS-specific coding standards will be generated based on your project's styling patterns.

Run \`ck analyze\` to generate this content.

## Conditional Loading

This file is loaded when CSS-related tasks are detected:
\`\`\`markdown
<!-- when:css -->
[CSS-specific content]
\`\`\`
`,

      'standards/code-style/typescript-style.md': `# TypeScript Style Guide

<!-- Content will be generated by running: ck analyze -->

TypeScript-specific coding standards will be generated based on your project's TypeScript patterns.

Run \`ck analyze\` to generate this content.

## Conditional Loading

This file is loaded when TypeScript-related tasks are detected:
\`\`\`markdown
<!-- when:typescript -->
[TypeScript-specific content]
\`\`\`
`,

      'standards/code-style/javascript-style.md': `# JavaScript Style Guide

<!-- Content will be generated by running: ck analyze -->

JavaScript-specific coding standards will be generated based on your project's JavaScript patterns.

Run \`ck analyze\` to generate this content.

## Conditional Loading

This file is loaded when JavaScript-related tasks are detected:
\`\`\`markdown
<!-- when:javascript -->
[JavaScript-specific content]
\`\`\`
`,

      'standards/code-style/html-style.md': `# HTML Style Guide

<!-- Content will be generated by running: ck analyze -->

HTML-specific coding standards will be generated based on your project's HTML patterns.

Run \`ck analyze\` to generate this content.

## Conditional Loading

This file is loaded when HTML-related tasks are detected:
\`\`\`markdown
<!-- when:html -->
[HTML-specific content]
\`\`\`
`
    };

    for (const [relativePath, content] of Object.entries(skeletonFiles)) {
      await fs.writeFile(`.contextkit/${relativePath}`, content);
    }

    for (const [relativePath, content] of Object.entries(granularCodeStyleFiles)) {
      await fs.writeFile(`.contextkit/${relativePath}`, content);
    }
  }

  async createSkeletonTemplates() {
    const skeletonFiles = {
      'templates/component.md': `# Component Template

<!-- Content will be generated by running: ck analyze -->

Your canonical component/module pattern will be generated based on your project's framework, language, and conventions.

Run \`ck analyze\` to generate this content, or manually add your component pattern below.
`,
      'templates/test.md': `# Test Template

<!-- Content will be generated by running: ck analyze -->

Your canonical test file pattern will be generated based on your project's testing framework and conventions.

Run \`ck analyze\` to generate this content, or manually add your test pattern below.
`,
      'templates/story.md': `# Story/Demo Template

<!-- Content will be generated by running: ck analyze -->

Your canonical story/demo pattern will be generated based on your project's documentation and showcase conventions.

Run \`ck analyze\` to generate this content, or manually add your story/demo pattern below.
`,
      'templates/hook.md': `# Hook/Composable/Helper Template

<!-- Content will be generated by running: ck analyze -->

Your canonical hook, composable, or helper pattern will be generated based on your project's framework and conventions.

Run \`ck analyze\` to generate this content, or manually add your pattern below.
`,
      'templates/api.md': `# API Service/Client Template

<!-- Content will be generated by running: ck analyze -->

Your canonical API service or client pattern will be generated based on your project's architecture and conventions.

Run \`ck analyze\` to generate this content, or manually add your API pattern below.
`
    };

    for (const [relativePath, content] of Object.entries(skeletonFiles)) {
      await fs.writeFile(`.contextkit/${relativePath}`, content);
    }
  }

  async downloadFiles(projectType, options = {}) {
    try {
      // Create skeleton standards files (will be customized by analyze)
      console.log(chalk.blue('📝 Creating skeleton standards files...'));
      await this.createSkeletonStandards();
      
      console.log(chalk.green('✅ Skeleton files created'));
      console.log(chalk.yellow('💡 Run: ck analyze to generate content based on your codebase'));
      console.log('');
      
      // Download base files
      await this.downloadManager.downloadFile(
        `${this.repoUrl}/standards/README.md`,
        '.contextkit/standards/README.md'
      );
      
      // Download the actual glossary (keep it as-is, universal across all projects)
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

      // Create skeleton template files (will be customized by analyze)
      await this.createSkeletonTemplates();

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
    } catch (error) {
      console.log(chalk.red('❌ Failed to download files'));
      throw error;
    }

    // Create new Phase 1 files (product context, corrections log, meta instructions)
    await this.createProductContext();
    await this.createCorrectionsLog();
    await this.createMetaInstructions();
    await this.createPolicyFile();
    await this.createHealthCheckCommand();

    // Install CLI helpers
    await this.installCLIHelpers();
  }

  async installCLIHelpers() {
    // Create universal context.md file that references ALL standards
    // CLI tools can read this single file to understand what context is available
    const context = `# ContextKit - Context Entry Point

**Single file to reference for ALL context:** \`.contextkit/context.md\`

This file tells you what context files are available. Cursor/VS Code auto-load all files.
For CLI tools, this is your quick reference of what standards exist.

## Quick Usage

\`\`\`bash
# Claude, Gemini, Codex
claude "read .contextkit/context.md to see available standards, then create a button"
\`\`\`

## Available Context Files

### Standards
- \`.contextkit/standards/README.md\` - Standards overview
- \`.contextkit/standards/glossary.md\` - **Project terms & shortcuts**
- \`.contextkit/standards/code-style.md\` - Coding conventions
- \`.contextkit/standards/code-style/css-style.md\` - CSS-specific standards
- \`.contextkit/standards/code-style/typescript-style.md\` - TypeScript-specific standards
- \`.contextkit/standards/testing.md\` - Test patterns
- \`.contextkit/standards/architecture.md\` - Architecture decisions
- \`.contextkit/standards/ai-guidelines.md\` - AI behavior rules
- \`.contextkit/standards/workflows.md\` - Development workflows

### Product Context
- \`.contextkit/product/mission.md\` - Product vision and purpose
- \`.contextkit/product/mission-lite.md\` - Condensed mission for AI context
- \`.contextkit/product/roadmap.md\` - Development phases and features
- \`.contextkit/product/decisions.md\` - Architecture Decision Records (ADRs)
- \`.contextkit/product/context.md\` - Domain-specific context

### Commands
- \`.contextkit/commands/analyze.md\` - Analyze & customize standards
- \`.contextkit/commands/review.md\` - Code review
- \`.contextkit/commands/fix.md\` - Diagnose and fix bugs
- \`.contextkit/commands/refactor.md\` - Refactor code structure
- \`.contextkit/commands/run-tests.md\` - Generate or run tests
- \`.contextkit/commands/add-documentation.md\` - Add documentation
- \`.contextkit/commands/quality-check.md\` - Quality checks
- \`.contextkit/commands/create-component.md\` - Create component
- \`.contextkit/commands/create-feature.md\` - Create feature

### Instructions
- \`.contextkit/instructions/meta/pre-flight.md\` - Pre-flight checks
- \`.contextkit/instructions/meta/post-flight.md\` - Post-flight verification
- \`.contextkit/instructions/core/auto-corrections-log.md\` - Auto-logging instructions

### Templates
- \`.contextkit/templates/component.md\`
- \`.contextkit/templates/test.md\`
- \`.contextkit/templates/story.md\`
- \`.contextkit/templates/hook.md\`
- \`.contextkit/templates/api.md\`

### Tracking
- \`.contextkit/corrections.md\` - AI performance corrections log

## Conditional Loading

ContextKit supports conditional loading based on task context:

\`\`\`markdown
<!-- when:react -->
### React Conventions
Components use PascalCase and named exports.

<!-- when:css -->
### CSS Conventions
Use SCSS modules with BEM naming.

<!-- context-check:general-formatting -->
IF this section already in context:
  SKIP: Re-reading
ELSE:
  READ: The following formatting rules
\`\`\`

## How to Use

**In Cursor/VS Code:** Everything auto-loads! Just work normally.

**In CLI tools (Claude, Gemini, Codex):**
\`\`\`bash
# Reference specific files you need:
claude "read .contextkit/standards/glossary.md and create a @btn for @customer login"

# Or reference multiple files:
claude "read .contextkit/standards/README.md .contextkit/standards/glossary.md and create a button"

# Include product context:
claude "read .contextkit/product/mission-lite.md .contextkit/standards/code-style.md and create a feature"
\`\`\`
`;
    
    await fs.writeFile('.contextkit/context.md', context);
    await fs.writeFile('.contextkit/CONTEXT.md', context); // Keep uppercase for backward compatibility

    // Create CLI wrapper script
    const cliScript = `#!/bin/bash
# ContextKit AI CLI wrapper
# Usage: .contextkit/scripts/ai-cli.sh "your prompt"

CONTEXT_FILE=".contextkit/context.md"
AI_TOOL="\${AI_TOOL:-aider}"
PROMPT="\$@"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "❌ ContextKit not initialized. Run: contextkit install"
  exit 1
fi

CONTEXT=\$(cat "$CONTEXT_FILE")

case "$AI_TOOL" in
  "aider")
    echo "$PROMPT" | aider
    ;;
  "claude")
    echo "$CONTEXT

User: $PROMPT" | claude
    ;;
  *)
    echo "$CONTEXT

User: $PROMPT"
    ;;
esac
`;

    await fs.writeFile('.contextkit/scripts/ai-cli.sh', cliScript);
    await fs.chmod('.contextkit/scripts/ai-cli.sh', '755');
    
    console.log(chalk.green('✅ CLI helpers installed'));
  }

  async createConfiguration(projectType, hookChoices) {
    const projectName = path.basename(process.cwd());

    const config = {
      version: '1.0.0',
      project_name: projectName,
      project_type: projectType,
      features: {
        testing: true,
        documentation: true,
        code_review: true,
        linting: true,
        type_safety: true,
        pre_push_hook: hookChoices.prePush,
        commit_msg_hook: hookChoices.commitMsg
      },
      paths: {
        components: 'src/components',
        tests: 'src/__tests__',
        stories: 'src/stories',
        docs: 'docs'
      },
      commands: {
        analyze: '@.contextkit/commands/analyze.md',
        review: '@.contextkit/commands/review.md',
        fix: '@.contextkit/commands/fix.md',
        refactor: '@.contextkit/commands/refactor.md',
        run_tests: '@.contextkit/commands/run-tests.md',
        add_docs: '@.contextkit/commands/add-documentation.md',
        quality_check: '@.contextkit/commands/quality-check.md',
        create_component: '@.contextkit/commands/create-component.md',
        create_feature: '@.contextkit/commands/create-feature.md'
      }
    };

    const now = new Date().toISOString();
    const isMonorepo = await fs.pathExists('packages') || await fs.pathExists('apps') || 
                       (await fs.pathExists('package.json') && 
                        (await fs.readJson('package.json').catch(() => ({}))).workspaces);
    
    await fs.writeFile('.contextkit/config.yml', 
      `# ContextKit Configuration
ck: 1
version: "${config.version}"
updated: "${now.split('T')[0]}"
project_name: "${config.project_name}"
project_type: "${config.project_type}"
profile: "${config.project_type}" # react, vue, node, nextjs, etc.
is_monorepo: ${isMonorepo}

# Analysis scope (for monorepos)
# Set during 'ck analyze' - tracks which packages were analyzed
analysis_scope: null  # frontend, backend, both, or current
analyzed_packages: []  # List of package paths that were analyzed

# Required standards (enforcement)
required:
  - standards/code-style.md
  - standards/testing.md

# Optional standards (warn if missing)
optional:
  - standards/architecture.md
  - standards/workflows.md
  - standards/ai-guidelines.md
  - product/mission.md

# Conditional loading rules
conditionals:
  - when: react
    load: [standards/code-style.md, standards/testing.md]
  - when: css
    load: [standards/code-style/css-style.md]
  - when: typescript
    load: [standards/code-style/typescript-style.md]

# Features
features:
  testing: ${config.features.testing}
  documentation: ${config.features.documentation}
  code_review: ${config.features.code_review}
  linting: ${config.features.linting}
  type_safety: ${config.features.type_safety}
  pre_push_hook: ${config.features.pre_push_hook}
  commit_msg_hook: ${config.features.commit_msg_hook}

# Paths (customize for your project)
paths:
  components: "${config.paths.components}"
  tests: "${config.paths.tests}"
  stories: "${config.paths.stories}"
  docs: "${config.paths.docs}"

# Commands
commands:
  create_component: "${config.commands.create_component}"
  create_feature: "${config.commands.create_feature}"
  run_tests: "${config.commands.run_tests}"
  add_docs: "${config.commands.add_docs}"
  quality_check: "${config.commands.quality_check}"
  analyze: "${config.commands.analyze}"

# Metadata for tracking
metadata:
  generated_by: contextkit@${require('../../package.json').version}
  generated_at: "${now}"
  last_analyzed: null
`
    );
  }

  async createStatusFile(projectType, packageManager, hookChoices) {
    try {
      const status = this.statusManager.getDefaultStatus();
      status.project_type = projectType;
      status.package_manager = packageManager;
      status.features.pre_push_hook = hookChoices.prePush;
      status.features.commit_msg_hook = hookChoices.commitMsg;
      
      await this.statusManager.saveStatus(status);
      console.log(chalk.green('✅ Status tracking initialized'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Warning: Could not create status file'), error.message);
    }
  }

  async createProductContext() {
    console.log(chalk.blue('📦 Creating product context files...'));
    
    const missionContent = `# Product Mission

<!-- Content will be generated by running: ck analyze or manually fill this in -->

## Pitch

[PRODUCT_NAME] is a [PRODUCT_TYPE] that helps [TARGET_USERS] [SOLVE_PROBLEM] by providing [KEY_VALUE_PROPOSITION].

## Users

### Primary Customers

- [CUSTOMER_SEGMENT_1]: [DESCRIPTION]
- [CUSTOMER_SEGMENT_2]: [DESCRIPTION]

### User Personas

**[USER_TYPE]** ([AGE_RANGE])
- **Role:** [JOB_TITLE]
- **Context:** [BUSINESS_CONTEXT]
- **Pain Points:** [PAIN_POINT_1], [PAIN_POINT_2]
- **Goals:** [GOAL_1], [GOAL_2]

## The Problem

### [PROBLEM_TITLE]

[PROBLEM_DESCRIPTION]. [QUANTIFIABLE_IMPACT].

**Our Solution:** [SOLUTION_DESCRIPTION]

## Differentiators

### [DIFFERENTIATOR_TITLE]

Unlike [COMPETITOR_OR_ALTERNATIVE], we provide [SPECIFIC_ADVANTAGE]. This results in [MEASURABLE_BENEFIT].

## Key Features

### Core Features

- **[FEATURE_NAME]:** [USER_BENEFIT_DESCRIPTION]

### Collaboration Features

- **[FEATURE_NAME]:** [USER_BENEFIT_DESCRIPTION]
`;

    const missionLiteContent = `# Product Mission (Lite)

<!-- Condensed mission for efficient AI context usage -->

[ELEVATOR_PITCH_FROM_MISSION_MD]

[1-3_SENTENCES_SUMMARIZING_VALUE_TARGET_USERS_AND_PRIMARY_DIFFERENTIATOR]

<!-- This file should be kept concise for AI context efficiency -->
`;

    const roadmapContent = `# Product Roadmap

## Current Phase: [PHASE_NAME]

### Completed Features ✅

- **[FEATURE]:** [DESCRIPTION]

### In Progress 🚧

- **[FEATURE]:** [DESCRIPTION]

### Upcoming Features 📋

- **[FEATURE]:** [DESCRIPTION]

## Technical Debt & Improvements

### High Priority 🔴

- **[ITEM]:** [DESCRIPTION]

### Medium Priority 🟡

- **[ITEM]:** [DESCRIPTION]

### Low Priority 🟢

- **[ITEM]:** [DESCRIPTION]

## Success Metrics

### Code Quality

- **Test Coverage:** Target [X]%+
- **TypeScript Coverage:** [X]% for new code
- **Linting Errors:** Zero in CI

### Performance

- **Page Load Time:** < [X] seconds
- **Bundle Size:** < [X]KB
- **Build Time:** < [X] minutes

## Future Vision

### [QUARTER/YEAR]: [THEME]

- [FEATURE_OR_GOAL]
`;

    const decisionsContent = `# Technical Decisions

<!-- Architecture Decision Records (ADRs) -->

## Architecture Decisions

### [DECISION_NAME] ([DATE])

**Decision:** [DESCRIPTION]

**Rationale:**
- [REASON_1]
- [REASON_2]

**Alternatives Considered:** [ALTERNATIVE_1], [ALTERNATIVE_2]

**Status:** ✅ Implemented | 🚧 In Progress | 📋 Planned

## Technology Decisions

### [TECHNOLOGY_CHOICE] ([DATE])

**Decision:** [DESCRIPTION]

**Rationale:**
- [REASON_1]
- [REASON_2]

**Alternatives Considered:** [ALTERNATIVE_1], [ALTERNATIVE_2]

**Status:** ✅ Implemented | 🚧 In Progress | 📋 Planned

## Code Quality Decisions

### [QUALITY_DECISION] ([DATE])

**Decision:** [DESCRIPTION]

**Rationale:**
- [REASON_1]
- [REASON_2]

**Status:** ✅ Implemented | 🚧 In Progress | 📋 Planned

## Future Decisions to Make

### [FUTURE_DECISION] ([TIMELINE])

**Decision:** [DESCRIPTION]

**Options:**
- [OPTION_1]
- [OPTION_2]

**Factors:** [CONSIDERATION_1], [CONSIDERATION_2]
`;

    const contextContent = `# Product Context

<!-- Domain-specific context for AI understanding -->

## Domain Terminology

- **[TERM]:** [DEFINITION]
- **[TERM]:** [DEFINITION]

## Business Rules

- **[RULE]:** [DESCRIPTION]
- **[RULE]:** [DESCRIPTION]

## Key Integrations

- **[INTEGRATION]:** [DESCRIPTION]
- **[INTEGRATION]:** [DESCRIPTION]

## Important Constraints

- **[CONSTRAINT]:** [DESCRIPTION]
- **[CONSTRAINT]:** [DESCRIPTION]
`;

    await fs.writeFile('.contextkit/product/mission.md', missionContent);
    await fs.writeFile('.contextkit/product/mission-lite.md', missionLiteContent);
    await fs.writeFile('.contextkit/product/roadmap.md', roadmapContent);
    await fs.writeFile('.contextkit/product/decisions.md', decisionsContent);
    await fs.writeFile('.contextkit/product/context.md', contextContent);
    
    console.log(chalk.green('✅ Product context files created'));
  }

  async createCorrectionsLog() {
    console.log(chalk.blue('📝 Creating corrections log system...'));
    
    const correctionsContent = `# ContextKit Corrections Log

## Description

This log tracks corrections and improvements to **ContextKit performance** based on real development experience. It captures patterns, preferences, and issues with the AI assistant's behavior to continuously refine the ContextKit configuration and improve development efficiency.

## Usage Instructions

### For Developers

- **Read before starting** - Check recent sessions for known ContextKit issues or preferences
- **Report ContextKit issues** - When the AI makes mistakes, doesn't follow standards, or behaves inefficiently, note them here
- **Track ContextKit patterns** - Look for recurring AI behavior issues that indicate rule updates are needed

### For AI Assistant

- **Update in real-time** - Add ContextKit performance corrections and preferences as they're discovered
- **Track frequency** - Note how often ContextKit issues occur to identify trending problems
- **Categorize properly** - Use HIGH/MEDIUM/LOW priority levels for ContextKit improvements

### Categories

- **Rule Updates**: Fixes to existing ContextKit rules and standards
- **AI Behavior**: Issues with AI assistant behavior, efficiency, or decision-making
- **Preferences**: Developer preferences for AI assistant behavior and output
- **Trend Indicators**: Patterns in AI performance that need attention (🔥 hot issues, 📈 growing patterns, ⚠️ alerts)

## Quick Stats

- **Total Sessions**: 0
- **Rule Updates**: 0
- **New Preferences**: 0
- **Trending Issues**: 0

## Recent Sessions

<!-- Add session entries here as you work -->

### YYYY-MM-DD - [Task/Feature Name]

**Changes**: [X files, Y test cases]

#### Rule Updates

- [Current Rule] → [Fixed Rule] [PRIORITY] [Frequency: Xx this week]

#### AI Behavior

- [Category] | [Issue] [PRIORITY] [Context: ...]

#### Preferences

- [Category] | [Preference] [PRIORITY] [Context: User request/Pattern observed]

#### Trend Indicators

- 🔥 [Issue]: X occurrences in Y days
- 📈 [Pattern]: X new preferences this week
- ⚠️ [Alert]: [Description]

## Cumulative Improvements

### High Priority

- [No high priority items yet]

### Medium Priority

- [No medium priority items yet]

### Low Priority

- [No low priority items yet]

## Session Template

### YYYY-MM-DD - [Task/Feature Name]

**Changes**: [X files, Y test cases]

#### Rule Updates

- [Current Rule] → [Fixed Rule] [PRIORITY] [Frequency: Xx this week]

#### AI Behavior

- [Category] | [Issue] [PRIORITY] [Context: ...]

#### Preferences

- [Category] | [Preference] [PRIORITY] [Context: User request/Pattern observed]

#### Trend Indicators

- 🔥 [Issue]: X occurrences in Y days
- 📈 [Pattern]: X new preferences this week
- ⚠️ [Alert]: [Description]

---

_This log tracks corrections and improvements to ContextKit rules based on real development experience._
`;

    const autoCorrectionsContent = `---
description: Automatic Corrections Log Updates for ContextKit Performance Tracking
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# Automatic Corrections Log Updates

## Overview

Automatically track and log ContextKit performance issues during development sessions to continuously improve AI assistant effectiveness.

## Automatic Triggers

### During Development Sessions

**Standards Violations** - Automatically log when:

- AI doesn't follow ContextKit testing standards initially
- AI doesn't apply coding standards without prompting
- AI misses established patterns or conventions

**Inefficient Behavior** - Automatically log when:

- AI requires multiple iterations for simple tasks
- AI needs user guidance on basic concepts
- AI makes repeated mistakes in the same session

**Positive Behaviors** - Automatically log when:

- AI proactively applies ContextKit standards
- AI correctly identifies issues or patterns
- AI solves problems efficiently on first attempt

### Update Process

1. **Session Review**: At the end of each development session, review for ContextKit performance patterns
2. **Automatic Logging**: Update \`.contextkit/corrections.md\` without prompting
3. **Categorization**: Classify issues as Rule Updates, AI Behavior, or Preferences
4. **Trend Tracking**: Note frequency and patterns for continuous improvement

### Implementation

- **No User Prompt Required**: This happens automatically as part of the workflow
- **Real-time Updates**: Log issues as they're discovered during development
- **Pattern Recognition**: Track recurring issues to identify systemic problems
- **Positive Reinforcement**: Document good behaviors to reinforce them

## Example Automatic Updates

### Standards Violation

\`\`\`
- Testing | AI didn't follow ContextKit testing standards initially [HIGH]
  [Context: Had to correct AI to use numbered test cases]
\`\`\`

### Inefficient Behavior

\`\`\`
- TypeScript | AI needed multiple iterations to fix type errors [MEDIUM]
  [Context: Required guidance on enum types and const assertions]
\`\`\`

### Positive Behavior

\`\`\`
- Testing | AI correctly identified potential bug during testing [LOW]
  [Context: Good behavior - documented finding]
\`\`\`

## Benefits

- **Continuous Improvement**: Automatically identify and fix ContextKit performance issues
- **No Manual Overhead**: Eliminates need for user prompts to track issues
- **Pattern Recognition**: Build up data on recurring problems
- **Standards Enforcement**: Ensure ContextKit standards are consistently applied
`;

    await fs.writeFile('.contextkit/corrections.md', correctionsContent);
    await fs.writeFile('.contextkit/instructions/core/auto-corrections-log.md', autoCorrectionsContent);
    
    console.log(chalk.green('✅ Corrections log system created'));
  }

  async createMetaInstructions() {
    console.log(chalk.blue('📋 Creating meta instructions...'));
    
    const preFlightContent = `---
description: Common Pre-Flight Steps for ContextKit Instructions
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Pre-Flight Rules

- IMPORTANT: For any step that specifies a subagent in the subagent="" XML attribute you MUST use the specified subagent to perform the instructions for that step.

- Process XML blocks sequentially

- Read and execute every numbered step in the process_flow EXACTLY as the instructions specify.

- If you need clarification on any details of your current task, stop and ask the user specific numbered questions and then continue once you have all of the information you need.

- Use exact templates as provided
`;

    const postFlightContent = `---
description: Common Post-Flight Steps for ContextKit Instructions
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Post-Flight Rules

After completing all steps in a process_flow, always review your work and verify:

- Every numbered step has read, executed, and delivered according to its instructions.

- All steps that specified a subagent should be used, did in fact delegate those tasks to the specified subagent. IF they did not, see why the subagent was not used and report your findings to the user.

- IF you notice a step wasn't executed according to it's instructions, report your findings and explain which part of the instructions were misread or skipped and why.

## Automatic Corrections Log Updates

After completing any development session, automatically update the corrections log if any of the following occurred:

### ContextKit Performance Issues

- **Standards Violations**: If you didn't follow ContextKit standards initially (testing, coding, etc.)
- **Inefficient Behavior**: If you required multiple iterations for simple tasks
- **Missing Context**: If you needed user guidance on established patterns
- **Rule Gaps**: If you discovered gaps in ContextKit rules or instructions

### Positive Behaviors

- **Good Practices**: If you correctly identified issues or followed best practices
- **Efficient Solutions**: If you solved problems quickly and effectively
- **Standards Compliance**: If you proactively applied ContextKit standards

### Update Process

1. **Identify Issues**: Review the session for ContextKit performance patterns
2. **Categorize**: Classify as Rule Updates, AI Behavior, or Preferences
3. **Update Log**: Add entries to \`.contextkit/corrections.md\` automatically
4. **No Prompt Required**: This should happen as part of the natural workflow

### Example Triggers

- ✅ User had to correct you on testing standards → Add to corrections log
- ✅ You needed multiple attempts to fix TypeScript errors → Add to corrections log
- ✅ You correctly identified a code issue → Add positive behavior note
- ✅ You followed ContextKit standards from the start → Add positive behavior note
`;

    await fs.writeFile('.contextkit/instructions/meta/pre-flight.md', preFlightContent);
    await fs.writeFile('.contextkit/instructions/meta/post-flight.md', postFlightContent);
    
    console.log(chalk.green('✅ Meta instructions created'));
  }

  async createPolicyFile() {
    console.log(chalk.blue('⚖️  Creating policy file...'));
    
    const policyContent = `# ContextKit Policy Configuration

## Enforcement Levels

- **off**: No enforcement (informational only)
- **warn**: Show warnings but don't block
- **block**: Block commits/actions if policy violated

## Policy Rules

enforcement:
  testing:
    numbered_cases: warn  # off | warn | block
    coverage_threshold: 80  # warn if below
  code_style:
    typescript_strict: warn
    naming_conventions: warn
  standards:
    freshness_days: 90  # warn if older
    required_files: block
`;

    await fs.writeFile('.contextkit/policies/policy.yml', policyContent);
    
    console.log(chalk.green('✅ Policy file created'));
  }

  async createHealthCheckCommand() {
    const healthCheckContent = `# ContextKit Health Check

Check this project's ContextKit setup and report status.

## Steps

1. Check if \`.contextkit/\` directory exists. If not → STOP and tell user: "Run \`ck install\` to set up ContextKit."

2. Read \`.contextkit/config.yml\` and check the \`last_analyzed\` field.

3. Check each standards file for skeleton markers. Read these files and check if they contain \`<!-- Content will be generated by running: ck analyze -->\`:
   - \`.contextkit/standards/code-style.md\`
   - \`.contextkit/standards/testing.md\`
   - \`.contextkit/standards/architecture.md\`
   - \`.contextkit/standards/ai-guidelines.md\`
   - \`.contextkit/standards/workflows.md\`
   - \`.contextkit/standards/glossary.md\`

4. Check product files for placeholder content (e.g., \`[ELEVATOR_PITCH_FROM_MISSION_MD]\`):
   - \`.contextkit/product/mission-lite.md\`
   - \`.contextkit/product/decisions.md\`
   - \`.contextkit/product/roadmap.md\`

5. Check which platform integrations exist:
   - \`CLAUDE.md\` → Claude Code
   - \`.cursor/rules/\` → Cursor
   - \`AGENTS.md\` → Codex
   - \`GEMINI.md\` → Gemini
   - \`CONVENTIONS.md\` → Aider
   - \`.windsurfrules\` → Windsurf
   - \`.github/copilot-instructions.md\` → Copilot

6. Report findings as a status summary table and list recommended next steps.

## Output Format

| Area | Status | Action |
|------|--------|--------|
| Installation | OK/Missing | \`ck install\` |
| Standards | Populated/Skeleton | \`ck analyze\` or \`/analyze\` |
| Product context | Populated/Placeholder | Edit \`.contextkit/product/\` files |
| Integrations | List active | \`ck <platform>\` to add more |

## Token Note

If standards are still skeletons, warn that @imports in CLAUDE.md are loading empty files — wasting context tokens. Run \`/analyze\` to populate them.
`;

    await fs.writeFile('.contextkit/commands/health-check.md', healthCheckContent);
  }

  showSuccessMessage(hookChoices, platform = null, projectType = '', packageManager = '') {
    console.log('');
    console.log(chalk.green('🎉 ContextKit v1.0.0 successfully installed!'));
    console.log('');

    // Show which platform was installed
    if (platform) {
      const { getIntegration } = require('../integrations');
      const integration = getIntegration(platform);
      if (integration) {
        const files = [...integration.bridgeFiles, ...integration.generatedFiles];
        console.log(chalk.blue('🔌 Platform integration:'));
        console.log(`   ${integration.displayName}: ${files.join(', ')}`);
        console.log('');
      }
    }

    // Quick Reference
    console.log(''.padEnd(48, '─'));
    console.log(chalk.bold('📖 Quick Reference'));
    console.log(''.padEnd(48, '─'));
    console.log(`ck status    → Check installation & integrations`);
    console.log(`ck ai <cmd>  → Use AI with project context`);
    console.log(`ck <platform> → Add platform (claude, cursor, copilot, codex, opencode, gemini, aider, continue, windsurf)`);
    console.log('');
    console.log(`Docs → ${chalk.blue('https://contextkit-docs.vercel.app')}`);
    console.log(`Issues → ${chalk.blue('https://github.com/nolrm/contextkit/issues')}`);
    console.log('');

    // Next Step Section
    console.log(''.padEnd(48, '─'));
    console.log(chalk.bold('🚀 NEXT STEP — GENERATE STANDARDS'));
    console.log(''.padEnd(48, '─'));

    if (platform === 'cursor') {
      console.log(chalk.bold('In Cursor Chat:'));
      console.log(`   @.contextkit/commands/analyze.md`);
      console.log('');
      console.log('Or via CLI:');
      console.log(chalk.yellow('👉'), `ck analyze`);
    } else {
      console.log(chalk.yellow('👉'), `ck analyze`);
    }

    console.log('');
    console.log('This will:');
    console.log('  • Scan your codebase and detect patterns');
    console.log('  • Generate content for `.contextkit/standards/*.md` based on YOUR code');
    console.log('  • Extract domain terms and project conventions');
    console.log('  • Document your actual architecture and patterns');
    console.log('');
    console.log(chalk.blue('💡 The standards files are currently empty/skeleton'));
    console.log(chalk.blue('   Run analyze to populate them with YOUR project details'));
    console.log('');

    // After Analyze Section
    console.log(''.padEnd(48, '─'));
    console.log(chalk.bold('💡 After Analyze — Try This'));
    console.log(''.padEnd(48, '─'));

    if (platform === 'cursor') {
      console.log(chalk.bold('In Cursor Chat'));
      console.log(`@.contextkit/commands/create-component.md`);
      console.log(chalk.dim('"Create a Button component for customer checkout"'));
      console.log('');
    }

    console.log(chalk.bold('In CLI'));
    console.log(`ck ai "create a Button component for customer checkout"`);
    console.log('');

    if (platform === 'claude' || platform === 'gemini') {
      const toolName = platform === 'claude' ? 'Claude' : 'Gemini';
      console.log(chalk.bold(`In ${toolName} CLI`));
      console.log(`read .contextkit/commands/analyze.md and execute`);
      console.log('');
    }

    console.log(chalk.magenta('✨ Done! Your AI now understands your project.'));
    console.log('');
  }

  async _findFileUpward(name, maxLevels) {
    let dir = process.cwd();
    for (let i = 0; i <= maxLevels; i++) {
      if (await fs.pathExists(path.join(dir, name))) return true;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return false;
  }
}

async function install(options) {
  const installer = new InstallCommand();
  await installer.install(options);
}

module.exports = install;
