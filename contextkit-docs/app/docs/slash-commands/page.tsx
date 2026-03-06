'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Code, Bot, Info, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function SlashCommandsPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'commands', text: 'Available Commands' },
    { id: 'claude', text: 'Claude Code' },
    { id: 'cursor', text: 'Cursor' },
    { id: 'custom', text: 'Custom Commands' },
  ];

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
        <span>Features</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Slash Commands</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Slash Commands</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit installs reusable slash commands for Claude Code and Cursor. Each command delegates to universal workflow files in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/</code>.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          Slash commands are platform-specific thin wrappers that point to the universal command files in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/</code>. This means you maintain one set of workflows that work across all platforms.
        </p>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            How it works
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>1. <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> installs slash commands to <code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/</code></p>
            <p>2. <code className="rounded bg-muted px-1 font-mono text-xs">ck cursor</code> installs slash commands to <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code></p>
            <p>3. Both delegate to <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/*.md</code></p>
          </div>
        </div>
      </div>

      {/* Available Commands */}
      <div id="commands" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Available Commands</h2>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="Available slash commands" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-32">Command</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">What it does</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-48">Source file</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/analyze</span></td>
                <td className="py-3 px-4">Scan codebase and generate standards content</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/analyze.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/review</span></td>
                <td className="py-3 px-4">Code review with checklist</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/review.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/fix</span></td>
                <td className="py-3 px-4">Diagnose and fix bugs</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/fix.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/refactor</span></td>
                <td className="py-3 px-4">Refactor code with safety checks</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/refactor.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/test</span></td>
                <td className="py-3 px-4">Generate comprehensive tests</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/run-tests.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/doc</span></td>
                <td className="py-3 px-4">Add documentation</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/add-documentation.md</code></td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/spec</span></td>
                <td className="py-3 px-4">Write a component spec (MD-first) before coding begins</td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">commands/spec.md</code></td>
              </tr>
              <tr className="hover:bg-card transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-primary">/squad</span>
                  <span className="text-xs text-muted-foreground ml-1">+ 8 more</span>
                </td>
                <td className="py-3 px-4">Multi-role pipeline: PO → Architect → Dev → Test → Review → Doc</td>
                <td className="py-3 px-4"><Link href="/docs/squad" className="text-primary hover:underline text-xs">See Squad docs →</Link></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground italic">
          All commands are framework-agnostic. They auto-detect your project type and adapt accordingly.
        </p>
      </div>

      {/* Claude Code */}
      <div id="claude" className="rounded-lg border border-border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Claude Code</h2>
            <p className="text-sm text-muted-foreground">Slash commands in <code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/</code></p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Setup</h3>
            <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
              <div>
                <span className="text-primary mr-2">$</span>
                <span className="text-muted-foreground">contextkit claude</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Usage</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Claude Code</span>
              </div>
              <code className="block font-mono text-sm text-primary">/analyze</code>
              <code className="block font-mono text-sm text-primary">/review</code>
              <code className="block font-mono text-sm text-primary">/fix</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Files created</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/analyze.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/review.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/fix.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/refactor.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/test.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/doc.md</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cursor */}
      <div id="cursor" className="rounded-lg border border-border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
            <Code className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Cursor</h2>
            <p className="text-sm text-muted-foreground">Slash commands in <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code></p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Setup</h3>
            <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
              <div>
                <span className="text-primary mr-2">$</span>
                <span className="text-muted-foreground">contextkit cursor</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Usage</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Cursor Chat</span>
              </div>
              <code className="block font-mono text-sm text-primary">/analyze</code>
              <code className="block font-mono text-sm text-primary">/review</code>
              <code className="block font-mono text-sm text-primary">/fix</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Files created</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/analyze.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/review.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/fix.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/refactor.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/test.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/doc.md</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Commands */}
      <div id="custom" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Custom Commands</h2>
        <p className="text-muted-foreground leading-relaxed">
          You can create custom commands by adding markdown files to <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/</code>. Each file defines a workflow that AI assistants can execute.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">.contextkit/commands/my-workflow.md</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`# My Custom Workflow

## Steps

1. Read the relevant source files
2. Analyze the current implementation
3. Apply the following changes...`}</pre>
        </div>

        <p className="text-sm text-muted-foreground">
          Then reference it in your AI tool: <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit/commands/my-workflow.md</code>
        </p>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/commands"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Commands</div>
          </div>
        </Link>

        <Link
          href="/docs/squad"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Squad Workflow</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
