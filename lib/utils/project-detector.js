const fs = require('fs-extra');
const path = require('path');

class ProjectDetector {
  constructor() {
    this.projectRoot = process.cwd();
  }

  detectProjectType() {
    if (fs.existsSync('package.json')) {
      const packageJson = this.readPackageJson();

      // Detect framework
      if (
        this.hasDependency(packageJson, 'react') ||
        this.hasDependency(packageJson, '@types/react')
      ) {
        return this.detectReactVariant(packageJson);
      } else if (
        this.hasDependency(packageJson, 'vue') ||
        this.hasDependency(packageJson, '@vue')
      ) {
        return this.detectVueVariant(packageJson);
      } else if (this.hasDependency(packageJson, '@angular/core')) {
        return 'angular';
      } else if (this.hasDependency(packageJson, 'next')) {
        return 'nextjs';
      } else if (this.hasDependency(packageJson, 'nuxt')) {
        return 'nuxt';
      } else if (this.hasDependency(packageJson, 'svelte')) {
        return 'svelte';
      } else {
        return 'node';
      }
    } else if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
      return 'python';
    } else if (fs.existsSync('Cargo.toml')) {
      return 'rust';
    } else if (fs.existsSync('go.mod')) {
      return 'go';
    } else if (fs.existsSync('composer.json')) {
      return 'php';
    } else if (fs.existsSync('Gemfile')) {
      return 'ruby';
    } else if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) {
      return 'java';
    }

    return 'generic';
  }

  detectReactVariant(packageJson) {
    if (this.hasDependency(packageJson, 'vite')) {
      return 'react-vite';
    } else if (this.hasDependency(packageJson, 'webpack')) {
      return 'react-webpack';
    } else if (this.hasDependency(packageJson, 'rollup')) {
      return 'react-rollup';
    } else if (this.hasDependency(packageJson, 'next')) {
      return 'nextjs';
    }
    return 'react';
  }

  detectVueVariant(packageJson) {
    if (this.hasDependency(packageJson, 'vite')) {
      return 'vue-vite';
    } else if (this.hasDependency(packageJson, 'webpack')) {
      return 'vue-webpack';
    } else if (this.hasDependency(packageJson, 'nuxt')) {
      return 'nuxt';
    }
    return 'vue';
  }

  detectPackageManager() {
    if (fs.existsSync('yarn.lock')) {
      return 'yarn';
    } else if (fs.existsSync('pnpm-lock.yaml')) {
      return 'pnpm';
    } else if (fs.existsSync('package-lock.json')) {
      return 'npm';
    } else if (fs.existsSync('package.json')) {
      return 'npm'; // Default to npm
    }
    return 'none';
  }

  hasDependency(packageJson, dependency) {
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    return deps[dependency] || devDeps[dependency];
  }

  readPackageJson() {
    try {
      return JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch {
      return {};
    }
  }

  isGitRepository() {
    return fs.existsSync('.git');
  }

  getProjectName() {
    if (fs.existsSync('package.json')) {
      const packageJson = this.readPackageJson();
      return packageJson.name || path.basename(this.projectRoot);
    }
    return path.basename(this.projectRoot);
  }
}

module.exports = ProjectDetector;
