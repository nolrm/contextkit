const fs = require('fs-extra');
const path = require('path');
const os = require('os');

jest.mock('chalk', () => ({
  magenta: (s) => s,
  bold: (s) => s,
  dim: (s) => s,
}));

const { UsageCommand } = require('../../lib/commands/usage');

const today = new Date().toISOString();

function claudeLine(obj) {
  return JSON.stringify({ timestamp: today, ...obj });
}

describe('ck usage', () => {
  let home;
  const projectCwd = '/work/my-app';

  beforeEach(async () => {
    home = await fs.mkdtemp(path.join(os.tmpdir(), 'contextkit-usage-'));
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    console.log.mockRestore();
    await fs.remove(home);
  });

  async function writeClaude(projectKey, lines) {
    const dir = path.join(home, '.claude', 'projects', projectKey);
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'session.jsonl'), lines.join('\n'));
  }

  async function writeCodex(cwd, lines) {
    const day = today.slice(0, 10).split('-');
    const dir = path.join(home, '.codex', 'sessions', ...day);
    await fs.ensureDir(dir);
    const meta = JSON.stringify({ type: 'session_meta', payload: { cwd } });
    await fs.writeFile(path.join(dir, 'rollout.jsonl'), [meta, ...lines].join('\n'));
  }

  it('1. counts Skill tool calls as model-invoked and command tags as typed', async () => {
    await writeClaude('-work-my-app', [
      claudeLine({
        type: 'assistant',
        message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'goal' } }] },
      }),
      claudeLine({ type: 'user', message: { content: '<command-name>/doc</command-name>' } }),
    ]);
    const cmd = new UsageCommand({ homeDir: home, env: {}, cwd: projectCwd });
    const rows = await cmd.collect();
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName.goal.model).toBe(1);
    expect(byName.doc.typed).toBe(1);
    expect(byName.goal.contextkit).toBe('current');
  });

  it('2. only counts this project unless allProjects is set', async () => {
    await writeClaude('-other-project', [
      claudeLine({
        type: 'assistant',
        message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'learn' } }] },
      }),
    ]);
    const cmd = new UsageCommand({ homeDir: home, env: {}, cwd: projectCwd });
    expect(await cmd.collect()).toEqual([]);
    const all = await cmd.collect({ allProjects: true });
    expect(all.map((r) => r.name)).toEqual(['learn']);
  });

  it('3. Codex: counts real SKILL.md reads, not startup skill lists', async () => {
    await writeCodex(projectCwd, [
      JSON.stringify({
        type: 'response_item',
        payload: { type: 'message', content: 'skills/squad/SKILL.md skills/goal/SKILL.md' },
      }),
      JSON.stringify({
        type: 'response_item',
        payload: { type: 'function_call', arguments: '{"cmd":"cat .codex/skills/goal/SKILL.md"}' },
      }),
    ]);
    const cmd = new UsageCommand({ homeDir: home, env: {}, cwd: projectCwd });
    const rows = await cmd.collect();
    expect(rows.map((r) => r.name)).toEqual(['goal']);
    expect(rows[0].tools).toEqual(['codex']);
  });

  it('4. marks removed skills as retired', async () => {
    await writeClaude('-work-my-app', [
      claudeLine({
        type: 'assistant',
        message: {
          content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'review' } }],
        },
      }),
    ]);
    const cmd = new UsageCommand({ homeDir: home, env: {}, cwd: projectCwd });
    const [row] = await cmd.collect();
    expect(row.contextkit).toBe('retired');
  });

  it('5. run --json prints machine-readable rows', async () => {
    const cmd = new UsageCommand({ homeDir: home, env: {}, cwd: projectCwd });
    const rows = await cmd.run({ json: true });
    expect(rows).toEqual([]);
    expect(console.log).toHaveBeenCalledWith('[]');
  });
});
