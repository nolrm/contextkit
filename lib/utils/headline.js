const fs = require('fs-extra');
const path = require('path');

// Headline — always-on response style. Lives in its own marker block (separate
// from the main ContextKit block) so it can be added, removed, or shared on its
// own — the /headline skill writes this exact block in projects without
// ContextKit too. commands/addons/headline.md embeds the same text; a test
// keeps the two in sync.

const HEADLINE_START = '<!-- headline:start -->';
const MIRROR_FILES = ['.github/copilot-instructions.md', '.windsurfrules', 'CONVENTIONS.md'];
const HEADLINE_END = '<!-- headline:end -->';

const HEADLINE_RULES = `## Response Style (headline)

- Lead with the result or answer.
- Don't narrate reasoning or recap what you did.
- Plain sentences; tables only when comparing.
- Ask with options, not open-ended questions.
- Say plainly when something failed or was skipped.
- Code, commands, and paths stay complete — only prose gets shorter.`;

function renderHeadlineBlock() {
  return `${HEADLINE_START}\n${HEADLINE_RULES}\n${HEADLINE_END}`;
}

function hasHeadline(content) {
  return content.includes(HEADLINE_START) && content.includes(HEADLINE_END);
}

/**
 * Removes the headline block (if any) from a string.
 * @param {string} content
 * @returns {string}
 */
function stripHeadline(content) {
  const start = content.indexOf(HEADLINE_START);
  const end = content.indexOf(HEADLINE_END);
  if (start === -1 || end === -1 || end < start) return content;
  const before = content.substring(0, start).trimEnd();
  const after = content.substring(end + HEADLINE_END.length).replace(/^\s*\n/, '');
  if (!before) return after;
  return after ? `${before}\n\n${after}` : `${before}\n`;
}

/**
 * Adds (or refreshes) the headline block at the end of a file, or removes it.
 * Creates the file when enabling and it doesn't exist.
 * @param {string} filePath
 * @param {boolean} enabled
 * @returns {Promise<boolean>} true when the file changed
 */
async function applyHeadline(filePath, enabled = true) {
  const exists = await fs.pathExists(filePath);
  if (!exists && !enabled) return false;

  const existing = exists ? await fs.readFile(filePath, 'utf-8') : '';
  const base = stripHeadline(existing).trimEnd();
  const next = enabled
    ? `${base ? `${base}\n\n` : ''}${renderHeadlineBlock()}\n`
    : base
      ? `${base}\n`
      : '';

  if (next === existing) return false;
  const dir = path.dirname(filePath);
  if (dir !== '.') await fs.ensureDir(dir);
  await fs.writeFile(filePath, next);
  return true;
}

/**
 * Applies the headline setting to the project's always-loaded instruction
 * files. AGENTS.md is the canonical home; files that mirror its body
 * (Copilot, Windsurf, Aider) get it too; CLAUDE.md only gets its own copy
 * when it doesn't already import @AGENTS.md (otherwise Claude would read the
 * block twice). Files that don't exist are left alone.
 * @param {boolean} enabled
 * @param {string} [cwd]
 * @returns {Promise<string[]>} files that changed
 */
async function applyHeadlineToProject(enabled = true, cwd = '.') {
  const agentsPath = path.join(cwd, 'AGENTS.md');
  const claudePath = path.join(cwd, 'CLAUDE.md');
  const hasAgents = await fs.pathExists(agentsPath);
  const hasClaude = await fs.pathExists(claudePath);
  const claudeImportsAgents =
    hasClaude && hasAgents && /^@AGENTS\.md\s*$/m.test(await fs.readFile(claudePath, 'utf-8'));

  const changed = [];
  if (hasAgents && (await applyHeadline(agentsPath, enabled))) changed.push('AGENTS.md');
  // Tools that get a copy of the AGENTS.md body instead of reading it
  for (const mirror of MIRROR_FILES) {
    const full = path.join(cwd, mirror);
    if ((await fs.pathExists(full)) && (await applyHeadline(full, enabled))) changed.push(mirror);
  }
  if (hasClaude) {
    const wantInClaude = enabled && !claudeImportsAgents;
    if (await applyHeadline(claudePath, wantInClaude)) changed.push('CLAUDE.md');
  }
  return changed;
}

module.exports = {
  applyHeadlineToProject,
  HEADLINE_START,
  HEADLINE_END,
  HEADLINE_RULES,
  renderHeadlineBlock,
  hasHeadline,
  stripHeadline,
  applyHeadline,
};
