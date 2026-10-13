'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Code, Bot, Info, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function SlashCommandsPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'skills', text: 'The Five Skills' },
    { id: 'ck', text: '/ck' },
    { id: 'doc', text: '/doc' },
    { id: 'learn', text: '/learn' },
    { id: 'claude', text: 'Claude Code' },
    { id: 'cursor', text: 'Cursor' },
    { id: 'codex', text: 'Codex' },
    { id: 'global', text: 'Global Skills & Plugin' },
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
          ContextKit 2.0 installs five small skills: <span className="font-mono text-primary">/ck</span>, <span className="font-mono text-primary">/doc</span>, and <span className="font-mono text-primary">/learn</span>, plus two add-ons, <span className="font-mono text-primary">/goal</span> and <span className="font-mono text-primary">/headline</span>. Each skill is a thin wrapper around a workflow file in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/</code>.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          Skills are generated from one registry and rendered for each tool, so they behave the same everywhere. In Claude Code and Cursor you run them as <code className="rounded bg-muted px-1 font-mono text-xs">/name</code>. In Codex you run them as <code className="rounded bg-muted px-1 font-mono text-xs">$name</code>.
        </p>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            How it works
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>1. <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> writes skills to <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/&lt;name&gt;/SKILL.md</code></p>
            <p>2. <code className="rounded bg-muted px-1 font-mono text-xs">ck codex</code> writes <code className="rounded bg-muted px-1 font-mono text-xs">.codex/skills/</code> and the portable <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code></p>
            <p>3. <code className="rounded bg-muted px-1 font-mono text-xs">ck cursor</code> writes <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/&lt;name&gt;.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code></p>
            <p>4. Every skill reads its workflow from <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/commands/</code></p>
          </div>
        </div>
      </div>

      {/* The five skills */}
      <div id="skills" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Five Skills</h2>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="ContextKit skills" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-32">Skill</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-64">Usage</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">What it does</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/ck</span></td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">/ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/ck tidy</code></td>
                <td className="py-3 px-4">Status, first-time setup, finishing an upgrade, and keeping context lean</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/doc</span></td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">/doc</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/doc arch</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/doc feature [name]</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/doc component &lt;path&gt;</code></td>
                <td className="py-3 px-4">Update docs and standards affected by your change, or write a doc at a given level</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/learn</span></td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">/learn &quot;rule&quot;</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/learn</code></td>
                <td className="py-3 px-4">Turn a correction into one rule in the right standards file</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-primary">/goal</span>
                  <span className="text-xs text-muted-foreground ml-1">add-on</span>
                </td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">/goal &quot;idea&quot;</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/goal</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/goal status</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/goal done</code></td>
                <td className="py-3 px-4">Run a long task against a one-page goal file. <Link href="/docs/goal" className="text-primary hover:underline">See /goal →</Link></td>
              </tr>
              <tr className="hover:bg-card transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-primary">/headline</span>
                  <span className="text-xs text-muted-foreground ml-1">add-on</span>
                </td>
                <td className="py-3 px-4"><code className="rounded bg-muted px-1 font-mono text-xs">/headline</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/headline off</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/headline pause</code></td>
                <td className="py-3 px-4">Short, result-first replies, always on. <Link href="/docs/headline" className="text-primary hover:underline">See /headline →</Link></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground italic">
          Upgrading from 1.x? The older skills were removed or folded into these five. The <Link href="/docs/upgrade-2-0" className="text-primary hover:underline not-italic">upgrade guide</Link> lists each one and its replacement.
        </p>
      </div>

      {/* /ck */}
      <div id="ck" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">/ck</h2>
        <p className="text-muted-foreground leading-relaxed">
          Manages the project&apos;s AI context from inside your AI tool.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-mono text-sm font-semibold text-primary mb-1">/ck</h3>
            <p className="text-sm text-muted-foreground">Status: what&apos;s set up and what needs attention.</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-mono text-sm font-semibold text-primary mb-1">/ck setup</h3>
            <p className="text-sm text-muted-foreground">
              First run. Analyzes the codebase and writes the standards, the always-loaded{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code>, and the{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> in{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code> that decide which topic file loads for which paths.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-mono text-sm font-semibold text-primary mb-1">/ck update</h3>
            <p className="text-sm text-muted-foreground">
              Finishes an upgrade after <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code>. Works through{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/pending-cleanup.md</code> and asks before each change. For custom content in{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> you choose: Move to AGENTS.md, Keep in CLAUDE.md, or Delete. For unfinished work from removed 1.x workflows you choose: convert to a goal, archive, or keep.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-mono text-sm font-semibold text-primary mb-1">/ck tidy</h3>
            <p className="text-sm text-muted-foreground">
              Shrinks always-loaded context, prunes generic or linter-enforced rules, wires guides that nothing loads into{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code>, and promotes corrections that keep repeating into standards.
            </p>
          </div>
        </div>
      </div>

      {/* /doc */}
      <div id="doc" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">/doc</h2>
        <p className="text-muted-foreground leading-relaxed">
          Keeps docs and standards in step with the code.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
          <li><strong className="text-foreground">No argument:</strong> finds docs and standards that reference the code changed on this branch and updates the stale ones. On a feature branch it lists the updates first. For an npm package it also suggests a version bump and checks <code className="rounded bg-muted px-1 font-mono text-xs">CHANGELOG.md</code>.</li>
          <li><code className="rounded bg-muted px-1 font-mono text-xs">/doc arch</code>: architecture doc (Level 1)</li>
          <li><code className="rounded bg-muted px-1 font-mono text-xs">/doc feature [name]</code>: feature or page README (Level 2)</li>
          <li><code className="rounded bg-muted px-1 font-mono text-xs">/doc component &lt;path&gt;</code>: component README, colocated (Level 3)</li>
        </ul>
      </div>

      {/* /learn */}
      <div id="learn" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">/learn</h2>
        <p className="text-muted-foreground leading-relaxed">
          Turns a correction into one rule so the mistake doesn&apos;t repeat. It checks for an existing rule first, writes to the right file in{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/</code> (topic file, <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code>, glossary, or architecture), and logs it with{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">ck note</code>.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">In Claude Code</span>
          </div>
          <code className="block font-mono text-sm text-primary">/learn &quot;we use the MUI wrapper, never raw MUI&quot;</code>
          <code className="block font-mono text-sm text-primary">/learn</code>
        </div>
      </div>

      {/* Claude Code */}
      <div id="claude" className="rounded-lg border border-border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Claude Code</h2>
            <p className="text-sm text-muted-foreground">Skills in <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/</code></p>
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
              <code className="block font-mono text-sm text-primary">/ck setup</code>
              <code className="block font-mono text-sm text-primary">/doc</code>
              <code className="block font-mono text-sm text-primary">/goal &quot;add CSV export to reports&quot;</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Files created</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/ck/SKILL.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/doc/SKILL.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/learn/SKILL.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/goal/SKILL.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/headline/SKILL.md</code></li>
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
            <p className="text-sm text-muted-foreground">Prompts in <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code></p>
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
            <h3 className="text-sm font-semibold mb-2">Files created</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/ck.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">doc.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">learn.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">goal.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">headline.md</code></li>
              <li><code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/&lt;name&gt;/SKILL.md</code> (portable copy)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Codex */}
      <div id="codex" className="rounded-lg border border-border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
            <Terminal className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Codex</h2>
            <p className="text-sm text-muted-foreground">Skills in <code className="rounded bg-muted px-1 font-mono text-xs">.codex/skills/</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code></p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Setup</h3>
            <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
              <div>
                <span className="text-primary mr-2">$</span>
                <span className="text-muted-foreground">contextkit codex</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Usage</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Codex</span>
              </div>
              <code className="block font-mono text-sm text-primary">$ck setup</code>
              <code className="block font-mono text-sm text-primary">$goal</code>
            </div>
          </div>
        </div>
      </div>

      {/* Global skills & plugin */}
      <div id="global" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Global Skills &amp; Plugin</h2>
        <p className="text-muted-foreground leading-relaxed">
          The add-ons don&apos;t need ContextKit in the project, so you can share them on their own. Global install writes to{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/</code>:
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`ck install --global goal
ck install --global headline
ck update --global          # regenerate; also removes retired pre-2.0 global skills
ck uninstall --global <name> # remove one skill, including retired pre-2.0 ones`}</pre>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          ContextKit is also a Claude Code plugin. It ships <span className="font-mono text-primary">/ck</span>, <span className="font-mono text-primary">/doc</span>, <span className="font-mono text-primary">/learn</span>, <span className="font-mono text-primary">/goal</span>, and <span className="font-mono text-primary">/headline</span>:
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`claude plugin marketplace add nolrm/contextkit
claude plugin install contextkit@contextkit-marketplace`}</pre>
        </div>
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
          href="/docs/goal"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">/goal</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
