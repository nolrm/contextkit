'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function ProjectStructurePage() {
  const headings = [
    { id: 'directory-overview', text: 'Directory Overview' },
    { id: 'context-files', text: 'Context Files' },
    { id: 'contextkit-dir', text: 'The .contextkit Directory' },
    { id: 'context-rules', text: 'Path-Scoped Rules' },
    { id: 'platform-integrations', text: 'Platform-Specific Integrations' },
    { id: 'customization', text: 'Customization' },
  ]

  useEffect(() => {
    const tocContainer = document.getElementById('toc-container')
    if (tocContainer) {
      tocContainer.innerHTML = `
        <nav class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
          <div class="grid grid-flow-row auto-rows-max text-sm">
            ${headings.map(h => `
              <a
                href="#${h.id}"
                class="flex w-full items-center py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ${h.text}
              </a>
            `).join('')}
          </div>
        </nav>
      `
    }
  }, [headings])
  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Getting Started</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Project Structure</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Project Structure</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          What <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck install</code> writes: one canonical
          context file (<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">AGENTS.md</code>), a short
          always-loaded index, topic standards that load only where they apply, and five small skills.
        </p>
      </div>

      <div id="directory-overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Directory Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          A typical project after <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck install</code> with Claude Code selected:
        </p>
        <div className="rounded-lg border bg-card p-4 mt-4">
          <p className="text-sm font-medium mb-3">Directory structure created:</p>
          <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">
            {`your-project/
├── AGENTS.md                     ← Canonical context file (every tool)
├── CLAUDE.md                     ← @AGENTS.md + @.contextkit/standards/index.md
├── .contextkit/
│   ├── standards/
│   │   ├── index.md              ← Always loaded, ≤50 lines (written by /ck setup)
│   │   ├── code-style.md         ← Coding conventions
│   │   ├── code-style/           ← Granular style guides
│   │   │   ├── css-style.md
│   │   │   └── typescript-style.md
│   │   ├── testing.md            ← Test patterns
│   │   ├── architecture.md       ← Architecture decisions
│   │   ├── ai-guidelines.md      ← AI behavior rules
│   │   ├── workflows.md          ← Team process
│   │   ├── glossary.md           ← Project terminology
│   │   └── README.md
│   ├── product/                  ← Product context
│   │   ├── mission.md
│   │   ├── mission-lite.md
│   │   ├── roadmap.md
│   │   ├── decisions.md
│   │   └── context.md
│   ├── goals/                    ← /goal files (created on first use)
│   ├── commands/                 ← Workflow files the skills point at
│   ├── templates/                ← goal.md, component.md, test.md, …
│   ├── hooks/                    ← pre-push, commit-msg
│   ├── quality-gates.yml         ← Pre-push gate config
│   ├── corrections.md            ← Corrections log (ck note, /learn)
│   └── config.yml                ← headline, context_rules, budget, …
│
├── .claude/
│   ├── rules/
│   │   ├── contextkit-testing.md     ← paths: test files
│   │   └── contextkit-code-style.md  ← paths: src/**, lib/**, …
│   └── skills/                   ← ck, doc, learn, goal, headline
└── .agents/skills/               ← Portable copy (Codex, Cursor)`}
          </pre>
          <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">ℹ️ Skeleton Files</p>
            <p className="text-xs text-muted-foreground">
              Standards files start as blank templates. Run <code className="rounded bg-muted px-1 font-mono">/ck setup</code> in your AI tool to analyze the codebase and write the standards, <code className="rounded bg-muted px-1 font-mono">index.md</code>, and <code className="rounded bg-muted px-1 font-mono">context_rules</code>.
            </p>
          </div>
        </div>
      </div>

      <div id="context-files" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Context Files</h2>
        <p className="text-muted-foreground leading-relaxed">
          ContextKit keeps one source of truth. Every integration writes the same <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">AGENTS.md</code> block; other tools either import it or get a copy of the same body.
        </p>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">AGENTS.md</h3>
            <p className="text-sm text-muted-foreground mb-3">The canonical context file, written inside ContextKit markers (your own text outside them is kept)</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">Always</span>
                <span className="text-muted-foreground">- Read <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code> first, read the active goal if there is one, check <code className="rounded bg-muted px-1 font-mono text-xs">corrections.md</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">Read When Relevant</span>
                <span className="text-muted-foreground">- A table mapping tasks to files: code-style, testing, architecture, ai-guidelines, workflows, glossary, product decisions/roadmap</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">Skills</span>
                <span className="text-muted-foreground">- <code className="rounded bg-muted px-1 font-mono text-xs">ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">doc</code>, <code className="rounded bg-muted px-1 font-mono text-xs">learn</code>, <code className="rounded bg-muted px-1 font-mono text-xs">goal</code>, <code className="rounded bg-muted px-1 font-mono text-xs">headline</code>, plus a version stamp</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">CLAUDE.md</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Imports the canonical file. Claude Code only reads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> on its own when there is no <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code>, so the import keeps the two in step.
            </p>
            <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`@AGENTS.md
@.contextkit/standards/index.md

Claude Code: skills run as /ck, /doc, /learn, /goal, /headline. Topic standards
load from .claude/rules/ when you touch matching files. When you need a decision,
ask with AskUserQuestion — concrete options, recommended first.`}</pre>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">.contextkit/standards/index.md</h3>
            <p className="text-sm text-muted-foreground">
              New in 2.0. Always loaded and kept to 50 lines or fewer: what the project is, must / must-not rules, exact commands, and a "When you touch X → read Y" table. <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code> writes it; <code className="rounded bg-muted px-1 font-mono text-xs">/ck tidy</code> keeps it short.
            </p>
          </div>
        </div>
      </div>

      <div id="contextkit-dir" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The .contextkit Directory</h2>
        <p className="text-muted-foreground leading-relaxed">
          This is where your project standards and context files live:
        </p>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">standards/</h3>
            <p className="text-sm text-muted-foreground mb-3">Topic standards — loaded when relevant, not every session</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">index.md</span>
                <span className="text-muted-foreground">- Short always-loaded summary and pointers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">code-style.md</span>
                <span className="text-muted-foreground">- YOUR coding conventions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">code-style/</span>
                <span className="text-muted-foreground">- Granular style guides (CSS, TypeScript)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">testing.md</span>
                <span className="text-muted-foreground">- YOUR test patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">architecture.md</span>
                <span className="text-muted-foreground">- YOUR architecture decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">ai-guidelines.md</span>
                <span className="text-muted-foreground">- AI behavior rules (commits, when to ask)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">workflows.md</span>
                <span className="text-muted-foreground">- Team process (branches, releases)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">glossary.md</span>
                <span className="text-muted-foreground">- YOUR project terminology</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">frontend/ backend/</span>
                <span className="text-muted-foreground">- Scope-specific standards (monorepos)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">product/</h3>
            <p className="text-sm text-muted-foreground mb-3">Product context for AI understanding</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">mission.md</span>
                <span className="text-muted-foreground">- Product vision and purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">mission-lite.md</span>
                <span className="text-muted-foreground">- Condensed mission for AI context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">roadmap.md</span>
                <span className="text-muted-foreground">- Development phases and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">decisions.md</span>
                <span className="text-muted-foreground">- Architecture Decision Records (ADRs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">context.md</span>
                <span className="text-muted-foreground">- Domain-specific context</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">goals/</h3>
            <p className="text-sm text-muted-foreground">
              One-page goal files for long-running tasks (<code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/goals/&lt;slug&gt;.md</code>). <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> tells the agent to read the active one before starting work. See <Link href="/docs/goal" className="text-primary hover:underline">/goal</Link>.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">corrections.md</h3>
            <p className="text-sm text-muted-foreground mb-3">Corrections log</p>
            <p className="text-sm text-muted-foreground">
              Tracks AI behavior issues and preferences. Add entries with <code className="rounded bg-muted px-1 font-mono text-xs">ck note</code>, or use <code className="rounded bg-muted px-1 font-mono text-xs">/learn</code> to turn a correction into a rule in the right standards file.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">config.yml</h3>
            <p className="text-sm text-muted-foreground mb-3">Project configuration (<code className="rounded bg-muted px-1 font-mono text-xs">format_version: 2</code>)</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">headline</span>
                <span className="text-muted-foreground">- <code className="rounded bg-muted px-1 font-mono text-xs">true|false</code> — the always-on <Link href="/docs/headline" className="text-primary hover:underline">headline</Link> reply style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">diagrams_in_docs</span>
                <span className="text-muted-foreground">- Allow Mermaid diagrams in generated docs (default <code className="rounded bg-muted px-1 font-mono text-xs">false</code>)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">context_rules</span>
                <span className="text-muted-foreground">- Which topic standards load for which paths (see below)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">context_budget_lines</span>
                <span className="text-muted-foreground">- Warn when always-loaded context passes this many lines (default <code className="rounded bg-muted px-1 font-mono text-xs">400</code>)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">instructions/ and policies/</h3>
            <p className="text-sm text-muted-foreground">
              Pre-/post-flight workflow instructions and <code className="rounded bg-muted px-1 font-mono text-xs">policy.yml</code> enforcement levels (off, warn, block).
            </p>
          </div>
        </div>
      </div>

      <div id="context-rules" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Path-Scoped Rules</h2>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">context_rules</code> in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.contextkit/config.yml</code> maps each topic standards file to the paths it applies to. These are the defaults:
        </p>
        <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`context_rules:
  - file: standards/testing.md
    paths: ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"]
  - file: standards/code-style.md
    paths: ["src/**", "lib/**", "app/**", "packages/**"]`}</pre>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/ck setup</code> and <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/ck tidy</code> maintain the list; <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck install</code> renders it in each tool's format. After editing it by hand, re-render with <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck &lt;platform&gt;</code> (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck claude</code>):
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm" aria-label="Path-scoped rule output per tool">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold" scope="col">Tool</th>
                <th className="text-left p-3 font-semibold" scope="col">File</th>
                <th className="text-left p-3 font-semibold" scope="col">Frontmatter</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3 text-muted-foreground">Claude Code</td>
                <td className="p-3"><code className="font-mono text-xs">.claude/rules/contextkit-&lt;name&gt;.md</code></td>
                <td className="p-3"><code className="font-mono text-xs">paths:</code></td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Cursor</td>
                <td className="p-3"><code className="font-mono text-xs">.cursor/rules/contextkit-&lt;name&gt;.mdc</code></td>
                <td className="p-3"><code className="font-mono text-xs">globs:</code></td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">GitHub Copilot</td>
                <td className="p-3"><code className="font-mono text-xs">.github/instructions/contextkit-&lt;name&gt;.instructions.md</code></td>
                <td className="p-3"><code className="font-mono text-xs">applyTo:</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Stale <code className="rounded bg-muted px-1 font-mono text-xs">contextkit-*</code> rule files are removed when they drop out of the list. Your own rule files are never touched.
        </p>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">ℹ️ Fixed in 2.0</p>
          <p className="text-xs text-muted-foreground">
            Before 2.0, the Claude rule files used <code className="rounded bg-muted px-1 font-mono">globs:</code>, which Claude Code ignores — so they loaded in every session. They now use <code className="rounded bg-muted px-1 font-mono">paths:</code> and only load when you touch matching files.
          </p>
        </div>
      </div>

      <div id="platform-integrations" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Platform-Specific Integrations</h2>
        <p className="text-muted-foreground leading-relaxed">Every integration writes <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">AGENTS.md</code>, then adds what its tool needs:</p>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Claude Code - CLAUDE.md + .claude/rules/ + .claude/skills/</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> imports <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code>. Topic standards load from path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">/context</code> in Claude Code to see what is loaded.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Codex / OpenCode - AGENTS.md + .codex/skills/ + .agents/skills/</h3>
            <p className="text-sm text-muted-foreground">
              Read <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> directly. In Codex, skills run as <code className="rounded bg-muted px-1 font-mono text-xs">$ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">$doc</code>, and so on.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Cursor - .cursor/rules/ + .cursor/prompts/</h3>
            <p className="text-sm text-muted-foreground">
              Reads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, plus path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">contextkit-&lt;name&gt;.mdc</code> rules. Skills are in <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code>.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Gemini CLI - GEMINI.md</h3>
            <p className="text-sm text-muted-foreground">
              A short pointer plus <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code>.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Copilot, Windsurf, Aider - mirror files</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">.github/copilot-instructions.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code>, and <code className="rounded bg-muted px-1 font-mono text-xs">CONVENTIONS.md</code> get the same body as <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, since these tools may not read it. Copilot also gets path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">.github/instructions/</code> files.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Continue.dev - .continue/rules/</h3>
            <p className="text-sm text-muted-foreground">
              A ContextKit rule file pointing at the standards, for Continue in any editor.
            </p>
          </div>
        </div>
      </div>

      <div id="customization" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Customization</h2>
        <p className="text-muted-foreground leading-relaxed">
          Everything in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.contextkit/</code> is yours to edit. After running <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/ck setup</code> in your AI tool, tune it to your team:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
          <li>Keep the must-know rules and commands in index.md — short</li>
          <li>Put topic detail in code-style.md, testing.md, architecture.md and friends</li>
          <li>Point topic files at the paths they apply to with context_rules</li>
          <li>Add project terminology to glossary.md</li>
          <li>Capture decisions in product/decisions.md</li>
          <li>Use /learn when you correct the AI, so the rule sticks</li>
          <li>Run /ck tidy when always-loaded context grows (ck check --context warns past the budget)</li>
        </ul>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">Pro Tip</p>
        <p className="text-sm text-muted-foreground">
          Write rules the AI can't infer from your code or config — specific, project-only conventions. Generic advice
          and anything your linter already enforces just adds noise.
        </p>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/quick-start"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Quick Start</div>
          </div>
        </Link>

        <Link
          href="/docs/upgrade-2-0"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Upgrading to 2.0</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
