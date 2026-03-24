const chalk = require('chalk');
const BaseIntegration = require('./base-integration');

class ClaudeIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'claude';
    this.displayName = 'Claude Code';
    this.bridgeFiles = ['CLAUDE.md'];
    this.generatedFiles = [
      '.claude/rules/contextkit-standards.md',
      '.claude/rules/contextkit-testing.md',
      '.claude/rules/contextkit-code-style.md',
      '.claude/skills/analyze/SKILL.md',
      '.claude/skills/review/SKILL.md',
      '.claude/skills/fix/SKILL.md',
      '.claude/skills/refactor/SKILL.md',
      '.claude/skills/test/SKILL.md',
      '.claude/skills/doc/SKILL.md',
      '.claude/skills/squad/SKILL.md',
      '.claude/skills/squad-architect/SKILL.md',
      '.claude/skills/squad-dev/SKILL.md',
      '.claude/skills/squad-test/SKILL.md',
      '.claude/skills/squad-review/SKILL.md',
      '.claude/skills/squad-auto/SKILL.md',
      '.claude/skills/squad-auto-parallel/SKILL.md',
      '.claude/skills/squad-reset/SKILL.md',
      '.claude/skills/squad-doc/SKILL.md',
      '.claude/skills/spec/SKILL.md',
      '.claude/skills/ck/SKILL.md',
      '.claude/skills/doc-arch/SKILL.md',
      '.claude/skills/doc-feature/SKILL.md',
      '.claude/skills/doc-component/SKILL.md',
      '.claude/skills/agent-push-checklist/SKILL.md',
      '.claude/skills/context-budget/SKILL.md',
      '.claude/skills/standards-aware/SKILL.md',
    ];
    this.platformDir = '.claude/rules';
  }

  async install() {
    await super.install();
    const fs = require('fs-extra');
    await fs.ensureDir('.claude/skills');
    await this.addToGitignore('.claude/settings.local.json');
    await this.removeLegacyFiles();
  }

  async addToGitignore(entry) {
    const fs = require('fs-extra');
    if (!fs.existsSync('.gitignore')) return;
    const content = await fs.readFile('.gitignore', 'utf-8');
    if (content.includes(entry)) return;
    const separator = content.endsWith('\n') ? '' : '\n';
    await fs.appendFile('.gitignore', `${separator}${entry}\n`);
  }

  async removeLegacyFiles() {
    const fs = require('fs-extra');
    const legacyFiles = [
      '.claude/rules/vibe-kit-standards.md',
      '.claude/rules/vibe-kit-testing.md',
      '.claude/rules/vibe-kit-code-style.md',
      '.claude/commands/squad-batch.md',
      '.claude/commands/squad-peer-review.md',
      // Migrated to .claude/skills/ in 0.15.0
      '.claude/commands/analyze.md',
      '.claude/commands/review.md',
      '.claude/commands/fix.md',
      '.claude/commands/refactor.md',
      '.claude/commands/test.md',
      '.claude/commands/doc.md',
      '.claude/commands/squad.md',
      '.claude/commands/squad-architect.md',
      '.claude/commands/squad-dev.md',
      '.claude/commands/squad-test.md',
      '.claude/commands/squad-review.md',
      '.claude/commands/squad-auto.md',
      '.claude/commands/squad-auto-parallel.md',
      '.claude/commands/squad-reset.md',
      '.claude/commands/squad-doc.md',
      '.claude/commands/spec.md',
      '.claude/commands/ck.md',
      '.claude/commands/doc-arch.md',
      '.claude/commands/doc-feature.md',
      '.claude/commands/doc-component.md',
      '.claude/commands/agent-push-checklist.md',
      '.claude/commands/context-budget.md',
      '.claude/commands/standards-aware.md',
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }

  getStandardsBlock() {
    return `## Project Standards

The following standards are auto-loaded into context via @imports:

- @.contextkit/standards/code-style.md — Coding conventions and style rules
- @.contextkit/standards/testing.md — Testing patterns and requirements
- @.contextkit/standards/architecture.md — Architecture decisions and patterns
- @.contextkit/standards/ai-guidelines.md — AI behavior and usage guidelines
- @.contextkit/standards/workflows.md — Development workflows and processes
- @.contextkit/standards/glossary.md — Project terminology and shortcuts

## Product Context

- @.contextkit/product/mission-lite.md — Product mission (condensed)
- @.contextkit/product/decisions.md — Architecture Decision Records
- @.contextkit/product/roadmap.md — Development roadmap

## Commands

- \`.contextkit/commands/dev/analyze.md\` — Analyze and customize standards
- \`.contextkit/commands/dev/create-component.md\` — Create components
- \`.contextkit/commands/dev/create-feature.md\` — Create features
- \`.contextkit/commands/dev/run-tests.md\` — Run tests
- \`.contextkit/commands/dev/quality-check.md\` — Quality checks`;
  }

  async generateFiles() {
    const { version } = require('../../package.json');

    // Bridge file: CLAUDE.md (auto-loaded every session)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

## ContextKit
Version: ${version}

${this.getStandardsBlock()}

## Corrections Log

- @.contextkit/corrections.md — Track AI performance improvements

## Quick Reference

Before writing code, check the relevant standards files above. Always follow the project's established patterns and conventions.`;

    await this.writeBridgeFile('CLAUDE.md', bridgeContent);

    // Rule: always-apply standards pointer
    const standardsRule = `---
description: ContextKit project standards - always loaded
alwaysApply: true
---

# ContextKit Standards

This project uses ContextKit. Project standards are auto-loaded via CLAUDE.md imports.

Key areas to follow:
- Code style conventions (from code-style.md)
- Architecture patterns (from architecture.md)
- AI behavior rules (from ai-guidelines.md)
- Project terminology (from glossary.md)
- Product context (from mission-lite.md)
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-standards.md', standardsRule);

    // Rule: testing standards (scoped to test files)
    const testingRule = `---
description: ContextKit testing standards for test files
globs:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/__tests__/**"
---

# Testing Standards

Follow the testing standards auto-loaded via CLAUDE.md (from testing.md).
- All test cases MUST use numbered descriptions (e.g., \`it("1. renders correctly")\`)
- Reference \`.contextkit/templates/test.md\` for test template patterns
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-testing.md', testingRule);

    // Rule: code style (scoped to source files)
    const codeStyleRule = `---
description: ContextKit code style for source files
globs:
  - "src/**"
  - "lib/**"
  - "app/**"
  - "packages/**"
---

# Code Style

Follow the code style standards auto-loaded via CLAUDE.md (from code-style.md).
- Reference \`.contextkit/templates/component.md\` for component patterns
- Reference \`.contextkit/templates/hook.md\` for custom hook patterns
- Reference \`.contextkit/templates/api.md\` for API service patterns
`;
    await this.writeGeneratedFile('.claude/rules/contextkit-code-style.md', codeStyleRule);

    // Skills — delegate to .contextkit/commands/ with rich frontmatter for Claude Code
    await this.writeGeneratedFile(
      '.claude/skills/analyze/SKILL.md',
      `---
description: Analyze project and generate customized standards
argument-hint: "[optional: scope or package path]"
allowed-tools: Read, Glob, Grep, Write, Bash
effort: high
---

Read \`.contextkit/commands/dev/analyze.md\` and execute the analysis workflow for this project.

Scan the codebase structure, detect frameworks and patterns, then generate customized standards files in \`.contextkit/standards/\`.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/review/SKILL.md',
      `---
description: Review current changes for correctness and standards compliance
argument-hint: "[optional: file or directory]"
allowed-tools: Read, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/dev/review.md\` and execute the review workflow.

Review current changes for correctness, standards compliance, and potential issues.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/fix/SKILL.md',
      `---
description: Diagnose root cause and implement a minimal bug fix with regression test
argument-hint: "<description of the bug>"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/dev/fix.md\` and execute the bug fix workflow.

Diagnose the root cause, implement the minimal fix, and add a regression test.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/refactor/SKILL.md',
      `---
description: Improve code structure without changing behavior
argument-hint: "[optional: file or scope]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/dev/refactor.md\` and execute the refactoring workflow.

Improve code structure without changing behavior, keeping tests green at every step.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/test/SKILL.md',
      `---
description: Generate or run tests covering happy paths, edge cases, and errors
argument-hint: "[optional: file or function]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/dev/run-tests.md\` and execute the testing workflow.

Generate or run tests for the specified code, covering happy paths, edge cases, and errors.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/doc/SKILL.md',
      `---
description: Add inline docs, README sections, and usage examples
argument-hint: "[optional: file or module]"
allowed-tools: Read, Edit, Write, Glob, Grep
effort: normal
---

Read \`.contextkit/commands/docs/add-documentation.md\` and execute the documentation workflow.

Add inline docs, README sections, and usage examples for the specified code.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/spec/SKILL.md',
      `---
description: Write a component spec (MD-first) before coding begins
argument-hint: "<component or feature name>"
allowed-tools: Read, Write, Glob, Grep
effort: normal
---

Read \`.contextkit/commands/dev/spec.md\` and execute the spec workflow.

Write a component spec (MD-first) before any code is created. Scaffold the spec file colocated with the component and wait for review before coding begins.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/ck/SKILL.md',
      `---
description: Check project setup, standards status, and integrations
allowed-tools: Read, Glob, Grep, Bash
effort: low
---

Read \`.contextkit/commands/dev/health-check.md\` and execute the health check workflow.

Check project setup, standards status, and integrations. Report what needs attention.
`
    );

    // Squad skills
    await this.writeGeneratedFile(
      '.claude/skills/squad/SKILL.md',
      `---
description: Squad pipeline kickoff — create handoff file and write PO spec
argument-hint: '"<task description>"'
allowed-tools: Read, Write, Glob, Grep
effort: normal
---

Read \`.contextkit/commands/squad/squad.md\` and execute the squad kickoff workflow.

Create the handoff file and write the PO spec for the given task. Pass the user's task description as the input.

After kickoff, run \`/squad-auto\` to auto-run the full pipeline hands-free, or step through manually with \`/squad-architect\` → \`/squad-dev\` → \`/squad-test\` → \`/squad-review\` → \`/squad-doc\`.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-architect/SKILL.md',
      `---
description: Write technical implementation plan from PO spec (manual step 1/4)
allowed-tools: Read, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/squad/squad-architect.md\` and execute the architect workflow.

Read the PO spec from the handoff file, design the technical approach, and write the implementation plan. Use \`/squad-auto\` instead to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-dev/SKILL.md',
      `---
description: Implement code changes following architect plan (manual step 2/4)
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/squad/squad-dev.md\` and execute the dev workflow.

Follow the architect's plan to implement the code changes. Use \`/squad-auto\` instead to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-test/SKILL.md',
      `---
description: Write and run tests against acceptance criteria (manual step 3/4)
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/squad/squad-test.md\` and execute the test workflow.

Write and run tests against the PO's acceptance criteria. Use \`/squad-auto\` instead to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-review/SKILL.md',
      `---
description: Review full handoff and write pass/needs-work verdict (manual step 4/4)
allowed-tools: Read, Write, Glob, Grep, Bash
effort: normal
---

Read \`.contextkit/commands/squad/squad-review.md\` and execute the review workflow.

Review the full handoff (spec, plan, implementation, tests) and write the final verdict. Use \`/squad-auto\` instead to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-auto/SKILL.md',
      `---
description: Auto-run full squad pipeline hands-free (architect → dev → test → review → doc)
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: high
context: fork
---

Read \`.contextkit/commands/squad/squad-auto.md\` and execute the pipeline runner workflow.

Run after \`/squad\` kickoff. Automatically runs architect → dev → test → review for all tasks sequentially, hands-free.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-auto-parallel/SKILL.md',
      `---
description: Auto-run squad pipeline with parallel agents — one per task per phase (fastest)
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: high
context: fork
---

Read \`.contextkit/commands/squad/squad-auto-parallel.md\` and execute the parallel pipeline workflow.

Spawn one subagent per task per phase using the Task tool, so all tasks progress simultaneously instead of sequentially. Use this after \`/squad\` batch kickoff for faster execution on multi-task batches.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-reset/SKILL.md',
      `---
description: Delete squad state to start fresh
allowed-tools: Read, Write, Glob
effort: low
---

Read \`.contextkit/commands/squad/squad-reset.md\` and execute the reset workflow.

Delete the current squad state (.contextkit/squad/) so you can start fresh. Use when the squad folder is in a mixed or stuck state.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/squad-doc/SKILL.md',
      `---
description: Document changes after review passes (manual step 5/5)
allowed-tools: Read, Edit, Write, Glob, Grep
effort: normal
---

Read \`.contextkit/commands/squad/squad-doc.md\` and execute the doc workflow.

After review passes, create or update companion .md files for every new/modified code file in this task. Use \`/squad-auto\` instead to run all steps automatically.
`
    );

    // Doc family skills
    await this.writeGeneratedFile(
      '.claude/skills/doc-arch/SKILL.md',
      `---
description: Generate or update architecture documentation (Level 1)
argument-hint: "[optional: PR number]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: high
---

Read \`.contextkit/commands/docs/doc-arch.md\` and execute the architecture documentation workflow.

Detect the project stack, then generate or update \`docs/architecture.md\` with system boundaries, key flows, and stack-appropriate artifacts (Mermaid diagrams, component trees, service maps).

Pass an optional PR number to scope to that PR's changes.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/doc-feature/SKILL.md',
      `---
description: Generate or update feature documentation (Level 2)
argument-hint: "[optional: feature name, path, or PR number]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
effort: high
---

Read \`.contextkit/commands/docs/doc-feature.md\` and execute the feature documentation workflow.

Detect the project stack, identify the target feature from the argument or current branch, then generate or update \`docs/features/<name>.md\` with purpose, components/modules, data flow, and user flows.

Pass a feature name, directory path, or PR number to scope the documentation.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/doc-component/SKILL.md',
      `---
description: Generate or update component documentation (Level 3)
argument-hint: "[optional: file path or directory]"
allowed-tools: Read, Edit, Write, Glob, Grep
effort: normal
---

Read \`.contextkit/commands/docs/doc-component.md\` and execute the component documentation workflow.

Detect the project stack, read the target file or directory, then create or update a colocated \`<name>.md\` with API/props, usage examples, behavior, and edge cases.

Pass a file path or directory to target. Omit to infer from current context.
`
    );

    // Agent skills
    await this.writeGeneratedFile(
      '.claude/skills/agent-push-checklist/SKILL.md',
      `---
description: Pre-push quality checklist for agents before git push
allowed-tools: Read, Glob, Grep, Bash
effort: low
---

Read \`.contextkit/commands/agents/agent-push-checklist.md\` and execute the agent push checklist workflow.

Run before pushing from an AI agent. Validates that changes are safe, tests pass, and the push is ready.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/context-budget/SKILL.md',
      `---
description: Check context consumption and advise on compact, summarise, or continue
allowed-tools: Read, Glob, Grep
effort: low
---

Read \`.contextkit/commands/agents/context-budget.md\` and execute the context budget workflow.

Check how much context has been consumed and advise on whether to compact, summarise, or continue.
`
    );

    await this.writeGeneratedFile(
      '.claude/skills/standards-aware/SKILL.md',
      `---
description: Load and apply project standards before acting in an agentic context
allowed-tools: Read, Glob, Grep
effort: low
---

Read \`.contextkit/commands/agents/standards-aware.md\` and execute the standards-aware workflow.

Load and apply the project's ContextKit standards before taking action in an agentic context.
`
    );
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Claude Code Usage:'));
    console.log('    CLAUDE.md is auto-loaded every session');
    console.log('    .claude/rules/ are loaded based on file context');
    console.log('');
    console.log(chalk.dim('  Slash commands:'));
    console.log(chalk.dim('    /analyze  — Analyze project and generate standards'));
    console.log(chalk.dim('    /review   — Review current changes'));
    console.log(chalk.dim('    /fix      — Diagnose and fix a bug'));
    console.log(chalk.dim('    /refactor — Refactor code structure'));
    console.log(chalk.dim('    /test     — Generate or run tests'));
    console.log(chalk.dim('    /doc           — Add documentation'));
    console.log(chalk.dim('    /doc-arch      — Architecture docs (Level 1)'));
    console.log(chalk.dim('    /doc-feature   — Feature docs (Level 2)'));
    console.log(chalk.dim('    /doc-component — Component docs (Level 3)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad (multi-agent workflow):'));
    console.log(chalk.dim('    /squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    /squad-architect   — Design the implementation plan'));
    console.log(chalk.dim('    /squad-dev         — Implement the code'));
    console.log(chalk.dim('    /squad-test        — Write and run tests'));
    console.log(chalk.dim('    /squad-review      — Review and write verdict'));
    console.log(chalk.dim('    /squad-auto             — Auto-run full pipeline (recommended)'));
    console.log(
      chalk.dim('    /squad-auto-parallel    — Auto-run pipeline in parallel (batch, fastest)')
    );
    console.log(chalk.dim('    /squad-doc              — Document changes after review passes'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    /ck           — Check project setup and standards status'));
  }
}

module.exports = ClaudeIntegration;
