'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react"

export default function TroubleshootingPage() {
  const headings = [
    { id: 'install', text: 'Installation Issues' },
    { id: 'hooks', text: 'Git Hooks' },
    { id: 'integrations', text: 'Platform Integrations' },
    { id: 'upgrade', text: 'Upgrading to 2.0' },
    { id: 'context', text: 'Context & Rules' },
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
        <span>Advanced</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Troubleshooting</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Troubleshooting</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Common issues and solutions for ContextKit.
        </p>
      </div>

      {/* Installation Issues */}
      <div id="install" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Installation Issues</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            "command not found: contextkit"
          </h3>
          <p className="text-sm text-muted-foreground">
            Make sure you installed globally:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="block font-mono text-sm">npm install -g @nolrm/contextkit</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Or use npx: <code className="rounded bg-muted px-1 font-mono text-xs">npx @nolrm/contextkit@latest install</code>
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            "No ContextKit installation found"
          </h3>
          <p className="text-sm text-muted-foreground">
            You need to run <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> in your project directory first. Then you can add platform integrations.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Download failures during install
          </h3>
          <p className="text-sm text-muted-foreground">
            ContextKit downloads template files from GitHub. If you&apos;re behind a firewall or have network issues, try:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="block font-mono text-sm">ck update --force</code>
          </div>
        </div>
      </div>

      {/* Git Hooks */}
      <div id="hooks" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Git Hooks</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Hooks not running after cloning
          </h3>
          <p className="text-sm text-muted-foreground">
            For Node.js projects, run <code className="rounded bg-muted px-1 font-mono text-xs">npm install</code> — the <code className="rounded bg-muted px-1 font-mono text-xs">prepare</code> script sets up hooks automatically. For other projects:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="block font-mono text-sm">git config core.hooksPath .contextkit/hooks</code>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Quality gates blocking push
          </h3>
          <p className="text-sm text-muted-foreground">
            To skip hooks for a single push:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="block font-mono text-sm">git push --no-verify</code>
          </div>
          <p className="text-sm text-muted-foreground">
            To disable hooks permanently:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="block font-mono text-sm">git config --unset core.hooksPath</code>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Legacy Husky conflicts
          </h3>
          <p className="text-sm text-muted-foreground">
            ContextKit automatically cleans up old Husky directories during install. If you still have issues, manually remove:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <code className="block font-mono text-sm">rm -rf .husky</code>
            <code className="block font-mono text-sm">npm uninstall husky</code>
          </div>
        </div>
      </div>

      {/* Platform Integrations */}
      <div id="integrations" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Platform Integrations</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Cursor not reading rules
          </h3>
          <p className="text-sm text-muted-foreground">
            Make sure <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/rules/</code> exists. Run <code className="rounded bg-muted px-1 font-mono text-xs">ck cursor</code> to regenerate. Cursor reads <code className="rounded bg-muted px-1 font-mono text-xs">.mdc</code> files from this directory automatically.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Claude Code not loading standards automatically
          </h3>
          <p className="text-sm text-muted-foreground">
            ContextKit uses <code className="rounded bg-muted px-1 font-mono text-xs">@path</code> imports in CLAUDE.md to auto-load standards. If files aren&apos;t loading: (1) re-run <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> to regenerate CLAUDE.md, (2) check that the first-time approval dialog was accepted (Claude Code prompts you to approve @imports on first use), (3) make sure the referenced <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/</code> files exist — run <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code> to write them. In 2.0, <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> imports <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit/standards/index.md</code>; topic standards load from <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/</code> only when you touch matching files.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Slash commands not appearing in Claude Code
          </h3>
          <p className="text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> to install the skills to <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/</code> (<code className="rounded bg-muted px-1 font-mono text-xs">/ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/doc</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/learn</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/goal</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/headline</code>). Restart Claude Code to pick them up. If they&apos;re stale, run <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> to regenerate them.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Bridge file was overwritten
          </h3>
          <p className="text-sm text-muted-foreground">
            ContextKit uses marker comments (<code className="rounded bg-muted px-1 font-mono text-xs">{`<!-- Generated by ContextKit -->`}</code>) to manage its sections. If you have a custom <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> or similar file, ContextKit appends below your content and only replaces its own marked section on updates.
          </p>
        </div>
      </div>

      {/* Upgrading to 2.0 */}
      <div id="upgrade" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Upgrading to 2.0</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            &quot;N item(s) need a decision&quot; after <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code>
          </h3>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> only changes text inside ContextKit markers. Anything that needs judgment — custom <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> content, unfinished state from retired 1.x workflows, old CI workflow files, pending standards updates, stale references — is listed in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/pending-cleanup.md</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> in Claude Code (or <code className="rounded bg-muted px-1 font-mono text-xs">$ck update</code> in Codex). It asks before each change, deletes the file when done, and makes one commit. See <Link href="/docs/upgrade-2-0" className="text-primary hover:underline">Upgrading to 2.0</Link>.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Old skills missing after upgrading
          </h3>
          <p className="text-sm text-muted-foreground">
            2.0 ships five skills: <code className="rounded bg-muted px-1 font-mono text-xs">/ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/doc</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/learn</code>, <code className="rounded bg-muted px-1 font-mono text-xs">/goal</code>, and <code className="rounded bg-muted px-1 font-mono text-xs">/headline</code>. Retired 1.x skills are removed on purpose (the <Link href="/docs/upgrade-2-0" className="text-primary hover:underline">upgrade guide</Link> lists each replacement) — long tasks now use <code className="rounded bg-muted px-1 font-mono text-xs">/goal</code>, docs use <code className="rounded bg-muted px-1 font-mono text-xs">/doc arch|feature|component</code>, and standards setup uses <code className="rounded bg-muted px-1 font-mono text-xs">/ck setup</code>. If even the new skills are missing, regenerate them:
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <code className="block font-mono text-sm">ck update --force</code>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Old 1.x global skills still show up in every project
          </h3>
          <p className="text-sm text-muted-foreground">
            Those are pre-2.0 global skills in <code className="rounded bg-muted px-1 font-mono text-xs">~/.claude/skills/</code>. <code className="rounded bg-muted px-1 font-mono text-xs">ck update --global</code> removes retired ContextKit-managed global skills automatically, or remove one by name (the retired names are listed in <Link href="/docs/upgrade-2-0#removed" className="text-primary hover:underline">Upgrading to 2.0</Link>). Skills you wrote yourself are never touched.
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <code className="block font-mono text-sm">ck update --global</code>
            <code className="block font-mono text-sm">ck uninstall --global &lt;retired-name&gt;</code>
          </div>
        </div>
      </div>

      {/* Context & Rules */}
      <div id="context" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Context &amp; Rules</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Testing or code-style rules load in every Claude Code session
          </h3>
          <p className="text-sm text-muted-foreground">
            Before 2.0, <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/contextkit-*.md</code> used <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>, which Claude Code ignores, so the rules loaded every session. 2.0 writes <code className="rounded bg-muted px-1 font-mono text-xs">paths:</code> instead. Re-render the rules with <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Changed <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> or <code className="rounded bg-muted px-1 font-mono text-xs">headline</code> in config.yml but nothing happened
          </h3>
          <p className="text-sm text-muted-foreground">
            Rule files and the headline block are rendered by the CLI. After editing <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code>, re-render with <code className="rounded bg-muted px-1 font-mono text-xs">ck update --force</code> or <code className="rounded bg-muted px-1 font-mono text-xs">ck &lt;platform&gt;</code> (for example <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>). Plain <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> exits early when there&apos;s no new version.
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <code className="block font-mono text-sm">ck update --force</code>
            <code className="block font-mono text-sm">ck claude</code>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Stale-context warning on push
          </h3>
          <p className="text-sm text-muted-foreground">
            After the gates pass, the pre-push hook runs <code className="rounded bg-muted px-1 font-mono text-xs">ck check --context</code> and warns about instructions pointing at missing files or removed skills, or always-loaded context over <code className="rounded bg-muted px-1 font-mono text-xs">context_budget_lines</code> (default 400). It never blocks the push. Fix the listed references by hand, run <code className="rounded bg-muted px-1 font-mono text-xs">/ck update</code> if you just upgraded, or <code className="rounded bg-muted px-1 font-mono text-xs">/ck tidy</code> to trim always-loaded context.
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <code className="block font-mono text-sm">ck check --context</code>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-medium mb-1">Still having issues?</p>
        <p className="text-sm text-muted-foreground">
          Run <code className="rounded bg-muted px-1 font-mono text-xs">ck status</code> to see your installation status, or <a href="https://github.com/nolrm/contextkit/issues" className="text-primary hover:underline">open an issue on GitHub</a>.
        </p>
      </div>

      {/* Prev navigation (last page — no next) */}
      <div className="mt-16 pt-8 border-t border-border flex justify-start items-center">
        <Link
          href="/docs/enterprise-features"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Enterprise Features</div>
          </div>
        </Link>
      </div>

    </div>
  )
}
