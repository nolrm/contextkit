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
// entry and the `standards-aware` skill, which surfaces that list for
// AI-assisted reconciliation.

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
];

module.exports = { MIGRATIONS };
