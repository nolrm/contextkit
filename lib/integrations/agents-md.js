// Canonical AGENTS.md body — shared by every integration that targets that
// file (Codex, OpenCode) so they write the same content instead of each
// overwriting the other's version between marker-delimited installs.

function renderAgentsMd() {
  return `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

## Project Standards

Read these files before writing code:

- \`.contextkit/standards/code-style.md\` — Coding conventions and style rules
- \`.contextkit/standards/architecture.md\` — Architecture decisions and patterns

Loaded on demand via skills, not always-loaded: testing.md (\`squad-test\` skill), workflows.md (\`agent-push-checklist\` skill), ai-guidelines.md and glossary.md (\`standards-aware\` skill), decisions.md and roadmap.md (\`product-context\` skill).

## Product Context

- \`.contextkit/product/mission-lite.md\` — Product mission (condensed)

## Quick Reference

Corrections log (\`.contextkit/corrections.md\`) is loaded on demand via the \`standards-aware\` skill, not always-loaded.

Before writing code, always read the relevant standards files above. ContextKit skills are available via \`$name\` (Codex) or the project's skill directories — use them to run the spec and squad pipelines.`;
}

module.exports = { renderAgentsMd };
