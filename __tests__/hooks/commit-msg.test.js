const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

let tmpDir;
let originalCwd;
let hookPath;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-commit-msg-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);

  // Initialize a real git repo
  execSync('git init', { stdio: 'pipe' });
  execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
  execSync('git config user.name "Test User"', { stdio: 'pipe' });

  // Copy the actual commit-msg hook from the project
  hookPath = path.join(tmpDir, '.contextkit', 'hooks');
  await fs.ensureDir(hookPath);
  const sourceHook = path.join(originalCwd, '.contextkit', 'hooks', 'commit-msg');
  await fs.copy(sourceHook, path.join(hookPath, 'commit-msg'));
  await fs.chmod(path.join(hookPath, 'commit-msg'), 0o755);

  // Set the hook path
  execSync('git config core.hooksPath .contextkit/hooks', { stdio: 'pipe' });
});

afterEach(async () => {
  process.chdir(originalCwd);
  await fs.remove(tmpDir);
});

function runCommitMsgHook(message) {
  const msgFile = path.join(tmpDir, '.git', 'COMMIT_EDITMSG');
  fs.writeFileSync(msgFile, message);

  try {
    execSync(path.join(hookPath, 'commit-msg') + ` "${msgFile}"`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: '' };
  } catch (error) {
    return { success: false, output: error.stderr || error.stdout || error.message };
  }
}

describe('commit-msg hook', () => {
  describe('PO Spec: Subject Line Length Check', () => {
    it('1. accepts subject with exactly 10 characters (boundary test)', () => {
      const result = runCommitMsgHook('feat: 12345');
      expect(result.success).toBe(true);
    });

    it('2. rejects subject with less than 10 characters', () => {
      const result = runCommitMsgHook('feat: 123');
      expect(result.success).toBe(false);
      expect(result.output).toContain('too short');
    });

    it('3. accepts valid subject with no body', () => {
      const result = runCommitMsgHook('feat(auth): implement login validation');
      expect(result.success).toBe(true);
    });

    it('4. accepts valid subject with a long body (body is not measured)', () => {
      const message = `feat(core): add new validation logic

This is a much longer body that contains detailed implementation notes.
It goes over many lines and has lots of extra content.
The length check should only measure the subject line, not this body.
So even if the body pushes the total message length to hundreds of characters,
as long as the subject line is at least 10 characters, it should pass.`;
      const result = runCommitMsgHook(message);
      expect(result.success).toBe(true);
    });

    it('5. rejects short subject with a long body (body does not count toward length)', () => {
      const message = `fix: bug

This is a long body that would normally count toward the total message length.
But since we fixed the length check to only measure the subject line,
this should fail because the subject "fix: bug" is only 8 characters.`;
      const result = runCommitMsgHook(message);
      expect(result.success).toBe(false);
      expect(result.output).toContain('too short');
    });
  });

  describe('PO Spec: Check Order (Length Before Format)', () => {
    it('6. returns length error before format error for short subject', () => {
      const result = runCommitMsgHook('abc');
      // Should fail on length check first, not format
      expect(result.success).toBe(false);
      expect(result.output).toContain('too short');
    });

    it('7. returns format error when subject is long enough but malformed', () => {
      const result = runCommitMsgHook('this is a long subject but no colon');
      expect(result.success).toBe(false);
      expect(result.output).toContain('conventional format');
    });
  });

  describe('PO Spec: Conventional Format Check (Subject Line Only)', () => {
    it('8. accepts feat type with scope', () => {
      const result = runCommitMsgHook('feat(api): add new endpoint');
      expect(result.success).toBe(true);
    });

    it('9. accepts fix type with scope', () => {
      const result = runCommitMsgHook('fix(hooks): skip merge commits');
      expect(result.success).toBe(true);
    });

    it('10. accepts docs type without scope', () => {
      const result = runCommitMsgHook('docs: update README');
      expect(result.success).toBe(true);
    });

    it('11. accepts improve type', () => {
      const result = runCommitMsgHook('improve(cli): better error handling');
      expect(result.success).toBe(true);
    });

    it('12. accepts refactor, test, chore types', () => {
      const validTypes = [
        'refactor(utils): simplify logic',
        'test(integration): add new test case',
        'chore(deps): update dependencies'
      ];
      validTypes.forEach(msg => {
        const result = runCommitMsgHook(msg);
        expect(result.success).toBe(true);
      });
    });

    it('13. rejects style type (not allowed in this project)', () => {
      const result = runCommitMsgHook('style(format): adjust spacing');
      expect(result.success).toBe(false);
      expect(result.output).toContain('conventional format');
    });

    it('14. rejects unknown type', () => {
      const result = runCommitMsgHook('random: some change');
      expect(result.success).toBe(false);
      expect(result.output).toContain('conventional format');
    });

    it('15. rejects missing description after colon', () => {
      const result = runCommitMsgHook('feat(api):');
      expect(result.success).toBe(false);
      expect(result.output).toContain('conventional format');
    });

    it('16. allows body lines that do not match the pattern', () => {
      // Body line that looks like it could match the pattern should be ignored
      const message = `feat(api): main implementation

Some random text in the body that says feat: something else.
This should not cause a format error.`;
      const result = runCommitMsgHook(message);
      expect(result.success).toBe(true);
    });
  });

  describe('PO Spec: Edge Cases', () => {
    it('17. skips validation for Merge commits', () => {
      const result = runCommitMsgHook('Merge branch main into feature');
      expect(result.success).toBe(true);
    });

    it('18. skips validation for Revert commits', () => {
      const result = runCommitMsgHook('Revert "some previous commit"');
      expect(result.success).toBe(true);
    });

    it('19. skips validation for fixup commits', () => {
      const result = runCommitMsgHook('fixup! previous commit message');
      expect(result.success).toBe(true);
    });

    it('20. skips validation for squash commits', () => {
      const result = runCommitMsgHook('squash! previous commit message');
      expect(result.success).toBe(true);
    });

    it('21. multi-line message from -m "subject" -m "body" format', () => {
      // When git writes with multiple -m flags, it creates newlines in the file
      const message = `feat(core): new feature here

Body content on another line.`;
      const result = runCommitMsgHook(message);
      expect(result.success).toBe(true);
    });
  });

  describe('Additional Integration Tests', () => {
    it('22. message with scope containing parentheses passes', () => {
      const result = runCommitMsgHook('feat(api-v1): add endpoint');
      expect(result.success).toBe(true);
    });

    it('23. message with special characters in description passes', () => {
      const result = runCommitMsgHook('feat: add feature (with notes)');
      expect(result.success).toBe(true);
    });

    it('24. exactly 10 character subject with scope and type', () => {
      // "fix(x): ab" = 10 characters
      const result = runCommitMsgHook('fix(x): ab');
      expect(result.success).toBe(true);
    });

    it('25. exactly 9 character subject should fail', () => {
      // "fix(x): a" = 9 characters
      const result = runCommitMsgHook('fix(x): a');
      expect(result.success).toBe(false);
      expect(result.output).toContain('too short');
    });
  });
});
