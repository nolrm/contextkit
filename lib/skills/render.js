// Renders a lib/skills/registry.js entry into the SKILL.md/prompt text for a
// given target, so every generator (Claude, Codex, Cursor, .agents/skills,
// global) draws from one description instead of retyping it.

const CMD_PREFIX = { claude: '/', cursor: '/', codex: '$', agents: '' };

function cmdRef(name, target) {
  const prefix = CMD_PREFIX[target] ?? '';
  return prefix ? `\`${prefix}${name}\`` : `\`${name}\``;
}

function resolveBody(body, target) {
  return body.replace(/\{\{cmd:([a-z0-9-]+)\}\}/g, (_, name) => cmdRef(name, target));
}

// Always-single-quoted YAML scalar — safe for values containing `"`, `|`, `<`, `>`.
function yamlScalar(str) {
  return `'${String(str).replace(/'/g, "''")}'`;
}

function buildFrontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

// Claude Code: rich frontmatter (allowed-tools, effort, context, argument-hint).
function renderClaude(entry) {
  const fields = { description: entry.description };
  if (entry.argumentHint) fields['argument-hint'] = yamlScalar(entry.argumentHint);
  if (entry.claude?.allowedTools) fields['allowed-tools'] = entry.claude.allowedTools;
  if (entry.claude?.effort) fields.effort = entry.claude.effort;
  if (entry.claude?.context) fields.context = entry.claude.context;

  const body = resolveBody(entry.body, 'claude');
  return `${buildFrontmatter(fields)}

Read \`.contextkit/${entry.source.replace(/^commands\//, 'commands/')}\` and execute the ${entry.name.replace(/-/g, ' ')} workflow.

${body}
`;
}

// Codex CLI: minimal frontmatter (name, description only — matches the CLI's
// documented required fields).
function renderCodex(entry) {
  const fields = { name: entry.name, description: entry.description };
  const body = resolveBody(entry.body, 'codex');
  return `${buildFrontmatter(fields)}

Read \`.contextkit/${entry.source}\` and execute the ${entry.name.replace(/-/g, ' ')} workflow.

${body}
`;
}

// Portable .agents/skills target (Agent Skills open standard): name +
// description only — no tool-specific frontmatter, so it stays valid across
// every compliant client (Codex, Cursor, and others that adopt the standard).
function renderAgents(entry) {
  const fields = { name: entry.name, description: entry.description };
  const body = resolveBody(entry.body, 'agents');
  return `${buildFrontmatter(fields)}

Read \`.contextkit/${entry.source}\` and execute the ${entry.name.replace(/-/g, ' ')} workflow.

${body}
`;
}

// Cursor prompts (.cursor/prompts/<name>.md): legacy format — a heading and
// body, no frontmatter. (Cursor's newer Agent Skills format is covered by the
// .agents/skills output instead — see cursor-integration.js.)
function renderCursorPrompt(entry) {
  const title = entry.name
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  const body = resolveBody(entry.body, 'cursor');
  return `# ${title}

Read \`.contextkit/${entry.source}\` and execute the ${entry.name.replace(/-/g, ' ')} workflow.

${body}
`;
}

function renderWrapper(entry, target) {
  switch (target) {
    case 'claude':
      return renderClaude(entry);
    case 'codex':
      return renderCodex(entry);
    case 'agents':
      return renderAgents(entry);
    case 'cursor':
      return renderCursorPrompt(entry);
    default:
      throw new Error(`Unknown render target: ${target}`);
  }
}

module.exports = { renderWrapper, resolveBody, cmdRef, yamlScalar, buildFrontmatter };
