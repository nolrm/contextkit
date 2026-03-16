const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const GitHooksManager = require('../../lib/utils/git-hooks');

let tmpDir;
let originalCwd;
let manager;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-hooks-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);

  // Initialize a real git repo
  execSync('git init', { stdio: 'pipe' });

  // Create .contextkit/hooks/ with dummy hook scripts (no .sh extension)
  await fs.ensureDir('.contextkit/hooks');
  await fs.writeFile('.contextkit/hooks/pre-push', '#!/bin/sh\nexit 0');
  await fs.writeFile('.contextkit/hooks/commit-msg', '#!/bin/sh\nexit 0');
  await fs.chmod('.contextkit/hooks/pre-push', '755');
  await fs.chmod('.contextkit/hooks/commit-msg', '755');

  manager = new GitHooksManager();
});

afterEach(async () => {
  process.chdir(originalCwd);
  await fs.remove(tmpDir);
});

function getHooksPath() {
  try {
    return execSync('git config core.hooksPath', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

describe('GitHooksManager - core.hooksPath', () => {
  it('1. sets core.hooksPath to .contextkit/hooks', async () => {
    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    expect(getHooksPath()).toBe('.contextkit/hooks');
  });

  it('2. removes pre-push hook file when prePush is false', async () => {
    await manager.installHooks('npm', { prePush: false, commitMsg: true });

    expect(fs.existsSync('.contextkit/hooks/pre-push')).toBe(false);
    expect(fs.existsSync('.contextkit/hooks/commit-msg')).toBe(true);
  });

  it('3. removes commit-msg hook file when commitMsg is false', async () => {
    await manager.installHooks('npm', { prePush: true, commitMsg: false });

    expect(fs.existsSync('.contextkit/hooks/pre-push')).toBe(true);
    expect(fs.existsSync('.contextkit/hooks/commit-msg')).toBe(false);
  });

  it('4. keeps both hooks when both are true', async () => {
    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    expect(fs.existsSync('.contextkit/hooks/pre-push')).toBe(true);
    expect(fs.existsSync('.contextkit/hooks/commit-msg')).toBe(true);
  });

  it('5. defaults to both hooks when hookChoices is omitted', async () => {
    await manager.installHooks('npm');

    expect(getHooksPath()).toBe('.contextkit/hooks');
    expect(fs.existsSync('.contextkit/hooks/pre-push')).toBe(true);
    expect(fs.existsSync('.contextkit/hooks/commit-msg')).toBe(true);
  });

  it('6. skips if not a git repo (no .git/)', async () => {
    await fs.remove('.git');

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    // core.hooksPath should not be set (no .git)
    expect(getHooksPath()).toBeNull();
  });

  it('7. adds prepare script to package.json', async () => {
    await fs.writeJson('package.json', { name: 'test-project' });

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    const pkg = await fs.readJson('package.json');
    expect(pkg.scripts.prepare).toBe('git config core.hooksPath .contextkit/hooks');
  });

  it('8. appends to existing prepare script', async () => {
    await fs.writeJson('package.json', {
      name: 'test-project',
      scripts: { prepare: 'some-other-tool' },
    });

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    const pkg = await fs.readJson('package.json');
    expect(pkg.scripts.prepare).toBe(
      'some-other-tool && git config core.hooksPath .contextkit/hooks'
    );
  });

  it('9. does not duplicate prepare script on re-install', async () => {
    await fs.writeJson('package.json', {
      name: 'test-project',
      scripts: { prepare: 'git config core.hooksPath .contextkit/hooks' },
    });

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    const pkg = await fs.readJson('package.json');
    expect(pkg.scripts.prepare).toBe('git config core.hooksPath .contextkit/hooks');
  });

  it('10. cleans up legacy .husky/ directory', async () => {
    await fs.ensureDir('.husky');
    await fs.writeFile('.husky/pre-push', '#!/bin/sh\n.contextkit/hooks/pre-push');

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    expect(fs.existsSync('.husky')).toBe(false);
    expect(getHooksPath()).toBe('.contextkit/hooks');
  });

  it('11. does not remove .husky/ if it has no ContextKit markers', async () => {
    await fs.ensureDir('.husky');
    await fs.writeFile('.husky/pre-push', '#!/bin/sh\necho "user hook"');

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    expect(fs.existsSync('.husky')).toBe(true);
  });

  it('12. cleans up legacy .git/hooks/ ContextKit wrapper files', async () => {
    // Simulate old ContextKit version that wrote to .git/hooks/
    await fs.writeFile('.git/hooks/pre-push', '#!/usr/bin/env sh\n# ContextKit managed hook\n');

    await manager.installHooks('npm', { prePush: true, commitMsg: true });

    // Old wrapper should be removed
    expect(fs.existsSync('.git/hooks/pre-push')).toBe(false);
  });

  it('13. uninstallHooks removes core.hooksPath and prepare script', async () => {
    await fs.writeJson('package.json', {
      name: 'test-project',
      scripts: { prepare: 'git config core.hooksPath .contextkit/hooks' },
    });
    execSync('git config core.hooksPath .contextkit/hooks', { stdio: 'pipe' });

    await manager.uninstallHooks();

    expect(getHooksPath()).toBeNull();
    const pkg = await fs.readJson('package.json');
    expect(pkg.scripts.prepare).toBeUndefined();
  });
});
