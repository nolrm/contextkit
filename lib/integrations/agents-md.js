// Canonical AGENTS.md body — the one main context file every tool reads.
// CLAUDE.md imports it (@AGENTS.md); Codex, OpenCode, Cursor and others read it
// directly; tools that may not (Copilot, Windsurf, Aider) get this same body in
// their own bridge file, so there is one source of truth for the text.

function renderAgentsMd() {
  const { version } = require('../../package.json');
  return `# Project Context (ContextKit)

Version: ${version}

This project uses [ContextKit](https://github.com/nolrm/contextkit). The files below are its AI context.

## Always

- Read \`.contextkit/standards/index.md\` first — project rules and where to find more.
- If \`.contextkit/goals/\` has a goal file with \`status: active\`, read it before starting work.
- Before repeating a known mistake, check \`.contextkit/corrections.md\`.

## Read When Relevant

| When you… | Read |
|---|---|
| write or change code | \`.contextkit/standards/code-style.md\` |
| write or change tests | \`.contextkit/standards/testing.md\` |
| touch structure, boundaries, or data flow | \`.contextkit/standards/architecture.md\` |
| work as an agent (commits, when to ask) | \`.contextkit/standards/ai-guidelines.md\` |
| follow team process (branches, releases) | \`.contextkit/standards/workflows.md\` |
| meet an unfamiliar project term | \`.contextkit/standards/glossary.md\` |
| propose a design or roadmap change | \`.contextkit/product/decisions.md\`, \`.contextkit/product/roadmap.md\` |

Some of these also load automatically when you touch matching files (path-scoped rules).

## Skills

\`ck\` (status · setup · update · tidy) · \`doc\` · \`learn\` · \`goal\` · \`headline\` — run as \`/name\` in Claude Code and Cursor, \`$name\` in Codex.`;
}

/** Writes the canonical block into AGENTS.md, keeping any text outside it. */
async function writeAgentsMd() {
  const { writeMarkedBlock } = require('./base-integration');
  await writeMarkedBlock('AGENTS.md', renderAgentsMd());
}

module.exports = { renderAgentsMd, writeAgentsMd };
