'use client'

import React, { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function TroubleshootingPage() {
  const headings = [
    { id: 'install', text: 'Installation Issues' },
    { id: 'hooks', text: 'Git Hooks' },
    { id: 'integrations', text: 'Platform Integrations' },
    { id: 'squad', text: 'Squad Workflow' },
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
            ContextKit uses <code className="rounded bg-muted px-1 font-mono text-xs">@path</code> imports in CLAUDE.md to auto-load standards. If files aren&apos;t loading: (1) re-run <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> to regenerate CLAUDE.md, (2) check that the first-time approval dialog was accepted (Claude Code prompts you to approve @imports on first use), (3) make sure the referenced <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/</code> files exist — run <code className="rounded bg-muted px-1 font-mono text-xs">/analyze</code> to generate them.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Slash commands not appearing in Claude Code
          </h3>
          <p className="text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code> to install slash commands to <code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/</code>. Restart Claude Code to pick up the new commands. If commands are stale, run <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code> to pull the latest versions.
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

      {/* Squad Workflow */}
      <div id="squad" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Squad Workflow</h2>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Mixed state — both handoff.md and manifest.md exist
          </h3>
          <p className="text-sm text-muted-foreground">
            This happens when a single-task run and a batch run overlap in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-reset</code> to clear the state, or if you&apos;re running <code className="rounded bg-muted px-1 font-mono text-xs">/squad</code> with a new task, it will offer to reset inline.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Squad pipeline stuck mid-run
          </h3>
          <p className="text-sm text-muted-foreground">
            Check the <code className="rounded bg-muted px-1 font-mono text-xs">status:</code> field in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/handoff.md</code>. Run the command that matches the current status — e.g. if status is <code className="rounded bg-muted px-1 font-mono text-xs">dev</code>, run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-dev</code>. Use <code className="rounded bg-muted px-1 font-mono text-xs">/squad-auto</code> to continue automatically from where it left off.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Want to start over completely
          </h3>
          <p className="text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1 font-mono text-xs">/squad-reset</code> to delete the entire <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/squad/</code> folder. It will report what was removed before deleting. If you need to recover, check git history.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-medium mb-1">Still having issues?</p>
        <p className="text-sm text-muted-foreground">
          Run <code className="rounded bg-muted px-1 font-mono text-xs">ck status</code> to see your installation status, or <a href="https://github.com/nolrm/contextkit/issues" className="text-primary hover:underline">open an issue on GitHub</a>.
        </p>
      </div>
    </div>
  )
}
