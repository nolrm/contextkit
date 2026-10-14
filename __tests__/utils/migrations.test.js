const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  blue: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  red: (str) => str,
}));

const MigrationRunner = require('../../lib/utils/migrations');

describe('MigrationRunner', () => {
  let tmpDir;
  let originalCwd;
  let configPath;
  let runner;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-migrations-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    await fs.ensureDir(path.join(tmpDir, '.contextkit'));
    configPath = path.join(tmpDir, '.contextkit', 'config.yml');
    runner = new MigrationRunner();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('1. migrates to the current format_version when field is missing (treats as v0)', async () => {
    await fs.writeFile(configPath, 'ck: 1\nversion: "0.12.0"\n');

    await runner.run(undefined, configPath);

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('format_version: 3');
  });

  it('2. migrates to the current format_version when format_version is explicitly 0', async () => {
    await fs.writeFile(configPath, 'ck: 1\nformat_version: 0\nversion: "0.12.0"\n');

    await runner.run(0, configPath);

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('format_version: 3');
  });

  it('3. does not run migration when format_version already matches current', async () => {
    const original = 'ck: 1\nformat_version: 3\nversion: "1.0.0"\n';
    await fs.writeFile(configPath, original);

    await runner.run(3, configPath);

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toBe(original); // unchanged
  });

  it('4. does not duplicate format_version field if already present in config', async () => {
    await fs.writeFile(configPath, 'ck: 1\nformat_version: 1\nversion: "1.0.0"\n');

    await runner.run(0, configPath); // force run from v0 anyway

    const content = await fs.readFile(configPath, 'utf8');
    const occurrences = (content.match(/format_version:/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('5. preserves all existing config content after migration', async () => {
    await fs.writeFile(configPath, 'ck: 1\nversion: "0.12.0"\nproject_name: "my-app"\n');

    await runner.run(undefined, configPath);

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('ck: 1');
    expect(content).toContain('version: "0.12.0"');
    expect(content).toContain('project_name: "my-app"');
    expect(content).toContain('format_version: 3');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it('6. null format_version is treated as v0 — migration runs', async () => {
    await fs.writeFile(configPath, 'ck: 1\nversion: "0.12.0"\n');

    await runner.run(null, configPath);

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('format_version: 3');
  });

  it('7. format_version higher than current logs warning and does not modify config', async () => {
    const original = 'ck: 1\nformat_version: 99\nversion: "99.0.0"\n';
    await fs.writeFile(configPath, original);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runner.run(99, configPath);
    consoleSpy.mockRestore();

    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toBe(original); // unchanged
  });

  it('8. run() with matching version is a no-op — no file write occurs', async () => {
    await fs.writeFile(configPath, 'format_version: 3\n');
    const statBefore = await fs.stat(configPath);

    await runner.run(3, configPath);

    const statAfter = await fs.stat(configPath);
    expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
  });

  it('9. migration is idempotent — running twice produces the same result', async () => {
    await fs.writeFile(configPath, 'ck: 1\nversion: "0.12.0"\n');

    await runner.run(undefined, configPath);
    const afterFirst = await fs.readFile(configPath, 'utf8');

    await runner.run(0, configPath); // run again from v0
    const afterSecond = await fs.readFile(configPath, 'utf8');

    expect(afterFirst).toBe(afterSecond);
  });

  it('10. migration runner is a class — can be instantiated independently', () => {
    expect(runner).toBeInstanceOf(MigrationRunner);
    expect(typeof runner.run).toBe('function');
  });

  // ── v1 → v2 (2.0) ───────────────────────────────────────────────────────────

  const V1_CONFIG = `ck: 1
format_version: 1
required:
  - standards/code-style.md
features:
  pre_push_hook: true
  squad_ci_workflow: true

# Response style (checked by ai-guidelines.md and /analyze — see standards/ai-guidelines.md#response-style)
response_style:
  chat_minimal_words: false  # plain-text, terse chat explanations
  diagrams_in_docs: true   # allow Mermaid

metadata:
  generated_by: contextkit@1.13.0
`;

  it('11. v1→v2 replaces response_style with headline + diagrams_in_docs, keeping values', async () => {
    await fs.writeFile(configPath, V1_CONFIG);
    await runner.run(1, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).not.toContain('response_style');
    expect(content).not.toContain('# Response style');
    expect(content).toMatch(/^headline: false$/m);
    expect(content).toMatch(/^diagrams_in_docs: true$/m);
    expect(content).toContain('metadata:');
  });

  it('12. v1→v2 drops squad_ci_workflow and requires index.md', async () => {
    await fs.writeFile(configPath, V1_CONFIG);
    await runner.run(1, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).not.toContain('squad_ci_workflow');
    expect(content).toContain('  pre_push_hook: true');
    expect(content).toMatch(/required:\n {2}- standards\/index\.md\n/);
  });

  it('13. v1→v2 creates the index.md skeleton and removes retired command files', async () => {
    await fs.writeFile(configPath, V1_CONFIG);
    await fs.ensureDir(path.join(tmpDir, '.contextkit/commands/squad'));
    await fs.writeFile(path.join(tmpDir, '.contextkit/commands/squad/squad.md'), '# old');
    await fs.ensureDir(path.join(tmpDir, '.contextkit/commands/dev'));
    await fs.writeFile(path.join(tmpDir, '.contextkit/commands/dev/analyze.md'), '# keep');
    await runner.run(1, configPath);
    expect(await fs.pathExists(path.join(tmpDir, '.contextkit/standards/index.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, '.contextkit/commands/squad'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, '.contextkit/commands/dev/analyze.md'))).toBe(
      true
    );
  });

  it('14. v1→v2 keeps an existing index.md untouched', async () => {
    await fs.writeFile(configPath, V1_CONFIG);
    await fs.ensureDir(path.join(tmpDir, '.contextkit/standards'));
    await fs.writeFile(path.join(tmpDir, '.contextkit/standards/index.md'), '# Mine\n');
    await runner.run(1, configPath);
    expect(await fs.readFile(path.join(tmpDir, '.contextkit/standards/index.md'), 'utf8')).toBe(
      '# Mine\n'
    );
  });

  it('15. v1→v2 defaults headline on when chat_minimal_words was true', async () => {
    await fs.writeFile(
      configPath,
      V1_CONFIG.replace('chat_minimal_words: false', 'chat_minimal_words: true')
    );
    await runner.run(1, configPath);
    expect(await fs.readFile(configPath, 'utf8')).toMatch(/^headline: true$/m);
  });

  // ── v2 → v3 (2.1.1) ─────────────────────────────────────────────────────────

  const V2_CONFIG = `ck: 1
format_version: 2
required:
  - standards/index.md

# Optional standards (warn if missing)
optional:
  - standards/architecture.md

# Conditional loading rules
conditionals:
  - when: react
    load: [standards/code-style.md, standards/testing.md]
  - when: css
    load: [standards/code-style/css-style.md]

# Features
features:
  pre_push_hook: true

# Paths (customize for your project)
paths:
  components: "src/components"
  tests: "src/__tests__"
  stories: "src/stories"
  docs: "docs"

# Commands
commands:
  analyze: "@.contextkit/commands/dev/analyze.md"
  review: "@.contextkit/commands/dev/review.md"

metadata:
  generated_by: contextkit@1.6.0
`;

  it('16. v2→v3 strips the dead commands/paths/conditionals blocks', async () => {
    await fs.writeFile(configPath, V2_CONFIG);
    await runner.run(2, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).not.toMatch(/^conditionals:/m);
    expect(content).not.toMatch(/^paths:/m);
    expect(content).not.toMatch(/^commands:/m);
    expect(content).not.toContain('# Conditional loading rules');
    expect(content).not.toContain('# Paths (customize for your project)');
    expect(content).not.toContain('# Commands');
  });

  it('17. v2→v3 preserves unrelated content and bumps format_version', async () => {
    await fs.writeFile(configPath, V2_CONFIG);
    await runner.run(2, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('format_version: 3');
    expect(content).toMatch(/required:\n {2}- standards\/index\.md/);
    expect(content).toContain('# Optional standards (warn if missing)');
    expect(content).toMatch(/^[ \t]+pre_push_hook: true$/m);
    expect(content).toContain('metadata:');
    expect(content).toContain('generated_by: contextkit@1.6.0');
  });

  it("18. v2→v3 is a no-op for the fields when they're already absent", async () => {
    const config = 'ck: 1\nformat_version: 2\nrequired:\n  - standards/index.md\n';
    await fs.writeFile(configPath, config);
    await runner.run(2, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('format_version: 3');
    expect(content).toContain('required:\n  - standards/index.md');
  });

  it("19. v2→v3 doesn't touch context_rules' nested (indented) paths: key", async () => {
    const config = `ck: 1
format_version: 2
context_rules:
  - file: standards/testing.md
    paths: ["**/*.test.*"]
`;
    await fs.writeFile(configPath, config);
    await runner.run(2, configPath);
    const content = await fs.readFile(configPath, 'utf8');
    expect(content).toContain('context_rules:');
    expect(content).toContain('paths: ["**/*.test.*"]');
  });
});
