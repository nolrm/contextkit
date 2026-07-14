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
    id: 'conditionals',
    detect: /^conditionals:/m,
    block: () => `
# Conditional loading rules
conditionals:
  - when: react
    load: [standards/code-style.md, standards/testing.md]
  - when: css
    load: [standards/code-style/css-style.md]
  - when: typescript
    load: [standards/code-style/typescript-style.md]
`,
  },
  {
    id: 'response_style',
    detect: /^response_style:/m,
    block: () => `
# Response style (checked by ai-guidelines.md and /analyze — see standards/ai-guidelines.md#response-style)
response_style:
  chat_minimal_words: true   # plain-text, terse chat explanations
  diagrams_in_docs: false    # allow Mermaid in generated .contextkit/standards/*.md
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
    id: 'features.squad_ci_workflow',
    detect: /^[ \t]+squad_ci_workflow:/m,
    insertInBlock: 'features',
    line: () =>
      '  squad_ci_workflow: false  # auto-update .github/workflows/squad-issue.yml on ck update when enabled',
  },
];

module.exports = { SETTINGS };
