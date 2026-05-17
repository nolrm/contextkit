const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ClaudeSettings = require('../../lib/utils/claude-settings');

jest.mock('chalk', () => ({
  red: (s) => s,
  green: (s) => s,
  yellow: (s) => s,
  blue: (s) => s,
  bold: (s) => s,
  cyan: (s) => s,
  dim: (s) => s,
}));

describe('ClaudeSettings', () => {
  let tmpDir;
  let originalCwd;
  let settings;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ck-claudesettings-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
    settings = new ClaudeSettings();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  // ── read() ─────────────────────────────────────────────────────────────────

  it('1. read() returns empty object when file does not exist', async () => {
    const result = await settings.read();
    expect(result).toEqual({});
  });

  it('2. read() returns parsed JSON when file exists', async () => {
    await fs.ensureDir('.claude');
    await fs.writeJson('.claude/settings.json', { permissions: ['read'] });
    const result = await settings.read();
    expect(result).toEqual({ permissions: ['read'] });
  });

  it('3. read() returns empty object and warns on invalid JSON', async () => {
    await fs.ensureDir('.claude');
    await fs.writeFile('.claude/settings.json', '{ broken json }');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await settings.read();
    expect(result).toEqual({});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid JSON'));
    warnSpy.mockRestore();
  });

  // ── write() ────────────────────────────────────────────────────────────────

  it('4. write() creates .claude directory and writes settings with 2-space indent and trailing newline', async () => {
    await settings.write({ foo: 'bar' });
    expect(await fs.pathExists('.claude/settings.json')).toBe(true);
    const raw = await fs.readFile('.claude/settings.json', 'utf8');
    expect(raw).toBe('{\n  "foo": "bar"\n}\n');
  });

  // ── addPostToolUseHook() ───────────────────────────────────────────────────

  it('5. addPostToolUseHook() creates settings.json with hook when file does not exist', async () => {
    await settings.addPostToolUseHook('pnpm run format');
    const data = await fs.readJson('.claude/settings.json');
    expect(data.hooks.PostToolUse).toHaveLength(1);
    expect(data.hooks.PostToolUse[0]).toMatchObject({
      matcher: 'Edit|Write',
      hooks: [{ type: 'command', command: 'pnpm run format' }],
      _contextkit: true,
    });
  });

  it('6. addPostToolUseHook() merges into existing settings without removing other keys', async () => {
    await fs.ensureDir('.claude');
    await fs.writeJson('.claude/settings.json', {
      permissions: ['read', 'write'],
      hooks: {
        PostToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo hi' }] }],
      },
    });
    await settings.addPostToolUseHook('npm run lint');
    const data = await fs.readJson('.claude/settings.json');
    expect(data.permissions).toEqual(['read', 'write']);
    expect(data.hooks.PostToolUse).toHaveLength(2);
    expect(data.hooks.PostToolUse[0].matcher).toBe('Bash');
    expect(data.hooks.PostToolUse[1]._contextkit).toBe(true);
  });

  it('7. addPostToolUseHook() replaces existing _contextkit entry instead of duplicating', async () => {
    await settings.addPostToolUseHook('npm run format');
    await settings.addPostToolUseHook('pnpm run format');
    const data = await fs.readJson('.claude/settings.json');
    const ckEntries = data.hooks.PostToolUse.filter((e) => e._contextkit);
    expect(ckEntries).toHaveLength(1);
    expect(ckEntries[0].hooks[0].command).toBe('pnpm run format');
  });

  it('8. addPostToolUseHook() throws when command is empty string', async () => {
    await expect(settings.addPostToolUseHook('')).rejects.toThrow('hook command is required');
  });

  it('9. addPostToolUseHook() throws when command is null', async () => {
    await expect(settings.addPostToolUseHook(null)).rejects.toThrow('hook command is required');
  });

  it('10. addPostToolUseHook() preserves invalid PostToolUse under _contextkit_original_invalid', async () => {
    await fs.ensureDir('.claude');
    await fs.writeJson('.claude/settings.json', {
      hooks: { PostToolUse: 'not-an-array' },
    });
    await settings.addPostToolUseHook('npm run lint');
    const data = await fs.readJson('.claude/settings.json');
    expect(data.hooks._contextkit_original_invalid).toBe('not-an-array');
    expect(Array.isArray(data.hooks.PostToolUse)).toBe(true);
    expect(data.hooks.PostToolUse).toHaveLength(1);
  });

  // ── removeContextKitHooks() ────────────────────────────────────────────────

  it('11. removeContextKitHooks() removes _contextkit entries and leaves others intact', async () => {
    await fs.ensureDir('.claude');
    await fs.writeJson('.claude/settings.json', {
      hooks: {
        PostToolUse: [
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo hi' }] },
          {
            matcher: 'Edit|Write',
            hooks: [{ type: 'command', command: 'npm run lint' }],
            _contextkit: true,
          },
        ],
      },
    });
    await settings.removeContextKitHooks();
    const data = await fs.readJson('.claude/settings.json');
    expect(data.hooks.PostToolUse).toHaveLength(1);
    expect(data.hooks.PostToolUse[0].matcher).toBe('Bash');
  });

  it('12. removeContextKitHooks() deletes PostToolUse key when array becomes empty', async () => {
    await settings.addPostToolUseHook('npm run format');
    await settings.removeContextKitHooks();
    const data = await fs.readJson('.claude/settings.json');
    expect(data.hooks).toBeUndefined();
  });

  it('13. removeContextKitHooks() is a no-op when no settings file exists', async () => {
    await expect(settings.removeContextKitHooks()).resolves.not.toThrow();
  });

  it('14. removeContextKitHooks() is a no-op when PostToolUse is not an array', async () => {
    await fs.ensureDir('.claude');
    await fs.writeJson('.claude/settings.json', { hooks: { PostToolUse: 'not-an-array' } });
    await expect(settings.removeContextKitHooks()).resolves.not.toThrow();
  });

  // ── write() JSON shape ─────────────────────────────────────────────────────

  it('15. written hook entry matches the specified shape exactly', async () => {
    await settings.addPostToolUseHook('yarn lint:fix 2>&1 | tail -20');
    const data = await fs.readJson('.claude/settings.json');
    expect(data.hooks.PostToolUse[0]).toEqual({
      matcher: 'Edit|Write',
      hooks: [{ type: 'command', command: 'yarn lint:fix 2>&1 | tail -20' }],
      _contextkit: true,
    });
  });
});
