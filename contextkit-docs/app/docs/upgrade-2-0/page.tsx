'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Info, ChevronRight, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function UpgradeTwoPage() {
  const headings = [
    { id: 'what-changed', text: 'What Changed' },
    { id: 'removed', text: 'Removed and Replaced' },
    { id: 'steps', text: 'Upgrade Step by Step' },
    { id: 'cli-vs-asks', text: 'What the CLI Changes vs. Asks' },
    { id: 'global', text: 'Global Skills & Plugin' },
    { id: 'unchanged', text: 'Unchanged' },
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

  const removed: [string, React.ReactNode][] = [
    ['/squad, /squad-architect, /squad-dev, /squad-test, /squad-review, /squad-auto, /squad-reset, /squad-doc, /squad-go, /squad-spec', <><span className="font-mono text-primary">/goal</span></>],
    ['CI Squad (GitHub issue → PR workflow, squad-issue.yml, squad_ci_workflow)', <><span className="font-mono text-primary">/goal</span>; <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> asks whether to delete the workflow file</>],
    ['/spec, /spec-component', <><span className="font-mono text-primary">/goal</span></>],
    ['/doc-arch, /doc-feature, /doc-component', <><span className="font-mono text-primary">/doc arch</span>, <span className="font-mono text-primary">/doc feature</span>, <span className="font-mono text-primary">/doc component</span></>],
    ['/analyze (skill)', <><span className="font-mono text-primary">/ck setup</span> (the <code className="rounded bg-muted px-1 font-mono text-xs">ck analyze</code> CLI command still exists)</>],
    ['/compress', <><span className="font-mono text-primary">/ck tidy</span></>],
    ['/standards-aware, /product-context', <><code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> &quot;Read When Relevant&quot; table + path-scoped rules; <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> reconciles pending standards updates</>],
    ['/agent-push-checklist', <>Pre-push quality gates</>],
    ['/context-budget', <>Your tool&apos;s built-in context command</>],
    ['response_style config block (chat_minimal_words, diagrams_in_docs)', <><code className="rounded bg-muted px-1 font-mono text-xs">headline: true|false</code> and top-level <code className="rounded bg-muted px-1 font-mono text-xs">diagrams_in_docs</code></>],
  ]

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Getting Started</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Upgrading to 2.0</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Upgrading to 2.0</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit 2.0 is about project context: one canonical <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, a short always-loaded index, topic standards that load only where they apply, and five small skills. The squad and spec pipelines are gone. Upgrading is <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code>, then <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> if anything needs a decision.
        </p>
      </div>

      {/* What changed */}
      <div id="what-changed" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What Changed</h2>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">AGENTS.md is the canonical context file</h3>
            <p className="text-sm text-muted-foreground">
              Every integration writes the same <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> block. <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> shrinks to <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code> + <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit/standards/index.md</code> plus one Claude-only line. Claude Code reads AGENTS.md on its own only when there&apos;s no CLAUDE.md, hence the import. See <Link href="/docs/how-context-works" className="text-primary hover:underline">How Context Works</Link>.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">A short always-loaded index</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code> (50 lines or fewer): what the project is, must/must-not rules, exact commands, and a &quot;when you touch X, read Y&quot; table.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">Topic standards load where they apply</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> in <code className="rounded bg-muted px-1 font-mono text-xs">config.yml</code> maps each topic file to paths, rendered per tool (<code className="rounded bg-muted px-1 font-mono text-xs">paths:</code> for Claude, <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code> for Cursor, <code className="rounded bg-muted px-1 font-mono text-xs">applyTo:</code> for Copilot). This also fixes a 1.x bug: Claude rule files used <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>, which Claude Code ignores, so they loaded in every session.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">Five skills</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-primary">/ck</span>, <span className="font-mono text-primary">/doc</span>, <span className="font-mono text-primary">/learn</span>, and the add-ons <Link href="/docs/goal" className="font-mono text-primary hover:underline">/goal</Link> and <Link href="/docs/headline" className="font-mono text-primary hover:underline">/headline</Link>. See <Link href="/docs/slash-commands" className="text-primary hover:underline">Slash Commands</Link>.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">New CLI options</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">ck usage</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck check --context</code> (also a non-blocking pre-push warning), <code className="rounded bg-muted px-1 font-mono text-xs">ck install --no-headline</code>, and <code className="rounded bg-muted px-1 font-mono text-xs">ck install --global goal|headline</code>. New config keys: <code className="rounded bg-muted px-1 font-mono text-xs">headline</code>, <code className="rounded bg-muted px-1 font-mono text-xs">diagrams_in_docs</code>, <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code>, <code className="rounded bg-muted px-1 font-mono text-xs">context_budget_lines</code>, and <code className="rounded bg-muted px-1 font-mono text-xs">format_version: 2</code>. See <Link href="/docs/commands" className="text-primary hover:underline">Commands</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Removed */}
      <div id="removed" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Removed and Replaced</h2>

        <div className="rounded-lg border border-border bg-card/50 overflow-x-auto">
          <table aria-label="Removed in 2.0 and replacements" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">Removed</th>
                <th scope="col" className="text-left py-3 px-4 font-semibold text-foreground">Use instead</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {removed.map(([name, replacement], i) => (
                <tr key={i} className={`${i < removed.length - 1 ? 'border-b border-border/50 ' : ''}hover:bg-card transition-colors`}>
                  <td className="py-3 px-4"><span className="font-mono text-xs">{name}</span></td>
                  <td className="py-3 px-4">{replacement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          Why <span className="font-mono text-primary">/goal</span> replaced squad: strong models plan, build, and test best in their own loop. What they still need is a durable goal, checkable done criteria, and an independent check. <Link href="/docs/goal#why" className="text-primary hover:underline">More on /goal</Link>.
        </p>
      </div>

      {/* Steps */}
      <div id="steps" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Upgrade Step by Step</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">1. Update the CLI</h3>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">npm i -g @nolrm/contextkit@latest</code>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">2. Commit or stash your work</h3>
            <p className="text-sm text-muted-foreground">Start from a clean tree so the upgrade is one reviewable diff.</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">3. Run <code className="font-mono">ck update</code></h3>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">ck update</code>
            <p className="text-sm text-muted-foreground mt-2">Does the mechanical part, only inside ContextKit markers. See the table below.</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">4. Run <code className="font-mono">/ck update</code> if asked</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> prints <code className="rounded bg-muted px-1 font-mono text-xs">N item(s) need a decision</code>, open Claude Code or Codex and run:
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Terminal className="h-4 w-4" />
                <span className="font-mono">In Claude Code (or $ck update in Codex)</span>
              </div>
              <code className="block font-mono text-sm text-primary">/ck update</code>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              It works through <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/pending-cleanup.md</code>, asks before each change, runs <code className="rounded bg-muted px-1 font-mono text-xs">ck check --context</code>, deletes the file, and makes one commit: <code className="rounded bg-muted px-1 font-mono text-xs">chore(contextkit): upgrade to &lt;version&gt;</code>.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">5. Optional: write the index and context rules</h3>
            <p className="text-sm text-muted-foreground">
              Run <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code> (or <code className="rounded bg-muted px-1 font-mono text-xs">/ck tidy</code> if your standards are already filled in) to write <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> for your project. Then render the rule files with <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 font-mono text-xs">ck &lt;platform&gt;</code>. Plain <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> exits early when there&apos;s no new version.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">6. Clean up global skills</h3>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">ck update --global</code>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">ck uninstall --global squad</code>
            <p className="text-sm text-muted-foreground mt-2">See <a href="#global" className="text-primary hover:underline">Global Skills &amp; Plugin</a>.</p>
          </div>
        </div>
      </div>

      {/* CLI vs asks */}
      <div id="cli-vs-asks" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What the CLI Changes vs. Asks</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <code className="font-mono">ck update</code> does automatically
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Rewrites the ContextKit block in <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code></li>
              <li>Shrinks the CLAUDE.md block to the import</li>
              <li>Removes retired skills from <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills</code>, <code className="rounded bg-muted px-1 font-mono text-xs">.codex/skills</code>, <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills</code>, <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts</code>, and retired command files</li>
              <li>Converts the old response-style config to <code className="rounded bg-muted px-1 font-mono text-xs">headline</code> / <code className="rounded bg-muted px-1 font-mono text-xs">diagrams_in_docs</code> and drops the CI squad flag</li>
              <li>Creates <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code></li>
              <li>Applies safe standards fixes</li>
              <li>Writes the headline block</li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <code className="font-mono">/ck update</code> asks about
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Your own content in <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code>: Move to AGENTS.md / Keep in CLAUDE.md / Delete</li>
              <li>Unfinished squad handoffs: convert to a goal / archive / keep</li>
              <li>An old spec folder: convert open stories to goals / archive / keep</li>
              <li>The squad CI workflow file (it can no longer run): delete / keep</li>
              <li>Pending standards updates for files you customised</li>
              <li>Stale references found by <code className="rounded bg-muted px-1 font-mono text-xs">ck check --context</code></li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Your content is safe
          </p>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> never moves your own content or deletes work in progress. Anything that needs judgment goes to <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/pending-cleanup.md</code> for <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code>.
          </p>
        </div>
      </div>

      {/* Global */}
      <div id="global" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Global Skills &amp; Plugin</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you installed squad or spec skills globally in 1.x, they live in <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/</code>. Remove them:
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <pre className="rounded bg-muted px-4 py-2 font-mono text-sm overflow-x-auto">{`ck update --global            # removes retired managed global skills automatically
ck uninstall --global squad   # or: spec, or any retired skill name`}</pre>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Only skills ContextKit installed are removed, never a same-named skill you wrote. To add the 2.0 add-ons globally: <code className="rounded bg-muted px-1 font-mono text-xs">ck install --global goal</code> and <code className="rounded bg-muted px-1 font-mono text-xs">ck install --global headline</code>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Claude Code plugin users:</strong> update the plugin. It now ships <span className="font-mono text-primary">/ck</span>, <span className="font-mono text-primary">/doc</span>, <span className="font-mono text-primary">/learn</span>, <span className="font-mono text-primary">/goal</span>, and <span className="font-mono text-primary">/headline</span>.
        </p>
      </div>

      {/* Unchanged */}
      <div id="unchanged" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Unchanged</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
          <li><Link href="/docs/quality-gates" className="text-primary hover:underline">Quality gates</Link>: pre-push, commit-msg, <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/quality-gates.yml</code>, and the already-verified skip</li>
          <li>The <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/</code> folder and product context</li>
          <li>The corrections log (<code className="rounded bg-muted px-1 font-mono text-xs">ck note</code>)</li>
          <li>Multi-platform installs (<code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck codex</code>, …) and <Link href="/docs/monorepo" className="text-primary hover:underline">monorepo support</Link></li>
          <li><code className="rounded bg-muted px-1 font-mono text-xs">ck status</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck run</code>, and the <code className="rounded bg-muted px-1 font-mono text-xs">ck analyze</code> CLI</li>
        </ul>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/project-structure"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Project Structure</div>
          </div>
        </Link>

        <Link
          href="/docs/how-context-works"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">How Context Works</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
