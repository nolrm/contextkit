'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function SquadPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'pipeline', text: 'Pipeline Roles' },
    { id: 'single-task', text: 'Single-Task Flow' },
    { id: 'visual-assets', text: 'Visual Assets (Optional)' },
    { id: 'batch', text: 'Batch Flow' },
    { id: 'configuration', text: 'Configuration' },
    { id: 'reset', text: 'Resetting Squad State' },
    { id: 'feedback', text: 'Feedback Loop' },
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
        <span className="text-primary font-medium">Squad Workflow</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Squad Workflow</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Squad turns a single AI session into a structured multi-role pipeline — Product Owner, Architect, Developer, Tester, and Reviewer — each handing off to the next through a shared file.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each role has its own slash command that reads and writes to a shared handoff file (<code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/handoff.md</code>). This simulates a team of specialists working in sequence, catching gaps that a single-role prompt would miss.
        </p>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">How it works</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>1. Each command reads the handoff file left by the previous role</p>
            <p>2. It does its work and appends its output to the handoff file</p>
            <p>3. The next role picks up from there — full context, no re-prompting</p>
          </div>
        </div>
      </div>

      {/* Pipeline Roles */}
      <div id="pipeline" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Pipeline Roles</h2>
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
                <td className="py-2">Writes user story, acceptance criteria, edge cases, and scope. Optionally captures screenshots or images as visual assets.</td>
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
              <tr className="border-b">
                <td className="py-2 pr-4">6</td>
                <td className="py-2 pr-4">Doc Writer</td>
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-doc</code></td>
                <td className="py-2">Creates companion <code className="rounded bg-muted px-1 font-mono text-xs">.md</code> files for every new or significantly modified code file</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Single-Task Flow */}
      <div id="single-task" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Single-Task Flow</h2>
        <p className="text-muted-foreground leading-relaxed">
          After kickoff, run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-auto</code> to let the pipeline run hands-free, or step through manually if you want to review each stage:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Recommended: auto-run</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad "add dark mode support"   # PO writes the spec

/squad-auto                      # Runs architect → dev → test → review → doc hands-free`}</pre>
        </div>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Manual: step through each role</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad "add dark mode support"   # PO writes the spec
/squad-architect                 # Architect designs the plan
/squad-dev                       # Dev implements the code
/squad-test                      # Tester writes and runs tests
/squad-review                    # Reviewer gives the verdict
/squad-doc                       # Doc Writer creates companion .md files`}</pre>
        </div>
      </div>

      {/* Visual Assets */}
      <div id="visual-assets" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Visual Assets <span className="text-base font-normal text-muted-foreground">(Optional)</span></h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have a screenshot, mockup, or design image relevant to the task, paste or attach it when running <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code>. The PO agent will save it to <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/assets/</code> and reference the path in the handoff under a <code className="rounded bg-muted px-1 font-mono text-xs">### Visual Assets</code> section.
        </p>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">How downstream agents use it</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>— Architect reads the images before writing the technical plan</p>
            <p>— Developer reads the images before implementing</p>
            <p>— If no images are provided, the section is left empty and the pipeline runs unchanged</p>
          </div>
        </div>
      </div>

      {/* Batch Flow */}
      <div id="batch" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Batch Flow</h2>
        <p className="text-muted-foreground leading-relaxed">
          For multiple tasks, use batch mode to spec them all up front, then run the full pipeline automatically:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Batch multiple tasks</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad "add dark mode" "fix login bug" "refactor checkout"
# PO writes specs for all three tasks (batch mode auto-detected)

/squad-auto
# Runs Architect → Dev → Test → Review → Doc for each task`}</pre>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Need to add more tasks after the batch is already running? Just run <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> again with the new tasks — it detects the existing manifest and appends automatically:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Append tasks to an existing batch</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`# Batch already running with 3 tasks...

/squad "add export to CSV" "fix mobile layout"
# Detects existing manifest → appends as handoff-4.md and handoff-5.md
# Writes PO specs for the new tasks only

/squad-auto
# Picks up all pending tasks and continues the pipeline`}</pre>
        </div>
      </div>

      {/* Configuration */}
      <div id="configuration" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you run <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code>, a <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/config.md</code> file is created automatically. You can edit it to control pipeline behavior:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">.contextkit/squad/config.md</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`checkpoint: po       # pause after PO specs (or: architect)
model_routing: false # set true to use Haiku for dev + test phases`}</pre>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1"><code className="rounded bg-muted px-1 font-mono text-xs">checkpoint</code></p>
            <p className="text-sm text-muted-foreground">
              Controls when <code className="rounded bg-muted px-1 font-mono text-xs">/squad-auto</code> pauses for review. <code className="rounded bg-muted px-1 font-mono text-xs">po</code> pauses after all PO specs are written (default). <code className="rounded bg-muted px-1 font-mono text-xs">architect</code> also pauses after all architect plans.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1"><code className="rounded bg-muted px-1 font-mono text-xs">model_routing</code> <span className="text-xs text-muted-foreground ml-1">Claude Code only</span></p>
            <p className="text-sm text-muted-foreground">
              When <code className="rounded bg-muted px-1 font-mono text-xs">true</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/squad-auto</code> automatically spawns Claude Haiku for Dev and Test phases. Architect and Review always run on your primary model. Saves ~35% tokens — the standards files and Review gate maintain output quality. Default is <code className="rounded bg-muted px-1 font-mono text-xs">false</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div id="reset" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Resetting Squad State</h2>
        <p className="text-muted-foreground leading-relaxed">
          If your squad folder gets into a stuck or mixed state, use <code className="rounded bg-muted px-1 font-mono text-xs">/squad-reset</code> to clear it and start fresh.
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Clear squad state</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad-reset   # reports what's removed, then deletes .contextkit/squad/`}</pre>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-medium mb-1">Inline reset</p>
          <p className="text-sm text-muted-foreground">
            If you run <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> with a task and the folder is in a mixed state, the PO will offer to reset and continue in one step — no need to run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-reset</code> separately.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 font-mono text-xs">/squad-reset</code> is a hard delete with no backup. If you need to recover, check git history.
        </p>
      </div>

      {/* Feedback Loop */}
      <div id="feedback" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Feedback Loop</h2>
        <p className="text-muted-foreground leading-relaxed">
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
        <p className="text-sm text-muted-foreground">
          This prevents misunderstandings from compounding through the pipeline. The handoff file tracks all questions and answers for full traceability.
        </p>
      </div>

      {/* CI Squad callout */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 mt-4">
        <p className="text-sm font-semibold mb-1">Want squad to run automatically from GitHub Issues?</p>
        <p className="text-sm text-muted-foreground mb-3">
          CI Squad lets you label any issue <code className="rounded bg-muted px-1 font-mono text-xs">squad-ready</code> and have the full pipeline run in GitHub Actions — no local setup required. A draft PR is opened when it&apos;s done.
        </p>
        <Link
          href="/docs/ci-squad"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Learn about CI Squad <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
