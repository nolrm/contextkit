const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const {
  DEFAULT_CONTEXT_RULES,
  readContextRules,
  ruleSlug,
  ruleFiles,
  writeContextRules,
} = require('../../lib/utils/context-rules');

describe('context-rules', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-context-rules-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  async function writeConfig(yaml) {
    await fs.ensureDir(path.join(tmpDir, '.contextkit'));
    await fs.writeFile(path.join(tmpDir, '.contextkit/config.yml'), yaml);
  }

  it('1. returns the defaults when there is no config', () => {
    expect(readContextRules(tmpDir)).toEqual(DEFAULT_CONTEXT_RULES);
  });

  it('2. returns the defaults when config has no context_rules key', async () => {
    await writeConfig('ck: 1\n');
    expect(readContextRules(tmpDir)).toEqual(DEFAULT_CONTEXT_RULES);
  });

  it('3. an explicit empty list means no rules', async () => {
    await writeConfig('context_rules: []\n');
    expect(readContextRules(tmpDir)).toEqual([]);
  });

  it('4. normalizes file prefixes, comma-separated paths, and drops invalid entries', async () => {
    await writeConfig(
      [
        'context_rules:',
        '  - file: .contextkit/standards/api.md',
        '    paths: "src/api/**, src/services/**"',
        '  - file: standards/empty.md',
        '    paths: []',
        '  - paths: ["x"]',
      ].join('\n')
    );
    expect(readContextRules(tmpDir)).toEqual([
      { file: 'standards/api.md', paths: ['src/api/**', 'src/services/**'] },
    ]);
  });

  it('5. slugs come from the file basename', () => {
    expect(ruleSlug('standards/State Management_guide.md')).toBe('state-management-guide');
  });

  it('6. ruleFiles maps each target to its directory and extension', () => {
    const rules = [{ file: 'standards/testing.md', paths: ['**/*.test.*'] }];
    expect(ruleFiles('claude', rules)).toEqual(['.claude/rules/contextkit-testing.md']);
    expect(ruleFiles('cursor', rules)).toEqual(['.cursor/rules/contextkit-testing.mdc']);
    expect(ruleFiles('copilot', rules)).toEqual([
      '.github/instructions/contextkit-testing.instructions.md',
    ]);
  });

  it('7. writes each tool format with its own frontmatter key', async () => {
    const rules = [{ file: 'standards/testing.md', paths: ['**/*.test.*', 'e2e/**'] }];
    await writeContextRules('claude', rules, { cwd: tmpDir });
    await writeContextRules('cursor', rules, { cwd: tmpDir });
    await writeContextRules('copilot', rules, { cwd: tmpDir });

    const read = (rel) => fs.readFile(path.join(tmpDir, rel), 'utf-8');
    expect(await read('.claude/rules/contextkit-testing.md')).toContain(
      'paths:\n  - "**/*.test.*"\n  - "e2e/**"'
    );
    expect(await read('.cursor/rules/contextkit-testing.mdc')).toContain(
      'globs: "**/*.test.*, e2e/**"'
    );
    expect(await read('.github/instructions/contextkit-testing.instructions.md')).toContain(
      'applyTo: "**/*.test.*,e2e/**"'
    );
  });

  it('8. removes stale contextkit-* rules but keeps listed and user-owned files', async () => {
    const dir = path.join(tmpDir, '.cursor/rules');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'contextkit-old.mdc'), 'old');
    await fs.writeFile(path.join(dir, 'contextkit-standards.mdc'), 'keep');
    await fs.writeFile(path.join(dir, 'mine.mdc'), 'mine');

    await writeContextRules('cursor', [{ file: 'standards/api.md', paths: ['src/api/**'] }], {
      keep: ['contextkit-standards.mdc'],
      cwd: tmpDir,
    });

    expect(await fs.readdir(dir)).toEqual(
      expect.arrayContaining(['contextkit-api.mdc', 'contextkit-standards.mdc', 'mine.mdc'])
    );
    expect(await fs.pathExists(path.join(dir, 'contextkit-old.mdc'))).toBe(false);
  });
});
