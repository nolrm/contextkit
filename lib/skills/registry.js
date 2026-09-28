// Canonical skill registry — single source of truth for every generated skill's
// name, description, source command file, and per-target metadata. Rendered to
// each platform by lib/skills/render.js instead of being retyped per integration.
//
// `body` may reference other skills with `{{cmd:name}}` — render.js substitutes
// the target-appropriate invocation (`/name` for Claude/Cursor, `$name` for
// Codex, plain `name` for the portable .agents/skills target).

const SKILLS = [
  // ── Dev ──────────────────────────────────────────────
  {
    name: 'analyze',
    family: 'dev',
    source: 'commands/dev/analyze.md',
    description: 'Analyze project and generate customized standards',
    body: 'Scan the codebase structure, detect frameworks and patterns, then generate customized standards files in `.contextkit/standards/`.',
    argumentHint: '[optional: scope or package path]',
    claude: { allowedTools: 'Read, Glob, Grep, Write, Bash', effort: 'high' },
  },
  {
    name: 'compress',
    family: 'dev',
    source: 'commands/dev/compress.md',
    description:
      "Measure a file's size, rewrite it for information density, and report the before/after diff",
    body: "Measure the target file's size, rewrite it for density while preserving every rule/behavior, then report the before/after line and word counts.",
    argumentHint: '<file or path to compress>',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'normal' },
  },
  {
    name: 'ck',
    family: 'dev',
    source: 'commands/dev/health-check.md',
    description: 'Check project setup, standards status, and integrations',
    body: 'Check project setup, standards status, and integrations. Report what needs attention.',
    claude: { allowedTools: 'Read, Glob, Grep, Bash', effort: 'low' },
  },
  // ── Spec ─────────────────────────────────────────────
  {
    name: 'spec',
    family: 'spec',
    source: 'commands/spec/spec.md',
    description:
      'Turn a product overview into a reference spec — data model, API contracts, UX flows, and squad-ready stories',
    body: `Reads a product overview file, breaks it into logical scopes, and writes a SPEC.md per scope in a single inline CTO pass. Produces a structured \`.contextkit/spec/\` folder. Run once per scope — {{cmd:spec}} picks up where you left off.

Auto-detects whether the overview is a greenfield product idea or an implementation plan against an existing system, and switches between a full spec (Data Model/API/UX/Stories) and a lite spec (Stories + Acceptance Criteria only) accordingly. Pass \`--full\` or \`--lite\` when starting a new spec to override the detection.`,
    argumentHint:
      '[overview.md] [--full|--lite] | [scope-name] | --redo <scope> | --verify <scope> | --reset',
    claude: { allowedTools: 'Read, Write, Glob, Grep, Task', effort: 'high', context: 'fork' },
    // Global variant drops the ".contextkit/ must exist" hard guard — global
    // skills should work in any repo with zero local ContextKit setup.
    transform: (content) =>
      content.replace(
        /## Step 0 — Guard Check\n\nVerify `\.contextkit\/` exists in the current directory\. If not, tell the user to run `ck install` first and stop\.\n\n/,
        ''
      ),
  },
  {
    name: 'spec-component',
    family: 'spec',
    source: 'commands/dev/spec-component.md',
    description: 'Write a component spec (MD-first) before coding begins',
    body: 'Write a component spec (MD-first) before any code is created. Scaffold the spec file colocated with the component and wait for review before coding begins.',
    argumentHint: '<component or feature name>',
    claude: { allowedTools: 'Read, Write, Glob, Grep', effort: 'normal' },
    // Global variant inlines the template — no external .contextkit/templates/ file to depend on.
    extraSource: 'templates/component-spec.md',
    transform: (content, templateContent) => {
      const withUpdatedStep = content.replace(
        'Create `<ComponentName>/<ComponentName>.md` using `.contextkit/templates/component-spec.md`',
        'Create `<ComponentName>/<ComponentName>.md` using the template below'
      );
      return `${withUpdatedStep}\n\n## Component Spec Template\n\n\`\`\`markdown\n${templateContent}\n\`\`\`\n`;
    },
  },

  // ── Squad ────────────────────────────────────────────
  {
    name: 'squad',
    family: 'squad',
    source: 'commands/squad/squad.md',
    description: 'Squad pipeline kickoff — create handoff file and write PO spec',
    body: `Create the handoff file(s) and write the PO spec(s) for the given input. Pass one or more quoted task descriptions, or a single \`.md\` file (a plan/overview doc) to extract tasks from automatically.

After kickoff, run {{cmd:squad-auto}} to auto-run the full pipeline hands-free, or step through manually with {{cmd:squad-architect}} → {{cmd:squad-dev}} → {{cmd:squad-test}} → {{cmd:squad-review}} → {{cmd:squad-doc}}.`,
    argumentHint: '"<task description>" | <plan-file.md>',
    claude: { allowedTools: 'Read, Write, Glob, Grep', effort: 'normal' },
  },
  {
    name: 'squad-architect',
    family: 'squad',
    source: 'commands/squad/squad-architect.md',
    description: 'Write technical implementation plan from PO spec (manual step 1/4)',
    body: `Read the PO spec from the handoff file, design the technical approach, and write the implementation plan. Use {{cmd:squad-auto}} instead to run all steps automatically.`,
    claude: { allowedTools: 'Read, Write, Glob, Grep, Bash', effort: 'normal' },
  },
  {
    name: 'squad-dev',
    family: 'squad',
    source: 'commands/squad/squad-dev.md',
    description: 'Implement code changes following architect plan (manual step 2/4)',
    body: `Follow the architect's plan to implement the code changes. Use {{cmd:squad-auto}} instead to run all steps automatically.`,
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'normal' },
  },
  {
    name: 'squad-test',
    family: 'squad',
    source: 'commands/squad/squad-test.md',
    description: 'Write and run tests against acceptance criteria (manual step 3/4)',
    body: `Write and run tests against the PO's acceptance criteria. Use {{cmd:squad-auto}} instead to run all steps automatically.`,
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'normal' },
  },
  {
    name: 'squad-review',
    family: 'squad',
    source: 'commands/squad/squad-review.md',
    description: 'Review full handoff and write pass/needs-work verdict (manual step 4/4)',
    body: `Review the full handoff (spec, plan, implementation, tests) and write the final verdict. Use {{cmd:squad-auto}} instead to run all steps automatically.`,
    claude: { allowedTools: 'Read, Write, Glob, Grep, Bash', effort: 'normal' },
  },
  {
    name: 'squad-auto',
    family: 'squad',
    source: 'commands/squad/squad-auto.md',
    description: 'Auto-run full squad pipeline hands-free (architect → dev → test → review → doc)',
    body: `Run after {{cmd:squad}} kickoff. Automatically runs architect → dev → test → review → doc for all tasks sequentially, hands-free.`,
    claude: {
      allowedTools: 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'high',
      context: 'fork',
    },
  },
  {
    name: 'squad-reset',
    family: 'squad',
    source: 'commands/squad/squad-reset.md',
    description: 'Delete squad state to start fresh',
    body: 'Delete the current squad state (`.contextkit/squad/`) so you can start fresh. Use when the squad folder is in a mixed or stuck state.',
    claude: { allowedTools: 'Read, Write, Glob', effort: 'low' },
  },
  {
    name: 'squad-doc',
    family: 'squad',
    source: 'commands/squad/squad-doc.md',
    description: 'Document changes after review passes (manual step 5/5)',
    body: `After review passes, create or update companion .md files for every new/modified code file in this task. Use {{cmd:squad-auto}} instead to run all steps automatically.`,
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep', effort: 'normal' },
  },
  {
    name: 'squad-go',
    family: 'squad',
    source: 'commands/squad/squad-go.md',
    description:
      'Extract tasks from conversation and run the full pipeline immediately — no checkpoint pause',
    body: `Reads tasks from the current conversation, writes PO specs, and immediately runs architect → dev → test → review → doc. No checkpoint pause — single invocation, hands-free.

Use {{cmd:squad}} instead when you want to review specs before execution starts.`,
    argumentHint: '"<optional task override>"',
    claude: {
      allowedTools: 'Read, Edit, Write, Glob, Grep, Bash',
      effort: 'high',
      context: 'fork',
    },
  },
  {
    name: 'squad-spec',
    family: 'squad',
    source: 'commands/squad/squad-spec.md',
    description:
      'Implement every story in a spec scope — loops continuously with context cleared between stories. Run /spec first to generate the scope.',
    body: `Processes one story per invocation. Pass the scope slug (e.g. \`01-identity-auth\`), dispatching a fresh isolated subagent per phase (Architect/Dev/Test/Review/Doc) so each one starts without the reasoning trail of earlier phases. Run {{cmd:squad-spec}} in a loop (\`/loop /clear\` plus this skill) to implement all stories continuously with a clean context between each one.

Run {{cmd:spec}} first to generate the scope, then {{cmd:squad-spec}} [scope-slug] to implement it story by story.`,
    argumentHint: '[scope-slug]',
    claude: {
      allowedTools: 'Read, Edit, Write, Glob, Grep, Bash, Task',
      effort: 'high',
      context: 'fork',
    },
  },

  // ── Docs ─────────────────────────────────────────────
  {
    name: 'doc-arch',
    family: 'docs',
    source: 'commands/docs/doc-arch.md',
    description: 'Generate or update architecture documentation (Level 1)',
    body: "Detect the project stack, then generate or update `docs/architecture.md` with system boundaries, key flows, and stack-appropriate artifacts (Mermaid diagrams, component trees, service maps).\n\nPass an optional PR number to scope to that PR's changes.",
    argumentHint: '[optional: PR number]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'high' },
  },
  {
    name: 'doc-feature',
    family: 'docs',
    source: 'commands/docs/doc-feature.md',
    description: 'Generate or update feature documentation (Level 2)',
    body: 'Detect the project stack, identify the target feature from the argument or current branch, then generate or update `docs/features/<name>.md` with purpose, components/modules, data flow, and user flows.\n\nPass a feature name, directory path, or PR number to scope the documentation.',
    argumentHint: '[optional: feature name, path, or PR number]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep, Bash', effort: 'high' },
  },
  {
    name: 'doc-component',
    family: 'docs',
    source: 'commands/docs/doc-component.md',
    description: 'Generate or update component documentation (Level 3)',
    body: 'Detect the project stack, read the target file or directory, then create or update a colocated `<name>.md` with API/props, usage examples, behavior, and edge cases.\n\nPass a file path or directory to target. Omit to infer from current context.',
    argumentHint: '[optional: file path or directory]',
    claude: { allowedTools: 'Read, Edit, Write, Glob, Grep', effort: 'normal' },
  },

  // ── Agents (meta / on-demand standards) ─────────────
  {
    name: 'agent-push-checklist',
    family: 'agents',
    source: 'commands/agents/agent-push-checklist.md',
    description: 'Pre-push quality checklist for agents before git push',
    body: 'Run before pushing from an AI agent. Validates that changes are safe, tests pass, and the push is ready.',
    claude: { allowedTools: 'Read, Glob, Grep, Bash', effort: 'low' },
  },
  {
    name: 'context-budget',
    family: 'agents',
    source: 'commands/agents/context-budget.md',
    description: 'Check context consumption and advise on compact, summarise, or continue',
    body: 'Check how much context has been consumed and advise on whether to compact, summarise, or continue.',
    claude: { allowedTools: 'Read, Glob, Grep', effort: 'low' },
  },
  {
    name: 'standards-aware',
    family: 'agents',
    source: 'commands/agents/standards-aware.md',
    description:
      'Load and apply project standards — AI-behavior rules and glossary/terminology — before acting in an agentic context',
    body: "Load and apply the project's ContextKit standards before taking action in an agentic context.",
    claude: { allowedTools: 'Read, Glob, Grep, Bash', effort: 'low' },
  },
  {
    name: 'product-context',
    family: 'agents',
    source: 'commands/agents/product-context.md',
    description: 'Load architecture decisions and roadmap context before proposing changes',
    body: 'Load architecture decisions and roadmap context before proposing changes that might conflict with a prior decision or near-term plan.',
    claude: { allowedTools: 'Read, Glob, Grep', effort: 'low' },
  },
];

function findSkill(name) {
  return SKILLS.find((s) => s.name === name);
}

function skillsByFamily(family) {
  return SKILLS.filter((s) => s.family === family);
}

module.exports = { SKILLS, findSkill, skillsByFamily };
