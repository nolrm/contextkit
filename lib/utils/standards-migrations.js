// Registry of content updates to *generic* (non-`/analyze`-customized) sections
// inside already-installed standards/*.md files. `ck update` (see
// update.js#applyStandardsMigrations) looks for each entry's exact `from` text
// in the target file and replaces it with `to` — but only standards/* files
// themselves are never re-downloaded by `ck update` (they're user-owned, see
// downloadFiles()), so this is the only path by which a wording/behaviour fix
// to shipped boilerplate reaches projects that installed before the fix.
//
// If `from` isn't found verbatim (the section was hand-edited, or by /analyze),
// the entry is skipped and recorded in config.yml's `pending_standards_updates`
// list instead of being force-applied — see config-schema.js's `pending_standards_updates`
// entry and `/ck update`, which surfaces that list for AI-assisted
// reconciliation.

const MIGRATIONS = [
  {
    version: '1.2.3',
    file: '.contextkit/standards/ai-guidelines.md',
    id: 'readme-context-discovery-scope',
    description: 'README.md Context Discovery — skip the check for trivial tasks',
    from: `\`README.md\` is the standard context file at all 3 documentation levels. Before starting work in any directory or on any feature, check for it:

- **Architecture level**: project root or \`docs/\` directory
- **Feature/page level**: the directory containing the feature, route, or page you are working in
- **Component level**: the directory containing the component you are modifying

If a \`README.md\` exists at any of these levels relevant to your task, read it before acting. These files capture decisions, conventions, and context that the codebase alone does not reveal.`,
    to: `\`README.md\` is the standard context file at all 3 documentation levels. Before starting substantial work in a directory — a new feature, a component you'll modify non-trivially, or exploring an unfamiliar area — check for it:

- **Architecture level**: project root or \`docs/\` directory
- **Feature/page level**: the directory containing the feature, route, or page you are working in
- **Component level**: the directory containing the component you are modifying

If a \`README.md\` exists at any of these levels relevant to your task, read it before acting. These files capture decisions, conventions, and context that the codebase alone does not reveal.

Skip this check for quick lookups, one-line fixes, or tasks confined to a single file whose purpose is already clear — the read isn't worth the tokens when the task is that small.`,
  },
  {
    version: '2.0.0',
    file: '.contextkit/standards/ai-guidelines.md',
    id: 'push-checklist-to-gates',
    // Only fixes a stale reference — nothing to flag when the line isn't there
    skipIfMissing: true,
    description: 'Before pushing — agent-push-checklist removed; the pre-push gates enforce it',
    from: '- **Before pushing** — run through `.contextkit/commands/agents/agent-push-checklist.md`',
    to: '- **Before pushing** — run the tests; the pre-push quality gates block a failing push',
  },
  {
    version: '2.0.0',
    file: '.contextkit/standards/ai-guidelines.md',
    id: 'response-style-to-headline',
    // Only fixes a stale reference — nothing to flag when the line isn't there
    skipIfMissing: true,
    description:
      'Response Style — response_style flags replaced by the headline block and diagrams_in_docs',
    from: `## Response Style

Governed by \`.contextkit/config.yml\` → \`response_style\` (two independent flags — check both, they're not linked):

- \`chat_minimal_words\`: true → chat explanations are plain text, minimal words — state results/decisions directly, don't narrate step-by-step reasoning. false → respond normally.
- \`diagrams_in_docs\`: false → no Mermaid diagrams in generated \`.md\` files (see \`/analyze\` Output Density); prefer inline arrow chains for simple relationships, e.g. \`input → transform → output\`. true → diagrams allowed where they're the clearest option.

Flip either flag per-project. If \`config.yml\` is missing or the block isn't present, default to both rules on (terse chat, no diagrams).

`,
    to: '',
  },
  {
    version: '2.0.0',
    file: '.contextkit/standards/ai-guidelines.md',
    id: 'standards-aware-to-learn',
    // Only fixes a stale reference — nothing to flag when the line isn't there
    skipIfMissing: true,
    description: 'Standards Loop — /standards-aware replaced by /learn',
    from: 'When you discover a pattern worth standardising, use `/standards-aware` to decide whether and how to add it.',
    to: 'When you discover a pattern worth standardising — or the user corrects you — use `/learn` to add it to the right file.',
  },
];

module.exports = { MIGRATIONS };
