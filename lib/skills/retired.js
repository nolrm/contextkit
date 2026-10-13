// Skills removed in 2.0 and what replaces them. Used to clean up old installs
// (ck update, ck uninstall --global) and by the stale-context check to flag
// instructions that still point at them.

const RETIRED_SKILLS = {
  squad: '/goal',
  'squad-architect': '/goal',
  'squad-dev': '/goal',
  'squad-test': '/goal',
  'squad-review': '/goal',
  'squad-auto': '/goal',
  'squad-reset': '/goal',
  'squad-doc': '/goal',
  'squad-go': '/goal',
  'squad-spec': '/goal',
  'squad-ci': '/goal',
  spec: '/goal',
  'spec-component': '/goal',
  'doc-arch': '/doc arch',
  'doc-feature': '/doc feature',
  'doc-component': '/doc component',
  analyze: '/ck setup',
  compress: '/ck tidy',
  'standards-aware': 'AGENTS.md + path-scoped rules (/ck update reconciles pending standards)',
  'product-context': 'AGENTS.md "read when" table',
  'agent-push-checklist': 'pre-push quality gates',
  'context-budget': "your tool's built-in context command",
  review: "your tool's built-in code review",
  refactor: "your tool's built-in simplify/refactor",
  test: 'testing rules that load when you touch test files',
};

module.exports = { RETIRED_SKILLS };
