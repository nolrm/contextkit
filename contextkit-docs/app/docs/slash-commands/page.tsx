'use client'

import React, { useEffect } from "react"
import { Terminal, Sparkles, Code, Bot } from "lucide-react"

export default function SlashCommandsPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'commands', text: 'Available Commands' },
    { id: 'claude', text: 'Claude Code' },
    { id: 'cursor', text: 'Cursor' },
    { id: 'custom', text: 'Custom Commands' },
    { id: 'squad', text: 'Squad Workflow' },
  ];

  useEffect(() => {
    const tocContainer = document.getElementById('toc-container')
    if (tocContainer) {
      tocContainer.innerHTML = `
        <nav class="space-y-2">
          <p class="font-medium text-sm mb-3">On this page</p>
          <div class="grid grid-flow-row auto-rows-max text-sm">
            ${headings.map(h => `
              <a
                href="#${h.id}"
                class="group flex w-full items-center rounded-md border border-transparent pr-2 py-1.5 hover:underline text-sm text-muted-foreground"
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

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">How it works</p>
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

        <div className="overflow-x-auto">
          <table aria-label="Available slash commands" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Command</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold">What it does</th>
                <th scope="col" className="text-left py-2 font-semibold">Source file</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/analyze</code></td>
                <td className="py-2 pr-4">Scan codebase and generate standards content</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/analyze.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/review</code></td>
                <td className="py-2 pr-4">Code review with checklist</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/review.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/fix</code></td>
                <td className="py-2 pr-4">Diagnose and fix bugs</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/fix.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/refactor</code></td>
                <td className="py-2 pr-4">Refactor code with safety checks</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/refactor.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/test</code></td>
                <td className="py-2 pr-4">Generate comprehensive tests</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/run-tests.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/doc</code></td>
                <td className="py-2 pr-4">Add documentation</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/add-documentation.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad</code></td>
                <td className="py-2 pr-4">Kick off a squad task — write the PO spec</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-architect</code></td>
                <td className="py-2 pr-4">Design the technical plan from the PO spec</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-architect.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-dev</code></td>
                <td className="py-2 pr-4">Implement code following the architect plan</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-dev.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-test</code></td>
                <td className="py-2 pr-4">Write and run tests against acceptance criteria</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-test.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-review</code></td>
                <td className="py-2 pr-4">Review the full pipeline and give a verdict</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-review.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-batch</code></td>
                <td className="py-2 pr-4">Kick off multiple tasks at once (batch PO specs)</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-batch.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-run</code></td>
                <td className="py-2 pr-4">Auto-run the remaining pipeline for batch tasks</td>
                <td className="py-2"><code className="rounded bg-muted px-1 font-mono text-xs">commands/squad-run.md</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          All commands are framework-agnostic. They auto-detect your project type and adapt accordingly.
        </p>
      </div>

      {/* Claude Code */}
      <div id="claude" className="rounded-lg border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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
            <div className="rounded-lg border bg-muted/50 p-4">
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit claude</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Usage</h3>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Claude Code</span>
              </div>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">/analyze</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">/review</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">/fix</code>
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
      <div id="cursor" className="rounded-lg border bg-card p-6 scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Cursor</h2>
            <p className="text-sm text-muted-foreground">Slash commands in <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code></p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Setup</h3>
            <div className="rounded-lg border bg-muted/50 p-4">
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit cursor</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Usage</h3>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Cursor Chat</span>
              </div>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">/analyze</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">/review</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">/fix</code>
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

        <div className="rounded-lg border bg-muted/50 p-4">
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

      {/* Squad Workflow */}
      <div id="squad" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Squad Workflow</h2>
        <p className="text-muted-foreground leading-relaxed">
          The squad workflow turns a single AI session into a structured multi-role pipeline. Each role has its own slash command that reads and writes to a shared handoff file (<code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/handoff.md</code>), simulating a team of specialists.
        </p>

        {/* Pipeline Roles */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Pipeline Roles</h3>
          <div className="overflow-x-auto">
            <table aria-label="Squad pipeline roles" className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-2 pr-4 font-semibold">Step</th>
                  <th scope="col" className="text-left py-2 pr-4 font-semibold">Role</th>
                  <th scope="col" className="text-left py-2 pr-4 font-semibold">Command</th>
                  <th scope="col" className="text-left py-2 font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 pr-4">1</td>
                  <td className="py-2 pr-4">Product Owner</td>
                  <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad</code></td>
                  <td className="py-2">Writes user story, acceptance criteria, edge cases, and scope</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">2</td>
                  <td className="py-2 pr-4">Architect</td>
                  <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-architect</code></td>
                  <td className="py-2">Designs technical approach, files to change, and implementation steps</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">3</td>
                  <td className="py-2 pr-4">Developer</td>
                  <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-dev</code></td>
                  <td className="py-2">Implements code following the architect&apos;s plan</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">4</td>
                  <td className="py-2 pr-4">Tester</td>
                  <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-test</code></td>
                  <td className="py-2">Writes and runs tests against acceptance criteria</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">5</td>
                  <td className="py-2 pr-4">Reviewer</td>
                  <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-review</code></td>
                  <td className="py-2">Reviews everything and gives a PASS or NEEDS-WORK verdict</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Single-Task Flow */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Single-Task Flow</h3>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Terminal className="h-4 w-4" />
              <span className="font-mono">Run each command in sequence</span>
            </div>
            <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad "add dark mode support"        # PO writes the spec
/squad-architect                       # Architect designs the plan
/squad-dev                             # Dev implements the code
/squad-test                            # Tester writes and runs tests
/squad-review                          # Reviewer gives the verdict`}</pre>
          </div>
        </div>

        {/* Batch Flow */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Batch Flow</h3>
          <p className="text-sm text-muted-foreground mb-3">
            For multiple tasks, use batch mode to spec them all up front, then run the full pipeline automatically:
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad-batch "add dark mode" "fix login bug" "refactor checkout"
# PO writes specs for all three tasks

/squad-run
# Runs Architect → Dev → Test → Review for each task`}</pre>
          </div>
        </div>

        {/* Feedback Loop */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Feedback Loop</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Any downstream role can raise questions for an upstream role. When this happens, the pipeline pauses and directs you to the right command to provide clarifications. After clarifications are added, re-run the asking role&apos;s command to continue.
          </p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium mb-2">Example escalations</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Reviewer has questions for Dev → run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-dev</code> to clarify</p>
              <p>Tester has questions for Architect → run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-architect</code> to clarify</p>
              <p>Architect has questions for PO → run <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> to clarify</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This prevents misunderstandings from compounding through the pipeline. The handoff file tracks all questions and answers for full traceability.
          </p>
        </div>
      </div>
    </div>
  )
}
