'use client'

import React, { useEffect } from "react"
import { Terminal, Monitor, Code, Sparkles, Bot, CheckCircle2, Zap } from "lucide-react"

export default function PlatformExamplesPage() {
  const headings = [
    { id: 'cursor', text: 'Cursor' },
    { id: 'vscode', text: 'VS Code' },
    { id: 'claude', text: 'Claude CLI' },
    { id: 'codex', text: 'Codex CLI' },
    { id: 'opencode', text: 'OpenCode' },
    { id: 'continue', text: 'Continue.dev' },
    { id: 'aider', text: 'Aider' },
    { id: 'gemini', text: 'Gemini CLI' },
    { id: 'windsurf', text: 'Windsurf' },
  ];

  useEffect(() => {
    // Render TOC in right sidebar
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
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Platform Examples</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Step-by-step examples for using ContextKit with Cursor, VS Code, Claude CLI, Gemini CLI, Codex CLI, OpenCode, Windsurf, and other AI tools.
          </p>
        </div>

        <div className="space-y-6 pt-4">
        {/* Cursor */}
        <div id="cursor" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Cursor</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 mb-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">✅ Zero Configuration Required</p>
            <p className="text-sm text-muted-foreground">
              Cursor automatically loads all ContextKit context files via <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/rules/contextkit.mdc</code> for every AI prompt.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit cursor</code> to add Cursor integration. Cursor automatically reads your context files via <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/rules/contextkit.mdc</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Basic Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Cursor AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Create a login button using btn pattern
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Reference Commands</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Cursor AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  @.contextkit/commands/analyze.md
                </code>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@.contextkit/commands/create-component.md</code></li>
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@.contextkit/commands/run-tests.md</code></li>
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@.contextkit/commands/quality-check.md</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* VS Code */}
        <div id="vscode" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">VS Code + GitHub Copilot</h2>
              <p className="text-sm text-muted-foreground">Use @ mentions in chat</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit vscode</code> to add VS Code integration. Check <code className="rounded bg-muted px-1 font-mono text-xs">.vscode/VSCODE_USAGE.md</code> for details.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">⭐⭐ Best: Mention Entire Folder</h3>
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Copilot Chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm font-bold text-green-600 dark:text-green-400">
                  @.contextkit Create a login button
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  ✅ Includes ALL context files (standards, templates, commands) - No slash needed!
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Alternative: Mention Subfolders</h3>
              <div className="space-y-2">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                    @.contextkit/standards Create a login button
                  </code>
                  <p className="text-xs text-muted-foreground mt-2 italic">Standards only (no templates)</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                    @.contextkit/standards/glossary.md @.contextkit/standards/code-style.md Create a login button
                  </code>
                  <p className="text-xs text-muted-foreground mt-2 italic">Specific files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claude CLI */}
        <div id="claude" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Claude Code</h2>
              <p className="text-sm text-muted-foreground">Auto-loaded standards via @imports</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 mb-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Auto-Loaded Context</p>
            <p className="text-sm text-muted-foreground">
              CLAUDE.md uses <code className="rounded bg-muted px-1 font-mono text-xs">@path</code> imports to auto-load all standards and product files into context every session. No manual file reads needed — saves tokens and ensures consistency.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit claude</code> to set up Claude integration. This generates a <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> with <code className="rounded bg-muted px-1 font-mono text-xs">@</code> imports that auto-load your standards, plus <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.claude/commands/</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">How @imports work</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In CLAUDE.md</span>
                </div>
                <pre className="rounded bg-muted px-4 py-2 font-mono text-sm whitespace-pre-wrap">{`- @.contextkit/standards/code-style.md
- @.contextkit/standards/testing.md
- @.contextkit/product/mission-lite.md`}</pre>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Claude Code resolves these on startup and loads the file contents into context automatically.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Token impact</h3>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Upfront:</strong> Standards content is loaded into base context (slightly larger initial prompt)</li>
                  <li><strong>Per-session:</strong> No Read tool calls needed — saves tokens from avoided round-trips</li>
                  <li><strong>Net effect:</strong> Fewer total tokens for typical sessions, plus guaranteed consistency</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Verify it works</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Claude Code</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  /context
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Check that your standards files appear in the loaded context list. First time triggers an approval dialog for @imports.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  claude "create checkout flow for customer"
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Standards are already loaded — no need to tell Claude to read them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Codex CLI */}
        <div id="codex" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">OpenAI Codex CLI</h2>
              <p className="text-sm text-muted-foreground">Direct file references</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit codex</code> to set up Codex integration. Codex CLI works by referencing <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> files in your prompts.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  codex "read .contextkit/context.md and create a button"
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Using ContextKit Wrapper</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  export AI_TOOL=codex
                </code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">
                  contextkit ai "create a button component"
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* OpenCode */}
        <div id="opencode" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">OpenCode</h2>
              <p className="text-sm text-muted-foreground">Auto-loads AGENTS.md</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit opencode</code> to set up OpenCode integration. OpenCode auto-loads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> so your standards are always in context.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  opencode "create a button component"
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Using ContextKit Wrapper</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  export AI_TOOL=opencode
                </code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">
                  contextkit ai "create a button component"
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Continue.dev */}
        <div id="continue" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Continue.dev</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit continue</code> to add Continue integration. Continue.dev automatically loads context from <code className="rounded bg-muted px-1 font-mono text-xs">.continue/config.json</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Continue chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Read .contextkit/commands/analyze.md and execute the analysis
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Aider */}
        <div id="aider" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Aider</h2>
              <p className="text-sm text-muted-foreground">Direct file references</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit aider</code> to add Aider integration. The <code className="rounded bg-muted px-1 font-mono text-xs">.aider/rules.md</code> file will be configured.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  aider "Create a login button. Follow .contextkit/standards/code-style.md"
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Using ContextKit Wrapper</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  export AI_TOOL=aider
                </code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">
                  contextkit ai "create a button component"
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini CLI */}
        <div id="gemini" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Google Gemini CLI</h2>
              <p className="text-sm text-muted-foreground">Direct file references</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, use it directly. Gemini CLI works by referencing <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> files in your prompts.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  gemini "read .contextkit/context.md and create a button"
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Using ContextKit Wrapper</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  export AI_TOOL=gemini
                </code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">
                  contextkit ai "create a button component"
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Windsurf */}
        <div id="windsurf" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Windsurf</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit windsurf</code> to add Windsurf integration. Windsurf automatically reads <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.windsurf/rules/</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Windsurf AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Create a login button using project standards
                </code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Windsurf automatically loads all ContextKit rules from <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.windsurf/rules/contextkit-standards.md</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">👥 Multi-Team Workflow</p>
            <p className="text-sm text-muted-foreground mb-2">
              Perfect for teams where members use different AI tools. Share the <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/</code> directory, and each team member adds their specific integration:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <div>Person 1: <code className="rounded bg-muted px-1">contextkit install cursor</code></div>
              <div>Person 2 (Cursor): <code className="rounded bg-muted px-1">contextkit cursor</code></div>
              <div>Person 3 (VS Code): <code className="rounded bg-muted px-1">contextkit vscode</code></div>
              <div>Person 4 (Claude): <code className="rounded bg-muted px-1">contextkit claude</code></div>
              <div>Person 5 (Gemini): <code className="rounded bg-muted px-1">contextkit gemini</code></div>
              <div>Person 6 (Codex): <code className="rounded bg-muted px-1">contextkit codex</code></div>
              <div>Person 7 (OpenCode): <code className="rounded bg-muted px-1">contextkit opencode</code></div>
              <div>Person 8 (Windsurf): <code className="rounded bg-muted px-1">contextkit windsurf</code></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">✨ Choose Your Tool</p>
            <p className="text-sm text-muted-foreground">
              During <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code>, you choose which AI tool to configure — or specify it directly: <code className="rounded bg-muted px-1 font-mono text-xs">ck install claude</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit status</code> to see installed integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
