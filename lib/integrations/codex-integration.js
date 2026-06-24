const chalk = require('chalk');
const BaseIntegration = require('./base-integration');

class CodexIntegration extends BaseIntegration {
  constructor() {
    super();
    this.name = 'codex';
    this.displayName = 'OpenAI Codex CLI';
    this.bridgeFiles = ['AGENTS.md'];
    this.generatedFiles = [
      '.codex/skills/analyze/SKILL.md',
      '.codex/skills/review/SKILL.md',
      '.codex/skills/refactor/SKILL.md',
      '.codex/skills/test/SKILL.md',
      '.codex/skills/doc/SKILL.md',
      '.codex/skills/spec/SKILL.md',
      '.codex/skills/spec-component/SKILL.md',
      '.codex/skills/ck/SKILL.md',
      '.codex/skills/squad/SKILL.md',
      '.codex/skills/squad-architect/SKILL.md',
      '.codex/skills/squad-dev/SKILL.md',
      '.codex/skills/squad-test/SKILL.md',
      '.codex/skills/squad-review/SKILL.md',
      '.codex/skills/squad-auto/SKILL.md',
      '.codex/skills/squad-reset/SKILL.md',
      '.codex/skills/squad-doc/SKILL.md',
      '.codex/skills/squad-go/SKILL.md',
      '.codex/skills/squad-spec/SKILL.md',
      '.codex/skills/doc-arch/SKILL.md',
      '.codex/skills/doc-feature/SKILL.md',
      '.codex/skills/doc-component/SKILL.md',
      '.codex/skills/agent-push-checklist/SKILL.md',
      '.codex/skills/context-budget/SKILL.md',
      '.codex/skills/standards-aware/SKILL.md',
    ];
    this.platformDir = '.codex';
  }

  async generateFiles() {
    // Bridge file: AGENTS.md (auto-loaded by Codex)
    const bridgeContent = `# Project Standards (ContextKit)

This project uses [ContextKit](https://github.com/nolrm/contextkit) for AI development standards.

## Project Standards

Read these files before writing code:

- \`.contextkit/standards/code-style.md\` — Coding conventions and style rules
- \`.contextkit/standards/testing.md\` — Testing patterns and requirements
- \`.contextkit/standards/architecture.md\` — Architecture decisions and patterns
- \`.contextkit/standards/ai-guidelines.md\` — AI behavior and usage guidelines
- \`.contextkit/standards/workflows.md\` — Development workflows and processes
- \`.contextkit/standards/glossary.md\` — Project terminology and shortcuts

## Product Context

- \`.contextkit/product/mission-lite.md\` — Product mission (condensed)
- \`.contextkit/product/decisions.md\` — Architecture Decision Records
- \`.contextkit/product/roadmap.md\` — Development roadmap

## Corrections Log

- \`.contextkit/corrections.md\` — Track AI performance improvements

## Quick Reference

Before writing code, always read the relevant standards files above. ContextKit skills are available in \`.codex/skills/\` — use them to run the spec and squad pipelines.`;

    await this.writeBridgeFile('AGENTS.md', bridgeContent);

    // Skills
    await this.writeGeneratedFile(
      '.codex/skills/analyze/SKILL.md',
      `---
name: analyze
description: Analyze project and generate customized standards
---

Read \`.contextkit/commands/dev/analyze.md\` and execute the analysis workflow for this project.

Scan the codebase structure, detect frameworks and patterns, then generate customized standards files in \`.contextkit/standards/\`.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/review/SKILL.md',
      `---
name: review
description: Review current changes for correctness and standards compliance
---

Read \`.contextkit/commands/dev/review.md\` and execute the review workflow.

Review current changes for correctness, standards compliance, and potential issues.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/refactor/SKILL.md',
      `---
name: refactor
description: Improve code structure without changing behavior
---

Read \`.contextkit/commands/dev/refactor.md\` and execute the refactoring workflow.

Improve code structure without changing behavior, keeping tests green at every step.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/test/SKILL.md',
      `---
name: test
description: Generate or run tests covering happy paths, edge cases, and errors
---

Read \`.contextkit/commands/dev/run-tests.md\` and execute the testing workflow.

Generate or run tests for the specified code, covering happy paths, edge cases, and errors.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/doc/SKILL.md',
      `---
name: doc
description: Add inline docs, README sections, and usage examples
---

Read \`.contextkit/commands/docs/add-documentation.md\` and execute the documentation workflow.

Add inline docs, README sections, and usage examples for the specified code.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/spec-component/SKILL.md',
      `---
name: spec-component
description: Write a component spec (MD-first) before coding begins
---

Read \`.contextkit/commands/dev/spec-component.md\` and execute the component spec workflow.

Write a component spec (MD-first) before any code is created. Scaffold the spec file colocated with the component and wait for review before coding begins.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/spec/SKILL.md',
      `---
name: spec
description: Turn a product overview into a reference spec — data model, API contracts, UX flows, and squad-ready stories
---

Read \`.contextkit/commands/spec/spec.md\` and execute the spec pipeline workflow.

Single inline CTO pass per scope. Reads a product overview, identifies logical scopes, and writes a full SPEC.md per scope covering data model, API contracts, UX flows, stories, and copy-paste squad commands. Run once per scope — picks up where it left off automatically.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/ck/SKILL.md',
      `---
name: ck
description: Check project setup, standards status, and integrations
---

Read \`.contextkit/commands/dev/health-check.md\` and execute the health check workflow.

Check project setup, standards status, and integrations. Report what needs attention.
`
    );

    // Squad skills
    await this.writeGeneratedFile(
      '.codex/skills/squad/SKILL.md',
      `---
name: squad
description: Squad pipeline kickoff — create handoff file and write PO spec
---

Read \`.contextkit/commands/squad/squad.md\` and execute the squad kickoff workflow.

Create the handoff file and write the PO spec for the given task. Pass the task description as input.

After kickoff, run \`$squad-auto\` to run the full pipeline hands-free, or step through manually with \`$squad-architect\` → \`$squad-dev\` → \`$squad-test\` → \`$squad-review\` → \`$squad-doc\`.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-architect/SKILL.md',
      `---
name: squad-architect
description: Write technical implementation plan from PO spec (manual step 1/4)
---

Read \`.contextkit/commands/squad/squad-architect.md\` and execute the architect workflow.

Read the PO spec from the handoff file and design the technical approach. Use \`$squad-auto\` to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-dev/SKILL.md',
      `---
name: squad-dev
description: Implement code changes following architect plan (manual step 2/4)
---

Read \`.contextkit/commands/squad/squad-dev.md\` and execute the dev workflow.

Follow the architect's plan to implement the code changes. Use \`$squad-auto\` to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-test/SKILL.md',
      `---
name: squad-test
description: Write and run tests against acceptance criteria (manual step 3/4)
---

Read \`.contextkit/commands/squad/squad-test.md\` and execute the test workflow.

Write and run tests against the PO's acceptance criteria. Use \`$squad-auto\` to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-review/SKILL.md',
      `---
name: squad-review
description: Review full handoff and write pass/needs-work verdict (manual step 4/4)
---

Read \`.contextkit/commands/squad/squad-review.md\` and execute the review workflow.

Review the full handoff (spec, plan, implementation, tests) and write the final verdict. Use \`$squad-auto\` to run all steps automatically.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-auto/SKILL.md',
      `---
name: squad-auto
description: Auto-run full squad pipeline hands-free (architect → dev → test → review → doc)
---

Read \`.contextkit/commands/squad/squad-auto.md\` and execute the pipeline runner workflow.

Run after \`$squad\` kickoff. Automatically runs architect → dev → test → review → doc for all tasks sequentially, hands-free.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-reset/SKILL.md',
      `---
name: squad-reset
description: Delete squad state to start fresh
---

Read \`.contextkit/commands/squad/squad-reset.md\` and execute the reset workflow.

Delete the current squad state (\`.contextkit/squad/\`) so you can start fresh.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-doc/SKILL.md',
      `---
name: squad-doc
description: Document changes after review passes (manual step 5/5)
---

Read \`.contextkit/commands/squad/squad-doc.md\` and execute the doc workflow.

After review passes, create or update companion .md files for every new/modified code file in this task.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-go/SKILL.md',
      `---
name: squad-go
description: Extract tasks from conversation and run the full pipeline immediately — no checkpoint pause
---

Read \`.contextkit/commands/squad/squad-go.md\` and execute the express pipeline workflow.

Reads tasks from the current conversation, writes PO specs, and immediately runs architect → dev → test → review → doc. No checkpoint pause — single invocation, hands-free.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/squad-spec/SKILL.md',
      `---
name: squad-spec
description: Implement every story in a spec scope — run /spec first to generate the scope
---

Read \`.contextkit/commands/squad/squad-spec.md\` and execute it.

Processes one story per invocation. Pass the scope slug (e.g. \`01-identity-auth\`). Run \`$spec\` first to generate the scope, then \`$squad-spec [scope-slug]\` to implement it story by story.
`
    );

    // Doc skills
    await this.writeGeneratedFile(
      '.codex/skills/doc-arch/SKILL.md',
      `---
name: doc-arch
description: Generate or update architecture documentation (Level 1)
---

Read \`.contextkit/commands/docs/doc-arch.md\` and execute the architecture documentation workflow.

Detect the project stack, then generate or update \`docs/architecture.md\` with system boundaries, key flows, and stack-appropriate artifacts.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/doc-feature/SKILL.md',
      `---
name: doc-feature
description: Generate or update feature documentation (Level 2)
---

Read \`.contextkit/commands/docs/doc-feature.md\` and execute the feature documentation workflow.

Detect the project stack, identify the target feature, then generate or update \`docs/features/<name>.md\`.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/doc-component/SKILL.md',
      `---
name: doc-component
description: Generate or update component documentation (Level 3)
---

Read \`.contextkit/commands/docs/doc-component.md\` and execute the component documentation workflow.

Detect the project stack, read the target file, then create or update a colocated \`<name>.md\`.
`
    );

    // Agent skills
    await this.writeGeneratedFile(
      '.codex/skills/agent-push-checklist/SKILL.md',
      `---
name: agent-push-checklist
description: Pre-push quality checklist for agents before git push
---

Read \`.contextkit/commands/agents/agent-push-checklist.md\` and execute the agent push checklist workflow.

Run before pushing from an AI agent. Validates that changes are safe, tests pass, and the push is ready.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/context-budget/SKILL.md',
      `---
name: context-budget
description: Check context consumption and advise on compact, summarise, or continue
---

Read \`.contextkit/commands/agents/context-budget.md\` and execute the context budget workflow.

Check how much context has been consumed and advise on whether to compact, summarise, or continue.
`
    );

    await this.writeGeneratedFile(
      '.codex/skills/standards-aware/SKILL.md',
      `---
name: standards-aware
description: Load and apply project standards before acting in an agentic context
---

Read \`.contextkit/commands/agents/standards-aware.md\` and execute the standards-aware workflow.

Load and apply the project's ContextKit standards before taking action in an agentic context.
`
    );
  }

  showUsage() {
    console.log('');
    console.log(chalk.bold('  Codex CLI Usage:'));
    console.log('    AGENTS.md is auto-loaded every session');
    console.log('    Skills are installed in .codex/skills/');
    console.log('');
    console.log(chalk.dim('  Skills (use $skill-name in Codex):'));
    console.log(chalk.dim('    $analyze       — Analyze project and generate standards'));
    console.log(chalk.dim('    $review        — Review current changes'));
    console.log(chalk.dim('    $refactor      — Refactor code structure'));
    console.log(chalk.dim('    $test          — Generate or run tests'));
    console.log(chalk.dim('    $doc           — Add documentation'));
    console.log(chalk.dim('    $doc-arch      — Architecture docs (Level 1)'));
    console.log(chalk.dim('    $doc-feature   — Feature docs (Level 2)'));
    console.log(chalk.dim('    $doc-component — Component docs (Level 3)'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Squad pipeline:'));
    console.log(chalk.dim('    $squad "task"      — Kickoff: create handoff + PO spec'));
    console.log(chalk.dim('    $squad-auto        — Auto-run full pipeline (recommended)'));
    console.log(chalk.dim('    $squad-go          — Extract tasks from conversation and run'));
    console.log(chalk.dim('    $squad-spec [scope] — Implement all stories in a spec scope'));
    console.log(chalk.dim('    $squad-architect / $squad-dev / $squad-test / $squad-review'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Spec pipeline:'));
    console.log(chalk.dim('    $spec [scope]      — Run spec pipeline for next or named scope'));
    console.log(chalk.dim(''));
    console.log(chalk.dim('  Health check:'));
    console.log(chalk.dim('    $ck                — Check project setup and standards status'));
  }
}

module.exports = CodexIntegration;
