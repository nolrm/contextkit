'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, ChevronRight, ArrowLeft, ArrowRight, GitBranch, MessageSquare, GitPullRequest } from "lucide-react"

export default function CiSquadPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'how-it-works', text: 'How It Works' },
    { id: 'setup', text: 'Setup' },
    { id: 'writing-issues', text: 'Writing Good Issues' },
    { id: 'clarify-flow', text: 'Clarify Flow' },
    { id: 'what-to-expect', text: 'What to Expect' },
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
        <span className="text-primary font-medium">CI Squad</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">CI Squad</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Label a GitHub issue <code className="rounded bg-muted px-1 font-mono text-xs">squad-ready</code> and ContextKit automatically creates a branch, runs the full squad pipeline in GitHub Actions, and opens a draft PR — no local setup required.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          CI Squad is the automated version of the <Link href="/docs/squad" className="text-primary hover:underline">Squad Workflow</Link>. Instead of running the pipeline interactively in your editor, it runs entirely in GitHub Actions — triggered by a label, completed with a PR.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mt-2">
          <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Auto branch</p>
            <p className="text-sm text-muted-foreground">Creates <code className="rounded bg-muted px-1 font-mono text-xs">fix/issue-N-slug</code> or <code className="rounded bg-muted px-1 font-mono text-xs">feat/...</code> automatically from the issue title</p>
          </div>
          <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Full pipeline</p>
            <p className="text-sm text-muted-foreground">Runs PO → Architect → Dev → Test → Review → Doc using Claude Code CLI inside the runner</p>
          </div>
          <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            <GitPullRequest className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Draft PR</p>
            <p className="text-sm text-muted-foreground">Opens a draft PR linked to the issue when the pipeline completes — always human-reviewed before merge</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How It Works</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              Label an issue
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Apply the <code className="rounded bg-muted px-1 font-mono text-xs">squad-ready</code> label to any GitHub issue. The workflow triggers immediately.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Branch is created
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              GitHub Actions creates <code className="rounded bg-muted px-1 font-mono text-xs">fix/issue-42-add-dark-mode</code> (or <code className="rounded bg-muted px-1 font-mono text-xs">feat/...</code> if the title starts with &quot;feat&quot;). If the branch already exists, it&apos;s reused.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Squad pipeline runs
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              The issue title and body are written into <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/handoff.md</code>. Claude Code CLI reads <code className="rounded bg-muted px-1 font-mono text-xs">squad-ci.md</code> and runs the full pipeline non-interactively: PO → Architect → Dev → Test → Review → Doc.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
              Draft PR opened
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Changes are committed and pushed. A draft PR is opened with the squad summary, test results, and <code className="rounded bg-muted px-1 font-mono text-xs">Closes #N</code> linking back to the issue.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono">The whole flow — no local commands needed</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`# 1. Write a clear GitHub issue
# 2. Apply the label
gh issue edit 42 --add-label "squad-ready"

# GitHub Actions takes it from here:
#   → creates fix/issue-42-add-dark-mode
#   → runs squad pipeline (~10-20 min)
#   → opens draft PR linked to #42`}</pre>
        </div>
      </div>

      {/* Setup */}
      <div id="setup" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Setup</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              Install with the CI squad prompt
            </h3>
            <p className="text-sm text-muted-foreground ml-8 mb-2">
              Run <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> and answer <strong>yes</strong> when asked about the GitHub Actions workflow. This downloads <code className="rounded bg-muted px-1 font-mono text-xs">.github/workflows/squad-issue.yml</code> and sets <code className="rounded bg-muted px-1 font-mono text-xs">squad_ci_workflow: true</code> in your config.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 ml-8">
              <pre className="font-mono text-xs overflow-x-auto">{`ck install
# ...
# Install GitHub Actions workflow for issue-triggered squad automation?
# (requires ANTHROPIC_API_KEY secret in repo settings) › Yes`}</pre>
            </div>
            <p className="text-sm text-muted-foreground ml-8 mt-2">
              Already installed? Run <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> — it re-downloads the workflow if the flag is set.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Add the API key secret
            </h3>
            <p className="text-sm text-muted-foreground ml-8 mb-2">
              The workflow uses Claude Code CLI, which needs your Anthropic API key. Add it as a repository secret:
            </p>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 ml-8">
              <p className="text-xs font-medium mb-1">In your GitHub repo:</p>
              <p className="text-xs text-muted-foreground">Settings → Secrets and variables → Actions → New repository secret</p>
              <p className="text-xs font-mono mt-1">Name: <strong>ANTHROPIC_API_KEY</strong></p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Create the label
            </h3>
            <p className="text-sm text-muted-foreground ml-8 mb-2">
              Create a <code className="rounded bg-muted px-1 font-mono text-xs">squad-ready</code> label in your repo (Issues → Labels → New label).
            </p>
          </div>
        </div>
      </div>

      {/* Writing Good Issues */}
      <div id="writing-issues" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Writing Good Issues</h2>
        <p className="text-muted-foreground leading-relaxed">
          The quality of the PR is directly tied to the quality of the issue. The PO agent reads the issue title and body — the more specific, the better.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-sm font-semibold mb-2 text-green-700 dark:text-green-400">✓ Good issue</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Add dark mode toggle to settings page</p>
              <p className="text-xs mt-2">Body:</p>
              <p className="text-xs">Add a light/dark mode toggle in <code className="rounded bg-muted px-1 font-mono">Settings → Appearance</code>. Should persist across sessions (localStorage). Follow the existing theme provider pattern in <code className="rounded bg-muted px-1 font-mono">components/theme-provider.tsx</code>. Add a test verifying the preference is saved and restored on reload.</p>
            </div>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-semibold mb-2 text-red-700 dark:text-red-400">✗ Vague issue</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">dark mode</p>
              <p className="text-xs mt-2">Body: (empty)</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              The PO agent will post a clarification comment and exit rather than generating a bad PR.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">Tips for better results</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>— Include acceptance criteria directly in the issue body</p>
            <p>— Reference specific files, components, or patterns to follow</p>
            <p>— Mention what <em>not</em> to change (scope guard)</p>
            <p>— Start the title with <code className="rounded bg-muted px-1 font-mono text-xs">feat:</code> to get a <code className="rounded bg-muted px-1 font-mono text-xs">feat/...</code> branch instead of <code className="rounded bg-muted px-1 font-mono text-xs">fix/...</code></p>
          </div>
        </div>
      </div>

      {/* Clarify Flow */}
      <div id="clarify-flow" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Clarify Flow</h2>
        <p className="text-muted-foreground leading-relaxed">
          If the issue is too vague to produce a meaningful spec, the pipeline posts a comment on the issue with specific questions — then exits cleanly. The workflow run shows as <strong>success</strong>, not failure.
        </p>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-mono">Example clarification comment</span>
          </div>
          <pre className="rounded bg-muted px-4 py-2 font-mono text-xs overflow-x-auto">{`🤔 Squad needs clarification

The squad pipeline needs more information before it can proceed.
Please answer the following and re-apply the \`squad-ready\` label when ready:

1. Which settings page should the toggle appear on — the user profile page or a dedicated appearance page?
2. Should dark mode apply only to authenticated users or all visitors?
3. Is there an existing theme provider or should one be created?

---
Automated by ContextKit Squad CI`}</pre>
        </div>

        <p className="text-muted-foreground text-sm">
          After answering the questions in the issue, re-apply the <code className="rounded bg-muted px-1 font-mono text-xs">squad-ready</code> label to trigger a fresh run. Duplicate runs on the same issue are deduplicated automatically.
        </p>
      </div>

      {/* What to Expect */}
      <div id="what-to-expect" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What to Expect</h2>

        <div className="overflow-x-auto">
          <table aria-label="CI Squad behaviour" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Situation</th>
                <th scope="col" className="text-left py-2 font-semibold">What happens</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">Issue is clear</td>
                <td className="py-2">Full pipeline runs, draft PR opened (~10–20 min)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Issue is vague</td>
                <td className="py-2">Comment posted with questions, run exits cleanly — no PR</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Label applied twice</td>
                <td className="py-2">Concurrency group by issue number prevents duplicate runs</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Branch already exists</td>
                <td className="py-2">Existing branch is reused and pipeline continues from it</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">No <code className="rounded bg-muted px-1 font-mono text-xs">ANTHROPIC_API_KEY</code></td>
                <td className="py-2">Workflow fails immediately with a clear message pointing to the secret name</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Tests fail in CI</td>
                <td className="py-2">Draft PR still opens with test results noted — never silently disappears</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-1">Draft PRs are always human-reviewed</p>
          <p className="text-sm text-muted-foreground">
            CI Squad never auto-merges. Every PR opens as a draft — you review, request changes if needed, and mark it ready to merge when you&apos;re satisfied.
          </p>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/spec"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Spec Pipeline</div>
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
