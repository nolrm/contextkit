'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function SpecPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'pipeline', text: 'Pipeline Personas' },
    { id: 'usage', text: 'Usage' },
    { id: 'output', text: 'Output Structure' },
    { id: 'rounds', text: 'How Rounds Work' },
    { id: 'overview-file', text: 'Overview File Detection' },
    { id: 'squad', text: 'From Spec to Squad' },
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
        <span className="text-primary font-medium">Spec Pipeline</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Spec Pipeline</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Turn a high-level product overview into an implementation-ready spec — UX flows, DB schema, API contracts, and a phased build plan — before a single line of code is written.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          The spec pipeline sits upstream of the <Link href="/docs/squad" className="text-primary hover:underline">Squad Workflow</Link>. Squad assumes stories are ready to implement. Spec produces those stories — and the full technical context that makes them implementable — from a product overview document.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          It works scope by scope. Each run takes one area of the product (e.g. identity &amp; auth, invoicing, marketplace), runs four domain experts in parallel, challenges their output through a CTO persona, and produces a unified <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> that a developer can build from directly.
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">How it works</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>1. On first run, a CTO agent reads your product overview and identifies all logical scopes</p>
            <p>2. Each run processes one scope — brief → 4 domain experts → CTO challenges → revisions → final SPEC.md</p>
            <p>3. Run <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> again to continue with the next scope — progress is tracked automatically</p>
          </div>
        </div>
      </div>

      {/* Pipeline Personas */}
      <div id="pipeline" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Pipeline Personas</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each persona is a sub-agent with a specific role. The CTO persona appears three times — as scoper, challenger, and author — because it holds the most context across all rounds.
        </p>
        <div className="overflow-x-auto">
          <table aria-label="Spec pipeline personas" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Round</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Persona</th>
                <th scope="col" className="text-left py-2 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">Init (once)</td>
                <td className="py-2 pr-4 font-medium">CTO — Scoper</td>
                <td className="py-2">Reads the full product overview, identifies logical scopes, writes <code className="rounded bg-muted px-1 font-mono text-xs">spec/PROGRESS.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 0</td>
                <td className="py-2 pr-4 font-medium">CTO — Briefer</td>
                <td className="py-2">Defines scope boundaries, surfaces key constraints, writes questions each domain must answer</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 1</td>
                <td className="py-2 pr-4 font-medium">UX Architect</td>
                <td className="py-2">Maps all user flows and screens — entry points, steps, edge cases, empty states, mobile differences</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 1</td>
                <td className="py-2 pr-4 font-medium">Data Architect</td>
                <td className="py-2">Designs the full DB schema — entities, columns, indexes, relationships (ERD), multi-tenancy, data lifecycle</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 1</td>
                <td className="py-2 pr-4 font-medium">Systems Architect</td>
                <td className="py-2">Defines API contracts, auth model, external services, background jobs, file storage</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 1</td>
                <td className="py-2 pr-4 font-medium">Build Planner</td>
                <td className="py-2">Phases the work into epics and stories with specific, testable acceptance criteria and a risk register</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 2</td>
                <td className="py-2 pr-4 font-medium">CTO — Challenger</td>
                <td className="py-2">Reads all four sections, challenges gaps and cross-section conflicts, writes <code className="rounded bg-muted px-1 font-mono text-xs">05-challenges.md</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Round 3</td>
                <td className="py-2 pr-4 font-medium">All four domains</td>
                <td className="py-2">Each agent revises their section based on the CTO's challenges. Unresolvable items are flagged as OPEN DECISIONs</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Final</td>
                <td className="py-2 pr-4 font-medium">CTO — Author</td>
                <td className="py-2">Resolves all OPEN DECISIONs, writes the unified <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code>, updates PROGRESS.md and INDEX.md</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          Round 1 and Round 3 agents run <strong>in parallel</strong> — all four spawn simultaneously. Round 2 (challenges) and the Final (author) are sequential because they need all prior outputs.
        </p>
      </div>

      {/* Usage */}
      <div id="usage" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Usage</h2>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">First run — initialization</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec
# Finds PROJECT_OVERVIEW.md (or asks you to pick)
# CTO scoper identifies all scopes → writes spec/PROGRESS.md
# Immediately runs the full pipeline for scope 01`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Continuing — next scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec
# Reads spec/PROGRESS.md
# Picks the next unchecked scope and runs the full pipeline`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Target a specific scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec 03-invoicing-payments
# Runs the pipeline for that scope directly, regardless of order`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Re-run a completed scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec --redo 01-identity-auth
# Deletes the scope folder and reruns all rounds from scratch`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reset everything</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec --reset
# Confirms with you first, then deletes the entire spec/ folder`}</pre>
        </div>
      </div>

      {/* Output Structure */}
      <div id="output" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Output Structure</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every scope produces a folder with all working artifacts preserved alongside the final <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code>. Nothing is deleted — you can always see how the CTO challenged the initial sections and what changed in revision.
        </p>

        <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`spec/
  PROGRESS.md              ← scope checklist — updated after each run
  INDEX.md                 ← master TOC linking all SPEC.md files

  01-identity-auth/
    00-brief.md            ← CTO's scoping brief (Round 0)
    01-ux.md               ← UX flows and screens (revised in Round 3)
    02-data.md             ← DB schema and relationships (revised in Round 3)
    03-systems.md          ← API contracts and services (revised in Round 3)
    04-plan.md             ← build phases and stories (revised in Round 3)
    05-challenges.md       ← CTO's challenges (Round 2)
    SPEC.md                ← final unified spec for this scope

  02-jobs-scheduling/
    ...

  03-invoicing-payments/
    ...`}</pre>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-1">PROGRESS.md</p>
          <p className="text-sm text-muted-foreground">Tracks which scopes are done and which are pending. The orchestrator reads this at the start of every <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> run. The <code className="rounded bg-muted px-1 font-mono text-xs">source:</code> field records which overview file was used, so you never have to specify it again.</p>
        </div>
      </div>

      {/* How Rounds Work */}
      <div id="rounds" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How Rounds Work</h2>
        <p className="text-muted-foreground leading-relaxed">
          The back-and-forth between rounds is what makes the output implementation-ready. Domain experts making decisions in isolation often contradict each other — the challenge round surfaces those contradictions before they become code.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Round 0 — Brief</p>
            <p className="text-sm text-muted-foreground">The CTO reads the product overview and prior scope specs, then writes a brief that all four domain agents share. The brief defines scope boundaries, constraints, and specific questions each domain must answer. This prevents agents from making conflicting assumptions about the same part of the product.</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Round 1 — Domain Experts (parallel)</p>
            <p className="text-sm text-muted-foreground">All four agents spawn simultaneously. Each reads the brief and the product overview, then produces their full section. They don't read each other's output — they work from the same brief independently.</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Round 2 — CTO Challenges</p>
            <p className="text-sm text-muted-foreground">The CTO reads all four sections and produces a challenge file — one section per domain plus a cross-cutting conflicts section. Challenges are specific: "The UX assumes paginated job lists but the data spec has no index on <code className="rounded bg-muted px-1 font-mono text-xs">workspace_id + created_at</code>." Generic observations are excluded.</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Round 3 — Revisions (parallel)</p>
            <p className="text-sm text-muted-foreground">Each domain agent reads its own section and the challenges relevant to its domain, then revises in place. Items that need a decision from another domain are marked <code className="rounded bg-muted px-1 font-mono text-xs">OPEN DECISION: [question] — needs Data / Systems</code>.</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Final — CTO Author</p>
            <p className="text-sm text-muted-foreground">The CTO reads all revised sections, resolves every OPEN DECISION with a call and one-line reasoning, then writes the unified <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code>. The CTO decisions table at the bottom of each SPEC.md shows exactly what was resolved and why.</p>
          </div>
        </div>
      </div>

      {/* Overview File Detection */}
      <div id="overview-file" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview File Detection</h2>
        <p className="text-muted-foreground leading-relaxed">
          On first run, <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> looks for a product overview file automatically. It checks these names in order:
        </p>
        <ul className="list-none space-y-1 text-sm text-muted-foreground font-mono">
          <li><code className="rounded bg-muted px-1">PROJECT_OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">PRODUCT_OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">BRIEF.md</code></li>
          <li><code className="rounded bg-muted px-1">product-brief.md</code></li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          If one is found it's used automatically. If multiple match, you're asked to pick. If none match, all <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> files in the current directory are listed and you select the one that is your product overview.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Once selected, the path is saved in <code className="rounded bg-muted px-1 font-mono text-xs">spec/PROGRESS.md</code> under <code className="rounded bg-muted px-1 font-mono text-xs">source:</code>. All subsequent runs read it from there — you never need to specify it again.
        </p>
      </div>

      {/* From Spec to Squad */}
      <div id="squad" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">From Spec to Squad</h2>
        <p className="text-muted-foreground leading-relaxed">
          The spec pipeline produces the input that the squad pipeline consumes. Once a scope's <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> is complete, feed its build plan stories into <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> one at a time:
        </p>

        <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`# 1. Run /spec until all scopes are done
/spec   # scope 01
/spec   # scope 02
/spec   # scope 03 ... and so on

# 2. Open spec/01-identity-auth/SPEC.md
#    Pick a story from the Build Plan section

# 3. Hand it to /squad
/squad "implement workspace creation — tradie signs up, workspace is created, they land on the empty dashboard"

# 4. /squad-auto runs architect → dev → test → review → doc`}</pre>

        <p className="text-muted-foreground leading-relaxed">
          The spec's data model, API contracts, and acceptance criteria all become reference material for the squad's Architect and Developer agents — either by pasting relevant sections or by pointing the agents to the spec files directly.
        </p>

        <Link
          href="/docs/squad"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Learn about Squad Workflow <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/squad"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Squad Workflow</div>
          </div>
        </Link>

        <Link
          href="/docs/ci-squad"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">CI Squad</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
