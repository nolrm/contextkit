// Registry of config.yml settings added after the initial format_version: 1
// layout. `ck update` (see update.js#appendMissingSettings) diffs a project's
// config.yml against this list and appends whatever is missing, each with a
// comment explaining what it does — it never rewrites or removes existing
// content. Keep entries here in sync with the literal template in
// install.js#createConfiguration so a fresh install and an updated old
// project converge on the same blocks.

const SETTINGS = [
  {
    id: 'profile',
    detect: /^profile:/m,
    block: ({ config }) => `
profile: "${config.project_type || 'node'}" # react, vue, node, nextjs, etc.
`,
  },
  {
    id: 'analysis_scope',
    detect: /^analysis_scope:/m,
    block: () => `
# Analysis scope (for monorepos)
# Set during 'ck analyze' - tracks which packages were analyzed
analysis_scope: null  # frontend, backend, both, or current
analyzed_packages: []  # List of package paths that were analyzed
`,
  },
  {
    id: 'required',
    detect: /^required:/m,
    block: () => `
# Required standards (enforcement)
required:
  - standards/index.md
  - standards/code-style.md
  - standards/testing.md
`,
  },
  {
    id: 'optional',
    detect: /^optional:/m,
    block: () => `
# Optional standards (warn if missing)
optional:
  - standards/architecture.md
  - standards/workflows.md
  - standards/ai-guidelines.md
  - product/mission.md
`,
  },
  {
    id: 'headline',
    detect: /^headline:/m,
    // Seeded from the older chat_minimal_words flag so upgraded projects keep
    // whatever they had (default on).
    block: ({ content = '' }) => `
# Headline: short, result-first replies — always-on block in AGENTS.md/CLAUDE.md (see /headline)
headline: ${!/^[ \t]+chat_minimal_words:\s*false/m.test(content)}
`,
  },
  {
    id: 'diagrams_in_docs',
    detect: /^diagrams_in_docs:/m,
    // Carried over from the pre-2.0 response_style.diagrams_in_docs flag
    block: ({ content = '' }) => `
# Allow Mermaid diagrams in generated docs and standards (default: arrow chains instead)
diagrams_in_docs: ${/^[ \t]+diagrams_in_docs:\s*true/m.test(content)}
`,
  },
  {
    id: 'context_rules',
    detect: /^context_rules:/m,
    block: () => `
# Context rules: load a topic standards file only when matching files are touched.
# /ck setup and /ck tidy maintain this list; ck renders it per tool
# (.claude/rules paths:, .cursor/rules globs:, .github/instructions applyTo:).
context_rules:
  - file: standards/testing.md
    paths: ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"]
  - file: standards/code-style.md
    paths: ["src/**", "lib/**", "app/**", "packages/**"]
`,
  },
  {
    id: 'context_budget_lines',
    detect: /^context_budget_lines:/m,
    block: () => `
# Warn when always-loaded context (AGENTS.md, CLAUDE.md, index.md, unscoped rules) exceeds this
context_budget_lines: 400
`,
  },
  {
    id: 'metadata',
    detect: /^metadata:/m,
    block: ({ now }) => `
# Metadata for tracking
metadata:
  generated_by: contextkit@${require('../../package.json').version}
  generated_at: "${now}"
  last_analyzed: null
`,
  },
  {
    id: 'pending_standards_updates',
    detect: /^pending_standards_updates:/m,
    block: () => `
# Standards content updates ck update couldn't auto-apply (local edits found).
# /ck update reconciles these.
pending_standards_updates: []
`,
  },
];

module.exports = { SETTINGS };
