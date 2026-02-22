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
      '.claude/commands/squad-batch.md',
      '.claude/commands/squad-run.md',
      '.claude/commands/squad-run-agents.md',
      '.claude/commands/ck.md',
    ];
    this.platformDir = '.claude/rules';
  }

  async install() {
    await super.install();
    const fs = require('fs-extra');
    await fs.ensureDir('.claude/commands');
    await this.removeLegacyFiles();
  }

  async removeLegacyFiles() {
    const fs = require('fs-extra');
    const legacyFiles = [
      '.claude/rules/vibe-kit-standards.md',
      '.claude/rules/vibe-kit-testing.md',
      '.claude/rules/vibe-kit-code-style.md',
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

- \`.contextkit/commands/analyze.md\` — Analyze and customize standards
- \`.contextkit/commands/create-component.md\` — Create components
- \`.contextkit/commands/create-feature.md\` — Create features
- \`.contextkit/commands/run-tests.md\` — Run tests
- \`.contextkit/commands/quality-check.md\` — Quality checks`;
  }

  async generateFiles() {
    // Bridge file: CLAUDE.md (auto-loaded every session)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

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

    // Slash commands — thin wrappers that delegate to .contextkit/commands/
    await this.writeGeneratedFile('.claude/commands/analyze.md', `# Analyze Project

Read \`.contextkit/commands/analyze.md\` and execute the analysis workflow for this project.

Scan the codebase structure, detect frameworks and patterns, then generate customized standards files in \`.contextkit/standards/\`.
`);

    await this.writeGeneratedFile('.claude/commands/review.md', `# Code Review

Read \`.contextkit/commands/review.md\` and execute the review workflow.

Review current changes for correctness, standards compliance, and potential issues.
`);

    await this.writeGeneratedFile('.claude/commands/fix.md', `# Fix Bug

Read \`.contextkit/commands/fix.md\` and execute the bug fix workflow.

Diagnose the root cause, implement the minimal fix, and add a regression test.
`);

    await this.writeGeneratedFile('.claude/commands/refactor.md', `# Refactor

Read \`.contextkit/commands/refactor.md\` and execute the refactoring workflow.

Improve code structure without changing behavior, keeping tests green at every step.
`);

    await this.writeGeneratedFile('.claude/commands/test.md', `# Run Tests

Read \`.contextkit/commands/run-tests.md\` and execute the testing workflow.

Generate or run tests for the specified code, covering happy paths, edge cases, and errors.
`);

    await this.writeGeneratedFile('.claude/commands/doc.md', `# Add Documentation

Read \`.contextkit/commands/add-documentation.md\` and execute the documentation workflow.

Add inline docs, README sections, and usage examples for the specified code.
`);

    // Squad slash commands
    await this.writeGeneratedFile('.claude/commands/squad.md', `# Squad — Kickoff

Read \`.contextkit/commands/squad.md\` and execute the squad kickoff workflow.

Create the handoff file and write the PO spec for the given task. Pass the user's task description as the input.
`);

    await this.writeGeneratedFile('.claude/commands/squad-architect.md', `# Squad — Architect

Read \`.contextkit/commands/squad-architect.md\` and execute the architect workflow.

Read the PO spec from the handoff file, design the technical approach, and write the implementation plan.
`);

    await this.writeGeneratedFile('.claude/commands/squad-dev.md', `# Squad — Dev

Read \`.contextkit/commands/squad-dev.md\` and execute the dev workflow.

Follow the architect's plan to implement the code changes.
`);

    await this.writeGeneratedFile('.claude/commands/squad-test.md', `# Squad — Test

Read \`.contextkit/commands/squad-test.md\` and execute the test workflow.

Write and run tests against the PO's acceptance criteria.
`);

    await this.writeGeneratedFile('.claude/commands/squad-review.md', `# Squad — Review

Read \`.contextkit/commands/squad-review.md\` and execute the review workflow.

Review the full handoff (spec, plan, implementation, tests) and write the final verdict.
`);

    await this.writeGeneratedFile('.claude/commands/squad-batch.md', `# Squad Batch — Multi-Task Kickoff

Read \`.contextkit/commands/squad-batch.md\` and execute the batch kickoff workflow.

Create handoff files for multiple tasks and write PO specs for each one. Pass all task descriptions as the input.
`);

    await this.writeGeneratedFile('.claude/commands/squad-run.md', `# Squad Run — Auto-Run Pipeline

Read \`.contextkit/commands/squad-run.md\` and execute the pipeline runner workflow.

Process all batch tasks through the remaining pipeline steps (Architect, Dev, Test, Review) sequentially.
`);

    await this.writeGeneratedFile('.claude/commands/squad-run-agents.md', `# Squad Run — Agent Mode (Parallel)

Read \`.contextkit/commands/squad-run-agents.md\` and execute the parallel pipeline workflow.

Spawn one subagent per task per phase using the Task tool, so all tasks progress simultaneously instead of sequentially. Use this after \`/squad-batch\` for faster execution on multi-task batches.
`);

    await this.writeGeneratedFile('.claude/commands/ck.md', `# ContextKit Health Check

Read \`.contextkit/commands/health-check.md\` and execute the health check workflow.

Check project setup, standards status, and integrations. Report what needs attention.
`);
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
    console.log(chalk.dim('    /doc      — Add documentation'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad (multi-agent workflow):'));
    console.log(chalk.dim('    /squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    /squad-architect   — Design the implementation plan'));
    console.log(chalk.dim('    /squad-dev         — Implement the code'));
    console.log(chalk.dim('    /squad-test        — Write and run tests'));
    console.log(chalk.dim('    /squad-review      — Review and write verdict'));
    console.log(chalk.dim('    /squad-batch            — Batch kickoff: PO specs for multiple tasks'));
    console.log(chalk.dim('    /squad-run              — Auto-run pipeline sequentially'));
    console.log(chalk.dim('    /squad-run-agents       — Auto-run pipeline in parallel (agent mode)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    /ck           — Check project setup and standards status'));
  }
}

module.exports = ClaudeIntegration;
