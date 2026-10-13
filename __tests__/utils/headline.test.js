const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const {
  HEADLINE_START,
  HEADLINE_END,
  renderHeadlineBlock,
  hasHeadline,
  stripHeadline,
  applyHeadline,
  applyHeadlineToProject,
} = require('../../lib/utils/headline');

describe('headline', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-headline-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('1. renders a marker-delimited block with the response rules', () => {
    const block = renderHeadlineBlock();
    expect(block.startsWith(HEADLINE_START)).toBe(true);
    expect(block.endsWith(HEADLINE_END)).toBe(true);
    expect(block).toContain('Lead with the result or answer.');
  });

  it('2. the /headline skill embeds exactly the same block', async () => {
    const skill = await fs.readFile(
      path.join(__dirname, '../../commands/addons/headline.md'),
      'utf-8'
    );
    expect(skill).toContain(renderHeadlineBlock());
  });

  it('3. applyHeadline appends the block and keeps existing content', async () => {
    const file = path.join(tmpDir, 'AGENTS.md');
    await fs.writeFile(file, '# My rules\n\n- keep this\n');
    expect(await applyHeadline(file, true)).toBe(true);
    const content = await fs.readFile(file, 'utf-8');
    expect(content).toContain('- keep this');
    expect(hasHeadline(content)).toBe(true);
  });

  it('4. applyHeadline is idempotent', async () => {
    const file = path.join(tmpDir, 'AGENTS.md');
    await applyHeadline(file, true);
    expect(await applyHeadline(file, true)).toBe(false);
    const content = await fs.readFile(file, 'utf-8');
    expect(content.split(HEADLINE_START).length - 1).toBe(1);
  });

  it('5. applyHeadline(false) removes only the block', async () => {
    const file = path.join(tmpDir, 'CLAUDE.md');
    await fs.writeFile(file, `# Top\n\n${renderHeadlineBlock()}\n\n## After\n`);
    await applyHeadline(file, false);
    const content = await fs.readFile(file, 'utf-8');
    expect(hasHeadline(content)).toBe(false);
    expect(content).toContain('# Top');
    expect(content).toContain('## After');
  });

  it('6. applyHeadline(false) does not create a missing file', async () => {
    const file = path.join(tmpDir, 'missing.md');
    expect(await applyHeadline(file, false)).toBe(false);
    expect(await fs.pathExists(file)).toBe(false);
  });

  it('7. stripHeadline returns content unchanged when there is no block', () => {
    expect(stripHeadline('# Nothing here\n')).toBe('# Nothing here\n');
  });

  it('8. project apply skips CLAUDE.md when it imports @AGENTS.md', async () => {
    await fs.writeFile(path.join(tmpDir, 'AGENTS.md'), '# Agents\n');
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '@AGENTS.md\n');
    const changed = await applyHeadlineToProject(true, tmpDir);
    expect(changed).toEqual(['AGENTS.md']);
    const claude = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
    expect(hasHeadline(claude)).toBe(false);
  });

  it('9. project apply writes CLAUDE.md when it does not import AGENTS.md', async () => {
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Claude only\n');
    const changed = await applyHeadlineToProject(true, tmpDir);
    expect(changed).toEqual(['CLAUDE.md']);
  });

  it('10. project apply with enabled=false removes the block everywhere', async () => {
    await fs.writeFile(path.join(tmpDir, 'AGENTS.md'), `# A\n\n${renderHeadlineBlock()}\n`);
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), `# C\n\n${renderHeadlineBlock()}\n`);
    const changed = await applyHeadlineToProject(false, tmpDir);
    expect(changed.sort()).toEqual(['AGENTS.md', 'CLAUDE.md']);
  });
});
