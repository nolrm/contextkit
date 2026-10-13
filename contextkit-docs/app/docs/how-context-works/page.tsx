'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, ArrowLeft, ArrowRight, Info } from "lucide-react"

export default function HowContextWorksPage() {
  const headings = [
    { id: 'layers', text: 'How Context Loads' },
    { id: 'always-vs-conditional', text: 'Always Loaded vs. Conditionally Loaded' },
    { id: 'per-tool', text: 'Per-Tool Rendering' },
    { id: 'keeping-small', text: 'Keeping Context Small' },
    { id: 'budget-check', text: 'Context Budget Check' },
    { id: 'enforced-vs-convention', text: "What's Enforced vs. Convention-Based" },
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
        <span>Core Concepts</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">How Context Works</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">How Context Works</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit keeps a small amount of context loaded every session — one canonical{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">AGENTS.md</code> and a short index — and
          loads topic standards only when the AI touches files they apply to.
        </p>
      </div>

      {/* Layer Architecture */}
      <div id="layers" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How Context Loads</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every session goes through the same layers before context reaches the AI:
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Session starts
    │
    ▼
Layer 1 — Always loaded
    AGENTS.md  (canonical; CLAUDE.md imports it, GEMINI.md imports it,
                Copilot / Windsurf / Aider get the same body)
    .contextkit/standards/index.md  (≤50 lines: rules, commands, pointers)
    │
    ▼
Layer 2 — Path-scoped rules (when matching files are touched)
    .claude/rules/contextkit-testing.md     →  **/*.test.*, **/__tests__/**
    .claude/rules/contextkit-code-style.md  →  src/**, lib/**, app/**, packages/**
    │
    ▼
Layer 3 — Read when relevant (the model follows AGENTS.md's table)
    architecture.md, ai-guidelines.md, workflows.md, glossary.md,
    product/decisions.md, product/roadmap.md, active goal file
    │
    ▼
AI receives context and generates code`}</pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">Layer 1 — AGENTS.md + index.md</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Loaded every session. Kept short on purpose: what to read first, when to read the rest, and the skills.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> — canonical (Codex, OpenCode, Cursor read it directly)
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> — <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code> + <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit/standards/index.md</code>
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">GEMINI.md</code> — pointer + <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code>
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code> — written by <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">Layer 2 — Path-Scoped Rules</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Loaded only when the AI touches a matching file. Enforced by the tool itself.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                Driven by <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code>
              </li>
              <li>
                Claude Code: <code className="rounded bg-muted px-1 font-mono text-xs">paths:</code> frontmatter
              </li>
              <li>
                Cursor: <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code> · Copilot: <code className="rounded bg-muted px-1 font-mono text-xs">applyTo:</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 mt-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Why CLAUDE.md imports AGENTS.md
          </p>
          <p className="text-sm text-muted-foreground">
            Claude Code reads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> on its own only when there is no <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code>. ContextKit writes a <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> that imports it, so there is one source of truth and Claude still gets its Claude-only line (skills, <code className="rounded bg-muted px-1 font-mono text-xs">AskUserQuestion</code> for decisions).
          </p>
        </div>
      </div>

      {/* Always vs Conditionally loaded */}
      <div id="always-vs-conditional" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Always Loaded vs. Conditionally Loaded</h2>
        <p className="text-muted-foreground leading-relaxed">
          Not all context files load every session. Here's what fires when (Claude Code shown):
        </p>

        <div className="rounded-lg border overflow-hidden mt-3">
          <table className="w-full text-sm" aria-label="Always loaded vs conditionally loaded context files">
            <caption className="sr-only">Always loaded vs conditionally loaded context files</caption>
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold" scope="col">File</th>
                <th className="text-left p-3 font-semibold" scope="col">Trigger</th>
                <th className="text-left p-3 font-semibold" scope="col">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3"><code className="font-mono text-xs">AGENTS.md</code> / <code className="font-mono text-xs">CLAUDE.md</code></td>
                <td className="p-3 text-muted-foreground">Every session</td>
                <td className="p-3 text-muted-foreground">Tool auto-loads its context file</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">standards/index.md</code></td>
                <td className="p-3 text-muted-foreground">Every session</td>
                <td className="p-3 text-muted-foreground">Imported by CLAUDE.md; AGENTS.md says read it first</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">contextkit-testing.md</code></td>
                <td className="p-3 text-muted-foreground">
                  Touching <code className="font-mono text-xs">*.test.*</code>, <code className="font-mono text-xs">*.spec.*</code>, <code className="font-mono text-xs">__tests__/**</code>
                </td>
                <td className="p-3 text-muted-foreground">Path-scoped rule</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">contextkit-code-style.md</code></td>
                <td className="p-3 text-muted-foreground">
                  Touching <code className="font-mono text-xs">src/**</code>, <code className="font-mono text-xs">lib/**</code>, <code className="font-mono text-xs">app/**</code>, <code className="font-mono text-xs">packages/**</code>
                </td>
                <td className="p-3 text-muted-foreground">Path-scoped rule</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">architecture.md</code>, <code className="font-mono text-xs">glossary.md</code>, …</td>
                <td className="p-3 text-muted-foreground">When the task calls for it</td>
                <td className="p-3 text-muted-foreground">AGENTS.md "Read When Relevant" table</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">goals/&lt;slug&gt;.md</code></td>
                <td className="p-3 text-muted-foreground">When a goal has <code className="font-mono text-xs">status: active</code></td>
                <td className="p-3 text-muted-foreground">AGENTS.md "Always" section</td>
              </tr>
              <tr>
                <td className="p-3"><code className="font-mono text-xs">.claude/skills/*</code></td>
                <td className="p-3 text-muted-foreground">When a skill runs</td>
                <td className="p-3 text-muted-foreground">Only the skill description is loaded up front</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-tool rendering */}
      <div id="per-tool" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Per-Tool Rendering</h2>
        <p className="text-muted-foreground leading-relaxed">
          You describe path scoping once, in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code>:
        </p>
        <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`context_rules:
  - file: standards/testing.md
    paths: ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"]
  - file: standards/code-style.md
    paths: ["src/**", "lib/**", "app/**", "packages/**"]`}</pre>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> renders it in each tool's own format. After editing the list, re-render with <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 font-mono text-xs">ck &lt;platform&gt;</code> (e.g. <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>):
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm" aria-label="Rule file per tool">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold" scope="col">Tool</th>
                <th className="text-left p-3 font-semibold" scope="col">Rule file</th>
                <th className="text-left p-3 font-semibold" scope="col">Scope key</th>
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
          Other tools (Codex, Gemini, Windsurf, Aider) rely on the "Read When Relevant" table in AGENTS.md. Stale <code className="rounded bg-muted px-1 font-mono text-xs">contextkit-*</code> rule files are removed; your own rule files are left alone.
        </p>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Fixed in 2.0:</strong> pre-2.0 Claude rule files used <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>, which Claude Code ignores, so they loaded in every session. They now use <code className="rounded bg-muted px-1 font-mono text-xs">paths:</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> to rewrite them.
          </p>
        </div>
      </div>

      {/* Keeping small */}
      <div id="keeping-small" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Keeping Context Small</h2>
        <p className="text-muted-foreground leading-relaxed">
          Always-loaded context competes with your actual task for the model's attention. ContextKit keeps it lean:
        </p>

        <div className="space-y-3 mt-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">1. A Short Index</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code> holds only what the AI needs every session — what the project is, must / must-not rules, exact commands, and a "When you touch X → read Y" table. 50 lines or fewer.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">2. Skeleton Standards</h3>
            <p className="text-sm text-muted-foreground">
              Standards files ship as empty templates. <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code> analyzes your codebase and writes only rules the AI couldn't infer from the code itself, plus the index and <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code>.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">3. /ck tidy</h3>
            <p className="text-sm text-muted-foreground">
              Shrinks always-loaded context: prunes generic or linter-enforced rules, wires orphan guides into <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code>, and promotes repeated corrections into standards.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">4. Granular Code Style</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">code-style.md</code> can be split into language-specific sub-files (<code className="rounded bg-muted px-1 font-mono text-xs">css-style.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">typescript-style.md</code>). Add each one to <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> with the paths it applies to.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">
              5. <code className="font-mono text-sm">{"<!-- when:X -->"}</code> Tags
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Sections inside standards files can be tagged with conditional hints:
            </p>
            <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`<!-- when:typescript -->
### TypeScript Conventions
Use strict mode, prefer interfaces over types...

<!-- when:css -->
### CSS Conventions
Use CSS modules, BEM naming...`}</pre>
            <p className="text-sm text-muted-foreground mt-2">
              The AI skips sections whose tag doesn't match the current context.
            </p>
          </div>
        </div>
      </div>

      {/* Context budget */}
      <div id="budget-check" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Context Budget Check</h2>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 font-mono text-xs">ck check</code> includes a stale-context check. It flags instructions that point at missing files or removed skills, and always-loaded context (AGENTS.md, CLAUDE.md, index.md, unscoped rules) over <code className="rounded bg-muted px-1 font-mono text-xs">context_budget_lines</code> lines.
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
          <code className="block font-mono text-sm">ck check --context            # only the stale-context check</code>
          <code className="block font-mono text-sm">ck check --context --strict   # treat warnings as errors</code>
        </div>
        <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`# .contextkit/config.yml
context_budget_lines: 400   # default`}</pre>
        <p className="text-sm text-muted-foreground">
          The pre-push hook runs the same check as a non-blocking warning when <code className="rounded bg-muted px-1 font-mono text-xs">ck</code> is on your PATH.
        </p>
      </div>

      {/* Honest callout */}
      <div id="enforced-vs-convention" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What's Enforced vs. Convention-Based</h2>
        <p className="text-muted-foreground leading-relaxed">
          Not all loading mechanisms have the same level of enforcement. It's important to understand the difference:
        </p>

        <div className="grid gap-4 md:grid-cols-2 mt-3">
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Hard Enforcement</p>
            <p className="text-sm text-muted-foreground mb-2">
              These are controlled by the AI platform itself — the model receives or doesn't receive the content
              regardless of how it behaves.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ✓ <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code> / <code className="rounded bg-muted px-1 font-mono text-xs">@index.md</code> imports
              </li>
              <li>
                ✓ The AGENTS.md mirror files (Copilot, Windsurf, Aider)
              </li>
              <li>
                ✓ Path-scoped rules (<code className="rounded bg-muted px-1 font-mono text-xs">paths:</code>, <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>, <code className="rounded bg-muted px-1 font-mono text-xs">applyTo:</code>)
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Convention-Based</p>
            <p className="text-sm text-muted-foreground mb-2">
              These rely on the AI model reading and respecting the hints. They work well in practice but are not
              technically enforced.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ~ The "Read When Relevant" table in AGENTS.md
              </li>
              <li>
                ~ <code className="rounded bg-muted px-1 font-mono text-xs">{"<!-- when:X -->"}</code> tags
              </li>
              <li>
                ~ <code className="rounded bg-muted px-1 font-mono text-xs">{"<!-- context-check:X -->"}</code> tags
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mt-2 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> For critical standards you always want applied, put them
            in <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code> (always loaded) or a path-scoped rule. Reserve{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">when:</code> tags for optional hints that help
            the AI focus but aren't load-bearing.
          </p>
        </div>
      </div>

      {/* Pro tip */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">Pro Tip</p>
        <p className="text-sm text-muted-foreground">
          Start with the defaults and run{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code> to populate your standards, index, and context rules.
          As your project grows, split large standards into granular files and scope them in <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> —
          then run <code className="rounded bg-muted px-1 font-mono text-xs">/ck tidy</code> now and then to keep always-loaded context tight.
        </p>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/upgrade-2-0"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Upgrading to 2.0</div>
          </div>
        </Link>

        <Link
          href="/docs/md-first"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">MD-First Development</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
