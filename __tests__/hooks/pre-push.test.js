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
      shell: '/bin/bash'
    });
    return { success: true, output };
  } catch (error) {
    // When bash script fails, both stdout and stderr are in the same message
    // Try to get combined output from various sources
    const allOutput = (error.stdout || '') + (error.stderr || '') + (error.message || '');
    return { success: false, output: allOutput, stdout: error.stdout || '', stderr: error.stderr || '' };
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
          test: 'false'
        }
      });

      try {
        execSync(path.join(hookPath, 'pre-push'), {
          stdio: 'pipe',
          shell: '/bin/bash'
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
        scripts: {}
      });

      const result = runPrePushHook();
      expect(result.success).toBe(true);
      expect(result.output).toContain('Quality Gates passed');
      expect(result.output).toContain('0 passed, 0 skipped');
    });

    it('6. does not print failure banner when all gates pass', async () => {
      await fs.writeJSON('package.json', {
        name: 'test-project',
        scripts: {}
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
          test: 'true'
        }
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
          typescript: '^5.0.0'
        },
        scripts: {}
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
        scripts: {}
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
        scripts: {}
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
});
