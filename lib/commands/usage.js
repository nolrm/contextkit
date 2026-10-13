const chalk = require('chalk');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { SKILLS } = require('../skills/registry');
const { RETIRED_SKILLS } = require('../skills/retired');

// ck usage — which skills actually get used, from local session logs only.
// Nothing is sent anywhere. Claude Code: `Skill` tool calls and SKILL.md reads
// (model-invoked) vs `<command-name>` tags (typed by you). Codex: real
// SKILL.md reads from tool calls — the startup prompt lists every skill path,
// so plain path mentions are ignored.

const SKILL_PATH = /skills\/([a-z0-9][a-z0-9-]*)\/SKILL\.md/g;
const CODEX_CALL_TYPES = new Set(['function_call', 'custom_tool_call', 'local_shell_call']);

class UsageCommand {
  constructor({ homeDir = os.homedir(), env = process.env, cwd = process.cwd() } = {}) {
    this.homeDir = homeDir;
    this.env = env;
    this.cwd = cwd;
  }

  claudeProjectDirs() {
    const roots = new Set([path.join(this.homeDir, '.claude')]);
    if (this.env.CLAUDE_CONFIG_DIR) roots.add(this.env.CLAUDE_CONFIG_DIR);
    return [...roots].map((root) => path.join(root, 'projects'));
  }

  codexSessionsDir() {
    return path.join(this.env.CODEX_HOME || path.join(this.homeDir, '.codex'), 'sessions');
  }

  async listJsonl(dir) {
    if (!(await fs.pathExists(dir))) return [];
    const out = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await this.listJsonl(full)));
      else if (entry.name.endsWith('.jsonl')) out.push(full);
    }
    return out;
  }

  // Claude Code names project dirs after the cwd with separators turned into `-`.
  claudeProjectKey(dir) {
    return dir.replace(/[^a-zA-Z0-9]/g, '-');
  }

  record(stats, name, kind, tool, date) {
    if (!name) return;
    const row = stats.get(name) || { name, model: 0, typed: 0, tools: new Set(), last: null };
    row[kind]++;
    row.tools.add(tool);
    if (date && (!row.last || date > row.last)) row.last = date;
    stats.set(name, row);
  }

  parseLine(line) {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }

  async scanClaude(stats, { since, allProjects }) {
    const key = this.claudeProjectKey(this.cwd);
    for (const projectsDir of this.claudeProjectDirs()) {
      for (const file of await this.listJsonl(projectsDir)) {
        const projectDir = path.relative(projectsDir, file).split(path.sep)[0];
        if (!allProjects && projectDir !== key) continue;
        const content = await fs.readFile(file, 'utf-8');
        for (const line of content.split('\n')) {
          if (!line.includes('Skill') && !line.includes('SKILL.md') && !line.includes('command-name'))
            continue;
          const event = this.parseLine(line);
          if (!event) continue;
          const date = event.timestamp ? event.timestamp.slice(0, 10) : null;
          if (since && date && date < since) continue;
          const blocks = Array.isArray(event.message?.content) ? event.message.content : [];

          for (const block of blocks) {
            if (block?.type !== 'tool_use') continue;
            if (block.name === 'Skill') {
              this.record(stats, block.input?.skill, 'model', 'claude', date);
            } else {
              for (const match of JSON.stringify(block.input || {}).matchAll(SKILL_PATH)) {
                this.record(stats, match[1], 'model', 'claude', date);
              }
            }
          }

          if (event.type === 'user') {
            const text = JSON.stringify(event.message?.content ?? '');
            for (const match of text.matchAll(/<command-name>\/([a-zA-Z0-9:_-]+)/g)) {
              this.record(stats, match[1], 'typed', 'claude', date);
            }
          }
        }
      }
    }
  }

  async scanCodex(stats, { since, allProjects }) {
    for (const file of await this.listJsonl(this.codexSessionsDir())) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      const meta = this.parseLine(lines[0] || '');
      const sessionCwd = meta?.payload?.cwd;
      if (!allProjects && sessionCwd && path.resolve(sessionCwd) !== path.resolve(this.cwd)) {
        continue;
      }
      const dateMatch = file.match(/(\d{4})[/\\-](\d{2})[/\\-](\d{2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null;
      if (since && date && date < since) continue;

      const seen = new Set();
      for (const line of lines) {
        if (!line.includes('SKILL.md')) continue;
        const event = this.parseLine(line);
        if (!event || !CODEX_CALL_TYPES.has(event.payload?.type)) continue;
        for (const match of JSON.stringify(event.payload).matchAll(SKILL_PATH)) {
          seen.add(match[1]);
        }
      }
      for (const name of seen) this.record(stats, name, 'model', 'codex', date);
    }
  }

  /**
   * Collects usage rows.
   * @param {{days?: number, allProjects?: boolean}} options
   * @returns {Promise<Array<{name:string, model:number, typed:number, tools:string[], last:string|null, contextkit:string|null}>>}
   */
  async collect({ days = 90, allProjects = false } = {}) {
    const since = days
      ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
      : null;
    const stats = new Map();
    await this.scanClaude(stats, { since, allProjects });
    await this.scanCodex(stats, { since, allProjects });

    const current = new Set(SKILLS.map((s) => s.name));
    return [...stats.values()]
      .map((row) => ({
        ...row,
        tools: [...row.tools].sort(),
        contextkit: current.has(row.name) ? 'current' : RETIRED_SKILLS[row.name] ? 'retired' : null,
      }))
      .sort((a, b) => b.model + b.typed - (a.model + a.typed) || a.name.localeCompare(b.name));
  }

  async run(options = {}) {
    const days = options.days === undefined ? 90 : Number(options.days);
    const rows = await this.collect({ days, allProjects: !!options.all });

    if (options.json) {
      console.log(JSON.stringify(rows, null, 2));
      return rows;
    }

    const scope = options.all ? 'all projects' : 'this project';
    console.log(chalk.magenta(`📊 Skill usage — ${scope}, last ${days || 'all'} days\n`));
    if (rows.length === 0) {
      console.log(chalk.dim('No skill usage found in local Claude Code or Codex session logs.'));
      return rows;
    }

    const width = Math.max(5, ...rows.map((r) => r.name.length));
    console.log(
      chalk.bold(`${'Skill'.padEnd(width)}  Model  Typed  Tools          Last used   ContextKit`)
    );
    for (const row of rows) {
      const tag =
        row.contextkit === 'current' ? 'yes' : row.contextkit === 'retired' ? 'removed' : '';
      console.log(
        `${row.name.padEnd(width)}  ${String(row.model).padStart(5)}  ${String(row.typed).padStart(5)}  ${row.tools.join(',').padEnd(13)}  ${(row.last || '—').padEnd(10)}  ${tag}`
      );
    }

    const used = new Set(rows.map((r) => r.name));
    const unused = SKILLS.map((s) => s.name).filter((n) => !used.has(n));
    if (unused.length > 0) {
      console.log(chalk.dim(`\nNot used: ${unused.join(', ')}`));
    }
    console.log(
      chalk.dim('\nModel = loaded on demand by the AI · Typed = you ran /name · local logs only')
    );
    return rows;
  }
}

async function usage(options) {
  return new UsageCommand().run(options);
}

module.exports = usage;
module.exports.UsageCommand = UsageCommand;
