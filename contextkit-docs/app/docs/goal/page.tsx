'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Info, ChevronRight, ArrowLeft, ArrowRight, Target, RefreshCw, ShieldCheck } from "lucide-react"

export default function GoalPage() {
  const headings = [
    { id: 'overview', text: 'What It\'s For' },
    { id: 'usage', text: 'Usage' },
    { id: 'goal-file', text: 'The Goal File' },
    { id: 'kickoff', text: 'Kickoff' },
    { id: 'build-loop', text: 'The Build Loop' },
    { id: 'milestone-review', text: 'Milestone Review' },
    { id: 'install', text: 'Install' },
    { id: 'why', text: 'Why This Replaced Squad' },
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
        <span className="text-primary font-medium">/goal</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">/goal</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Run a long task against a one-page goal file. The file survives context compaction and new sessions, keeps the agent anchored, and makes &quot;done&quot; checkable. An add-on skill, installed with ContextKit or on its own.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What It&apos;s For</h2>
        <p className="text-muted-foreground leading-relaxed">
          Use <span className="font-mono text-primary">/goal</span> for work that spans more than one session: a feature, a migration, a refactor with several parts. You agree on the outcomes once. The agent then plans, builds, and tests in its own loop, and each outcome gets an independent review before it&apos;s ticked.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <Target className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-base mb-1">A durable goal</h3>
            <p className="text-sm text-muted-foreground">One file in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/goals/</code>, re-read every session and after compaction.</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <RefreshCw className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-base mb-1">Checkable outcomes</h3>
            <p className="text-sm text-muted-foreground">You own the Outcomes. The agent owns the Checks and logs every change.</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-semibold text-base mb-1">An independent check</h3>
            <p className="text-sm text-muted-foreground">A fresh-context reviewer sees only the goal file and the diff.</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div id="usage" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Usage</h2>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="/goal usage" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-56">Command</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">What it does</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/goal &quot;idea or task&quot;</span></td>
                <td className="py-3 px-4">Start a new goal: draft the goal file, ask what&apos;s unclear, get your yes on the outcomes</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/goal</span></td>
                <td className="py-3 px-4">Resume the active goal</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/goal status</span></td>
                <td className="py-3 px-4">Summarise progress without building</td>
              </tr>
              <tr className="hover:bg-card transition-colors">
                <td className="py-3 px-4"><span className="font-mono text-sm text-primary">/goal done</span></td>
                <td className="py-3 px-4">Verify every outcome and close the goal</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          In Codex, use <code className="rounded bg-muted px-1 font-mono text-xs">$goal</code>. Only one goal is <code className="rounded bg-muted px-1 font-mono text-xs">status: active</code> at a time; others are <code className="rounded bg-muted px-1 font-mono text-xs">paused</code> or <code className="rounded bg-muted px-1 font-mono text-xs">done</code>. ContextKit&apos;s <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> tells every tool to read the active goal before starting work.
        </p>
      </div>

      {/* Goal file */}
      <div id="goal-file" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Goal File</h2>
        <p className="text-muted-foreground leading-relaxed">
          Goals live in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/goals/&lt;slug&gt;.md</code>. The template is <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/templates/goal.md</code>:
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">.contextkit/goals/csv-export.md</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`---
status: active
created: [DATE]
---

# Goal: [TITLE]

## Goal

[2–3 sentences: what we're building and why.]

## Outcomes

<!-- Human-owned. 3–7 checkable, user-side results. Change only with the user's OK. -->

- [ ] O1: [A user can …]
- [ ] O2: [...]

## Checks

<!-- Agent-owned. Detailed criteria per outcome, refined while building. -->

- O1: [...]

## Constraints / Non-goals

- [Must not break …]
- [Out of scope: …]

## Open Decisions

<!-- Waiting on the human. Always give options; mark the recommended one. -->

## Changes

<!-- Dated log of every change to Outcomes or Checks, with the reason. -->

## Progress

- **Done:**
- **Next:**
- **Blocked:**`}</pre>
        </div>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="Goal file sections" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-48">Section</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground w-32">Owner</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Goal</td><td className="py-3 px-4">You</td><td className="py-3 px-4">2–3 sentences: what and why</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Outcomes</td><td className="py-3 px-4">You</td><td className="py-3 px-4">3–7 checkable results written from the user&apos;s side</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Checks</td><td className="py-3 px-4">Agent</td><td className="py-3 px-4">Detailed criteria per outcome, refined while building</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Constraints / Non-goals</td><td className="py-3 px-4">Both</td><td className="py-3 px-4">What must not break and what&apos;s out of scope</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Open Decisions</td><td className="py-3 px-4">You</td><td className="py-3 px-4">Questions waiting on you, always as multiple choice</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 px-4 font-medium text-foreground">Changes</td><td className="py-3 px-4">Agent</td><td className="py-3 px-4">Dated log of every change to Outcomes or Checks, with the reason</td></tr>
              <tr><td className="py-3 px-4 font-medium text-foreground">Progress</td><td className="py-3 px-4">Agent</td><td className="py-3 px-4">Done / next / blocked, so a fresh session can pick up</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kickoff */}
      <div id="kickoff" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Kickoff</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
          <li>The agent reads the project context (<code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code>, <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code>) and enough code to understand the area.</li>
          <li>It drafts the goal file: Goal, Outcomes, Constraints and Non-goals.</li>
          <li>If something blocks a good draft, it asks at most 4 multiple-choice questions per round, recommended option first. Claude Code uses <code className="rounded bg-muted px-1 font-mono text-xs">AskUserQuestion</code>, Codex uses <code className="rounded bg-muted px-1 font-mono text-xs">request_user_input</code>, and other tools list lettered options so you can reply <code className="rounded bg-muted px-1 font-mono text-xs">1b, 2a</code>.</li>
          <li>You approve the Outcomes. From then on they only change with your OK.</li>
        </ol>
      </div>

      {/* Build loop */}
      <div id="build-loop" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Build Loop</h2>
        <p className="text-muted-foreground leading-relaxed">
          The agent works outcome by outcome, in its own loop. No role handoffs.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Re-read goal file (every session, after compaction)
    │
    ▼
Plan → edit → run tests → fix   (repeat)
    │
    ├── internal change to Checks  →  decide, log under Changes
    ├── user-visible change         →  ask first, with options
    │   (scope, UX, dropping or weakening an outcome)
    │
    ▼
Outcome looks done  →  Milestone review  →  commit  →  next outcome`}</pre>
        </div>

        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
          <li>Every change to Outcomes or Checks is logged: <code className="rounded bg-muted px-1 font-mono text-xs">YYYY-MM-DD — O2 check changed: X, because Y</code>.</li>
          <li>Progress stays current so a new session, or a compacted one, can continue.</li>
        </ul>
      </div>

      {/* Milestone review */}
      <div id="milestone-review" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Milestone Review</h2>
        <p className="text-muted-foreground leading-relaxed">
          When an outcome looks done:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
          <li>Run the project&apos;s tests and quality checks.</li>
          <li>Spawn a review subagent in a fresh context, on the same model. It gets only the goal file path, the outcome ID, and the diff for that outcome, never the builder&apos;s own account of the work. It returns <code className="rounded bg-muted px-1 font-mono text-xs">pass</code> or a numbered list of problems. Without subagents, the agent reviews the goal file and diff as if someone else wrote it.</li>
          <li>Problems get fixed and reviewed again, up to 3 rounds. After that, the agent asks you.</li>
          <li>On pass: tick the outcome, update Progress, and commit, e.g. <code className="rounded bg-muted px-1 font-mono text-xs">feat(reports): users can export CSV</code>. Hooks are not skipped.</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          When every outcome is ticked, the goal is set to <code className="rounded bg-muted px-1 font-mono text-xs">status: done</code> and you get a short summary: outcomes, notable changes from the log, and anything skipped.
        </p>
      </div>

      {/* Install */}
      <div id="install" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Install</h2>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> includes <span className="font-mono text-primary">/goal</span>. To use it in projects without ContextKit, install it globally to <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/</code>, or use the Claude Code plugin:
        </p>
        <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">
          <div>
            <span className="text-primary mr-2">$</span>
            <span className="text-muted-foreground">ck install --global goal</span>
          </div>
        </div>
      </div>

      {/* Why */}
      <div id="why" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Why This Replaced Squad</h2>
        <p className="text-muted-foreground leading-relaxed">
          Squad split work across fixed roles with handoff files. Strong models plan, build, and test best in their own loop. What they still need is a durable goal, checkable done criteria, and an independent check. <span className="font-mono text-primary">/goal</span> keeps exactly those three and drops the role handoffs.
        </p>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Coming from 1.x
          </p>
          <p className="text-sm text-muted-foreground">
            Old links to the squad, spec, and CI squad docs redirect here. <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> can convert an unfinished squad handoff into a goal file. See <Link href="/docs/upgrade-2-0" className="text-primary hover:underline">Upgrading to 2.0</Link>.
          </p>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/slash-commands"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Slash Commands</div>
          </div>
        </Link>

        <Link
          href="/docs/headline"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">/headline</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
