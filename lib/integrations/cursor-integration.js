const chalk = require('chalk');
const fs = require('fs-extra');
const BaseIntegration = require('./base-integration');

class CursorIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'cursor';
    this.displayName = 'Cursor';
    this.generatedFiles = [
      '.cursor/rules/contextkit-standards.mdc',
      '.cursor/rules/contextkit-testing.mdc',
      '.cursor/rules/contextkit-components.mdc',
      '.cursor/rules/contextkit-api.mdc',
      '.cursor/prompts/analyze.md',
      '.cursor/prompts/review.md',
      '.cursor/prompts/fix.md',
      '.cursor/prompts/refactor.md',
      '.cursor/prompts/test.md',
      '.cursor/prompts/doc.md',
      '.cursor/prompts/squad.md',
      '.cursor/prompts/squad-architect.md',
      '.cursor/prompts/squad-dev.md',
      '.cursor/prompts/squad-test.md',
      '.cursor/prompts/squad-review.md',
      '.cursor/prompts/squad-auto.md',
      '.cursor/prompts/ck.md',
    ];
    this.bridgeFiles = [];
    this.platformDir = '.cursor/rules';
  }

  async install() {
    await super.install();
    await fs.ensureDir('.cursor/prompts');
    // Remove old monolithic rule file if present
    await this.removeLegacyFiles();
  }

  async removeLegacyFiles() {
    const legacyFiles = [
      '.cursor/rules/contextkit.mdc',
      '.cursor/rules/vibe-kit.mdc',
      '.cursor/rules/vibe-kit-standards.mdc',
      '.cursor/rules/vibe-kit-testing.mdc',
      '.cursor/rules/vibe-kit-components.mdc',
      '.cursor/rules/vibe-kit-api.mdc',
    ];
    for (const file of legacyFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
        console.log(chalk.yellow(`  Removed legacy ${file}`));
      }
    }
  }

  async generateFiles() {
    // Standards rule (always apply)
    const standardsRule = `---
description: ContextKit project standards
globs: "**/*.{ts,tsx,js,jsx,py,rs,go}"
alwaysApply: true
---

# ContextKit Standards

This project uses ContextKit for structured development standards.

## References

- @.contextkit/standards/code-style.md — Coding conventions
- @.contextkit/standards/architecture.md — Architecture patterns
- @.contextkit/standards/ai-guidelines.md — AI behavior rules
- @.contextkit/standards/glossary.md — Project terminology
- @.contextkit/product/mission-lite.md — Product context

## Workflow

1. Check standards before generating code
2. Follow project patterns and conventions
3. Include proper testing (numbered test cases)
4. Ensure type safety
5. Run quality checks
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-standards.mdc', standardsRule);

    // Testing rule (scoped to test files)
    const testingRule = `---
description: ContextKit testing standards
globs: "**/*.test.*, **/*.spec.*, **/__tests__/**"
alwaysApply: false
---

# Testing Standards

Reference: @.contextkit/standards/testing.md

## Required Pattern: Numbered Test Cases

All test cases MUST use numbered descriptions:

\`\`\`typescript
describe("ComponentName", () => {
  it("1. renders basic component", () => { /* ... */ });
  it("2. handles user interactions", () => { /* ... */ });
  it("3. displays correct content", () => { /* ... */ });
});
\`\`\`

## Templates

- @.contextkit/templates/test.md — Test template
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-testing.mdc', testingRule);

    // Components rule
    const componentsRule = `---
description: ContextKit component standards
globs: "**/components/**"
alwaysApply: false
---

# Component Standards

Reference: @.contextkit/standards/code-style.md

## Templates

- @.contextkit/templates/component.md — Component template
- @.contextkit/templates/story.md — Story/demo template
- @.contextkit/templates/hook.md — Custom hook template

## Commands

- @.contextkit/commands/dev/create-component.md — Create component workflow
- @.contextkit/commands/dev/spec.md — Write a component spec before coding
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-components.mdc', componentsRule);

    // API rule
    const apiRule = `---
description: ContextKit API and services standards
globs: "**/api/**, **/services/**"
alwaysApply: false
---

# API & Services Standards

Reference: @.contextkit/standards/architecture.md

## Templates

- @.contextkit/templates/api.md — API service template

## Commands

- @.contextkit/commands/dev/create-feature.md — Create feature workflow
`;
    await this.writeGeneratedFile('.cursor/rules/contextkit-api.mdc', apiRule);

    // Cursor prompts — reusable slash commands in Cursor Chat
    await this.writeGeneratedFile(
      '.cursor/prompts/analyze.md',
      `# Analyze Project

Read \`.contextkit/commands/dev/analyze.md\` and execute the analysis workflow for this project.

Scan the codebase structure, detect frameworks and patterns, then generate customized standards files in \`.contextkit/standards/\`.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/review.md',
      `# Code Review

Read \`.contextkit/commands/dev/review.md\` and execute the review workflow.

Review current changes for correctness, standards compliance, and potential issues. Flag bugs, security concerns, and standards violations.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/fix.md',
      `# Fix Bug

Read \`.contextkit/commands/dev/fix.md\` and execute the bug fix workflow.

Diagnose the root cause, implement the minimal fix, and add a regression test.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/refactor.md',
      `# Refactor

Read \`.contextkit/commands/dev/refactor.md\` and execute the refactoring workflow.

Improve code structure without changing behavior, keeping tests green at every step.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/test.md',
      `# Run Tests

Read \`.contextkit/commands/dev/run-tests.md\` and execute the testing workflow.

Generate or run tests for the specified code, covering happy paths, edge cases, and errors.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/doc.md',
      `# Add Documentation

Read \`.contextkit/commands/docs/add-documentation.md\` and execute the documentation workflow.

Add inline docs, README sections, and usage examples for the specified code.
`
    );

    // Squad prompts
    await this.writeGeneratedFile(
      '.cursor/prompts/squad.md',
      `# Squad — Kickoff

Read \`.contextkit/commands/squad/squad.md\` and execute the squad kickoff workflow.

Create the handoff file and write the PO spec for the given task. Pass the user's task description as the input.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/squad-architect.md',
      `# Squad — Architect

Read \`.contextkit/commands/squad/squad-architect.md\` and execute the architect workflow.

Read the PO spec from the handoff file, design the technical approach, and write the implementation plan.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/squad-dev.md',
      `# Squad — Dev

Read \`.contextkit/commands/squad/squad-dev.md\` and execute the dev workflow.

Follow the architect's plan to implement the code changes.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/squad-test.md',
      `# Squad — Test

Read \`.contextkit/commands/squad/squad-test.md\` and execute the test workflow.

Write and run tests against the PO's acceptance criteria.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/squad-review.md',
      `# Squad — Review

Read \`.contextkit/commands/squad/squad-review.md\` and execute the review workflow.

Review the full handoff (spec, plan, implementation, tests) and write the final verdict.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/squad-auto.md',
      `# Squad Auto — Full Pipeline (recommended)

Read \`.contextkit/commands/squad/squad-auto.md\` and execute the pipeline runner workflow.

Run after kickoff. Automatically runs architect → dev → test → review for all tasks sequentially, hands-free.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/spec.md',
      `# Spec

Read \`.contextkit/commands/dev/spec.md\` and execute the spec workflow.

Write a component spec (MD-first) before any code is created. Scaffold the spec file colocated with the component and wait for review before coding begins.
`
    );

    await this.writeGeneratedFile(
      '.cursor/prompts/ck.md',
      `# ContextKit Health Check

Read \`.contextkit/commands/dev/health-check.md\` and execute the health check workflow.

Check project setup, standards status, and integrations. Report what needs attention.
`
    );
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Cursor Usage:'));
    console.log('    Rules auto-load based on file context');
    console.log('');
    console.log(chalk.dim('  Slash commands (in Cursor Chat):'));
    console.log(chalk.dim('    /analyze  — Analyze project and generate standards'));
    console.log(chalk.dim('    /review   — Review current changes'));
    console.log(chalk.dim('    /fix      — Diagnose and fix a bug'));
    console.log(chalk.dim('    /refactor — Refactor code structure'));
    console.log(chalk.dim('    /test     — Generate or run tests'));
    console.log(chalk.dim('    /doc      — Add documentation'));
    console.log(chalk.dim('    /spec     — Write a component spec before coding'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad (multi-agent workflow):'));
    console.log(chalk.dim('    /squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    /squad-architect   — Design the implementation plan'));
    console.log(chalk.dim('    /squad-dev         — Implement the code'));
    console.log(chalk.dim('    /squad-test        — Write and run tests'));
    console.log(chalk.dim('    /squad-review      — Review and write verdict'));
    console.log(chalk.dim('    /squad-auto        — Auto-run full pipeline (recommended)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    /ck           — Check project setup and standards status'));
  }
}

module.exports = CursorIntegration;
