'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function MdFirstPage() {
  const headings = [
    { id: 'why', text: 'Why Specs First?' },
    { id: 'hierarchy', text: 'The 3-Level Hierarchy' },
    { id: 'level-2', text: 'Level 2: The Page Spec' },
    { id: 'level-3', text: 'Level 3: The Component Spec' },
    { id: 'in-practice', text: 'What It Looks Like in Practice' },
    { id: 'workflow', text: 'The Workflow' },
    { id: 'commands', text: 'Commands' },
    { id: 'doc-commands', text: 'Generating Docs' },
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
        <span className="text-primary font-medium">MD-First Development</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">MD-First Development</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Write a markdown spec before writing any code. Every component, every page, every feature
          starts with a <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> file — living
          alongside the code it describes.
        </p>
      </div>

      {/* Why */}
      <div id="why" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Why Specs First?</h2>
        <p className="text-muted-foreground leading-relaxed">
          AI tools hallucinate when they lack context. A spec file gives the AI everything it needs
          before it touches a single line of code: purpose, responsibilities, props, logic, and
          dependencies. The result is more accurate output, fewer corrections, and a codebase
          that documents itself.
        </p>
      </div>

      {/* The 3 Levels */}
      <div id="hierarchy" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The 3-Level Hierarchy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Specs exist at three levels. Each level answers a different question.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Level 1 — Architecture
    How the system is structured and how the main parts connect.
    → docs/architecture.md

Level 2 — Page / Feature
    What this page does, its folder structure, and the components it uses.
    → src/app/dashboard/Dashboard.md

Level 3 — Component
    Granular logic and responsibilities of a single component.
    → src/components/Button/Button.md`}</pre>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 1</p>
            <h3 className="font-semibold text-base mb-2">Architecture</h3>
            <p className="text-sm text-muted-foreground">
              System-wide view. How services, apps, and modules relate. Written once, updated when
              structure changes.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 2</p>
            <h3 className="font-semibold text-base mb-2">Page / Feature</h3>
            <p className="text-sm text-muted-foreground">
              One spec per page or feature. Includes the folder structure and a map of which
              components are used and why.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 3</p>
            <h3 className="font-semibold text-base mb-2">Component</h3>
            <p className="text-sm text-muted-foreground">
              One spec per component, colocated in the same folder. Purpose, props, logic, and
              dependencies.
            </p>
          </div>
        </div>
      </div>

      {/* Level 2 detail — the key insight */}
      <div id="level-2" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Level 2: The Page Spec</h2>
        <p className="text-muted-foreground leading-relaxed">
          When a page is made up of multiple components, the page spec does two things: it describes
          what the page does <em>and</em> maps out the folder structure with links to each component
          spec. This gives the AI a complete picture before it touches a single component.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <p className="text-xs font-mono text-muted-foreground mb-2">src/app/dashboard/Dashboard.md</p>
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`# Dashboard Page

## Purpose
Main authenticated view. Shows account summary, recent activity, and quick actions.

## Folder Structure
dashboard/
  Dashboard.md          ← this file
  Dashboard.tsx         ← page shell, layout only
  components/
    SummaryCard/
      SummaryCard.md    ← see component spec
      SummaryCard.tsx
    ActivityFeed/
      ActivityFeed.md   ← see component spec
      ActivityFeed.tsx
    QuickActions/
      QuickActions.md   ← see component spec
      QuickActions.tsx

## Components Used
- SummaryCard — displays key account metrics (balance, usage, alerts)
- ActivityFeed — paginated list of recent events, sorted newest first
- QuickActions — fixed set of shortcut buttons, role-dependent visibility

## Data
Fetches from /api/dashboard on mount. Passes slices to each component.
No component fetches independently.`}</pre>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          The folder structure in the page spec is the blueprint. When the AI generates or modifies
          components, it already knows what else lives in that folder and how they relate.
        </p>
      </div>

      {/* Level 3 detail */}
      <div id="level-3" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Level 3: The Component Spec</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each component spec lives in the same folder as the component. It is written before any code
          is created.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <p className="text-xs font-mono text-muted-foreground mb-2">src/components/SummaryCard/SummaryCard.md</p>
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`# SummaryCard

## Purpose
Displays a single account metric with label, value, and an optional alert indicator.

## Responsibilities
Owns:
- Rendering the metric value with correct formatting (currency, %, count)
- Showing an alert badge when value exceeds threshold

Does NOT own:
- Fetching data (receives props only)
- Navigation (parent handles clicks)

## Props / API
| Name      | Type      | Required | Description                     |
|-----------|-----------|----------|---------------------------------|
| label     | string    | Yes      | Metric label shown above value  |
| value     | number    | Yes      | Raw numeric value               |
| format    | 'currency' | 'percent' | 'count' | No | Display format |
| alert     | boolean   | No       | Show alert badge when true      |

## Logic & Behavior
- value is always formatted before display — never render raw numbers
- alert badge appears top-right, red, only when alert=true
- No click handler on the card itself; parent wraps in a link if needed

## Dependencies
- formatValue utility (lib/format.ts)
- Used by: Dashboard`}</pre>
        </div>
      </div>

      {/* File structure visual */}
      <div id="in-practice" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What It Looks Like in Practice</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every folder that contains code also contains a spec. The{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> file and the
          implementation file are always siblings.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`docs/
└── architecture.md             ← Level 1 spec (system)

src/
├── app/
│   └── dashboard/
│       ├── Dashboard.md        ← Level 2 spec (page)
│       ├── Dashboard.tsx
│       └── components/
│           ├── SummaryCard/
│           │   ├── SummaryCard.md    ← Level 3 spec (component)
│           │   ├── SummaryCard.tsx
│           │   └── SummaryCard.test.tsx
│           ├── ActivityFeed/
│           │   ├── ActivityFeed.md
│           │   ├── ActivityFeed.tsx
│           │   └── ActivityFeed.test.tsx
│           └── QuickActions/
│               ├── QuickActions.md
│               ├── QuickActions.tsx
│               └── QuickActions.test.tsx`}</pre>
        </div>
      </div>

      {/* The workflow */}
      <div id="workflow" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Workflow</h2>

        <div className="space-y-3 mt-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">1. Write the page spec first</h3>
            <p className="text-sm text-muted-foreground">
              Define what the page does and sketch the folder structure with component names.
              Use{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">create-feature</code>{" "}
              to scaffold it from the template. You don't need all the details — just enough to map the shape of the work.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">2. Write each component spec</h3>
            <p className="text-sm text-muted-foreground">
              For each component referenced in the page spec, create a colocated{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">ComponentName.md</code>.
              Use the{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">/spec</code> command to
              scaffold it from the template.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">3. Review before coding</h3>
            <p className="text-sm text-muted-foreground">
              Read through the specs as a team (or alone). Catch misunderstandings in markdown
              before they become bugs in code.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">4. Generate code from the spec</h3>
            <p className="text-sm text-muted-foreground">
              Use{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">create-component</code>{" "}
              to scaffold implementation. The command reads the spec and uses it as the source
              of truth for props, tests, and behavior — no re-explaining required.
            </p>
          </div>
        </div>
      </div>

      {/* Commands */}
      <div id="commands" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Commands</h2>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 2</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">create-feature</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Scaffold a page or feature spec (Level 2). Creates{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">FeatureName/FeatureName.md</code>{" "}
              from the feature template and waits for approval before writing any code.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`Create a Dashboard feature with summary, activity feed, and quick actions`}</pre>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 3</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">/spec</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Create a component spec before writing any code. Scaffolds{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">ComponentName/ComponentName.md</code>{" "}
              from the template and waits for your approval.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`/spec SummaryCard — shows a metric with label, value, optional alert`}</pre>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 3</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">create-component</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Scaffold the implementation. Checks for an existing spec first — if none exists,
              drafts one before touching any code.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`Create a SummaryCard component`}</pre>
          </div>
        </div>
      </div>

      {/* Generating Docs */}
      <div id="doc-commands" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Generating Docs</h2>
        <p className="text-muted-foreground leading-relaxed">
          Once code exists, these three commands generate documentation at each level of the hierarchy
          — automatically tailored to your project's stack (React, Vue, Go, Python, and more).
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-1">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Level 1  /doc-arch       → docs/architecture.md
Level 2  /doc-feature    → docs/features/<name>.md
Level 3  /doc-component  → <path>/<name>.md  (colocated)`}</pre>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 1</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">/doc-arch</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Generates or updates <code className="rounded bg-muted px-1 font-mono text-xs">docs/architecture.md</code> —
              system overview, key flows, Mermaid diagrams, and architecture decisions.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`/doc-arch
/doc-arch 142  # from PR #142`}</pre>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 2</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">/doc-feature</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Generates or updates <code className="rounded bg-muted px-1 font-mono text-xs">docs/features/{'<name>'}.md</code> —
              purpose, components used, data flow, and user flows for a specific feature area.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`/doc-feature auth
/doc-feature apps/billing`}</pre>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Level 3</p>
            <h3 className="font-semibold text-base mb-1">
              <code className="font-mono text-sm">/doc-component</code>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Creates a colocated <code className="rounded bg-muted px-1 font-mono text-xs">{'<name>'}.md</code> next
              to the target file — API/props, usage example, behavior, and edge cases.
            </p>
            <pre className="rounded bg-muted p-2 font-mono text-xs">{`/doc-component src/components/Button.tsx
/doc-component lib/utils/parser.js`}</pre>
          </div>
        </div>

        <h3 className="font-semibold text-base mt-6 mb-3">When to use which</h3>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm" aria-label="When to use which documentation command">
            <caption className="sr-only">When to use which documentation command</caption>
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground" scope="col">Scenario</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground" scope="col">Command</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Merged a PR that changed system boundaries or added a service', '/doc-arch'],
                ['Shipped a new feature — want to document how it works end-to-end', '/doc-feature'],
                ['Wrote a new component, utility, or module', '/doc-component'],
                ['Reviewing a PR and want to understand architecture impact', '/doc-arch <PR number>'],
                ['Backfilling docs on existing code', '/doc-component <path>'],
              ].map(([scenario, cmd], i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/30'}>
                  <td className="px-4 py-2 text-muted-foreground">{scenario}</td>
                  <td className="px-4 py-2 font-mono text-xs">{cmd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-2">
          <p className="text-sm font-medium mb-1">Squad integration</p>
          <p className="text-sm text-muted-foreground">
            When using the squad pipeline (<code className="rounded bg-muted px-1 font-mono text-xs">/squad-auto</code>),
            the Doc Writer step (<code className="rounded bg-muted px-1 font-mono text-xs">/squad-doc</code>) generates
            companion docs automatically after review passes — you don't need to run these commands manually
            after a squad task. Use them directly when patching code outside the pipeline, backfilling docs,
            or documenting a PR from another team.
          </p>
        </div>
      </div>

      {/* Pro tip */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">The Rule</p>
        <p className="text-sm text-muted-foreground">
          If a folder contains a <code className="rounded bg-muted px-1 font-mono text-xs">.tsx</code>{" "}
          (or <code className="rounded bg-muted px-1 font-mono text-xs">.jsx</code>,{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.vue</code>,{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.svelte</code>) file, it should
          also contain a <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> spec.
          No exceptions. The spec doesn't need to be long — a clear Purpose and Responsibilities
          section is enough to give the AI meaningful context.
        </p>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/how-context-works"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">How Context Works</div>
          </div>
        </Link>

        <Link
          href="/docs/commands"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Commands</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
