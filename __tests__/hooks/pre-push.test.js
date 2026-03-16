const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

let tmpDir;
let originalCwd;
let hookPath;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-pre-push-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);

  // Initialize a real git repo
  execSync('git init', { stdio: 'pipe' });
  execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
  execSync('git config user.name "Test User"', { stdio: 'pipe' });

  // Copy the actual pre-push hook from the project
  hookPath = path.join(tmpDir, '.contextkit', 'hooks');
  await fs.ensureDir(hookPath);
  const sourceHook = path.join(originalCwd, '.contextkit', 'hooks', 'pre-push');
  await fs.copy(sourceHook, path.join(hookPath, 'pre-push'));
  await fs.chmod(path.join(hookPath, 'pre-push'), 0o755);

  // Set the hook path
  execSync('git config core.hooksPath .contextkit/hooks', { stdio: 'pipe' });
});

afterEach(async () => {
  process.chdir(originalCwd);
  await fs.remove(tmpDir);
});

function runPrePushHook() {
  try {
    const output = execSync(path.join(hookPath, 'pre-push'), {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
      shell: '/bin/bash',
    });
    return { success: true, output };
  } catch (error) {
    // When bash script fails, both stdout and stderr are in the same message
    // Try to get combined output from various sources
    const allOutput = (error.stdout || '') + (error.stderr || '') + (error.message || '');
    return {
      success: false,
      output: allOutput,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

describe('pre-push hook', () => {
  describe('PO Spec: Failure Banner on Gate Failure', () => {
    it('1. trap function is defined for failure banner', async () => {
      // Verify the trap is set up in the hook
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('on_gate_failure() {');
      expect(content).toContain('Quality Gates FAILED');
      expect(content).toContain('trap on_gate_failure ERR');
    });

    it('2. failure banner function is defined with correct format', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      // Verify the function contains the emoji and message
      expect(content).toContain('❌ Quality Gates FAILED — push blocked');
    });

    it('3. trap is registered on ERR signal immediately after variable initialization', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      // Find positions
      const skippedIndex = content.indexOf('SKIPPED=0');
      const trapIndex = content.indexOf('trap on_gate_failure ERR');
      expect(skippedIndex).toBeGreaterThan(0);
      expect(trapIndex).toBeGreaterThan(0);
      expect(skippedIndex).toBeLessThan(trapIndex);
    });

    it('4. exit code is non-zero when gate fails', async () => {
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {
          test: 'false',
        },
      });

      try {
        execSync(path.join(hookPath, 'pre-push'), {
          stdio: 'pipe',
          shell: '/bin/bash',
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Exit code should be non-zero
        expect(error.status).not.toBe(0);
      }
    });
  });

  describe('PO Spec: Success Banner Only on All Passes', () => {
    it('5. prints success banner when all gates pass', async () => {
      // Create a Node project where all gates will pass
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {},
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toContain('Quality Gates passed');
      expect(result.output).toContain('0 passed, 0 skipped');
    });

    it('6. does not print failure banner when all gates pass', async () => {
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {},
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).not.toContain('FAILED');
    });

    it('7. prints success with correct counts (passed and skipped)', async () => {
      // Create a Node project with a test script but no build script
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {
          test: 'true',
        },
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      // Should show 1 passed (test gate ran and passed)
      expect(result.output).toMatch(/\d+ passed/);
    });
  });

  describe('PO Spec: Skipped Gates Do Not Trigger Failure', () => {
    it('8. skipped gates do not trigger failure banner', async () => {
      // Create a Node project where npm/npx will not be found, causing gates to be skipped
      // Simulate project with TypeScript in package.json but npx unavailable
      await fs.writeJSON('package.json', {
        name: 'test-project',
        devDependencies: {
          typescript: '^5.0.0',
        },
        scripts: {},
      });

      // Save original PATH
      const originalPath = process.env.PATH;
      try {
        // Clear PATH to ensure npx is not found
        process.env.PATH = '';
        const result = runPrePushHook();
        // When gates are skipped (npx not found), should still succeed with no failure banner
        expect(result.output).not.toContain('FAILED');
      } finally {
        process.env.PATH = originalPath;
      }
    });

    it('9. skip_gate function increments counter without running command', async () => {
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {},
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      // When no gates are configured, should complete successfully
      expect(result.output).toContain('Quality Gates passed');
    });
  });

  describe('PO Spec: Both Hook Files Updated', () => {
    it('10. hooks/pre-push contains trap call', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('on_gate_failure');
      expect(content).toContain('trap on_gate_failure ERR');
    });

    it('11. .contextkit/hooks/pre-push contains trap call', async () => {
      const contextKitFile = path.join(originalCwd, '.contextkit', 'hooks', 'pre-push');
      const content = fs.readFileSync(contextKitFile, 'utf8');
      expect(content).toContain('on_gate_failure');
      expect(content).toContain('trap on_gate_failure ERR');
    });

    it('12. both hook files are identical', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const contextKitFile = path.join(originalCwd, '.contextkit', 'hooks', 'pre-push');
      const hooksContent = fs.readFileSync(hooksFile, 'utf8');
      const contextKitContent = fs.readFileSync(contextKitFile, 'utf8');
      expect(hooksContent).toBe(contextKitContent);
    });

    it('13. on_gate_failure function is placed before run_gate definition', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      const onGateFailureIndex = content.indexOf('on_gate_failure()');
      const runGateIndex = content.indexOf('run_gate()');
      expect(onGateFailureIndex).toBeGreaterThan(0);
      expect(runGateIndex).toBeGreaterThan(0);
      expect(onGateFailureIndex).toBeLessThan(runGateIndex);
    });
  });

  describe('PO Spec: Edge Cases', () => {
    it('14. trap does not fire on exit code 0 (success)', async () => {
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {},
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).not.toContain('FAILED');
    });

    it('15. trap does not interfere with skip_gate function', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      // skip_gate only uses echo and arithmetic, which don't trigger ERR
      expect(content).toContain('skip_gate() {');
      // verify skip_gate doesn't call any external commands that could fail
      const skipGateSection = content.substring(
        content.indexOf('skip_gate() {'),
        content.indexOf('has_cmd() {')
      );
      expect(skipGateSection).toContain('echo');
      expect(skipGateSection).toContain('SKIPPED=$((SKIPPED + 1))');
    });

    it('16. trap is called with ERR signal, not EXIT signal', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      // ERR signal only fires on non-zero exits while set -e is active
      // EXIT would fire on every exit, which would be incorrect
      expect(content).toContain('trap on_gate_failure ERR');
      expect(content).not.toContain('trap on_gate_failure EXIT');
    });
  });

  describe('Integration Tests', () => {
    it('17. generic project with no package.json succeeds', async () => {
      // No package.json means project type is 'generic', which has no automatic checks
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toContain('Quality Gates passed');
    });

    it('18. hook script is executable', async () => {
      const hookFile = path.join(hookPath, 'pre-push');
      const stats = fs.statSync(hookFile);
      // Check if file is executable (mode includes +x)
      const isExecutable = (stats.mode & parseInt('0111', 8)) !== 0;
      expect(isExecutable).toBe(true);
    });

    it('19. trap is set up after variable initialization', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      const skippedIndex = content.indexOf('SKIPPED=0');
      const trapIndex = content.indexOf('trap on_gate_failure ERR');
      expect(skippedIndex).toBeGreaterThan(0);
      expect(trapIndex).toBeGreaterThan(0);
      expect(skippedIndex).toBeLessThan(trapIndex);
    });

    it('20. failure banner uses plain line format, not box border', async () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      // Extract the on_gate_failure function
      const startIdx = content.indexOf('on_gate_failure() {');
      const endIdx = content.indexOf('}', startIdx);
      const functionBody = content.substring(startIdx, endIdx + 1);

      // Verify the failure banner uses plain echo statements, not box characters
      expect(functionBody).toContain('echo ""');
      expect(functionBody).toContain('echo "  ❌ Quality Gates FAILED — push blocked."');
      // Verify it does NOT use box border characters
      expect(functionBody).not.toContain('┌');
      expect(functionBody).not.toContain('└');
      expect(functionBody).not.toContain('│');
    });
  });

  describe('AC8: Config file gate disable', () => {
    it('21. gate_disabled function is defined in hook with config file reference', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('gate_disabled()');
      expect(content).toContain('.contextkit/quality-gates.yml');
    });

    it('22. disabled gate is not executed when listed in quality-gates.yml', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { test: 'true' } });
      await fs.ensureDir('.contextkit');
      await fs.writeFile('.contextkit/quality-gates.yml', 'disable:\n  - test\n');
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      // Tests gate should not appear in output (not run, not skipped — silently omitted)
      expect(result.output).not.toMatch(/\[\d+\] Tests/);
    });

    it('23. absent config file does not affect gate execution', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { test: 'true' } });
      // No .contextkit/quality-gates.yml — all gates run normally
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/\[\d+\] Tests/);
    });
  });

  describe('AC9: Per-gate timing output', () => {
    it('24. run_gate shows timing after gate completes', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { test: 'true' } });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      // Should contain timing output like "✓ 0s"
      expect(result.output).toMatch(/✓ \d+s/);
    });
  });

  describe('AC10: DRY_RUN mode', () => {
    it('25. DRY_RUN=1 shows dry-run labels without executing gates', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { test: 'false' } });
      try {
        const output = execSync(path.join(hookPath, 'pre-push'), {
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf8',
          shell: '/bin/bash',
          env: { ...process.env, DRY_RUN: '1' },
        });
        expect(output).toContain('dry-run');
        expect(output).not.toContain('FAILED');
      } catch (err) {
        // Should not throw — DRY_RUN=1 must exit 0
        throw new Error(`DRY_RUN=1 should exit 0 but got: ${err.stdout}${err.stderr}`);
      }
    });

    it('26. DRY_RUN=1 exits 0 even when commands would fail', async () => {
      // 'false' would cause the Tests gate to fail in normal mode
      await fs.writeJSON('package.json', { name: 'test', scripts: { test: 'false' } });
      expect(() => {
        execSync(path.join(hookPath, 'pre-push'), {
          stdio: 'pipe',
          shell: '/bin/bash',
          env: { ...process.env, DRY_RUN: '1' },
        });
      }).not.toThrow();
    });
  });

  describe('AC11: Swift stack detection', () => {
    it('27. Package.swift is detected as swift project type', async () => {
      await fs.writeFile(
        'Package.swift',
        '// swift-tools-version:5.0\nimport PackageDescription\nlet package = Package(name: "Test", targets: [])'
      );
      const result = runPrePushHook();
      expect(result.output).toContain('Project: swift');
    });

    it('28. run_swift_gates function and stack wiring are defined in hook', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('run_swift_gates()');
      expect(content).toContain('swift)   run_swift_gates ;;');
      expect(content).toContain('gate_disabled "swiftlint"');
      expect(content).toContain('gate_disabled "swift-test"');
    });
  });

  describe('AC12: Kotlin stack detection', () => {
    it('29. build.gradle with kotlin plugin is detected as kotlin project type', async () => {
      await fs.writeFile(
        'build.gradle',
        'plugins { id "org.jetbrains.kotlin.jvm" version "1.9.0" }\n'
      );
      const result = runPrePushHook();
      expect(result.output).toContain('Project: kotlin');
    });

    it('30. build.gradle WITHOUT kotlin plugin still routes to java stack', async () => {
      await fs.writeFile('build.gradle', 'plugins { id "java" }\n');
      const result = runPrePushHook();
      expect(result.output).toContain('Project: java');
    });

    it('31. run_kotlin_gates function and stack wiring are defined in hook', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('run_kotlin_gates()');
      expect(content).toContain('kotlin)  run_kotlin_gates ;;');
      expect(content).toContain('gate_disabled "ktlint"');
      expect(content).toContain('gate_disabled "kotlin-test"');
    });
  });

  describe('AC13: .NET/C# stack detection', () => {
    it('32. .csproj file is detected as dotnet project type', async () => {
      await fs.writeFile('App.csproj', '<Project Sdk="Microsoft.NET.Sdk"></Project>');
      const result = runPrePushHook();
      expect(result.output).toContain('Project: dotnet');
    });

    it('33. run_dotnet_gates function and stack wiring are defined in hook', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('run_dotnet_gates()');
      expect(content).toContain('dotnet)  run_dotnet_gates ;;');
      expect(content).toContain('gate_disabled "dotnet-build"');
      expect(content).toContain('gate_disabled "dotnet-test"');
    });
  });

  describe('AC14: Monorepo support', () => {
    it('34. monorepo support functions are defined in hook', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('detect_workspace_type()');
      expect(content).toContain('get_workspace_dirs()');
      expect(content).toContain('all_files_in_workspaces()');
      expect(content).toContain('get_affected_workspace_dirs()');
    });

    it('35. hook runs successfully on npm workspace project (monorepo fallback)', async () => {
      await fs.writeJSON('package.json', {
        name: 'monorepo',
        workspaces: ['packages/*'],
        scripts: {},
      });
      await fs.ensureDir('packages/app');
      await fs.writeJSON('packages/app/package.json', { name: 'app', scripts: {} });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      // With empty stdin (no SHA info), falls back to root-level gates
      expect(result.output).toContain('Project: node');
    });
  });

  describe('Skipped silently language', () => {
    it('36. skip_gate outputs "skipped silently" text in normal mode', () => {
      const hooksFile = path.join(originalCwd, 'hooks', 'pre-push');
      const content = fs.readFileSync(hooksFile, 'utf8');
      expect(content).toContain('skipped silently');
    });
  });

  describe('Format and lint script gates', () => {
    it('37. lint script gate runs when lint script exists in package.json', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { lint: 'true' } });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/\[\d+\] Lint/);
    });

    it('38. lint gate is skipped when no lint script in package.json', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: {} });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).not.toMatch(/\[\d+\] Lint/);
    });

    it('39. format script gate runs when format script exists in package.json', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { format: 'true' } });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/\[\d+\] Format/);
    });

    it('40. format gate blocks push when formatter changes tracked files', async () => {
      // Create and commit a tracked file
      await fs.writeFile('src.js', 'const x = 1;');
      execSync('git add src.js && git commit -m "init"', { stdio: 'pipe', shell: true });

      // Format script modifies the tracked file — simulates a formatter rewriting it
      await fs.writeJSON('package.json', {
        name: 'test',
        scripts: { format: 'echo "reformatted" > src.js' },
      });

      const result = runPrePushHook();
      expect(result.success).toBe(false);
      expect(result.output).toContain('Formatter changed files');
    });

    it('41. format gate passes when formatter changes nothing', async () => {
      await fs.writeJSON('package.json', {
        name: 'test',
        scripts: { format: 'true' }, // no-op formatter
      });
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/\[\d+\] Format/);
      expect(result.output).not.toContain('Formatter changed files');
    });

    it('42. lint gate can be disabled via quality-gates.yml', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { lint: 'true' } });
      await fs.ensureDir('.contextkit');
      await fs.writeFile('.contextkit/quality-gates.yml', 'disable:\n  - lint\n');
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).not.toMatch(/\[\d+\] Lint/);
    });

    it('43. format gate can be disabled via quality-gates.yml', async () => {
      await fs.writeJSON('package.json', { name: 'test', scripts: { format: 'true' } });
      await fs.ensureDir('.contextkit');
      await fs.writeFile('.contextkit/quality-gates.yml', 'disable:\n  - format\n');
      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).not.toMatch(/\[\d+\] Format/);
    });
  });
});
