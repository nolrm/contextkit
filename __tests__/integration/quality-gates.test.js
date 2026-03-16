const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const prePushScript = path.join(__dirname, '../../hooks/pre-push');
const setupScript = path.join(__dirname, '../../hooks/setup-hooks.sh');

let tmpDir;
let originalCwd;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-qg-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await fs.remove(tmpDir);
});

function runPrePush() {
  return execSync(`bash "${prePushScript}"`, {
    encoding: 'utf8',
    env: { ...process.env, PATH: process.env.PATH },
  });
}

// Run with minimal PATH so framework tools (cargo, go, mvn, etc.) are not found.
function runPrePushMinimalPath() {
  return execSync(`bash "${prePushScript}"`, {
    encoding: 'utf8',
    env: { ...process.env, PATH: '/usr/bin:/bin' },
  });
}

describe('Quality Gates — pre-push framework detection', () => {
  it('1. detects Node.js project (package.json)', async () => {
    await fs.writeJson('package.json', { name: 'my-app', version: '1.0.0' });
    const output = runPrePush();
    expect(output).toContain('Quality Gates');
    expect(output).toContain('Project: node');
  });

  it('2. detects Python project (requirements.txt)', async () => {
    await fs.writeFile('requirements.txt', 'flask\n');
    const output = runPrePush();
    expect(output).toContain('Project: python');
  });

  it('3. detects Python project (pyproject.toml)', async () => {
    await fs.writeFile('pyproject.toml', '[project]\nname = "test"\n');
    const output = runPrePush();
    expect(output).toContain('Project: python');
  });

  it('4. detects Rust project (Cargo.toml)', async () => {
    await fs.writeFile('Cargo.toml', '[package]\nname = "test"\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: rust');
  });

  it('5. detects Go project (go.mod)', async () => {
    await fs.writeFile('go.mod', 'module example.com/test\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: go');
  });

  it('6. detects PHP project (composer.json)', async () => {
    await fs.writeJson('composer.json', { name: 'test/test' });
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: php');
  });

  it('7. detects Ruby project (Gemfile)', async () => {
    await fs.writeFile('Gemfile', 'source "https://rubygems.org"\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: ruby');
  });

  it('8. detects Java/Maven project (pom.xml)', async () => {
    await fs.writeFile('pom.xml', '<project></project>\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: java');
  });

  it('9. detects Java/Gradle project (build.gradle)', async () => {
    await fs.writeFile('build.gradle', 'plugins {}\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: java');
  });

  it('10. falls back to generic when no framework files found', () => {
    const output = runPrePush();
    expect(output).toContain('Project: generic');
    expect(output).toContain('No framework detected');
  });

  it('11. Node.js gates skip gracefully when tools are not in package.json', async () => {
    await fs.writeJson('package.json', { name: 'bare-project', version: '1.0.0' });
    const output = runPrePush();
    expect(output).toContain('Project: node');
    expect(output).toContain('passed');
  });

  it('12. Python gates skip gracefully when tools are not installed', async () => {
    await fs.writeFile('requirements.txt', 'flask\n');
    const output = runPrePushMinimalPath();
    expect(output).toContain('Project: python');
    expect(output).toContain('skipped');
  });
});

describe('Quality Gates — setup-hooks.sh', () => {
  it('13. sets core.hooksPath via setup script', async () => {
    execSync('git init', { stdio: 'pipe' });
    await fs.ensureDir('.contextkit/hooks');
    await fs.writeFile('.contextkit/hooks/pre-push', '#!/bin/sh\nexit 0');
    await fs.writeFile('.contextkit/hooks/commit-msg', '#!/bin/sh\nexit 0');

    execSync(`bash "${setupScript}"`, { encoding: 'utf8' });

    const hooksPath = execSync('git config core.hooksPath', { encoding: 'utf8' }).trim();
    expect(hooksPath).toBe('.contextkit/hooks');
  });

  it('14. fails if not a git repo', () => {
    expect(() => {
      execSync(`bash "${setupScript}"`, { encoding: 'utf8', stdio: 'pipe' });
    }).toThrow();
  });
});

describe('Quality Gates — GitHooksManager end-to-end', () => {
  it('15. full flow: core.hooksPath set, hook executes correctly', async () => {
    const GitHooksManager = require('../../lib/utils/git-hooks');

    execSync('git init', { stdio: 'pipe' });
    await fs.ensureDir('.contextkit/hooks');
    await fs.writeFile('.contextkit/hooks/pre-push', '#!/bin/sh\necho "hook ran"\nexit 0');
    await fs.chmod('.contextkit/hooks/pre-push', '755');

    const manager = new GitHooksManager();
    await manager.installHooks('npm', { prePush: true, commitMsg: false });

    // Verify core.hooksPath is set
    const hooksPath = execSync('git config core.hooksPath', { encoding: 'utf8' }).trim();
    expect(hooksPath).toBe('.contextkit/hooks');

    // Actually run the hook directly
    const output = execSync('.contextkit/hooks/pre-push', { encoding: 'utf8' });
    expect(output).toContain('hook ran');
  });
});
