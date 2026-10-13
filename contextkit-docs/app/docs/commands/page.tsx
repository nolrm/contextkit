'use client'

import React, { useEffect } from "react"
import { Terminal, CheckCircle2, ArrowRight, ChevronRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CommandsPage() {
  const headings = [
    { id: 'install', text: 'Install' },
    { id: 'updates', text: 'Updates & Maintenance' },
    { id: 'global', text: 'Global Skills' },
    { id: 'status', text: 'Status & Health' },
    { id: 'analysis', text: 'Analysis' },
    { id: 'usage', text: 'Skill Usage' },
    { id: 'corrections', text: 'Corrections Logging' },
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
        <span>Features</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Commands</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Commands Reference</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Reference for ContextKit CLI commands. Use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck</code> as a short alias for <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">contextkit</code>.
        </p>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-medium mb-1">New to ContextKit?</p>
        <p className="text-sm text-muted-foreground mb-2">Installation and project setup are covered in the Quick Start guide.</p>
        <Link href="/docs/quick-start" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          Go to Quick Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div id="install" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Install</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit install</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Set up ContextKit in the current project: standards, <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, platform files, skills, and git hooks. Writes the always-on headline block unless you skip it. Add a single platform later with <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck codex</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck cursor</code>, and so on.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit install</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit install --no-headline</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--no-headline</code> - Skip the always-on headline response-style block</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--no-hooks</code> - Skip git hooks installation</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--non-interactive</code> - Skip interactive prompts</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--force</code> - Regenerate user-owned standards files even if they already exist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="updates" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Updates & Maintenance</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit update</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Update ContextKit commands, hooks, skills, and platform files to the latest version. Only touches content inside ContextKit markers; your standards and own content are preserved. Exits early when you're already on the latest version. If it prints &quot;N item(s) need a decision&quot;, run <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> in Claude Code or Codex.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit update</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit update --force</code>
                <p className="text-sm text-muted-foreground mt-2">
                  Use <code className="rounded bg-muted px-1 font-mono text-xs">--force</code> (or <code className="rounded bg-muted px-1 font-mono text-xs">ck &lt;platform&gt;</code>) to regenerate files without a new version, for example after editing <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> or <code className="rounded bg-muted px-1 font-mono text-xs">headline</code> in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code>. See <Link href="/docs/upgrade-2-0" className="text-primary hover:underline">Upgrading to 2.0</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="global" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Global Skills</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit install --global</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Install the add-on skills to <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/</code> so they work in every project, with or without ContextKit. Omit the name to install both.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit install --global goal</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit install --global headline</code>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit update --global</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Regenerate the installed global skills and remove retired pre-2.0 ones.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit update --global</code>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit uninstall --global</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Remove contextkit-managed global skills. Never removes a same-named skill you wrote yourself. A bare <code className="rounded bg-muted px-1 font-mono text-xs">ck uninstall --global</code> only lists what is installed. Accepts old pre-2.0 names so you can clean up.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit uninstall --global headline</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit uninstall --global --all</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">[name]</code> - Skill or family: goal, headline, or a retired pre-2.0 skill name (see <Link href="/docs/upgrade-2-0#removed" className="text-primary hover:underline">Upgrading to 2.0</Link>)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--all</code> - Remove every contextkit-managed global skill</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="status" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Status & Health</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit status</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Check installation status and verify which context files are present and configured.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit status</code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit check</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Validate your ContextKit installation and check that all expected files are in place. Also runs the stale-context check: instructions that point at missing files or removed skills, and always-loaded context over <code className="rounded bg-muted px-1 font-mono text-xs">context_budget_lines</code> (default 400).
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit check</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit check --context</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--strict</code> - Treat warnings as errors</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--verbose</code> - Show detailed information</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--context</code> - Only run the stale-context check (the pre-push hook runs this as a non-blocking warning)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--quiet</code> - Print nothing when there is nothing to report</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--global</code> - Report on installed global skills instead</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="analysis" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Analysis</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit analyze</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Analyze your project and generate customized standards based on your actual codebase. <strong>Monorepo-aware:</strong> Automatically detects and prompts for frontend/backend scope.
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  💡 Prefer <code className="rounded bg-muted px-1 font-mono">/ck setup</code> in your AI tool — it reads your codebase and writes the standards, <code className="rounded bg-muted px-1 font-mono">index.md</code>, and <code className="rounded bg-muted px-1 font-mono">context_rules</code> without leaving the editor.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit analyze</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--scope frontend|backend|both</code> - Analyze specific scope (non-interactive)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--package &lt;path&gt;</code> - Analyze specific package (e.g., apps/admin)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--non-interactive</code> - Skip prompts</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 mt-2">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">📦 Monorepo Support:</p>
                  <p className="text-xs text-muted-foreground">
                    For monorepos, automatically detects packages and prompts to analyze frontend, backend, or both. Generates separate standards when analyzing both.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="usage" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Skill Usage</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit usage</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Show which skills actually get used, read from local Claude Code and Codex session logs: loaded by the model vs typed by you, per tool, and when each was last used. Nothing leaves your machine.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit usage</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit usage --days 30 --all</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--days &lt;days&gt;</code> - Look back this many days (default 90; 0 = all)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--all</code> - Include every project, not just this one</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--json</code> - Output JSON</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="corrections" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Corrections Logging</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit note</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add entries to the corrections log for tracking AI performance issues and improvements. The <code className="rounded bg-muted px-1 font-mono text-xs">/learn</code> skill calls this for you when it turns a correction into a rule.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit note "prefer async/await over promise chains"</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--category &lt;category&gt;</code> - Category (AI Behavior, Preferences, etc.)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--priority &lt;priority&gt;</code> - Priority (HIGH, MEDIUM, LOW)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--task &lt;task&gt;</code> - Related task description</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Example: <code className="rounded bg-muted px-1 font-mono text-xs">ck note "always use named exports" --category "Preferences" --priority LOW</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Short Alias Available</p>
            <p className="text-sm text-muted-foreground">
              Use <code className="rounded bg-muted px-1 font-mono text-xs">ck</code> instead of <code className="rounded bg-muted px-1 font-mono text-xs">contextkit</code> for faster typing. Example: <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck check</code>
            </p>
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/md-first"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">MD-First Development</div>
          </div>
        </Link>
        <Link
          href="/docs/slash-commands"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Slash Commands</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
