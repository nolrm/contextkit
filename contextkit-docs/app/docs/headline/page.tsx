'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Info, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function HeadlinePage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'rules', text: 'The Rules' },
    { id: 'always-on', text: 'How It Stays On' },
    { id: 'usage', text: 'On, Off, Pause' },
    { id: 'config', text: 'Opting Out' },
    { id: 'teams', text: 'Teams Without ContextKit' },
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

  const headlineBlock = `<!-- headline:start -->
## Response Style (headline)

- Lead with the result or answer.
- Don't narrate reasoning or recap what you did.
- Plain sentences; tables only when comparing.
- Ask with options, not open-ended questions.
- Say plainly when something failed or was skipped.
- Code, commands, and paths stay complete — only prose gets shorter.
<!-- headline:end -->`

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Features</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">/headline</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">/headline</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Short, result-first replies, always on. Six rules in your instructions file make AI replies faster to read: the answer first, no narration, and complete code. An add-on skill that works with or without ContextKit.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          AI replies often bury the result under a recap of what was done and why. Headline asks for the answer first, in plain sentences. It isn&apos;t a terse &quot;caveman&quot; style: grammar stays, filler goes. Code, commands, and paths are never shortened.
        </p>
      </div>

      {/* Rules */}
      <div id="rules" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Rules</h2>
        <p className="text-muted-foreground leading-relaxed">
          This exact block is written to your instructions file, markers included:
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">AGENTS.md</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{headlineBlock}</pre>
        </div>
      </div>

      {/* Always on */}
      <div id="always-on" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How It Stays On</h2>
        <p className="text-muted-foreground leading-relaxed">
          A skill only runs when it&apos;s invoked, so the rules live in a file every session loads. <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> writes the block into:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
          <li><code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, the canonical home</li>
          <li>The files that mirror AGENTS.md for tools that may not read it: <code className="rounded bg-muted px-1 font-mono text-xs">.github/copilot-instructions.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code>, <code className="rounded bg-muted px-1 font-mono text-xs">CONVENTIONS.md</code></li>
          <li><code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> only if it doesn&apos;t import <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code>, so Claude never reads it twice</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Everything between <code className="rounded bg-muted px-1 font-mono text-xs">{'<!-- headline:start -->'}</code> and <code className="rounded bg-muted px-1 font-mono text-xs">{'<!-- headline:end -->'}</code> is managed. The rest of the file is left alone.
        </p>
      </div>

      {/* On / off / pause */}
      <div id="usage" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">On, Off, Pause</h2>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="/headline usage" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-48">Command</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">What it does</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/headline</span></td>
                <td className="py-3 px-4">Turn on. Asks where: this project (<code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>) or all your projects (<code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/CLAUDE.md</code> and/or <code className="rounded bg-muted px-1 font-mono text-xs">~/.codex/AGENTS.md</code>)</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/headline off</span></td>
                <td className="py-3 px-4">Remove the block, markers included</td>
              </tr>
              <tr className="hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/headline pause</span></td>
                <td className="py-3 px-4">Ignore the rules for the rest of this session; no files change</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">In Codex, use <code className="rounded bg-muted px-1 font-mono text-xs">$headline</code>.</p>
      </div>

      {/* Config */}
      <div id="config" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Opting Out</h2>
        <p className="text-muted-foreground leading-relaxed">
          Skip it at install time:
        </p>
        <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
          <div>
            <span className="text-primary mr-2">$</span>
            <span className="text-muted-foreground">ck install --no-headline</span>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Or toggle it for the project in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code>:
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`headline: false`}</pre>
        </div>
        <p className="text-sm text-muted-foreground">
          Apply the change with <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 font-mono text-xs">ck &lt;platform&gt;</code> (for example <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>). Both regenerate files and add or remove the block. Plain <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> exits early when there&apos;s no new version.
        </p>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Upgrading from 1.x
          </p>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 font-mono text-xs">headline</code> replaces the old response-style block. <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> converts it for you. See <Link href="/docs/upgrade-2-0" className="text-primary hover:underline">Upgrading to 2.0</Link>.
          </p>
        </div>
      </div>

      {/* Teams */}
      <div id="teams" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Teams Without ContextKit</h2>
        <p className="text-muted-foreground leading-relaxed">
          Headline doesn&apos;t need ContextKit. Two ways to share it:
        </p>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-base">1. Copy the block</h3>
          <p className="text-sm text-muted-foreground">
            Paste this at the end of your project&apos;s <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> or <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code>, or your personal <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/CLAUDE.md</code>:
          </p>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{headlineBlock}</pre>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-base">2. Install the skill globally</h3>
          <p className="text-sm text-muted-foreground">
            Writes <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/headline/SKILL.md</code>. Then run <code className="rounded bg-muted px-1 font-mono text-xs">/headline</code> in any project to add the block. It&apos;s also in the ContextKit Claude Code plugin.
          </p>
          <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
            <div>
              <span className="text-primary mr-2">$</span>
              <span className="text-muted-foreground">ck install --global headline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/goal"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">/goal</div>
          </div>
        </Link>

        <Link
          href="/docs/quality-gates"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Quality Gates</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
