const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  dim: (str) => str,
}));

const note = require('../../lib/commands/note');

const CORRECTIONS_SKELETON = `# ContextKit Corrections Log

## Recent Sessions

<!-- Add session entries here -->
`;

describe('NoteCommand', () => {
  let tmpDir;
  let originalCwd;
  let consoleSpy;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-note-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
    consoleSpy.mockRestore();
  });

  async function writeCorrections(content = CORRECTIONS_SKELETON) {
    await fs.ensureDir(path.join(tmpDir, '.contextkit'));
    await fs.writeFile(path.join(tmpDir, '.contextkit', 'corrections.md'), content);
  }

  it('1. returns early when no message is provided', async () => {
    await note(undefined, {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Please provide a message/);
  });

  it('2. returns early when corrections.md does not exist', async () => {
    await note('some note', {});
    const logged = consoleSpy.mock.calls.map(c => c.join(' ')).join(' ');
    expect(logged).toMatch(/Corrections log not found/);
  });

  it('3. creates a new session when none exists for today', async () => {
    await writeCorrections();
    await note('AI hallucinated an import', {});
    const content = await fs.readFile(path.join(tmpDir, '.contextkit', 'corrections.md'), 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    expect(content).toContain(today);
    expect(content).toContain('AI hallucinated an import');
  });

  it('4. adds note to existing session when one already exists for today', async () => {
    const today = new Date().toISOString().split('T')[0];
    const existingSession = `### ${today} - Development Session\n\n**Changes**: work\n\n#### AI Behavior\n\n- existing note [MEDIUM]\n\n`;
    await writeCorrections(`# ContextKit Corrections Log\n\n## Recent Sessions\n\n${existingSession}`);

    await note('new note', { category: 'AI Behavior' });

    const content = await fs.readFile(path.join(tmpDir, '.contextkit', 'corrections.md'), 'utf-8');
    expect(content).toContain('existing note');
    expect(content).toContain('new note');
  });

  it('5. respects --category option in new session', async () => {
    await writeCorrections();
    await note('wrong style used', { category: 'Rule Updates' });
    const content = await fs.readFile(path.join(tmpDir, '.contextkit', 'corrections.md'), 'utf-8');
    expect(content).toContain('Rule Updates');
    expect(content).toContain('wrong style used');
  });

  it('6. respects --priority option', async () => {
    await writeCorrections();
    await note('critical issue', { priority: 'HIGH' });
    const content = await fs.readFile(path.join(tmpDir, '.contextkit', 'corrections.md'), 'utf-8');
    expect(content).toContain('[HIGH]');
  });
});
