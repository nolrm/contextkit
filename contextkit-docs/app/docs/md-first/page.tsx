export default function MdFirstPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">MD-First Development</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Write a markdown spec before writing any code. Every component, every page, every feature
          starts with a <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> file — living
          alongside the code it describes.
        </p>
      </div>

      {/* Why */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Why Specs First?</h2>
        <p className="text-muted-foreground leading-relaxed">
          AI tools hallucinate when they lack context. A spec file gives the AI everything it needs
          before it touches a single line of code: purpose, responsibilities, props, logic, and
          dependencies. The result is more accurate output, fewer corrections, and a codebase
          that documents itself.
        </p>
      </div>

      {/* The 3 Levels */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The 3-Level Hierarchy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Specs exist at three levels. Each level answers a different question.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Level 1 — Architecture
    How projects connect to each other and how everything fits together.
    → .contextkit/standards/architecture.md

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
      <div className="space-y-4 pt-4">
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
      <div className="space-y-4 pt-4">
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
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What It Looks Like in Practice</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every folder that contains code also contains a spec. The{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> file and the
          implementation file are always siblings.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`src/
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
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Workflow</h2>

        <div className="space-y-3 mt-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">1. Write the page spec first</h3>
            <p className="text-sm text-muted-foreground">
              Define what the page does and sketch the folder structure with component names.
              You don't need all the details — just enough to map the shape of the work.
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
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Commands</h2>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <div className="rounded-lg border bg-card p-4">
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
    </div>
  )
}
