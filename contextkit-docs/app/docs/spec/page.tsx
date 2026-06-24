'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, ArrowRight, Terminal } from "lucide-react"

export default function SpecPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'usage', text: 'Usage' },
    { id: 'output', text: 'Output Structure' },
    { id: 'spec-format', text: 'What SPEC.md Contains' },
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
          Turn a product overview into a full reference spec — data model, API contracts, UX flows, and squad-ready stories — one scope at a time.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          The spec pipeline sits upstream of the <Link href="/docs/squad" className="text-primary hover:underline">Squad Workflow</Link>. Run <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> to break your product overview into scopes, then spec each scope into a <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> that the squad pipeline can build from directly.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Each run is a single inline CTO pass — no sub-agents, no revision rounds. The CTO reads the overview and any prior scope specs (for consistency), then writes the full spec for that scope in one pass. Fast, low token cost, and the output includes copy-paste <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> commands for every story.
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">How it works</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>1. On first run, the CTO reads your product overview and identifies all logical scopes</p>
            <p>2. Each run specs one scope — data model, API contracts, UX flows, story list with squad commands</p>
            <p>3. Run <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> again to continue with the next scope — progress is tracked automatically</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div id="usage" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Usage</h2>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">First run — initialization</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec
# Finds PROJECT_OVERVIEW.md (or asks you to pick)
# CTO identifies all scopes → writes spec/PROGRESS.md
# Immediately specs scope 01`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Continuing — next scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec
# Reads spec/PROGRESS.md → picks the next unchecked scope`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Target a specific scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec 03-invoicing-payments`}</pre>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Re-run a completed scope</p>
          <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`/spec --redo 01-identity-auth
# Deletes the scope folder and reruns from scratch`}</pre>
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
          Each scope produces one <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code>. Progress and index files track the full project.
        </p>

        <pre className="rounded bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">{`spec/
  PROGRESS.md              ← scope checklist — updated after each run
  INDEX.md                 ← links to every completed SPEC.md

  01-identity-auth/
    SPEC.md                ← full spec for this scope

  02-jobs-scheduling/
    SPEC.md

  03-invoicing-payments/
    SPEC.md`}</pre>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-1">Cross-scope consistency</p>
          <p className="text-sm text-muted-foreground">Every spec run reads all previously completed <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> files before writing the next one. Entities and API conventions defined in scope 01 are respected by scope 02 — no redefinitions, no contradictions.</p>
        </div>
      </div>

      {/* What SPEC.md Contains */}
      <div id="spec-format" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What SPEC.md Contains</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> is a self-contained reference document. It covers all domains needed to implement the scope — no separate files, no switching between documents.
        </p>

        <div className="overflow-x-auto">
          <table aria-label="SPEC.md sections" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Section</th>
                <th scope="col" className="text-left py-2 font-semibold">What it contains</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">Summary</td>
                <td className="py-2">2–3 sentences on what this scope covers and what the team will ship</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">Personas</td>
                <td className="py-2">Who uses this scope and what they need from it</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">Data Model</td>
                <td className="py-2">Full schema — columns, types, indexes, constraints, ERD, multi-tenancy enforcement, data lifecycle</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">API Contracts</td>
                <td className="py-2">Every endpoint with request/response shapes, auth role, and error codes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">UX Flows</td>
                <td className="py-2">Key user journeys — goal, steps, success state, and edge cases that affect implementation</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">Stories</td>
                <td className="py-2">Story table with size and dependencies, plus copy-paste <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> commands for each story</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">Open Questions</td>
                <td className="py-2">Unresolved items — what they block and who needs to decide</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">Out of Scope</td>
                <td className="py-2">Features explicitly deferred, with the scope they belong to</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-medium mb-1">ASSUMPTION: markers</p>
          <p className="text-sm text-muted-foreground">When the CTO fills in detail not explicit in the overview, it marks the claim inline with <code className="rounded bg-muted px-1 font-mono text-xs">ASSUMPTION: [what] — [why]</code>. Review these before building — assumptions in the spec become bugs if they&apos;re wrong.</p>
        </div>
      </div>

      {/* Overview File Detection */}
      <div id="overview-file" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview File Detection</h2>
        <p className="text-muted-foreground leading-relaxed">
          On first run, <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> looks for a product overview file automatically:
        </p>
        <ul className="list-none space-y-1 text-sm text-muted-foreground font-mono">
          <li><code className="rounded bg-muted px-1">PROJECT_OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">PRODUCT_OVERVIEW.md</code></li>
          <li><code className="rounded bg-muted px-1">BRIEF.md</code></li>
          <li><code className="rounded bg-muted px-1">product-brief.md</code></li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          If one is found it&apos;s used automatically. If multiple match, you&apos;re asked to pick. The path is saved in <code className="rounded bg-muted px-1 font-mono text-xs">spec/PROGRESS.md</code> — you never need to specify it again.
        </p>
      </div>

      {/* From Spec to Squad */}
      <div id="squad" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">From Spec to Squad</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each <code className="rounded bg-muted px-1 font-mono text-xs">SPEC.md</code> ends with a <code className="rounded bg-muted px-1 font-mono text-xs">### Squad Commands</code> section — copy-paste <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> commands for every story, self-contained enough to run without reading the spec.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Option 1 — run stories one at a time</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`# Copy a command from spec/01-identity-auth/SPEC.md → Squad Commands
/squad "S1 — Workspace schema: create workspaces table with RLS policies"
/squad-auto`}</pre>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Option 2 — run all stories continuously with /squad-spec</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/loop /clear /squad-spec 01-identity-auth
# Processes every story in the scope — one per loop iteration,
# context cleared between each so it never bloats`}</pre>
        </div>

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
