'use client'

import React, { useEffect } from "react"
import { Terminal } from "lucide-react"

export default function SquadPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'pipeline', text: 'Pipeline Roles' },
    { id: 'single-task', text: 'Single-Task Flow' },
    { id: 'peer-review', text: 'Peer Review (Optional)' },
    { id: 'batch', text: 'Batch Flow' },
    { id: 'feedback', text: 'Feedback Loop' },
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
                <td className="py-2 pr-4">5 <span className="text-xs text-muted-foreground">(optional)</span></td>
                <td className="py-2 pr-4">Peer Reviewer</td>
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-peer-review</code></td>
                <td className="py-2">Adversarial review of implementation and tests before the final verdict</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">6</td>
                <td className="py-2 pr-4">Reviewer</td>
                <td className="py-2 pr-4"><code className="rounded bg-muted px-1 font-mono text-xs">/squad-review</code></td>
                <td className="py-2">Reviews everything and gives a PASS or NEEDS-WORK verdict</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Single-Task Flow */}
      <div id="single-task" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Single-Task Flow</h2>
        <p className="text-muted-foreground leading-relaxed">
          Run each command in sequence in the same AI session:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Run each command in sequence</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad "add dark mode support"        # PO writes the spec
/squad-architect                       # Architect designs the plan
/squad-dev                             # Dev implements the code
/squad-test                            # Tester writes and runs tests
/squad-review                          # Reviewer gives the verdict

# Optional: insert peer review before the final verdict
/squad-peer-review                     # Adversarial check (between test and review)`}</pre>
        </div>
      </div>

      {/* Peer Review */}
      <div id="peer-review" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Peer Review <span className="text-base font-normal text-muted-foreground">(Optional)</span></h2>
        <p className="text-muted-foreground leading-relaxed">
          Run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-peer-review</code> between <code className="rounded bg-muted px-1 font-mono text-xs">/squad-test</code> and <code className="rounded bg-muted px-1 font-mono text-xs">/squad-review</code> to get an adversarial read on the implementation and tests before the final verdict. The Reviewer will automatically incorporate any valid findings.
        </p>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">When to use it</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>— Large or complex features where the dev and tester may be too close to the work</p>
            <p>— Security-sensitive changes (auth, payments, data access)</p>
            <p>— Tasks where a NEEDS-WORK verdict would be costly to fix later</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Skipping it is fine for simple bug fixes and small changes — the Reviewer already runs a thorough audit with escalation paths.
        </p>
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
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`/squad-batch "add dark mode" "fix login bug" "refactor checkout"
# PO writes specs for all three tasks

/squad-run
# Runs Architect → Dev → Test → Review for each task`}</pre>
        </div>
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
    </div>
  )
}
