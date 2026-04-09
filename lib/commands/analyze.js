const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

class AnalyzeCommand {
  constructor() {
    this.repoUrl = 'https://raw.githubusercontent.com/nolrm/contextkit/main';
  }

  async run(options = {}) {
    console.log(chalk.magenta('🔍 ContextKit Project Analysis\n'));

    // Check if contextkit is installed
    if (!(await fs.pathExists('.contextkit/commands/analyze.md'))) {
      console.log(chalk.red('❌ ContextKit not found.'));
      console.log(chalk.yellow('   Run: contextkit install'));
      return;
    }

    const spinner = ora('Detecting project structure...').start();

    try {
      // Detect monorepo structure
      const monorepoStructure = await this.detectMonorepoStructure();

      // Determine analysis scope
      let analysisScope;

      // Handle specific package option
      if (options.package) {
        const packagePath = path.resolve(options.package);
        if (!(await fs.pathExists(packagePath))) {
          spinner.fail(`Package path not found: ${options.package}`);
          return;
        }

        spinner.succeed(`Analyzing specific package: ${options.package}\n`);
        analysisScope = {
          scope: 'package',
          paths: [packagePath],
          packages: [{ path: packagePath, name: path.basename(packagePath) }],
        };
      } else if (monorepoStructure.isMonorepo) {
        spinner.succeed('Monorepo detected!\n');

        if (options.scope) {
          // Use provided scope
          analysisScope = await this.getScopeFromOption(options.scope, monorepoStructure);
        } else if (options.nonInteractive) {
          // Non-interactive: analyze current directory
          analysisScope = { scope: 'current', paths: [process.cwd()], packages: [] };
        } else {
          // Interactive: prompt user
          analysisScope = await this.promptAnalysisScope(monorepoStructure);
        }

        this.displayScopeInfo(analysisScope, monorepoStructure);
      } else {
        spinner.succeed('Single package detected\n');
        analysisScope = { scope: 'current', paths: [process.cwd()], packages: [] };
      }

      // Load project context for selected scope
      const contextSpinner = ora('Loading project context...').start();
      const context = await this.loadProjectContext(analysisScope);
      contextSpinner.succeed('Context loaded successfully\n');

      // Load analyze.md instructions
      const analyzeInstructions = await fs.readFile('.contextkit/commands/analyze.md', 'utf-8');

      // Display instructions
      console.log(chalk.yellow('📋 Analysis Instructions:\n'));
      console.log('─'.repeat(60));
      console.log(analyzeInstructions);
      console.log('─'.repeat(60));

      console.log(chalk.blue('\n📊 Project Context:\n'));
      console.log('─'.repeat(60));
      console.log(
        JSON.stringify(
          {
            ...context,
            analysisScope: analysisScope.scope,
            analyzedPaths: analysisScope.paths,
          },
          null,
          2
        )
      );
      console.log('─'.repeat(60));

      // Update config.yml with analysis scope
      await this.updateConfigWithScope(analysisScope);

      // Show usage instructions
      this.showUsageInstructions(options, analysisScope);
    } catch (error) {
      spinner.fail('Failed to load context');
      console.log(chalk.red(error.message));
    }
  }

  async updateConfigWithScope(analysisScope) {
    try {
      const yaml = require('js-yaml');
      const configPath = '.contextkit/config.yml';

      if (!(await fs.pathExists(configPath))) {
        return;
      }

      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = yaml.load(configContent);

      // Update analysis scope info
      config.analysis_scope = analysisScope.scope;
      config.analyzed_packages = analysisScope.packages.map((p) => p.relativePath || p.path);

      // Write back
      await fs.writeFile(configPath, yaml.dump(config, { lineWidth: 120 }));
    } catch (error) {
      // Non-critical, continue even if config update fails
      console.log(chalk.yellow(`⚠️  Could not update config.yml: ${error.message}`));
    }
  }

  async loadProjectContext(analysisScope = null) {
    const context = {
      paths: analysisScope?.paths || [process.cwd()],
      scope: analysisScope?.scope || 'current',
    };

    // Load context for each path in scope
    const contexts = [];
    for (const analysisPath of context.paths) {
      const pathContext = await this.loadPathContext(analysisPath);
      contexts.push(pathContext);
    }

    // Merge contexts
    context.packages = contexts;
    context.structure = await this.detectProjectStructure();
    context.detectedTools = await this.detectAITools();

    return context;
  }

  async loadPathContext(analysisPath) {
    const originalCwd = process.cwd();
    const pathContext = {
      path: analysisPath,
      relativePath: path.relative(originalCwd, analysisPath),
    };

    try {
      process.chdir(analysisPath);

      // Load package.json
      if (await fs.pathExists('package.json')) {
        pathContext.package = await fs.readJson('package.json');
      }

      // Load tsconfig.json
      if (await fs.pathExists('tsconfig.json')) {
        pathContext.tsconfig = await fs.readJson('tsconfig.json');
      }

      // Detect primary language and frameworks/build tools for this path
      const ProjectDetector = require('../utils/project-detector');
      const primaryLanguage = new ProjectDetector().detectProjectType();
      pathContext.primaryLanguage = primaryLanguage;
      pathContext.frameworks = await this.detectFrameworks(primaryLanguage);
      pathContext.buildTools = await this.detectBuildTools(primaryLanguage);
    } catch {
      // Continue even if one path fails
    } finally {
      process.chdir(originalCwd);
    }

    return pathContext;
  }

  async detectMonorepoStructure() {
    const structure = {
      isMonorepo: false,
      type: null, // 'turborepo', 'nx', 'lerna', 'pnpm-workspace', 'yarn-workspace'
      packages: [],
      apps: [],
      frontendPackages: [],
      backendPackages: [],
      fullstackPackages: [],
    };

    // Detect monorepo type
    if (await fs.pathExists('turbo.json')) {
      structure.type = 'turborepo';
      structure.isMonorepo = true;
    } else if (await fs.pathExists('nx.json')) {
      structure.type = 'nx';
      structure.isMonorepo = true;
    } else if (await fs.pathExists('lerna.json')) {
      structure.type = 'lerna';
      structure.isMonorepo = true;
    }

    // Check for workspace indicators
    const packageJson = await this.readPackageJson();
    if (packageJson.workspaces || packageJson.workspace) {
      structure.isMonorepo = true;
      if (!structure.type) {
        structure.type = packageJson.workspaces ? 'npm-workspace' : 'yarn-workspace';
      }
    }

    // Scan packages and apps directories
    if (await fs.pathExists('packages')) {
      structure.packages = await this.scanPackages('packages');
    }
    if (await fs.pathExists('apps')) {
      structure.apps = await this.scanPackages('apps');
    }

    // Classify packages
    const allPackages = [...structure.packages, ...structure.apps];
    for (const pkg of allPackages) {
      const pkgType = await this.classifyPackage(pkg.path);
      pkg.type = pkgType;

      if (pkgType === 'frontend') {
        structure.frontendPackages.push(pkg);
      } else if (pkgType === 'backend') {
        structure.backendPackages.push(pkg);
      } else if (pkgType === 'fullstack') {
        structure.fullstackPackages.push(pkg);
      }
    }

    // If no packages found but has workspace structure, still consider it a monorepo
    if (structure.isMonorepo && allPackages.length === 0) {
      structure.isMonorepo = false; // Might be workspace but not monorepo yet
    }

    return structure;
  }

  async scanPackages(dir) {
    const packages = [];
    if (!(await fs.pathExists(dir))) return packages;

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const packagePath = path.join(dir, entry.name);
        const packageJsonPath = path.join(packagePath, 'package.json');

        if (await fs.pathExists(packageJsonPath)) {
          try {
            const packageJson = await fs.readJson(packageJsonPath);
            packages.push({
              name: packageJson.name || entry.name,
              path: packagePath,
              relativePath: path.relative(process.cwd(), packagePath),
            });
          } catch {
            // Skip invalid package.json
          }
        }
      }
    }

    return packages;
  }

  async classifyPackage(packagePath) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) return 'unknown';

    try {
      const pkg = await fs.readJson(packageJsonPath);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      // Frontend indicators
      const frontendDeps = [
        'react',
        'vue',
        '@vue',
        'angular',
        '@angular/core',
        'next',
        'nuxt',
        'svelte',
      ];
      const hasFrontend = frontendDeps.some((dep) => deps[dep]);

      // Backend indicators
      const backendDeps = [
        'express',
        'fastify',
        'koa',
        '@nestjs/core',
        'django',
        'flask',
        'fastapi',
      ];
      let hasBackend = backendDeps.some((dep) => deps[dep]);

      // Check for backend file patterns
      if (!hasBackend) {
        const serverFiles = ['server.js', 'server.ts', 'index.js', 'index.ts', 'app.js', 'app.ts'];
        for (const file of serverFiles) {
          if (
            (await fs.pathExists(path.join(packagePath, file))) ||
            (await fs.pathExists(path.join(packagePath, 'src', file)))
          ) {
            hasBackend = true;
            break;
          }
        }
      }

      if (hasFrontend && hasBackend) return 'fullstack';
      if (hasFrontend) return 'frontend';
      if (hasBackend) return 'backend';

      // Check directory structure
      if (
        (await fs.pathExists(path.join(packagePath, 'src', 'components'))) ||
        (await fs.pathExists(path.join(packagePath, 'components')))
      ) {
        return 'frontend';
      }

      if (
        (await fs.pathExists(path.join(packagePath, 'src', 'server'))) ||
        (await fs.pathExists(path.join(packagePath, 'src', 'api')))
      ) {
        return 'backend';
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async promptAnalysisScope(monorepoStructure) {
    const choices = [];

    if (monorepoStructure.frontendPackages.length > 0) {
      const frontendNames = monorepoStructure.frontendPackages.map((p) => p.name).join(', ');
      choices.push({
        name: `Frontend (${monorepoStructure.frontendPackages.length} package(s): ${frontendNames})`,
        value: 'frontend',
        packages: monorepoStructure.frontendPackages,
      });
    }

    if (monorepoStructure.backendPackages.length > 0) {
      const backendNames = monorepoStructure.backendPackages.map((p) => p.name).join(', ');
      choices.push({
        name: `Backend (${monorepoStructure.backendPackages.length} package(s): ${backendNames})`,
        value: 'backend',
        packages: monorepoStructure.backendPackages,
      });
    }

    if (
      monorepoStructure.frontendPackages.length > 0 &&
      monorepoStructure.backendPackages.length > 0
    ) {
      choices.push({
        name: 'Both (Frontend + Backend) - Separate standards',
        value: 'both',
        packages: [...monorepoStructure.frontendPackages, ...monorepoStructure.backendPackages],
      });
    }

    choices.push({
      name: 'Current directory only',
      value: 'current',
      packages: [],
    });

    if (choices.length === 1) {
      // Only "current directory" option
      return { scope: 'current', paths: [process.cwd()], packages: [] };
    }

    const { scope } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scope',
        message: 'Which part of the monorepo should we analyze?',
        choices: choices.map((c) => c.name),
      },
    ]);

    const selected = choices.find((c) => c.name === scope);
    return {
      scope: selected.value,
      packages: selected.packages,
      paths: selected.packages.length > 0 ? selected.packages.map((p) => p.path) : [process.cwd()],
    };
  }

  async getScopeFromOption(scopeOption, monorepoStructure) {
    switch (scopeOption.toLowerCase()) {
      case 'frontend':
        return {
          scope: 'frontend',
          packages: monorepoStructure.frontendPackages,
          paths: monorepoStructure.frontendPackages.map((p) => p.path),
        };
      case 'backend':
        return {
          scope: 'backend',
          packages: monorepoStructure.backendPackages,
          paths: monorepoStructure.backendPackages.map((p) => p.path),
        };
      case 'both':
        return {
          scope: 'both',
          packages: [...monorepoStructure.frontendPackages, ...monorepoStructure.backendPackages],
          paths: [...monorepoStructure.frontendPackages, ...monorepoStructure.backendPackages].map(
            (p) => p.path
          ),
        };
      default:
        return { scope: 'current', paths: [process.cwd()], packages: [] };
    }
  }

  displayScopeInfo(analysisScope, monorepoStructure) {
    console.log(chalk.blue('\n📦 Monorepo Structure:\n'));
    console.log(chalk.dim(`   Type: ${monorepoStructure.type || 'workspace'}`));
    console.log(chalk.dim(`   Frontend packages: ${monorepoStructure.frontendPackages.length}`));
    console.log(chalk.dim(`   Backend packages: ${monorepoStructure.backendPackages.length}`));

    console.log(chalk.blue(`\n🎯 Analysis Scope: ${analysisScope.scope}\n`));
    if (analysisScope.packages.length > 0) {
      analysisScope.packages.forEach((pkg) => {
        console.log(chalk.dim(`   • ${pkg.name} (${pkg.type})`));
      });
    }
    console.log('');
  }

  async readPackageJson() {
    try {
      if (await fs.pathExists('package.json')) {
        return await fs.readJson('package.json');
      }
    } catch {
      // Ignore
    }
    return {};
  }

  async detectProjectStructure() {
    const ProjectDetector = require('../utils/project-detector');
    const primaryLanguage = new ProjectDetector().detectProjectType();

    const structure = {
      hasSrc: await fs.pathExists('src'),
      hasApp: await fs.pathExists('src/app'),
      hasComponents: await fs.pathExists('src/components'),
      isMonorepo: (await fs.pathExists('packages')) || (await fs.pathExists('apps')),
      primaryLanguage,
      frameworks: await this.detectFrameworks(primaryLanguage),
      buildTools: await this.detectBuildTools(primaryLanguage),
    };

    structure.type = structure.isMonorepo ? 'monorepo' : 'single-package';

    return structure;
  }

  // ── JS language types ───────────────────────────────────────────────────────
  _isJsLanguage(primaryLanguage) {
    return [
      'node', 'react', 'react-vite', 'react-webpack', 'react-rollup',
      'nextjs', 'vue', 'vue-vite', 'vue-webpack', 'nuxt', 'angular', 'svelte',
    ].includes(primaryLanguage);
  }

  async detectFrameworks(primaryLanguage) {
    // Non-JS projects: return language-appropriate framework info
    if (!this._isJsLanguage(primaryLanguage)) {
      return await this._detectNonJsFrameworks(primaryLanguage);
    }

    // JS projects: filesystem heuristics are appropriate
    const frameworks = [];

    // Require both a dependency signal AND directory structure to avoid false positives
    const hasPackageJson = await fs.pathExists('package.json');
    let deps = {};
    if (hasPackageJson) {
      try {
        const pkg = await fs.readJson('package.json');
        deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      } catch {
        // ignore
      }
    }

    if ((deps.react || deps['@types/react']) && (await fs.pathExists('src/components'))) {
      frameworks.push('React');
    }
    if (deps.next && (await fs.pathExists('src/pages'))) {
      frameworks.push('Next.js');
    }
    if ((deps.vue || deps['@vue/core']) && (await fs.pathExists('src/views'))) {
      frameworks.push('Vue');
    }
    if (deps['@angular/core'] && (await fs.pathExists('angular.json'))) {
      frameworks.push('Angular');
    }

    // Fallback for cases where dependency exists but directories differ (still JS)
    if (frameworks.length === 0 && (deps.react || deps['@types/react'])) {
      frameworks.push('React');
    }
    if (frameworks.length === 0 && deps.next) {
      frameworks.push('Next.js');
    }
    if (frameworks.length === 0 && (deps.vue || deps['@vue/core'])) {
      frameworks.push('Vue');
    }

    return frameworks;
  }

  async _detectNonJsFrameworks(primaryLanguage) {
    const frameworks = [];

    if (primaryLanguage === 'go') {
      frameworks.push('Go');
      if (await fs.pathExists('go.mod')) {
        try {
          const goMod = await fs.readFile('go.mod', 'utf-8');
          const moduleLine = goMod.split('\n').find((l) => l.startsWith('module '));
          if (moduleLine) {
            frameworks.push(`module:${moduleLine.replace('module ', '').trim()}`);
          }
        } catch {
          // ignore
        }
      }
      return frameworks;
    }

    if (primaryLanguage === 'python') {
      frameworks.push('Python');
      const depSources = ['requirements.txt', 'pyproject.toml'];
      for (const src of depSources) {
        if (await fs.pathExists(src)) {
          try {
            const content = await fs.readFile(src, 'utf-8');
            if (/django/i.test(content)) frameworks.push('Django');
            if (/flask/i.test(content)) frameworks.push('Flask');
            if (/fastapi/i.test(content)) frameworks.push('FastAPI');
          } catch {
            // ignore
          }
          break;
        }
      }
      return frameworks;
    }

    if (primaryLanguage === 'rust') {
      frameworks.push('Rust');
      return frameworks;
    }

    if (primaryLanguage === 'java') {
      frameworks.push('Java');
      return frameworks;
    }

    if (primaryLanguage === 'ruby') {
      frameworks.push('Ruby');
      if (await fs.pathExists('Gemfile')) {
        try {
          const gemfile = await fs.readFile('Gemfile', 'utf-8');
          if (/rails/i.test(gemfile)) frameworks.push('Rails');
        } catch {
          // ignore
        }
      }
      return frameworks;
    }

    if (primaryLanguage === 'php') {
      frameworks.push('PHP');
      return frameworks;
    }

    return frameworks;
  }

  async detectBuildTools(primaryLanguage) {
    // Non-JS projects: skip JS build tool checks, return relevant tools
    if (!this._isJsLanguage(primaryLanguage)) {
      return await this._detectNonJsBuildTools(primaryLanguage);
    }

    // JS projects: check JS build tool config files
    const tools = [];

    if ((await fs.pathExists('vite.config.js')) || (await fs.pathExists('vite.config.ts'))) {
      tools.push('Vite');
    }
    if ((await fs.pathExists('webpack.config.js')) || (await fs.pathExists('webpack.config.ts'))) {
      tools.push('Webpack');
    }
    if ((await fs.pathExists('rollup.config.js')) || (await fs.pathExists('rollup.config.ts'))) {
      tools.push('Rollup');
    }

    return tools;
  }

  async _detectNonJsBuildTools(primaryLanguage) {
    const tools = [];

    if (primaryLanguage === 'go') {
      if (await fs.pathExists('Makefile')) tools.push('Make');
      if (
        (await fs.pathExists('.goreleaser.yml')) ||
        (await fs.pathExists('.goreleaser.yaml'))
      ) {
        tools.push('GoReleaser');
      }
      return tools;
    }

    if (primaryLanguage === 'python') {
      if (await fs.pathExists('Makefile')) tools.push('Make');
      if (await fs.pathExists('pyproject.toml')) tools.push('pyproject');
      if (await fs.pathExists('setup.py')) tools.push('setuptools');
      return tools;
    }

    if (primaryLanguage === 'rust') {
      tools.push('Cargo');
      if (await fs.pathExists('Makefile')) tools.push('Make');
      return tools;
    }

    if (primaryLanguage === 'java') {
      if (await fs.pathExists('pom.xml')) tools.push('Maven');
      if (await fs.pathExists('build.gradle') || await fs.pathExists('build.gradle.kts')) {
        tools.push('Gradle');
      }
      return tools;
    }

    if (await fs.pathExists('Makefile')) tools.push('Make');

    return tools;
  }

  async detectAITools() {
    const ToolDetector = require('../utils/tool-detector');
    const detector = new ToolDetector();
    const _tools = await detector.detectAll();
    const summary = detector.getSummary();

    return {
      detected: summary.all,
      editors: summary.editors,
      cli: summary.cli,
      count: summary.count,
    };
  }

  showUsageInstructions(options, analysisScope = null) {
    console.log(chalk.blue('\n💡 To execute analysis with AI:\n'));

    console.log(chalk.yellow('1. Using contextkit AI chat:'));
    const scopeHint =
      analysisScope?.scope === 'both' ? ' (will generate separate frontend/backend standards)' : '';
    console.log(
      `   contextkit ai "read .contextkit/commands/analyze.md and execute analysis${scopeHint}"\n`
    );

    console.log(chalk.yellow('2. Using Aider (if installed):'));
    console.log('   aider');
    console.log('   Then paste the analysis instructions above\n');

    console.log(chalk.yellow('3. Using Claude CLI (if installed):'));
    console.log('   claude "read .contextkit/commands/analyze.md and execute analysis"\n');

    console.log(chalk.blue('📝 Next: Use the AI tool of your choice to execute the analysis'));
    console.log(
      chalk.blue(
        '✨ The AI will generate content for your skeleton .contextkit/standards/*.md files'
      )
    );

    if (analysisScope?.scope === 'both') {
      console.log(
        chalk.blue(
          '📦 For monorepo with both frontend and backend, standards will be generated separately:'
        )
      );
      console.log(chalk.dim('   • .contextkit/standards/frontend/'));
      console.log(chalk.dim('   • .contextkit/standards/backend/'));
    }

    console.log('');
    console.log(chalk.yellow('📋 What AI will generate:'));
    console.log('   • code-style.md - Extract formatting & conventions from your code');
    console.log('   • testing.md - Document your test patterns and framework');
    console.log('   • architecture.md - Map your folder structure and patterns');
    console.log('   • ai-guidelines.md - Create AI usage guidelines for your project');
    console.log('   • glossary.md - Extract domain terms from your codebase');
    console.log('   • workflows.md - Document your development processes');
    console.log('');
    console.log(chalk.yellow('⚠️  After generation completes:'));
    console.log(chalk.yellow('   1. Review generated files in .contextkit/standards/'));
    console.log(chalk.yellow('   2. Edit and refine to match YOUR exact needs'));
    console.log(chalk.yellow("   3. Commit them to your repo (they're part of your project now)"));

    if (analysisScope?.scope && analysisScope.scope !== 'current') {
      console.log('');
      console.log(chalk.blue('💡 Tip: Run with --scope flag for non-interactive mode:'));
      console.log(chalk.dim(`   contextkit analyze --scope ${analysisScope.scope}`));
    }
  }
}

async function analyze(options) {
  const cmd = new AnalyzeCommand();
  await cmd.run(options);
}

module.exports = analyze;
