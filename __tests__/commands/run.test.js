const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  magenta: (str) => str,
  cyan: (str) => str,
  dim: (str) => str,
  bold: (str) => str,
}));

jest.mock('ora', () => () => ({
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
}));

const run = require('../../lib/commands/run');

const WORKFLOW_WITH_STEPS = `# Test Workflow

<process_flow>
<step number="1" name="Setup">
ACTION: initialize the project
ACTION: verify dependencies
</step>
<step number="2" name="Execute">
1. run the tests
2. check coverage
</step>
</process_flow>
`;

const WORKFLOW_PLAIN = `# Plain Workflow

Just some markdown without XML tags.
`;

describe('RunCommand', () => {
  let tmpDir;
  let originalCwd;
  let consoleSpy;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-run-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
    consoleSpy.mockRestore();
  });

  async function writeWorkflow(name, content) {
    await fs.ensureDir(path.join(tmpDir, '.contextkit', 'commands'));
    await fs.writeFile(path.join(tmpDir, '.contextkit', 'commands', `${name}.md`), content);
  }

  it('1. logs error when workflow file is not found', async () => {
    await run('nonexistent-workflow', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Workflow not found/);
    expect(logged).toMatch(/nonexistent-workflow/);
  });

  it('2. searched paths are listed when workflow not found', async () => {
    await run('missing', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/\.contextkit\/commands\/missing\.md/);
  });

  it('3. parseWorkflow extracts steps from XML-tagged content', async () => {
    await writeWorkflow('test-flow', WORKFLOW_WITH_STEPS);
    await run('test-flow', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Executing 2 step/);
  });

  it('4. parseWorkflow handles plain markdown with no process_flow tags', async () => {
    await writeWorkflow('plain-flow', WORKFLOW_PLAIN);
    await run('plain-flow', {});
    // Should not crash — just no steps to execute
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/completed successfully/i);
  });

  it('5. extractInstructions picks up ACTION directives from step content', async () => {
    await writeWorkflow('action-flow', WORKFLOW_WITH_STEPS);
    await run('action-flow', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/initialize the project/);
  });

  it('6. extractInstructions picks up numbered steps from step content', async () => {
    await writeWorkflow('numbered-flow', WORKFLOW_WITH_STEPS);
    await run('numbered-flow', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/run the tests/);
  });

  it('7. non-interactive run with found workflow completes without error', async () => {
    await writeWorkflow('simple-flow', WORKFLOW_WITH_STEPS);
    await expect(run('simple-flow', {})).resolves.not.toThrow();
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/completed successfully/i);
  });
});
