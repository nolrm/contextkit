// Canonical skill registry — single source of truth for every generated skill's
// name, description, source command file, and per-target metadata. Rendered to
// each platform by lib/skills/render.js instead of being retyped per integration.
//
// `body` may reference other skills with `{{cmd:name}}` — render.js substitutes
// the target-appropriate invocation (`/name` for Claude/Cursor, `$name` for
// Codex, plain `name` for the portable .agents/skills target).
//
// Skills removed in 2.0 live in ./retired.js (with their replacements) so
// cleanup and the stale-context check know about them.

const SKILLS = [
  // ── Core ─────────────────────────────────────────────
  {
    name: 'ck',
    family: 'core',
    source: 'commands/core/ck.md',
    description:
      "Set up, update, and tidy this project's AI context — status, setup (write standards), update (finish an upgrade), tidy (keep context lean)",
    body: 'With no argument, report what is set up and what needs attention. `setup` analyzes the codebase and writes the standards, the always-loaded index, and path-scoped context rules. `update` finishes a `ck update` (asks before moving custom content). `tidy` shrinks always-loaded context and wires guides nothing loads.',
    argumentHint: '[setup | update | tidy]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'high' },
  },
  {
    name: 'doc',
    family: 'core',
    source: 'commands/docs/doc.md',
    description:
      'Update docs and standards affected by the current change — or write an arch / feature / component doc',
    body: 'With no argument, find docs and standards that reference the code changed on this branch and update the stale ones. Pass `arch`, `feature [name]`, or `component <path>` for a specific documentation level.',
    argumentHint: '[arch | feature [name|path] | component <path>]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'medium' },
  },
  {
    name: 'learn',
    family: 'core',
    source: 'commands/core/learn.md',
    description:
      'Turn a correction into a project rule — saved to the right standards file so the mistake does not repeat',
    body: 'Capture the lesson from the argument or the latest correction in this conversation, and write it as one rule to the right `.contextkit/standards/` file (or `AGENTS.md` without ContextKit).',
    argumentHint: '["the rule"]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'low' },
  },

  // ── Add-ons (each shareable on its own) ─────────────
  {
    name: 'goal',
    family: 'goal',
    source: 'commands/addons/goal.md',
    description:
      'Run a long task against a one-page goal file — outcomes, checks, change log, progress — with an independent review per milestone',
    body: 'Start with {{cmd:goal}} "idea", resume with {{cmd:goal}}. The goal file in `.contextkit/goals/` keeps the task anchored across sessions and compaction; each outcome gets a fresh-context review before it is ticked.',
    argumentHint: '["idea"] | status | done',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash, Task', effort: 'high' },
  },
  {
    name: 'headline',
    family: 'headline',
    source: 'commands/addons/headline.md',
    description:
      'Short, result-first replies, always on — adds the headline response-style block to your instructions file',
    body: 'Adds (or removes, with `off`) the headline block — lead with the result, no narration, plain sentences — to `AGENTS.md`/`CLAUDE.md` or your user-level instructions so it applies every session.',
    argumentHint: '[off | pause]',
    claude: { allowedTools: 'Read, Edit, Write, Glob', effort: 'low' },
  },
];

function findSkill(name) {
  return SKILLS.find((s) => s.name === name);
}

function skillsByFamily(family) {
  return SKILLS.filter((s) => s.family === family);
}

module.exports = { SKILLS, findSkill, skillsByFamily };
